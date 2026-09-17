import { Types } from "mongoose";
import { Task } from "../models/Task.js";

export interface CreateTaskInput {
  title: string;
  estimatedMinutes: number;
  description?: string;
  goalId?: string;
  topicId?: string;
  type?: "study" | "practice" | "leetcode" | "assignment" | "application" | "revision" | "other";
  priority?: "low" | "medium" | "high" | "critical";
  dueAt?: Date | string;
  scheduledStart?: Date | string;
  scheduledEnd?: Date | string;
  source?: "user" | "planner" | "system";
  calendarEventId?: string;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  estimatedMinutes?: number;
  goalId?: string;
  topicId?: string;
  type?: "study" | "practice" | "leetcode" | "assignment" | "application" | "revision" | "other";
  status?: "todo" | "in_progress" | "completed" | "skipped" | "overdue";
  priority?: "low" | "medium" | "high" | "critical";
  dueAt?: Date | string;
  scheduledStart?: Date | string;
  scheduledEnd?: Date | string;
  completedAt?: Date | string;
  calendarEventId?: string;
}

export async function getTasks(userId: string, filterStatus?: string) {
  const query: Record<string, unknown> = {
    userId: new Types.ObjectId(userId),
  };

  if (filterStatus) {
    query.status = filterStatus;
  }

  return Task.find(query).sort({ scheduledStart: 1, dueAt: 1, priority: -1 }).lean();
}

export async function createTask(userId: string, input: CreateTaskInput) {
  const userObjectId = new Types.ObjectId(userId);
  const cleanTitle = input.title.trim();

  // Duplicate protection: check if an active task with identical title already exists
  const existingTask = await Task.findOne({
    userId: userObjectId,
    title: { $regex: new RegExp(`^${cleanTitle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") },
    status: { $in: ["todo", "in_progress"] },
  }).lean();

  if (existingTask) {
    return {
      ...existingTask,
      isDuplicate: true,
    };
  }

  const task = await Task.create({
    userId: userObjectId,
    title: cleanTitle,
    estimatedMinutes: input.estimatedMinutes || 30,
    description: input.description,
    goalId: input.goalId ? new Types.ObjectId(input.goalId) : undefined,
    topicId: input.topicId ? new Types.ObjectId(input.topicId) : undefined,
    type: input.type || "study",
    status: "todo",
    priority: input.priority || "medium",
    dueAt: input.dueAt ? new Date(input.dueAt) : undefined,
    scheduledStart: input.scheduledStart ? new Date(input.scheduledStart) : undefined,
    scheduledEnd: input.scheduledEnd ? new Date(input.scheduledEnd) : undefined,
    source: input.source || "planner",
    calendarEventId: input.calendarEventId,
  });

  return task.toObject();
}


export async function updateTask(userId: string, taskId: string, input: UpdateTaskInput) {
  const updateData: Record<string, unknown> = {};

  if (input.title !== undefined) updateData.title = input.title.trim();
  if (input.description !== undefined) updateData.description = input.description;
  if (input.estimatedMinutes !== undefined) updateData.estimatedMinutes = input.estimatedMinutes;
  if (input.type !== undefined) updateData.type = input.type;
  if (input.status !== undefined) {
    updateData.status = input.status;
    if (input.status === "completed") {
      updateData.completedAt = new Date();
    }
  }
  if (input.priority !== undefined) updateData.priority = input.priority;
  if (input.goalId !== undefined) {
    updateData.goalId = input.goalId ? new Types.ObjectId(input.goalId) : null;
  }
  if (input.topicId !== undefined) {
    updateData.topicId = input.topicId ? new Types.ObjectId(input.topicId) : null;
  }
  if (input.dueAt !== undefined) {
    updateData.dueAt = input.dueAt ? new Date(input.dueAt) : null;
  }
  if (input.scheduledStart !== undefined) {
    updateData.scheduledStart = input.scheduledStart ? new Date(input.scheduledStart) : null;
  }
  if (input.scheduledEnd !== undefined) {
    updateData.scheduledEnd = input.scheduledEnd ? new Date(input.scheduledEnd) : null;
  }
  if (input.calendarEventId !== undefined) {
    updateData.calendarEventId = input.calendarEventId;
  }

  const task = await Task.findOneAndUpdate(
    { _id: new Types.ObjectId(taskId), userId: new Types.ObjectId(userId) },
    { $set: updateData },
    { returnDocument: "after" }
  ).lean();

  if (!task) {
    throw new Error(`Task ${taskId} not found`);
  }

  return task;
}

export async function deleteTask(userId: string, taskId: string) {
  const task = await Task.findOneAndDelete({
    _id: new Types.ObjectId(taskId),
    userId: new Types.ObjectId(userId),
  }).lean();

  if (!task) {
    throw new Error(`Task ${taskId} not found`);
  }

  return task;
}
