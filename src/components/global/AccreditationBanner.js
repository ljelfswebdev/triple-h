"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AccreditationBanner({ copy, items = [] }) {
  const pathname = usePathname();

  if (!items.length || pathname.startsWith("/portal")) return null;

  const accreditationCards = (setName, hidden = false) => (
    <div aria-hidden={hidden || undefined} className="accreditation-banner__group">
      {items.map((item, index) => (
        <article
          className="accreditation-banner__item"
          key={`${setName}-${item._id || item.slug || index}`}
          role={hidden ? undefined : "listitem"}
        >
          <span className="accreditation-banner__badge" aria-hidden="true">
            {item.meta?.badge || String(index + 1).padStart(2, "0")}
          </span>
          <div>
            <strong>{item.title}</strong>
            {item.excerpt ? <span>{item.excerpt}</span> : null}
          </div>
        </article>
      ))}
    </div>
  );

  return (
    <section aria-label={copy.ariaLabel} className="accreditation-banner">
      <div className="container">
        <div className="accreditation-banner__heading">
          <div>
            <p className="eyebrow">{copy.eyebrow}</p>
            <h2>{copy.title}</h2>
          </div>
          <Link
            className="accreditation-banner__link"
            href={copy.link.url}
            rel={copy.link.newTab ? "noopener noreferrer" : undefined}
            target={copy.link.newTab ? "_blank" : undefined}
          >
            {copy.link.label} <span aria-hidden="true">→</span>
          </Link>
        </div>
        <div className="accreditation-banner__viewport" role="list">
          <div className="accreditation-banner__track">
            {accreditationCards("primary")}
            {accreditationCards("duplicate", true)}
          </div>
        </div>
      </div>
    </section>
  );
}
