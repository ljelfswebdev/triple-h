import Image from "next/image";
import CareersList from "@/components/careers/CareersList";
import PageHero from "@/components/sections/triple-h/PageHero";
import { RichCopy } from "@/components/sections/shared/Content";
import { getContentCollection } from "@/lib/content-items";
import { getEditablePage, getEditablePageMetadata, pageMediaUrl } from "@/lib/page-content";

export async function generateMetadata() { return getEditablePageMetadata("careers"); }
export default async function CareersPage() {
  const [vacancies, page] = await Promise.all([getContentCollection("vacancy"), getEditablePage("careers")]);
  const { hero, intro, jobs } = page.content;
  return <main id="main-content" tabIndex={-1}>
    <PageHero eyebrow={hero.eyebrow} image={pageMediaUrl(hero.image)} imageAlt={hero.image?.alt} text={hero.text} title={hero.title} />
    <section className="section-large"><div className="container careers-intro"><div><p className="eyebrow">{intro.eyebrow}</p><h2>{intro.title}</h2><RichCopy html={intro.text} /></div><div className="careers-intro__image"><Image alt={intro.image?.alt || intro.title} fetchPriority="low" fill loading="lazy" quality={35} sizes="(max-width: 800px) 100vw, 45vw" src={pageMediaUrl(intro.image)} /></div></div></section>
    <section className="section-large jobs-section"><div className="container"><div className="section-heading"><p className="eyebrow">{jobs.eyebrow}</p><h2>{jobs.title}</h2></div><CareersList vacancies={vacancies} /></div></section>
  </main>;
}
