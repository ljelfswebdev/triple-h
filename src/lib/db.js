import mongoose from "mongoose";
let cached = global.mongoose;
if (!cached) cached = global.mongoose = { conn: null, promise: null };
export async function dbConnect() {
  if (cached.conn) return cached.conn;
  if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI missing");
  if (!cached.promise) cached.promise = mongoose.connect(process.env.MONGODB_URI).then((m) => m);
  try {
    cached.conn = await cached.promise;
  } catch (error) {
    // Do not permanently cache a rejected promise; transient outages must recover.
    cached.promise = null;
    cached.conn = null;
    throw error;
  }
  return cached.conn;
}
