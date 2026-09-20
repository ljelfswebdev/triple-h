"use client";

import { useEffect } from "react";

const revealGroups = [
  {
    className: "motion-reveal--left",
    selectors: [
      ".section-heading > div",
      ".split-feature__content > *",
      ".careers-band__content > *",
      ".detail-copy > *",
      ".about-editorial__copy > *",
      ".contact-card > *",
      ".career-application-panel__heading > *",
      ".builder-content__inner > *",
      ".builder-cta__inner > div > *",
      ".builder-enquiry__intro > *",
    ],
  },
  {
    className: "motion-reveal--right",
    selectors: [
      ".section-heading--split > p",
      ".compact-grid > aside",
      ".detail-aside",
      ".newsletter-banner__inner > form",
    ],
  },
  {
    className: "motion-reveal--up",
    selectors: [
      ".section-heading:not(.section-heading--split)",
      ".compact-grid > div > .eyebrow",
      ".compact-grid > div > h2",
      ".enquiry-panel > *",
      ".next-step .container > *",
      ".contact-layout > *",
      ".compliance-grid > *",
      ".career-form > *",
    ],
  },
  {
    className: "motion-reveal--fade",
    selectors: [
      ".content-card",
      ".team-card",
      ".testimonial-card",
      ".values-grid article",
      ".proof-strip__grid > div",
      ".about-directory__grid > a",
      ".cert-grid > div",
      ".system-list > div",
      ".news-list > a",
      ".jobs-list > a",
      ".project-facts > div",
      ".newsletter-banner__inner > div",
      ".emergency-bar .container > *",
      ".vacancy-pills > a",
      ".builder-stats__item",
      ".builder-image__frame",
      ".builder-gallery__swiper",
      ".builder-video__frame",
      ".builder-quote blockquote",
      ".builder-ticks li",
    ],
  },
];

function siblingDelay(element) {
  const siblings = element.parentElement ? [...element.parentElement.children] : [];
  const index = Math.max(0, siblings.indexOf(element));
  return Math.min(index * 75, 375);
}

export default function SiteMotion() {
  useEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (motionQuery.matches || !("IntersectionObserver" in window)) return undefined;

    document.body.classList.add("site-motion-ready");
    const tracked = new Set();
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );

    function scan() {
      const additions = [];
      revealGroups.forEach(({ className, selectors }) => {
        document.querySelectorAll(selectors.join(",")).forEach((element) => {
          if (tracked.has(element) || element.closest(".admin-shell")) return;
          tracked.add(element);
          const bounds = element.getBoundingClientRect();
          additions.push({
            alreadyVisible: bounds.bottom > 0 && bounds.top < window.innerHeight * 0.94,
            className,
            delay: siblingDelay(element),
            element,
          });
        });
      });

      additions.forEach(({ alreadyVisible, className, delay, element }) => {
          element.classList.add("motion-reveal", className);
          element.style.setProperty("--motion-delay", `${delay}ms`);
          if (alreadyVisible) {
            window.requestAnimationFrame(() => element.classList.add("is-visible"));
          } else {
            observer.observe(element);
          }
      });
    }

    let frame = window.requestAnimationFrame(scan);
    const mutationObserver = new MutationObserver(() => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(scan);
    });
    mutationObserver.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.cancelAnimationFrame(frame);
      mutationObserver.disconnect();
      observer.disconnect();
      tracked.forEach((element) => {
        element.classList.remove(
          "motion-reveal",
          "motion-reveal--left",
          "motion-reveal--right",
          "motion-reveal--up",
          "motion-reveal--fade",
          "motion-reveal--clip",
          "is-visible",
        );
        element.style.removeProperty("--motion-delay");
      });
      document.body.classList.remove("site-motion-ready");
    };
  }, []);

  return null;
}
