import AccreditationBanner from "@/components/global/AccreditationBanner";
import CookieConsent from "@/components/global/CookieConsent";
import Footer from "@/components/global/Footer";
import Header from "@/components/global/Header";
import SiteMotion from "@/components/global/SiteMotion";
import AnalyticsManager from "@/components/global/AnalyticsManager";
import { SiteCopyProvider } from "@/components/global/SiteCopyProvider";
import { getContentCollection } from "@/lib/content-items";
import { getGlobals } from "@/lib/site-data";
import { mergeSiteCopy } from "@/lib/site-copy";
import { CUSTOMER_PORTAL_ENABLED } from "@/lib/features";

export default async function SiteLayout({ children }) {
  const [globals, accreditations] = await Promise.all([
    getGlobals(),
    getContentCollection("accreditation"),
  ]);
  const mergedCopy = mergeSiteCopy(globals?.siteCopy);
  const copy = CUSTOMER_PORTAL_ENABLED
    ? mergedCopy
    : { ...mergedCopy, header: { ...mergedCopy.header, portalLink: undefined } };
  return (
    <SiteCopyProvider value={copy}>
      <Header copy={copy} />
      <SiteMotion />
      {children}
      <AccreditationBanner copy={copy.accreditationBanner} items={accreditations} />
      <Footer copy={copy} globals={globals} />
      <AnalyticsManager enabled={process.env.VERCEL === "1"} />
      <CookieConsent copy={copy.cookie} />
    </SiteCopyProvider>
  );
}
