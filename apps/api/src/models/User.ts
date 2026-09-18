import { Schema, model, Types } from "mongoose";

const UserSchema = new Schema(
  {
    googleId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    image: {
      type: String,
    },

    timezone: {
      type: String,
      default: "Asia/Kolkata",
    },

    preferences: {
      dailyStudyMinutes: {
        type: Number,
        default: 120,
      },

      preferredStudyStart: {
        type: String,
        default: "18:00",
      },

      preferredStudyEnd: {
        type: String,
        default: "23:00",
      },

      sessionLengthMinutes: {
        type: Number,
        default: 50,
      },

      breakLengthMinutes: {
        type: Number,
        default: 10,
      },

      learningStyle: {
        type: String,
        enum: [
          "visual",
          "reading",
          "practice",
          "mixed",
          "unknown",
        ],
        default: "unknown",
      },

      feynmanInstructions: {
        type: String,
        default: "",
      },

      availableSlots: [
        {
          day: {
            type: String,
            default: "all",
          },
          startTime: {
            type: String,
            default: "14:00",
          },
          endTime: {
            type: String,
            default: "18:00",
          },
          label: {
            type: String,
            default: "Study Window",
          },
        },
      ],
    },

    onboardingCompleted: {
      type: Boolean,
      default: false,
    },

    googleCalendar: {
      connected: {
        type: Boolean,
        default: false,
      },
      refreshToken: {
        type: String,
        select: false,
      },
      accessToken: {
        type: String,
        select: false,
      },
      expiryDate: {
        type: Number,
        select: false,
      },
      calendarId: {
        type: String,
        default: "primary",
      },
      scopes: [{
        type: String,
      }],
      connectedAt: {
        type: Date,
      },
      updatedAt: {
        type: Date,
      },
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

export const User = model("User", UserSchema);