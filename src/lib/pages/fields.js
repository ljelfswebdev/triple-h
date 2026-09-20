export const richText = (name, label, extra = {}) => ({
  name,
  label,
  type: "richtext",
  ...extra,
});

export const text = (name, label, extra = {}) => ({
  name,
  label,
  type: "text",
  ...extra,
});

export const media = (name, label, extra = {}) => ({
  accept: "image",
  name,
  label,
  type: "media",
  ...extra,
});

export const link = (name, label) => ({ name, label, type: "link" });

export const repeater = (name, label, fields) => ({
  name,
  label,
  type: "repeater",
  fields,
});

export const seoFields = [
  text("title", "SEO title (browser tab)"),
  text("description", "Meta description (search results)", {
    multiline: true,
  }),
  text("keywords", "Keywords", {
    placeholder: "e.g. arboriculture, vegetation management, plant hire",
  }),
  text("ogTitle", "Open Graph title (social sharing)"),
  text("ogDescription", "Open Graph description (social sharing)", {
    multiline: true,
  }),
  media("ogImage", "Open Graph image (social sharing)"),
  text("canonical", "Canonical URL", { placeholder: "e.g. /services/tree-surgery" }),
  { name: "noIndex", label: "Prevent search engine indexing", type: "boolean" },
];

export const bannerFields = [
  richText("title", "Title"),
  richText("subtitle", "Subtitle"),
  richText("text", "Text"),
  link("link", "Link"),
  media("image", "Image"),
];

export const formBlockFields = [
  richText("title", "Title"),
  richText("text", "Text"),
  { name: "formKey", label: "Form", type: "formSelect" },
];
