import mongoose from "mongoose";
const schema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    email: {
      type: String,
      unique: true,
      required: true,
      lowercase: true,
      trim: true,
      maxlength: 254,
    },
    passwordHash: { type: String, required: true, maxlength: 200 },
    role: {
      type: String,
      enum: ["admin", "employee", "customer"],
      default: "customer",
      index: true,
    },
    category: { type: String, trim: true, maxlength: 100 },
    company: { type: String, trim: true, maxlength: 200 },
    phone: { type: String, trim: true, maxlength: 50 },
    mustChangePassword: { type: Boolean, default: false },
    newsletter: { type: Boolean, default: false },
    active: { type: Boolean, default: true },
  },
  { timestamps: true },
);
export default mongoose.models.User || mongoose.model("User", schema);
