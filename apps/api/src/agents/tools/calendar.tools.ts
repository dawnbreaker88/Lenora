import {
  createEvent,
  updateEvent,
  deleteEvent,
  getEvents,
  findConflicts,
  findAvailableSlots,
  getCalendarStatus,
  type CreateCalendarEventInput,
  type UpdateCalendarEventInput,
} from "../../services/calendar.service.js";

export const calendarToolDeclarations = [
  {
    name: "check_calendar_connection",
    description: "Checks whether Google Calendar is connected or internal calendar is in use.",
    parameters: {
      type: "OBJECT",
      properties: {},
    },
  },
  {
    name: "get_calendar_events",
    description: "Retrieves calendar events and commitments within a date range to inspect availability and schedule constraints.",
    parameters: {
      type: "OBJECT",
      properties: {
        startTime: { type: "STRING", description: "Start of window in ISO format (YYYY-MM-DDTHH:mm:ssZ)" },
        endTime: { type: "STRING", description: "End of window in ISO format (YYYY-MM-DDTHH:mm:ssZ)" },
      },
    },
  },
  {
    name: "find_available_slots",
    description: "Calculates available, unoccupied time slots of requested duration between startDate and endDate.",
    parameters: {
      type: "OBJECT",
      properties: {
        startDate: { type: "STRING", description: "Start date/time in ISO format" },
        endDate: { type: "STRING", description: "End date/time in ISO format" },
        durationMinutes: { type: "NUMBER", description: "Required study block duration in minutes (e.g. 45, 60, 90)" },
      },
      required: ["startDate", "endDate", "durationMinutes"],
    },
  },
  {
    name: "create_calendar_event",
    description: "Schedules a study block or commitment on the student's calendar (Google Calendar if connected). Automatically checks for conflicts.",
    parameters: {
      type: "OBJECT",
      properties: {
        title: { type: "STRING", description: "Event title (e.g. 'DBMS — Normalization Study Block')" },
        startTime: { type: "STRING", description: "Start time in ISO format" },
        endTime: { type: "STRING", description: "End time in ISO format" },
        description: { type: "STRING", description: "Event description with study topics or objectives" },
        type: {
          type: "STRING",
          enum: ["study", "class", "exam", "assignment", "personal", "other"],
        },
        taskId: { type: "STRING", description: "Associated Task ID if scheduling an existing task" },
      },
      required: ["title", "startTime", "endTime"],
    },
  },
  {
    name: "update_calendar_event",
    description: "Reschedules or updates an existing calendar event. Keeps linked tasks synchronized.",
    parameters: {
      type: "OBJECT",
      properties: {
        eventId: { type: "STRING", description: "ID of the calendar event to update" },
        title: { type: "STRING" },
        startTime: { type: "STRING", description: "New start time in ISO format" },
        endTime: { type: "STRING", description: "New end time in ISO format" },
        description: { type: "STRING" },
        type: {
          type: "STRING",
          enum: ["study", "class", "exam", "assignment", "personal", "other"],
        },
      },
      required: ["eventId"],
    },
  },
  {
    name: "delete_calendar_event",
    description: "Cancels or removes a Lenora-created calendar event. Note: External events cannot be deleted.",
    parameters: {
      type: "OBJECT",
      properties: {
        eventId: { type: "STRING", description: "ID of the calendar event to remove" },
      },
      required: ["eventId"],
    },
  },
  {
    name: "check_time_conflicts",
    description: "Checks whether a proposed time slot conflicts with existing commitments.",
    parameters: {
      type: "OBJECT",
      properties: {
        startTime: { type: "STRING", description: "Proposed start time in ISO format" },
        endTime: { type: "STRING", description: "Proposed end time in ISO format" },
      },
      required: ["startTime", "endTime"],
    },
  },
];

export async function executeCalendarTool(
  userId: string,
  name: string,
  args: Record<string, unknown>
) {
  try {
    if (name === "check_calendar_connection") {
      const status = await getCalendarStatus(userId);
      return {
        success: true,
        ...status,
      };
    }

    if (name === "get_calendar_events") {
      const events = await getEvents(
        userId,
        args.startTime as string | undefined,
        args.endTime as string | undefined
      );
      return {
        success: true,
        count: events.length,
        events: events.map((e) => ({
          id: e.id,
          title: e.title,
          start: e.startTime instanceof Date ? e.startTime.toISOString() : String(e.startTime),
          end: e.endTime instanceof Date ? e.endTime.toISOString() : String(e.endTime),
          source: e.source,
          status: e.status,
          type: e.type,
          taskId: e.taskId,
        })),
      };
    }

    if (name === "find_available_slots") {
      const startDate = String(args.startDate || "").trim();
      const endDate = String(args.endDate || "").trim();
      const durationMinutes = Number(args.durationMinutes) || 60;

      const slots = await findAvailableSlots(userId, startDate, endDate, durationMinutes);
      return {
        success: true,
        count: slots.length,
        slots: slots.map((s) => ({
          start: s.start.toISOString(),
          end: s.end.toISOString(),
          durationMinutes,
        })),
      };
    }

    if (name === "create_calendar_event") {
      const res = await createEvent(userId, args as unknown as CreateCalendarEventInput);
      const startStr = res.event.startTime instanceof Date ? res.event.startTime.toISOString() : String(res.event.startTime);
      const endStr = res.event.endTime instanceof Date ? res.event.endTime.toISOString() : String(res.event.endTime);

      return {
        success: true,
        event: {
          id: res.event.id,
          title: res.event.title,
          start: startStr,
          end: endStr,
          provider: res.event.provider,
          source: res.event.source,
        },
        hasConflicts: (res.conflicts || []).length > 0,
        conflicts: res.conflicts || [],
        message: `Calendar event "${res.event.title}" scheduled (${startStr} to ${endStr})${
          res.conflicts?.length ? ` (Note: ${res.conflicts.length} overlapping slot detected)` : ""
        }`,
      };
    }

    if (name === "update_calendar_event") {
      const eventId = String(args.eventId || "").trim();
      if (!eventId) {
        return { success: false, error: "eventId is required for update_calendar_event." };
      }

      const { eventId: _, ...data } = args;
      const res = await updateEvent(userId, eventId, data as UpdateCalendarEventInput);
      return {
        success: true,
        event: {
          id: res.id,
          title: res.title,
          start: res.startTime instanceof Date ? res.startTime.toISOString() : String(res.startTime),
          end: res.endTime instanceof Date ? res.endTime.toISOString() : String(res.endTime),
        },
        message: `Calendar event "${res.title}" updated successfully`,
      };
    }

    if (name === "delete_calendar_event") {
      const eventId = String(args.eventId || "").trim();
      if (!eventId) {
        return { success: false, error: "eventId is required for delete_calendar_event." };
      }

      await deleteEvent(userId, eventId);
      return {
        success: true,
        message: `Calendar event removed successfully`,
      };
    }

    if (name === "check_time_conflicts") {
      const startTime = String(args.startTime || "").trim();
      const endTime = String(args.endTime || "").trim();

      if (!startTime || !endTime) {
        return { success: false, error: "startTime and endTime are required to check conflicts." };
      }

      const conflicts = await findConflicts(userId, startTime, endTime);
      return {
        success: true,
        hasConflicts: conflicts.length > 0,
        conflicts: conflicts.map((c) => ({
          id: c.id,
          title: c.title,
          startTime: c.startTime,
          endTime: c.endTime,
          source: c.source,
        })),
      };
    }

    return { success: false, error: `Unknown calendar tool: ${name}` };
  } catch (err: any) {
    if (err.code === "EXTERNAL_EVENT_PROTECTED") {
      return {
        success: false,
        code: "EXTERNAL_EVENT_PROTECTED",
        error: "This event is an external calendar event (e.g. personal appointment or lecture). Lenora protects external events from automatic deletion.",
      };
    }

    if (err.code === "CALENDAR_REAUTH_REQUIRED") {
      return {
        success: false,
        code: "CALENDAR_REAUTH_REQUIRED",
        error: "Google Calendar authorization has expired or was revoked. Please ask the user to reconnect Google Calendar in the Calendar tab.",
      };
    }

    return {
      success: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}
