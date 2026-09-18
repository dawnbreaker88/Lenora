import { Router } from "express";
import { z } from "zod";
import { authenticatedUser } from "../middleware/auth.js";
import { AgentRouterService } from "../services/agent-router.service.js";
import {
  listUserSessions,
  createSession,
  renameSession,
  deleteSession,
  getSessionById,
} from "../services/agent-session.service.js";

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

const createSessionSchema = z.object({
  agentType: z.enum(["planner", "feynman"]),
  title: z.string().optional(),
});

const renameSessionSchema = z.object({
  title: z.string().min(1, "Title is required").max(120),
});

export const agentRouter = Router();

// ─── Session Management Endpoints ──────────────────────────────────────────

agentRouter.get("/sessions", async (req, res, next) => {
  try {
    const userId = await authenticatedUser(req);
    const agentType = req.query.agentType as "planner" | "feynman" | undefined;
    const sessions = await listUserSessions(userId, agentType);
    res.json(sessions);
  } catch (error) {
    next(error);
  }
});

agentRouter.post("/sessions", async (req, res, next) => {
  try {
    const userId = await authenticatedUser(req);
    const body = createSessionSchema.parse(req.body);
    const session = await createSession(userId, body.agentType, body.title);
    res.status(201).json(session);
  } catch (error) {
    next(error);
  }
});

agentRouter.get("/sessions/:id", async (req, res, next) => {
  try {
    const userId = await authenticatedUser(req);
    const session = await getSessionById(userId, req.params.id);
    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }
    res.json(session);
  } catch (error) {
    next(error);
  }
});

agentRouter.patch("/sessions/:id", async (req, res, next) => {
  try {
    const userId = await authenticatedUser(req);
    const body = renameSessionSchema.parse(req.body);
    const updated = await renameSession(userId, req.params.id, body.title);
    if (!updated) {
      return res.status(404).json({ error: "Session not found" });
    }
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

agentRouter.delete("/sessions/:id", async (req, res, next) => {
  try {
    const userId = await authenticatedUser(req);
    const ok = await deleteSession(userId, req.params.id);
    if (!ok) {
      return res.status(404).json({ error: "Session not found" });
    }
    res.json({ message: "Session deleted" });
  } catch (error) {
    next(error);
  }
});

// ─── Agent Execution Endpoints ─────────────────────────────────────────────

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




