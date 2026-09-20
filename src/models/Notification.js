import mongoose from "mongoose";

const schema = new mongoose.Schema(
  {
    title: { type: String, required: true, maxlength: 200 },
    message: { type: String, required: true, maxlength: 5000 },
    audienceRoles: [{ type: String, enum: ["employee", "customer"] }],
    audienceCategories: [{ type: String, maxlength: 100 }],
    audienceUserIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

schema.index({ createdAt: -1 });
export default mongoose.models.Notification || mongoose.model("Notification", schema);
