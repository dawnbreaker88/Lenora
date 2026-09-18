import { Types } from "mongoose";
import { getStudentState, type StudentState } from "../../services/student-state.service.js";
import { Topic } from "../../models/Topic.js";
import { Goal } from "../../models/Goals.js";
import { Task } from "../../models/Task.js";
import type { IStudentEvent } from "../../models/StudentEvent.js";

export interface PlannerBoundedContext {
  activeGoals: Array<{ id: string; title: string; priority: string; targetDate?: string }>;
  pendingTasks: Array<Record<string, unknown>>;
  todaySchedule: Array<Record<string, unknown>>;
  workload: { todayMinutes: number; dailyLimitMinutes: number; isOverloaded: boolean };
  recentLearningSignals: Array<{ topic: string; status: string; mastery: number; weaknesses: string[] }>;
  preferences: {
    dailyStudyMinutes: number;
    sessionLengthMinutes: number;
    availableSlots?: Array<{ day: string; startTime: string; endTime: string; label?: string }>;
  };
}

export interface FeynmanBoundedContext {
  targetTopic?: { id: string; name: string; mastery: number; weaknesses: string[]; misconceptions: string[] };
  weakTopics: Array<{ name: string; mastery: number }>;
  learningStyle: string;
  feynmanInstructions?: string;
  eventTriggerReason?: string;
}

export interface LearnerBoundedContext {
  topic?: { id: string; name: string; mastery: number; misconceptions: string[] };
  recentAttemptCount: number;
}

export type BoundedAgentContext =
  | { agent: "planner"; context: PlannerBoundedContext }
  | { agent: "feynman"; context: FeynmanBoundedContext }
  | { agent: "learner"; context: LearnerBoundedContext };

/**
 * Builds a bounded, token-efficient context for a specific agent and triggering event.
 * Avoids dumping full collections into LLM prompts.
 */
export async function getAgentContext(
  userId: string,
  agentType: "planner" | "feynman" | "learner",
  event?: IStudentEvent
): Promise<BoundedAgentContext> {
  const userObjectId = new Types.ObjectId(userId);

  if (agentType === "planner") {
    const studentState = await getStudentState(userId);

    const activeGoals = (studentState.goals || [])
      .filter((g) => g.status !== "cancelled" && g.status !== "completed")
      .map((g) => ({
        id: g.id,
        title: g.title,
        priority: g.priority,
        targetDate: g.targetDate,
      }));

    const pendingTasks = [
      ...studentState.tasks.overdue,
      ...studentState.tasks.today.filter((t: any) => t.status === "todo" || t.status === "in_progress"),
      ...studentState.tasks.upcoming.slice(0, 5),
    ];

    const recentLearningSignals = (studentState.topics || [])
      .filter((tp) => tp.status === "weak" || tp.mastery < 0.6)
      .map((tp) => ({
        topic: tp.name,
        status: tp.status,
        mastery: tp.mastery,
        weaknesses: tp.weaknesses || [],
      }));

    return {
      agent: "planner",
      context: {
        activeGoals,
        pendingTasks,
        todaySchedule: studentState.calendar.today,
        workload: studentState.workload,
        recentLearningSignals,
        preferences: {
          dailyStudyMinutes: studentState.user.dailyStudyMinutes,
          sessionLengthMinutes: studentState.user.sessionLengthMinutes,
          availableSlots: studentState.user.availableSlots || [],
        },
      },
    };
  }

  if (agentType === "feynman") {
    let targetTopicDoc = null;
    if (event?.entityId && Types.ObjectId.isValid(event.entityId)) {
      targetTopicDoc = await Topic.findOne({ _id: new Types.ObjectId(event.entityId), userId: userObjectId }).lean();
    }

    const weakTopics = await Topic.find({
      userId: userObjectId,
      $or: [{ status: "weak" }, { mastery: { $lt: 0.6 } }],
    })
      .sort({ mastery: 1 })
      .limit(5)
      .lean();

    return {
      agent: "feynman",
      context: {
        targetTopic: targetTopicDoc
          ? {
              id: targetTopicDoc._id.toString(),
              name: targetTopicDoc.name,
              mastery: targetTopicDoc.mastery,
              weaknesses: targetTopicDoc.weaknesses || [],
              misconceptions: targetTopicDoc.misconceptions || [],
            }
          : undefined,
        weakTopics: weakTopics.map((w) => ({ name: w.name, mastery: w.mastery })),
        learningStyle: "practice",
        eventTriggerReason: event?.type,
      },
    };
  }

  // Learner context
  let topicDoc = null;
  if (event?.entityId && Types.ObjectId.isValid(event.entityId)) {
    topicDoc = await Topic.findOne({ _id: new Types.ObjectId(event.entityId), userId: userObjectId }).lean();
  }

  return {
    agent: "learner",
    context: {
      topic: topicDoc
        ? {
            id: topicDoc._id.toString(),
            name: topicDoc.name,
            mastery: topicDoc.mastery,
            misconceptions: topicDoc.misconceptions || [],
          }
        : undefined,
      recentAttemptCount: topicDoc?.assessmentCount || 0,
    },
  };
}
