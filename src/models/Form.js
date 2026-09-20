import mongoose from "mongoose";
const schema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 200 },
    key: {
      type: String,
      unique: true,
      required: true,
      maxlength: 100,
      match: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    },
    recipientEmail: { type: String, trim: true, lowercase: true, maxlength: 254 },
    successMessage: { type: String, maxlength: 2000 },
    errorMessage: { type: String, maxlength: 2000 },
    fields: [
      {
        type: {
          type: String,
          enum: ["text", "date", "select", "textarea", "consent", "submit"],
        },
        label: { type: String, maxlength: 200 },
        name: { type: String, maxlength: 100 },
        placeholder: { type: String, maxlength: 200 },
        required: Boolean,
        width: { type: String, enum: ["full", "half"] },
        layoutRow: { type: String, maxlength: 100 },
        layoutColumns: { type: Number, min: 1, max: 3 },
        options: [
          { label: { type: String, maxlength: 200 }, value: { type: String, maxlength: 200 } },
        ],
        buttonText: { type: String, maxlength: 200 },
        busyText: { type: String, maxlength: 200 },
      },
    ],
  },
  { timestamps: true },
);
export default mongoose.models.Form || mongoose.model("Form", schema);
