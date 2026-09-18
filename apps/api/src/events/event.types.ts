import type { EventType, EventSource, EventStatus, IStudentEvent } from "../models/StudentEvent.js";

export { EventType, EventSource, EventStatus, IStudentEvent };

export const MAX_EVENT_DEPTH = 5;

export interface CreateEventInput {
  userId: string;
  type: EventType;
  source: EventSource;
  entityType?: "task" | "goal" | "topic" | "assessment" | "calendar" | "document" | "session";
  entityId?: string;
  metadata?: Record<string, unknown>;
  correlationId?: string;
  depth?: number;
}

export type RoutingAction = "deterministic" | "agent" | "none";

export interface EventRoutingDecision {
  action: RoutingAction;
  targetAgent?: "planner" | "feynman" | "learner";
  reason: string;
}

export interface UserActivityItem {
  id: string;
  type: EventType;
  title: string;
  description: string;
  source: EventSource;
  timestamp: string;
  metadata?: Record<string, unknown>;
}
