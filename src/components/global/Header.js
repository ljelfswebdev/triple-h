import HeaderClient from "./HeaderClient";
import { getContentCollection } from "@/lib/content-items";
import { getNavigation, navigationHref } from "@/lib/site-data";
import { CUSTOMER_PORTAL_ENABLED, isPortalPath } from "@/lib/features";

export default async function Header({ copy }) {
  const [navigation, services] = await Promise.all([
    getNavigation("main"),
    getContentCollection("service"),
  ]);
  const source = navigation.items || [];
  const aboutLinks = copy.header.aboutLinks.map((item) => ({
    label: item.label || item.link?.label,
    href: item.link?.url,
    description: item.description,
  }));
  const serviceLinks = [
    { label: copy.header.servicesOverviewLabel, href: "/services", description: copy.header.servicesOverviewDescription },
    ...services.map((service) => ({
      label: service.title,
      href: `/services/${service.slug}`,
      description: service.excerpt,
    })),
  ];
  const items = source
    .map((item) => {
      const href = navigationHref(item);
      return {
        label: item.label,
        href,
        newTab: Boolean(item.newTab),
        children: href === "/services" ? serviceLinks : href === "/about" ? aboutLinks : undefined,
      };
    })
    .filter((item) => CUSTOMER_PORTAL_ENABLED || !isPortalPath(item.href));

  const headerCopy = CUSTOMER_PORTAL_ENABLED
    ? copy.header
    : { ...copy.header, portalLink: undefined };

  return <HeaderClient copy={headerCopy} items={items} />;
}
