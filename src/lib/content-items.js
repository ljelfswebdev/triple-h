import { cache } from "react";
import { unstable_cache } from "next/cache";
import { dbConnect } from "./db";
import ContentItem from "@/models/ContentItem";
import { sanitizeCmsValue, sanitizeHtml } from "./security";
import { normalizePageBuilderBlocks } from "./page-builder";

const serialize = (value) => sanitizeCmsValue(JSON.parse(JSON.stringify(value)));

export const ORDERABLE_CONTENT_KINDS = new Set([
  "service",
  "project",
  "vacancy",
  "accreditation",
  "team-member",
  "testimonial",
]);

export function contentSortForKind(kind) {
  return ORDERABLE_CONTENT_KINDS.has(kind)
    ? { sortOrder: 1, _id: 1 }
    : { publishedAt: -1, title: 1 };
}

const cachedCollection = unstable_cache(
  async (kind) => {
    try {
      await dbConnect();
      const items = await ContentItem.find({ kind, status: "published" })
        .sort(contentSortForKind(kind))
        .lean();
      return serialize(items);
    } catch {
      return [];
    }
  },
  ["triple-h-content-collection-v5"],
  { revalidate: 900, tags: ["triple-h-content"] },
);

export const getContentCollection = cache(cachedCollection);

export async function getContentItem(kind, slug) {
  const items = await getContentCollection(kind);
  return items.find((item) => item.slug === slug) || null;
}

export function normalizeContentItem(input, forcedKind) {
  const kind = forcedKind || String(input?.kind || "").trim();
  const slug = String(input?.slug || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 120);
  const title = String(input?.title || "").trim().slice(0, 240);
  if (!kind || !slug || !title) throw new Error("Kind, slug and title are required");
  const meta = sanitizeCmsValue(input?.meta || {});
  if (["service", "project", "news"].includes(kind)) {
    meta.pageBuilderEnabled = Boolean(meta.pageBuilderEnabled);
    meta.blocks = normalizePageBuilderBlocks(meta.blocks);
  }
  return {
    kind,
    slug,
    title,
    excerpt: String(input?.excerpt || "").trim().slice(0, 2000),
    body: sanitizeHtml(String(input?.body || "")),
    image: String(input?.image || "").trim().slice(0, 2048),
    status: ["draft", "published", "closed"].includes(input?.status)
      ? input.status
      : "published",
    category: String(input?.category || "").trim().slice(0, 120),
    location: String(input?.location || "").trim().slice(0, 240),
    salary: String(input?.salary || "").trim().slice(0, 240),
    hours: String(input?.hours || "").trim().slice(0, 120),
    meta,
    seo: sanitizeCmsValue(input?.seo || {}),
    publishedAt: input?.publishedAt ? new Date(input.publishedAt) : new Date(),
    ...(Number.isSafeInteger(input?.sortOrder) && input.sortOrder >= 0
      ? { sortOrder: input.sortOrder }
      : {}),
  };
}
