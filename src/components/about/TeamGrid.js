"use client";

import Image from "next/image";
import { useState } from "react";
import Modal from "@/components/ui/Modal";
import PaginationControls, { usePaginatedItems } from "@/components/ui/PaginationControls";
import { useSiteCopy } from "@/components/global/SiteCopyProvider";
import { trackEvent } from "@/lib/analytics-events";

export default function TeamGrid({ members }) {
  const { cards } = useSiteCopy();
  const [selected, setSelected] = useState(null);
  const pagination = usePaginatedItems(members);

  return (
    <>
      <div className="team-grid pagination-scroll-target" id="team-grid-start">
        {pagination.pageItems.map((member, index) => (
          <button className="team-card" key={member.slug} onClick={() => { trackEvent("Card Click", { cardType: "team", slug: member.slug }); setSelected(member); }} style={{ "--card-index": pagination.startIndex + index }} type="button">
            <span className="team-card__media">
              {member.image ? <Image alt={`${member.title}, ${member.category}`} fetchPriority="low" fill loading="lazy" quality={35} sizes="(max-width: 700px) 100vw, (max-width: 1080px) 50vw, 33vw" src={member.image} /> : null}
              <span className="team-card__reveal">{cards.viewProfileLabel} <b aria-hidden="true">↗</b></span>
            </span>
            <span className="team-card__body"><span>{member.category}</span><strong>{member.title}</strong><small>{member.excerpt}</small></span>
          </button>
        ))}
      </div>
      <PaginationControls itemLabel={cards.teamPaginationLabel} onChange={pagination.setPage} page={pagination.page} scrollTargetId="team-grid-start" totalItems={members.length} />
      <Modal className="team-profile-modal" onClose={() => setSelected(null)} open={Boolean(selected)} title={selected?.title}>
        {selected ? (
          <div className="team-profile">
            <div className="team-profile__image">{selected.image ? <Image alt={`${selected.title}, ${selected.category}`} fill sizes="(max-width: 700px) 100vw, 340px" src={selected.image} /> : null}</div>
            <div className="team-profile__copy">
              <p className="eyebrow">{selected.category}</p><p className="team-profile__intro">{selected.excerpt}</p>
              <div dangerouslySetInnerHTML={{ __html: selected.body || selected.meta?.body || "" }} />
            </div>
          </div>
        ) : null}
      </Modal>
    </>
  );
}
