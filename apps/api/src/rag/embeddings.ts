import { ai } from "../config/ai.js";
import { env } from "../config/env.js";

/**
 * Generates vector embeddings for a given text using Google Gemini Embedding Model.
 */
async function embed(text: string): Promise<number[]> {
  const result = await ai.models.embedContent({
    model: env.GOOGLE_EMBEDDING_MODEL,
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
  if (!values?.length) {
    throw new Error("Gemini returned no embedding values");
  }

  return values;
}

export const generateDocumentEmbedding = (text: string, title = "none"): Promise<number[]> =>
  embed(`title: ${title} | text: ${text}`);

export const generateQueryEmbedding = (query: string): Promise<number[]> =>
  embed(`task: question answering | query: ${query}`);

export const generateEmbeddings = (texts: string[], title?: string): Promise<number[][]> =>
  Promise.all(texts.map((text) => generateDocumentEmbedding(text, title)));
