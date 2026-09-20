import assert from "node:assert/strict";
import test from "node:test";
import { formPlaceholder } from "../src/lib/form-placeholders.js";

test("form placeholders provide useful defaults for every empty control type", () => {
  assert.equal(formPlaceholder({ label: "Name", name: "name" }), "Full name");
  assert.equal(formPlaceholder({ label: "Work email", type: "email" }), "name@company.com");
  assert.equal(formPlaceholder({ label: "Phone", type: "tel" }), "e.g. 07939 306252");
  assert.equal(
    formPlaceholder({ label: "Service required", type: "select" }),
    "Select service required",
  );
  assert.equal(formPlaceholder({ label: "Message", type: "textarea" }), "Write your message");
  assert.equal(formPlaceholder({ label: "Image URL", inputType: "url" }), "https://example.com");
  assert.equal(formPlaceholder({ label: "New password", type: "password" }), "Enter your password");
});
