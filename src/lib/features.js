export const CUSTOMER_PORTAL_ENABLED = false;

export function isPortalPath(value = "") {
  const path = String(value).trim();
  return path === "/portal" || path.startsWith("/portal/");
}

export function isPublicPageEnabled(slug) {
  if (CUSTOMER_PORTAL_ENABLED) return true;
  return slug !== "portal" && slug !== "portal-reset-password";
}
