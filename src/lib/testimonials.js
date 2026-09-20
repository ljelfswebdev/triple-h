const entities = {
  amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ",
  ndash: "–", mdash: "—", lsquo: "‘", rsquo: "’", ldquo: "“", rdquo: "”", hellip: "…",
};

const PREVIEW_CHARACTER_LIMIT = 180;

export function testimonialPlainText(value) {
  return String(value || "")
    .replace(/<br\s*\/?\s*>|<\/(?:p|h[1-6]|li|div|blockquote)>/gi, " ")
    .replace(/<[^>]*>/g, "")
    .replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (match, entity) => {
      if (!entity.startsWith("#")) return entities[entity.toLowerCase()] ?? match;
      const hex = entity[1].toLowerCase() === "x";
      const code = Number.parseInt(entity.slice(hex ? 2 : 1), hex ? 16 : 10);
      return code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : "�";
    })
    .replace(/\s+/g, " ")
    .trim();
}

export function testimonialPreview(value) {
  const text = testimonialPlainText(value);
  const characters = Array.from(text);
  const truncated = characters.length > PREVIEW_CHARACTER_LIMIT;

  return {
    text: truncated ? `${characters.slice(0, PREVIEW_CHARACTER_LIMIT).join("").trimEnd()}…` : text,
    truncated,
  };
}
