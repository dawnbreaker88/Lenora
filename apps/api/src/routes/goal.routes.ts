import { Router } from "express";
import { z } from "zod";
import { authenticatedUser } from "../middleware/auth.js";
import { createGoal, deleteGoal, getGoals, updateGoal } from "../services/goal.service.js";

const createGoalSchema = z.object({
  title: z.string().min(1),
  category: z.enum(["exam", "leetcode", "assignment", "career", "project", "personal", "other"]),
  description: z.string().optional(),
  priority: z.enum(["low", "medium", "high", "critical"]).optional(),
  targetDate: z.string().optional(),
});

export const goalRouter = Router();

goalRouter.get("/", async (req, res, next) => {
  try {
    const userId = await authenticatedUser(req);
    const goals = await getGoals(userId);
    res.json(goals);
  } catch (error) {
    next(error);
  }
});

goalRouter.post("/", async (req, res, next) => {
  try {
    const userId = await authenticatedUser(req);
    const body = createGoalSchema.parse(req.body);
    const goal = await createGoal(userId, body);
    res.status(201).json(goal);
  } catch (error) {
    next(error);
  }
});

goalRouter.put("/:id", async (req, res, next) => {
  try {
    const userId = await authenticatedUser(req);
    const goal = await updateGoal(userId, req.params.id, req.body);
    res.json(goal);
  } catch (error) {
    next(error);
  }
});

goalRouter.delete("/:id", async (req, res, next) => {
  try {
    const userId = await authenticatedUser(req);
    const result = await deleteGoal(userId, req.params.id);
    res.json({ message: "Goal deleted", goal: result });
  } catch (error) {
    next(error);
  }
});
