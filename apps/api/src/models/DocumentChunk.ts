import { Types,model,Schema } from "mongoose";

const DocumentChunkSchema = new Schema(
  {
    userId: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    documentId: {
      type: Types.ObjectId,
      ref: "Document",
      required: true,
      index: true,
    },

    topicIds: [
      {
        type: Types.ObjectId,
        ref: "Topic",
      },
    ],

    content: {
      type: String,
      required: true,
    },

    embedding: {
      type: [Number],
      required: true,
    },

    chunkIndex: {
      type: Number,
      required: true,
    },

    metadata: {
      pageNumber: Number,

      sectionTitle: String,

      tokenCount: Number,

      source: String,
    },
  },
  {
    timestamps: true,
  }
);

DocumentChunkSchema.index({
  userId: 1,
  documentId: 1,
  chunkIndex: 1,
});

export const DocumentChunk = model(
  "DocumentChunk",
  DocumentChunkSchema
);