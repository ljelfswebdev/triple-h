import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const homepageSource = readFileSync(
  new URL("../src/components/sections/triple-h/HomePage.js", import.meta.url),
  "utf8",
);
const contentSource = readFileSync(new URL("../src/lib/content-items.js", import.meta.url), "utf8");

test("the homepage recruitment button requires a published vacancy", () => {
  assert.match(homepageSource, /const hasVacancies = vacancies\.length > 0/);
  assert.match(homepageSource, /hasVacancies \? <Link[^>]+href=\{heroActions\.careersLink\.url\}/);
  assert.match(contentSource, /ContentItem\.find\(\{ kind, status: "published" \}\)/);
});

test("an intentionally empty content collection does not restore demo records", () => {
  assert.match(contentSource, /return serialize\(items\)/);
  assert.doesNotMatch(contentSource, /items\.length \? serialize\(items\)/);
});
