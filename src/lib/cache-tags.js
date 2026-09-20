/**
 * Shared cache tag names for public CMS data.
 *
 * Mutation route handlers should call `revalidateTag(tag, "max")` after a
 * successful write. Keeping the names here prevents a save endpoint and its
 * corresponding public read from silently drifting apart.
 */
export const SITE_CACHE_TAGS = Object.freeze({
  forms: "site:forms",
  globals: "site:globals",
  navigation: "site:navigation",
  pages: "site:pages",
});

export function pagePath(slug) {
  if (slug === "homepage") return "/";
  return `/${String(slug || "").replace(/^\/+|\/+$/g, "")}`;
}
