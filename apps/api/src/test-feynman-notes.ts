import { connectDB } from "./config/db.js";
import { Document } from "./models/Document.js";
import { DocumentChunk } from "./models/DocumentChunk.js";
import { User } from "./models/User.js";
import { runFeynmanAgent } from "./agents/feynman.js";

async function testWithUploadedNotes() {
  await connectDB();

  // Find all users and documents
  const docs = await Document.find({}).sort({ createdAt: -1 });
  console.log(`Found ${docs.length} uploaded document(s) in MongoDB:`);
  docs.forEach((d) => {
    console.log(`- Doc ID: ${d._id}, Title: "${d.title}", User ID: ${d.userId}, Status: ${d.processingStatus}`);
  });

  if (docs.length === 0) {
    console.log("No documents found in MongoDB.");
    process.exit(0);
  }

  const activeDoc = docs[0];
  const userId = activeDoc.userId.toString();
  const user = await User.findById(userId);
  console.log(`\nActive student: ${user?.name} (${user?.email}) [${userId}]`);

  // Check chunks count
  const chunksCount = await DocumentChunk.countDocuments({ userId: activeDoc.userId });
  console.log(`Vector chunks for this student: ${chunksCount}`);

  // Now run Feynman Agent with the student's actual uploaded DBMS notes!
  console.log("\n==========================================");
  console.log("RUNNING FEYNMAN AGENT WITH UPLOADED NOTES");
  console.log("Prompt: 'Teach me normalization according to my uploaded DBMS notes.'");
  console.log("==========================================");

  const turn1 = await runFeynmanAgent({
    userId,
    topicName: "Database Normalization",
    subject: "DBMS",
    message: "Teach me normalization according to my uploaded DBMS notes.",
  });

  console.log("\n[Feynman Response Turn 1]:\n", turn1.message);
  console.log("\n[Actions Executed]:", turn1.actions.length);
  turn1.actions.forEach((a, i) => console.log(`  ${i + 1}. [${a.type}] ${a.label}`));

  // Turn 2: Student responds with a question about 1NF / 2NF from the notes
  console.log("\n==========================================");
  console.log("TURN 2: Student explains with a partial answer");
  console.log("Prompt: 'From my notes, 1NF says each column must have atomic values. But what about multi-valued attributes?'");
  console.log("==========================================");

  const turn2 = await runFeynmanAgent({
    userId,
    sessionId: turn1.sessionId,
    message: "From my notes, 1NF says each column must have atomic values. But what about multi-valued attributes?",
  });

  console.log("\n[Feynman Response Turn 2]:\n", turn2.message);
  console.log("\n[Actions Executed]:", turn2.actions.length);
  turn2.actions.forEach((a, i) => console.log(`  ${i + 1}. [${a.type}] ${a.label}`));
  console.log("\n[Recorded Evidence]:", turn2.evidence);
  console.log("[Topic Snapshot]:", turn2.topic);

  console.log("\n==========================================");
  console.log("TEST WITH UPLOADED NOTES COMPLETED SUCCESSFULLY.");
  console.log("==========================================");
  process.exit(0);
}

testWithUploadedNotes().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
