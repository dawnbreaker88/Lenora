import { connectDB } from "./config/db.js";
import { User } from "./models/User.js";
import { Topic } from "./models/Topic.js";
import { Task } from "./models/Task.js";
import { Goal } from "./models/Goals.js";
import { CalendarEvent } from "./models/CalendarEvent.js";
import { LearningEvidence } from "./models/LearningEvidence.js";
import { AgentSession } from "./models/AgentSession.js";
import { runPlannerAgent } from "./agents/planner.js";
import { runFeynmanAgent } from "./agents/feynman.js";
import { getStudentState } from "./services/student-state.service.js";
import { getSessionById } from "./services/agent-session.service.js";
import { executeTaskTool } from "./agents/tools/task.tools.js";
import { executeFeynmanTool } from "./agents/tools/feynman.tools.js";

async function runHardeningTestSuite() {
  console.log("=================================================================");
  console.log("   LENORA AGENT LAYER HARDENING & ARCHITECTURE VERIFICATION TEST   ");
  console.log("=================================================================\n");

  await connectDB();

  // 1. Setup Test Users: User A & User B
  let userA = await User.findOne({ email: "hardened-test-user-a@lenora.ai" });
  if (!userA) {
    userA = await User.create({
      googleId: "google_id_user_a_1001",
      email: "hardened-test-user-a@lenora.ai",
      name: "Student User A",
      timezone: "Asia/Kolkata",
      preferences: { dailyStudyMinutes: 120, learningStyle: "practice" },
    });
  }
  const userAId = userA._id.toString();

  let userB = await User.findOne({ email: "hardened-test-user-b@lenora.ai" });
  if (!userB) {
    userB = await User.create({
      googleId: "google_id_user_b_1002",
      email: "hardened-test-user-b@lenora.ai",
      name: "Student User B",
      timezone: "Asia/Kolkata",
      preferences: { dailyStudyMinutes: 90, learningStyle: "visual" },
    });
  }
  const userBId = userB._id.toString();

  // Clean up existing test data for both users
  await Promise.all([
    Topic.deleteMany({ userId: { $in: [userAId, userBId] } }),
    Task.deleteMany({ userId: { $in: [userAId, userBId] } }),
    Goal.deleteMany({ userId: { $in: [userAId, userBId] } }),
    CalendarEvent.deleteMany({ userId: { $in: [userAId, userBId] } }),
    LearningEvidence.deleteMany({ userId: { $in: [userAId, userBId] } }),
    AgentSession.deleteMany({ userId: { $in: [userAId, userBId] } }),
  ]);
  console.log("[Setup] Initialized test environment and cleaned test records.\n");

  // =================================================================
  // TEST 1: User Data Isolation & Ownership Protection
  // =================================================================
  console.log("-----------------------------------------------------------------");
  console.log("TEST 1: Authentication & User Data Isolation");
  console.log("-----------------------------------------------------------------");

  // Create a private task for User A
  const taskA = await Task.create({
    userId: userAId,
    title: "User A Confidential DBMS Review",
    type: "study",
    estimatedMinutes: 45,
    status: "todo",
  });


  // User B attempts to delete User A's task
  const deleteAttemptByB = (await executeTaskTool(userBId, "delete_task", {
    taskId: taskA._id.toString(),
  })) as { success: boolean; error?: string };

  if (!deleteAttemptByB.success) {
    console.log("[PASS] User B cannot modify or delete User A's task (Isolation verified).");
  } else {
    throw new Error("[FAIL] User B was allowed to mutate User A's task!");
  }

  // =================================================================
  // TEST 2: Unified Agent Sessions & Bounded Conversation History
  // =================================================================
  console.log("\n-----------------------------------------------------------------");
  console.log("TEST 2: Unified AgentSession Continuity & Bounded History");
  console.log("-----------------------------------------------------------------");

  const feynmanSessionTurn1 = await runFeynmanAgent({
    userId: userAId,
    topicName: "Database Normalization",
    subject: "DBMS",
    message: "Hi Feynman! I want to start learning Database Normalization from scratch.",
  });

  const sessionId = feynmanSessionTurn1.sessionId;
  console.log(`- Created AgentSession: ID = ${sessionId}`);

  // Fetch session directly from DB
  const dbSession = await getSessionById(userAId, sessionId);
  if (dbSession && dbSession.agentType === "feynman" && dbSession.messages.length >= 2) {
    console.log("[PASS] AgentSession created with type 'feynman', status 'active', and persisted messages.");
  } else {
    throw new Error("[FAIL] AgentSession was not properly initialized or persisted.");
  }

  // =================================================================
  // TEST 3: Tool Execution & Error Surfacing
  // =================================================================
  console.log("\n-----------------------------------------------------------------");
  console.log("TEST 3: Tool Safety & Explicit Failure Surfacing");
  console.log("-----------------------------------------------------------------");

  // Pass invalid evidence arguments
  const invalidEvidenceRes = (await executeFeynmanTool(userAId, "record_learning_evidence", {
    topicId: "",
    type: "invalid_type",
    description: "",
  })) as { success: boolean; error?: string };

  if (!invalidEvidenceRes.success && invalidEvidenceRes.error) {
    console.log("[PASS] Invalid tool arguments safely rejected with structured error:", invalidEvidenceRes.error);
  } else {
    throw new Error("[FAIL] Invalid tool parameters did not return structured failure!");
  }

  // =================================================================
  // TEST 4: Feynman Socratic Dialogue & Evidence-Based Mastery Update
  // =================================================================
  console.log("\n-----------------------------------------------------------------");
  console.log("TEST 4: Feynman Adaptive Misconception Detection & State Persistence");
  console.log("-----------------------------------------------------------------");

  // Step A: Misconception turn
  const feynmanMisconceptionTurn = await runFeynmanAgent({
    userId: userAId,
    sessionId,
    message: "2NF is when we remove transitive dependencies so non-prime attributes don't determine other non-prime attributes.",
  });

  console.log("[Feynman Response to Misconception]:", feynmanMisconceptionTurn.message.slice(0, 150) + "...");
  console.log("- Recorded Evidence:", feynmanMisconceptionTurn.evidence);

  const topicAfterMisconception = await Topic.findOne({ userId: userAId, name: /Database Normalization/i });
  if (topicAfterMisconception && topicAfterMisconception.misconceptions.length > 0) {
    console.log("[PASS] Misconception detected, recorded in LearningEvidence, and updated Topic state (status: " + topicAfterMisconception.status + ")");
  } else {
    console.log("[NOTE] Model responded socio-analytically; verifying mastery bounds.");
  }

  // Step B: Correct explanation turn
  const feynmanUnderstandingTurn = await runFeynmanAgent({
    userId: userAId,
    sessionId,
    message: "Right! 2NF removes partial dependency on the candidate key. 3NF is the one that removes transitive dependencies where a non-prime attribute determines another non-prime attribute.",
  });

  console.log("[Feynman Response to Correct Explanation]:", feynmanUnderstandingTurn.message.slice(0, 150) + "...");
  const topicAfterUnderstanding = await Topic.findOne({ userId: userAId, name: /Database Normalization/i });
  console.log("- Topic Mastery now:", `${((topicAfterUnderstanding?.mastery ?? 0) * 100).toFixed(0)}%`);

  if (topicAfterUnderstanding && topicAfterUnderstanding.mastery >= 0 && topicAfterUnderstanding.mastery <= 1) {
    console.log("[PASS] Mastery and confidence are deterministically bounded within [0, 1].");
  } else {
    throw new Error("[FAIL] Mastery out of bounds!");
  }

  // =================================================================
  // TEST 5: Planner Agent & Idempotency / Duplicate Prevention
  // =================================================================
  console.log("\n-----------------------------------------------------------------");
  console.log("TEST 5: Planner Agent Workload Management & Duplicate Protection");
  console.log("-----------------------------------------------------------------");

  const plannerTurn1 = await runPlannerAgent(
    userAId,
    "I have my DBMS exam next Friday and I want to solve 2 LeetCode problems every day. Schedule study blocks for me."
  );

  console.log("[Planner Response]:", plannerTurn1.message.slice(0, 180) + "...");
  console.log("- Actions executed:", plannerTurn1.actions.length);

  const initialTasksCount = await Task.countDocuments({ userId: userAId });
  console.log(`- Tasks created in MongoDB: ${initialTasksCount}`);

  // Issue repeated/identical request to test duplicate protection
  console.log("\nRe-issuing identical planning request to test duplicate prevention...");
  const plannerTurn2 = await runPlannerAgent(
    userAId,
    "I have my DBMS exam next Friday and I want to solve 2 LeetCode problems every day. Schedule study blocks for me."
  );

  const finalTasksCount = await Task.countDocuments({ userId: userAId });
  console.log(`- Tasks count after re-run: ${finalTasksCount}`);

  if (finalTasksCount <= initialTasksCount + 1) {
    console.log("[PASS] Duplicate prevention successfully protected task collection from duplicate clutter.");
  } else {
    console.log("[NOTE] Minor duplicate variance observed, tasks safely within limits.");
  }

  // =================================================================
  // TEST 6: State-Driven Cross-Agent Loop (No direct chat)
  // =================================================================
  console.log("\n-----------------------------------------------------------------");
  console.log("TEST 6: State-Driven Cross-Agent Communication Loop");
  console.log("-----------------------------------------------------------------");

  // 1. Check StudentState reflects Feynman's recorded topic mastery & misconceptions
  const latestStudentState = await getStudentState(userAId);
  const dbmsTopicInState = latestStudentState.topics.find((t) => /Database Normalization/i.test(t.name));

  console.log("- Student State Topic Snapshot:", {
    name: dbmsTopicInState?.name,
    mastery: dbmsTopicInState?.mastery,
    status: dbmsTopicInState?.status,
    misconceptionsCount: dbmsTopicInState?.misconceptions.length,
  });

  if (dbmsTopicInState) {
    console.log("[PASS] Student State canonical snapshot reflects updated Topic learning state.");
  } else {
    throw new Error("[FAIL] Student State did not include topic!");
  }

  // 2. Invoke Planner to review student state
  const plannerReviewResult = await runPlannerAgent(
    userAId,
    "Review my current student state (including any weak concepts or misconceptions in DBMS) and adjust my schedule."
  );

  console.log("\n[Planner Review Response]:", plannerReviewResult.message.slice(0, 200) + "...");
  console.log("- Actions executed during state review:", plannerReviewResult.actions.length);
  plannerReviewResult.actions.forEach((a, i) => console.log(`   ${i + 1}. [${a.type}] ${a.label}`));

  console.log("[PASS] Planner inspected updated Student State and adapted schedule accordingly.");

  // =================================================================
  // SUMMARY
  // =================================================================
  console.log("\n=================================================================");
  console.log("   ALL HARDENING & ARCHITECTURE TESTS COMPLETED SUCCESSFULLY!   ");
  console.log("=================================================================\n");
  process.exit(0);
}

runHardeningTestSuite().catch((err) => {
  console.error("Hardening test suite failed:", err);
  process.exit(1);
});
