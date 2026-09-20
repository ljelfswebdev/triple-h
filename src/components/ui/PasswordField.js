"use client";

import { useState } from "react";
import { formPlaceholder } from "@/lib/form-placeholders";

function EyeIcon({ hidden }) {
  if (hidden) {
    return (
      <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
        <path d="m3 3 18 18M10.6 10.7a2 2 0 0 0 2.7 2.7M9.9 4.2A10.8 10.8 0 0 1 12 4c5.5 0 9 5.2 9 5.2a12.5 12.5 0 0 1-2.1 2.6M6.6 6.6A14 14 0 0 0 3 9.2s3.5 5.2 9 5.2c1 0 1.9-.2 2.8-.5" />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
      <path d="M3 12s3.5-5.2 9-5.2S21 12 21 12s-3.5 5.2-9 5.2S3 12 3 12Z" />
      <circle cx="12" cy="12" r="2.5" />
    </svg>
  );
}

export default function PasswordField({ label, onChange, value, ...inputProps }) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="field password-field">
      <label htmlFor={inputProps.id}>{label}</label>
      <div className="password-field__control">
        <input
          {...inputProps}
          onChange={(event) => onChange(event.target.value)}
          placeholder={inputProps.placeholder || formPlaceholder({ label, type: "password" })}
          type={visible ? "text" : "password"}
          value={value}
        />
        <button
          aria-label={`${visible ? "Hide" : "Show"} password`}
          aria-pressed={visible}
          className="password-field__toggle"
          onClick={() => setVisible((current) => !current)}
          type="button"
        >
          <EyeIcon hidden={visible} />
        </button>
      </div>
    </div>
  );
}
