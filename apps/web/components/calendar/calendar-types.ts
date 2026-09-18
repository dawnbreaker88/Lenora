export type ViewType = "week" | "month";

export interface CalendarEventItem {
  _id?: string;
  id?: string;
  title: string;
  description?: string;
  startTime: string | Date;
  endTime: string | Date;
  type?: "study" | "class" | "exam" | "assignment" | "personal" | "practice" | "other";
  taskId?: string;
  priority?: "low" | "medium" | "high" | "critical";
  status?: "todo" | "in_progress" | "completed" | "skipped";
  source?: "internal" | "google" | "planner" | "lenora" | "external";
  provider?: "google" | "internal";
  estimatedMinutes?: number;
}

export interface WeekDay {
  date: Date;
  dayName: string;
  dayNumber: number;
  isToday: boolean;
}

export interface HourSlot {
  hour: number;
  label: string;
}
