import mongoose from "mongoose";
const schema = new mongoose.Schema(
  {
    form: { type: mongoose.Schema.Types.ObjectId, ref: "Form" },
    formKey: { type: String, required: true, maxlength: 100, index: true },
    formName: { type: String, maxlength: 200 },
    values: mongoose.Schema.Types.Mixed,
    fields: [
      {
        name: { type: String, maxlength: 100 },
        label: { type: String, maxlength: 200 },
        value: mongoose.Schema.Types.Mixed,
      },
    ],
    status: {
      type: String,
      enum: ["received", "emailed", "email_failed"],
      default: "received",
      index: true,
    },
  },
  { timestamps: true },
);
schema.index({ createdAt: -1 });
export default mongoose.models.FormSubmission || mongoose.model("FormSubmission", schema);
