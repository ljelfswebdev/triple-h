"use client";

import { track } from "@vercel/analytics/react";
import { hasCookieConsent } from "./cookie-consent.js";

export const ANALYTICS_DEBUG_EVENT = "tripleh:analytics";

const blockedProperty = /email|name|phone|message|password|token|address|query|searchTerm/i;

export function sanitiseAnalyticsProperties(properties = {}) {
  return Object.fromEntries(
    Object.entries(properties)
      .filter(([key, value]) => !blockedProperty.test(key) && ["string", "number", "boolean"].includes(typeof value))
      .map(([key, value]) => [key, typeof value === "string" ? value.slice(0, 120) : value]),
  );
}

export function trackEvent(eventName, properties = {}) {
  if (typeof window === "undefined" || !hasCookieConsent("analytics")) return;
  const data = sanitiseAnalyticsProperties(properties);
  track(eventName, data);
  window.dispatchEvent(new CustomEvent(ANALYTICS_DEBUG_EVENT, { detail: { name: eventName, properties: data } }));
}

export function trackConversion(funnel, step, properties = {}) {
  trackEvent("Conversion Step", { funnel, step, ...properties });
}

export function trackFormCompleted(form, properties = {}) {
  trackEvent("Form Completed", { form, ...properties });
  trackConversion(form, "completed", properties);
}

export function trackFormFailed(form, properties = {}) {
  trackEvent("Form Failed", { form, ...properties });
}
