import { config } from "dotenv";
import mongoose from "mongoose";

config({ path: ".env.local", quiet: true });
if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is required");

await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
try {
  const db = mongoose.connection;
  const [media, pages, forms] = await Promise.all([
    db.collection("media").find({}, { projection: { publicId: 1, secureUrl: 1, url: 1 } }).toArray(),
    db.collection("pages").find({}, { projection: { slug: 1, title: 1, content: 1 } }).toArray(),
    db.collection("forms").find({}, { projection: { key: 1, name: 1, fields: 1 } }).toArray(),
  ]);
  const bySource = media.reduce((counts, item) => {
    const url = item.secureUrl || item.url || "";
    const source = url.startsWith("/images/") ? "local" : url.includes("res.cloudinary.com") ? "cloudinary" : "other";
    counts[source] = (counts[source] || 0) + 1;
    return counts;
  }, {});
  const localReferences = [];
  function collectLocalReferences(value, path = []) {
    if (Array.isArray(value)) {
      value.forEach((item, index) => collectLocalReferences(item, [...path, index]));
      return;
    }
    if (!value || typeof value !== "object") return;
    for (const [key, item] of Object.entries(value)) {
      if ((key === "url" || key === "secureUrl") && typeof item === "string" && item.startsWith("/images/")) {
        localReferences.push({ path: [...path, key].join("."), url: item });
      } else {
        collectLocalReferences(item, [...path, key]);
      }
    }
  }
  pages.forEach(({ slug, content }) => collectLocalReferences(content, [slug]));
  console.log(JSON.stringify({
    media: bySource,
    localPageImageReferences: localReferences,
    pages: pages.map(({ slug, title, content }) => ({ slug, title, contentKeys: Object.keys(content || {}) })),
    forms: forms.map(({ key, name, fields }) => ({ key, name, fields: fields?.length || 0 })),
  }, null, 2));
} finally {
  await mongoose.disconnect();
}
