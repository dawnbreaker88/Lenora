import { Types } from "mongoose";
import { Goal } from "../models/Goals.js";

export interface CreateGoalInput {
  title: string;
  category: "exam" | "leetcode" | "assignment" | "career" | "project" | "personal" | "other";
  description?: string;
  priority?: "low" | "medium" | "high" | "critical";
  targetDate?: Date | string;
}

export interface UpdateGoalInput {
  title?: string;
  category?: "exam" | "leetcode" | "assignment" | "career" | "project" | "personal" | "other";
  description?: string;
  status?: "active" | "completed" | "paused" | "cancelled";
  priority?: "low" | "medium" | "high" | "critical";
  targetDate?: Date | string;
  progress?: number;
}

export async function getGoals(userId: string) {
  return Goal.find({ userId: new Types.ObjectId(userId) }).sort({ createdAt: -1 }).lean();
}

export async function createGoal(userId: string, input: CreateGoalInput) {
  const goal = await Goal.create({
    userId: new Types.ObjectId(userId),
    title: input.title.trim(),
    category: input.category,
    description: input.description,
    priority: input.priority || "medium",
    targetDate: input.targetDate ? new Date(input.targetDate) : undefined,
    status: "active",
    progress: 0,
  });

  return goal.toObject();
}

export async function updateGoal(userId: string, goalId: string, input: UpdateGoalInput) {
  const updateData: Record<string, unknown> = {};

  if (input.title !== undefined) updateData.title = input.title.trim();
  if (input.category !== undefined) updateData.category = input.category;
  if (input.description !== undefined) updateData.description = input.description;
  if (input.status !== undefined) updateData.status = input.status;
  if (input.priority !== undefined) updateData.priority = input.priority;
  if (input.progress !== undefined) updateData.progress = input.progress;
  if (input.targetDate !== undefined) {
    updateData.targetDate = input.targetDate ? new Date(input.targetDate) : null;
  }

  const goal = await Goal.findOneAndUpdate(
    { _id: new Types.ObjectId(goalId), userId: new Types.ObjectId(userId) },
    { $set: updateData },
    { returnDocument: "after" }
  ).lean();

  if (!goal) {
    throw new Error(`Goal ${goalId} not found`);
  }

  return goal;
}

export async function deleteGoal(userId: string, goalId: string) {
  const goal = await Goal.findOneAndDelete({
    _id: new Types.ObjectId(goalId),
    userId: new Types.ObjectId(userId),
  }).lean();

  if (!goal) {
    throw new Error(`Goal ${goalId} not found`);
  }

  return goal;
}
