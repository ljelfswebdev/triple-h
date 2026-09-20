const CONTROL_CHARACTERS = /[\u0000-\u001F\u007F]/g;

function decodeUrlEntities(value) {
  return value
    .replace(/&#(\d+);?/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([\da-f]+);?/gi, (_, code) => String.fromCodePoint(parseInt(code, 16)))
    .replace(
      /&(?:colon|tab|newline);/gi,
      (entity) => ({ "&colon;": ":", "&tab;": "\t", "&newline;": "\n" })[entity.toLowerCase()],
    );
}

export function safeUrl(value, { allowContact = true } = {}) {
  const original = typeof value === "string" ? value.trim() : "";
  if (!original || original.length > 2048) return "";
  const decoded = decodeUrlEntities(original).replace(CONTROL_CHARACTERS, "").trim();
  if (decoded.includes("\\") || decoded.startsWith("//")) return "";
  if (/^(?:\/|#|\?)/.test(decoded)) return original;
  try {
    const parsed = new URL(decoded);
    const protocols = allowContact
      ? new Set(["http:", "https:", "mailto:", "tel:"])
      : new Set(["http:", "https:"]);
    return protocols.has(parsed.protocol.toLowerCase()) ? original : "";
  } catch {
    return "";
  }
}
