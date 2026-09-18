import { createApp } from "./app.js";
import { connectDB } from "./config/db.js";
import { env } from "./config/env.js";
import { startEventWorker, stopEventWorker } from "./workers/event-worker.js";
import { startSchedulerWorker, stopSchedulerWorker } from "./workers/scheduler-worker.js";

async function start() {
  await connectDB();

  const app = createApp();
  const server = app.listen(env.PORT, () => {
    console.info(`Lenora API listening on port ${env.PORT}`);
    // Start background event processor and scheduler worker
    startEventWorker();
    startSchedulerWorker();
  });

  const shutdown = () => {
    console.info("Shutting down Lenora workers and server...");
    stopEventWorker();
    stopSchedulerWorker();
    server.close(() => {
      process.exit(0);
    });
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

start().catch((error: unknown) => {
  console.error("Unable to start Lenora API", error);
  process.exit(1);
});
// Trigger server reload for updated OAuth .env

