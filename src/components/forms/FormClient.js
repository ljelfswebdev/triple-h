"use client";

import { useEffect, useState } from "react";
import { defaultFormErrorMessage, defaultFormSuccessMessage } from "@/lib/form-messages";
import DateField from "./DateField";
import Select from "./Select";
import { textInputType } from "@/lib/form-validation";
import { groupFormFields } from "@/lib/form-layout";
import { formPlaceholder } from "@/lib/form-placeholders";
import { trackFormCompleted, trackFormFailed } from "@/lib/analytics-events";

function initialValues(fields) {
  return Object.fromEntries(
    fields
      .filter((field) => field.type !== "submit")
      .map((field) => [field.name, field.type === "consent" ? false : ""]),
  );
}

function ids(...values) {
  return values.filter(Boolean).join(" ") || undefined;
}

function textAutoComplete(field) {
  const identity = `${field.name || ""} ${field.label || ""}`.toLowerCase();
  if (identity.includes("email")) return "email";
  if (identity.includes("phone") || identity.includes("telephone")) {
    return "tel";
  }
  if (identity.includes("company")) return "organization";
  if (identity.includes("name")) return "name";
  return undefined;
}

export default function FormClient({ form, variant }) {
  const fields = Array.isArray(form.fields) ? form.fields : [];
  const rows = groupFormFields(fields);
  const [errors, setErrors] = useState({});
  const [notice, setNotice] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [values, setValues] = useState(() => initialValues(fields));
  const [formGuard, setFormGuard] = useState(false);

  useEffect(() => {
    if (!notice) return undefined;
    const timeout = window.setTimeout(() => setNotice(null), 7000);
    return () => window.clearTimeout(timeout);
  }, [notice]);

  useEffect(() => {
    function prefillForm(event) {
      const detail = event.detail || {};
      if (detail.formKey && detail.formKey !== form.key) return;

      const field = fields.find((item) => item.name === detail.fieldName);
      if (!field || field.type !== "select") return;

      const requested = String(detail.value || detail.label || "")
        .trim()
        .toLowerCase();
      const option = (field.options || []).find((item) =>
        [item.value, item.label].some(
          (value) =>
            String(value || "")
              .trim()
              .toLowerCase() === requested,
        ),
      );
      if (!option) return;

      setValues((current) => ({ ...current, [field.name]: option.value }));
      setErrors((current) => ({ ...current, [field.name]: undefined }));
    }

    window.addEventListener("triple-h:prefill-form", prefillForm);
    return () => window.removeEventListener("triple-h:prefill-form", prefillForm);
  }, [fields, form.key]);

  function updateValue(name, value) {
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
  }

  async function submit(event) {
    event.preventDefault();
    if (submitting) return;

    setErrors({});
    setNotice(null);
    setSubmitting(true);

    try {
      const response = await fetch("/api/submissions", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ formKey: form.key, values, formGuard }),
      });
      const result = await response.json();
      if (!response.ok) {
        setErrors(result.fields || {});
        throw new Error(result.error || "Please check the form and try again.");
      }

      setValues(initialValues(fields));
      setFormGuard(false);
      setNotice({
        type: "success",
        html: form.successMessage || defaultFormSuccessMessage,
      });
      trackFormCompleted(form.key, { variant: variant || "default" });
    } catch (error) {
      trackFormFailed(form.key, { stage: "submission", variant: variant || "default" });
      setNotice({
        type: "error",
        html: form.errorMessage || defaultFormErrorMessage,
        detail: error.message,
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <form
        aria-busy={submitting}
        className="site-form"
        data-analytics-form={form.key}
        noValidate
        onSubmit={submit}
      >
        <input
          aria-hidden="true"
          autoComplete="off"
          className="site-form__honeypot"
          checked={formGuard}
          name="form_guard"
          onChange={(event) => setFormGuard(event.target.checked)}
          tabIndex="-1"
          type="checkbox"
        />
        <div className="site-form__grid">
          {rows.map((row, rowIndex) => (
            <div
              className={`site-form__row site-form__row--${row.columns}`}
              key={row.key || rowIndex}
            >
              {row.fields.map((field, index) => {
                const name = field.name || `field-${rowIndex}-${index}`;
                const error = errors[name];
                const errorId = error ? `${form.key}-${name}-error` : undefined;
                const describedBy = ids(errorId);
                const inputId = `${form.key}-${name}`;

                if (field.type === "submit") {
                  return (
                    <div className="site-form__field site-form__submit" key={field._id || index}>
                      <button
                        className="btn btn-primary"
                        disabled={submitting}
                        type="submit"
                      >
                        {submitting ? field.busyText || "Submitting…" : field.buttonText || "Submit"}
                      </button>
                    </div>
                  );
                }

                if (field.type === "consent") {
                  return (
                    <div className="site-form__field" key={field._id || index}>
                      <div className="site-form__control site-form__control--consent">
                        <label className="form-checkbox" htmlFor={inputId}>
                          <input
                            aria-describedby={describedBy}
                            aria-invalid={Boolean(error)}
                            checked={Boolean(values[name])}
                            id={inputId}
                            name={name}
                            onChange={(event) => updateValue(name, event.target.checked)}
                            required={field.required}
                            type="checkbox"
                          />
                          <span>
                            {field.label}
                            {field.required ? <span className="required-marker"> *</span> : null}
                          </span>
                        </label>
                      </div>
                      <FieldError error={error} id={errorId} />
                    </div>
                  );
                }

                const options = field.options || [];
                const selectedOption =
                  options.find((option) => String(option.value) === String(values[name])) || null;

                return (
                  <div className="site-form__field" key={field._id || index}>
                    <label htmlFor={inputId}>
                      {field.label}
                      {field.required ? <span className="required-marker"> *</span> : null}
                    </label>
                    <div className={`site-form__control site-form__control--${field.type}`}>
                      {field.type === "textarea" ? (
                        <textarea
                          aria-describedby={describedBy}
                          aria-invalid={Boolean(error)}
                          id={inputId}
                          name={name}
                          onChange={(event) => updateValue(name, event.target.value)}
                          placeholder={
                            field.placeholder ||
                            formPlaceholder({ label: field.label, name, type: "textarea" })
                          }
                          required={field.required}
                          value={values[name] || ""}
                        />
                      ) : field.type === "select" ? (
                        <Select
                          aria-describedby={describedBy}
                          aria-required={field.required || undefined}
                          arrow="primary"
                          error={Boolean(error)}
                          inputId={inputId}
                          isClearable={!field.required}
                          isSearchable={options.length > 6}
                          name={name}
                          onChange={(option) => updateValue(name, option?.value || "")}
                          options={options}
                          placeholder={
                            field.placeholder ||
                            formPlaceholder({ label: field.label, name, type: "select" })
                          }
                          value={selectedOption}
                        />
                      ) : field.type === "date" ? (
                        <DateField
                          describedBy={describedBy}
                          error={Boolean(error)}
                          id={inputId}
                          name={name}
                          onChange={(value) => updateValue(name, value)}
                          required={field.required}
                          value={values[name] || ""}
                        />
                      ) : (
                        <input
                          aria-describedby={describedBy}
                          aria-invalid={Boolean(error)}
                          autoComplete={textAutoComplete(field)}
                          id={inputId}
                          name={name}
                          onChange={(event) => updateValue(name, event.target.value)}
                          placeholder={
                            field.placeholder ||
                            formPlaceholder({
                              inputType: textInputType(field),
                              label: field.label,
                              name,
                              type: "text",
                            })
                          }
                          required={field.required}
                          type={textInputType(field)}
                          value={values[name] || ""}
                        />
                      )}
                    </div>
                    <FieldError error={error} id={errorId} />
                  </div>
                );
              })}
            </div>
          ))}
          {!fields.some((field) => field.type === "submit") ? (
            <div className="site-form__field">
              <button
                className="btn btn-primary"
                disabled={submitting}
                type="submit"
              >
                {submitting ? "Submitting…" : "Submit"}
              </button>
            </div>
          ) : null}
        </div>
      </form>
      <FormToast notice={notice} onClose={() => setNotice(null)} />
    </>
  );
}

function FieldError({ error, id }) {
  if (!error) return null;
  return (
    <p className="error field-error" id={id}>
      {error}
    </p>
  );
}

function FormToast({ notice, onClose }) {
  if (!notice) return null;

  return (
    <div
      aria-live={notice.type === "error" ? "assertive" : "polite"}
      className={`form-toast form-toast--${notice.type}`}
      role={notice.type === "error" ? "alert" : "status"}
    >
      <div className="absolute top-3 right-3">
        <button
          aria-label="Close message"
          className="btn btn-white-outline btn-small"
          onClick={onClose}
          type="button"
        >
          ×
        </button>
      </div>
      <div className="body" dangerouslySetInnerHTML={{ __html: notice.html }} />
      {notice.detail && notice.type === "error" ? (
        <p className="body-small">{notice.detail}</p>
      ) : null}
    </div>
  );
}
