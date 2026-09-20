import { config } from "dotenv";
import mongoose from "mongoose";
import { testimonials } from "../src/lib/triple-h-data.js";

config({ path: ".env.local" });

const uri = process.env.MONGODB_URI;
if (!uri) throw new Error("MONGODB_URI is required in .env.local");

await mongoose.connect(uri);

try {
  const now = new Date();
  const content = mongoose.connection.collection("contentitems");

  for (const testimonial of testimonials) {
    await content.updateOne(
      { kind: "testimonial", slug: testimonial.slug },
      {
        $set: {
          title: testimonial.title,
          excerpt: testimonial.excerpt,
          body: testimonial.body || "",
          category: testimonial.category || "",
          image: testimonial.image || "",
          status: "published",
          updatedAt: now,
        },
        $setOnInsert: {
          kind: "testimonial",
          slug: testimonial.slug,
          publishedAt: now,
          createdAt: now,
        },
      },
      { upsert: true },
    );
  }

  console.log(`Seeded ${testimonials.length} testimonials.`);
} finally {
  await mongoose.disconnect();
}
