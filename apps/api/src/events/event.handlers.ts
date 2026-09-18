import type { IStudentEvent } from "../models/StudentEvent.js";
import { AgentTriggerEvaluator } from "../agents/harness/agent-trigger.js";
import { AgentHarnessRunner } from "../agents/harness/agent-runner.js";

export class EventHandlers {
  /**
   * Handles TASK_MISSED events. Evaluates if rescheduling is needed and triggers Planner.
   */
  static async handleTaskMissed(event: IStudentEvent): Promise<void> {
    const userId = event.userId.toString();
    const evaluation = await AgentTriggerEvaluator.evaluatePlannerTrigger(userId, event);

    if (!evaluation.shouldRun) {
      console.info(`[event.handler.skipped] TASK_MISSED: ${evaluation.reason}`);
      return;
    }

    const taskTitle = (event.metadata?.taskTitle as string) || "Scheduled study task";
    const prompt = `Autonomous Schedule Adjustment: The task "${taskTitle}" was missed or past its scheduled time. Please review my remaining workload, deadlines, and calendar, and reschedule this study block into an available slot today or tomorrow without creating conflicts.`;

    await AgentHarnessRunner.runAutonomousPlanner(event, prompt);
  }

  /**
   * Handles KNOWLEDGE_STATE_UPDATED events. Evaluates whether schedule remediation is needed.
   */
  static async handleKnowledgeStateUpdated(event: IStudentEvent): Promise<void> {
    const userId = event.userId.toString();
    const evaluation = await AgentTriggerEvaluator.evaluatePlannerTrigger(userId, event);

    const topicName = (event.metadata?.topicName as string) || "";

    // Lightweight Feynman context preparation
    await AgentHarnessRunner.runAutonomousFeynmanContextPrep(event, topicName);

    if (!evaluation.shouldRun) {
      console.info(`[event.handler.skipped] KNOWLEDGE_STATE_UPDATED: ${evaluation.reason}`);
      return;
    }

    const prompt = `Autonomous Learning Remediation: Student state reflects weak mastery or identified misconceptions in "${topicName}". Please schedule a targeted revision task and calendar study block to review this concept, taking existing deadlines into account.`;

    await AgentHarnessRunner.runAutonomousPlanner(event, prompt);
  }

  /**
   * Handles CALENDAR_CHANGED events. Checks for time conflicts.
   */
  static async handleCalendarChanged(event: IStudentEvent): Promise<void> {
    const userId = event.userId.toString();
    const evaluation = await AgentTriggerEvaluator.evaluatePlannerTrigger(userId, event);

    if (!evaluation.shouldRun) {
      console.info(`[event.handler.skipped] CALENDAR_CHANGED: ${evaluation.reason}`);
      return;
    }

    const prompt = `Autonomous Conflict Resolution: Calendar commitments were updated with overlapping time slots. Please inspect my study blocks and resolve any schedule collisions.`;

    await AgentHarnessRunner.runAutonomousPlanner(event, prompt);
  }

  /**
   * Handles GOAL_CREATED and GOAL_UPDATED events.
   */
  static async handleGoalCreatedOrUpdated(event: IStudentEvent): Promise<void> {
    const userId = event.userId.toString();
    const evaluation = await AgentTriggerEvaluator.evaluatePlannerTrigger(userId, event);

    if (!evaluation.shouldRun) {
      console.info(`[event.handler.skipped] GOAL event: ${evaluation.reason}`);
      return;
    }

    const goalTitle = (event.metadata?.title as string) || "Academic Goal";
    const prompt = `Autonomous Goal Breakdown: The goal "${goalTitle}" was added or modified. Please review the target date and generate actionable study tasks and study blocks to make consistent progress.`;

    await AgentHarnessRunner.runAutonomousPlanner(event, prompt);
  }

  /**
   * Handles deterministic events that do not require LLM calls.
   */
  static async handleDeterministicEvent(event: IStudentEvent): Promise<void> {
    console.info(`[event.deterministic] Processed ${event.type} for user=${event.userId} without LLM invocation.`);
  }
}
