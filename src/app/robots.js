import { getSiteUrl } from "@/lib/site-url";
import { getAdminPath } from "@/lib/admin-path";

export default function robots() {
  const siteUrl = getSiteUrl();
  const adminPath = getAdminPath();

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", `/${adminPath}/`, "/cms-internal/", "/portal/"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
