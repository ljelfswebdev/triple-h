export const COOKIE_CONSENT_EVENT = "triple-h:cookie-consent";
export const COOKIE_PREFERENCES_EVENT = "triple-h:cookie-preferences";
export const COOKIE_CONSENT_NAME = "triple_h_cookie_consent";
export const COOKIE_CONSENT_VERSION = 1;

export const defaultCookiePreferences = Object.freeze({
  necessary: true,
  functional: false,
  analytics: false,
  marketing: false,
});

function normaliseConsent(value = {}) {
  return {
    version: COOKIE_CONSENT_VERSION,
    necessary: true,
    functional: Boolean(value.functional),
    analytics: Boolean(value.analytics),
    marketing: Boolean(value.marketing),
    decidedAt:
      typeof value.decidedAt === "string"
        ? value.decidedAt
        : new Date().toISOString(),
  };
}

export function getCookieConsent() {
  if (typeof document === "undefined") return null;

  const prefix = `${COOKIE_CONSENT_NAME}=`;
  const storedCookie = document.cookie
    .split(";")
    .map((cookie) => cookie.trim())
    .find((cookie) => cookie.startsWith(prefix));

  if (!storedCookie) return null;

  try {
    const stored = JSON.parse(
      decodeURIComponent(storedCookie.slice(prefix.length)),
    );

    if (stored.version !== COOKIE_CONSENT_VERSION) return null;
    return normaliseConsent(stored);
  } catch {
    return null;
  }
}

export function saveCookieConsent(preferences) {
  if (typeof document === "undefined") return null;

  const consent = normaliseConsent(preferences);
  const secure = window.location.protocol === "https:" ? "; Secure" : "";

  document.cookie = `${COOKIE_CONSENT_NAME}=${encodeURIComponent(
    JSON.stringify(consent),
  )}; Max-Age=31536000; Path=/; SameSite=Lax${secure}`;

  window.dispatchEvent(
    new CustomEvent(COOKIE_CONSENT_EVENT, { detail: consent }),
  );

  return consent;
}

export function hasCookieConsent(category) {
  const consent = getCookieConsent();
  return category === "necessary" || Boolean(consent?.[category]);
}

export function openCookiePreferences() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(COOKIE_PREFERENCES_EVENT));
}
