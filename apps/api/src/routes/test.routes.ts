import { Router } from "express";
import { z } from "zod";
import { Types } from "mongoose";
import { authenticatedUser } from "../middleware/auth.js";
import {
  generateTestForSession,
  getTestById,
  submitTestAttempt,
} from "../services/test.service.js";
import { TestAttempt } from "../models/TestAttempt.js";

const generateSchema = z.object({
  sessionId: z.string().optional(),
  topicId: z.string().optional(),
  topicName: z.string().optional(),
  subject: z.string().optional(),
  numQuestions: z.number().min(2).max(8).optional(),
});

const submitSchema = z.object({
  answers: z
    .array(
      z.object({
        questionId: z.string().min(1, "questionId is required"),
        answer: z.string().min(1, "answer cannot be empty"),
      })
    )
    .min(1, "At least one answer is required"),
});

export const testRouter = Router();

testRouter.get("/attempts", async (req, res, next) => {
  try {
    const userId = await authenticatedUser(req);
    const attempts = await TestAttempt.find({ userId: new Types.ObjectId(userId) })
      .populate("testId")
      .sort({ createdAt: -1 })
      .lean();
    res.json(attempts);
  } catch (error) {
    next(error);
  }
});

testRouter.post("/generate", async (req, res, next) => {
  try {
    const userId = await authenticatedUser(req);
    const body = generateSchema.parse(req.body);
    const test = await generateTestForSession({
      ...body,
      userId,
    });
    res.status(201).json(test);
  } catch (error) {
    next(error);
  }
});

testRouter.get("/:testId", async (req, res, next) => {
  try {
    const userId = await authenticatedUser(req);
    const test = await getTestById(userId, req.params.testId);
    if (!test) {
      return res.status(404).json({ error: "Test not found or access denied." });
    }
    res.json(test);
  } catch (error) {
    next(error);
  }
});

testRouter.post("/:testId/submit", async (req, res, next) => {
  try {
    const userId = await authenticatedUser(req);
    const body = submitSchema.parse(req.body);
    const result = await submitTestAttempt({
      userId,
      testId: req.params.testId,
      answers: body.answers,
    });
    res.json(result);
  } catch (error) {
    next(error);
  }
});
