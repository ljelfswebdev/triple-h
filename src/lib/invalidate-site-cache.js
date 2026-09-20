import "server-only";

import { revalidatePath, revalidateTag } from "next/cache";
import { pagePath, SITE_CACHE_TAGS } from "./cache-tags";

/** Revalidate site-wide contact, testimonial, and footer content. */
export function invalidateGlobals() {
  revalidateTag(SITE_CACHE_TAGS.globals, "max");
  revalidatePath("/", "layout");
}

/** Revalidate public navigation everywhere it is rendered. */
export function invalidateNavigation() {
  revalidateTag(SITE_CACHE_TAGS.navigation, "max");
  revalidatePath("/", "layout");
}

/** Revalidate embedded public forms on every route that may reference one. */
export function invalidateForms() {
  revalidateTag(SITE_CACHE_TAGS.forms, "max");
  revalidatePath("/", "layout");
}

/** Revalidate the page record and the exact public route that consumes it. */
export function invalidatePage(slug) {
  revalidateTag(SITE_CACHE_TAGS.pages, "max");
  revalidatePath(pagePath(slug));
  revalidatePath("/sitemap.xml");
}
