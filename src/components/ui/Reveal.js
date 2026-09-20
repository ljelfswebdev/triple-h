"use client";

import { useEffect, useRef } from "react";

const directions = new Set(["fade", "left", "right", "up"]);

function revealClass(from, prefix) {
  const direction = directions.has(from) ? from : "fade";
  return `${prefix} ${prefix}--${direction}`;
}

function observeReveal(element, prepare) {
  if (!element) return undefined;

  const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  const compactQuery = window.matchMedia("(max-width: 800px)");
  let frame;
  let observer;
  const cleanupPreparedItems = prepare?.();

  const showImmediately = () => {
    element.dataset.revealState = "visible";
    observer?.disconnect();
  };

  // Mobile CPUs benefit more from avoiding observers and synchronous layout
  // reads than from decorative entrance motion.
  if (compactQuery.matches) {
    showImmediately();
    return () => cleanupPreparedItems?.();
  }

  // Never hide content that was already painted in the initial viewport.
  const bounds = element.getBoundingClientRect();
  const isInViewport = bounds.top < window.innerHeight && bounds.bottom > 0;

  if (isInViewport || motionQuery.matches || !("IntersectionObserver" in window)) {
    showImmediately();
    return () => cleanupPreparedItems?.();
  }

  element.dataset.revealState = "pending";

  const handleMotionPreference = (event) => {
    if (event.matches) showImmediately();
  };

  motionQuery.addEventListener("change", handleMotionPreference);

  frame = window.requestAnimationFrame(() => {
    frame = window.requestAnimationFrame(() => {
      observer = new IntersectionObserver(
        ([entry]) => {
          if (!entry.isIntersecting) return;
          element.dataset.revealState = "visible";
          observer.disconnect();
        },
        {
          rootMargin: "0px 0px -10% 0px",
          threshold: 0.05,
        },
      );

      observer.observe(element);
    });
  });

  return () => {
    window.cancelAnimationFrame(frame);
    observer?.disconnect();
    motionQuery.removeEventListener("change", handleMotionPreference);
    cleanupPreparedItems?.();
  };
}

export default function Reveal({
  as: Component = "div",
  children,
  className = "",
  delay = 0,
  duration = 600,
  from = "fade",
  style,
  ...props
}) {
  const elementRef = useRef(null);

  useEffect(() => observeReveal(elementRef.current), []);

  return (
    <Component
      {...props}
      className={`${revealClass(from, "reveal")} ${className}`.trim()}
      ref={elementRef}
      style={{
        "--reveal-delay": `${delay}ms`,
        "--reveal-duration": `${duration}ms`,
        ...style,
      }}
    >
      {children}
    </Component>
  );
}

export function StaggerReveal({
  as: Component = "div",
  children,
  className = "",
  delay = 0,
  duration = 600,
  from = "fade",
  itemSelector = ":scope > *",
  stagger = 80,
  style,
  ...props
}) {
  const elementRef = useRef(null);

  useEffect(
    () =>
      observeReveal(elementRef.current, () => {
        const items = Array.from(
          elementRef.current.querySelectorAll(itemSelector),
        );

        items.forEach((item, index) => {
          item.classList.add("reveal-stagger__item");
          item.style.setProperty(
            "--reveal-item-delay",
            `${delay + index * stagger}ms`,
          );
        });

        return () => {
          items.forEach((item) => {
            item.classList.remove("reveal-stagger__item");
            item.style.removeProperty("--reveal-item-delay");
          });
        };
      }),
    [delay, itemSelector, stagger],
  );

  return (
    <Component
      {...props}
      className={`${revealClass(from, "reveal-stagger")} ${className}`.trim()}
      ref={elementRef}
      style={{ "--reveal-duration": `${duration}ms`, ...style }}
    >
      {children}
    </Component>
  );
}
