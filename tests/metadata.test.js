import assert from "node:assert/strict";
import test from "node:test";
import { createContentMetadata, createPageMetadata } from "../src/lib/metadata.js";

test("page metadata uses every admin-controlled SEO field", () => {
  const metadata = createPageMetadata({
    title: "Internal title",
    seo: {
      title: "SEO title",
      description: "Search description",
      keywords: "trees, infrastructure",
      ogTitle: "Social title",
      ogDescription: "Social description",
      ogImage: { secureUrl: "https://example.com/social.jpg", alt: "Team at work" },
      canonical: "/services/tree-surgery",
      noIndex: true,
    },
  });

  assert.equal(metadata.title.absolute, "SEO title");
  assert.equal(metadata.description, "Search description");
  assert.deepEqual(metadata.keywords, ["trees", "infrastructure"]);
  assert.deepEqual(metadata.alternates, { canonical: "/services/tree-surgery" });
  assert.deepEqual(metadata.robots, { index: false, follow: false });
  assert.equal(metadata.openGraph.title, "Social title");
  assert.equal(metadata.openGraph.images[0].alt, "Team at work");
});

test("detail metadata retains useful admin-content fallbacks", () => {
  const metadata = createContentMetadata({
    kind: "service",
    slug: "tree-surgery",
    title: "Tree Surgery",
    excerpt: "Commercial arboriculture for complex sites.",
    category: "Arboriculture",
    image: "https://example.com/tree.jpg",
    seo: {},
  });

  assert.equal(metadata.description, "Commercial arboriculture for complex sites.");
  assert.deepEqual(metadata.alternates, { canonical: "/services/tree-surgery" });
  assert.equal(metadata.openGraph.images[0].url, "https://example.com/tree.jpg");
});
