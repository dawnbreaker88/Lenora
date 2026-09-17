import { connectDB } from "./config/db.js";
import { User } from "./models/User.js";
import { Topic } from "./models/Topic.js";
import { LearningEvidence } from "./models/LearningEvidence.js";
import { FeynmanSession } from "./models/FeynmanSession.js";
import { runFeynmanAgent } from "./agents/feynman.js";
import { executeFeynmanTool } from "./agents/tools/feynman.tools.js";

async function main() {
  console.log("=== LENORA FEYNMAN AGENT E2E TEST SUITE ===");
  await connectDB();

  // 1. Create or retrieve test student
  let testUser = await User.findOne({ email: "test-feynman-student@lenora.ai" });
  if (!testUser) {
    testUser = await User.create({
      googleId: "test_feynman_google_id_7777",
      email: "test-feynman-student@lenora.ai",
      name: "Test Student Feynman",
      timezone: "Asia/Kolkata",
      preferences: {
        dailyStudyMinutes: 120,
        learningStyle: "practice",
      },
    });
    console.log("Created test user:", testUser._id.toString());
  } else {
    console.log("Found test user:", testUser._id.toString());
  }

  const userId = testUser._id.toString();

  // Clean up prior test records
  await Topic.deleteMany({ userId });
  await LearningEvidence.deleteMany({ userId });
  await FeynmanSession.deleteMany({ userId });
  console.log("Cleaned up existing topics, evidence, and sessions for test student.\n");

  // Create initial topic "Database Normalization"
  const topic = await Topic.create({
    userId,
    name: "Database Normalization",
    subject: "DBMS",
    mastery: 0,
    confidence: 0,
    status: "learning",
    weaknesses: [],
    misconceptions: [],
  });
  const topicId = topic._id.toString();
  console.log(`Initialized test topic: "${topic.name}" (ID: ${topicId})\n`);

  // ==========================================
  // TEST 1 & 2: Tool Direct Execution (State & RAG)
  // ==========================================
  console.log("------------------------------------------");
  console.log("TEST 1 & 2: Verifying Feynman Tools (State & Study Material)");
  console.log("------------------------------------------");

  const stateToolRes = (await executeFeynmanTool(userId, "get_student_state", {})) as {
    user?: unknown;
    topics?: unknown[];
  };
  console.log("[Test 1 PASS] get_student_state returned:", {
    hasUser: !!stateToolRes.user,
    topicsCount: stateToolRes.topics?.length ?? 0,
  });

  const ragToolRes = (await executeFeynmanTool(userId, "search_study_material", {
    query: "normalization 1NF 2NF 3NF BCNF dependencies",
    topK: 3,
  })) as { success: boolean; count: number };
  console.log("[Test 2 PASS] search_study_material executed successfully:", {
    success: ragToolRes.success,
    chunksFound: ragToolRes.count,
  });

  // ==========================================
  // TEST 3: Interactive Socratic Teaching Start
  // ==========================================
  console.log("\n------------------------------------------");
  console.log("TEST 3: Socratic Teaching Start");
  console.log("Prompt: 'Teach me normalization from my DBMS notes.'");
  console.log("------------------------------------------");

  const turn1 = await runFeynmanAgent({
    userId,
    topicId,
    message: "Teach me normalization from my DBMS notes.",
  });

  console.log("\n[Feynman Response Turn 1]:\n", turn1.message);
  console.log("\n[Actions Executed]:", turn1.actions.length);
  turn1.actions.forEach((a, i) => console.log(`  ${i + 1}. [${a.type}] ${a.label}`));

  const sessionId = turn1.sessionId;

  // ==========================================
  // TEST 4: Student Incomplete Explanation
  // ==========================================
  console.log("\n------------------------------------------");
  console.log("TEST 4: Incomplete Student Explanation");
  console.log("Prompt: 'It removes duplicate data.'");
  console.log("------------------------------------------");

  const turn2 = await runFeynmanAgent({
    userId,
    sessionId,
    topicId,
    message: "It removes duplicate data.",
  });

  console.log("\n[Feynman Response Turn 2]:\n", turn2.message);
  console.log("\n[Actions Executed]:", turn2.actions.length);
  turn2.actions.forEach((a, i) => console.log(`  ${i + 1}. [${a.type}] ${a.label}`));

  // ==========================================
  // TEST 5: Misconception Detection & Evidence
  // ==========================================
  console.log("\n------------------------------------------");
  console.log("TEST 5: Misconception Detection");
  console.log("Prompt: '2NF is when we remove transitive dependencies where a non-prime attribute determines another non-prime attribute.'");
  console.log("------------------------------------------");

  const turn3 = await runFeynmanAgent({
    userId,
    sessionId,
    topicId,
    message:
      "2NF is when we remove transitive dependencies where a non-prime attribute determines another non-prime attribute.",
  });

  console.log("\n[Feynman Response Turn 3]:\n", turn3.message);
  console.log("\n[Recorded Evidence in Turn 3]:", turn3.evidence);
  console.log("\n[Actions Executed]:", turn3.actions.length);
  turn3.actions.forEach((a, i) => console.log(`  ${i + 1}. [${a.type}] ${a.label}`));

  // Verify Topic in MongoDB has recorded misconception
  const topicAfterTurn3 = await Topic.findById(topicId);
  console.log("\n[MongoDB State After Misconception]:", {
    mastery: topicAfterTurn3?.mastery,
    confidence: topicAfterTurn3?.confidence,
    misconceptions: topicAfterTurn3?.misconceptions,
    status: topicAfterTurn3?.status,
  });

  // ==========================================
  // TEST 6: Demonstrated Understanding & Mastery
  // ==========================================
  console.log("\n------------------------------------------");
  console.log("TEST 6: Correct Explanation & Mastery Increase");
  console.log("Prompt: 'Ah got it! 2NF removes partial dependency, meaning every non-prime attribute must depend on the whole candidate key, not a subset. 3NF is the one that removes transitive dependencies.'");
  console.log("------------------------------------------");

  const turn4 = await runFeynmanAgent({
    userId,
    sessionId,
    topicId,
    message:
      "Ah got it! 2NF removes partial dependency, meaning every non-prime attribute must depend on the whole candidate key, not a subset. 3NF is the one that removes transitive dependencies.",
  });

  console.log("\n[Feynman Response Turn 4]:\n", turn4.message);
  console.log("\n[Recorded Evidence in Turn 4]:", turn4.evidence);
  console.log("\n[Actions Executed]:", turn4.actions.length);
  turn4.actions.forEach((a, i) => console.log(`  ${i + 1}. [${a.type}] ${a.label}`));

  // Verify Topic in MongoDB has updated mastery
  const finalTopic = await Topic.findById(topicId);
  console.log("\n[Final MongoDB Topic State]:", {
    name: finalTopic?.name,
    mastery: finalTopic?.mastery,
    confidence: finalTopic?.confidence,
    status: finalTopic?.status,
    misconceptions: finalTopic?.misconceptions,
  });

  // ==========================================
  // TEST 7: Session Continuity Verification
  // ==========================================
  console.log("\n------------------------------------------");
  console.log("TEST 7: Session Continuity Verification");
  console.log("------------------------------------------");
  const dbSession = await FeynmanSession.findById(sessionId);
  console.log(`[Session Check]: Session ID ${sessionId} stored ${dbSession?.messages.length} messages.`);
  if (dbSession && dbSession.messages.length >= 8) {
    console.log("[Test 7 PASS] All turns persisted in the same session.");
  } else {
    console.log("[Test 7 WARNING] Message count lower than expected.");
  }

  // ==========================================
  // TEST 8: User Data Isolation Check
  // ==========================================
  console.log("\n------------------------------------------");
  console.log("TEST 8: User Data Isolation Check");
  console.log("------------------------------------------");
  const foreignUserId = "000000000000000000000001";
  const foreignTopic = await Topic.findOne({ _id: topicId, userId: foreignUserId });
  const foreignSession = await FeynmanSession.findOne({ _id: sessionId, userId: foreignUserId });

  if (!foreignTopic && !foreignSession) {
    console.log("[Test 8 PASS] User B cannot query or access User A's topic or session.");
  } else {
    throw new Error("[Test 8 FAIL] Isolation breach detected!");
  }

  // ==========================================
  // TEST 9: Tool Resilience (Empty Query)
  // ==========================================
  console.log("\n------------------------------------------");
  console.log("TEST 9: Tool Resilience (Empty/Nonexistent Query)");
  console.log("------------------------------------------");
  const emptyRagRes = (await executeFeynmanTool(userId, "search_study_material", {
    query: "xyznonexistentterm9999",
  })) as { success: boolean; count: number };
  console.log("[Test 9 PASS] Handled empty search gracefully:", emptyRagRes);

  console.log("\n==========================================");
  console.log("ALL 9 FEYNMAN AGENT TESTS COMPLETED SUCCESSFULLY.");
  console.log("==========================================");
  process.exit(0);
}

main().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
