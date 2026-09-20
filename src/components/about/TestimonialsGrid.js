"use client";

import { useState } from "react";
import Modal from "@/components/ui/Modal";
import PaginationControls, { usePaginatedItems } from "@/components/ui/PaginationControls";
import { testimonialPreview } from "@/lib/testimonials";
import { useSiteCopy } from "@/components/global/SiteCopyProvider";
import { trackEvent } from "@/lib/analytics-events";

function fullTestimonial(item) {
  return [item.excerpt, item.body].filter(Boolean).join(" ");
}

export default function TestimonialsGrid({ testimonials }) {
  const { cards } = useSiteCopy();
  const [selected, setSelected] = useState(null);
  const pagination = usePaginatedItems(testimonials);

  return (
    <>
      <div className="testimonial-grid pagination-scroll-target" id="testimonials-grid-start">
        {pagination.pageItems.map((item, index) => {
          const preview = testimonialPreview(fullTestimonial(item));

          return (
            <article className="testimonial-card" key={item.slug}>
              <span aria-hidden="true" className="testimonial-card__mark">“</span>
              <blockquote>“{preview.text}”</blockquote>
              {preview.truncated ? (
                <button
                  aria-haspopup="dialog"
                  className="testimonial-card__read-more"
                  onClick={() => { trackEvent("Card Click", { cardType: "testimonial", slug: item.slug }); setSelected(item); }}
                  type="button"
                >
                  {cards.testimonialReadMoreLabel} <span aria-hidden="true">↗</span>
                </button>
              ) : null}
              <footer>
                <span>{String(pagination.startIndex + index + 1).padStart(2, "0")}</span>
                <div><strong>{item.title}</strong><small>{item.category}</small></div>
              </footer>
            </article>
          );
        })}
      </div>
      <PaginationControls itemLabel={cards.testimonialPaginationLabel} onChange={pagination.setPage} page={pagination.page} scrollTargetId="testimonials-grid-start" totalItems={testimonials.length} />
      <Modal
        className="testimonial-modal"
        onClose={() => setSelected(null)}
        open={Boolean(selected)}
        title={selected ? `${cards.testimonialModalPrefix} ${selected.title}` : cards.testimonialModalFallback}
      >
        {selected ? (
          <div className="testimonial-modal__content">
            <span aria-hidden="true" className="testimonial-modal__mark">“</span>
            <blockquote>{selected.excerpt}</blockquote>
            {selected.body ? <div className="testimonial-modal__detail" dangerouslySetInnerHTML={{ __html: selected.body }} /> : null}
            <p className="testimonial-modal__source"><strong>{selected.title}</strong><span>{selected.category}</span></p>
          </div>
        ) : null}
      </Modal>
    </>
  );
}
