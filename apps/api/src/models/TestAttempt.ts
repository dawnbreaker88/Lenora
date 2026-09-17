import { Schema, model, Types, Document } from "mongoose";

export interface ITestAnswer {
  questionId: string;
  answer: string;
}

export interface IQuestionEvaluation {
  questionId: string;
  correct: boolean;
  score: number; // 0 to 1
  concept: string;
  reasoning: string;
  misconceptions: string[];
}

export interface IConceptAssessment {
  concept: string;
  mastery: number; // 0 to 1
  status: "weak" | "proficient" | "strong";
}

export interface ITestAssessment {
  overallScore: number; // 0 to 100
  questions: IQuestionEvaluation[];
  conceptAssessment: IConceptAssessment[];
  misconceptions: string[];
  feedbackSummary?: string;
}

export interface ITestAttempt extends Document {
  testId: Types.ObjectId;
  userId: Types.ObjectId;
  answers: ITestAnswer[];
  assessment: ITestAssessment;
  submittedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const TestAttemptSchema = new Schema(
  {
    testId: {
      type: Types.ObjectId,
      ref: "Test",
      required: true,
      index: true,
    },
    userId: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    answers: [
      {
        questionId: { type: String, required: true },
        answer: { type: String, required: true },
      },
    ],
    assessment: {
      overallScore: { type: Number, required: true, min: 0, max: 100 },
      questions: [
        {
          questionId: { type: String, required: true },
          correct: { type: Boolean, required: true },
          score: { type: Number, required: true, min: 0, max: 1 },
          concept: { type: String, required: true },
          reasoning: { type: String, required: true },
          misconceptions: [{ type: String }],
        },
      ],
      conceptAssessment: [
        {
          concept: { type: String, required: true },
          mastery: { type: Number, required: true, min: 0, max: 1 },
          status: {
            type: String,
            enum: ["weak", "proficient", "strong"],
            required: true,
          },
        },
      ],
      misconceptions: [{ type: String }],
      feedbackSummary: { type: String },
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

TestAttemptSchema.index({ userId: 1, testId: 1 });

export const TestAttempt = model<ITestAttempt>(
  "TestAttempt",
  TestAttemptSchema
);
