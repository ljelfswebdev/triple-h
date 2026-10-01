import { config } from "dotenv";
import mongoose from "mongoose";

config({ path: ".env.local", quiet: true });

const uri = process.env.MONGODB_URI;
if (!uri) throw new Error("MONGODB_URI is required in .env.local");

const apply = process.argv.includes("--apply");
const sharedBody =
  "Our teams combine practical site knowledge with clear communication, disciplined safety systems and the plant or specialist access needed to keep work moving.";
const safetyText =
  "Every project is supported by site-specific planning, competent supervision and an appropriate risk assessment. Speak to our team about the method, resources and programme for your site.";
const defaultDuties = [
  "Deliver work safely and to the agreed plan",
  "Communicate clearly with supervisors, colleagues and clients",
  "Look after equipment, vehicles and the places where we work",
  "Keep learning and support the people around you",
];

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function missing(value) {
  if (value == null) return true;
  if (typeof value === "string") return !value.trim();
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === "object") return Object.values(value).every(missing);
  return false;
}

function setMissing(target, key, value) {
  if (missing(target[key])) target[key] = value;
}

function standardDetailMeta(item) {
  const meta = { ...(item.meta || {}) };
  setMissing(
    meta,
    "heroEyebrow",
    item.kind === "service" ? "Our capability" : item.category || item.service || "",
  );
  if (meta.pageBuilderEnabled) return meta;
  setMissing(meta, "contentEyebrow", "Built around the job");
  setMissing(
    meta,
    "contentHeading",
    item.kind === "service" ? "Clear planning. Capable delivery." : "The brief",
  );
  setMissing(meta, "safetyHeading", "Safe by design");
  setMissing(meta, "safetyText", safetyText);
  setMissing(meta, "enquiryEyebrow", "Need this capability?");
  setMissing(meta, "enquiryHeading", "Let’s look at the job.");
  setMissing(meta, "nextEyebrow", "Next step");
  setMissing(meta, "nextHeading", "Put our team on the problem.");
  setMissing(meta, "enquiryLink", { label: "Start an enquiry", url: "/contact", newTab: false });
  setMissing(meta, "projectsLink", { label: "See our work", url: "/projects", newTab: false });
  return meta;
}

function vacancyMeta(item) {
  const meta = { ...(item.meta || {}) };
  setMissing(meta, "heroEyebrow", item.category || "Careers");
  setMissing(meta, "roleEyebrow", "The role");
  setMissing(meta, "roleHeading", "Make an impact from day one.");
  setMissing(meta, "dutiesHeading", "What you’ll do");
  setMissing(meta, "duties", defaultDuties);
  setMissing(meta, "requirementsHeading", "What you’ll bring");
  setMissing(
    meta,
    "requirementsText",
    "Relevant experience or transferable practical skills, a safety-first attitude and the reliability to be part of a high-performing crew. Role-specific tickets can be confirmed during the application process.",
  );
  setMissing(meta, "applyPrefix", "Apply for");
  setMissing(meta, "applyHeading", "Start the conversation.");
  setMissing(
    meta,
    "applyText",
    "Tell us a little about yourself and upload your CV. We’ll review your application and get back to you directly.",
  );
  return meta;
}

await mongoose.connect(uri);

try {
  const content = mongoose.connection.collection("contentitems");
  const items = await content
    .find({ kind: { $in: ["service", "project", "news", "vacancy"] }, status: "published" })
    .sort({ kind: 1, sortOrder: 1, title: 1 })
    .toArray();
  const operations = [];

  for (const item of items) {
    const meta = item.kind === "vacancy" ? vacancyMeta(item) : standardDetailMeta(item);
    const update = { meta, updatedAt: new Date() };

    if (
      ["service", "project", "news"].includes(item.kind) &&
      !meta.pageBuilderEnabled &&
      missing(item.body)
    ) {
      update.body = [
        item.excerpt ? `<p>${escapeHtml(item.excerpt)}</p>` : "",
        `<p>${sharedBody}</p>`,
      ].join("");
    }

    operations.push({
      updateOne: {
        filter: { _id: item._id, status: "published" },
        update: { $set: update },
      },
    });
  }

  const counts = items.reduce(
    (result, item) => ({ ...result, [item.kind]: (result[item.kind] || 0) + 1 }),
    {},
  );
  console.log(
    `${apply ? "Applying" : "Dry run:"} ${operations.length} published records ${JSON.stringify(counts)}`,
  );

  if (apply && operations.length) {
    const result = await content.bulkWrite(operations);
    console.log(`Updated ${result.modifiedCount} records without overwriting existing content.`);
  } else if (!apply) {
    console.log("No data changed. Re-run with --apply after reviewing this count.");
  }
} finally {
  await mongoose.disconnect();
}
