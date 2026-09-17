import { Types } from "mongoose";
import { Test, type ITest } from "../models/Test.js";
import { TestAttempt, type ITestAnswer } from "../models/TestAttempt.js";
import { Topic } from "../models/Topic.js";
import { FeynmanSession } from "../models/FeynmanSession.js";
import { generateTest } from "../agents/test-generator.js";
import { evaluateTest } from "../agents/evaluator.js";
import { runPlannerAgent, type PlannerAction } from "../agents/planner.js";
import { applyTestAssessment } from "./learner-state.service.js";

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

  // 2. Fetch session messages if sessionId provided
  let sessionMessages: Array<{ role: string; content: string }> = [];
  if (sessionId && Types.ObjectId.isValid(sessionId)) {
    const session = await FeynmanSession.findOne({
      _id: new Types.ObjectId(sessionId),
      userId: userObjId,
    });
    if (session) {
      sessionMessages = session.messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));
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

  // 5. Cross-Agent Loop: Pass updated state to Planner Agent if weaknesses/misconceptions exist
  let plannerReview: {
    triggered: boolean;
    message: string;
    actions: PlannerAction[];
  } | null = null;

  const weakConcepts = assessment.conceptAssessment
    .filter((c) => c.status === "weak")
    .map((c) => c.concept);

  const hasUnresolvedIssues =
    assessment.overallScore < 75 ||
    (assessment.misconceptions && assessment.misconceptions.length > 0) ||
    weakConcepts.length > 0 ||
    stateUpdate.topic.status === "weak" ||
    (stateUpdate.topic.weaknesses && stateUpdate.topic.weaknesses.length > 0) ||
    stateUpdate.topic.mastery < 0.7;

  if (input.autoReviewPlanner !== false && hasUnresolvedIssues) {
    try {
      const weaknessesList = stateUpdate.topic.weaknesses?.length
        ? stateUpdate.topic.weaknesses.join(", ")
        : weakConcepts.length
        ? weakConcepts.join(", ")
        : "Foundational conceptual gaps";
      const misconceptionsList = assessment.misconceptions?.length
        ? assessment.misconceptions.join("; ")
        : "None specifically named";

      const plannerPrompt = `[POST-ASSESSMENT STATE REVIEW]
The student just completed a test on "${topicName}" with a score of ${assessment.overallScore}%.
Current Topic Mastery: ${Math.round(stateUpdate.topic.mastery * 100)}% (Status: ${stateUpdate.topic.status}).
Identified Weaknesses: ${weaknessesList}.
Identified Misconceptions: ${misconceptionsList}.

These issues were not fully resolved in the Feynman session.
Please review the student's current state and schedule necessary revision tasks and calendar study blocks to remediate these weak concepts without creating scheduling conflicts.`;

      const plannerResult = await runPlannerAgent(userId, plannerPrompt);
      plannerReview = {
        triggered: true,
        message: plannerResult.message,
        actions: plannerResult.actions,
      };
    } catch (plannerErr) {
      console.warn(
        `[Planner Auto-Review] Non-fatal error running Planner Agent after test:`,
        plannerErr instanceof Error ? plannerErr.message : plannerErr
      );
      plannerReview = {
        triggered: false,
        message: "Planner review scheduled for next synchronization.",
        actions: [],
      };
    }
  } else if (input.autoReviewPlanner !== false && !hasUnresolvedIssues) {
    plannerReview = {
      triggered: false,
      message: "Excellent performance! Mastery is solid, so no schedule adjustments or revision tasks were needed.",
      actions: [],
    };
  }

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
    plannerReview,
    submittedAt: attempt.submittedAt,
  };
}
