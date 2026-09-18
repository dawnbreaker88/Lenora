import { Types } from "mongoose";
import { CalendarEvent } from "../models/CalendarEvent.js";
import { Task } from "../models/Task.js";
import type {
  CalendarProvider,
  CalendarEventDTO,
  CreateCalendarEventInput,
  UpdateCalendarEventInput,
} from "./calendar.provider.js";

export class InternalCalendarProvider implements CalendarProvider {
  readonly providerName = "internal" as const;

  constructor(private readonly userId: string) {}

  async getEvents(start?: Date, end?: Date): Promise<CalendarEventDTO[]> {
    const userObjectId = new Types.ObjectId(this.userId);
    const query: Record<string, unknown> = {
      userId: userObjectId,
    };

    if (start || end) {
      if (start && end) {
        query.startTime = { $lt: end };
        query.endTime = { $gt: start };
      } else if (start) {
        query.endTime = { $gt: start };
      } else if (end) {
        query.startTime = { $lt: end };
      }
    }

    const dbEvents = await CalendarEvent.find(query).sort({ startTime: 1 }).lean();

    const result: CalendarEventDTO[] = dbEvents.map((e) => ({
      id: e._id.toString(),
      externalId: e.externalId ?? undefined,
      calendarId: e.calendarId || "primary",
      provider: "internal",
      title: e.title,
      description: e.description ?? undefined,
      startTime: new Date(e.startTime),
      endTime: new Date(e.endTime),
      status: (e.status as "confirmed" | "tentative" | "cancelled") || "confirmed",
      source: (e.source as "lenora" | "external") || "lenora",
      type: e.type,
      taskId: e.taskId ? e.taskId.toString() : undefined,
      createdAt: (e as any).createdAt,
      updatedAt: (e as any).updatedAt,
    }));

    // Check for scheduled tasks that don't have an explicit calendar event
    const taskQuery: Record<string, unknown> = {
      userId: userObjectId,
      $or: [
        { scheduledStart: { $exists: true, $ne: null } },
        { dueAt: { $exists: true, $ne: null } },
      ],
    };

    const tasks = await Task.find(taskQuery).lean();
    const existingTaskIds = new Set(
      result.filter((e) => e.taskId).map((e) => e.taskId!)
    );

    for (const task of tasks) {
      const taskIdStr = task._id.toString();
      if (!existingTaskIds.has(taskIdStr)) {
        const taskStart = task.scheduledStart || task.dueAt;
        if (!taskStart) continue;

        const startTime = new Date(taskStart);
        if (start && startTime < start) continue;
        if (end && startTime > end) continue;

        const estimatedMinutes = task.estimatedMinutes || 30;
        const endTime = task.scheduledEnd
          ? new Date(task.scheduledEnd)
          : new Date(startTime.getTime() + estimatedMinutes * 60000);

        result.push({
          id: taskIdStr,
          calendarId: "primary",
          provider: "internal",
          title: task.title,
          description: task.description || `Estimated: ${estimatedMinutes}m · Priority: ${task.priority}`,
          startTime,
          endTime,
          status: "confirmed",
          source: "lenora",
          type: task.type === "assignment" ? "assignment" : task.type === "leetcode" ? "personal" : "study",
          taskId: taskIdStr,
          createdAt: (task as any).createdAt || new Date(),
          updatedAt: (task as any).updatedAt || new Date(),
        });
      }
    }

    return result.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
  }

  async createEvent(input: CreateCalendarEventInput): Promise<CalendarEventDTO> {
    const userObjectId = new Types.ObjectId(this.userId);
    const start = new Date(input.startTime);
    const end = new Date(input.endTime);

    const event = await CalendarEvent.create({
      userId: userObjectId,
      title: input.title.trim(),
      description: input.description,
      startTime: start,
      endTime: end,
      type: input.type || "study",
      taskId: input.taskId ? new Types.ObjectId(input.taskId) : undefined,
      source: "lenora",
      status: "confirmed",
      calendarId: "primary",
    });

    return {
      id: event._id.toString(),
      calendarId: "primary",
      provider: "internal",
      title: event.title,
      description: event.description ?? undefined,
      startTime: event.startTime,
      endTime: event.endTime,
      status: event.status as "confirmed" | "tentative" | "cancelled",
      source: "lenora",
      type: event.type,
      taskId: event.taskId ? event.taskId.toString() : undefined,
      createdAt: event.createdAt,
      updatedAt: event.updatedAt,
    };
  }

  async updateEvent(eventId: string, input: UpdateCalendarEventInput): Promise<CalendarEventDTO> {
    const userObjectId = new Types.ObjectId(this.userId);
    const updateData: Record<string, unknown> = {};

    if (input.title !== undefined) updateData.title = input.title.trim();
    if (input.description !== undefined) updateData.description = input.description;
    if (input.type !== undefined) updateData.type = input.type;
    if (input.taskId !== undefined) {
      updateData.taskId = input.taskId ? new Types.ObjectId(input.taskId) : null;
    }
    if (input.startTime !== undefined) {
      updateData.startTime = new Date(input.startTime);
    }
    if (input.endTime !== undefined) {
      updateData.endTime = new Date(input.endTime);
    }

    const event = await CalendarEvent.findOneAndUpdate(
      { _id: new Types.ObjectId(eventId), userId: userObjectId },
      { $set: updateData },
      { returnDocument: "after" }
    ).lean();

    if (!event) {
      throw new Error(`Calendar event ${eventId} not found`);
    }

    return {
      id: event._id.toString(),
      calendarId: event.calendarId || "primary",
      provider: "internal",
      title: event.title,
      description: event.description ?? undefined,
      startTime: new Date(event.startTime),
      endTime: new Date(event.endTime),
      status: event.status as "confirmed" | "tentative" | "cancelled",
      source: (event.source as "lenora" | "external") || "lenora",
      type: event.type,
      taskId: event.taskId ? event.taskId.toString() : undefined,
      createdAt: (event as any).createdAt,
      updatedAt: (event as any).updatedAt,
    };
  }

  async deleteEvent(eventId: string): Promise<void> {
    const userObjectId = new Types.ObjectId(this.userId);
    const result = await CalendarEvent.findOneAndDelete({
      _id: new Types.ObjectId(eventId),
      userId: userObjectId,
    }).lean();

    if (!result) {
      throw new Error(`Calendar event ${eventId} not found`);
    }
  }
}
