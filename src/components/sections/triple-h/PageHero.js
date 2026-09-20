import Image from "next/image";

export default function PageHero({ eyebrow, title, text, image, urgent = false }) {
  return (
    <section className={`page-hero${urgent ? " page-hero--urgent" : ""}`}>
      {image ? <Image alt={title} decoding="sync" fetchPriority="high" fill loading="eager" quality={35} sizes="100vw" src={image} /> : null}
      <div className="page-hero__scrim" />
      <div className="container page-hero__inner">
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        {text ? <p className="page-hero__text">{text}</p> : null}
      </div>
    </section>
  );
}
