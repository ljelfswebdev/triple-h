import Link from "next/link";
import BrandMark from "./BrandMark";
import NewsletterSignup from "@/components/forms/NewsletterSignup";
import { getNavigation, navigationHref } from "@/lib/site-data";
import { CUSTOMER_PORTAL_ENABLED, isPortalPath } from "@/lib/features";

function menuItems(navigation) {
  const source = navigation.items || [];
  return source
    .map((item) => ({ ...item, href: navigationHref(item) }))
    .filter((item) => CUSTOMER_PORTAL_ENABLED || !isPortalPath(item.href));
}

function FooterMenu({ items }) {
  return (
    <ul>
      {items.map((item) => (
        <li key={`${item.label}-${item.href}`}>
          <Link
            href={item.href}
            rel={item.newTab ? "noopener noreferrer" : undefined}
            target={item.newTab ? "_blank" : undefined}
          >
            {item.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}

export default async function Footer({ copy, globals }) {
  const [servicesNavigation, exploreNavigation] = await Promise.all([
    getNavigation("footer-services"),
    getNavigation("footer-explore"),
  ]);
  const serviceItems = menuItems(servicesNavigation);
  const exploreItems = menuItems(exploreNavigation);

  return (
    <footer className="th-footer">
      <section className="newsletter-banner">
        <div className="container newsletter-banner__inner">
          <div>
            <p className="eyebrow">{copy.footer.newsletterEyebrow}</p>
            <h2>{copy.footer.newsletterTitle}</h2>
          </div>
          <NewsletterSignup />
        </div>
      </section>
      <div className="container th-footer__grid">
        <div className="th-footer__brand">
          <BrandMark />
          <p>{copy.branding.strapline}</p>
          <Link className="btn btn-primary" href={copy.footer.cta.url}>{copy.footer.cta.label}</Link>
        </div>
        <nav aria-label="Footer services">
          <h2 className="footer-heading">{copy.footer.servicesHeading}</h2>
          <FooterMenu items={serviceItems} />
        </nav>
        <nav aria-label="Footer navigation">
          <h2 className="footer-heading">{copy.footer.exploreHeading}</h2>
          <FooterMenu items={exploreItems} />
        </nav>
        <address className="th-footer__contact">
          <h2 className="footer-heading">{copy.footer.contactHeading}</h2>
          <a href={`tel:${globals.contact.number.replace(/[^\d+]/g, "")}`}>{globals.contact.number}</a>
          <a href={`mailto:${globals.contact.email}`}>{globals.contact.email}</a>
          <div dangerouslySetInnerHTML={{ __html: globals.contact.address }} />
          <p className="th-footer__emergency">{copy.footer.emergencyText}</p>
        </address>
      </div>
      <div className="container th-footer__bottom">
        <p>© {new Date().getFullYear()} {copy.footer.copyrightText}</p>
        <p>{copy.footer.valuesText}</p>
      </div>
    </footer>
  );
}
