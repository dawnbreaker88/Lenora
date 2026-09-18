import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  MONGODB_URI: z.string().min(1, "MONGODB_URI is required"),
  PORT: z.coerce.number().int().positive().default(4000),
  GOOGLE_GENAI_API_KEY: z.string().min(1, "GOOGLE_GENAI_API_KEY is required"),
  GOOGLE_EMBEDDING_MODEL: z.string().optional().transform((val) => (val && val.trim() ? val : "gemini-embedding-2")),
  GOOGLE_GENERATION_MODEL: z.string().optional().transform((val) => (val && val.trim() ? val : "gemini-3.6-flash")),
  FAST_MODEL: z.string().optional().transform((val) => (val && val.trim() ? val : "gemini-3.5-flash-lite")),
  REASONING_MODEL: z.string().optional().transform((val) => (val && val.trim() ? val : "gemini-3.6-flash")),
  MAX_AGENT_ITERATIONS: z.coerce.number().int().positive().default(5),
  AGENT_HISTORY_LIMIT: z.coerce.number().int().positive().default(8),
  GOOGLE_EMBEDDING_DIMENSIONS: z.coerce.number().int().positive().default(768),
  MONGODB_VECTOR_INDEX: z.string().optional().transform((val) => (val && val.trim() ? val : "DocumentChunk")),
  NEXTAUTH_SECRET: z.string().min(1).optional(),
  GOOGLE_CLIENT_ID: z.string().optional().default(""),
  GOOGLE_CLIENT_SECRET: z.string().optional().default(""),
  GOOGLE_CALENDAR_REDIRECT_URI: z.string().optional().default("http://localhost:4000/api/calendar/callback"),
  FRONTEND_URL: z.string().optional().default("http://localhost:3000"),
});

export const env = envSchema.parse(process.env);


