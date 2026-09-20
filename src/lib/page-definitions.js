import {
  cookiePolicyDefinition,
  privacyPolicyDefinition,
  termsAndConditionsDefinition,
} from "./pages/legal.js";
import { tripleHPageDefinitions } from "./pages/triple-h.js";

export const pageDefinitions = {
  ...tripleHPageDefinitions,
  "terms-and-conditions": termsAndConditionsDefinition,
  "cookie-policy": cookiePolicyDefinition,
  "privacy-policy": privacyPolicyDefinition,
};

export function createFieldDefaults(fields) {
  return Object.fromEntries(
    fields.map((field) => {
      if (field.defaultValue !== undefined) {
        return [field.name, structuredClone(field.defaultValue)];
      }

      switch (field.type) {
        case "boolean":
          return [field.name, false];
        case "link":
          return [field.name, { label: "", url: "", newTab: false }];
        case "media":
          return [field.name, null];
        case "radio":
        case "select":
          return [field.name, field.options?.[0]?.value || ""];
        case "repeater":
          return [field.name, []];
        default:
          return [field.name, ""];
      }
    }),
  );
}

function setAtPath(source, path, value) {
  const result = { ...source };
  let current = result;

  path.forEach((key, index) => {
    if (index === path.length - 1) {
      current[key] = value;
      return;
    }

    current[key] = { ...(current[key] || {}) };
    current = current[key];
  });

  return result;
}

export function createDefaultPage(slug) {
  const definition = pageDefinitions[slug];
  let page = { slug, title: definition.title, content: {}, seo: {} };

  definition.tabs.forEach((tab) => {
    page = setAtPath(page, tab.path, createFieldDefaults(tab.fields));
  });

  const hero = page.content?.hero || {};
  const description = definition.seoDescription || hero.text || "";
  const title = definition.seoTitle || (slug === "homepage" ? "Triple H Contracts & Hire" : `${definition.title} | Triple H Contracts & Hire`);
  page.seo = {
    ...page.seo,
    title,
    description,
    keywords: `${definition.title}, Triple H Contracts & Hire`,
    ogTitle: hero.title || definition.title,
    ogDescription: description,
    ogImage: hero.image || null,
    canonical: definition.publicPath || (slug === "homepage" ? "/" : `/${slug}`),
    noIndex: Boolean(definition.noIndex),
  };

  return page;
}

export const seedPages = Object.keys(pageDefinitions).map(createDefaultPage);
