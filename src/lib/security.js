import sanitize from "sanitize-html";
import { safeUrl } from "./safe-url.js";

export { safeUrl } from "./safe-url.js";

const ALLOWED_TAGS = new Set([
  "a",
  "b",
  "blockquote",
  "br",
  "code",
  "em",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "i",
  "li",
  "ol",
  "p",
  "pre",
  "s",
  "span",
  "strong",
  "table",
  "tbody",
  "td",
  "tfoot",
  "th",
  "thead",
  "tr",
  "u",
  "ul",
]);

const URL_KEYS = /^(?:url|href|canonical|facebook|instagram|linkedin|youtube)$/i;
const IMAGE_URL_KEYS = /^(?:secureUrl|ogImage)$/i;
/**
 * Sanitize CMS-authored rich text with a deliberately small allow-list.
 * Event handlers, inline styles, unknown tags and unsafe URL schemes are removed.
 */
export function sanitizeHtml(value) {
  const html = typeof value === "string" ? value.slice(0, 100_000) : "";
  return sanitize(html, {
    allowedTags: [...ALLOWED_TAGS],
    allowedAttributes: {
      a: ["href", "target", "rel"],
      span: ["class", "style"],
      td: ["colspan", "rowspan"],
      th: ["colspan", "rowspan"],
    },
    allowedClasses: { span: ["parallax-accent"] },
    allowedSchemes: ["http", "https", "mailto", "tel"],
    allowedSchemesAppliedToAttributes: ["href"],
    allowedStyles: {
      span: {
        color: [
          /^#[0-9a-f]{6}$/i,
          /^rgb\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*\)$/i,
        ],
      },
    },
    allowProtocolRelative: false,
    disallowedTagsMode: "discard",
    nonTextTags: [
      "style",
      "script",
      "textarea",
      "option",
      "iframe",
      "object",
      "embed",
      "svg",
      "math",
      "template",
    ],
    transformTags: {
      a: (tagName, attribs) => {
        const href = safeUrl(attribs.href);
        const target = attribs.target === "_blank" ? "_blank" : undefined;
        return {
          tagName,
          attribs: {
            ...(href ? { href } : {}),
            ...(target ? { target, rel: "noopener noreferrer" } : {}),
          },
        };
      },
    },
  });
}

/** Sanitize nested CMS payloads before persistence and when reading legacy data. */
export function sanitizeCmsValue(value, key = "") {
  if (typeof value === "string") {
    if (IMAGE_URL_KEYS.test(key)) return safeUrl(value, { allowContact: false });
    if (URL_KEYS.test(key)) return safeUrl(value);
    return value.includes("<") ? sanitizeHtml(value) : value;
  }
  if (Array.isArray(value)) return value.slice(0, 200).map((item) => sanitizeCmsValue(item, key));
  if (value && typeof value === "object") {
    const prototype = Object.getPrototypeOf(value);
    if (prototype !== Object.prototype && prototype !== null) return value;
    return Object.fromEntries(
      Object.entries(value).map(([childKey, childValue]) => [
        childKey,
        sanitizeCmsValue(childValue, childKey),
      ]),
    );
  }
  return value;
}
