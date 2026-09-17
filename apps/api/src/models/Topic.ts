import { Types,Schema,model } from "mongoose";

const TopicSchema = new Schema(
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

    name: {
      type: String,
      required: true,
    },

    subject: {
      type: String,
    },

    parentTopicId: {
      type: Types.ObjectId,
      ref: "Topic",
      default: null,
    },

    mastery: {
      type: Number,
      min: 0,
      max: 1,
      default: 0,
    },

    confidence: {
      type: Number,
      min: 0,
      max: 1,
      default: 0,
    },

    status: {
      type: String,
      enum: [
        "not_started",
        "learning",
        "weak",
        "proficient",
        "mastered",
      ],
      default: "not_started",
    },

    strengths: [
      {
        type: String,
      },
    ],

    weaknesses: [
      {
        type: String,
      },
    ],

    misconceptions: [
      {
        type: String,
      },
    ],

    lastAssessedAt: {
      type: Date,
    },

    lastStudiedAt: {
      type: Date,
    },

    assessmentCount: {
      type: Number,
      default: 0,
    },

    correctCount: {
      type: Number,
      default: 0,
    },

    incorrectCount: {
      type: Number,
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

TopicSchema.index({ userId: 1, name: 1 });

export const Topic = model("Topic", TopicSchema);