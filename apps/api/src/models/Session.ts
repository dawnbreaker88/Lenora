import { Schema,model,Types } from "mongoose";


const StudySessionSchema = new Schema(
  {
    userId: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    taskId: {
      type: Types.ObjectId,
      ref: "Task",
    },

    topicIds: [
      {
        type: Types.ObjectId,
        ref: "Topic",
      },
    ],

    startedAt: {
      type: Date,
      required: true,
    },

    endedAt: {
      type: Date,
    },

    plannedMinutes: {
      type: Number,
    },

    actualMinutes: {
      type: Number,
    },

    completionRate: {
      type: Number,
      min: 0,
      max: 1,
    },

    notes: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

StudySessionSchema.index({
  userId: 1,
  startedAt: -1,
});

export const StudySession = model(
  "StudySession",
  StudySessionSchema
);