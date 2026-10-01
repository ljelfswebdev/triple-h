import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const asyncFormComponents = [
  "src/components/forms/QuickEnquiry.js",
  "src/components/forms/CareerApplication.js",
  "src/components/forms/NewsletterSignup.js",
];

test("async forms retain the form element before awaiting a request", () => {
  for (const file of asyncFormComponents) {
    const source = fs.readFileSync(file, "utf8");
    const captureIndex = source.indexOf("const formElement = event.currentTarget;");
    const firstAwaitIndex = source.indexOf("await ");

    assert.notEqual(captureIndex, -1, `${file} must retain the submitted form element`);
    assert.ok(
      captureIndex < firstAwaitIndex,
      `${file} must retain the form before its first await`,
    );
    assert.match(source, /formElement\.reset\(\);/);
    assert.doesNotMatch(source, /event\.currentTarget\.reset\(\);/);
  }
});
