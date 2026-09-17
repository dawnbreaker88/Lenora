import { getStudentState } from "../../services/student-state.service.js";

export const stateToolDeclarations = [
  {
    name: "get_student_state",
    description:
      "Retrieves the student's authoritative state snapshot including active goals, unfinished tasks, current workload vs daily capacity, and upcoming calendar events. Use before making major workload adjustments. Do not call multiple times in the same turn.",
    parameters: {
      type: "OBJECT",
      properties: {},
      required: [],
    },
  },
];

export async function executeStateTool(
  userId: string,
  name: string,
  _args: Record<string, unknown>
) {
  try {
    if (name === "get_student_state") {
      const state = await getStudentState(userId);
      return {
        success: true,
        user: state.user,
        goals: state.goals,
        tasks: state.tasks,
        workload: state.workload,
        calendar: state.calendar,
        topics: state.topics,
      };
    }
    return { success: false, error: `Unknown state tool: ${name}` };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

