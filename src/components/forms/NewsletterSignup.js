"use client";

import { useState } from "react";
import { useSiteCopy } from "@/components/global/SiteCopyProvider";
import { trackEvent, trackFormCompleted, trackFormFailed } from "@/lib/analytics-events";
import useManagedForm, { managedField, managedSubmitBusyLabel, managedSubmitLabel } from "./useManagedForm";

export default function NewsletterSignup({ source = "footer" }) {
  const { newsletter: copy } = useSiteCopy();
  const managedForm = useManagedForm("newsletter-signup");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event) {
    event.preventDefault();
    const formElement = event.currentTarget;
    setBusy(true);
    setMessage("");
    const form = new FormData(formElement);
    const response = await fetch("/api/newsletter", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: form.get("email"), source, website: form.get("website") }),
    });
    const result = await response.json();
    setMessage(response.ok ? managedForm?.successMessage || copy.successMessage : result.error || managedForm?.errorMessage || copy.errorMessage);
    if (response.ok) {
      trackEvent("Newsletter Signup", { source });
      trackFormCompleted("newsletter", { source });
      formElement.reset();
    } else {
      trackFormFailed("newsletter", { source, stage: "submission" });
    }
    setBusy(false);
  }

  return (
    <form className="newsletter-form" data-analytics-form="newsletter" onSubmit={submit}>
      <input aria-hidden="true" autoComplete="off" className="form-honeypot" name="website" tabIndex={-1} type="text" />
      <label className="visually-hidden" htmlFor={`newsletter-${source}`}>{managedField(managedForm, "email")?.label || copy.emailLabel}</label>
      <input id={`newsletter-${source}`} name="email" placeholder={managedField(managedForm, "email")?.placeholder || copy.placeholder} required type="email" />
      <button className="btn btn-black" disabled={busy} type="submit">{busy ? managedSubmitBusyLabel(managedForm, copy.busyLabel) : managedSubmitLabel(managedForm, copy.buttonLabel)}</button>
      {message ? <p aria-live="polite" className="newsletter-form__status">{message}</p> : null}
    </form>
  );
}
