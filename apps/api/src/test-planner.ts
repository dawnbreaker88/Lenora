import { connectDB } from "./config/db.js";
import { User } from "./models/User.js";
import { Goal } from "./models/Goals.js";
import { Task } from "./models/Task.js";
import { CalendarEvent } from "./models/CalendarEvent.js";
import { runPlannerAgent } from "./agents/planner.js";
import { getStudentState } from "./services/student-state.service.js";

async function main() {
  console.log("=== LENORA PLANNER AGENT E2E TEST SUITE ===");
  await connectDB();

  // Find or create test student
  let testUser = await User.findOne({ email: "test-student-planner@lenora.ai" });
  if (!testUser) {
    testUser = await User.create({
      googleId: "test_planner_google_id_9999",
      email: "test-student-planner@lenora.ai",
      name: "Test Student Planner",
      timezone: "Asia/Kolkata",
      preferences: {
        dailyStudyMinutes: 120, // 2 hours limit
        sessionLengthMinutes: 45,
        breakLengthMinutes: 10,
        learningStyle: "practice",
      },
    });
    console.log("Created test user:", testUser._id.toString());
  } else {
    console.log("Found test user:", testUser._id.toString());
  }

  const userId = testUser._id.toString();

  // Clean up any previous test items for this user
  await Goal.deleteMany({ userId });
  await Task.deleteMany({ userId });
  await CalendarEvent.deleteMany({ userId });
  console.log("Cleaned up existing goals, tasks, and calendar events for test student.");

  // Test Initial State
  const initialState = await getStudentState(userId);
  console.log("\n--- Initial Student State ---");
  console.log({
    dailyLimitMinutes: initialState.workload.dailyLimitMinutes,
    goalsCount: initialState.goals.length,
    todayMinutes: initialState.workload.todayMinutes,
    isOverloaded: initialState.workload.isOverloaded,
  });

  // ==========================================
  // SCENARIO 1: DBMS Exam + LeetCode Daily Plan
  // ==========================================
  console.log("\n==========================================");
  console.log("SCENARIO 1: DBMS Exam + Daily LeetCode");
  console.log("Prompt: 'I have my DBMS exam next Friday. I also want to continue solving LeetCode every day. Create a realistic plan for me.'");
  console.log("==========================================");

  const scenario1Result = await runPlannerAgent(
    userId,
    "I have my DBMS exam next Friday. I also want to continue solving LeetCode every day. Create a realistic plan for me."
  );

  console.log("\n[Agent Response]:", scenario1Result.message);
  console.log("\n[Executed Actions]:", scenario1Result.actions.length);
  scenario1Result.actions.forEach((a, i) => {
    console.log(`  ${i + 1}. [${a.type}] ${a.label}`);
  });

  // Verify DB state after scenario 1
  const dbGoals1 = await Goal.find({ userId });
  const dbTasks1 = await Task.find({ userId });
  const dbEvents1 = await CalendarEvent.find({ userId });

  console.log("\n[DB Verification After Scenario 1]:");
  console.log(`- Goals created in MongoDB: ${dbGoals1.length}`);
  dbGoals1.forEach((g) => console.log(`   * Goal: "${g.title}" (Target: ${g.targetDate?.toISOString().split("T")[0] || "N/A"})`));
  console.log(`- Tasks created in MongoDB: ${dbTasks1.length}`);
  dbTasks1.forEach((t) => console.log(`   * Task: "${t.title}" (${t.estimatedMinutes}m, Due: ${t.dueAt?.toISOString().split("T")[0] || "N/A"})`));
  console.log(`- Calendar Events scheduled: ${dbEvents1.length}`);
  dbEvents1.forEach((e) => console.log(`   * Event: "${e.title}" (${e.startTime.toLocaleTimeString()} - ${e.endTime.toLocaleTimeString()})`));

  // ==========================================
  // SCENARIO 2: Rescheduling around an interview
  // ==========================================
  console.log("\n==========================================");
  console.log("SCENARIO 2: Rescheduling");
  console.log("Prompt: 'I can\\'t study tonight because I have an interview. Move whatever needs to move.'");
  console.log("==========================================");

  const scenario2Result = await runPlannerAgent(
    userId,
    "I can't study tonight because I have an interview. Move whatever needs to move."
  );

  console.log("\n[Agent Response]:", scenario2Result.message);
  console.log("\n[Executed Actions]:", scenario2Result.actions.length);
  scenario2Result.actions.forEach((a, i) => {
    console.log(`  ${i + 1}. [${a.type}] ${a.label}`);
  });

  // ==========================================
  // SCENARIO 3: Overload Detection (6 Hours Request)
  // ==========================================
  console.log("\n==========================================");
  console.log("SCENARIO 3: Overload Detection (6 Hours Requested)");
  console.log("Prompt: 'Schedule 6 hours of DBMS tomorrow.'");
  console.log("==========================================");

  const scenario3Result = await runPlannerAgent(
    userId,
    "Schedule 6 hours of DBMS tomorrow."
  );

  console.log("\n[Agent Response]:", scenario3Result.message);
  console.log("\n[Executed Actions]:", scenario3Result.actions.length);
  scenario3Result.actions.forEach((a, i) => {
    console.log(`  ${i + 1}. [${a.type}] ${a.label}`);
  });

  const finalState = await getStudentState(userId);
  console.log("\n==========================================");
  console.log("FINAL STUDENT STATE SNAPSHOT:");
  console.log({
    goals: finalState.goals.map((g) => ({ title: g.title, progress: g.progress })),
    todayTasksCount: finalState.tasks.today.length,
    upcomingTasksCount: finalState.tasks.upcoming.length,
    workload: finalState.workload,
  });
  console.log("==========================================");
  console.log("TEST RUN COMPLETED SUCCESSFULLY.");
  process.exit(0);
}

main().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
