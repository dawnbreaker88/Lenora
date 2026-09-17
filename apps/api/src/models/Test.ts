import { Schema, model, Types, Document } from "mongoose";

export interface ITestQuestion {
  id: string;
  question: string;
  type: "mcq" | "short_answer";
  options?: string[];
  concept: string;
  difficulty: "easy" | "medium" | "hard";
  expectedAnswer: string;
}

export interface ITest extends Document {
  userId: Types.ObjectId;
  sessionId?: Types.ObjectId;
  topicId: Types.ObjectId;
  title: string;
  questions: ITestQuestion[];
  status: "active" | "completed";
  createdAt: Date;
  updatedAt: Date;
}

const TestQuestionSchema = new Schema(
  {
    id: {
      type: String,
      required: true,
    },
    question: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["mcq", "short_answer"],
      required: true,
    },
    options: [
      {
        type: String,
      },
    ],
    concept: {
      type: String,
      required: true,
    },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "medium",
    },
    expectedAnswer: {
      type: String,
      required: true,
    },
  },
  { _id: false }
);

const TestSchema = new Schema(
  {
    userId: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    sessionId: {
      type: Types.ObjectId,
      ref: "FeynmanSession",
    },
    topicId: {
      type: Types.ObjectId,
      ref: "Topic",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      default: "Topic Assessment",
    },
    questions: [TestQuestionSchema],
    status: {
      type: String,
      enum: ["active", "completed"],
      default: "active",
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

TestSchema.index({ userId: 1, topicId: 1, createdAt: -1 });

export const Test = model<ITest>("Test", TestSchema);
