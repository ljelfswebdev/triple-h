import { config } from "dotenv";
import mongoose from "mongoose";
import { seedPages } from "../src/lib/page-definitions.js";

config({ path: ".env.local", quiet: true });

const uri = process.env.MONGODB_URI;
if (!uri) throw new Error("MONGODB_URI is required in .env.local");

function media(value, alt) {
  if (!value) return null;
  if (typeof value === "object") return value;
  return { alt, publicId: "", resourceType: "image", secureUrl: value, url: value };
}

function mergeMissing(defaults, current = {}) {
  return Object.fromEntries(Object.entries(defaults).map(([key, value]) => {
    const existing = current?.[key];
    const missing = existing === undefined || existing === null || existing === "";
    return [key, missing ? value : existing];
  }));
}

const postTypeSeo = {
  accreditation: { canonical: "/compliance", noIndex: true },
  news: "/news",
  page: { canonical: "/about", noIndex: true },
  project: "/projects",
  service: "/services",
  "team-member": { canonical: "/about/meet-the-team", noIndex: true },
  testimonial: { canonical: "/about/testimonials", noIndex: true },
  vacancy: "/careers",
};

await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });

try {
  const now = new Date();
  const pages = mongoose.connection.collection("pages");
  const content = mongoose.connection.collection("contentitems");

  for (const seed of seedPages) {
    const existing = await pages.findOne({ slug: seed.slug });
    await pages.updateOne(
      { slug: seed.slug },
      {
        $set: {
          seo: mergeMissing(seed.seo, existing?.seo),
          updatedAt: existing?.updatedAt || now,
        },
        $setOnInsert: { slug: seed.slug, title: seed.title, content: seed.content, createdAt: now },
      },
      { upsert: true },
    );
  }

  const posts = await content.find({ kind: { $in: Object.keys(postTypeSeo) } }).toArray();
  for (const item of posts) {
    const settings = typeof postTypeSeo[item.kind] === "string"
      ? { canonical: `${postTypeSeo[item.kind]}/${item.slug}`, noIndex: false }
      : postTypeSeo[item.kind];
    const title = item.kind === "vacancy" ? `${item.title} career | Triple H Contracts & Hire` : `${item.title} | Triple H Contracts & Hire`;
    const defaults = {
      title,
      description: item.excerpt || `${item.title} from Triple H Contracts & Hire.`,
      keywords: [item.title, item.category, "Triple H Contracts & Hire"].filter(Boolean).join(", "),
      ogTitle: item.title,
      ogDescription: item.excerpt || `${item.title} from Triple H Contracts & Hire.`,
      ogImage: media(item.image, item.title),
      canonical: settings.canonical,
      noIndex: settings.noIndex,
    };
    await content.updateOne({ _id: item._id }, { $set: { seo: mergeMissing(defaults, item.seo) } });
  }

  console.log(`Seeded SEO for ${seedPages.length} pages and ${posts.length} records across every post type without replacing existing values.`);
} finally {
  await mongoose.disconnect();
}
