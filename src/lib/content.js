import { safeUrl } from "./safe-url.js";

export function headingMarkup(value = "") {
  return String(value || "")
    .replace(/[\u2028\u2029]/g, "<br />")
    .replace(/<(p|h[1-6])(?:\s[^>]*)?>/gi, "")
    .replace(/<\/(p|h[1-6])>/gi, "<br />")
    .replace(/(?:\s*<br\s*\/?>(?:\s|&nbsp;)*)+$/gi, "")
    .trim();
}

export function hasRichText(value) {
  return String(value || "")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/gi, " ")
    .trim();
}

export function mediaUrl(media) {
  if (!media) return "";
  return safeUrl(typeof media === "string" ? media : media.secureUrl || media.url || "", {
    allowContact: false,
  });
}
