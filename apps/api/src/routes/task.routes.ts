import { Router } from "express";
import { z } from "zod";
import { authenticatedUser } from "../middleware/auth.js";
import { createTask, deleteTask, getTasks, updateTask } from "../services/task.service.js";

const createTaskSchema = z.object({
  title: z.string().min(1),
  estimatedMinutes: z.coerce.number().int().positive().default(30),
  description: z.string().optional(),
  goalId: z.string().optional(),
  topicId: z.string().optional(),
  type: z.enum(["study", "practice", "leetcode", "assignment", "application", "revision", "other"]).optional(),
  priority: z.enum(["low", "medium", "high", "critical"]).optional(),
  dueAt: z.string().optional(),
  scheduledStart: z.string().optional(),
  scheduledEnd: z.string().optional(),
});

export const taskRouter = Router();

taskRouter.get("/", async (req, res, next) => {
  try {
    const userId = await authenticatedUser(req);
    const status = typeof req.query.status === "string" ? req.query.status : undefined;
    const tasks = await getTasks(userId, status);
    res.json(tasks);
  } catch (error) {
    next(error);
  }
});

taskRouter.post("/", async (req, res, next) => {
  try {
    const userId = await authenticatedUser(req);
    const body = createTaskSchema.parse(req.body);
    const task = await createTask(userId, body);
    res.status(201).json(task);
  } catch (error) {
    next(error);
  }
});

taskRouter.put("/:id", async (req, res, next) => {
  try {
    const userId = await authenticatedUser(req);
    const task = await updateTask(userId, req.params.id, req.body);
    res.json(task);
  } catch (error) {
    next(error);
  }
});

taskRouter.delete("/:id", async (req, res, next) => {
  try {
    const userId = await authenticatedUser(req);
    const result = await deleteTask(userId, req.params.id);
    res.json({ message: "Task deleted", task: result });
  } catch (error) {
    next(error);
  }
});
