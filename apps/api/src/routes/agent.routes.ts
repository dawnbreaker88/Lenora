import { Router } from "express";
import { z } from "zod";
import { authenticatedUser } from "../middleware/auth.js";
import { AgentRouterService } from "../services/agent-router.service.js";

const plannerSchema = z.object({
  message: z.string().min(1, "Message is required").max(3000),
  sessionId: z.string().optional(),
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

const reviewStateSchema = z.object({
  topicName: z.string().optional(),
  reason: z.string().optional(),
  sessionId: z.string().optional(),
});

export const agentRouter = Router();

agentRouter.post("/planner", async (req, res, next) => {
  try {
    const { message, sessionId } = plannerSchema.parse(req.body);
    const userId = await authenticatedUser(req);
    const result = await AgentRouterService.routePlanner({
      userId,
      message,
      sessionId,
    });
    res.json(result);
  } catch (error) {
    next(error);
  }
});

agentRouter.post("/feynman", async (req, res, next) => {
  try {
    const input = feynmanSchema.parse(req.body);
    const userId = await authenticatedUser(req);
    const result = await AgentRouterService.routeFeynman({
      ...input,
      userId,
    });
    res.json(result);
  } catch (error) {
    next(error);
  }
});

agentRouter.post("/planner/review-state", async (req, res, next) => {
  try {
    const userId = await authenticatedUser(req);
    const body = reviewStateSchema.parse(req.body || {});
    const result = await AgentRouterService.routePlannerReviewState({
      userId,
      topicName: body.topicName,
      reason: body.reason,
      sessionId: body.sessionId,
    });
    res.json(result);
  } catch (error) {
    next(error);
  }
});



