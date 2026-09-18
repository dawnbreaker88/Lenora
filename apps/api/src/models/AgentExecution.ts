import { Schema, model, Types, Document } from "mongoose";

export interface IAgentExecutionAction {
  type: string;
  entityId?: string;
  label: string;
  details?: unknown;
}

export interface IAgentExecution extends Document {
  userId: Types.ObjectId;
  agentType: "planner" | "feynman" | "learner";
  triggerEventId?: Types.ObjectId;
  correlationId: string;
  status: "success" | "failed";
  startedAt: Date;
  completedAt: Date;
  actions: IAgentExecutionAction[];
  error?: string;
}

const AgentExecutionSchema = new Schema(
  {
    userId: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    agentType: {
      type: String,
      enum: ["planner", "feynman", "learner"],
      required: true,
      index: true,
    },
    triggerEventId: {
      type: Types.ObjectId,
      ref: "StudentEvent",
      index: true,
    },
    correlationId: {
      type: String,
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["success", "failed"],
      required: true,
    },
    startedAt: {
      type: Date,
      required: true,
    },
    completedAt: {
      type: Date,
      required: true,
    },
    actions: {
      type: [
        {
          type: { type: String, required: true },
          entityId: { type: String },
          label: { type: String, required: true },
          details: { type: Schema.Types.Mixed },
        },
      ],
      default: [],
    },
    error: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

AgentExecutionSchema.index({ userId: 1, createdAt: -1 });

export const AgentExecution = model<IAgentExecution>("AgentExecution", AgentExecutionSchema);
