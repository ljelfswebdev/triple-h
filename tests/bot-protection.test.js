import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";

const protectedRoutes = [
  "applications",
  "submissions",
  "newsletter",
  "auth/login",
  "auth/forgot-password",
  "auth/reset-password",
  "portal/auth/login",
  "portal/auth/register",
  "portal/password",
];

test("BotID initializes before hydration for every public mutation route", () => {
  const instrumentation = readFileSync(
    new URL("../src/instrumentation-client.js", import.meta.url),
    "utf8",
  );
  for (const route of protectedRoutes) {
    assert.match(instrumentation, new RegExp(`/api/${route.replaceAll("/", "\\/")}`));
  }
  const nextConfig = readFileSync(new URL("../next.config.mjs", import.meta.url), "utf8");
  assert.match(nextConfig, /withBotId\(nextConfig\)/);
});

test("every protected endpoint performs server-side BotID verification", () => {
  for (const route of protectedRoutes) {
    const source = readFileSync(
      new URL(`../src/app/api/${route}/route.js`, import.meta.url),
      "utf8",
    );
    assert.match(source, /botProtectionResponse/);
    assert.match(source, /if \(blocked\) return blocked/);
  }
});
