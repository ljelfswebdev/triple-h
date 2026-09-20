import { cache } from "react";
import { unstable_cache } from "next/cache";
import { dbConnect } from "./db";
import { SITE_CACHE_TAGS } from "./cache-tags";
import Globals from "@/models/Globals";
import Navigation from "@/models/Navigation";
import Page from "@/models/Page";
import Form from "@/models/Form";
import { formLookup, publicForm } from "./forms";
import { sanitizeCmsValue } from "./security";

function serialize(value) {
  return value ? sanitizeCmsValue(JSON.parse(JSON.stringify(value))) : null;
}

const getCachedGlobals = unstable_cache(
  async () => {
    await dbConnect();
    const globals = await Globals.findOne({ key: "site" }).lean();
    return serialize(globals);
  },
  ["public-site-globals-v2"],
  {
    revalidate: 3600,
    tags: [SITE_CACHE_TAGS.globals],
  },
);

const getCachedNavigation = unstable_cache(
  async (key = "main") => {
    await dbConnect();
    const navigation = await Navigation.findOne({ key }).lean();
    return serialize(navigation) || { key, items: [] };
  },
  ["public-site-navigation"],
  {
    revalidate: 3600,
    tags: [SITE_CACHE_TAGS.navigation],
  },
);

const getCachedPage = unstable_cache(
  async (slug) => {
    await dbConnect();
    const page = await Page.findOne({ slug }).lean();
    return serialize(page);
  },
  ["public-site-page-v2"],
  {
    revalidate: 3600,
    tags: [SITE_CACHE_TAGS.pages],
  },
);

const getCachedForm = unstable_cache(
  async (identifier) => {
    await dbConnect();
    const form = await Form.findOne(formLookup(identifier));
    return form ? serialize(publicForm(form)) : null;
  },
  ["public-site-form"],
  {
    revalidate: 3600,
    tags: [SITE_CACHE_TAGS.forms],
  },
);

// React cache deduplicates metadata/layout/page calls in one render; the Next
// data cache safely reuses the serialised result across requests and instances.
export const getGlobals = cache(getCachedGlobals);
export const getNavigation = cache(getCachedNavigation);
export const getPage = cache(getCachedPage);
export const getForm = cache(getCachedForm);

export function navigationHref(item) {
  if (item.type === "custom") return item.url || "#";
  return item.pageSlug === "homepage" ? "/" : `/${item.pageSlug || ""}`;
}
