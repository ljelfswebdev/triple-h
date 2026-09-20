"use client";

import { useCallback, useState } from "react";
import { createPortal } from "react-dom";
import Modal from "@/components/ui/Modal";
import Reveal from "@/components/ui/Reveal";
import SwiperButtons from "@/components/ui/SwiperButtons";
import { headingMarkup, hasRichText } from "@/lib/content";
import { testimonialPlainText, testimonialPreview } from "@/lib/testimonials";
import { RichCopy } from "./Content";

function Stars() {
  return <span className="testimonial-stars block text-[#ffc75f]" aria-label="5 out of 5 stars" role="img">★★★★★</span>;
}

export default function TestimonialsPanel({ content = {}, testimonials = [], titleId = "testimonials-title" }) {
  const items = testimonials.filter((item) => testimonialPlainText(item.text));
  const featured = items.findIndex((item) => testimonialPlainText(item.name) === content.featuredName);
  const [index, setIndex] = useState(Math.max(0, featured));
  const [selected, setSelected] = useState(null);
  const closeModal = useCallback(() => setSelected(null), []);
  if (!items.length || (!hasRichText(content.title) && !hasRichText(content.text))) return null;
  return <>
    <section className="py-[var(--section-padding-medium)]" aria-labelledby={hasRichText(content.title) ? titleId : undefined}>
      <div className="container">
        <div className="testimonials-panel grid grid-cols-[400px_minmax(0,1fr)] items-center gap-8 rounded-[var(--radius-large)] px-16 py-[52px] text-white [background:var(--gradient-orange)] max-[800px]:grid-cols-1 max-[800px]:p-[var(--section-padding-small)]">
          <Reveal from="left">
            {hasRichText(content.title) ? <h2 className="mt-0 mb-3" id={titleId} dangerouslySetInnerHTML={{ __html: headingMarkup(content.title) }} /> : null}
            <RichCopy html={content.text} />
          </Reveal>
          <Reveal className="min-w-0 border-l border-white pl-8 max-[800px]:border-t max-[800px]:border-l-0 max-[800px]:pt-[var(--section-padding-small)] max-[800px]:pl-0" delay={100} from="right" aria-roledescription="carousel" aria-label="Customer testimonials">
            <Stars />
            <div className="my-6 mb-8 grid" aria-live="polite" aria-atomic="true">
              {items.map((item, slideIndex) => {
                const preview = testimonialPreview(item.text);
                const name = testimonialPlainText(item.name);
                const isActive = slideIndex === index % items.length;
                return <figure key={item._id || slideIndex} className={`col-start-1 row-start-1 m-0 ${isActive ? "visible" : "invisible"}`} aria-hidden={!isActive || undefined} inert={!isActive || undefined}>
                  <blockquote className="m-0 mb-3 [overflow-wrap:anywhere]">“{preview.text}”{" "}{preview.truncated ? <button type="button" aria-haspopup="dialog" aria-label={`Read more${name ? ` from ${name}` : " about this testimonial"}`} className="border-0 bg-transparent p-0 font-bold text-inherit underline underline-offset-[3px]" onClick={() => setSelected(item)}>Read More</button> : null}</blockquote>
                  <figcaption className="[overflow-wrap:anywhere]">{name}</figcaption>
                </figure>;
              })}
            </div>
            <SwiperButtons variant="white" disabled={items.length < 2 || Boolean(selected)} onPrevious={() => setIndex((i) => (i - 1 + items.length) % items.length)} onNext={() => setIndex((i) => (i + 1) % items.length)} />
          </Reveal>
        </div>
      </div>
    </section>
    {selected ? createPortal(<Modal onClose={closeModal} open title={testimonialPlainText(selected.name) ? `Testimonial from ${testimonialPlainText(selected.name)}` : "Customer testimonial"}><div className="mt-5"><Stars /></div><div className="text-block mt-5" dangerouslySetInnerHTML={{ __html: selected.text }} /></Modal>, document.body) : null}
  </>;
}
