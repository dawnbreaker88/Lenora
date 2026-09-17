import {
  createEvent,
  updateEvent,
  deleteEvent,
  getEvents,
  findConflicts,
  type CreateCalendarEventInput,
  type UpdateCalendarEventInput,
} from "../../services/calendar.service.js";

export const calendarToolDeclarations = [
  {
    name: "get_calendar_events",
    description: "Retrieves calendar events and commitments within a date range to check availability.",
    parameters: {
      type: "OBJECT",
      properties: {
        startTime: { type: "STRING", description: "Start of window in ISO format (YYYY-MM-DDTHH:mm:ssZ)" },
        endTime: { type: "STRING", description: "End of window in ISO format (YYYY-MM-DDTHH:mm:ssZ)" },
      },
    },
  },
  {
    name: "create_calendar_event",
    description: "Schedules a study block or commitment on the student's calendar, checking for conflicts.",
    parameters: {
      type: "OBJECT",
      properties: {
        title: { type: "STRING", description: "Event title (e.g. 'DBMS Study Session — Indexing')" },
        startTime: { type: "STRING", description: "Start time in ISO format" },
        endTime: { type: "STRING", description: "End time in ISO format" },
        description: { type: "STRING", description: "Event description" },
        type: {
          type: "STRING",
          enum: ["study", "class", "exam", "assignment", "personal", "other"],
        },
        taskId: { type: "STRING", description: "Associated Task ID if scheduling a specific task" },
      },
      required: ["title", "startTime", "endTime"],
    },
  },
  {
    name: "update_calendar_event",
    description: "Reschedules or updates an existing calendar event.",
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
    description: "Cancels/removes a calendar event.",
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
    if (name === "get_calendar_events") {
      const events = await getEvents(
        userId,
        args.startTime as string | undefined,
        args.endTime as string | undefined
      );
      return {
        success: true,
        count: events.length,
        events,
      };
    }

    if (name === "create_calendar_event") {
      const res = await createEvent(userId, args as unknown as CreateCalendarEventInput);
      const startStr = res.event.startTime instanceof Date ? res.event.startTime.toISOString() : String(res.event.startTime);
      const endStr = res.event.endTime instanceof Date ? res.event.endTime.toISOString() : String(res.event.endTime);

      if (res.isDuplicate) {
        return {
          success: true,
          event: res.event,
          isDuplicate: true,
          message: `Calendar event "${res.event.title}" already scheduled (${startStr} to ${endStr}); reused existing slot to prevent duplicates.`,
        };
      }

      return {
        success: true,
        event: res.event,
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
        event: res,
        message: `Calendar event "${res.title}" updated successfully`,
      };
    }

    if (name === "delete_calendar_event") {
      const eventId = String(args.eventId || "").trim();
      if (!eventId) {
        return { success: false, error: "eventId is required for delete_calendar_event." };
      }

      const res = await deleteEvent(userId, eventId);
      return {
        success: true,
        message: `Calendar event "${res.title}" removed successfully`,
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
          id: c._id.toString(),
          title: c.title,
          startTime: c.startTime,
          endTime: c.endTime,
        })),
      };
    }

    return { success: false, error: `Unknown calendar tool: ${name}` };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

