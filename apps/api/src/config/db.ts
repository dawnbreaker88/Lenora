import mongoose from "mongoose";
import { env } from "./env.js";

let dbPromise: Promise<typeof mongoose> | null = null;

export async function connectDB() {
  if (mongoose.connection.readyState === 1) {
    return;
  }
  if (!dbPromise) {
    dbPromise = mongoose.connect(env.MONGODB_URI, {
      dbName: "lenora",
    }).then((m) => {
      console.info(`MongoDB connected to database: "${mongoose.connection.name}"`);
      return m;
    }).catch((err) => {
      dbPromise = null;
      throw err;
    });
  }
  await dbPromise;
}

export function isDatabaseConnected() {
  return mongoose.connection.readyState === 1;
}
