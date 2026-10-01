import { notFound } from "next/navigation";
import CareerApplication from "@/components/forms/CareerApplication";
import PageHero from "@/components/sections/triple-h/PageHero";
import { getContentCollection, getContentItem } from "@/lib/content-items";
import { createContentMetadata } from "@/lib/metadata";
import { vacancySummary } from "@/lib/vacancies";

export async function generateStaticParams() {
  return (await getContentCollection("vacancy")).map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  return createContentMetadata(await getContentItem("vacancy", slug));
}

export default async function VacancyPage({ params }) {
  const { slug } = await params;
  const vacancy = await getContentItem("vacancy", slug);
  if (!vacancy) notFound();
  const duties = vacancy.meta?.duties || [];
  const hasRoleContent = Boolean(vacancy.meta?.roleEyebrow || vacancy.meta?.roleHeading || vacancy.excerpt || vacancy.body || vacancy.meta?.dutiesHeading || duties.length || vacancy.meta?.requirementsHeading || vacancy.meta?.requirementsText);

  return (
    <main id="main-content" tabIndex={-1}>
      <PageHero
        eyebrow={vacancy.meta?.heroEyebrow}
        image={vacancy.image}
        imageAlt={vacancy.meta?.imageAlt}
        text={vacancySummary(vacancy)}
        title={vacancy.title}
      />
      {hasRoleContent ? <section className="section-large vacancy-content">
        <article className="container detail-copy vacancy-copy">
          {vacancy.meta?.roleEyebrow ? <p className="eyebrow">{vacancy.meta.roleEyebrow}</p> : null}
          {vacancy.meta?.roleHeading ? <h2>{vacancy.meta.roleHeading}</h2> : null}
          {vacancy.excerpt ? <p>{vacancy.excerpt}</p> : null}
          {vacancy.body ? <div className="text-block" dangerouslySetInnerHTML={{ __html: vacancy.body }} /> : null}
          {vacancy.meta?.dutiesHeading ? <h2>{vacancy.meta.dutiesHeading}</h2> : null}
          {duties.length ? <ul className="detail-points">
            {duties.map((duty) => <li key={duty}>{duty}</li>)}
          </ul> : null}
          {vacancy.meta?.requirementsHeading ? <h2>{vacancy.meta.requirementsHeading}</h2> : null}
          {vacancy.meta?.requirementsText ? <div className="text-block" dangerouslySetInnerHTML={{ __html: vacancy.meta.requirementsText }} /> : null}
        </article>
      </section> : null}
      <section className="career-application-section">
        <div className="container career-application-panel">
          {vacancy.meta?.applyPrefix || vacancy.meta?.applyHeading || vacancy.meta?.applyText ? <div className="career-application-panel__heading">
            <div>
              {vacancy.meta?.applyPrefix ? <p className="eyebrow">{vacancy.meta.applyPrefix} {vacancy.title}</p> : null}
              {vacancy.meta?.applyHeading ? <h2>{vacancy.meta.applyHeading}</h2> : null}
            </div>
            {vacancy.meta?.applyText ? <div className="text-block" dangerouslySetInnerHTML={{ __html: vacancy.meta.applyText }} /> : null}
          </div> : null}
          <CareerApplication vacancy={vacancy.title} />
        </div>
      </section>
    </main>
  );
}
