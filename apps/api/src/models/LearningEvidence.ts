import { Schema, model, Types, Document } from "mongoose";

export type EvidenceType =
  | "demonstrated_understanding"
  | "misconception"
  | "knowledge_gap"
  | "successful_application"
  | "failed_application"
  | "uncertainty";

export interface ILearningEvidence extends Document {
  userId: Types.ObjectId;
  topicId: Types.ObjectId;
  sessionId?: string;
  type: EvidenceType;
  description: string;
  confidence: number;
  source: "feynman" | "assessment" | "system";
  createdAt: Date;
  updatedAt: Date;
}

const LearningEvidenceSchema = new Schema(
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
      required: true,
      index: true,
    },
    sessionId: {
      type: String,
      index: true,
    },
    type: {
      type: String,
      enum: [
        "demonstrated_understanding",
        "misconception",
        "knowledge_gap",
        "successful_application",
        "failed_application",
        "uncertainty",
      ],
      required: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    confidence: {
      type: Number,
      min: 0,
      max: 1,
      default: 0.8,
    },
    source: {
      type: String,
      enum: ["feynman", "assessment", "system"],
      default: "feynman",
    },
  },
  {
    timestamps: true,
  }
);

LearningEvidenceSchema.index({ userId: 1, topicId: 1, createdAt: -1 });

export const LearningEvidence = model<ILearningEvidence>(
  "LearningEvidence",
  LearningEvidenceSchema
);
