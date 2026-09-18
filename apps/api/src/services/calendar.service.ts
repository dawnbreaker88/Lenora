import { Types } from "mongoose";
import { google } from "googleapis";
import { env } from "../config/env.js";
import { User } from "../models/User.js";
import { Task } from "../models/Task.js";
import { CalendarEvent } from "../models/CalendarEvent.js";
import type {
  CalendarProvider,
  CalendarEventDTO,
  CreateCalendarEventInput,
  UpdateCalendarEventInput,
  TimeSlot,
} from "../calendar/calendar.provider.js";
import { InternalCalendarProvider } from "../calendar/internal-calendar.provider.js";
import { GoogleCalendarProvider } from "../calendar/google-calendar.provider.js";
import { EventService } from "../events/event.service.js";

export type { CreateCalendarEventInput, UpdateCalendarEventInput, CalendarEventDTO };

/**
 * Creates an OAuth2 client configured with application credentials.
 */
function createOAuth2Client() {
  if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) {
    throw new Error("GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET must be configured in environment");
  }
  return new google.auth.OAuth2(
    env.GOOGLE_CLIENT_ID,
    env.GOOGLE_CLIENT_SECRET,
    env.GOOGLE_CALENDAR_REDIRECT_URI
  );
}

/**
 * Obtains the appropriate calendar provider for the authenticated user.
 */
export async function getCalendarProviderForUser(userId: string): Promise<CalendarProvider> {
  const user = await User.findById(userId)
    .select("+googleCalendar.refreshToken +googleCalendar.accessToken +googleCalendar.expiryDate")
    .lean();

  if (!user) {
    throw new Error("User not found");
  }

  if (
    user.googleCalendar?.connected &&
    (user.googleCalendar.refreshToken || user.googleCalendar.accessToken) &&
    env.GOOGLE_CLIENT_ID &&
    env.GOOGLE_CLIENT_SECRET
  ) {
    try {
      const oauth2Client = createOAuth2Client();

      oauth2Client.setCredentials({
        refresh_token: user.googleCalendar.refreshToken,
        access_token: user.googleCalendar.accessToken,
        expiry_date: user.googleCalendar.expiryDate,
      });

      // Handle automatic token refresh and persist back to database
      oauth2Client.on("tokens", async (newTokens) => {
        const updateData: Record<string, unknown> = {
          "googleCalendar.updatedAt": new Date(),
        };
        if (newTokens.access_token) {
          updateData["googleCalendar.accessToken"] = newTokens.access_token;
        }
        if (newTokens.expiry_date) {
          updateData["googleCalendar.expiryDate"] = newTokens.expiry_date;
        }
        if (newTokens.refresh_token) {
          updateData["googleCalendar.refreshToken"] = newTokens.refresh_token;
        }
        await User.findByIdAndUpdate(userId, { $set: updateData });
      });

      return new GoogleCalendarProvider(
        userId,
        oauth2Client,
        user.googleCalendar.calendarId || "primary",
        user.timezone || "Asia/Kolkata"
      );
    } catch (err) {
      console.warn(`Failed to initialize GoogleCalendarProvider for user ${userId}, falling back to InternalCalendarProvider:`, err);
    }
  }

  return new InternalCalendarProvider(userId);
}

/**
 * Checks for overlapping events for a given user in a proposed time window.
 */
export async function findConflicts(
  userId: string,
  startTime: Date | string,
  endTime: Date | string,
  excludeEventId?: string
): Promise<CalendarEventDTO[]> {
  const start = new Date(startTime);
  const end = new Date(endTime);

  const provider = await getCalendarProviderForUser(userId);
  const events = await provider.getEvents(start, end);

  return events.filter((e) => {
    if (excludeEventId && (e.id === excludeEventId || e.externalId === excludeEventId)) {
      return false;
    }
    const eStart = new Date(e.startTime);
    const eEnd = new Date(e.endTime);
    return eStart < end && eEnd > start;
  });
}

/**
 * Retrieves calendar events in an optional date window, normalized across providers.
 */
export async function getEvents(
  userId: string,
  start?: Date | string,
  end?: Date | string
): Promise<CalendarEventDTO[]> {
  const startDate = start ? new Date(start) : undefined;
  const endDate = end ? new Date(end) : undefined;

  const provider = await getCalendarProviderForUser(userId);
  return provider.getEvents(startDate, endDate);
}

/**
 * Computes available study slots between startDate and endDate.
 */
export async function findAvailableSlots(
  userId: string,
  startDate: Date | string,
  endDate: Date | string,
  durationMinutes: number = 60,
  preferredTimeRanges?: Array<{ start: string; end: string }>
): Promise<TimeSlot[]> {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const durationMs = durationMinutes * 60 * 1000;

  if (isNaN(start.getTime()) || isNaN(end.getTime()) || end <= start) {
    throw new Error("Invalid start or end date format");
  }

  const user = await User.findById(userId).lean();
  const prefStart = preferredTimeRanges?.[0]?.start || user?.preferences?.preferredStudyStart || "09:00";
  const prefEnd = preferredTimeRanges?.[0]?.end || user?.preferences?.preferredStudyEnd || "22:00";

  const [startHour, startMin] = prefStart.split(":").map(Number);
  const [endHour, endMin] = prefEnd.split(":").map(Number);

  // Get all events for the entire date span
  const provider = await getCalendarProviderForUser(userId);
  const events = await provider.getEvents(start, end);

  const availableSlots: TimeSlot[] = [];

  // Iterate day by day from start to end
  const currentDay = new Date(start);
  currentDay.setHours(0, 0, 0, 0);

  const finalDay = new Date(end);
  finalDay.setHours(23, 59, 59, 999);

  while (currentDay <= finalDay) {
    const windowStart = new Date(currentDay);
    windowStart.setHours(startHour, startMin, 0, 0);

    const windowEnd = new Date(currentDay);
    windowEnd.setHours(endHour, endMin, 0, 0);

    // Filter events for this specific day window
    const dayEvents = events
      .filter((e) => {
        const eStart = new Date(e.startTime);
        const eEnd = new Date(e.endTime);
        return eStart < windowEnd && eEnd > windowStart;
      })
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

    let cursor = Math.max(windowStart.getTime(), start.getTime());
    const effectiveWindowEnd = Math.min(windowEnd.getTime(), end.getTime());

    for (const evt of dayEvents) {
      const eStart = new Date(evt.startTime).getTime();
      const eEnd = new Date(evt.endTime).getTime();

      if (eStart > cursor) {
        const gap = eStart - cursor;
        if (gap >= durationMs) {
          availableSlots.push({
            start: new Date(cursor),
            end: new Date(cursor + durationMs),
          });
        }
      }
      if (eEnd > cursor) {
        cursor = eEnd;
      }
    }

    if (effectiveWindowEnd - cursor >= durationMs) {
      availableSlots.push({
        start: new Date(cursor),
        end: new Date(cursor + durationMs),
      });
    }

    // Move to next calendar day
    currentDay.setDate(currentDay.getDate() + 1);
  }

  return availableSlots;
}

/**
 * Creates a new calendar event scoped to the authenticated user.
 */
export async function createEvent(
  userId: string,
  input: CreateCalendarEventInput
): Promise<{ event: CalendarEventDTO; conflicts: CalendarEventDTO[] }> {
  const start = new Date(input.startTime);
  const end = new Date(input.endTime);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    throw new Error("Invalid start or end date format");
  }

  if (end <= start) {
    throw new Error("End time must be after start time");
  }

  const conflicts = await findConflicts(userId, start, end);
  const provider = await getCalendarProviderForUser(userId);

  const event = await provider.createEvent(input);

  // If taskId was linked, synchronize task with calendar event ID
  if (input.taskId) {
    await Task.findOneAndUpdate(
      { _id: new Types.ObjectId(input.taskId), userId: new Types.ObjectId(userId) },
      {
        $set: {
          calendarEventId: event.id,
          scheduledStart: start,
          scheduledEnd: end,
        },
      }
    );
  }

  // If Google Calendar was used, maintain local copy in MongoDB for indexing and history
  if (provider.providerName === "google") {
    await CalendarEvent.findOneAndUpdate(
      {
        userId: new Types.ObjectId(userId),
        externalId: event.id,
      },
      {
        $set: {
          userId: new Types.ObjectId(userId),
          externalId: event.id,
          calendarId: event.calendarId,
          title: event.title,
          description: event.description,
          startTime: event.startTime,
          endTime: event.endTime,
          type: event.type || "study",
          source: "lenora",
          status: event.status,
          taskId: input.taskId ? new Types.ObjectId(input.taskId) : undefined,
        },
      },
      { upsert: true }
    );
  }

  EventService.emitEvent({
    userId,
    type: "CALENDAR_CHANGED",
    source: "calendar",
    entityType: "calendar",
    entityId: event.id,
    metadata: {
      title: event.title,
      startTime: event.startTime,
      endTime: event.endTime,
      hasConflicts: conflicts.length > 0,
      conflictCount: conflicts.length,
      summary: `Scheduled "${event.title}" (${new Date(event.startTime).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })})`,
    },
  }).catch((err) => console.warn("Failed to emit CALENDAR_CHANGED event:", err));

  return { event, conflicts };
}

/**
 * Updates an existing calendar event scoped to the user.
 */
export async function updateEvent(
  userId: string,
  eventId: string,
  input: UpdateCalendarEventInput
): Promise<CalendarEventDTO> {
  const provider = await getCalendarProviderForUser(userId);
  const updatedEvent = await provider.updateEvent(eventId, input);

  // Synchronize linked task if relevant
  if (input.startTime || input.endTime) {
    const updateTaskFields: Record<string, unknown> = {};
    if (input.startTime) updateTaskFields.scheduledStart = new Date(input.startTime);
    if (input.endTime) updateTaskFields.scheduledEnd = new Date(input.endTime);

    await Task.findOneAndUpdate(
      { calendarEventId: eventId, userId: new Types.ObjectId(userId) },
      { $set: updateTaskFields }
    );
  }

  // Update local MongoDB copy
  await CalendarEvent.findOneAndUpdate(
    {
      $or: [
        { externalId: eventId, userId: new Types.ObjectId(userId) },
        { _id: Types.ObjectId.isValid(eventId) ? new Types.ObjectId(eventId) : undefined, userId: new Types.ObjectId(userId) },
      ],
    },
    {
      $set: {
        title: updatedEvent.title,
        description: updatedEvent.description,
        startTime: updatedEvent.startTime,
        endTime: updatedEvent.endTime,
        type: updatedEvent.type || "study",
        status: updatedEvent.status,
      },
    }
  );

  EventService.emitEvent({
    userId,
    type: "CALENDAR_CHANGED",
    source: "calendar",
    entityType: "calendar",
    entityId: updatedEvent.id,
    metadata: {
      title: updatedEvent.title,
      startTime: updatedEvent.startTime,
      endTime: updatedEvent.endTime,
      summary: `Rescheduled "${updatedEvent.title}"`,
    },
  }).catch((err) => console.warn("Failed to emit CALENDAR_CHANGED event:", err));

  return updatedEvent;
}

/**
 * Deletes a calendar event with external event protection.
 */
export async function deleteEvent(userId: string, eventId: string): Promise<void> {
  const provider = await getCalendarProviderForUser(userId);

  // Verify external event protection
  const existingEvents = await provider.getEvents();
  const target = existingEvents.find((e) => e.id === eventId || e.externalId === eventId);

  if (target && target.source === "external") {
    const err = new Error("External calendar event protected. Planner cannot delete personal/external events.");
    (err as any).code = "EXTERNAL_EVENT_PROTECTED";
    throw err;
  }

  await provider.deleteEvent(eventId);

  // Unlink associated task
  await Task.findOneAndUpdate(
    { calendarEventId: eventId, userId: new Types.ObjectId(userId) },
    { $unset: { calendarEventId: 1, scheduledStart: 1, scheduledEnd: 1 } }
  );

  // Remove local MongoDB copy
  await CalendarEvent.findOneAndDelete({
    $or: [
      { externalId: eventId, userId: new Types.ObjectId(userId) },
      { _id: Types.ObjectId.isValid(eventId) ? new Types.ObjectId(eventId) : undefined, userId: new Types.ObjectId(userId) },
    ],
  });
}

/**
 * Returns the current Google Calendar connection status for the user.
 */
export async function getCalendarStatus(userId: string): Promise<{
  connected: boolean;
  provider: "google" | "internal";
  calendarName: string;
  connectedAt?: Date;
}> {
  const user = await User.findById(userId).lean();
  const isConnected = Boolean(user?.googleCalendar?.connected);

  return {
    connected: isConnected,
    provider: isConnected ? "google" : "internal",
    calendarName: isConnected ? "Primary Google Calendar" : "Internal Calendar",
    connectedAt: user?.googleCalendar?.connectedAt ? new Date(user.googleCalendar.connectedAt) : undefined,
  };
}

/**
 * Generates the Google OAuth authorization URL for Google Calendar access.
 */
export function generateGoogleCalendarAuthUrl(userId: string): string {
  const oauth2Client = createOAuth2Client();

  const scopes = [
    "https://www.googleapis.com/auth/calendar.events",
  ];

  // Encode state with userId
  const state = Buffer.from(JSON.stringify({ userId, timestamp: Date.now() })).toString("base64");

  return oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: scopes,
    state,
  });
}

/**
 * Handles OAuth callback, exchanges code for credentials, verifies calendar access, and marks connected.
 */
export async function handleGoogleCalendarCallback(
  code: string,
  state: string
): Promise<{ success: boolean; userId: string }> {
  let userId: string;

  try {
    const parsedState = JSON.parse(Buffer.from(state, "base64").toString("utf-8"));
    userId = parsedState.userId;
    if (!userId) throw new Error("Missing userId in OAuth state");
  } catch {
    throw new Error("Invalid OAuth state parameter");
  }

  const oauth2Client = createOAuth2Client();
  const { tokens } = await oauth2Client.getToken(code);

  if (!tokens.refresh_token && !tokens.access_token) {
    throw new Error("No tokens returned by Google authorization");
  }

  // Verify Calendar access
  oauth2Client.setCredentials(tokens);
  try {
    const calendar = google.calendar({ version: "v3", auth: oauth2Client });
    await calendar.events.list({ calendarId: "primary", maxResults: 1 });
  } catch (verifyErr) {
    console.warn("Calendar verify call warning:", verifyErr);
  }

  const updateData: Record<string, unknown> = {
    "googleCalendar.connected": true,
    "googleCalendar.calendarId": "primary",
    "googleCalendar.scopes": ["https://www.googleapis.com/auth/calendar.events"],
    "googleCalendar.connectedAt": new Date(),
    "googleCalendar.updatedAt": new Date(),
  };

  if (tokens.refresh_token) {
    updateData["googleCalendar.refreshToken"] = tokens.refresh_token;
  }
  if (tokens.access_token) {
    updateData["googleCalendar.accessToken"] = tokens.access_token;
  }
  if (tokens.expiry_date) {
    updateData["googleCalendar.expiryDate"] = tokens.expiry_date;
  }

  await User.findByIdAndUpdate(userId, { $set: updateData });

  return { success: true, userId };
}

/**
 * Disconnects Google Calendar from the user account.
 */
export async function disconnectGoogleCalendar(userId: string): Promise<void> {
  const user = await User.findById(userId)
    .select("+googleCalendar.refreshToken +googleCalendar.accessToken")
    .lean();

  if (user?.googleCalendar?.accessToken || user?.googleCalendar?.refreshToken) {
    try {
      const oauth2Client = createOAuth2Client();
      const tokenToRevoke = user.googleCalendar.accessToken || user.googleCalendar.refreshToken;
      if (tokenToRevoke) {
        await oauth2Client.revokeToken(tokenToRevoke);
      }
    } catch (err) {
      console.warn(`Token revocation warning for user ${userId}:`, err);
    }
  }

  await User.findByIdAndUpdate(userId, {
    $set: {
      "googleCalendar.connected": false,
      "googleCalendar.refreshToken": null,
      "googleCalendar.accessToken": null,
      "googleCalendar.expiryDate": null,
      "googleCalendar.updatedAt": new Date(),
    },
  });
}
