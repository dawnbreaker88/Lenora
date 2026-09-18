import { Router } from "express";
import { z } from "zod";
import { env } from "../config/env.js";
import { authenticatedUser } from "../middleware/auth.js";
import {
  createEvent,
  deleteEvent,
  findConflicts,
  findAvailableSlots,
  getEvents,
  updateEvent,
  getCalendarStatus,
  generateGoogleCalendarAuthUrl,
  handleGoogleCalendarCallback,
  disconnectGoogleCalendar,
} from "../services/calendar.service.js";

const createEventSchema = z.object({
  title: z.string().min(1),
  startTime: z.string().min(1),
  endTime: z.string().min(1),
  description: z.string().optional(),
  type: z.enum(["study", "class", "exam", "assignment", "personal", "other"]).optional(),
  taskId: z.string().optional(),
});

const updateEventSchema = z.object({
  title: z.string().optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  description: z.string().optional(),
  type: z.enum(["study", "class", "exam", "assignment", "personal", "other"]).optional(),
  taskId: z.string().optional(),
});

const findSlotsSchema = z.object({
  startDate: z.string().min(1),
  endDate: z.string().min(1),
  durationMinutes: z.coerce.number().int().positive().default(60),
});

export const calendarRouter = Router();

/**
 * Connection Status
 */
calendarRouter.get("/status", async (req, res, next) => {
  try {
    const userId = await authenticatedUser(req);
    const status = await getCalendarStatus(userId);
    res.json(status);
  } catch (error) {
    next(error);
  }
});

/**
 * Start Google Calendar OAuth Flow
 */
calendarRouter.get("/auth", async (req, res, next) => {
  try {
    const userId = await authenticatedUser(req);
    const authUrl = generateGoogleCalendarAuthUrl(userId);
    res.json({ url: authUrl });
  } catch (error) {
    next(error);
  }
});

/**
 * Google Calendar OAuth Callback
 */
calendarRouter.get("/callback", async (req, res, next) => {
  try {
    const code = req.query.code as string;
    const state = req.query.state as string;

    if (!code || !state) {
      return res.redirect(`${env.FRONTEND_URL}?calendar_error=missing_code_or_state`);
    }

    await handleGoogleCalendarCallback(code, state);
    res.redirect(`${env.FRONTEND_URL}?calendar_connected=true`);
  } catch (error: any) {
    console.error("Google Calendar callback error:", error);
    const errMsg = encodeURIComponent(error.message || "Failed to link calendar");
    res.redirect(`${env.FRONTEND_URL}?calendar_error=${errMsg}`);
  }
});

/**
 * Disconnect Google Calendar
 */
calendarRouter.post("/disconnect", async (req, res, next) => {
  try {
    const userId = await authenticatedUser(req);
    await disconnectGoogleCalendar(userId);
    res.json({ message: "Google Calendar disconnected successfully" });
  } catch (error) {
    next(error);
  }
});

/**
 * Find Available Slots
 */
calendarRouter.post("/find-slots", async (req, res, next) => {
  try {
    const userId = await authenticatedUser(req);
    const { startDate, endDate, durationMinutes } = findSlotsSchema.parse(req.body);
    const slots = await findAvailableSlots(userId, startDate, endDate, durationMinutes);
    res.json({ success: true, count: slots.length, slots });
  } catch (error) {
    next(error);
  }
});

/**
 * Get Events
 */
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

/**
 * Create Event
 */
calendarRouter.post("/", async (req, res, next) => {
  try {
    const userId = await authenticatedUser(req);
    const body = createEventSchema.parse(req.body);
    const result = await createEvent(userId, body);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * Update Event (PATCH and PUT)
 */
calendarRouter.patch("/:id", async (req, res, next) => {
  try {
    const userId = await authenticatedUser(req);
    const body = updateEventSchema.parse(req.body);
    const event = await updateEvent(userId, req.params.id, body);
    res.json(event);
  } catch (error) {
    next(error);
  }
});

calendarRouter.put("/:id", async (req, res, next) => {
  try {
    const userId = await authenticatedUser(req);
    const body = updateEventSchema.parse(req.body);
    const event = await updateEvent(userId, req.params.id, body);
    res.json(event);
  } catch (error) {
    next(error);
  }
});

/**
 * Delete Event
 */
calendarRouter.delete("/:id", async (req, res, next) => {
  try {
    const userId = await authenticatedUser(req);
    await deleteEvent(userId, req.params.id);
    res.json({ success: true, message: "Event deleted" });
  } catch (error: any) {
    if (error.code === "EXTERNAL_EVENT_PROTECTED") {
      return res.status(403).json({ error: error.message, code: error.code });
    }
    next(error);
  }
});

/**
 * Conflict check
 */
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
