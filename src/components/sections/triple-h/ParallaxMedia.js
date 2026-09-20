"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

export default function ParallaxMedia({ alt, label, number, src }) {
  const mediaRef = useRef(null);

  useEffect(() => {
    const media = mediaRef.current;
    if (!media || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;

    let frame = 0;
    const update = () => {
      const rect = media.getBoundingClientRect();
      const viewportCenter = window.innerHeight / 2;
      const mediaCenter = rect.top + rect.height / 2;
      const offset = Math.max(-38, Math.min(38, (viewportCenter - mediaCenter) * 0.065));
      media.style.setProperty("--split-parallax-y", `${offset}px`);
      frame = 0;
    };
    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      media.style.removeProperty("--split-parallax-y");
    };
  }, []);

  return (
    <div className="split-feature__media" ref={mediaRef}>
      {src ? <Image alt={alt} fill quality={60} sizes="(max-width: 1080px) 100vw, 55vw" src={src} /> : null}
      <div aria-hidden="true" className="split-feature__media-shade" />
      <div className="split-feature__media-caption">
        <span>{number}</span>
        <strong>{label}</strong>
      </div>
    </div>
  );
}
