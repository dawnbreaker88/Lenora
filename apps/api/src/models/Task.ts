import { Schema,Types,model } from "mongoose";

const TaskSchema = new Schema(
  {
    userId: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    goalId: {
      type: Types.ObjectId,
      ref: "Goal",
      index: true,
    },

    topicId: {
      type: Types.ObjectId,
      ref: "Topic",
      index: true,
    },

    title: {
      type: String,
      required: true,
    },

    description: {
      type: String,
    },

    type: {
      type: String,
      enum: [
        "study",
        "practice",
        "leetcode",
        "assignment",
        "application",
        "revision",
        "other",
      ],
      required: true,
    },

    status: {
      type: String,
      enum: [
        "todo",
        "in_progress",
        "completed",
        "skipped",
        "overdue",
      ],
      default: "todo",
    },

    priority: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium",
    },

    estimatedMinutes: {
      type: Number,
      required: true,
    },

    dueAt: {
      type: Date,
    },

    scheduledStart: {
      type: Date,
    },

    scheduledEnd: {
      type: Date,
    },

    completedAt: {
      type: Date,
    },

    source: {
      type: String,
      enum: ["user", "planner", "system"],
      default: "user",
    },

    calendarEventId: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

TaskSchema.index({ userId: 1, status: 1 });
TaskSchema.index({ userId: 1, dueAt: 1 });

export const Task = model("Task", TaskSchema);