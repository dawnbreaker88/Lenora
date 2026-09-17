import { ai } from "../config/ai.js";
import { env } from "../config/env.js";
import { retrieveRelevantChunks, type RetrievedChunk } from "../rag/retrieval.js";

export interface AnswerResponse {
  query: string;
  answer: string;
  sources: RetrievedChunk[];
}

/**
 * Retrieves raw matching vector chunks for a student's query.
 */
export async function queryRag(userId: string, query: string, topK = 5): Promise<RetrievedChunk[]> {
  return retrieveRelevantChunks(userId, query, topK);
}

/**
 * Retrieves context chunks and uses Gemini 3.8 Flash to synthesize a grounded answer.
 */
export async function answerWithRag(userId: string, query: string, topK = 5): Promise<AnswerResponse> {
  const results = await retrieveRelevantChunks(userId, query, topK);

  if (!results.length) {
    return {
      query,
      answer: "No relevant documents or study materials found. Please upload learning materials first.",
      sources: [],
    };
  }

  const context = results
    .map(
      (r, i) =>
        `[Source ${i + 1} - Match: ${typeof r.score === "number" ? `${(r.score * 100).toFixed(1)}%` : "N/A"}]\n${r.content}`
    )
    .join("\n\n---\n\n");

  const prompt = `You are Lenora, an AI study assistant. Answer the student's question grounded strictly on their uploaded study materials provided in the CONTEXT below.
If the context does not contain enough information to answer, state clearly what is missing.

CONTEXT:
${context}

STUDENT QUESTION:
${query}

Provide a clear, accurate, and concise answer with references to the relevant parts of the context where applicable.`;

  const interaction = await ai.interactions.create({
    model: env.GOOGLE_GENERATION_MODEL,
    input: prompt,
    store: false,
  });

  return {
    query,
    answer: interaction.output_text ?? "Unable to generate answer.",
    sources: results,
  };
}
