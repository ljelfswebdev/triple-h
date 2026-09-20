import { config } from "dotenv";
import mongoose from "mongoose";
import { defaultSiteCopy } from "../src/lib/site-copy.js";

config({ path: ".env.local" });

const uri = process.env.MONGODB_URI;
if (!uri) throw new Error("MONGODB_URI is required in .env.local");

function merge(defaultValue, currentValue) {
  if (Array.isArray(defaultValue)) return Array.isArray(currentValue) && currentValue.length ? currentValue : defaultValue;
  if (defaultValue && typeof defaultValue === "object") {
    return Object.fromEntries(Object.keys({ ...defaultValue, ...currentValue }).map((key) => [key, merge(defaultValue[key], currentValue?.[key])]));
  }
  return currentValue ?? defaultValue;
}

await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });

try {
  const globals = mongoose.connection.collection("globals");
  const existing = await globals.findOne({ key: "site" });
  await globals.updateOne(
    { key: "site" },
    {
      $set: { siteCopy: merge(defaultSiteCopy, existing?.siteCopy || {}), updatedAt: new Date() },
      $setOnInsert: { key: "site", createdAt: new Date() },
    },
    { upsert: true },
  );
  console.log("Seeded editable shared site copy without replacing existing values.");
} finally {
  await mongoose.disconnect();
}
