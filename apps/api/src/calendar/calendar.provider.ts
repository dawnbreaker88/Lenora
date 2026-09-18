export interface CalendarEventDTO {
  id: string;
  externalId?: string;
  calendarId: string;
  provider: "google" | "internal";
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  status: "confirmed" | "tentative" | "cancelled";
  source: "lenora" | "external";
  type?: "study" | "class" | "exam" | "assignment" | "personal" | "other";
  taskId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface TimeSlot {
  start: Date;
  end: Date;
}

export interface CreateCalendarEventInput {
  title: string;
  startTime: Date | string;
  endTime: Date | string;
  description?: string;
  type?: "study" | "class" | "exam" | "assignment" | "personal" | "other";
  taskId?: string;
}

export interface UpdateCalendarEventInput {
  title?: string;
  startTime?: Date | string;
  endTime?: Date | string;
  description?: string;
  type?: "study" | "class" | "exam" | "assignment" | "personal" | "other";
  taskId?: string;
}

export interface CalendarProvider {
  readonly providerName: "google" | "internal";
  getEvents(start?: Date, end?: Date): Promise<CalendarEventDTO[]>;
  createEvent(input: CreateCalendarEventInput): Promise<CalendarEventDTO>;
  updateEvent(eventId: string, input: UpdateCalendarEventInput): Promise<CalendarEventDTO>;
  deleteEvent(eventId: string): Promise<void>;
}
