import { Schema, model, Types, Document } from "mongoose";

export type EventType =
  | "GOAL_CREATED"
  | "GOAL_UPDATED"
  | "TASK_CREATED"
  | "TASK_COMPLETED"
  | "TASK_MISSED"
  | "TASK_RESCHEDULED"
  | "ASSESSMENT_STARTED"
  | "ASSESSMENT_COMPLETED"
  | "KNOWLEDGE_STATE_UPDATED"
  | "LEARNING_SESSION_COMPLETED"
  | "DOCUMENT_UPLOADED"
  | "PLAN_UPDATED"
  | "CALENDAR_CHANGED"
  | "USER_PREFERENCE_CHANGED";

export type EventSource =
  | "user"
  | "planner"
  | "feynman"
  | "learner"
  | "system"
  | "calendar";

export type EventStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed"
  | "ignored";

export interface IStudentEvent extends Document {
  userId: Types.ObjectId;
  type: EventType;
  source: EventSource;
  entityType?: "task" | "goal" | "topic" | "assessment" | "calendar" | "document" | "session";
  entityId?: string;
  metadata: Record<string, unknown>;
  correlationId: string;
  depth: number;
  status: EventStatus;
  error?: string;
  processedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const StudentEventSchema = new Schema(
  {
    userId: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      required: true,
      index: true,
    },
    source: {
      type: String,
      enum: ["user", "planner", "feynman", "learner", "system", "calendar"],
      required: true,
    },
    entityType: {
      type: String,
      enum: ["task", "goal", "topic", "assessment", "calendar", "document", "session"],
    },
    entityId: {
      type: String,
      trim: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: () => ({}),
    },
    correlationId: {
      type: String,
      required: true,
      index: true,
    },
    depth: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["pending", "processing", "completed", "failed", "ignored"],
      default: "pending",
      index: true,
    },
    error: {
      type: String,
    },
    processedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

StudentEventSchema.index({ status: 1, createdAt: 1 });
StudentEventSchema.index({ userId: 1, createdAt: -1 });

export const StudentEvent = model<IStudentEvent>("StudentEvent", StudentEventSchema);
