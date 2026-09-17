import { createApp } from "./app.js";
import { connectDB } from "./config/db.js";
import { env } from "./config/env.js";

async function start() {
  await connectDB();

  const app = createApp();
  app.listen(env.PORT, () => {
    console.info(`Lenora API listening on port ${env.PORT}`);
  });
}

start().catch((error: unknown) => {
  console.error("Unable to start Lenora API", error);
  process.exit(1);
});
