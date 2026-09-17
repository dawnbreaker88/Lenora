import { Schema,Types,model } from "mongoose";

const AssessmentSchema = new Schema(
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
    },

    topicIds: [
      {
        type: Types.ObjectId,
        ref: "Topic",
      },
    ],

    type: {
      type: String,
      enum: [
        "diagnostic",
        "practice",
        "revision",
        "exam",
      ],
      required: true,
    },

    questions: [
      {
        question: String,

        expectedAnswer: String,

        studentAnswer: String,

        isCorrect: Boolean,

        score: {
          type: Number,
          min: 0,
          max: 1,
        },

        feedback: String,

        misconception: String,

        topicId: {
          type: Types.ObjectId,
          ref: "Topic",
        },
      },
    ],

    score: {
      type: Number,
      min: 0,
      max: 1,
    },

    completedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

AssessmentSchema.index({ userId: 1, completedAt: -1 });

export const Assessment = model(
  "Assessment",
  AssessmentSchema
);