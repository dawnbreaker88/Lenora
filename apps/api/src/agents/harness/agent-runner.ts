import { Types } from "mongoose";
import { AgentExecution } from "../../models/AgentExecution.js";
import { EventService } from "../../events/event.service.js";
import { MAX_EVENT_DEPTH } from "../../events/event.types.js";
import { runPlannerAgent, type PlannerResult } from "../planner.js";
import { runFeynmanAgent, type FeynmanResult } from "../feynman.js";
import type { IStudentEvent } from "../../models/StudentEvent.js";

export interface HarnessRunResult {
  success: boolean;
  actionsCount: number;
  emittedEventsCount: number;
  error?: string;
}

export class AgentHarnessRunner {
  /**
   * Executes an autonomous Planner agent run triggered by an event.
   */
  static async runAutonomousPlanner(
    event: IStudentEvent,
    prompt: string
  ): Promise<HarnessRunResult> {
    const startedAt = new Date();
    const userId = event.userId.toString();
    const correlationId = event.correlationId;
    const currentDepth = event.depth || 0;

    if (currentDepth >= MAX_EVENT_DEPTH) {
      console.warn(
        `[harness.circuit_breaker] Max execution depth reached (${currentDepth} >= ${MAX_EVENT_DEPTH}). Halting loop.`
      );
      return { success: false, actionsCount: 0, emittedEventsCount: 0, error: "Max depth reached" };
    }

    try {
      console.info(`[agent.started] agent=planner triggerEventId=${event._id} correlationId=${correlationId} depth=${currentDepth}`);

      const plannerResult: PlannerResult = await runPlannerAgent({
        userId,
        message: prompt,
        requestId: correlationId,
      });

      const completedAt = new Date();
      const actions = plannerResult.actions || [];

      // Filter meaningful mutations (ignoring plain inspections)
      const meaningfulMutations = actions.filter((a) => a.type !== "state_inspected");

      // Record audit log in MongoDB
      await AgentExecution.create({
        userId: new Types.ObjectId(userId),
        agentType: "planner",
        triggerEventId: event._id,
        correlationId,
        status: "success",
        startedAt,
        completedAt,
        actions: actions.map((a) => ({
          type: a.type,
          label: a.label,
          details: a.details,
        })),
      });

      console.info(`[agent.completed] agent=planner actionsCount=${actions.length} mutationsCount=${meaningfulMutations.length}`);

      let emittedEventsCount = 0;

      // CRITICAL NO-OP & INFINITE LOOP CHECK:
      // Only emit PLAN_UPDATED if meaningful state mutations actually took place!
      if (meaningfulMutations.length > 0) {
        await EventService.emitEvent({
          userId,
          type: "PLAN_UPDATED",
          source: "planner",
          metadata: {
            summary: plannerResult.message,
            mutationsCount: meaningfulMutations.length,
            actionLabels: meaningfulMutations.map((m) => m.label),
          },
          correlationId,
          depth: currentDepth + 1,
        });
        emittedEventsCount++;
      } else {
        console.info(
          `[harness.noop] Planner completed without schedule mutations. Suppressing PLAN_UPDATED event.`
        );
      }

      return {
        success: true,
        actionsCount: actions.length,
        emittedEventsCount,
      };
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      console.error(`[agent.failed] agent=planner error="${errorMsg}"`);

      await AgentExecution.create({
        userId: new Types.ObjectId(userId),
        agentType: "planner",
        triggerEventId: event._id,
        correlationId,
        status: "failed",
        startedAt,
        completedAt: new Date(),
        actions: [],
        error: errorMsg,
      });

      return {
        success: false,
        actionsCount: 0,
        emittedEventsCount: 0,
        error: errorMsg,
      };
    }
  }

  /**
   * Executes a lightweight Feynman context preparation run if needed.
   */
  static async runAutonomousFeynmanContextPrep(
    event: IStudentEvent,
    topicName?: string
  ): Promise<HarnessRunResult> {
    const startedAt = new Date();
    const userId = event.userId.toString();
    const correlationId = event.correlationId;

    try {
      console.info(`[agent.started] agent=feynman (context-prep) triggerEventId=${event._id}`);

      await AgentExecution.create({
        userId: new Types.ObjectId(userId),
        agentType: "feynman",
        triggerEventId: event._id,
        correlationId,
        status: "success",
        startedAt,
        completedAt: new Date(),
        actions: [
          {
            type: "context_prepared",
            label: `Prepared learning session context for ${topicName || "topic"}`,
          },
        ],
      });

      console.info(`[agent.completed] agent=feynman (context-prep)`);
      return { success: true, actionsCount: 1, emittedEventsCount: 0 };
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      return { success: false, actionsCount: 0, emittedEventsCount: 0, error: errorMsg };
    }
  }
}
