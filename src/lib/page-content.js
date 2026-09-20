import { createDefaultPage } from "./page-definitions";
import { getPage } from "./site-data";
import { createPageMetadata } from "./metadata";

export function mergePageDefaults(defaultValue, currentValue) {
  if (Array.isArray(defaultValue)) return Array.isArray(currentValue) ? currentValue : defaultValue;
  if (defaultValue && typeof defaultValue === "object") {
    return Object.fromEntries(
      Object.keys({ ...defaultValue, ...currentValue }).map((key) => [
        key,
        mergePageDefaults(defaultValue[key], currentValue?.[key]),
      ]),
    );
  }
  return currentValue ?? defaultValue;
}

export async function getEditablePage(slug) {
  return mergePageDefaults(createDefaultPage(slug), await getPage(slug));
}

export async function getEditablePageMetadata(slug, defaults = {}) {
  const defaultPage = createDefaultPage(slug);
  return createPageMetadata(await getEditablePage(slug), {
    canonical: defaultPage.seo.canonical,
    description: defaultPage.seo.description,
    keywords: defaultPage.seo.keywords,
    ogImage: defaultPage.seo.ogImage,
    title: defaultPage.seo.title,
    ...defaults,
  });
}

export function pageMediaUrl(value) {
  if (!value) return "";
  return typeof value === "string" ? value : value.secureUrl || value.url || "";
}
