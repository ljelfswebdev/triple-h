"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import PasswordField from "@/components/ui/PasswordField";
import { useSiteCopy } from "@/components/global/SiteCopyProvider";
import { trackEvent, trackFormCompleted, trackFormFailed } from "@/lib/analytics-events";

export default function ResetPassword({ managedCopy }) {
  const { portal: fallbackCopy } = useSiteCopy();
  const copy = { ...fallbackCopy, ...managedCopy };
  const token = useSearchParams().get("token") || "";
  const [fields, setFields] = useState({ password: "", confirmPassword: "" });
  const [message, setMessage] = useState("");
  async function submit(event) {
    event.preventDefault();
    const response = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ token, ...fields }),
    });
    const result = await response.json();
    setMessage(
      response.ok ? copy.resetSuccessMessage : result.error,
    );
    if (response.ok) {
      trackEvent("Portal Action", { action: "password-reset-completed" });
      trackFormCompleted("password-reset");
    }
    else trackFormFailed("password-reset", { stage: "submission" });
  }
  return (
    <form className="portal-login" data-analytics-form="password-reset" onSubmit={submit}>
      <p className="eyebrow">{copy.resetEyebrow}</p>
      <h1>{copy.resetTitle}</h1>
      <PasswordField
        id="reset-password"
        label={copy.resetNewLabel}
        onChange={(value) => setFields((state) => ({ ...state, password: value }))}
        placeholder={copy.newPasswordPlaceholder}
        required
        value={fields.password}
      />
      <PasswordField
        id="reset-confirm"
        label={copy.resetConfirmLabel}
        onChange={(value) => setFields((state) => ({ ...state, confirmPassword: value }))}
        placeholder={copy.changedConfirmPlaceholder}
        required
        value={fields.confirmPassword}
      />
      <button className="btn btn-primary" type="submit">
        {copy.resetButtonLabel}
      </button>
      {message ? <p className="form-status">{message}</p> : null}
    </form>
  );
}
