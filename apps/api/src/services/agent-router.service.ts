import { runPlannerAgent, type PlannerResult } from "../agents/planner.js";
import { runFeynmanAgent, type FeynmanResult, type FeynmanAgentInput } from "../agents/feynman.js";
import { createRequestId } from "../utils/logger.js";

export interface PlannerRouteInput {
  userId: string;
  message: string;
  sessionId?: string;
}

export interface FeynmanRouteInput {
  userId: string;
  message: string;
  sessionId?: string;
  topicId?: string;
  topicName?: string;
  subject?: string;
  taskId?: string;
  goalId?: string;
}

export interface ReviewStateRouteInput {
  userId: string;
  topicName?: string;
  reason?: string;
  sessionId?: string;
}

export interface ControlledErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
  requestId: string;
}

/**
 * Central router and controller for dispatching agent requests with standardized
 * tracing and controlled error handling.
 */
export class AgentRouterService {
  static async routePlanner(input: PlannerRouteInput): Promise<PlannerResult> {
    const requestId = createRequestId();
    return runPlannerAgent({
      userId: input.userId,
      message: input.message,
      sessionId: input.sessionId,
      requestId,
    });
  }

  static async routeFeynman(input: FeynmanRouteInput): Promise<FeynmanResult> {
    const requestId = createRequestId();
    return runFeynmanAgent({
      ...input,
      requestId,
    });
  }

  static async routePlannerReviewState(input: ReviewStateRouteInput): Promise<PlannerResult> {
    const requestId = createRequestId();
    let prompt =
      "Please review my current student state (including weak topics, misconceptions, and workload). If there are weak concepts or unresolved misconceptions, schedule targeted revision tasks or calendar study blocks to remediate them without creating scheduling conflicts.";

    if (input.topicName) {
      prompt = `Please review my student state with focus on the topic "${input.topicName}". If I have unresolved weaknesses or misconceptions, adapt my schedule and create targeted revision tasks. Context: ${
        input.reason || "Learning session review"
      }`;
    }

    return runPlannerAgent({
      userId: input.userId,
      message: prompt,
      sessionId: input.sessionId,
      requestId,
    });
  }
}
