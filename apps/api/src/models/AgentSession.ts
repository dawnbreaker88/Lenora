import { Schema, model, Types, Document } from "mongoose";

export type AgentType = "planner" | "feynman";
export type SessionStatus = "active" | "completed" | "abandoned";

export interface IAgentMessage {
  role: "user" | "model";
  content: string;
  timestamp: Date;
  toolSummary?: string;
}

export interface IAgentSessionContext {
  topicId?: Types.ObjectId;
  topicName?: string;
  goalId?: Types.ObjectId;
  taskId?: Types.ObjectId;
  currentConcept?: string;
  learningStage?: string;
  relevantDocumentIds?: Types.ObjectId[];
  knownWeaknesses?: string[];
  recentEvidence?: Array<{ type: string; description: string }>;
  activeGoalIds?: Types.ObjectId[];
  relevantTaskIds?: Types.ObjectId[];
  planningHorizon?: string;
  lastPlanningAction?: string;
  cachedMaterialSummary?: string;
  extra?: Record<string, unknown>;
}

export interface IAgentSession extends Document {
  userId: Types.ObjectId;
  agentType: AgentType;
  status: SessionStatus;
  context: IAgentSessionContext;
  messages: IAgentMessage[];
  startedAt: Date;
  lastActiveAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const AgentSessionSchema = new Schema(
  {
    userId: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    agentType: {
      type: String,
      enum: ["planner", "feynman"],
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["active", "completed", "abandoned"],
      default: "active",
      index: true,
    },
    context: {
      topicId: { type: Types.ObjectId, ref: "Topic" },
      topicName: { type: String, trim: true },
      goalId: { type: Types.ObjectId, ref: "Goal" },
      taskId: { type: Types.ObjectId, ref: "Task" },
      currentConcept: { type: String, trim: true },
      learningStage: { type: String, trim: true },
      relevantDocumentIds: [{ type: Types.ObjectId, ref: "Document" }],
      knownWeaknesses: [{ type: String, trim: true }],
      recentEvidence: [
        {
          type: { type: String, required: true },
          description: { type: String, required: true },
        },
      ],
      activeGoalIds: [{ type: Types.ObjectId, ref: "Goal" }],
      relevantTaskIds: [{ type: Types.ObjectId, ref: "Task" }],
      planningHorizon: { type: String },
      lastPlanningAction: { type: String },
      cachedMaterialSummary: { type: String },
      extra: { type: Schema.Types.Mixed },
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
        toolSummary: {
          type: String,
        },
      },
    ],
    startedAt: {
      type: Date,
      default: Date.now,
    },
    lastActiveAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

AgentSessionSchema.index({ userId: 1, agentType: 1, updatedAt: -1 });

export const AgentSession = model<IAgentSession>("AgentSession", AgentSessionSchema);
