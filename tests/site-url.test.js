import assert from "node:assert/strict";
import test from "node:test";
import { getSiteUrl } from "../src/lib/site-url.js";

function setEnvironment(context, values) {
  const previous = Object.fromEntries(Object.keys(values).map((key) => [key, process.env[key]]));
  Object.entries(values).forEach(([key, value]) => {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  });
  context.after(() => {
    Object.entries(previous).forEach(([key, value]) => {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    });
  });
}

test("site URL defaults to localhost only outside production", (context) => {
  setEnvironment(context, { NODE_ENV: "development", NEXT_PUBLIC_SITE_URL: undefined });
  assert.equal(getSiteUrl(), "http://localhost:3000");
});

test("site URL is mandatory in production", (context) => {
  setEnvironment(context, { NODE_ENV: "production", NEXT_PUBLIC_SITE_URL: undefined });
  assert.throws(() => getSiteUrl(), /required in production/);
});

test("site URL rejects invalid schemes and embedded credentials", (context) => {
  setEnvironment(context, { NODE_ENV: "production", NEXT_PUBLIC_SITE_URL: "not-a-url" });
  assert.throws(() => getSiteUrl(), /valid absolute URL/);
  process.env.NEXT_PUBLIC_SITE_URL = "ftp://example.com";
  assert.throws(() => getSiteUrl(), /http or https/);
  process.env.NEXT_PUBLIC_SITE_URL = "https://admin:secret@example.com";
  assert.throws(() => getSiteUrl(), /must not contain credentials/);
});

test("production site URL must be an origin without path, query, or hash", (context) => {
  setEnvironment(context, {
    NODE_ENV: "production",
    NEXT_PUBLIC_SITE_URL: "https://example.com/cms",
  });
  assert.throws(() => getSiteUrl(), /must be an origin/);
  process.env.NEXT_PUBLIC_SITE_URL = "https://example.com/?preview=1";
  assert.throws(() => getSiteUrl(), /must be an origin/);
  process.env.NEXT_PUBLIC_SITE_URL = "https://example.com/#section";
  assert.throws(() => getSiteUrl(), /must be an origin/);
  process.env.NEXT_PUBLIC_SITE_URL = "https://example.com/";
  assert.equal(getSiteUrl(), "https://example.com");
});
