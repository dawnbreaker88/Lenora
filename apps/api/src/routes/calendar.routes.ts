import { Router } from "express";
import { z } from "zod";
import { authenticatedUser } from "../middleware/auth.js";
import {
  createEvent,
  deleteEvent,
  findConflicts,
  getEvents,
  updateEvent,
} from "../services/calendar.service.js";

const createEventSchema = z.object({
  title: z.string().min(1),
  startTime: z.string().min(1),
  endTime: z.string().min(1),
  description: z.string().optional(),
  type: z.enum(["study", "class", "exam", "assignment", "personal", "other"]).optional(),
  taskId: z.string().optional(),
});

export const calendarRouter = Router();

calendarRouter.get("/", async (req, res, next) => {
  try {
    const userId = await authenticatedUser(req);
    const start = typeof req.query.start === "string" ? req.query.start : undefined;
    const end = typeof req.query.end === "string" ? req.query.end : undefined;
    const events = await getEvents(userId, start, end);
    res.json(events);
  } catch (error) {
    next(error);
  }
});

calendarRouter.post("/", async (req, res, next) => {
  try {
    const userId = await authenticatedUser(req);
    const body = createEventSchema.parse(req.body);
    const event = await createEvent(userId, body);
    res.status(201).json(event);
  } catch (error) {
    next(error);
  }
});

calendarRouter.put("/:id", async (req, res, next) => {
  try {
    const userId = await authenticatedUser(req);
    const event = await updateEvent(userId, req.params.id, req.body);
    res.json(event);
  } catch (error) {
    next(error);
  }
});

calendarRouter.delete("/:id", async (req, res, next) => {
  try {
    const userId = await authenticatedUser(req);
    const result = await deleteEvent(userId, req.params.id);
    res.json({ message: "Event deleted", event: result });
  } catch (error) {
    next(error);
  }
});

calendarRouter.post("/conflicts", async (req, res, next) => {
  try {
    const userId = await authenticatedUser(req);
    const { startTime, endTime } = z
      .object({ startTime: z.string(), endTime: z.string() })
      .parse(req.body);
    const conflicts = await findConflicts(userId, startTime, endTime);
    res.json({ hasConflicts: conflicts.length > 0, conflicts });
  } catch (error) {
    next(error);
  }
});
