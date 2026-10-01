import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { defaultGlobals, globalTabs } from "../src/lib/admin/globals.js";
import { defaultSiteCopy } from "../src/lib/site-copy.js";
import { createDefaultPage, pageDefinitions } from "../src/lib/page-definitions.js";
import { seedForms } from "../src/lib/admin/forms.js";
import { CUSTOMER_PORTAL_ENABLED, isPortalPath, isPublicPageEnabled } from "../src/lib/features.js";

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
      "detail",
      "footer",
      "header",
      "pagination",
    ]),
  );
  assert.deepEqual(defaultGlobals.siteCopy, defaultSiteCopy);
  const brandingTab = globalTabs.find((tab) => tab.id === "branding");
  assert.equal(brandingTab.fields.find((field) => field.name === "logo")?.type, "media");
  assert.equal(defaultGlobals.siteCopy.branding.logo.secureUrl, "/images/triple-h-logo.png");
});

test("page-specific and form-specific copy lives in the correct admin area", () => {
  assert.equal(createDefaultPage("services").content.detail, undefined);
  assert.equal(createDefaultPage("projects").content.detail, undefined);
  assert.equal(createDefaultPage("news").content.detail, undefined);
  assert.equal(createDefaultPage("careers").content.vacancy, undefined);
  assert.ok(createDefaultPage("portal").content.portal.auth);
  assert.ok(createDefaultPage("portal-reset-password").content.reset);
  assert.ok(createDefaultPage("not-found").content.notFound);
  assert.deepEqual(
    new Set(seedForms.map((form) => form.key)),
    new Set(["service-enquiry", "career-application", "newsletter-signup"]),
  );
});

test("the dormant customer portal is absent from public and admin surfaces", () => {
  assert.equal(CUSTOMER_PORTAL_ENABLED, false);
  assert.equal(isPublicPageEnabled("portal"), false);
  assert.equal(isPublicPageEnabled("portal-reset-password"), false);
  assert.equal(isPublicPageEnabled("homepage"), true);
  assert.equal(isPortalPath("/portal"), true);
  assert.equal(isPortalPath("/portal/reset-password"), true);
  assert.equal(isPortalPath("/contact"), false);

  const header = readFileSync(
    new URL("../src/components/global/HeaderClient.js", import.meta.url),
    "utf8",
  );
  const headerData = readFileSync(
    new URL("../src/components/global/Header.js", import.meta.url),
    "utf8",
  );
  const footer = readFileSync(
    new URL("../src/components/global/Footer.js", import.meta.url),
    "utf8",
  );
  assert.match(header, /CUSTOMER_PORTAL_ENABLED/);
  assert.match(headerData, /isPortalPath/);
  assert.match(footer, /isPortalPath/);

  for (const route of [
    "../src/app/api/auth/forgot-password/route.js",
    "../src/app/api/auth/reset-password/route.js",
    "../src/app/api/portal/auth/login/route.js",
    "../src/app/api/portal/auth/register/route.js",
    "../src/app/api/portal/overview/route.js",
    "../src/app/api/portal/password/route.js",
  ]) {
    const source = readFileSync(new URL(route, import.meta.url), "utf8");
    assert.match(source, /CUSTOMER_PORTAL_ENABLED/);
    assert.match(source, /status: 404/);
  }
});

test("post types do not inherit hidden detail-page content", () => {
  for (const slug of ["services", "projects", "news", "careers"]) {
    assert.equal(
      pageDefinitions[slug].tabs.some((tab) => tab.id === "detail" || tab.id === "vacancy"),
      false,
    );
  }
});

test("admin editors follow the public page from top to bottom", () => {
  assert.deepEqual(
    pageDefinitions.homepage.tabs.map((tab) => tab.id),
    [
      "hero",
      "hero-actions",
      "proof",
      "ticker",
      "capability",
      "standard",
      "projects",
      "careers",
      "news",
      "emergency",
      "seo",
    ],
  );

  const editor = readFileSync(
    new URL("../src/components/admin/ContentTypeViews.js", import.meta.url),
    "utf8",
  );
  const tabs = editor.slice(
    editor.indexOf("const editorTabs = ["),
    editor.indexOf("const [activeTab"),
  );
  const orderedTabs = ["hero", "content", "builder", "conversion", "publishing", "seo"];
  orderedTabs.reduce((previousIndex, tab) => {
    const currentIndex = tabs.indexOf(`id: "${tab}"`);
    assert.ok(currentIndex > previousIndex, `${tab} should follow the preceding page section`);
    return currentIndex;
  }, -1);
});

test("standard detail pages expose every template section to the post editor", () => {
  const editor = readFileSync(
    new URL("../src/components/admin/ContentTypeViews.js", import.meta.url),
    "utf8",
  );
  const template = readFileSync(
    new URL("../src/components/sections/triple-h/DetailPage.js", import.meta.url),
    "utf8",
  );

  for (const key of [
    "heroEyebrow",
    "contentEyebrow",
    "contentHeading",
    "safetyHeading",
    "safetyText",
    "enquiryEyebrow",
    "enquiryHeading",
    "nextEyebrow",
    "nextHeading",
    "enquiryLink",
    "projectsLink",
  ]) {
    assert.match(editor, new RegExp(key), `${key} must be editable per post`);
    assert.match(
      template,
      new RegExp(`item\\.meta\\?\\.${key}`),
      `${key} must render its post override`,
    );
  }

  assert.match(editor, /imageAlt/);
  assert.match(template, /imageAlt=\{item\.meta\?\.imageAlt\}/);
  assert.doesNotMatch(editor, /Fallback content/);
  assert.doesNotMatch(template, /fallbackText|getEditablePage/);
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
