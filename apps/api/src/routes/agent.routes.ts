import { Router } from "express";
import { z } from "zod";
import { authenticatedUser } from "../middleware/auth.js";
import { runPlannerAgent } from "../agents/planner.js";
import { runFeynmanAgent } from "../agents/feynman.js";

const plannerSchema = z.object({
  message: z.string().min(1, "Message is required").max(3000),
});

const feynmanSchema = z.object({
  message: z.string().min(1, "Message is required").max(4000),
  sessionId: z.string().optional(),
  topicId: z.string().optional(),
  topicName: z.string().optional(),
  subject: z.string().optional(),
  taskId: z.string().optional(),
  goalId: z.string().optional(),
});

export const agentRouter = Router();

agentRouter.post("/planner", async (req, res, next) => {
  try {
    const { message } = plannerSchema.parse(req.body);
    const userId = await authenticatedUser(req);
    const result = await runPlannerAgent(userId, message);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

agentRouter.post("/feynman", async (req, res, next) => {
  try {
    const input = feynmanSchema.parse(req.body);
    const userId = await authenticatedUser(req);
    const result = await runFeynmanAgent({
      ...input,
      userId,
    });
    res.json(result);
  } catch (error) {
    next(error);
  }
});

const reviewStateSchema = z.object({
  topicName: z.string().optional(),
  reason: z.string().optional(),
});

agentRouter.post("/planner/review-state", async (req, res, next) => {
  try {
    const userId = await authenticatedUser(req);
    const body = reviewStateSchema.parse(req.body || {});

    let message =
      "Please review my current student state (including weak topics, misconceptions, and workload). If there are weak concepts or unresolved misconceptions, schedule targeted revision tasks or calendar study blocks to remediate them.";
    if (body.topicName) {
      message = `Please review my student state with focus on the topic "${body.topicName}". If I have unresolved weaknesses or misconceptions, adapt my schedule and create revision tasks. Context: ${body.reason || "Learning session review"}`;
    }

    const result = await runPlannerAgent(userId, message);
    res.json(result);
  } catch (error) {
    next(error);
  }
});


