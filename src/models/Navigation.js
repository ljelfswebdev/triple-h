import mongoose from "mongoose";
const item = {
  label: { type: String, maxlength: 200 },
  type: { type: String, enum: ["page", "custom"] },
  pageSlug: { type: String, maxlength: 100 },
  url: { type: String, maxlength: 2048 },
  newTab: Boolean,
  children: [mongoose.Schema.Types.Mixed],
};
const schema = new mongoose.Schema(
  { key: { type: String, unique: true, required: true, maxlength: 100 }, items: [item] },
  { timestamps: true },
);
export default mongoose.models.Navigation || mongoose.model("Navigation", schema);
