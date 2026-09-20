import mongoose from "mongoose";

const schema = new mongoose.Schema(
  {
    _id: { type: String, maxlength: 300 },
    count: { type: Number, required: true, min: 0 },
    expiresAt: { type: Date, required: true, expires: 0 },
  },
  { versionKey: false },
);

export default mongoose.models.RateLimit || mongoose.model("RateLimit", schema);
