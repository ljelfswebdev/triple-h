import assert from "node:assert/strict";
import test from "node:test";
import { seedForms } from "../src/lib/admin/forms.js";
import { normaliseForm } from "../src/lib/forms.js";

const form = (fields) => ({ name: "Test form", key: "test-form", fields });

test("Form Maker seeds exactly the three live Triple H forms", () => {
  assert.deepEqual(seedForms.map(({ key }) => key).sort(), [
    "career-application",
    "newsletter-signup",
    "service-enquiry",
  ]);
  assert.ok(seedForms.every(({ fields }) => fields.length > 0));
});

test("normaliseForm rejects names that collide after normalisation", () => {
  assert.throws(
    () =>
      normaliseForm(
        form([
          { type: "text", name: "Email Address", label: "Email" },
          { type: "text", name: "email_address", label: "Confirm email" },
        ]),
      ),
    /Duplicate form field name: email_address/,
  );
});

test("normaliseForm rejects empty and case-insensitively duplicated option values", () => {
  assert.throws(
    () =>
      normaliseForm(
        form([
          {
            type: "select",
            name: "service",
            options: [
              { label: "First", value: "delivery" },
              { label: "Second", value: "DELIVERY" },
            ],
          },
        ]),
      ),
    /duplicate option values/,
  );
  assert.throws(
    () =>
      normaliseForm(
        form([{ type: "select", name: "service", options: [{ label: "", value: "" }] }]),
      ),
    /empty option value/i,
  );
});
