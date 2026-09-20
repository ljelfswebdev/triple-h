import assert from "node:assert/strict";
import test from "node:test";
import {
  createPageBuilderBlock,
  normalizePageBuilderBlocks,
  PAGE_BUILDER_TYPES,
  pageBuilderEnabled,
} from "../src/lib/page-builder.js";
import { news } from "../src/lib/triple-h-data.js";

test("every advertised page-builder component has a valid default", () => {
  for (const type of PAGE_BUILDER_TYPES) {
    const block = createPageBuilderBlock(type.value, `test-${type.value}`);
    assert.equal(block.type, type.value);
    assert.equal(block.id, `test-${type.value}`);
  }
});

test("page-builder mode requires both the switch and at least one block", () => {
  assert.equal(pageBuilderEnabled({ meta: { pageBuilderEnabled: true, blocks: [] } }), false);
  assert.equal(pageBuilderEnabled({ meta: { pageBuilderEnabled: false, blocks: [{}] } }), false);
  assert.equal(
    pageBuilderEnabled({ meta: { pageBuilderEnabled: true, blocks: [{ type: "content" }] } }),
    true,
  );
});

test("unknown blocks are discarded and the saved block count is bounded", () => {
  const blocks = Array.from({ length: 110 }, (_, index) => ({
    type: "content",
    body: String(index),
  }));
  blocks.unshift({ type: "not-a-real-component" });
  const normalized = normalizePageBuilderBlocks(blocks);
  assert.equal(normalized.length, 99);
  assert.ok(normalized.every((block) => block.type === "content" && block.id));
});

test("the showcase news story exercises every page-builder component", () => {
  const showcase = news.find((item) => item.slug === "inside-a-triple-h-delivery-day");
  assert.ok(showcase);
  assert.equal(showcase.pageBuilderEnabled, true);
  assert.deepEqual(
    new Set(showcase.blocks.map((block) => block.type)),
    new Set(PAGE_BUILDER_TYPES.map((type) => type.value)),
  );
  assert.ok(showcase.blocks.find((block) => block.type === "gallery").images.length >= 4);
  const video = showcase.blocks.find((block) => block.type === "video");
  assert.equal(video.controls, true);
  assert.ok(video.poster.secureUrl);
});
