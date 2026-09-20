"use client";

import Image from "next/image";
import Link from "next/link";
import { useSiteCopy } from "@/components/global/SiteCopyProvider";

export default function CollectionCard({ item, href, index, showDate = false }) {
  const { cards } = useSiteCopy();
  const publishedDate = item.date || item.publishedAt;

  return (
    <Link className="content-card reveal-card" href={href}>
      {item.image ? (
        <div className="content-card__media">
          <Image alt={item.title} fetchPriority="low" fill loading="lazy" quality={35} sizes="(max-width: 760px) 100vw, 33vw" src={item.image} />
          <span className="content-card__index">{item.number || String(index + 1).padStart(2, "0")}</span>
        </div>
      ) : null}
      <div className="content-card__body">
        {item.category || item.service || (showDate && publishedDate) ? (
          <div className="content-card__meta">
            {item.category || item.service ? <p className="eyebrow">{item.category || item.service}</p> : null}
            {showDate && publishedDate ? (
              <time dateTime={new Date(publishedDate).toISOString()}>
                {new Date(publishedDate).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </time>
            ) : null}
          </div>
        ) : null}
        <h2 className="content-card__title">{item.title}</h2>
        <p>{item.excerpt}</p>
        <span className="text-link">{cards.exploreLabel} <span aria-hidden="true">↗</span></span>
      </div>
    </Link>
  );
}
