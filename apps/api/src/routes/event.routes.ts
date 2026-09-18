import { Router } from "express";
import { z } from "zod";
import { authenticatedUser } from "../middleware/auth.js";
import { EventService } from "../events/event.service.js";

export const eventRouter = Router();

const emitSchema = z.object({
  type: z.string(),
  source: z.enum(["user", "planner", "feynman", "learner", "system", "calendar"]).default("user"),
  entityType: z.enum(["task", "goal", "topic", "assessment", "calendar", "document", "session"]).optional(),
  entityId: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

/**
 * GET /api/events/activity
 * Returns recent meaningful system and agent events for the user-facing activity timeline.
 */
eventRouter.get("/activity", async (req, res, next) => {
  try {
    const userId = await authenticatedUser(req);
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 15));
    const events = await EventService.getRecentEvents(userId, limit);
    res.json(events);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/events/emit
 * Allows authorized client actions to emit structured events into the harness.
 */
eventRouter.post("/emit", async (req, res, next) => {
  try {
    const userId = await authenticatedUser(req);
    const body = emitSchema.parse(req.body);
    const event = await EventService.emitEvent({
      userId,
      type: body.type as any,
      source: body.source,
      entityType: body.entityType,
      entityId: body.entityId,
      metadata: body.metadata,
    });
    res.status(201).json(event);
  } catch (error) {
    next(error);
  }
});
