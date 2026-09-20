"use client";

import { useRef } from "react";
import SiteImage from "@/components/ui/SiteImage";

function Arrow({ direction }) {
  const isPrevious = direction === "previous";

  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 20 20"
    >
      <path
        d={isPrevious ? "M12.5 4.5 7 10l5.5 5.5" : "M7.5 4.5 13 10l-5.5 5.5"}
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

export default function Usps({ items = [] }) {
  const sliderRef = useRef(null);

  if (!items.length) return null;

  function move(direction) {
    const slider = sliderRef.current;
    const firstItem = slider?.querySelector("li");
    if (!slider || !firstItem) return;

    const styles = window.getComputedStyle(slider);
    const gap = Number.parseFloat(styles.columnGap || styles.gap) || 0;
    const distance = firstItem.getBoundingClientRect().width + gap;
    slider.scrollBy({
      behavior: "smooth",
      left: direction === "previous" ? -distance : distance,
    });
  }

  return (
    <section
      aria-label="Key benefits"
      className="bg-white py-[var(--section-padding-small)]"
    >
      <div className="container">
        <div className="relative">
        <ul
          className="m-0 flex snap-x snap-mandatory scroll-px-12 list-none gap-6 overflow-x-auto px-12 py-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:scroll-px-14 sm:px-14 lg:grid lg:grid-cols-4 lg:overflow-visible lg:px-0"
          ref={sliderRef}
          tabIndex={items.length > 1 ? 0 : undefined}
        >
          {items.map((item, index) => (
            <li
              className="w-full shrink-0 snap-center sm:w-[calc(50%-12px)] lg:w-auto"
              key={item.icon?._id || `${index}-${item.text}`}
            >
              <div className="flex h-full items-center justify-center gap-3">
                {item.icon ? (
                  <SiteImage
                    alt={item.icon.alt || ""}
                    className="h-10 w-10 shrink-0 object-contain"
                    height={40}
                    objectFit="contain"
                    sizes="40px"
                    src={item.icon}
                    width={40}
                  />
                ) : null}
                {item.text ? (
                  <div
                    className="text-block body-small text-center text-[var(--color-black)] [&>*]:m-0"
                    dangerouslySetInnerHTML={{ __html: item.text }}
                  />
                ) : null}
              </div>
            </li>
          ))}
        </ul>
        {items.length > 1 ? (
          <div className="pointer-events-none absolute inset-x-0 top-1/2 z-10 flex -translate-y-1/2 justify-between lg:hidden">
            <button
              aria-label="Previous benefit"
              className="pointer-events-auto grid h-10 w-10 shrink-0 cursor-pointer place-items-center rounded-full border border-[var(--color-secondary)] bg-white text-[var(--color-secondary)] shadow-[var(--shadow-small)] transition-colors hover:bg-[var(--color-secondary)] hover:text-white focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[color-mix(in_srgb,var(--color-secondary)_30%,transparent)]"
              onClick={() => move("previous")}
              type="button"
            >
              <Arrow direction="previous" />
            </button>
            <button
              aria-label="Next benefit"
              className="pointer-events-auto grid h-10 w-10 shrink-0 cursor-pointer place-items-center rounded-full border border-[var(--color-secondary)] bg-white text-[var(--color-secondary)] shadow-[var(--shadow-small)] transition-colors hover:bg-[var(--color-secondary)] hover:text-white focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[color-mix(in_srgb,var(--color-secondary)_30%,transparent)]"
              onClick={() => move("next")}
              type="button"
            >
              <Arrow direction="next" />
            </button>
          </div>
        ) : null}
        </div>
      </div>
    </section>
  );
}
