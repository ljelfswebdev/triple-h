import mongoose from "mongoose";
const schema = new mongoose.Schema(
  {
    publicId: { type: String, unique: true, required: true, maxlength: 500 },
    resourceType: { type: String, enum: ["image", "video", "raw"], required: true, index: true },
    url: { type: String, maxlength: 2048 },
    secureUrl: { type: String, maxlength: 2048 },
    width: { type: Number, min: 0 },
    height: { type: Number, min: 0 },
    format: { type: String, maxlength: 32 },
    bytes: { type: Number, min: 0, max: 25 * 1024 * 1024 },
    duration: { type: Number, min: 0 },
    mimeType: { type: String, maxlength: 100 },
    alt: { type: String, maxlength: 500 },
    caption: { type: String, maxlength: 2000 },
  },
  { timestamps: true },
);
schema.index({ createdAt: -1 });
export default mongoose.models.Media || mongoose.model("Media", schema);
