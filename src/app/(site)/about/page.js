import Image from "next/image";
import Link from "next/link";
import PageHero from "@/components/sections/triple-h/PageHero";
import { getEditablePage, getEditablePageMetadata, pageMediaUrl } from "@/lib/page-content";

export async function generateMetadata() { return getEditablePageMetadata("about"); }

export default async function AboutPage() {
  const { content } = await getEditablePage("about");
  const { hero, intro, directory, values } = content;
  const introImage = pageMediaUrl(intro.image);
  return (
    <main id="main-content" tabIndex={-1}>
      <PageHero eyebrow={hero.eyebrow} image={pageMediaUrl(hero.image)} text={hero.text} title={hero.title} />
      <section className="section-large">
        <div className={`container story-grid${introImage ? "" : " story-grid--text-only"}`}>
          <div className="story-grid__content">
            <p className="eyebrow">{intro.eyebrow}</p>
            <h2>{intro.title}</h2>
            <div className="text-block" dangerouslySetInnerHTML={{ __html: intro.body }} />
            <Link className="btn btn-primary" href={intro.link.url} rel={intro.link.newTab ? "noreferrer" : undefined} target={intro.link.newTab ? "_blank" : undefined}>{intro.link.label}</Link>
          </div>
          {introImage ? <div className="story-grid__image"><Image alt={intro.image?.alt || intro.title} fetchPriority="low" fill loading="lazy" quality={35} sizes="(max-width: 900px) 100vw, 50vw" src={introImage} /></div> : null}
        </div>
      </section>
      <section className="about-directory"><div className="container"><div className="section-heading"><p className="eyebrow">{directory.eyebrow}</p><h2>{directory.title}</h2></div><div className="about-directory__grid">{directory.items.map((item) => <Link href={item.link.url} key={`${item.number}-${item.title}`}><span>{item.number}</span><h3>{item.title}</h3><p>{item.text}</p><b aria-hidden="true">↗</b></Link>)}</div></div></section>
      <section className="values-section"><div className="container"><div className="section-heading"><p className="eyebrow">{values.eyebrow}</p><h2>{values.title}</h2></div><div className="values-grid">{values.items.map((item) => <article key={`${item.number}-${item.title}`}><span>{item.number}</span><h3>{item.title}</h3><p>{item.text}</p></article>)}</div></div></section>
    </main>
  );
}
