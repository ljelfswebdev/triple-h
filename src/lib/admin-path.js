const RESERVED_ADMIN_PATHS = new Set([
  "api",
  "cms-internal",
  "contact",
  "favicon.ico",
  "robots.txt",
  "sitemap.xml",
  "_next",
]);

/**
 * Resolve the public CMS route and reject values that can shadow application
 * routes. This helper is Edge-safe because it is also imported by proxy.js.
 */
export function getAdminPath(value = process.env.ADMIN_PATH) {
  const path = value === undefined || value === "" ? "admin" : String(value);

  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(path)) {
    throw new Error(
      "ADMIN_PATH must be a lowercase URL segment containing only letters, numbers, and hyphens.",
    );
  }

  if (RESERVED_ADMIN_PATHS.has(path)) {
    throw new Error(`ADMIN_PATH cannot use the reserved application route "${path}".`);
  }

  return path;
}
