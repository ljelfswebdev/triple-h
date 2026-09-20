"use client";

import { useEffect, useState } from "react";

export function managedField(form, name) {
  return form?.fields?.find((field) => field.name === name) || null;
}

export function managedSubmitLabel(form, fallback) {
  return form?.fields?.find((field) => field.type === "submit")?.buttonText || fallback;
}

export function managedSubmitBusyLabel(form, fallback) {
  return form?.fields?.find((field) => field.type === "submit")?.busyText || fallback;
}

export default function useManagedForm(key) {
  const [form, setForm] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/forms/${key}`, { signal: controller.signal })
      .then((response) => (response.ok ? response.json() : null))
      .then((result) => setForm(result))
      .catch((error) => {
        if (error.name !== "AbortError") setForm(null);
      });
    return () => controller.abort();
  }, [key]);

  return form;
}
