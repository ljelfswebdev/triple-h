const DEVELOPMENT_SITE_URL = "http://localhost:3000";

export function getSiteUrl() {
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();

  if (!configuredUrl) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "NEXT_PUBLIC_SITE_URL is required in production (for example, https://www.example.com).",
      );
    }

    return DEVELOPMENT_SITE_URL;
  }

  let url;
  try {
    url = new URL(configuredUrl);
  } catch {
    throw new Error("NEXT_PUBLIC_SITE_URL must be a valid absolute URL.");
  }

  if (!["http:", "https:"].includes(url.protocol) || url.username || url.password) {
    throw new Error(
      "NEXT_PUBLIC_SITE_URL must use http or https and must not contain credentials.",
    );
  }

  if (process.env.NODE_ENV === "production" && (url.pathname !== "/" || url.search || url.hash)) {
    throw new Error(
      "NEXT_PUBLIC_SITE_URL must be an origin without a path, query, or hash in production.",
    );
  }

  url.hash = "";
  url.search = "";
  url.pathname = url.pathname.replace(/\/+$/, "") || "/";
  return url.toString().replace(/\/$/, "");
}
