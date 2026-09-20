import mongoose from "mongoose";

const schema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 254 },
    name: { type: String, maxlength: 120 },
    source: { type: String, maxlength: 120, default: "website" },
    active: { type: Boolean, default: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

export default mongoose.models.NewsletterSubscriber ||
  mongoose.model("NewsletterSubscriber", schema);
