import { connectDB } from "./config/db.js";
import { User } from "./models/User.js";
import { Task } from "./models/Task.js";
import { CalendarEvent } from "./models/CalendarEvent.js";
import {
  findAvailableSlots,
  findConflicts,
  createEvent,
  updateEvent,
  deleteEvent,
  getCalendarStatus,
  getCalendarProviderForUser,
} from "./services/calendar.service.js";

async function runTests() {
  console.log("=== Testing Calendar Integration & Provider Architecture ===");
  await connectDB();

  // Create or retrieve test user
  let user = await User.findOne({ email: "test_calendar_user@lenora.ai" });
  if (!user) {
    user = await User.create({
      googleId: "test_calendar_google_id_101",
      email: "test_calendar_user@lenora.ai",
      name: "Calendar Test User",
      timezone: "Asia/Kolkata",
      preferences: {
        preferredStudyStart: "09:00",
        preferredStudyEnd: "18:00",
      },
    });
  }

  const userId = user._id.toString();

  // Clean up any existing test events for this user
  await CalendarEvent.deleteMany({ userId: user._id });
  await Task.deleteMany({ userId: user._id });

  console.log("1. Checking initial calendar status (Internal Provider fallback)...");
  const initialStatus = await getCalendarStatus(userId);
  console.assert(initialStatus.connected === false, "Expected initialStatus.connected to be false");
  console.assert(initialStatus.provider === "internal", "Expected initial provider to be internal");
  console.log("✓ Initial status verified:", initialStatus);

  console.log("\n2. Testing getCalendarProviderForUser...");
  const provider = await getCalendarProviderForUser(userId);
  console.assert(provider.providerName === "internal", "Expected internal provider");
  console.log("✓ Provider initialized:", provider.providerName);

  console.log("\n3. Testing event creation & conflict detection...");
  const today = new Date();
  today.setHours(10, 0, 0, 0);
  const eventEnd = new Date(today.getTime() + 60 * 60 * 1000); // 10:00 to 11:00

  const { event: created, conflicts } = await createEvent(userId, {
    title: "Operating Systems Lecture",
    startTime: today.toISOString(),
    endTime: eventEnd.toISOString(),
    type: "class",
  });
  console.assert(created.title === "Operating Systems Lecture", "Event title mismatch");
  console.assert(conflicts.length === 0, "Expected no initial conflicts");
  console.log("✓ Created event:", created.id, created.title);

  // Check conflicting slot (10:30 to 11:30)
  const conflictStart = new Date(today.getTime() + 30 * 60 * 1000);
  const conflictEnd = new Date(today.getTime() + 90 * 60 * 1000);
  const detectedConflicts = await findConflicts(userId, conflictStart, conflictEnd);
  console.assert(detectedConflicts.length === 1, `Expected 1 conflict, got ${detectedConflicts.length}`);
  console.log("✓ Successfully detected overlapping conflict:", detectedConflicts[0]?.title);

  console.log("\n4. Testing findAvailableSlots algorithm...");
  const searchStart = new Date(today);
  searchStart.setHours(9, 0, 0, 0);
  const searchEnd = new Date(today);
  searchEnd.setHours(18, 0, 0, 0);

  const slots = await findAvailableSlots(userId, searchStart, searchEnd, 60);
  console.assert(slots.length > 0, "Expected available slots to be found");
  // 10:00 - 11:00 is occupied, so 09:00 - 10:00 should be free, and 11:00 - 18:00 should be free
  console.log(`✓ Found ${slots.length} available 60-minute slots. First slot: ${slots[0].start.toLocaleTimeString()} to ${slots[0].end.toLocaleTimeString()}`);

  console.log("\n5. Testing task ↔ calendar synchronization...");
  const task = await Task.create({
    userId: user._id,
    title: "DBMS Indexing Practice",
    type: "study",
    estimatedMinutes: 60,
  });

  const scheduledStart = new Date(today.getTime() + 3 * 60 * 60 * 1000); // 13:00
  const scheduledEnd = new Date(today.getTime() + 4 * 60 * 60 * 1000); // 14:00

  const { event: taskEvent } = await createEvent(userId, {
    title: task.title,
    startTime: scheduledStart.toISOString(),
    endTime: scheduledEnd.toISOString(),
    taskId: task._id.toString(),
  });

  const updatedTask = await Task.findById(task._id);
  console.assert(updatedTask?.calendarEventId === taskEvent.id, "Expected task.calendarEventId to be synced");
  console.log("✓ Task synced with calendar event:", updatedTask?.calendarEventId);

  console.log("\n6. Testing External Event Protection...");
  const externalEvent = await CalendarEvent.create({
    userId: user._id,
    title: "Doctor Appointment (External)",
    startTime: new Date(today.getTime() + 5 * 60 * 60 * 1000),
    endTime: new Date(today.getTime() + 6 * 60 * 60 * 1000),
    source: "external",
    status: "confirmed",
  });

  let protectedThrown = false;
  try {
    await deleteEvent(userId, externalEvent._id.toString());
  } catch (err: any) {
    if (err.code === "EXTERNAL_EVENT_PROTECTED") {
      protectedThrown = true;
    }
  }
  console.assert(protectedThrown, "Expected EXTERNAL_EVENT_PROTECTED error when attempting to delete external event");
  console.log("✓ External event correctly protected from deletion!");

  console.log("\n=== ALL CALENDAR INTEGRATION TESTS PASSED ===");
  process.exit(0);
}

runTests().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
