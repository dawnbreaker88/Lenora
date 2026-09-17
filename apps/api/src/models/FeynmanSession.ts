import { Schema, model, Types, Document } from "mongoose";

export interface IFeynmanMessage {
  role: "user" | "model";
  content: string;
  timestamp: Date;
}

export interface IFeynmanSession extends Document {
  userId: Types.ObjectId;
  topicId?: Types.ObjectId;
  goalId?: Types.ObjectId;
  taskId?: Types.ObjectId;
  messages: IFeynmanMessage[];
  status: "active" | "completed";
  startedAt: Date;
  lastInteractionAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const FeynmanSessionSchema = new Schema(
  {
    userId: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    topicId: {
      type: Types.ObjectId,
      ref: "Topic",
      index: true,
    },
    goalId: {
      type: Types.ObjectId,
      ref: "Goal",
    },
    taskId: {
      type: Types.ObjectId,
      ref: "Task",
    },
    messages: [
      {
        role: {
          type: String,
          enum: ["user", "model"],
          required: true,
        },
        content: {
          type: String,
          required: true,
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    status: {
      type: String,
      enum: ["active", "completed"],
      default: "active",
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    lastInteractionAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

FeynmanSessionSchema.index({ userId: 1, updatedAt: -1 });

export const FeynmanSession = model<IFeynmanSession>(
  "FeynmanSession",
  FeynmanSessionSchema
);
