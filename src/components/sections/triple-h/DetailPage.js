import Link from "next/link";
import PageHero from "./PageHero";
import QuickEnquiry from "@/components/forms/QuickEnquiry";
import { pageBuilderEnabled } from "@/lib/page-builder";
import PageBuilder from "./PageBuilder";
import { getGlobals } from "@/lib/site-data";
import { mergeSiteCopy } from "@/lib/site-copy";

export default async function DetailPage({ item, kind }) {
  const isService = kind === "service";
  const isProject = kind === "project";
  const copy = mergeSiteCopy((await getGlobals())?.siteCopy).detail;
  const highlights = item.highlights || item.meta?.highlights || [];
  const contentEyebrow = item.meta?.contentEyebrow;
  const contentHeading = item.meta?.contentHeading;
  const safetyHeading = item.meta?.safetyHeading;
  const safetyText = item.meta?.safetyText;
  const enquiryEyebrow = item.meta?.enquiryEyebrow;
  const enquiryHeading = item.meta?.enquiryHeading;
  const nextEyebrow = item.meta?.nextEyebrow;
  const nextHeading = item.meta?.nextHeading;
  const enquiryLink = item.meta?.enquiryLink;
  const projectsLink = item.meta?.projectsLink;
  const projectSector = item.meta?.sector;
  const projectLocation = item.location || item.meta?.location;
  const hasArticleContent = Boolean(contentEyebrow || contentHeading || item.body || highlights.length || safetyHeading || safetyText || (isProject && (projectSector || projectLocation)));
  const hasNextStep = Boolean(nextEyebrow || nextHeading || (enquiryLink?.label && enquiryLink?.url) || (projectsLink?.label && projectsLink?.url));
  const usePageBuilder = pageBuilderEnabled(item);
  return (
    <main id="main-content" tabIndex={-1}>
      <PageHero eyebrow={item.meta?.heroEyebrow} image={item.image} imageAlt={item.meta?.imageAlt} text={item.excerpt} title={item.title} urgent={item.slug === "emergency-call-out"} />
      {usePageBuilder ? <PageBuilder blocks={item.meta.blocks} contextTitle={item.title} /> : <>
      <section className="section-large"><div className="container detail-layout">
        {hasArticleContent ? <article className="detail-copy">
          {contentEyebrow ? <p className="eyebrow">{contentEyebrow}</p> : null}
          {contentHeading ? <h2>{contentHeading}</h2> : null}
          {item.body ? <div className="text-block" dangerouslySetInnerHTML={{ __html: item.body }} /> : null}
          {highlights.length ? <ul className="detail-points">{highlights.map((highlight) => <li key={highlight}>{highlight}</li>)}</ul> : null}
          {isProject && (projectSector || projectLocation) ? <div className="project-facts">{projectSector ? <div><span>{copy.sectorLabel}</span><strong>{projectSector}</strong></div> : null}{projectLocation ? <div><span>{copy.locationLabel}</span><strong>{projectLocation}</strong></div> : null}</div> : null}
          {safetyHeading || safetyText ? <>{safetyHeading ? <h2>{safetyHeading}</h2> : null}{safetyText ? <div className="text-block" dangerouslySetInnerHTML={{ __html: safetyText }} /> : null}</> : null}
        </article> : null}
        <aside className="detail-aside">{enquiryEyebrow ? <p className="eyebrow">{enquiryEyebrow}</p> : null}{enquiryHeading ? <h2>{enquiryHeading}</h2> : null}<QuickEnquiry compact service={item.title} /></aside>
      </div></section>
      {hasNextStep ? <section className="next-step"><div className="container">{nextEyebrow ? <p className="eyebrow">{nextEyebrow}</p> : null}{nextHeading ? <h2>{nextHeading}</h2> : null}{(enquiryLink?.label && enquiryLink?.url) || (projectsLink?.label && projectsLink?.url) ? <div className="button-row">{enquiryLink?.label && enquiryLink?.url ? <Link className="btn btn-primary" href={enquiryLink.url} rel={enquiryLink.newTab ? "noreferrer" : undefined} target={enquiryLink.newTab ? "_blank" : undefined}>{enquiryLink.label}</Link> : null}{projectsLink?.label && projectsLink?.url ? <Link className="btn btn-black-outline" href={projectsLink.url} rel={projectsLink.newTab ? "noreferrer" : undefined} target={projectsLink.newTab ? "_blank" : undefined}>{projectsLink.label}</Link> : null}</div> : null}</div></section> : null}
      </>}
    </main>
  );
}
