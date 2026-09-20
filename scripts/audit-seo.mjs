import { config } from "dotenv";
import mongoose from "mongoose";
import { pageDefinitions } from "../src/lib/page-definitions.js";

config({ path: ".env.local", quiet: true });

const uri = process.env.MONGODB_URI;
if (!uri) throw new Error("MONGODB_URI is required in .env.local");

const requiredFields = ["title", "description", "keywords", "ogTitle", "ogDescription", "canonical"];
const detailKinds = ["service", "project", "news", "vacancy"];
const allPostKinds = ["service", "project", "news", "vacancy", "accreditation", "page", "team-member", "testimonial"];

await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });

try {
  const pages = await mongoose.connection.collection("pages").find({ slug: { $in: Object.keys(pageDefinitions) } }).toArray();
  const posts = await mongoose.connection.collection("contentitems").find({ kind: { $in: allPostKinds } }).toArray();
  const details = posts.filter((post) => detailKinds.includes(post.kind));
  const records = [...pages, ...posts];
  const incomplete = records.filter((record) => requiredFields.some((field) => !String(record.seo?.[field] || "").trim()));
  const canonicals = [...pages, ...details].filter((record) => !record.seo?.noIndex).map((record) => record.seo?.canonical).filter(Boolean);
  const duplicateCanonicals = canonicals.filter((canonical, index) => canonicals.indexOf(canonical) !== index);

  if (pages.length !== Object.keys(pageDefinitions).length) throw new Error(`Expected ${Object.keys(pageDefinitions).length} Pages records, found ${pages.length}.`);
  if (incomplete.length) throw new Error(`Incomplete SEO records: ${incomplete.map((record) => `${record.kind || "page"}:${record.slug}`).join(", ")}`);
  if (duplicateCanonicals.length) throw new Error(`Duplicate canonical URLs: ${[...new Set(duplicateCanonicals)].join(", ")}`);

  const counts = Object.fromEntries(allPostKinds.map((kind) => [kind, posts.filter((post) => post.kind === kind).length]));
  console.log(`SEO audit passed: ${pages.length} Pages records and ${posts.length} post records have complete metadata. ${JSON.stringify(counts)}`);
} finally {
  await mongoose.disconnect();
}
