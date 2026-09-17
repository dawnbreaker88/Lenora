import { Router } from "express";
import { z } from "zod";
import { authenticatedUser } from "../middleware/auth.js";
import { answerWithRag, queryRag } from "../services/rag.service.js";

const querySchema = z.object({
  query: z.string().min(1, "Query is required").max(2000),
  topK: z.coerce.number().int().positive().max(20).optional().default(5),
});

export const ragRouter = Router();

ragRouter.post("/query", async (req, res, next) => {
  try {
    const { query, topK } = querySchema.parse(req.body);
    const userId = await authenticatedUser(req);
    const results = await queryRag(userId, query, topK);
    res.json({ query, topK, results });
  } catch (error) {
    next(error);
  }
});

ragRouter.post("/answer", async (req, res, next) => {
  try {
    const { query, topK } = querySchema.parse(req.body);
    const userId = await authenticatedUser(req);
    const response = await answerWithRag(userId, query, topK);
    res.json(response);
  } catch (error) {
    next(error);
  }
});
