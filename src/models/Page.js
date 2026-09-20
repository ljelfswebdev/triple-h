import mongoose from "mongoose";
const schema = new mongoose.Schema(
  {
    slug: {
      type: String,
      unique: true,
      required: true,
      maxlength: 100,
      match: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    },
    title: { type: String, maxlength: 200 },
    content: { type: mongoose.Schema.Types.Mixed, default: {} },
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
  },
  { timestamps: true },
);
export default mongoose.models.Page || mongoose.model("Page", schema);
