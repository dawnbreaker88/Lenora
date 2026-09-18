import { Router } from "express";
import { z } from "zod";
import { authenticatedUser } from "../middleware/auth.js";
import { getStudentState } from "../services/student-state.service.js";
import { User } from "../models/User.js";
import { Types } from "mongoose";

const availableSlotSchema = z.object({
  day: z.string().default("all"),
  startTime: z.string().default("14:00"),
  endTime: z.string().default("18:00"),
  label: z.string().optional().default("Study Window"),
});

const preferencesSchema = z.object({
  dailyStudyMinutes: z.number().min(15).max(1440).optional(),
  sessionLengthMinutes: z.number().min(10).max(180).optional(),
  feynmanInstructions: z.string().max(2000).optional(),
  learningStyle: z.string().optional(),
  availableSlots: z.array(availableSlotSchema).optional(),
});

export const stateRouter = Router();

stateRouter.get("/", async (req, res, next) => {
  try {
    const userId = await authenticatedUser(req);
    const state = await getStudentState(userId);
    res.json(state);
  } catch (error) {
    next(error);
  }
});

stateRouter.patch("/preferences", async (req, res, next) => {
  try {
    const userId = await authenticatedUser(req);
    const body = preferencesSchema.parse(req.body);

    const updateFields: Record<string, unknown> = {};
    if (body.dailyStudyMinutes !== undefined) {
      updateFields["preferences.dailyStudyMinutes"] = body.dailyStudyMinutes;
    }
    if (body.sessionLengthMinutes !== undefined) {
      updateFields["preferences.sessionLengthMinutes"] = body.sessionLengthMinutes;
    }
    if (body.feynmanInstructions !== undefined) {
      updateFields["preferences.feynmanInstructions"] = body.feynmanInstructions.trim();
    }
    if (body.learningStyle !== undefined) {
      updateFields["preferences.learningStyle"] = body.learningStyle;
    }
    if (body.availableSlots !== undefined) {
      updateFields["preferences.availableSlots"] = body.availableSlots;
    }

    const updated = await User.findByIdAndUpdate(
      new Types.ObjectId(userId),
      { $set: updateFields },
      { returnDocument: "after" }
    ).lean();

    res.json({ message: "Preferences saved", preferences: updated?.preferences });
  } catch (error) {
    next(error);
  }
});

