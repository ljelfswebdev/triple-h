import { config } from "dotenv";
import mongoose from "mongoose";
import { news } from "../src/lib/triple-h-data.js";

config({ path: ".env.local", quiet: true });

const uri = process.env.MONGODB_URI;
if (!uri) throw new Error("MONGODB_URI is required in .env.local");

await mongoose.connect(uri);

try {
  const now = new Date();
  const content = mongoose.connection.collection("contentitems");

  for (const item of news) {
    const body = item.body || [
      `<h2>${item.title}</h2>`,
      `<p>${item.excerpt}</p>`,
      "<p>Planning, clear communication and accountable delivery remain central to the way Triple H approaches every programme. We will share further updates as the work develops.</p>",
    ].join("");

    await content.updateOne(
      { kind: "news", slug: item.slug },
      {
        $set: {
          title: item.title,
          excerpt: item.excerpt,
          body,
          category: item.category || "Company",
          image: item.image || "",
          status: "published",
          publishedAt: new Date(item.date),
          updatedAt: now,
        },
        $setOnInsert: {
          kind: "news",
          slug: item.slug,
          createdAt: now,
        },
      },
      { upsert: true },
    );
  }

  console.log(`Seeded ${news.length} news stories.`);
} finally {
  await mongoose.disconnect();
}
