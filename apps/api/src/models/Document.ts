import { model,Schema,Types } from "mongoose";

const DocumentSchema = new Schema(
  {
    userId: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    title: {
      type: String,
      required: true,
    },

    fileName: {
      type: String,
      required: true,
    },

    mimeType: {
      type: String,
      required: true,
    },

    size: {
      type: Number,
    },

    sourceType: {
      type: String,
      enum: [
        "pdf",
        "text",
        "markdown",
        "url",
        "other",
      ],
      required: true,
    },

    storageUrl: {
      type: String,
    },

    processingStatus: {
      type: String,
      enum: [
        "pending",
        "processing",
        "completed",
        "failed",
      ],
      default: "pending",
    },

    pageCount: {
      type: Number,
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

DocumentSchema.index({ userId: 1, createdAt: -1 });

export const Document = model(
  "Document",
  DocumentSchema
);