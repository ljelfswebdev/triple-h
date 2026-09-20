import mongoose from "mongoose";
const schema = new mongoose.Schema(
  {
    key: { type: String, unique: true, default: "site", maxlength: 50 },
    footer: {
      boldText: { type: String, maxlength: 100000 },
      text: { type: String, maxlength: 100000 },
      link: {
        label: { type: String, maxlength: 200 },
        url: { type: String, maxlength: 2048 },
        newTab: Boolean,
      },
      bottomText: { type: String, maxlength: 100000 },
    },
    contact: {
      number: { type: String, maxlength: 100 },
      email: { type: String, maxlength: 254 },
      address: { type: String, maxlength: 2000 },
    },
    socials: {
      facebook: { type: String, maxlength: 2048 },
      instagram: { type: String, maxlength: 2048 },
      linkedin: { type: String, maxlength: 2048 },
      youtube: { type: String, maxlength: 2048 },
    },
    siteCopy: { type: mongoose.Schema.Types.Mixed, default: {} },
    testimonials: [
      { name: { type: String, maxlength: 200 }, text: { type: String, maxlength: 10000 } },
    ],
  },
  { timestamps: true },
);
export default mongoose.models.Globals || mongoose.model("Globals", schema);
