"use client";

import Image from "next/image";
import Link from "next/link";
import { useSiteCopy } from "./SiteCopyProvider";

function mediaUrl(value) {
  if (!value) return "";
  return typeof value === "string" ? value : value.secureUrl || value.url || "";
}

export default function BrandMark({ linked = true, logo, priority = false }) {
  const { branding } = useSiteCopy();
  const resolvedLogo = logo || branding.logo;
  const source = mediaUrl(resolvedLogo) || "/images/triple-h-logo.png";
  const mark = (
    <span className="brand-mark">
      <Image
        alt={resolvedLogo?.alt || branding.name || "Triple H Contracts & Hire"}
        className="brand-mark__image"
        height={1174}
        priority={priority}
        sizes="(max-width: 720px) 92px, 140px"
        src={source}
        width={1339}
      />
    </span>
  );
  return linked ? <Link href="/">{mark}</Link> : mark;
}
