export function mergeDefaults(defaultValue, currentValue) {
  if (Array.isArray(defaultValue)) {
    return Array.isArray(currentValue) ? currentValue : defaultValue;
  }

  if (defaultValue && typeof defaultValue === "object") {
    return Object.fromEntries(
      Object.keys({ ...defaultValue, ...currentValue }).map((key) => [
        key,
        mergeDefaults(defaultValue[key], currentValue?.[key]),
      ]),
    );
  }

  return currentValue ?? defaultValue;
}

export function stripAdminKeys(value) {
  if (Array.isArray(value)) return value.map(stripAdminKeys);
  if (!value || typeof value !== "object") return value;

  return Object.fromEntries(
    Object.entries(value)
      .filter(([key]) => key !== "_key")
      .map(([key, item]) => [key, stripAdminKeys(item)]),
  );
}

export async function adminRequest(url, options) {
  const response = await fetch(url, options);
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.error || "Request failed");
  return result;
}

export function StatusMessage({ error, status }) {
  if (error) {
    return (
      <p className="error" role="alert">
        {error}
      </p>
    );
  }

  if (status) {
    return (
      <p className="success" role="status">
        {status}
      </p>
    );
  }

  return null;
}

export function submissionValue(value) {
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

export function submissionStatus(status) {
  return String(status || "received").replaceAll("_", " ");
}

export function SubmissionTableField({ field }) {
  if (!field) return <span className="admin-empty-value">—</span>;

  return (
    <span className="admin-submission-preview">
      <span>{field.label}</span>
      <strong>{submissionValue(field.value)}</strong>
    </span>
  );
}
