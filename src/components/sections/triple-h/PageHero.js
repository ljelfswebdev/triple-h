import Image from "next/image";

export default function PageHero({ eyebrow, title, text, image, imageAlt, urgent = false }) {
  return (
    <section className={`page-hero${urgent ? " page-hero--urgent" : ""}`}>
      {image ? <Image alt={imageAlt || title} decoding="sync" fetchPriority="high" fill loading="eager" quality={35} sizes="100vw" src={image} /> : null}
      <div className="page-hero__scrim" />
      <div className="container page-hero__inner">
        {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
        <h1>{title}</h1>
        {text ? <div className="page-hero__text text-block" dangerouslySetInnerHTML={{ __html: text }} /> : null}
      </div>
    </section>
  );
}
