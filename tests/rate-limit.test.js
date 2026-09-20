import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import test from "node:test";
import { rateLimit, rateLimitResponse } from "../src/lib/rate-limit.js";

test("the fallback rate limiter enforces a fixed window and returns useful headers", async () => {
  const key = `test-${randomUUID()}`;
  assert.deepEqual(await rateLimit({ key, limit: 2, windowMs: 60_000 }), {
    allowed: true,
    remaining: 1,
    retryAfter: 60,
  });
  assert.equal((await rateLimit({ key, limit: 2, windowMs: 60_000 })).allowed, true);
  const blocked = await rateLimit({ key, limit: 2, windowMs: 60_000 });
  assert.equal(blocked.allowed, false);
  assert.equal(blocked.remaining, 0);

  const response = rateLimitResponse(blocked);
  assert.equal(response.status, 429);
  assert.equal(response.headers.get("cache-control"), "no-store");
  assert.match(response.headers.get("retry-after"), /^\d+$/);
});

test("a shared adapter can replace the in-memory limiter", async (context) => {
  const original = globalThis.__cmsRateLimitAdapter;
  context.after(() => {
    globalThis.__cmsRateLimitAdapter = original;
  });
  const calls = [];
  globalThis.__cmsRateLimitAdapter = {
    consume(options) {
      calls.push(options);
      return { allowed: false, remaining: 0, retryAfter: 42 };
    },
  };
  assert.deepEqual(await rateLimit({ key: "shared", limit: 1, windowMs: 1_000 }), {
    allowed: false,
    remaining: 0,
    retryAfter: 42,
  });
  assert.deepEqual(calls, [{ key: "shared", limit: 1, windowMs: 1_000 }]);
});
