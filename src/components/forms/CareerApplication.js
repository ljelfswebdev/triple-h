"use client";

import { useState } from "react";
import { useSiteCopy } from "@/components/global/SiteCopyProvider";
import { trackFormCompleted, trackFormFailed } from "@/lib/analytics-events";
import useManagedForm, { managedField, managedSubmitBusyLabel, managedSubmitLabel } from "./useManagedForm";

export default function CareerApplication({ vacancy }) {
  const { applicationForm: copy } = useSiteCopy();
  const managedForm = useManagedForm("career-application");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function submit(event) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setMessage("");
    const data = new FormData(event.currentTarget);
    data.set("vacancy", vacancy);
    data.set("consent", data.get("consent") === "on" ? "true" : "false");
    const response = await fetch("/api/applications", { method: "POST", body: data });
    const result = await response.json();
    setMessage(
      response.ok
        ? managedForm?.successMessage || copy.successMessage
        : result.error || managedForm?.errorMessage || copy.errorMessage,
    );
    if (response.ok) {
      trackFormCompleted("career-application", { vacancy });
      event.currentTarget.reset();
    } else {
      trackFormFailed("career-application", { stage: "submission", vacancy });
    }
    setBusy(false);
  }

  return (
    <form className="career-form" data-analytics-form="career-application" onSubmit={submit}>
      <input aria-hidden="true" autoComplete="off" className="form-honeypot" name="website" tabIndex={-1} />
      <div className="quick-enquiry__grid">
        <div className="field">
          <label htmlFor="application-name">{managedField(managedForm, "name")?.label || copy.nameLabel}</label>
          <input id="application-name" name="name" placeholder={managedField(managedForm, "name")?.placeholder || copy.namePlaceholder} required />
        </div>
        <div className="field">
          <label htmlFor="application-email">{managedField(managedForm, "email")?.label || copy.emailLabel}</label>
          <input
            id="application-email"
            name="email"
            placeholder={managedField(managedForm, "email")?.placeholder || copy.emailPlaceholder}
            required
            type="email"
          />
        </div>
        <div className="field">
          <label htmlFor="application-phone">{managedField(managedForm, "phone")?.label || copy.phoneLabel}</label>
          <input id="application-phone" name="phone" placeholder={managedField(managedForm, "phone")?.placeholder || copy.phonePlaceholder} type="tel" />
        </div>
        <div className="field">
          <label htmlFor="application-cv">{managedField(managedForm, "cv")?.label || copy.cvLabel}</label>
          <input accept=".pdf,.doc,.docx" id="application-cv" name="cv" required type="file" />
        </div>
        <div className="field quick-enquiry__message">
          <label htmlFor="application-message">{managedField(managedForm, "message")?.label || copy.messageLabel}</label>
          <textarea
            id="application-message"
            name="message"
            placeholder={managedField(managedForm, "message")?.placeholder || copy.messagePlaceholder}
            rows="5"
          />
        </div>
      </div>
      <label className="check-field">
        <input name="consent" required type="checkbox" />
        <span>{managedField(managedForm, "consent")?.label || copy.consentLabel}</span>
      </label>
      {message ? (
        <p aria-live="polite" className="form-status">
          {message}
        </p>
      ) : null}
      <button className="btn btn-primary" disabled={busy} type="submit">
        {busy ? managedSubmitBusyLabel(managedForm, copy.submittingLabel) : managedSubmitLabel(managedForm, copy.submitLabel)}
      </button>
    </form>
  );
}
