import { getStudentState } from "../../services/student-state.service.js";

export const stateToolDeclarations = [
  {
    name: "get_student_state",
    description:
      "Retrieves the student's complete, authoritative state including active goals, upcoming/overdue tasks, current workload vs daily capacity, and existing calendar events.",
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
  if (name === "get_student_state") {
    return await getStudentState(userId);
  }
  throw new Error(`Unknown state tool: ${name}`);
}
