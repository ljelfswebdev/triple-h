import assert from "node:assert/strict";
import test from "node:test";
import { createDefaultPage, publicPageDefinitions } from "../src/lib/page-definitions.js";

const expectedRoutes = [
  "/",
  "/404",
  "/about",
  "/about/meet-the-team",
  "/about/our-story",
  "/about/testimonials",
  "/about/values",
  "/careers",
  "/compliance",
  "/contact",
  "/cookie-policy",
  "/news",
  "/privacy-policy",
  "/projects",
  "/services",
  "/terms-and-conditions",
];

test("the Pages admin registers every public static/index page exactly once", () => {
  const routes = Object.entries(publicPageDefinitions)
    .map(([slug, definition]) => definition.publicPath || `/${slug}`)
    .sort();

  assert.deepEqual(routes, expectedRoutes.sort());
  assert.equal(new Set(routes).size, routes.length);
});

test("Triple H page defaults contain complete editable brand content", () => {
  const homepage = createDefaultPage("homepage");
  const about = createDefaultPage("about");

  assert.equal(homepage.content.hero.title, "Real work. Great people. Building tomorrow.");
  assert.equal(homepage.content.proof.items.length, 4);
  assert.equal(about.content.directory.items.length, 4);
  assert.equal(homepage.seo.title, "Triple H Contracts & Hire");
  assert.equal(homepage.seo.canonical, "/");
  assert.ok(homepage.seo.description);
  assert.ok(homepage.seo.ogImage);
});
