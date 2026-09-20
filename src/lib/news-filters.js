function plainText(value) {
  return String(value || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function newsDate(item) {
  const value = item?.date || item?.publishedAt;
  const date = value ? new Date(value) : null;
  return date && !Number.isNaN(date.getTime()) ? date : null;
}

export function newsMonthKey(item) {
  const date = newsDate(item);
  return date
    ? `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`
    : "";
}

export function newsMonthLabel(key) {
  const [year, month] = String(key).split("-").map(Number);
  if (!year || !month) return "Unknown date";
  return new Intl.DateTimeFormat("en-GB", {
    month: "long",
    timeZone: "UTC",
    year: "numeric",
  }).format(new Date(Date.UTC(year, month - 1, 1)));
}

export function filterNewsItems(items, { category = "", date = "", search = "", sort = "date-desc" } = {}) {
  const query = search.trim().toLowerCase();
  const selectedCategory = category.trim().toLowerCase();

  const filtered = [...items]
    .filter((item) => {
      if (selectedCategory && String(item.category || "").toLowerCase() !== selectedCategory) {
        return false;
      }
      if (date && newsMonthKey(item) !== date) return false;
      if (!query) return true;
      return [item.title, item.excerpt, item.body, item.category]
        .map(plainText)
        .join(" ")
        .toLowerCase()
        .includes(query);
    });

  return filtered.sort((left, right) => {
    if (sort === "title-asc") return String(left.title || "").localeCompare(String(right.title || ""));
    if (sort === "title-desc") return String(right.title || "").localeCompare(String(left.title || ""));
    const leftDate = newsDate(left)?.getTime() || 0;
    const rightDate = newsDate(right)?.getTime() || 0;
    return sort === "date-asc" ? leftDate - rightDate : rightDate - leftDate;
  });
}
