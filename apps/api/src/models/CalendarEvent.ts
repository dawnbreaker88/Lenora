import { Schema, Types, model } from "mongoose";

const CalendarEventSchema = new Schema(
  {
    userId: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    taskId: {
      type: Types.ObjectId,
      ref: "Task",
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
    },
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
      required: true,
    },
    type: {
      type: String,
      enum: ["study", "class", "exam", "assignment", "personal", "other"],
      default: "study",
    },
    externalId: {
      type: String,
      index: true,
    },
    calendarId: {
      type: String,
      default: "primary",
    },
    status: {
      type: String,
      enum: ["confirmed", "tentative", "cancelled"],
      default: "confirmed",
    },
    source: {
      type: String,
      enum: ["internal", "google", "lenora", "external"],
      default: "internal",
    },
  },
  {
    timestamps: true,
  }
);

CalendarEventSchema.index({ userId: 1, startTime: 1, endTime: 1 });
CalendarEventSchema.index({ userId: 1, externalId: 1 });


export const CalendarEvent = model("CalendarEvent", CalendarEventSchema);
