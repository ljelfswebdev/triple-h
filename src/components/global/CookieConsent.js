"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  COOKIE_PREFERENCES_EVENT,
  defaultCookiePreferences,
  getCookieConsent,
  saveCookieConsent,
} from "@/lib/cookie-consent";

function preferenceValues(consent = defaultCookiePreferences) {
  return {
    necessary: true,
    functional: Boolean(consent.functional),
    analytics: Boolean(consent.analytics),
    marketing: Boolean(consent.marketing),
  };
}

function CloseIcon() {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height="20"
      viewBox="0 0 20 20"
      width="20"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="m4 4 12 12M16 4 4 16"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2"
      />
    </svg>
  );
}

function PreferenceSwitch({ category, copy, enabled, onChange }) {
  return (
    <div className="flex items-start justify-between gap-5 rounded-[var(--radius-medium)] border border-[var(--color-border)] bg-white p-5">
      <div>
        <h3 className="h6 m-0">{category.title}</h3>
        <p className="body-small mt-2 mb-0 text-black/70">
          {category.description}
        </p>
      </div>

      {category.required ? (
        <div className="shrink-0 text-right">
          <span className="body-small text-[var(--color-primary)]">{copy.alwaysOnLabel}</span>
          <span
            aria-hidden="true"
            className="mt-2 block h-7 w-12 rounded-full border border-[var(--color-primary)] bg-[var(--color-primary)] p-[3px]"
          >
            <span className="block size-5 translate-x-5 rounded-full bg-white shadow-sm" />
          </span>
        </div>
      ) : (
        <button
          aria-checked={enabled}
          aria-label={`${category.title}: ${enabled ? copy.enabledLabel : copy.disabledLabel}`}
          className={`relative h-7 w-12 shrink-0 rounded-full border p-[3px] transition-colors ${enabled ? "border-[var(--color-primary)] bg-[var(--color-primary)]" : "border-[var(--color-border)] bg-[var(--color-grey)]"}`}
          onClick={() => onChange(category.id, !enabled)}
          role="switch"
          type="button"
        >
          <span
            aria-hidden="true"
            className={`block size-5 rounded-full bg-white shadow-sm transition-transform duration-300 ${enabled ? "translate-x-5" : "translate-x-0"}`}
          />
        </button>
      )}
    </div>
  );
}

export default function CookieConsent({ copy }) {
  const [ready, setReady] = useState(false);
  const [bannerOpen, setBannerOpen] = useState(false);
  const [preferencesOpen, setPreferencesOpen] = useState(false);
  const [returnToBanner, setReturnToBanner] = useState(false);
  const [preferences, setPreferences] = useState(() =>
    preferenceValues(),
  );
  const bannerPreferencesRef = useRef(null);
  const dialogRef = useRef(null);
  const previousFocusRef = useRef(null);

  const openPreferences = useCallback((fromBanner = false) => {
    previousFocusRef.current = document.activeElement;
    const storedConsent = getCookieConsent();
    setPreferences(preferenceValues(storedConsent || defaultCookiePreferences));
    setReturnToBanner(fromBanner);
    setBannerOpen(false);
    setPreferencesOpen(true);
  }, []);

  const closePreferences = useCallback(() => {
    setPreferencesOpen(false);
    if (returnToBanner) setBannerOpen(true);

    window.requestAnimationFrame(() => {
      if (returnToBanner) {
        (bannerPreferencesRef.current || previousFocusRef.current)?.focus?.();
      } else {
        previousFocusRef.current?.focus?.();
      }
    });
  }, [returnToBanner]);

  const commitPreferences = useCallback((nextPreferences) => {
    const savedConsent = saveCookieConsent(nextPreferences);
    setPreferences(preferenceValues(savedConsent || nextPreferences));
    setBannerOpen(false);
    setPreferencesOpen(false);
  }, []);

  useEffect(() => {
    const storedConsent = getCookieConsent();

    if (storedConsent) {
      setPreferences(preferenceValues(storedConsent));
    } else {
      setBannerOpen(true);
    }

    setReady(true);

    function handleOpenPreferences() {
      openPreferences(false);
    }

    window.addEventListener(
      COOKIE_PREFERENCES_EVENT,
      handleOpenPreferences,
    );

    return () =>
      window.removeEventListener(
        COOKIE_PREFERENCES_EVENT,
        handleOpenPreferences,
      );
  }, [openPreferences]);

  useEffect(() => {
    if (!preferencesOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const focusFrame = window.requestAnimationFrame(() => {
      dialogRef.current?.querySelector("button")?.focus();
    });

    function handleDialogKeydown(event) {
      if (event.key === "Escape") {
        closePreferences();
        return;
      }

      if (event.key !== "Tab") return;

      const focusable = Array.from(
        dialogRef.current?.querySelectorAll(
          'button:not([disabled]), a[href], input:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ) || [],
      );
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (!first || !last) return;

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleDialogKeydown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.cancelAnimationFrame(focusFrame);
      document.removeEventListener("keydown", handleDialogKeydown);
    };
  }, [closePreferences, preferencesOpen]);

  if (!ready) return null;

  return (
    <>
      {bannerOpen ? (
        <section
          aria-labelledby="cookie-consent-title"
          className="pointer-events-none fixed bottom-[max(16px,env(safe-area-inset-bottom))] left-[max(16px,env(safe-area-inset-left))] z-[var(--z-modal)] w-[min(400px,calc(100vw-32px))]"
          data-cookie-consent="banner"
        >
          <div className="pointer-events-auto flex w-full flex-col items-stretch gap-6 rounded-[var(--radius-large)] border border-white/15 bg-[var(--color-black)] p-6 text-white shadow-[0_24px_70px_#0006] motion-safe:animate-[cookie-consent-rise_520ms_cubic-bezier(0.22,1,0.36,1)_both]">
            <div>
              <h2 className="h5 m-0" id="cookie-consent-title">
                {copy.bannerTitle}
              </h2>
              <p className="body-small mt-3 mb-0 text-white/75">
                {copy.bannerText}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <button
                className="btn btn-primary"
                onClick={() =>
                  commitPreferences({
                    necessary: true,
                    functional: true,
                    analytics: true,
                    marketing: true,
                  })
                }
                type="button"
              >
                {copy.acceptAllLabel}
              </button>
              <button
                className="btn btn-white"
                onClick={() => openPreferences(true)}
                ref={bannerPreferencesRef}
                type="button"
              >
                {copy.preferencesLabel}
              </button>
              <button
                className="btn btn-white-outline"
                onClick={() => commitPreferences(defaultCookiePreferences)}
                type="button"
              >
                {copy.rejectOptionalLabel}
              </button>
            </div>
          </div>
        </section>
      ) : null}

      {preferencesOpen ? (
        <div
          className="fixed inset-0 z-[var(--z-modal)] flex items-center justify-center bg-black/65 p-[var(--container-gutter)] motion-safe:animate-[cookie-consent-fade_260ms_ease_both]"
        >
          <button
            aria-label={copy.closeLabel}
            className="absolute inset-0 border-0 bg-transparent p-0"
            onClick={closePreferences}
            tabIndex={-1}
            type="button"
          />

          <section
            aria-describedby="cookie-preferences-description"
            aria-labelledby="cookie-preferences-title"
            aria-modal="true"
            className="relative z-[1] flex max-h-[min(90dvh,820px)] w-full max-w-[720px] flex-col overflow-hidden rounded-[var(--radius-large)] bg-[var(--color-surface)] shadow-[var(--shadow-large)] motion-safe:animate-[cookie-consent-rise_480ms_cubic-bezier(0.22,1,0.36,1)_both]"
            ref={dialogRef}
            role="dialog"
          >
            <div className="flex items-start justify-between gap-5 border-b border-[var(--color-border)] bg-white p-[clamp(20px,4vw,32px)]">
              <div>
                <span className="body-small text-[var(--color-primary)]">
                  {copy.privacyControlsLabel}
                </span>
                <h2 className="h3 mt-1 mb-0" id="cookie-preferences-title">
                  {copy.dialogTitle}
                </h2>
                <p
                  className="body-small mt-3 mb-0 max-w-[570px] text-black/70"
                  id="cookie-preferences-description"
                >
                  {copy.dialogText}
                </p>
              </div>

              <div className="shrink-0">
                <button
                  aria-label={copy.closeLabel}
                  className="btn btn-black-outline"
                  onClick={closePreferences}
                  type="button"
                >
                  <CloseIcon />
                </button>
              </div>
            </div>

            <div className="grid gap-3 overflow-y-auto p-[clamp(20px,4vw,32px)]">
              {copy.categories.map((category) => (
                <PreferenceSwitch
                  category={category}
                  copy={copy}
                  enabled={preferences[category.id]}
                  key={category.id}
                  onChange={(id, enabled) =>
                    setPreferences((current) => ({
                      ...current,
                      [id]: enabled,
                    }))
                  }
                />
              ))}
            </div>

            <div className="flex flex-wrap justify-end gap-3 border-t border-[var(--color-border)] bg-white p-[clamp(20px,4vw,32px)] max-[540px]:grid max-[540px]:grid-cols-1">
              <button
                className="btn btn-black-outline"
                onClick={() =>
                  commitPreferences({
                    necessary: true,
                    functional: true,
                    analytics: true,
                    marketing: true,
                  })
                }
                type="button"
              >
                {copy.acceptAllLabel}
              </button>
              <button
                className="btn btn-primary"
                onClick={() => commitPreferences(preferences)}
                type="button"
              >
                {copy.saveLabel}
              </button>
            </div>
          </section>
        </div>
      ) : null}

    </>
  );
}
