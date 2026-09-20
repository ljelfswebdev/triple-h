import { config } from "dotenv";
import mongoose from "mongoose";

config({ path: ".env.local", quiet: true });

const uri = process.env.MONGODB_URI;
if (!uri) throw new Error("MONGODB_URI is required in .env.local");

const accreditations = [
  {
    slug: "iso-9001",
    title: "ISO 9001",
    category: "Quality",
    badge: "ISO",
    excerpt:
      "Quality management systems built around consistent delivery and continual improvement.",
  },
  {
    slug: "chas-elite",
    title: "CHAS Elite",
    category: "Health & safety",
    badge: "CHAS",
    excerpt: "Verified health, safety and supply-chain compliance for responsible procurement.",
  },
  {
    slug: "constructionline-gold",
    title: "Constructionline Gold",
    category: "Procurement",
    badge: "GOLD",
    excerpt: "Pre-qualified standards for public and private sector tendering and delivery.",
  },
  {
    slug: "ssip",
    title: "SSIP",
    category: "Health & safety",
    badge: "SSIP",
    excerpt: "Aligned contractor health and safety assessment through recognised mutual standards.",
  },
  {
    slug: "nhss-18",
    title: "NHSS 18",
    category: "Highways",
    badge: "NHSS",
    excerpt:
      "Sector-scheme controls for landscape and vegetation management on the highway network.",
  },
  {
    slug: "bs-3998-2010",
    title: "BS 3998:2010",
    category: "Arboriculture",
    badge: "BS",
    excerpt:
      "Recognised recommendations embedded into the planning and delivery of professional tree work.",
  },
];

await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });

try {
  const now = new Date();
  const content = mongoose.connection.collection("contentitems");

  for (const item of accreditations) {
    await content.updateOne(
      { kind: "accreditation", slug: item.slug },
      {
        $setOnInsert: {
          kind: "accreditation",
          slug: item.slug,
          title: item.title,
          category: item.category,
          excerpt: item.excerpt,
          body: "",
          image: "",
          status: "published",
          meta: { badge: item.badge },
          publishedAt: now,
          createdAt: now,
        },
        $set: { updatedAt: now },
      },
      { upsert: true },
    );
  }

  console.log(`Seeded ${accreditations.length} accreditation records.`);
} finally {
  await mongoose.disconnect();
}
