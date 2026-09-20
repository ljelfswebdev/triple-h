"use client";

import { useEffect, useState } from "react";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { COOKIE_CONSENT_EVENT, getCookieConsent } from "@/lib/cookie-consent";
import { trackConversion, trackEvent } from "@/lib/analytics-events";

function analyticsAllowed() {
  return Boolean(getCookieConsent()?.analytics);
}

function linkLabel(link) {
  return String(link.getAttribute("aria-label") || link.textContent || "Link")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 80);
}

function safeDestination(link) {
  try {
    return new URL(link.href, window.location.origin).pathname;
  } catch {
    return "unknown";
  }
}

export default function AnalyticsManager({ enabled }) {
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    setAllowed(analyticsAllowed());
    const updateConsent = (event) => setAllowed(Boolean(event.detail?.analytics));
    window.addEventListener(COOKIE_CONSENT_EVENT, updateConsent);
    return () => window.removeEventListener(COOKIE_CONSENT_EVENT, updateConsent);
  }, []);

  useEffect(() => {
    if (!enabled || !allowed) return undefined;
    const startedForms = new WeakSet();

    function handleFormFocus(event) {
      const form = event.target.closest?.("form[data-analytics-form]");
      if (!form || startedForms.has(form)) return;
      startedForms.add(form);
      const formName = form.dataset.analyticsForm;
      trackEvent("Form Started", { form: formName, page: window.location.pathname });
      trackConversion(formName, "started", { page: window.location.pathname });
    }

    function handleClick(event) {
      const link = event.target.closest?.("a[href]");
      if (!link || window.location.pathname.startsWith("/admin")) return;
      const href = link.getAttribute("href") || "";
      const page = window.location.pathname;

      if (href.startsWith("tel:")) {
        trackEvent("Contact Click", { method: "phone", page });
        trackConversion("contact", "phone-click", { page });
        return;
      }
      if (href.startsWith("mailto:")) {
        trackEvent("Contact Click", { method: "email", page });
        trackConversion("contact", "email-click", { page });
        return;
      }
      if (link.hasAttribute("download") || /\.(pdf|docx?|xlsx?|csv|zip)$/i.test(href.split(/[?#]/)[0])) {
        trackEvent("Download", { destination: safeDestination(link), page });
        return;
      }
      if (link.classList.contains("content-card")) {
        trackEvent("Card Click", { destination: safeDestination(link), label: linkLabel(link), page });
        return;
      }
      if (link.classList.contains("btn") || link.closest(".button-row, .vacancy-pills, .about-directory__grid")) {
        trackEvent("CTA Click", { destination: safeDestination(link), label: linkLabel(link), page });
      }
    }

    document.addEventListener("focusin", handleFormFocus);
    document.addEventListener("click", handleClick);
    return () => {
      document.removeEventListener("focusin", handleFormFocus);
      document.removeEventListener("click", handleClick);
    };
  }, [allowed, enabled]);

  if (!enabled || !allowed) return null;
  const permit = (event) => analyticsAllowed() ? event : null;

  return (
    <>
      <Analytics beforeSend={permit} />
      <SpeedInsights beforeSend={permit} />
    </>
  );
}
