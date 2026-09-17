import { createGoal, updateGoal, deleteGoal, type CreateGoalInput, type UpdateGoalInput } from "../../services/goal.service.js";

export const goalToolDeclarations = [
  {
    name: "create_goal",
    description: "Creates a new study, exam, or learning goal for the student.",
    parameters: {
      type: "OBJECT",
      properties: {
        title: { type: "STRING", description: "Title of the goal (e.g. 'DBMS Final Exam', 'LeetCode 75 Prep')" },
        category: {
          type: "STRING",
          enum: ["exam", "leetcode", "assignment", "career", "project", "personal", "other"],
          description: "Goal category",
        },
        description: { type: "STRING", description: "Optional description or scope of the goal" },
        priority: {
          type: "STRING",
          enum: ["low", "medium", "high", "critical"],
          description: "Priority level of the goal",
        },
        targetDate: { type: "STRING", description: "Target completion date in ISO or YYYY-MM-DD format" },
      },
      required: ["title", "category"],
    },
  },
  {
    name: "update_goal",
    description: "Updates an existing goal's title, status, priority, progress, or target date.",
    parameters: {
      type: "OBJECT",
      properties: {
        goalId: { type: "STRING", description: "ID of the goal to update" },
        title: { type: "STRING", description: "New title" },
        category: {
          type: "STRING",
          enum: ["exam", "leetcode", "assignment", "career", "project", "personal", "other"],
        },
        description: { type: "STRING", description: "Updated description" },
        status: {
          type: "STRING",
          enum: ["active", "completed", "paused", "cancelled"],
        },
        priority: {
          type: "STRING",
          enum: ["low", "medium", "high", "critical"],
        },
        progress: { type: "NUMBER", description: "Progress percentage (0 - 100)" },
        targetDate: { type: "STRING", description: "Target completion date in ISO format" },
      },
      required: ["goalId"],
    },
  },
];

export async function executeGoalTool(
  userId: string,
  name: string,
  args: Record<string, unknown>
) {
  if (name === "create_goal") {
    const res = await createGoal(userId, args as unknown as CreateGoalInput);
    return {
      success: true,
      goal: res,
      message: `Goal "${res.title}" created successfully with ID ${res._id}`,
    };
  }

  if (name === "update_goal") {
    const { goalId, ...data } = args;
    const res = await updateGoal(userId, goalId as string, data as UpdateGoalInput);
    return {
      success: true,
      goal: res,
      message: `Goal "${res.title}" updated successfully`,
    };
  }

  throw new Error(`Unknown goal tool: ${name}`);
}
