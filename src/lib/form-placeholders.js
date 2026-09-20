function cleanLabel(label) {
  return String(label || "")
    .replace(/\s*\([^)]*\)\s*/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

export function formPlaceholder({ inputType, label, name, type } = {}) {
  const identity = `${name || ""} ${label || ""}`.toLowerCase();
  const clean = cleanLabel(label) || "value";
  const resolvedType = inputType || type;

  if (resolvedType === "select") return `Select ${clean}`;
  if (resolvedType === "date") return "DD/MM/YYYY";
  if (resolvedType === "password") return "Enter your password";
  if (resolvedType === "url" || identity.includes("url")) return "https://example.com";
  if (resolvedType === "email" || identity.includes("email")) return "name@company.com";
  if (resolvedType === "tel" || identity.includes("phone") || identity.includes("telephone")) {
    return "e.g. 07939 306252";
  }
  if (identity.includes("slug")) return "e.g. tree-surgery";
  if (identity.includes("company")) return "Company name";
  if (identity.includes("category")) return "e.g. Operations";
  if (identity.trim() === "name name" || clean === "name" || clean === "your name") {
    return "Full name";
  }
  if (identity.includes("message")) return "Write your message";
  if (identity.includes("subject")) return "Enter email subject";
  if (resolvedType === "textarea") return `Enter ${clean}`;
  return `Enter ${clean}`;
}
