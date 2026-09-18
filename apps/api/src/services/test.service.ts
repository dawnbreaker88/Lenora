import { Types } from "mongoose";
import { Test, type ITest } from "../models/Test.js";
import { TestAttempt, type ITestAnswer } from "../models/TestAttempt.js";
import { Topic } from "../models/Topic.js";
import { FeynmanSession } from "../models/FeynmanSession.js";
import { AgentSession } from "../models/AgentSession.js";
import { generateTest } from "../agents/test-generator.js";
import { evaluateTest } from "../agents/evaluator.js";
import { applyTestAssessment } from "./learner-state.service.js";
import { EventService } from "../events/event.service.js";


export interface GenerateTestServiceInput {
  userId: string;
  sessionId?: string;
  topicId?: string;
  topicName?: string;
  subject?: string;
  numQuestions?: number;
}

export interface SubmitTestServiceInput {
  userId: string;
  testId: string;
  answers: ITestAnswer[];
  autoReviewPlanner?: boolean;
}

/**
 * Strips server-side expectedAnswer from questions for client privacy and test integrity.
 */
export function sanitizeTestForClient(test: ITest) {
  return {
    id: test._id.toString(),
    title: test.title,
    topicId: test.topicId.toString(),
    status: test.status,
    createdAt: test.createdAt,
    questions: test.questions.map((q) => ({
      id: q.id,
      question: q.question,
      type: q.type,
      options: q.options,
      concept: q.concept,
      difficulty: q.difficulty,
    })),
  };
}

/**
 * Generates an adaptive conceptual assessment for the student's topic and session.
 */
export async function generateTestForSession(
  input: GenerateTestServiceInput
) {
  const { userId, sessionId, numQuestions = 4 } = input;
  const userObjId = new Types.ObjectId(userId);

  // 1. Resolve Topic
  let topicDoc = null;
  if (input.topicId && Types.ObjectId.isValid(input.topicId)) {
    topicDoc = await Topic.findOne({ _id: new Types.ObjectId(input.topicId), userId: userObjId });
  }

  if (!topicDoc && input.topicName) {
    topicDoc = await Topic.findOne({
      userId: userObjId,
      name: { $regex: new RegExp(`^${input.topicName.trim()}$`, "i") },
    });
  }

  if (!topicDoc) {
    // If no topic exists yet, create one
    topicDoc = await Topic.create({
      userId: userObjId,
      name: input.topicName || "General Learning Assessment",
      subject: input.subject || "General",
      mastery: 0,
      confidence: 0,
      status: "learning",
      weaknesses: [],
      misconceptions: [],
    });
  }

  // 2. Fetch session messages & context if sessionId provided
  let sessionMessages: Array<{ role: string; content: string }> = [];
  let sessionTopicName = input.topicName;
  let sessionSubject = input.subject;

  if (sessionId && Types.ObjectId.isValid(sessionId)) {
    // Check AgentSession first (where current Feynman conversations are stored)
    const agentSession = await AgentSession.findOne({
      _id: new Types.ObjectId(sessionId),
      userId: userObjId,
    });

    if (agentSession) {
      sessionMessages = agentSession.messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      if (agentSession.context?.topicName && !sessionTopicName) {
        sessionTopicName = agentSession.context.topicName;
      }
    } else {
      // Fallback check on FeynmanSession collection
      const feynmanSession = await FeynmanSession.findOne({
        _id: new Types.ObjectId(sessionId),
        userId: userObjId,
      });
      if (feynmanSession) {
        sessionMessages = feynmanSession.messages.map((m) => ({
          role: m.role,
          content: m.content,
        }));
      }
    }
  }

  // If topicDoc was general but we found a specific topicName from the session, look up/update it
  if (sessionTopicName && topicDoc.name === "General Learning Assessment") {
    const betterTopic = await Topic.findOne({
      userId: userObjId,
      name: { $regex: new RegExp(`^${sessionTopicName.trim()}$`, "i") },
    });
    if (betterTopic) {
      topicDoc = betterTopic;
    } else {
      topicDoc.name = sessionTopicName;
      if (sessionSubject) topicDoc.subject = sessionSubject;
      await topicDoc.save();
    }
  }

  // 3. Call Test Agent
  const generatedResult = await generateTest({
    topicName: topicDoc.name,
    subject: topicDoc.subject ?? undefined,
    sessionMessages,
    weaknesses: topicDoc.weaknesses || [],
    misconceptions: topicDoc.misconceptions || [],
    numQuestions,
  });

  // 4. Save Test to MongoDB
  const savedTest = await Test.create({
    userId: userObjId,
    sessionId: sessionId && Types.ObjectId.isValid(sessionId) ? new Types.ObjectId(sessionId) : undefined,
    topicId: topicDoc._id,
    title: generatedResult.title,
    questions: generatedResult.questions,
    status: "active",
  });

  return sanitizeTestForClient(savedTest);
}

/**
 * Retrieves a test by ID ensuring user ownership and sanitizing expected answers.
 */
export async function getTestById(userId: string, testId: string) {
  if (!Types.ObjectId.isValid(testId)) return null;

  const test = await Test.findOne({
    _id: new Types.ObjectId(testId),
    userId: new Types.ObjectId(userId),
  });

  if (!test) return null;
  return sanitizeTestForClient(test);
}

/**
 * Submits student answers, evaluates with Evaluator Agent, and updates learner state.
 */
export async function submitTestAttempt(input: SubmitTestServiceInput) {
  const { userId, testId, answers } = input;
  const userObjId = new Types.ObjectId(userId);

  if (!Types.ObjectId.isValid(testId)) {
    throw new Error("Invalid test ID");
  }

  const test = await Test.findOne({
    _id: new Types.ObjectId(testId),
    userId: userObjId,
  });

  if (!test) {
    throw new Error("Test not found or access denied.");
  }

  if (test.status === "completed") {
    throw new Error("This test has already been completed and evaluated.");
  }

  if (!answers || !Array.isArray(answers) || answers.length === 0) {
    throw new Error("Answers payload must be a non-empty array.");
  }

  const topic = await Topic.findById(test.topicId);
  const topicName = topic?.name || "General Topic";

  // 1. Evaluate with Evaluator Agent
  const assessment = await evaluateTest({
    topicName,
    questions: test.questions.map((q) => ({
      id: q.id,
      question: q.question,
      type: q.type,
      concept: q.concept,
      expectedAnswer: q.expectedAnswer,
    })),
    studentAnswers: answers,
  });

  // 2. Save TestAttempt record
  const attempt = await TestAttempt.create({
    testId: test._id,
    userId: userObjId,
    answers,
    assessment,
    submittedAt: new Date(),
  });

  // 3. Mark Test as completed
  test.status = "completed";
  await test.save();

  // 4. Apply assessment to Learner State (Topic mastery, status, misconceptions)
  const stateUpdate = await applyTestAssessment({
    userId,
    topicId: test.topicId.toString(),
    testId: test._id.toString(),
    assessment,
  });

  EventService.emitEvent({
    userId,
    type: "ASSESSMENT_COMPLETED",
    source: "learner",
    entityType: "assessment",
    entityId: attempt._id.toString(),
    metadata: {
      testId: test._id.toString(),
      score: assessment.overallScore,
      topicName,
      weakTopics: stateUpdate.topic.weaknesses,
    },
  }).catch((err) => console.warn("Failed to emit ASSESSMENT_COMPLETED event:", err));

  return {
    attemptId: attempt._id.toString(),
    testId: test._id.toString(),
    topic: {
      id: stateUpdate.topic._id.toString(),
      name: stateUpdate.topic.name,
      mastery: stateUpdate.topic.mastery,
      confidence: stateUpdate.topic.confidence,
      status: stateUpdate.topic.status,
      weaknesses: stateUpdate.topic.weaknesses,
      misconceptions: stateUpdate.topic.misconceptions,
    },
    assessment,
    submittedAt: attempt.submittedAt,
  };
}

