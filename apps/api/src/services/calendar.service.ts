import { Types } from "mongoose";
import { CalendarEvent } from "../models/CalendarEvent.js";

export interface CreateCalendarEventInput {
  title: string;
  description?: string;
  startTime: Date | string;
  endTime: Date | string;
  type?: "study" | "class" | "exam" | "assignment" | "personal" | "other";
  taskId?: string;
}

export interface UpdateCalendarEventInput {
  title?: string;
  description?: string;
  startTime?: Date | string;
  endTime?: Date | string;
  type?: "study" | "class" | "exam" | "assignment" | "personal" | "other";
  taskId?: string;
}

/**
 * Checks for overlapping events for a given user.
 */
export async function findConflicts(
  userId: string,
  startTime: Date | string,
  endTime: Date | string,
  excludeEventId?: string
) {
  const start = new Date(startTime);
  const end = new Date(endTime);

  const query: Record<string, unknown> = {
    userId: new Types.ObjectId(userId),
    startTime: { $lt: end },
    endTime: { $gt: start },
  };

  if (excludeEventId) {
    query._id = { $ne: new Types.ObjectId(excludeEventId) };
  }

  return CalendarEvent.find(query).lean();
}

/**
 * Retrieves calendar events in an optional date window.
 */
export async function getEvents(userId: string, start?: Date | string, end?: Date | string) {
  const query: Record<string, unknown> = {
    userId: new Types.ObjectId(userId),
  };

  if (start || end) {
    query.startTime = {};
    if (start) {
      (query.startTime as Record<string, unknown>).$gte = new Date(start);
    }
    if (end) {
      (query.startTime as Record<string, unknown>).$lte = new Date(end);
    }
  }

  return CalendarEvent.find(query).sort({ startTime: 1 }).lean();
}

/**
 * Creates a new calendar event scoped to the authenticated user.
 */
export async function createEvent(userId: string, input: CreateCalendarEventInput) {
  const userObjectId = new Types.ObjectId(userId);
  const start = new Date(input.startTime);
  const end = new Date(input.endTime);
  const cleanTitle = input.title.trim();

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    throw new Error("Invalid start or end date format");
  }

  if (end <= start) {
    throw new Error("End time must be after start time");
  }

  // Duplicate protection: check if an identical event already exists in this exact slot
  const existingEvent = await CalendarEvent.findOne({
    userId: userObjectId,
    title: { $regex: new RegExp(`^${cleanTitle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") },
    startTime: start,
    endTime: end,
  }).lean();

  if (existingEvent) {
    return {
      event: { ...existingEvent, isDuplicate: true },
      conflicts: [],
      isDuplicate: true,
    };
  }

  const conflicts = await findConflicts(userId, start, end);

  const event = await CalendarEvent.create({
    userId: userObjectId,
    title: cleanTitle,
    description: input.description,
    startTime: start,
    endTime: end,
    type: input.type || "study",
    taskId: input.taskId ? new Types.ObjectId(input.taskId) : undefined,
    source: "internal",
  });

  return {
    event: event.toObject(),
    conflicts: conflicts.map((c) => ({
      id: c._id.toString(),
      title: c.title,
      startTime: c.startTime,
      endTime: c.endTime,
    })),
  };
}


/**
 * Updates an existing calendar event scoped to the user.
 */
export async function updateEvent(userId: string, eventId: string, input: UpdateCalendarEventInput) {
  const updateData: Record<string, unknown> = {};

  if (input.title !== undefined) updateData.title = input.title;
  if (input.description !== undefined) updateData.description = input.description;
  if (input.type !== undefined) updateData.type = input.type;
  if (input.taskId !== undefined) {
    updateData.taskId = input.taskId ? new Types.ObjectId(input.taskId) : null;
  }

  if (input.startTime !== undefined) {
    const start = new Date(input.startTime);
    if (isNaN(start.getTime())) throw new Error("Invalid start date format");
    updateData.startTime = start;
  }

  if (input.endTime !== undefined) {
    const end = new Date(input.endTime);
    if (isNaN(end.getTime())) throw new Error("Invalid end date format");
    updateData.endTime = end;
  }

  const event = await CalendarEvent.findOneAndUpdate(
    { _id: new Types.ObjectId(eventId), userId: new Types.ObjectId(userId) },
    { $set: updateData },
    { returnDocument: "after" }
  ).lean();


  if (!event) {
    throw new Error(`Calendar event ${eventId} not found`);
  }

  return event;
}

/**
 * Deletes a calendar event scoped to the user.
 */
export async function deleteEvent(userId: string, eventId: string) {
  const result = await CalendarEvent.findOneAndDelete({
    _id: new Types.ObjectId(eventId),
    userId: new Types.ObjectId(userId),
  }).lean();

  if (!result) {
    throw new Error(`Calendar event ${eventId} not found`);
  }

  return result;
}
