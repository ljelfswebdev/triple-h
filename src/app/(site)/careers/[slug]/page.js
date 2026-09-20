import { notFound } from "next/navigation";
import CareerApplication from "@/components/forms/CareerApplication";
import PageHero from "@/components/sections/triple-h/PageHero";
import { getContentCollection, getContentItem } from "@/lib/content-items";
import { getEditablePage } from "@/lib/page-content";
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
  const [vacancy, careersPage] = await Promise.all([getContentItem("vacancy", slug), getEditablePage("careers")]);
  if (!vacancy) notFound();
  const copy = careersPage.content.vacancy;
  const duties = vacancy.meta?.duties?.length ? vacancy.meta.duties.map((text) => ({ text })) : copy.defaultDuties;

  return (
    <main id="main-content" tabIndex={-1}>
      <PageHero
        eyebrow={vacancy.category || copy.heroFallbackEyebrow}
        image={vacancy.image}
        text={vacancySummary(vacancy)}
        title={vacancy.title}
      />
      <section className="section-large vacancy-content">
        <article className="container detail-copy vacancy-copy">
          <p className="eyebrow">{copy.roleEyebrow}</p>
          <h2>{vacancy.meta?.roleHeading || copy.roleHeading}</h2>
          <p>{vacancy.excerpt}</p>
          {vacancy.body ? <div className="text-block" dangerouslySetInnerHTML={{ __html: vacancy.body }} /> : null}
          <h2>{copy.dutiesHeading}</h2>
          <ul className="detail-points">
            {duties.map((duty) => <li key={duty.text}>{duty.text}</li>)}
          </ul>
          <h2>{copy.requirementsHeading}</h2>
          <p>{vacancy.meta?.requirementsText || copy.requirementsText}</p>
        </article>
      </section>
      <section className="career-application-section">
        <div className="container career-application-panel">
          <div className="career-application-panel__heading">
            <div>
              <p className="eyebrow">{copy.applyPrefix} {vacancy.title}</p>
              <h2>{copy.applyHeading}</h2>
            </div>
            <p>
              {copy.applyText}
            </p>
          </div>
          <CareerApplication vacancy={vacancy.title} />
        </div>
      </section>
    </main>
  );
}
