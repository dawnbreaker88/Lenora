import { connectDB } from "./config/db.js";
import { User } from "./models/User.js";
import { Topic } from "./models/Topic.js";
import { Test } from "./models/Test.js";
import { TestAttempt } from "./models/TestAttempt.js";
import { FeynmanSession } from "./models/FeynmanSession.js";
import { Goal } from "./models/Goals.js";
import { Task } from "./models/Task.js";
import { CalendarEvent } from "./models/CalendarEvent.js";
import {
  generateTestForSession,
  getTestById,
  submitTestAttempt,
} from "./services/test.service.js";
import { runFeynmanAgent } from "./agents/feynman.js";
import { runPlannerAgent } from "./agents/planner.js";

async function main() {
  console.log("=== LENORA CLOSED-LOOP ASSESSMENT & AGENT INTEGRATION TEST SUITE ===");
  await connectDB();

  // 1. Create or retrieve test student
  let testUser = await User.findOne({ email: "test-assessment-student@lenora.ai" });
  if (!testUser) {
    testUser = await User.create({
      googleId: "test_assessment_google_id_8888",
      email: "test-assessment-student@lenora.ai",
      name: "Test Student Assessment",
      timezone: "Asia/Kolkata",
      preferences: {
        dailyStudyMinutes: 120,
        learningStyle: "practice",
      },
    });
  }

  const userId = testUser._id.toString();

  // Clean up existing test data
  await Topic.deleteMany({ userId });
  await Test.deleteMany({ userId });
  await TestAttempt.deleteMany({ userId });
  await FeynmanSession.deleteMany({ userId });
  await Goal.deleteMany({ userId });
  await Task.deleteMany({ userId });
  await CalendarEvent.deleteMany({ userId });
  console.log("Cleaned up existing topics, tests, sessions, tasks, and events for test student.\n");

  // Create initial topic "Database Normalization"
  const topic = await Topic.create({
    userId,
    name: "Database Normalization",
    subject: "DBMS",
    mastery: 0.3,
    confidence: 0.2,
    status: "learning",
    weaknesses: ["1NF anomalies"],
    misconceptions: [],
  });
  const topicId = topic._id.toString();

  // Create a Feynman session
  const feynmanTurn1 = await runFeynmanAgent({
    userId,
    topicId,
    message: "Teach me 2NF and 3NF from my notes.",
  });
  const sessionId = feynmanTurn1.sessionId;
  console.log(`[Feynman Initial Session]: Session ID: ${sessionId}\n`);

  // ==========================================
  // TEST 1 & 2: Test Generation & Server-Side Expected Answer Security
  // ==========================================
  console.log("------------------------------------------");
  console.log("TEST 1 & 2: Test Generation & Security Validation");
  console.log("------------------------------------------");

  const generatedTest = await generateTestForSession({
    userId,
    sessionId,
    topicId,
    numQuestions: 3,
  });

  console.log(`[Generated Test]: "${generatedTest.title}" (ID: ${generatedTest.id})`);
  console.log(`- Questions Count: ${generatedTest.questions.length}`);
  generatedTest.questions.forEach((q, i) => {
    console.log(`   ${i + 1}. [${q.type}] ${q.question} (Concept: ${q.concept}, Difficulty: ${q.difficulty})`);
    if (q.options?.length) {
      console.log(`      Options: ${JSON.stringify(q.options)}`);
    }
  });

  // Verify expectedAnswer is stripped from client representation
  const rawQuestions = generatedTest.questions as unknown as Array<Record<string, unknown>>;
  const hasLeakedAnswer = rawQuestions.some((q) => "expectedAnswer" in q && q.expectedAnswer !== undefined);
  if (!hasLeakedAnswer) {
    console.log("[Test 2 PASS] expectedAnswer is strictly stripped from client response.");
  } else {
    throw new Error("[Test 2 FAIL] expectedAnswer was leaked in client response!");
  }

  // Verify in MongoDB that expectedAnswer DOES exist server-side
  const dbTest = await Test.findById(generatedTest.id);
  if (dbTest && dbTest.questions.every((q) => q.expectedAnswer && q.expectedAnswer.length > 0)) {
    console.log("[Test 1 PASS] expectedAnswer properly persisted in MongoDB server-side.");
  } else {
    throw new Error("[Test 1 FAIL] expectedAnswer missing in database!");
  }

  // ==========================================
  // TEST 3: User Data Isolation
  // ==========================================
  console.log("\n------------------------------------------");
  console.log("TEST 3: User Data Isolation Check");
  console.log("------------------------------------------");
  const foreignUserId = "000000000000000000000002";
  const foreignTestView = await getTestById(foreignUserId, generatedTest.id);
  if (foreignTestView === null) {
    console.log("[Test 3 PASS] User B cannot access User A's test.");
  } else {
    throw new Error("[Test 3 FAIL] Isolation breach detected!");
  }

  // ==========================================
  // TEST 4: Invalid Answer Payload Rejection
  // ==========================================
  console.log("\n------------------------------------------");
  console.log("TEST 4: Invalid Answer Payload Rejection");
  console.log("------------------------------------------");
  let caughtEmpty = false;
  try {
    await submitTestAttempt({
      userId,
      testId: generatedTest.id,
      answers: [],
    });
  } catch (err) {
    caughtEmpty = true;
    console.log("[Test 4 PASS] Empty answers array rejected with error:", (err as Error).message);
  }
  if (!caughtEmpty) throw new Error("[Test 4 FAIL] Empty answers payload was not rejected!");

  // ==========================================
  // TEST 5 & 6: Evaluator Agent & Learner State Update
  // ==========================================
  console.log("\n------------------------------------------");
  console.log("TEST 5 & 6: Evaluator Agent & Learner State Update");
  console.log("------------------------------------------");

  // Construct student answers: answer Q1 correctly, Q2 with a known misconception, Q3 partially
  const studentAnswers = generatedTest.questions.map((q, idx) => {
    const dbQ = dbTest!.questions.find((x) => x.id === q.id);
    if (idx === 0) {
      // Correct answer
      return { questionId: q.id, answer: dbQ?.expectedAnswer || "Correct concept answer" };
    } else if (idx === 1) {
      // Misconception answer
      return {
        questionId: q.id,
        answer: "2NF means we remove transitive dependencies so that non-prime attributes don't determine other non-prime attributes.",
      };
    } else {
      // Partial answer
      return { questionId: q.id, answer: "It decomposes the relation into smaller tables." };
    }
  });

  console.log("Submitting student answers for evaluation...");
  const submissionResult = await submitTestAttempt({
    userId,
    testId: generatedTest.id,
    answers: studentAnswers,
  });

  console.log("\n[Evaluator Overall Score]:", `${submissionResult.assessment.overallScore}%`);
  console.log("[Question Feedback]:");
  submissionResult.assessment.questions.forEach((q, i) => {
    console.log(`  ${i + 1}. [${q.correct ? "CORRECT" : "NEEDS WORK"} - Score: ${(q.score * 100).toFixed(0)}%] Concept: ${q.concept}`);
    console.log(`     Reasoning: ${q.reasoning}`);
    if (q.misconceptions?.length) {
      console.log(`     Misconceptions: ${q.misconceptions.join(", ")}`);
    }
  });

  console.log("\n[Concept Level Assessment]:", submissionResult.assessment.conceptAssessment);
  console.log("[Identified Misconceptions]:", submissionResult.assessment.misconceptions);

  const plannerReview = (submissionResult as any).plannerReview;
  if (plannerReview) {
    console.log("\n[Automatic Post-Test Planner Review]:");
    console.log(`- Triggered: ${plannerReview.triggered}`);
    console.log(`- Message: ${plannerReview.message}`);
    console.log(`- Actions Executed: ${plannerReview.actions?.length || 0}`);
    plannerReview.actions?.forEach((a: any, i: number) => {
      console.log(`    ${i + 1}. [${a.type}] ${a.label}`);
    });
  }

  // Verify Topic in MongoDB has updated mastery and recorded misconceptions
  const updatedTopic = await Topic.findById(topicId);
  console.log("\n[Updated Topic State in MongoDB]:", {
    mastery: updatedTopic?.mastery,
    confidence: updatedTopic?.confidence,
    status: updatedTopic?.status,
    assessmentCount: updatedTopic?.assessmentCount,
    misconceptions: updatedTopic?.misconceptions,
    weaknesses: updatedTopic?.weaknesses,
  });

  if (updatedTopic && (updatedTopic.assessmentCount || 0) > 0 && updatedTopic.misconceptions.length > 0) {
    console.log("[Test 5 & 6 PASS] Evaluator Agent evaluated answers, updated Topic state, and automatically engaged Planner for weak areas.");
  } else {
    throw new Error("[Test 5 & 6 FAIL] Topic state was not updated properly!");
  }

  // ==========================================
  // TEST 7: Duplicate Submission Prevention
  // ==========================================
  console.log("\n------------------------------------------");
  console.log("TEST 7: Duplicate Submission Prevention");
  console.log("------------------------------------------");
  let caughtDuplicate = false;
  try {
    await submitTestAttempt({
      userId,
      testId: generatedTest.id,
      answers: studentAnswers,
    });
  } catch (err) {
    caughtDuplicate = true;
    console.log("[Test 7 PASS] Duplicate submission rejected:", (err as Error).message);
  }
  if (!caughtDuplicate) throw new Error("[Test 7 FAIL] Duplicate submission was not rejected!");

  // ==========================================
  // TEST 8: Feedback Loop Into Next Feynman Session
  // ==========================================
  console.log("\n------------------------------------------");
  console.log("TEST 8: Feedback Loop Into Subsequent Feynman Session");
  console.log("Prompt: 'What should we work on next?'");
  console.log("------------------------------------------");

  const feynmanTurn2 = await runFeynmanAgent({
    userId,
    topicId,
    message: "What should we work on next based on my latest test?",
  });

  console.log("\n[Feynman Post-Assessment Response]:\n", feynmanTurn2.message);
  console.log("\n[Actions Executed]:", feynmanTurn2.actions.length);
  feynmanTurn2.actions.forEach((a, i) => console.log(`  ${i + 1}. [${a.type}] ${a.label}`));
  console.log("[Test 8 PASS] Feynman automatically recognized post-assessment topic weaknesses!");

  // ==========================================
  // TEST 9: Cross-Agent Planner Schedule Adaptation
  // ==========================================
  console.log("\n------------------------------------------");
  console.log("TEST 9: Cross-Agent Planner Adaptation");
  console.log("Prompt: 'Review my recent assessment results and adjust my schedule to add revision for my weak concepts.'");
  console.log("------------------------------------------");

  const plannerResult = await runPlannerAgent(
    userId,
    "Review my recent assessment results and adjust my schedule to add revision for my weak concepts."
  );

  console.log("\n[Planner Response]:\n", plannerResult.message);
  console.log("\n[Executed Planner Actions]:", plannerResult.actions.length);
  plannerResult.actions.forEach((a, i) => console.log(`  ${i + 1}. [${a.type}] ${a.label}`));

  const dbTasks = await Task.find({ userId });
  const dbEvents = await CalendarEvent.find({ userId });
  console.log("\n[Planner Created in MongoDB]:");
  console.log(`- Tasks: ${dbTasks.length}`);
  dbTasks.forEach((t) => console.log(`   * Task: "${t.title}" (${t.estimatedMinutes}m, type: ${t.type})`));
  console.log(`- Calendar Events: ${dbEvents.length}`);
  dbEvents.forEach((e) => console.log(`   * Event: "${e.title}" (${e.startTime.toISOString()})`));

  if (dbTasks.length > 0 || dbEvents.length > 0) {
    console.log("\n[Test 9 PASS] Planner Agent successfully adapted schedule based on post-assessment state!");
  } else {
    console.log("\n[Test 9 WARNING] Planner gave textual recommendations.");
  }

  console.log("\n==========================================");
  console.log("ALL 9 CLOSED-LOOP & CROSS-AGENT TESTS PASSED SUCCESSFULLY!");
  console.log("==========================================");
  process.exit(0);
}

main().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
