import { getContentCollection } from "@/lib/content-items";
import { getEditablePage } from "@/lib/page-content";
import { pageDefinitions } from "@/lib/page-definitions";
import { getSiteUrl } from "@/lib/site-url";

export default async function sitemap() {
  const siteUrl = getSiteUrl();
  const [services, projects, news, vacancies, ...pages] = await Promise.all([
    getContentCollection("service"), getContentCollection("project"), getContentCollection("news"), getContentCollection("vacancy"),
    ...Object.keys(pageDefinitions).map(getEditablePage),
  ]);
  const staticEntries = pages
    .filter((page) => !page.seo?.noIndex)
    .map((page) => ({ path: pageDefinitions[page.slug].publicPath, updatedAt: page.updatedAt }));
  const dynamicEntries = [
    ...services.map((item) => ({ item, path: `/services/${item.slug}` })),
    ...projects.map((item) => ({ item, path: `/projects/${item.slug}` })),
    ...news.map((item) => ({ item, path: `/news/${item.slug}` })),
    ...vacancies.map((item) => ({ item, path: `/careers/${item.slug}` })),
  ].filter(({ item }) => !item.seo?.noIndex).map(({ item, path }) => ({ path, updatedAt: item.updatedAt }));

  return [...staticEntries, ...dynamicEntries].map(({ path, updatedAt }) => ({
    url: `${siteUrl}${path === "/" ? "" : path}`,
    lastModified: updatedAt || new Date(),
    changeFrequency: path === "/" ? "weekly" : "monthly",
    priority: path === "/" ? 1 : path.split("/").length === 2 ? 0.8 : 0.6,
  }));
}
