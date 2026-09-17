import { Router } from "express";
import { z } from "zod";
import { authenticatedUser } from "../middleware/auth.js";
import {
  getTopics,
  getTopicById,
  findOrCreateTopic,
} from "../services/topic.service.js";

const createTopicSchema = z.object({
  name: z.string().min(1, "Name is required"),
  subject: z.string().optional(),
  goalId: z.string().optional(),
  parentTopicId: z.string().optional(),
});

export const topicRouter = Router();

topicRouter.get("/", async (req, res, next) => {
  try {
    const userId = await authenticatedUser(req);
    const goalId = req.query.goalId ? String(req.query.goalId) : undefined;
    const subject = req.query.subject ? String(req.query.subject) : undefined;
    const topics = await getTopics(userId, { goalId, subject });
    res.json(topics);
  } catch (error) {
    next(error);
  }
});

topicRouter.get("/:id", async (req, res, next) => {
  try {
    const userId = await authenticatedUser(req);
    const topic = await getTopicById(userId, req.params.id);
    if (!topic) {
      return res.status(404).json({ error: "Topic not found" });
    }
    res.json(topic);
  } catch (error) {
    next(error);
  }
});

topicRouter.post("/", async (req, res, next) => {
  try {
    const userId = await authenticatedUser(req);
    const body = createTopicSchema.parse(req.body);
    const topic = await findOrCreateTopic(userId, body);
    res.status(201).json(topic);
  } catch (error) {
    next(error);
  }
});
