import { config } from "dotenv";
import mongoose from "mongoose";

config({ path: ".env.local", quiet: true });

const uri = process.env.MONGODB_URI;
if (!uri) throw new Error("MONGODB_URI is required in .env.local");

await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });

try {
  const content = mongoose.connection.collection("contentitems");
  const pages = mongoose.connection.collection("pages");
  const navigations = mongoose.connection.collection("navigations");
  const videoItems = await content.deleteMany({ kind: "video" });
  const videoPage = await pages.deleteOne({ slug: "video" });
  const navigationItems = await navigations.updateMany(
    {},
    { $pull: { items: { $or: [{ pageSlug: "video" }, { url: "/video" }] } } },
  );

  console.log(
    `Removed ${videoItems.deletedCount} video records, ${videoPage.deletedCount} video page and video links from ${navigationItems.modifiedCount} navigation menus.`,
  );
} finally {
  await mongoose.disconnect();
}
