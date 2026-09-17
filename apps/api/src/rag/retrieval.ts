import { Types } from "mongoose";
import { env } from "../config/env.js";
import { DocumentChunk } from "../models/DocumentChunk.js";
import { generateQueryEmbedding } from "./embeddings.js";

export interface RetrievedChunk {
  _id: unknown;
  content: string;
  documentId: unknown;
  metadata?: Record<string, unknown>;
  score?: number;
}

/**
 * Computes standard cosine similarity between two equal-length numeric vectors.
 */
function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (!vecA?.length || !vecB?.length || vecA.length !== vecB.length) return 0;
  let dot = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dot += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Retrieves the most relevant document chunks for a given query and user.
 * Tries native Atlas $vectorSearch first, with an automatic in-memory cosine fallback.
 */
export async function retrieveRelevantChunks(
  userId: string,
  query: string,
  topK = 5
): Promise<RetrievedChunk[]> {
  const userObjectId = new Types.ObjectId(userId);
  const queryVector = await generateQueryEmbedding(query);

  // 1. Primary: Native Atlas $vectorSearch with in-index filter
  try {
    const atlasResults = await DocumentChunk.aggregate([
      {
        $vectorSearch: {
          index: env.MONGODB_VECTOR_INDEX,
          path: "embedding",
          queryVector,
          numCandidates: Math.max(100, topK * 20),
          limit: topK,
          filter: { userId: userObjectId },
        },
      },
      {
        $project: {
          content: 1,
          documentId: 1,
          metadata: 1,
          score: { $meta: "vectorSearchScore" },
        },
      },
    ]);

    if (atlasResults.length > 0) {
      return atlasResults;
    }
  } catch {
    // Atlas in-index filter may not be configured yet; fallback continues
  }

  // 2. Secondary: Atlas $vectorSearch + post-query $match
  try {
    const atlasFallback = await DocumentChunk.aggregate([
      {
        $vectorSearch: {
          index: env.MONGODB_VECTOR_INDEX,
          path: "embedding",
          queryVector,
          numCandidates: Math.max(150, topK * 30),
          limit: topK * 4,
        },
      },
      {
        $match: {
          userId: userObjectId,
        },
      },
      {
        $limit: topK,
      },
      {
        $project: {
          content: 1,
          documentId: 1,
          metadata: 1,
          score: { $meta: "vectorSearchScore" },
        },
      },
    ]);

    if (atlasFallback.length > 0) {
      return atlasFallback;
    }
  } catch {
    // Index building or name mismatch; local fallback below handles this reliably
  }

  // 3. Fallback: Exact Cosine Similarity scoring across user chunks
  const userChunks = await DocumentChunk.find({ userId: userObjectId }).select("+embedding").lean();
  if (!userChunks.length) return [];

  const scored = userChunks.map((chunk) => ({
    _id: chunk._id,
    content: chunk.content,
    documentId: chunk.documentId,
    metadata: chunk.metadata as Record<string, unknown>,
    score: cosineSimilarity(queryVector, chunk.embedding),
  }));

  scored.sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
  return scored.slice(0, topK);
}
