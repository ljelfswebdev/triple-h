import assert from "node:assert/strict";
import test from "node:test";
import { vacancySummary } from "../src/lib/vacancies.js";

test("vacancy summaries support current and legacy seeded records", () => {
  assert.equal(
    vacancySummary({ location: "Yorkshire", hours: "Full time", salary: "Competitive" }),
    "Yorkshire · Full time · Competitive",
  );
  assert.equal(
    vacancySummary({ meta: { location: "Nationwide", hours: "Nights", salary: "£40k" } }),
    "Nationwide · Nights · £40k",
  );
});

test("vacancy summaries never render missing values as undefined", () => {
  assert.equal(vacancySummary({ meta: { location: "West Yorkshire" } }), "West Yorkshire");
  assert.equal(vacancySummary({}), "");
});
