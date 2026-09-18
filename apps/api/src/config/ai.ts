import { GoogleGenAI } from "@google/genai";
import { env } from "./env.js";

export const ai = new GoogleGenAI({ apiKey: env.GOOGLE_GENAI_API_KEY });

export interface LLMUsage {
  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
}

/**
 * Returns prioritized candidate models based on task requirements and environment config.
 */
export function getModelCandidates(tier: "fast" | "reasoning" = "reasoning"): string[] {
  const primaryModel = tier === "fast" ? env.FAST_MODEL : env.REASONING_MODEL;
  const fallbacks = [
    primaryModel,
    env.GOOGLE_GENERATION_MODEL,
    "gemini-3.6-flash",
    "gemini-3.5-flash-lite",
    "gemini-3.5-flash",
    "gemini-3.1-flash-lite",
  ].filter((m, i, arr): m is string => Boolean(m) && arr.indexOf(m) === i);

  return fallbacks;
}


/**
 * Extracts token usage metadata safely from Google GenAI responses.
 */
export function extractTokenUsage(response: unknown): LLMUsage | undefined {
  if (!response || typeof response !== "object") return undefined;
  const resp = response as {
    usageMetadata?: {
      promptTokenCount?: number;
      candidatesTokenCount?: number;
      totalTokenCount?: number;
    };
  };

  if (!resp.usageMetadata) return undefined;
  return {
    inputTokens: resp.usageMetadata.promptTokenCount,
    outputTokens: resp.usageMetadata.candidatesTokenCount,
    totalTokens: resp.usageMetadata.totalTokenCount,
  };
}

