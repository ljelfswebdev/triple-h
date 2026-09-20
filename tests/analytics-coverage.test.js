import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { sanitiseAnalyticsProperties } from "../src/lib/analytics-events.js";

const read = (file) => readFileSync(new URL(file, import.meta.url), "utf8");

test("analytics properties discard personal data and constrain string values", () => {
  assert.deepEqual(
    sanitiseAnalyticsProperties({
      email: "person@example.com",
      phone: "07123456789",
      password: "secret",
      destination: `/services/${"a".repeat(150)}`,
      resultCount: 12,
      active: true,
      nested: { unsafe: true },
    }),
    {
      destination: `/services/${"a".repeat(110)}`,
      resultCount: 12,
      active: true,
    },
  );
});

test("public analytics covers performance, conversions and key interactions", () => {
  const manager = read("../src/components/global/AnalyticsManager.js");
  const forms = [
    "../src/components/forms/QuickEnquiry.js",
    "../src/components/forms/CareerApplication.js",
    "../src/components/forms/NewsletterSignup.js",
    "../src/components/forms/FormClient.js",
  ]
    .map(read)
    .join("\n");
  const portal = read("../src/components/portal/PortalApp.js");
  const news = read("../src/components/news/NewsArchive.js");

  assert.match(manager, /<Analytics beforeSend=/);
  assert.match(manager, /<SpeedInsights beforeSend=/);
  assert.match(manager, /Form Started/);
  assert.match(manager, /CTA Click/);
  assert.match(manager, /Card Click/);
  assert.match(manager, /Download/);
  assert.match(manager, /Contact Click/);
  assert.match(forms, /trackFormCompleted/);
  assert.match(forms, /Newsletter Signup/);
  assert.match(portal, /Customer Registration/);
  assert.match(portal, /Portal Action/);
  assert.match(news, /News Search/);
  assert.match(news, /News Filter/);
  assert.match(news, /News Sort/);
});
