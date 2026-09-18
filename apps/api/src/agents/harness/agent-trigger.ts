import { Types } from "mongoose";
import { Task } from "../../models/Task.js";
import { Topic } from "../../models/Topic.js";
import type { IStudentEvent } from "../../models/StudentEvent.js";

export interface TriggerEvaluation {
  shouldRun: boolean;
  reason: string;
  contextParams?: Record<string, unknown>;
}

export class AgentTriggerEvaluator {
  /**
   * Deterministically evaluates whether an event necessitates an agent invocation.
   * Filters out redundant LLM calls to protect token budget.
   */
  static async evaluatePlannerTrigger(
    userId: string,
    event: IStudentEvent
  ): Promise<TriggerEvaluation> {
    const userObjectId = new Types.ObjectId(userId);

    // Case 1: TASK_MISSED
    if (event.type === "TASK_MISSED") {
      const taskId = event.entityId;
      if (!taskId) {
        return { shouldRun: false, reason: "No taskId specified in TASK_MISSED event" };
      }

      const task = await Task.findOne({ _id: new Types.ObjectId(taskId), userId: userObjectId });
      if (!task || task.status === "completed" || task.status === "skipped") {
        return { shouldRun: false, reason: "Task already resolved or nonexistent; no rescheduling needed." };
      }

      return {
        shouldRun: true,
        reason: `Task "${task.title}" missed scheduled window; requires Planner schedule re-evaluation.`,
        contextParams: { taskId: task._id.toString(), taskTitle: task.title },
      };
    }

    // Case 2: KNOWLEDGE_STATE_UPDATED (No-op detection check)
    if (event.type === "KNOWLEDGE_STATE_UPDATED") {
      const topicId = event.entityId;
      const topicName = (event.metadata?.topicName as string) || "";
      const isWeak = event.metadata?.status === "weak" || (Number(event.metadata?.mastery ?? 1) < 0.6);

      if (!isWeak) {
        return {
          shouldRun: false,
          reason: "Knowledge state update indicates acceptable or mastered proficiency. No schedule remediation needed.",
        };
      }

      // Check if an active revision or study task already exists for this topic
      const now = new Date();
      const existingActiveTask = await Task.findOne({
        userId: userObjectId,
        status: { $in: ["todo", "in_progress"] },
        $or: [
          topicId && Types.ObjectId.isValid(topicId) ? { topicId: new Types.ObjectId(topicId) } : {},
          topicName ? { title: { $regex: new RegExp(topicName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i") } } : {},
        ],
      });

      if (existingActiveTask) {
        return {
          shouldRun: false,
          reason: `Appropriate active study task "${existingActiveTask.title}" already exists for ${topicName || "topic"}. No schedule change needed.`,
        };
      }

      return {
        shouldRun: true,
        reason: `Student exhibits weak mastery in ${topicName || "concept"} with no existing remediation session scheduled.`,
        contextParams: { topicId, topicName, reason: "Weak mastery detected without active task" },
      };
    }

    // Case 3: CALENDAR_CHANGED
    if (event.type === "CALENDAR_CHANGED") {
      // Check if any conflicting tasks exist today
      const hasConflicts = event.metadata?.hasConflicts === true;
      if (!hasConflicts) {
        return {
          shouldRun: false,
          reason: "Calendar updated with no conflicting commitments detected.",
        };
      }

      return {
        shouldRun: true,
        reason: "Calendar change introduces potential time conflicts with scheduled study blocks.",
      };
    }

    // Case 4: GOAL_CREATED or GOAL_UPDATED
    if (event.type === "GOAL_CREATED" || event.type === "GOAL_UPDATED") {
      return {
        shouldRun: true,
        reason: `Academic goal ${event.type === "GOAL_CREATED" ? "created" : "updated"}. Planning breakdown required.`,
      };
    }

    return {
      shouldRun: false,
      reason: `No Planner trigger rule matched for event ${event.type}.`,
    };
  }

  /**
   * Deterministically evaluates whether Feynman needs context preparation.
   */
  static async evaluateFeynmanTrigger(
    userId: string,
    event: IStudentEvent
  ): Promise<TriggerEvaluation> {
    if (event.type === "DOCUMENT_UPLOADED") {
      return {
        shouldRun: false,
        reason: "Document successfully indexed in RAG. Prepared for future on-demand sessions without proactive prompt.",
      };
    }

    if (event.type === "KNOWLEDGE_STATE_UPDATED") {
      return {
        shouldRun: false,
        reason: "Knowledge state update recorded in persistent topic profile; will be seamlessly ingested on next session.",
      };
    }

    return {
      shouldRun: false,
      reason: `No autonomous Feynman trigger for ${event.type}.`,
    };
  }
}
