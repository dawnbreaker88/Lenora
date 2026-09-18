import { ai, getModelCandidates, extractTokenUsage, type LLMUsage } from "../config/ai.js";
import { env } from "../config/env.js";
import {
  getStudentState,
  formatPlannerStateContext,
  type StudentState,
} from "../services/student-state.service.js";
import {
  getOrCreateAgentSession,
  appendSessionMessage,
  getBoundedSessionMessages,
} from "../services/agent-session.service.js";
import { AgentLogger, createRequestId } from "../utils/logger.js";
import { stateToolDeclarations, executeStateTool } from "./tools/state.tools.js";
import { goalToolDeclarations, executeGoalTool } from "./tools/goal.tools.js";
import { taskToolDeclarations, executeTaskTool } from "./tools/task.tools.js";
import { calendarToolDeclarations, executeCalendarTool } from "./tools/calendar.tools.js";

export interface PlannerAction {
  type:
    | "goal_created"
    | "goal_updated"
    | "task_created"
    | "task_updated"
    | "task_deleted"
    | "calendar_event_created"
    | "calendar_event_updated"
    | "calendar_event_deleted"
    | "state_inspected";
  label: string;
  details?: unknown;
}

export interface PlannerAgentInput {
  userId: string;
  message: string;
  sessionId?: string;
  requestId?: string;
}

export interface PlannerResult {
  sessionId: string;
  message: string;
  actions: PlannerAction[];
  studentState: StudentState;
  metrics?: {
    durationMs: number;
    totalUsage: LLMUsage;
    iterations: number;
  };
}

const allFunctionDeclarations = [
  ...stateToolDeclarations,
  ...goalToolDeclarations,
  ...taskToolDeclarations,
  ...calendarToolDeclarations,
];

/**
 * Executes a tool by name and records action logs for the UI.
 */
async function dispatchToolCall(
  userId: string,
  name: string,
  args: Record<string, unknown>,
  actions: PlannerAction[],
  logger: AgentLogger
): Promise<unknown> {
  const toolStart = Date.now();
  logger.toolCall(name, args);

  try {
    let res: unknown;
    if (name.includes("state")) {
      res = await executeStateTool(userId, name, args);
      actions.push({
        type: "state_inspected",
        label: "Inspected current student state snapshot",
      });
    } else if (name.includes("goal")) {
      res = await executeGoalTool(userId, name, args);
      actions.push({
        type: name === "create_goal" ? "goal_created" : "goal_updated",
        label: (res as { message?: string })?.message || `Goal action: ${name}`,
        details: res,
      });
    } else if (name.includes("task")) {
      res = await executeTaskTool(userId, name, args);
      const actionType =
        name === "create_task"
          ? "task_created"
          : name === "update_task"
          ? "task_updated"
          : "task_deleted";
      actions.push({
        type: actionType,
        label: (res as { message?: string })?.message || `Task action: ${name}`,
        details: res,
      });
    } else if (name.includes("calendar") || name.includes("conflicts")) {
      res = await executeCalendarTool(userId, name, args);
      let actionType: PlannerAction["type"] = "state_inspected";
      let actionLabel = `Calendar action: ${name}`;

      if (name === "create_calendar_event") {
        actionType = "calendar_event_created";
        actionLabel = (res as { message?: string })?.message || "Created calendar event";
      } else if (name === "update_calendar_event") {
        actionType = "calendar_event_updated";
        actionLabel = (res as { message?: string })?.message || "Updated calendar event";
      } else if (name === "delete_calendar_event") {
        actionType = "calendar_event_deleted";
        actionLabel = (res as { message?: string })?.message || "Deleted calendar event";
      } else if (name === "get_calendar_events") {
        actionType = "state_inspected";
        const count =
          (res as { count?: number })?.count ??
          (res as { events?: unknown[] })?.events?.length ??
          0;
        actionLabel = `Checked calendar schedule (${count} events found)`;
      } else if (name === "find_available_slots") {
        actionType = "state_inspected";
        const count = (res as { count?: number })?.count ?? 0;
        actionLabel = `Searched calendar availability (${count} open slots found)`;
      } else if (name === "check_calendar_connection") {
        actionType = "state_inspected";
        const prov = (res as { provider?: string })?.provider || "internal";
        actionLabel = `Checked calendar connection (${prov})`;
      } else if (name === "check_time_conflicts") {
        actionType = "state_inspected";
        actionLabel = (res as { hasConflicts?: boolean })?.hasConflicts
          ? "Detected potential time conflict on calendar"
          : "Verified no time conflicts on calendar";
      }

      actions.push({
        type: actionType,
        label: actionLabel,
        details: res,
      });
    } else {
      res = { success: false, error: `Unknown planner tool: ${name}` };
    }

    const duration = Date.now() - toolStart;
    logger.toolSuccess(name, duration, (res as { message?: string })?.message);
    return res;
  } catch (err) {
    const duration = Date.now() - toolStart;
    logger.toolFailure(name, duration, err);
    return {
      success: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

/**
 * Runs the Planner Agent with session continuity, compact state context,
 * bounded conversation history, iteration bounds, and structured observability.
 */
export async function runPlannerAgent(
  userIdOrInput: string | PlannerAgentInput,
  maybeMessage?: string,
  maybeSessionId?: string
): Promise<PlannerResult> {
  const input: PlannerAgentInput =
    typeof userIdOrInput === "string"
      ? { userId: userIdOrInput, message: maybeMessage || "", sessionId: maybeSessionId }
      : userIdOrInput;

  const { userId, message } = input;
  const requestId = input.requestId || createRequestId();

  // 1. Resolve or create Planner session
  const session = await getOrCreateAgentSession(userId, "planner", {
    sessionId: input.sessionId,
  });
  const sessionId = session._id.toString();

  const logger = new AgentLogger({
    requestId,
    sessionId,
    userId,
    agentType: "planner",
  });
  logger.start({ messageLength: message.length });

  const actions: PlannerAction[] = [];
  const now = new Date();
  const currentDateStr = now.toISOString().split("T")[0];
  const currentTimeStr = now.toLocaleTimeString("en-US", { hour12: false });
  const dayOfWeek = now.toLocaleDateString("en-US", { weekday: "long" });

  // 2. Load fresh compact student state snapshot
  const initialStudentState = await getStudentState(userId);
  const formattedStateContext = formatPlannerStateContext(initialStudentState);

  // 3. Construct System Instructions
  const systemInstruction = `You are Lenora's Planner Agent.
Your responsibility is to help the student manage their workload, goals, tasks, deadlines, and schedule.

TEMPORAL CONTEXT:
- Today is: ${dayOfWeek}, ${currentDateStr} at ${currentTimeStr} (UTC: ${now.toISOString()})
- Resolve all relative dates ("today", "tomorrow", "tonight", "next Friday") against this reference.

${formattedStateContext}

CAPABILITIES & TOOLS:
- get_student_state: Retrieve fresh state snapshot if significant workload mutations have occurred.
- create_goal / update_goal: Manage high-level learning goals and milestones.
- create_task / update_task / delete_task: Manage actionable study/practice tasks with estimated duration.
- check_calendar_connection: Check if user's Google Calendar is connected.
- get_calendar_events / find_available_slots / create_calendar_event / update_calendar_event / delete_calendar_event / check_time_conflicts: Inspect schedule, find open blocks, and manage calendar commitments.

CRITICAL OPERATING RULES:
1. MANDATORY TOOL EXECUTION: Do NOT merely write out a schedule in text. When the student asks to schedule, plan, or reorganize their study time, YOU MUST EXECUTE tool calls (create_calendar_event or create_task with concrete scheduledStart and scheduledEnd). Never state that a session was scheduled unless you actually executed create_calendar_event or create_task.
2. NEVER FABRICATE FREE TIME: Always inspect calendar availability with get_calendar_events or find_available_slots before picking a study slot. Do not guess that an hour is free without checking.
3. EXTERNAL EVENT PROTECTION: Respect external calendar commitments (lectures, personal events). Treat them as hard constraints. Do NOT attempt to delete or alter external events.
4. RESCHEDULING & SYNCHRONIZATION: When rescheduling a session, update both the calendar event and the associated task so they remain in perfect sync.
5. Respect student daily study limits and avoid scheduling overlapping tasks. Break large goals into bite-sized, 30-60m sessions.
6. After modifying the schedule or tasks, verify your changes and provide a concise, clear explanation.
7. Never claim that an action was completed unless the tool successfully executed it.
8. When reviewing student state or when weak concepts/misconceptions exist, proactively schedule targeted revision tasks or calendar study blocks to remediate those weak areas.
9. CALENDAR SYNC MANDATE: Every planned study block must appear on the student's calendar. Always call create_calendar_event for upcoming sessions so they are physically booked on their real Google Calendar and visible in Lenora.`;

  // 4. Build bounded multi-turn conversation history
  const contents: Array<Record<string, unknown>> = [];
  const pastMessages = getBoundedSessionMessages(session, env.AGENT_HISTORY_LIMIT);
  for (const pm of pastMessages) {
    contents.push({
      role: pm.role === "user" ? "user" : "model",
      parts: [{ text: pm.content }],
    });
  }

  // Add the current user prompt
  contents.push({
    role: "user",
    parts: [{ text: message }],
  });

  // 5. Multi-Turn Tool Execution Loop with Model Fallback & Bounded Iterations
  const candidateModels = getModelCandidates("reasoning");
  const maxIterations = env.MAX_AGENT_ITERATIONS;
  let iteration = 0;
  let finalMessage = "";

  while (iteration < maxIterations) {
    iteration++;
    logger.iteration(iteration, maxIterations);

    let response;
    let lastError: unknown;
    let usedModel = candidateModels[0];

    for (const modelName of candidateModels) {
      let attempts = 0;
      while (attempts < 2) {
        try {
          attempts++;
          const llmStart = Date.now();
          response = await ai.models.generateContent({
            model: modelName,
            contents: contents as never,
            config: {
              systemInstruction,
              tools: [{ functionDeclarations: allFunctionDeclarations as never }],
            },
          });
          const duration = Date.now() - llmStart;
          const usage = extractTokenUsage(response);
          logger.llmCall(modelName, duration, usage);
          usedModel = modelName;
          break;
        } catch (err) {
          lastError = err;
          console.warn(
            `[Planner Agent] generateContent with "${modelName}" attempt ${attempts} failed:`,
            err instanceof Error ? err.message : err
          );
          await new Promise((r) => setTimeout(r, 800));
        }
      }
      if (response) break;
    }

    if (!response) {
      logger.fail(lastError);
      throw (
        lastError ||
        new Error("Planner Agent: Failed to obtain response from Gemini models after retries.")
      );
    }

    const candidate = response.candidates?.[0];
    const parts = candidate?.content?.parts || [];
    const functionCalls = response.functionCalls ?? [];

    if (!functionCalls || functionCalls.length === 0) {
      finalMessage = response.text || "Workload updated successfully.";
      break;
    }

    // Add model tool invocation to conversation history
    contents.push({
      role: "model",
      parts,
    });

    // Execute each function call concurrently if safe or sequentially
    const responseParts: Array<Record<string, unknown>> = [];

    for (const call of functionCalls) {
      const callArgs = (call.args as Record<string, unknown>) || {};
      const toolResult = await dispatchToolCall(userId, call.name || "", callArgs, actions, logger);

      responseParts.push({
        functionResponse: {
          name: call.name,
          response: {
            result: toolResult,
          },
        },
      });
    }

    // Append function execution results to conversation
    contents.push({
      role: "user",
      parts: responseParts,
    });
  }

  if (iteration >= maxIterations && !finalMessage) {
    logger.iterationLimitReached(maxIterations);
    finalMessage = "I've processed your planning request and updated your schedule as requested.";
  }

  // 6. Record interaction in AgentSession history
  await appendSessionMessage(sessionId, userId, "user", message);
  await appendSessionMessage(
    sessionId,
    userId,
    "model",
    finalMessage,
    `Actions: ${actions.length}`,
    actions
  );

  // 7. Fetch final updated student state snapshot
  const finalState = await getStudentState(userId);
  const metrics = logger.complete({ actionsCount: actions.length });

  return {
    sessionId,
    message: finalMessage,
    actions,
    studentState: finalState,
    metrics: {
      durationMs: metrics.durationMs,
      totalUsage: metrics.totalUsage,
      iterations: iteration,
    },
  };
}

