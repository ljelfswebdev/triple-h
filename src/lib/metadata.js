function mediaUrl(media) {
  if (!media) return "";
  return typeof media === "string" ? media : media.secureUrl || media.url || "";
}

function clean(value) {
  return typeof value === "string" ? value.trim() : "";
}

export function createPageMetadata(page, defaults = {}) {
  const seo = page?.seo || {};
  const title = clean(seo.title) || clean(defaults.title) || clean(page?.title) || "Triple H Contracts & Hire";
  const description = clean(seo.description) || clean(defaults.description);
  const openGraphTitle = clean(seo.ogTitle) || title;
  const openGraphDescription = clean(seo.ogDescription) || description;
  const openGraphImage = mediaUrl(seo.ogImage) || mediaUrl(defaults.ogImage);
  const canonical = clean(seo.canonical) || clean(defaults.canonical);
  const keywords = (clean(seo.keywords) || clean(defaults.keywords))
    .split(",")
    .map((keyword) => keyword.trim())
    .filter(Boolean);

  return {
    title: { absolute: title },
    description: description || undefined,
    keywords: keywords.length ? keywords : undefined,
    alternates: canonical ? { canonical } : undefined,
    robots: seo.noIndex ? { index: false, follow: false } : undefined,
    openGraph: {
      type: "website",
      title: openGraphTitle,
      description: openGraphDescription || undefined,
      url: canonical || undefined,
      images: openGraphImage
        ? [
            {
              url: openGraphImage,
              alt: seo.ogImage?.alt || openGraphTitle,
            },
          ]
        : undefined,
    },
    twitter: {
      card: openGraphImage ? "summary_large_image" : "summary",
      title: openGraphTitle,
      description: openGraphDescription || undefined,
      images: openGraphImage ? [openGraphImage] : undefined,
    },
  };
}

export function createContentMetadata(item) {
  if (!item) return {};
  const bases = { news: "/news", project: "/projects", service: "/services", vacancy: "/careers" };
  return createPageMetadata(
    { ...item, seo: item.seo || {} },
    {
      canonical: bases[item.kind] ? `${bases[item.kind]}/${item.slug}` : undefined,
      description: item.excerpt,
      keywords: [item.title, item.category, "Triple H Contracts & Hire"].filter(Boolean).join(", "),
      ogImage: item.image,
    },
  );
}
