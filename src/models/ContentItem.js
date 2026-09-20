import mongoose from "mongoose";

const schema = new mongoose.Schema(
  {
    kind: {
      type: String,
      enum: [
        "service",
        "project",
        "news",
        "vacancy",
        "accreditation",
        "page",
        "team-member",
        "testimonial",
      ],
      required: true,
      index: true,
    },
    slug: {
      type: String,
      required: true,
      maxlength: 120,
      match: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    },
    title: { type: String, required: true, maxlength: 240 },
    excerpt: { type: String, maxlength: 2000 },
    body: { type: String, maxlength: 100000 },
    image: { type: String, maxlength: 2048 },
    status: { type: String, enum: ["draft", "published", "closed"], default: "published" },
    category: { type: String, maxlength: 120 },
    location: { type: String, maxlength: 240 },
    salary: { type: String, maxlength: 240 },
    hours: { type: String, maxlength: 120 },
    meta: { type: mongoose.Schema.Types.Mixed, default: {} },
    seo: {
      title: { type: String, maxlength: 200 },
      description: { type: String, maxlength: 500 },
      keywords: { type: String, maxlength: 1000 },
      ogTitle: { type: String, maxlength: 200 },
      ogDescription: { type: String, maxlength: 500 },
      ogImage: mongoose.Schema.Types.Mixed,
      canonical: { type: String, maxlength: 2048 },
      noIndex: Boolean,
    },
    publishedAt: Date,
    sortOrder: { type: Number, min: 0, index: true },
  },
  { timestamps: true },
);

schema.index({ kind: 1, slug: 1 }, { unique: true });

// Next.js keeps Mongoose models alive across development hot reloads. Recompile
// older in-memory models when a newly-added field is missing so writes are not
// silently stripped by a stale schema.
if (mongoose.models.ContentItem && !mongoose.models.ContentItem.schema.path("sortOrder")) {
  mongoose.deleteModel("ContentItem");
}

export default mongoose.models.ContentItem || mongoose.model("ContentItem", schema);
