import {
  createTask,
  updateTask,
  deleteTask,
  type CreateTaskInput,
  type UpdateTaskInput,
} from "../../services/task.service.js";

export const taskToolDeclarations = [
  {
    name: "create_task",
    description: "Creates an actionable task for the student with estimated duration and deadlines.",
    parameters: {
      type: "OBJECT",
      properties: {
        title: { type: "STRING", description: "Clear, actionable task title (e.g. 'DBMS — Normalization Practice')" },
        estimatedMinutes: { type: "NUMBER", description: "Estimated completion time in minutes (e.g. 45, 60)" },
        description: { type: "STRING", description: "Task details or sub-steps" },
        goalId: { type: "STRING", description: "Associated Goal ID if applicable" },
        type: {
          type: "STRING",
          enum: ["study", "practice", "leetcode", "assignment", "application", "revision", "other"],
          description: "Task type",
        },
        priority: {
          type: "STRING",
          enum: ["low", "medium", "high", "critical"],
        },
        dueAt: { type: "STRING", description: "Due date in ISO format (YYYY-MM-DDTHH:mm:ssZ)" },
        scheduledStart: { type: "STRING", description: "Scheduled start time in ISO format" },
        scheduledEnd: { type: "STRING", description: "Scheduled end time in ISO format" },
      },
      required: ["title", "estimatedMinutes"],
    },
  },
  {
    name: "update_task",
    description: "Updates an existing task's status, schedule, priority, or deadline.",
    parameters: {
      type: "OBJECT",
      properties: {
        taskId: { type: "STRING", description: "ID of the task to update" },
        title: { type: "STRING" },
        description: { type: "STRING" },
        estimatedMinutes: { type: "NUMBER" },
        status: {
          type: "STRING",
          enum: ["todo", "in_progress", "completed", "skipped", "overdue"],
        },
        priority: {
          type: "STRING",
          enum: ["low", "medium", "high", "critical"],
        },
        dueAt: { type: "STRING", description: "New due date in ISO format" },
        scheduledStart: { type: "STRING", description: "New scheduled start in ISO format" },
        scheduledEnd: { type: "STRING", description: "New scheduled end in ISO format" },
      },
      required: ["taskId"],
    },
  },
  {
    name: "delete_task",
    description: "Removes an obsolete or duplicate task from the student's workload.",
    parameters: {
      type: "OBJECT",
      properties: {
        taskId: { type: "STRING", description: "ID of the task to delete" },
      },
      required: ["taskId"],
    },
  },
];

export async function executeTaskTool(
  userId: string,
  name: string,
  args: Record<string, unknown>
) {
  try {
    if (name === "create_task") {
      const title = String(args.title || "").trim();
      const estimatedMinutes = Number(args.estimatedMinutes) || 30;

      if (!title) {
        return { success: false, error: "Task title is required." };
      }

      const res = (await createTask(userId, {
        ...args,
        title,
        estimatedMinutes,
      } as unknown as CreateTaskInput)) as Record<string, unknown>;

      if (res.isDuplicate) {
        return {
          success: true,
          task: res,
          isDuplicate: true,
          message: `Active task "${res.title}" already exists (ID: ${res._id}, ${res.estimatedMinutes}m); reused existing task to prevent duplicates.`,
        };
      }

      return {
        success: true,
        task: res,
        message: `Task "${res.title}" created with ID ${res._id} (${res.estimatedMinutes}m)`,
      };
    }

    if (name === "update_task") {
      const taskId = String(args.taskId || "").trim();
      if (!taskId) {
        return { success: false, error: "taskId is required for update_task." };
      }

      const { taskId: _, ...data } = args;
      const res = await updateTask(userId, taskId, data as UpdateTaskInput);
      return {
        success: true,
        task: res,
        message: `Task "${res.title}" updated successfully`,
      };
    }

    if (name === "delete_task") {
      const taskId = String(args.taskId || "").trim();
      if (!taskId) {
        return { success: false, error: "taskId is required for delete_task." };
      }

      const res = await deleteTask(userId, taskId);
      return {
        success: true,
        message: `Task "${res.title}" deleted successfully`,
      };
    }

    return { success: false, error: `Unknown task tool: ${name}` };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

