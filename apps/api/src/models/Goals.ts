
import { Schema, model, Types } from "mongoose";

const GoalSchema = new Schema(
  {
    userId: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
    },

    category: {
      type: String,
      enum: [
        "exam",
        "leetcode",
        "assignment",
        "career",
        "project",
        "personal",
        "other",
      ],
      required: true,
    },

    status: {
      type: String,
      enum: ["active", "completed", "paused", "cancelled"],
      default: "active",
    },

    priority: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium",
    },

    targetDate: {
      type: Date,
    },

    progress: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },

    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

GoalSchema.index({ userId: 1, status: 1 });

export const Goal = model("Goal", GoalSchema);