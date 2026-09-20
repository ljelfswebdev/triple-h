import { config } from "dotenv";
import mongoose from "mongoose";
import { seedPages } from "../src/lib/page-definitions.js";

config({ path: ".env.local" });

const uri = process.env.MONGODB_URI;
if (!uri) throw new Error("MONGODB_URI is required in .env.local");

const legalSlugs = new Set(["terms-and-conditions", "cookie-policy", "privacy-policy"]);

await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });

try {
  const pages = mongoose.connection.collection("pages");
  const now = new Date();

  for (const seed of seedPages) {
    if (legalSlugs.has(seed.slug)) {
      const existing = await pages.findOne({ slug: seed.slug });
      await pages.updateOne(
        { slug: seed.slug },
        {
          $set: {
            title: existing?.title || seed.title,
            content: { ...seed.content, ...(existing?.content || {}) },
            seo: { ...seed.seo, ...(existing?.seo || {}) },
            updatedAt: now,
          },
          $setOnInsert: { slug: seed.slug, createdAt: now },
        },
        { upsert: true },
      );
      continue;
    }

    await pages.updateOne(
      { slug: seed.slug },
      {
        $set: { title: seed.title, content: seed.content, seo: seed.seo, updatedAt: now },
        $setOnInsert: { slug: seed.slug, createdAt: now },
      },
      { upsert: true },
    );
  }

  console.log(`Seeded ${seedPages.length - legalSlugs.size} Triple H pages; preserved existing legal copy.`);
} finally {
  await mongoose.disconnect();
}
