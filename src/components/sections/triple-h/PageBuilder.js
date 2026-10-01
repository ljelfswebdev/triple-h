import Image from "next/image";
import Link from "next/link";
import QuickEnquiry from "@/components/forms/QuickEnquiry";
import { mediaUrl } from "@/lib/page-builder";
import PageBuilderGallery from "./PageBuilderGallery";

function ThemeSection({ block, children, className }) {
  const theme = ["light", "dark", "red"].includes(block.theme) ? block.theme : "light";
  return <section className={`builder-section builder-section--${theme} ${className}`}>{children}</section>;
}

function BuilderLink({ link }) {
  if (!link?.url || !link?.label) return null;
  const className = "btn btn-primary";
  if (/^https?:\/\//.test(link.url) || link.newTab) {
    return <a className={className} href={link.url} rel={link.newTab ? "noreferrer" : undefined} target={link.newTab ? "_blank" : undefined}>{link.label}</a>;
  }
  return <Link className={className} href={link.url}>{link.label}</Link>;
}

function ContentBlock({ block }) {
  return <ThemeSection block={block} className="builder-content"><div className="container builder-content__inner">
    {block.eyebrow ? <p className="eyebrow">{block.eyebrow}</p> : null}
    {block.title ? <h2>{block.title}</h2> : null}
    {block.body ? <div className="builder-rich-text" dangerouslySetInnerHTML={{ __html: block.body }} /> : null}
  </div></ThemeSection>;
}

function TickBlock({ block }) {
  const items = (block.items || []).filter(Boolean);
  return <ThemeSection block={block} className="builder-ticks"><div className="container builder-ticks__inner">
    <div>{block.eyebrow ? <p className="eyebrow">{block.eyebrow}</p> : null}{block.title ? <h2>{block.title}</h2> : null}</div>
    {items.length ? <ul>{items.map((item, index) => <li key={`${item}-${index}`}>{item}</li>)}</ul> : null}
  </div></ThemeSection>;
}

function ImageBlock({ block }) {
  const src = mediaUrl(block.image);
  if (!src) return null;
  return <section className={`builder-section builder-image builder-image--${block.layout === "standard" ? "standard" : "wide"}`}><div className="container">
    <figure className="builder-image__frame"><div><Image alt={block.image?.alt || block.caption || "Triple H at work"} fill quality={75} sizes="(max-width: 900px) 100vw, 1360px" src={src} /></div>{block.caption ? <figcaption>{block.caption}</figcaption> : null}</figure>
  </div></section>;
}

function GalleryBlock({ block }) {
  return <section className="builder-section builder-gallery"><div className="container">
    {(block.eyebrow || block.title) ? <header className="builder-gallery__heading">{block.eyebrow ? <p className="eyebrow">{block.eyebrow}</p> : null}{block.title ? <h2>{block.title}</h2> : null}</header> : null}
    <PageBuilderGallery autoplay={block.autoplay !== false} images={block.images || []} title={block.title || "Image gallery"} />
  </div></section>;
}

function VideoBlock({ block }) {
  const src = mediaUrl(block.video);
  if (!src) return null;
  const autoplay = Boolean(block.autoplay);
  return <section className={`builder-section builder-video builder-video--${block.layout === "standard" ? "standard" : "wide"}`}><div className="container">
    <figure className="builder-video__frame">
      <video
        autoPlay={autoplay}
        controls={block.controls !== false}
        loop={Boolean(block.loop)}
        muted={autoplay || Boolean(block.muted)}
        playsInline
        poster={mediaUrl(block.poster) || undefined}
        preload="metadata"
        src={src}
      />
      {block.caption ? <figcaption>{block.caption}</figcaption> : null}
    </figure>
  </div></section>;
}

function QuoteBlock({ block }) {
  if (!block.quote) return null;
  return <ThemeSection block={block} className="builder-quote"><div className="container"><blockquote><span aria-hidden="true">“</span><p>{block.quote}</p>{block.attribution ? <cite>{block.attribution}</cite> : null}</blockquote></div></ThemeSection>;
}

function StatsBlock({ block }) {
  const items = (block.items || []).filter((item) => item?.value || item?.label);
  if (!items.length) return null;
  return <section className="builder-section builder-stats"><div className="container">
    {(block.eyebrow || block.title) ? <header>{block.eyebrow ? <p className="eyebrow">{block.eyebrow}</p> : null}{block.title ? <h2>{block.title}</h2> : null}</header> : null}
    <div className="builder-stats__grid">{items.map((item, index) => <div className="builder-stats__item" key={`${item.value}-${index}`}><strong>{item.value}</strong><span>{item.label}</span></div>)}</div>
  </div></section>;
}

function CtaBlock({ block }) {
  return <ThemeSection block={block} className="builder-cta"><div className="container builder-cta__inner"><div>
    {block.eyebrow ? <p className="eyebrow">{block.eyebrow}</p> : null}
    {block.title ? <h2>{block.title}</h2> : null}
    {block.text ? <div className="builder-rich-text" dangerouslySetInnerHTML={{ __html: block.text }} /> : null}
  </div><BuilderLink link={block.link} /></div></ThemeSection>;
}

function EnquiryBlock({ block, contextTitle }) {
  return <section className="builder-section builder-enquiry"><div className="container builder-enquiry__grid"><div className="builder-enquiry__intro">
    {block.eyebrow ? <p className="eyebrow">{block.eyebrow}</p> : null}
    {block.title ? <h2>{block.title}</h2> : null}
    {block.text ? <div className="builder-rich-text" dangerouslySetInnerHTML={{ __html: block.text }} /> : null}
  </div><QuickEnquiry service={contextTitle} /></div></section>;
}

const renderers = {
  content: (block) => <ContentBlock block={block} />,
  ticks: (block) => <TickBlock block={block} />,
  image: (block) => <ImageBlock block={block} />,
  gallery: (block) => <GalleryBlock block={block} />,
  video: (block) => <VideoBlock block={block} />,
  quote: (block) => <QuoteBlock block={block} />,
  stats: (block) => <StatsBlock block={block} />,
  cta: (block) => <CtaBlock block={block} />,
};

export default function PageBuilder({ blocks = [], contextTitle }) {
  return <div className="page-builder">{blocks.map((block, index) => {
    if (!block?.type) return null;
    const content = block.type === "enquiry" ? <EnquiryBlock block={block} contextTitle={contextTitle} /> : renderers[block.type]?.(block);
    return content ? <div className="page-builder__block" data-block-type={block.type} key={block.id || `${block.type}-${index}`}>{content}</div> : null;
  })}</div>;
}
