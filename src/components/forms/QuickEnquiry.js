"use client";

import { useState } from "react";
import { useSiteCopy } from "@/components/global/SiteCopyProvider";
import { trackEvent, trackFormCompleted, trackFormFailed } from "@/lib/analytics-events";
import useManagedForm, { managedField, managedSubmitBusyLabel, managedSubmitLabel } from "./useManagedForm";

export default function QuickEnquiry({ service, compact = false }) {
  const { enquiryForm: copy } = useSiteCopy();
  const managedForm = useManagedForm("service-enquiry");
  const enquiryType = service || copy.defaultServiceLabel;
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event) {
    event.preventDefault();
    if (busy) return;
    const formElement = event.currentTarget;
    setBusy(true);
    setError("");
    setStatus("");
    const form = new FormData(formElement);
    const values = Object.fromEntries(form.entries());
    const formGuard = Boolean(form.get("formGuard"));
    delete values.formGuard;
    values.newsletter = form.get("newsletter") === "on";
    try {
      const response = await fetch("/api/submissions", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ formKey: "service-enquiry", values, formGuard }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || managedForm?.errorMessage || copy.errorMessage);
      trackFormCompleted("service-enquiry", { enquiryType });
      if (values.newsletter) {
        const newsletterResponse = await fetch("/api/newsletter", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            email: values.email,
            name: values.name,
            source: `enquiry:${enquiryType}`,
          }),
        });
        if (newsletterResponse.ok) trackEvent("Newsletter Signup", { source: "service-enquiry" });
      }
      formElement.reset();
      setStatus(managedForm?.successMessage || copy.successMessage);
    } catch (submitError) {
      trackFormFailed("service-enquiry", { stage: "submission" });
      setError(submitError.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form
      aria-busy={busy}
      className={`quick-enquiry${compact ? " quick-enquiry--compact" : ""}`}
      data-analytics-form="service-enquiry"
      onSubmit={submit}
    >
      <input name="service" type="hidden" value={enquiryType} />
      <input
        aria-hidden="true"
        autoComplete="off"
        className="form-honeypot"
        name="formGuard"
        tabIndex={-1}
        type="text"
      />
      <div className="quick-enquiry__grid">
        <div className="field">
          <label htmlFor={`name-${enquiryType}`}>{managedField(managedForm, "name")?.label || copy.nameLabel}</label>
          <input
            autoComplete="name"
            id={`name-${enquiryType}`}
            name="name"
            placeholder={managedField(managedForm, "name")?.placeholder || copy.namePlaceholder}
            required
          />
        </div>
        <div className="field">
          <label htmlFor={`email-${enquiryType}`}>{managedField(managedForm, "email")?.label || copy.emailLabel}</label>
          <input
            autoComplete="email"
            id={`email-${enquiryType}`}
            name="email"
            placeholder={managedField(managedForm, "email")?.placeholder || copy.emailPlaceholder}
            required
            type="email"
          />
        </div>
        <div className="field">
          <label htmlFor={`phone-${enquiryType}`}>{managedField(managedForm, "phone")?.label || copy.phoneLabel}</label>
          <input
            autoComplete="tel"
            id={`phone-${enquiryType}`}
            name="phone"
            placeholder={managedField(managedForm, "phone")?.placeholder || copy.phonePlaceholder}
            type="tel"
          />
        </div>
        <div className="field quick-enquiry__message">
          <label htmlFor={`message-${enquiryType}`}>{managedField(managedForm, "message")?.label || copy.messageLabel}</label>
          <textarea
            id={`message-${enquiryType}`}
            name="message"
            placeholder={managedField(managedForm, "message")?.placeholder || copy.messagePlaceholder}
            required
            rows="4"
          />
        </div>
      </div>
      <label className="check-field">
        <input name="newsletter" type="checkbox" />
        <span>{managedField(managedForm, "newsletter")?.label || copy.newsletterLabel}</span>
      </label>
      {error ? (
        <p className="form-status form-status--error" role="alert">
          {error}
        </p>
      ) : null}
      {status ? (
        <p className="form-status form-status--success" role="status">
          {status}
        </p>
      ) : null}
      <button className="btn btn-primary" disabled={busy} type="submit">
        {busy ? managedSubmitBusyLabel(managedForm, copy.submittingLabel) : managedSubmitLabel(managedForm, copy.submitLabel)}
      </button>
    </form>
  );
}
