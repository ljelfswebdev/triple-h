import Image from "next/image";
import Link from "next/link";
import CollectionCard from "./CollectionCard";
import ParallaxMedia from "./ParallaxMedia";
import QuickEnquiry from "@/components/forms/QuickEnquiry";
import { pageMediaUrl } from "@/lib/page-content";

export default function HomePage({ contact, content, services, projects, news, vacancies }) {
  const hasVacancies = vacancies.length > 0;
  const hero = content.hero;
  const capability = content.capability;
  const standard = content.standard;
  const careers = content.careers;
  const heroActions = content.heroActions;
  const ticker = content.ticker;
  const projectCopy = content.projects;
  const newsCopy = content.news;
  const emergency = content.emergency;
  const heroTitle = hero.title.split(/(?<=\.)\s+/).filter(Boolean);

  return (
    <main id="main-content" tabIndex={-1}>
      <section className="th-hero">
        {pageMediaUrl(hero.image) ? <Image alt={hero.image?.alt || hero.title} decoding="sync" fetchPriority="high" fill loading="eager" quality={35} sizes="100vw" src={pageMediaUrl(hero.image)} /> : null}
        <div className="th-hero__scrim" />
        <div className="container th-hero__content">
          <p className="eyebrow">{hero.eyebrow}</p>
          <h1>{heroTitle.map((line, index) => index === heroTitle.length - 1 ? <strong key={line}>{line}</strong> : <span key={line}>{line}</span>)}</h1>
          <p className="th-hero__lede">{hero.text}</p>
          <div className="button-row">
            <Link className="btn btn-primary btn-large" href={heroActions.primaryLink.url}>{heroActions.primaryLink.label}</Link>
            {hasVacancies ? <Link className="btn btn-white-outline btn-large" href={heroActions.careersLink.url}>{heroActions.careersLink.label}</Link> : null}
          </div>
        </div>
      </section>

      <section className="proof-strip" aria-label="Key facts">
        <div className="container proof-strip__grid">
          {content.proof.items.map((item) => <div key={`${item.value}-${item.label}`}><strong>{item.value}</strong><span>{item.label}</span></div>)}
        </div>
      </section>

      <section aria-label={ticker.ariaLabel} className="values-ticker">
        <div className="values-ticker__viewport">
          <div className="values-ticker__track">
            {[false, true].map((duplicate) => (
              <div aria-hidden={duplicate ? "true" : undefined} className="values-ticker__group" key={duplicate ? "duplicate" : "primary"}>
                {ticker.items.map((item, index) => <span className="values-ticker__item" key={`${duplicate ? "duplicate" : "primary"}-${item.text}-${index}`}>{item.text}</span>)}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-large capability-section">
        <div className="container">
          <div className="section-heading section-heading--split">
            <div><p className="eyebrow">{capability.eyebrow}</p><h2>{capability.title}</h2></div>
            <p>{capability.text}</p>
          </div>
          <div className="content-grid content-grid--services">
            {services.map((service, index) => <CollectionCard href={`/services/${service.slug}`} index={index} item={service} key={service.slug} />)}
          </div>
        </div>
      </section>

      <section className="split-feature">
        <ParallaxMedia alt={standard.image?.alt || standard.title} src={pageMediaUrl(standard.image)} label={standard.eyebrow} number={standard.number} />
        <div className="split-feature__content">
          <p className="eyebrow">{standard.eyebrow}</p>
          <h2>{standard.title}</h2>
          <p>{standard.text}</p>
          <ul className="tick-list">{standard.points.map((point) => <li key={point.text}>{point.text}</li>)}</ul>
          <Link className="btn btn-primary" href={standard.link.url}>{standard.link.label}</Link>
        </div>
      </section>

      <section className="section-large dark-section">
        <div className="container">
          <div className="section-heading section-heading--split"><div><p className="eyebrow">{projectCopy.eyebrow}</p><h2>{projectCopy.title}</h2></div><Link className="btn btn-white-outline" href={projectCopy.link.url} rel={projectCopy.link.newTab ? "noreferrer" : undefined} target={projectCopy.link.newTab ? "_blank" : undefined}>{projectCopy.link.label}</Link></div>
          <div className="content-grid">{projects.map((project, index) => <CollectionCard href={`/projects/${project.slug}`} index={index} item={project} key={project.slug} />)}</div>
        </div>
      </section>

      <section className="careers-band">
        <div className="careers-band__media">{pageMediaUrl(careers.image) ? <Image alt={careers.image?.alt || careers.title} fetchPriority="low" fill loading="lazy" sizes="100vw" src={pageMediaUrl(careers.image)} /> : null}</div>
        <div className="container careers-band__content">
          <p className="eyebrow">{careers.eyebrow}</p>
          <h2>{careers.title}</h2>
          <p>{careers.text}</p>
          <div className="vacancy-pills">{vacancies.slice(0, 3).map((vacancy) => <Link href={`/careers/${vacancy.slug}`} key={vacancy.slug}>{vacancy.title}</Link>)}</div>
          <Link className="btn btn-primary" href={careers.link.url}>{careers.link.label}</Link>
        </div>
      </section>

      <section className="section-large">
        <div className="container compact-grid">
          <div>
            <p className="eyebrow">{newsCopy.eyebrow}</p><h2>{newsCopy.title}</h2>
            <div className="news-list">{news.map((item) => <Link href={`/news/${item.slug}`} key={item.slug}><span>{item.category}</span><strong>{item.title}</strong><time>{new Date(item.date || item.publishedAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</time></Link>)}</div>
          </div>
          <aside className="enquiry-panel"><p className="eyebrow">{newsCopy.enquiryEyebrow}</p><h2>{newsCopy.enquiryTitle}</h2><QuickEnquiry compact /></aside>
        </div>
      </section>

      <section className="emergency-bar"><div className="container"><div><p className="eyebrow">{emergency.eyebrow}</p><h2>{emergency.title}</h2></div><a className="emergency-bar__number" href={`tel:${contact.number.replace(/[^\d+]/g, "")}`}>{contact.number}</a></div></section>
    </main>
  );
}
