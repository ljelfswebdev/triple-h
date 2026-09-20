import Link from "next/link";
import PageHero from "./PageHero";
import QuickEnquiry from "@/components/forms/QuickEnquiry";
import { getEditablePage } from "@/lib/page-content";
import { pageBuilderEnabled } from "@/lib/page-builder";
import PageBuilder from "./PageBuilder";

export default async function DetailPage({ item, kind }) {
  const isService = kind === "service";
  const isProject = kind === "project";
  const copy = (await getEditablePage(kind === "service" ? "services" : kind === "project" ? "projects" : "news")).content.detail;
  const highlights = item.highlights || item.meta?.highlights || [];
  const contentEyebrow = item.meta?.contentEyebrow || copy.contentEyebrow;
  const contentHeading = item.meta?.contentHeading || copy.contentHeading;
  const safetyHeading = item.meta?.safetyHeading || copy.safetyHeading;
  const safetyText = item.meta?.safetyText || copy.safetyText;
  const usePageBuilder = pageBuilderEnabled(item);
  return (
    <main id="main-content" tabIndex={-1}>
      <PageHero eyebrow={item.meta?.heroEyebrow || (isService ? copy.heroEyebrow : item.category || item.service || kind)} image={item.image} text={item.excerpt} title={item.title} urgent={item.slug === "emergency-call-out"} />
      {usePageBuilder ? <PageBuilder blocks={item.meta.blocks} contextTitle={item.title} /> : <>
      <section className="section-large"><div className="container detail-layout">
        <article className="detail-copy">
          <p className="eyebrow">{contentEyebrow}</p>
          <h2>{contentHeading}</h2>
          {item.body ? <div className="text-block" dangerouslySetInnerHTML={{ __html: item.body }} /> : <>
            <p>{item.excerpt}</p>
            <p>{copy.fallbackText}</p>
          </>}
          {highlights.length ? <ul className="detail-points">{highlights.map((highlight) => <li key={highlight}>{highlight}</li>)}</ul> : null}
          {isProject ? <div className="project-facts"><div><span>{copy.sectorLabel}</span><strong>{item.meta?.sector || copy.sectorFallback}</strong></div><div><span>{copy.locationLabel}</span><strong>{item.location || item.meta?.location || copy.locationFallback}</strong></div></div> : null}
          {safetyHeading || safetyText ? <><h2>{safetyHeading}</h2><p>{safetyText}</p></> : null}
        </article>
        <aside className="detail-aside"><p className="eyebrow">{copy.enquiryEyebrow}</p><h2>{copy.enquiryHeading}</h2><QuickEnquiry compact service={item.title} /></aside>
      </div></section>
      <section className="next-step"><div className="container"><p className="eyebrow">{copy.nextEyebrow}</p><h2>{copy.nextHeading}</h2><div className="button-row"><Link className="btn btn-primary" href={copy.enquiryLink.url}>{copy.enquiryLink.label}</Link><Link className="btn btn-black-outline" href={copy.projectsLink.url}>{copy.projectsLink.label}</Link></div></div></section>
      </>}
    </main>
  );
}
