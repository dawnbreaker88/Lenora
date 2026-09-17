import { User } from "../models/User.js";

export async function getOrCreateUser(googleId: string, email: string, name: string, image?: string) {
  return User.findOneAndUpdate(
    { googleId },
    { $set: { email, name, image, lastActiveAt: new Date() } },
    { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
  );
}
