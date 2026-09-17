import { ai } from "../config/ai.js";
import { env } from "../config/env.js";
import { getStudentState, type StudentState } from "../services/student-state.service.js";
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

export interface PlannerResult {
  message: string;
  actions: PlannerAction[];
  studentState: StudentState;
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
  actions: PlannerAction[]
): Promise<unknown> {
  if (name.includes("state")) {
    const res = await executeStateTool(userId, name, args);
    actions.push({
      type: "state_inspected",
      label: "Inspected current student state",
    });
    return res;
  }

  if (name.includes("goal")) {
    const res = await executeGoalTool(userId, name, args);
    actions.push({
      type: name === "create_goal" ? "goal_created" : "goal_updated",
      label: (res as { message?: string })?.message || `Goal action: ${name}`,
      details: res,
    });
    return res;
  }

  if (name.includes("task")) {
    const res = await executeTaskTool(userId, name, args);
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
    return res;
  }

  if (name.includes("calendar") || name.includes("conflicts")) {
    const res = await executeCalendarTool(userId, name, args);
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
      const count = (res as { count?: number })?.count ?? (res as { events?: unknown[] })?.events?.length ?? 0;
      actionLabel = `Checked calendar schedule (${count} events found)`;
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
    return res;
  }

  throw new Error(`Unknown tool: ${name}`);
}

/**
 * Runs the Planner Agent with an interactive multi-step tool calling loop.
 */
export async function runPlannerAgent(userId: string, userMessage: string): Promise<PlannerResult> {
  const actions: PlannerAction[] = [];
  const now = new Date();
  const currentDateStr = now.toISOString().split("T")[0];
  const currentTimeStr = now.toLocaleTimeString("en-US", { hour12: false });
  const dayOfWeek = now.toLocaleDateString("en-US", { weekday: "long" });

  const systemInstruction = `You are Lenora's Planner Agent.
Your responsibility is to help the student manage their workload, goals, tasks, deadlines, and schedule.

CURRENT TEMPORAL CONTEXT:
- Today is: ${dayOfWeek}, ${currentDateStr} at ${currentTimeStr} (UTC representation: ${now.toISOString()})
- Use this date/time reference to resolve relative dates accurately ("today", "tomorrow", "tonight", "next Friday").

CAPABILITIES & TOOLS:
- get_student_state: Retrieve current student state, goals, tasks, workload, and calendar.
- create_goal / update_goal: Manage high-level learning goals and milestones.
- create_task / update_task / delete_task: Manage actionable study/practice tasks with estimated duration.
- get_calendar_events / create_calendar_event / update_calendar_event / delete_calendar_event / check_time_conflicts: Manage schedule blocks and detect overlapping time conflicts.

CRITICAL OPERATING RULES:
1. Do NOT merely describe a plan in text. When an action is required, USE THE AVAILABLE TOOLS to actually modify the student's workload in the database.
2. Before making significant planning decisions, inspect the student's current state via get_student_state.
3. Respect existing commitments and avoid scheduling overlapping tasks.
4. Consider deadlines, priority, and estimated workload. Break large goals into actionable, bite-sized tasks.
5. Do not overload the student. If the user's requested workload is unrealistic (e.g., 6 hours on a busy day), identify the conflict, propose a manageable alternative, and schedule accordingly.
6. After modifying the schedule or tasks, verify your changes and provide a clear, encouraging, and concise explanation of what you did.
7. Never claim that an action was completed unless the tool successfully executed it.
8. When reviewing student state or when the student asks to adjust their schedule based on recent assessments/weaknesses, check the topics array from get_student_state (especially topics with status 'weak', low mastery, or recorded misconceptions). Proactively schedule targeted revision/practice tasks and calendar study blocks to remediate those weak concepts.`;

  // Initialize conversation contents
  const contents: Array<Record<string, unknown>> = [
    {
      role: "user",
      parts: [{ text: userMessage }],
    },
  ];

  const maxIterations = 10;
  let iteration = 0;
  let finalMessage = "";
  while (iteration < maxIterations) {
    iteration++;

    let response;
    const candidateModels = [
      env.GOOGLE_GENERATION_MODEL,
      "gemini-3.5-flash-lite",
      "gemini-2.5-flash",
    ].filter(Boolean);

    let lastError: unknown;
    for (const modelName of candidateModels) {
      let attempts = 0;
      while (attempts < 2) {
        try {
          attempts++;
          response = await ai.models.generateContent({
            model: modelName,
            contents: contents as never,
            config: {
              systemInstruction,
              tools: [{ functionDeclarations: allFunctionDeclarations as never }],
            },
          });
          break;
        } catch (err) {
          lastError = err;
          console.warn(
            `[Planner Agent] generateContent with model "${modelName}" attempt ${attempts} failed:`,
            err instanceof Error ? err.message : err
          );
          await new Promise((r) => setTimeout(r, 1000));
        }
      }
      if (response) break;
    }

    if (!response) {
      throw lastError || new Error("Failed to get response from Gemini model after trying all fallback models.");
    }

    const candidate = response.candidates?.[0];
    const parts = candidate?.content?.parts || [];

    // Check for function calls
    const functionCalls = response.functionCalls ?? [];

    if (!functionCalls || functionCalls.length === 0) {
      // No more tool calls; extract final text
      finalMessage = response.text || "Plan updated successfully.";
      break;
    }

    // Add model candidate output to conversation history
    contents.push({
      role: "model",
      parts,
    });

    // Execute each function call and collect responses
    const responseParts: Array<Record<string, unknown>> = [];

    for (const call of functionCalls) {
      const callArgs = (call.args as Record<string, unknown>) || {};
      let toolResult: unknown;

      try {
        toolResult = await dispatchToolCall(userId, call.name || "", callArgs, actions);
      } catch (err) {
        toolResult = {
          success: false,
          error: err instanceof Error ? err.message : String(err),
        };
      }

      responseParts.push({
        functionResponse: {
          name: call.name,
          response: {
            result: toolResult,
          },
        },
      });
    }

    // Append function results to conversation
    contents.push({
      role: "user",
      parts: responseParts,
    });
  }

  // Fetch final updated student state snapshot
  const updatedState = await getStudentState(userId);

  return {
    message: finalMessage || "Workload updated based on your request.",
    actions,
    studentState: updatedState,
  };
}
