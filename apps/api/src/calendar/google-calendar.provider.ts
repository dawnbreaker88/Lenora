import { google, type calendar_v3 } from "googleapis";
import type { OAuth2Client } from "google-auth-library";
import type {
  CalendarProvider,
  CalendarEventDTO,
  CreateCalendarEventInput,
  UpdateCalendarEventInput,
} from "./calendar.provider.js";

export class GoogleCalendarProvider implements CalendarProvider {
  readonly providerName = "google" as const;
  private calendar: calendar_v3.Calendar;

  constructor(
    private readonly userId: string,
    private readonly auth: OAuth2Client,
    private readonly calendarId: string = "primary",
    private readonly timezone: string = "Asia/Kolkata"
  ) {
    this.calendar = google.calendar({ version: "v3", auth: this.auth });
  }

  async getEvents(start?: Date, end?: Date): Promise<CalendarEventDTO[]> {
    try {
      const response = await this.calendar.events.list({
        calendarId: this.calendarId,
        timeMin: start ? start.toISOString() : undefined,
        timeMax: end ? end.toISOString() : undefined,
        singleEvents: true,
        orderBy: "startTime",
        maxResults: 250,
      });

      const items = response.data.items || [];

      return items.map((item) => {
        const startRaw = item.start?.dateTime || item.start?.date;
        const endRaw = item.end?.dateTime || item.end?.date;
        const startTime = startRaw ? new Date(startRaw) : new Date();
        const endTime = endRaw ? new Date(endRaw) : new Date(startTime.getTime() + 3600000);

        const isLenoraManaged =
          item.extendedProperties?.private?.source === "lenora" ||
          (item.description && item.description.includes("[Lenora]"));

        const taskId = item.extendedProperties?.private?.taskId;
        const eventType = item.extendedProperties?.private?.type as any;

        return {
          id: item.id || `google_${Date.now()}`,
          externalId: item.id || undefined,
          calendarId: this.calendarId,
          provider: "google",
          title: item.summary || "Untitled Event",
          description: item.description || undefined,
          startTime,
          endTime,
          status: (item.status as "confirmed" | "tentative" | "cancelled") || "confirmed",
          source: isLenoraManaged ? "lenora" : "external",
          type: eventType || "study",
          taskId: taskId || undefined,
          createdAt: item.created ? new Date(item.created) : undefined,
          updatedAt: item.updated ? new Date(item.updated) : undefined,
        };
      });
    } catch (error: any) {
      this.handleGoogleError(error);
      throw error;
    }
  }

  async createEvent(input: CreateCalendarEventInput): Promise<CalendarEventDTO> {
    try {
      const startTime = new Date(input.startTime);
      const endTime = new Date(input.endTime);

      const descSuffix = "\n\n[Lenora Scheduled Session]";
      const description = input.description
        ? `${input.description}${descSuffix}`
        : descSuffix.trim();

      const response = await this.calendar.events.insert({
        calendarId: this.calendarId,
        requestBody: {
          summary: input.title.trim(),
          description,
          start: {
            dateTime: startTime.toISOString(),
            timeZone: this.timezone,
          },
          end: {
            dateTime: endTime.toISOString(),
            timeZone: this.timezone,
          },
          extendedProperties: {
            private: {
              source: "lenora",
              taskId: input.taskId || "",
              type: input.type || "study",
            },
          },
        },
      });

      const item = response.data;
      return {
        id: item.id || `google_${Date.now()}`,
        externalId: item.id || undefined,
        calendarId: this.calendarId,
        provider: "google",
        title: item.summary || input.title,
        description: item.description || input.description,
        startTime,
        endTime,
        status: "confirmed",
        source: "lenora",
        type: input.type || "study",
        taskId: input.taskId,
        createdAt: item.created ? new Date(item.created) : new Date(),
        updatedAt: item.updated ? new Date(item.updated) : new Date(),
      };
    } catch (error: any) {
      this.handleGoogleError(error);
      throw error;
    }
  }

  async updateEvent(eventId: string, input: UpdateCalendarEventInput): Promise<CalendarEventDTO> {
    try {
      const requestBody: calendar_v3.Schema$Event = {};

      if (input.title !== undefined) {
        requestBody.summary = input.title.trim();
      }

      if (input.description !== undefined) {
        requestBody.description = `${input.description}\n\n[Lenora Scheduled Session]`;
      }

      if (input.startTime !== undefined) {
        requestBody.start = {
          dateTime: new Date(input.startTime).toISOString(),
          timeZone: this.timezone,
        };
      }

      if (input.endTime !== undefined) {
        requestBody.end = {
          dateTime: new Date(input.endTime).toISOString(),
          timeZone: this.timezone,
        };
      }

      const response = await this.calendar.events.patch({
        calendarId: this.calendarId,
        eventId,
        requestBody,
      });

      const item = response.data;
      const startRaw = item.start?.dateTime || item.start?.date;
      const endRaw = item.end?.dateTime || item.end?.date;

      return {
        id: item.id || eventId,
        externalId: item.id || eventId,
        calendarId: this.calendarId,
        provider: "google",
        title: item.summary || "",
        description: item.description || undefined,
        startTime: startRaw ? new Date(startRaw) : new Date(),
        endTime: endRaw ? new Date(endRaw) : new Date(),
        status: (item.status as "confirmed" | "tentative" | "cancelled") || "confirmed",
        source: "lenora",
        type: input.type || "study",
        taskId: input.taskId,
        createdAt: item.created ? new Date(item.created) : undefined,
        updatedAt: item.updated ? new Date(item.updated) : undefined,
      };
    } catch (error: any) {
      this.handleGoogleError(error);
      throw error;
    }
  }

  async deleteEvent(eventId: string): Promise<void> {
    try {
      await this.calendar.events.delete({
        calendarId: this.calendarId,
        eventId,
      });
    } catch (error: any) {
      this.handleGoogleError(error);
      throw error;
    }
  }

  private handleGoogleError(error: any): void {
    const status = error.status || error.code || error.response?.status;
    const message = error.message || "";

    if (status === 401 || message.includes("invalid_grant") || message.includes("No access, refresh token")) {
      const err = new Error("Google Calendar authorization expired or revoked. Please reconnect Google Calendar.");
      (err as any).code = "CALENDAR_REAUTH_REQUIRED";
      throw err;
    }

    if (status === 404) {
      const err = new Error(`Calendar event not found in Google Calendar`);
      (err as any).code = "CALENDAR_EVENT_NOT_FOUND";
      throw err;
    }
  }
}
