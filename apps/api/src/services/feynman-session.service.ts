import { Types } from "mongoose";
import { FeynmanSession, type IFeynmanSession } from "../models/FeynmanSession.js";

export interface CreateOrGetSessionInput {
  sessionId?: string;
  topicId?: string;
  goalId?: string;
  taskId?: string;
}

export async function getOrCreateFeynmanSession(
  userId: string,
  input: CreateOrGetSessionInput
): Promise<IFeynmanSession> {
  const userObjId = new Types.ObjectId(userId);

  if (input.sessionId && Types.ObjectId.isValid(input.sessionId)) {
    const existing = await FeynmanSession.findOne({
      _id: new Types.ObjectId(input.sessionId),
      userId: userObjId,
    });
    if (existing) {
      if (input.topicId && Types.ObjectId.isValid(input.topicId)) {
        existing.topicId = new Types.ObjectId(input.topicId);
      }
      return existing;
    }
  }

  // Create a new session
  const newSession = await FeynmanSession.create({
    userId: userObjId,
    topicId: input.topicId && Types.ObjectId.isValid(input.topicId) ? new Types.ObjectId(input.topicId) : undefined,
    goalId: input.goalId && Types.ObjectId.isValid(input.goalId) ? new Types.ObjectId(input.goalId) : undefined,
    taskId: input.taskId && Types.ObjectId.isValid(input.taskId) ? new Types.ObjectId(input.taskId) : undefined,
    messages: [],
    status: "active",
    startedAt: new Date(),
    lastInteractionAt: new Date(),
  });

  return newSession;
}

export async function appendSessionMessage(
  sessionId: string,
  role: "user" | "model",
  content: string
) {
  if (!Types.ObjectId.isValid(sessionId)) return null;

  return FeynmanSession.findByIdAndUpdate(
    sessionId,
    {
      $push: {
        messages: {
          role,
          content,
          timestamp: new Date(),
        },
      },
      $set: {
        lastInteractionAt: new Date(),
      },
    },
    { new: true }
  );
}

export async function getSessionById(userId: string, sessionId: string) {
  if (!Types.ObjectId.isValid(sessionId)) return null;
  return FeynmanSession.findOne({
    _id: new Types.ObjectId(sessionId),
    userId: new Types.ObjectId(userId),
  });
}
