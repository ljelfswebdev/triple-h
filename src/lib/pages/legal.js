import { richText, seoFields, text } from "./fields.js";

function legalPageDefinition(title, publicPath, seoDescription) {
  return {
    title,
    publicPath,
    seoDescription,
    tabs: [
      {
        id: "content",
        label: "Content",
        path: ["content"],
        fields: [text("title", "Page heading", { defaultValue: title }), richText("body", "Page content")],
      },
      { id: "seo", label: "SEO", path: ["seo"], fields: seoFields },
    ],
  };
}

export const termsAndConditionsDefinition = legalPageDefinition(
  "Terms and Conditions",
  "/terms-and-conditions",
  "Read the terms and conditions for using the Triple H Contracts & Hire website and services.",
);
export const cookiePolicyDefinition = legalPageDefinition("Cookie Policy", "/cookie-policy", "Learn how Triple H Contracts & Hire uses cookies and how you can manage your preferences.");
export const privacyPolicyDefinition = legalPageDefinition("Privacy Policy", "/privacy-policy", "Read how Triple H Contracts & Hire collects, uses and protects personal information.");
