import assert from "node:assert/strict";
import test from "node:test";
import { filterNewsItems, newsMonthKey, newsMonthLabel } from "../src/lib/news-filters.js";
import { news } from "../src/lib/triple-h-data.js";

test("the news seed contains 24 uniquely-addressable categorised stories", () => {
  assert.equal(news.length, 24);
  assert.equal(new Set(news.map((item) => item.slug)).size, news.length);
  assert.ok(news.every((item) => item.category && item.date && item.excerpt));
  assert.ok(new Set(news.map((item) => item.category)).size >= 7);
});

test("news can be filtered by search, category and month", () => {
  assert.equal(filterNewsItems(news, { category: "Projects" }).length, 5);
  assert.equal(filterNewsItems(news, { date: "2026-06" }).length, 2);
  assert.deepEqual(
    filterNewsItems(news, { search: "remote-controlled mower" }).map((item) => item.slug),
    ["new-remote-controlled-mower"],
  );
  assert.deepEqual(
    filterNewsItems(news, { category: "Environment", date: "2026-04" }).map((item) => item.slug),
    ["protecting-nesting-season"],
  );
});

test("news date helpers build stable month filters and newest-first results", () => {
  assert.equal(newsMonthKey({ publishedAt: "2026-09-12T12:00:00.000Z" }), "2026-09");
  assert.equal(newsMonthLabel("2026-09"), "September 2026");
  assert.equal(filterNewsItems(news)[0].slug, "inside-a-triple-h-delivery-day");
  assert.equal(
    filterNewsItems(news, { sort: "date-asc" })[0].slug,
    "bridge-inspection-enabling-works",
  );
  assert.equal(
    filterNewsItems(news, { sort: "title-asc" })[0].title,
    "Backing the next generation of women in arboriculture",
  );
  assert.equal(
    filterNewsItems(news, { sort: "title-desc" })[0].title,
    "What we learned from this winter’s emergency response",
  );
});
