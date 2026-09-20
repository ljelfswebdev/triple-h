import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { defaultGlobals, globalTabs } from "../src/lib/admin/globals.js";
import { defaultSiteCopy } from "../src/lib/site-copy.js";
import { createDefaultPage } from "../src/lib/page-definitions.js";
import { seedForms } from "../src/lib/admin/forms.js";

test("Globals only contains truly shared public copy", () => {
  const editableGroups = new Set(
    globalTabs.filter((tab) => tab.path?.[0] === "siteCopy").map((tab) => tab.path[1]),
  );

  assert.deepEqual(
    editableGroups,
    new Set([
      "accreditationBanner",
      "branding",
      "cards",
      "cookie",
      "footer",
      "header",
      "pagination",
    ]),
  );
  assert.deepEqual(defaultGlobals.siteCopy, defaultSiteCopy);
});

test("page-specific and form-specific copy lives in the correct admin area", () => {
  assert.ok(createDefaultPage("services").content.detail);
  assert.ok(createDefaultPage("projects").content.detail);
  assert.ok(createDefaultPage("news").content.detail);
  assert.ok(createDefaultPage("careers").content.vacancy);
  assert.ok(createDefaultPage("portal").content.portal.auth);
  assert.ok(createDefaultPage("portal-reset-password").content.reset);
  assert.ok(createDefaultPage("not-found").content.notFound);
  assert.deepEqual(
    new Set(seedForms.map((form) => form.key)),
    new Set(["service-enquiry", "career-application", "newsletter-signup"]),
  );
});

test("homepage calls to action store both their label and destination in Pages", () => {
  const homepage = createDefaultPage("homepage");

  for (const link of [
    homepage.content.heroActions.primaryLink,
    homepage.content.heroActions.careersLink,
    homepage.content.standard.link,
    homepage.content.projects.link,
    homepage.content.careers.link,
  ]) {
    assert.equal(typeof link.label, "string");
    assert.equal(typeof link.url, "string");
    assert.equal(typeof link.newTab, "boolean");
  }
});

test("homepage values ticker is independently editable and has useful seeded copy", () => {
  const homepage = createDefaultPage("homepage");

  assert.equal(homepage.content.ticker.ariaLabel, "Triple H values and standards");
  assert.deepEqual(
    homepage.content.ticker.items.map((item) => item.text),
    [
      "Safety",
      "Quality",
      "Teamwork",
      "Progression",
      "Accountability",
      "Capability",
      "Reliability",
      "Respect",
    ],
  );
  assert.equal(homepage.content.heroActions.railItems, undefined);
});

test("live Triple H components do not import seed-only marketing data", () => {
  const files = [
    "../src/components/sections/triple-h/HomePage.js",
    "../src/components/sections/triple-h/ArchivePage.js",
    "../src/components/sections/triple-h/DetailPage.js",
    "../src/components/global/Header.js",
    "../src/components/global/Footer.js",
    "../src/components/forms/QuickEnquiry.js",
    "../src/components/forms/CareerApplication.js",
    "../src/components/forms/NewsletterSignup.js",
    "../src/components/portal/PortalApp.js",
  ];

  for (const file of files) {
    const source = readFileSync(new URL(file, import.meta.url), "utf8");
    assert.doesNotMatch(source, /triple-h-data|\bBRAND\b|\bMEDIA\b/, file);
  }
});
