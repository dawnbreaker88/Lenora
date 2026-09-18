import { ai } from "../config/ai.js";
import { env } from "../config/env.js";

const EMBEDDING_MODELS = [
  env.GOOGLE_EMBEDDING_MODEL,
  "text-embedding-004",
  "gemini-embedding-2",
].filter(Boolean) as string[];

/**
 * Generates vector embeddings for a given text using Google Gemini Embedding Model with retry & fallback.
 */
async function embed(text: string): Promise<number[]> {
  let lastError: unknown = null;

  for (const model of EMBEDDING_MODELS) {
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const result = await ai.models.embedContent({
          model,
          contents: text,
          config: {
            outputDimensionality: env.GOOGLE_EMBEDDING_DIMENSIONS,
          },
        });

        const responseObj = result as unknown as {
          embedding?: { values?: number[] };
          embeddings?: Array<{ values?: number[] }>;
        };

        const values = responseObj.embeddings?.[0]?.values ?? responseObj.embedding?.values;
        if (values?.length) {
          return values;
        }
      } catch (err) {
        lastError = err;
        console.warn(`[EMBEDDING] Model ${model} attempt ${attempt} failed:`, (err as any)?.message || err);
        if (attempt < 3) {
          await new Promise((resolve) => setTimeout(resolve, attempt * 1000));
        }
      }
    }
  }

  throw lastError || new Error("Failed to generate embedding after multiple model fallbacks");
}

export const generateDocumentEmbedding = (text: string, title = "none"): Promise<number[]> =>
  embed(`title: ${title} | text: ${text}`);

export const generateQueryEmbedding = (query: string): Promise<number[]> =>
  embed(`task: question answering | query: ${query}`);

export const generateEmbeddings = async (texts: string[], title?: string): Promise<number[][]> => {
  // Execute sequentially or in small batches to avoid hitting socket connect timeout limits
  const results: number[][] = [];
  for (const text of texts) {
    const vector = await generateDocumentEmbedding(text, title);
    results.push(vector);
  }
  return results;
};

