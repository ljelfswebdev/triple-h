export const PAGE_BUILDER_TYPES = [
  { value: "content", label: "Text & heading" },
  { value: "ticks", label: "Tick list" },
  { value: "image", label: "Feature image" },
  { value: "gallery", label: "Image slider" },
  { value: "video", label: "Video" },
  { value: "quote", label: "Statement / quote" },
  { value: "stats", label: "Key statistics" },
  { value: "cta", label: "Call to action" },
  { value: "enquiry", label: "Enquiry form" },
];

export function createPageBuilderBlock(type, id = `block-${Date.now()}`) {
  const common = { id, type };
  switch (type) {
    case "ticks":
      return { ...common, eyebrow: "Key points", title: "What matters", items: ["Add your first point"], theme: "dark" };
    case "image":
      return { ...common, image: null, caption: "", layout: "wide" };
    case "gallery":
      return { ...common, eyebrow: "Gallery", title: "See the work", images: [], autoplay: true };
    case "video":
      return { ...common, video: null, poster: null, caption: "", autoplay: false, controls: true, loop: false, muted: false, layout: "wide" };
    case "quote":
      return { ...common, quote: "Add a strong statement or customer quote.", attribution: "", theme: "red" };
    case "stats":
      return { ...common, eyebrow: "At a glance", title: "Measured delivery", items: [{ value: "100%", label: "Add a result" }] };
    case "cta":
      return { ...common, eyebrow: "Next step", title: "Ready to get moving?", text: "", link: { label: "Start a conversation", url: "/contact", newTab: false }, theme: "dark" };
    case "enquiry":
      return { ...common, eyebrow: "Start a conversation", title: "Tell us what the job needs.", text: "We’ll get the right person back to you." };
    default:
      return { ...common, eyebrow: "", title: "Add a heading", body: "<p>Add your content here.</p>", theme: "light", width: "standard" };
  }
}

export function pageBuilderEnabled(item) {
  return Boolean(item?.meta?.pageBuilderEnabled && item?.meta?.blocks?.length);
}

export function normalizePageBuilderBlocks(blocks) {
  const allowedTypes = new Set(PAGE_BUILDER_TYPES.map((type) => type.value));
  if (!Array.isArray(blocks)) return [];
  return blocks
    .slice(0, 100)
    .filter((block) => block && allowedTypes.has(block.type))
    .map((block, index) => ({
      ...block,
      id: String(block.id || `${block.type}-${index}`).slice(0, 120),
      type: block.type,
    }));
}

export function mediaUrl(media) {
  if (!media) return "";
  return typeof media === "string" ? media : media.secureUrl || media.url || "";
}
