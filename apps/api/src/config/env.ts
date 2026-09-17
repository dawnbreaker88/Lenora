import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  MONGODB_URI: z.string().min(1, "MONGODB_URI is required"),
  PORT: z.coerce.number().int().positive().default(4000),
  GOOGLE_GENAI_API_KEY: z.string().min(1, "GOOGLE_GENAI_API_KEY is required"),
  GOOGLE_EMBEDDING_MODEL: z.string().optional().transform((val) => (val && val.trim() ? val : "gemini-embedding-2")),
  GOOGLE_GENERATION_MODEL: z.string().optional().transform((val) => (val && val.trim() ? val : "gemini-3.5-flash-lite")),
  GOOGLE_EMBEDDING_DIMENSIONS: z.coerce.number().int().positive().default(768),
  MONGODB_VECTOR_INDEX: z.string().optional().transform((val) => (val && val.trim() ? val : "DocumentChunk")),
  NEXTAUTH_SECRET: z.string().min(1).optional(),
});

export const env = envSchema.parse(process.env);
