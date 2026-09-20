import assert from "node:assert/strict";
import test from "node:test";
import mongoose from "mongoose";
import { dbConnect } from "../src/lib/db.js";

test("dbConnect clears a rejected connection so a transient failure can retry", async (context) => {
  const previousUri = process.env.MONGODB_URI;
  process.env.MONGODB_URI = "mongodb://example.invalid/test";
  context.after(() => {
    if (previousUri === undefined) delete process.env.MONGODB_URI;
    else process.env.MONGODB_URI = previousUri;
    globalThis.mongoose.conn = null;
    globalThis.mongoose.promise = null;
  });

  globalThis.mongoose.conn = null;
  globalThis.mongoose.promise = null;
  let attempts = 0;
  context.mock.method(mongoose, "connect", async () => {
    attempts += 1;
    if (attempts === 1) throw new Error("temporary outage");
    return mongoose;
  });

  await assert.rejects(dbConnect(), /temporary outage/);
  assert.equal(await dbConnect(), mongoose);
  assert.equal(attempts, 2);
});
