export function textInputType(field) {
  const identity = `${field.name || ""} ${field.label || ""}`.toLowerCase();
  if (identity.includes("email")) return "email";
  if (/phone|telephone|contact.number/.test(identity)) return "tel";
  return "text";
}

export function validDate(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value || ""));
  if (!match) return false;
  const [, year, month, day] = match.map(Number);
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
}

export function validateFormValues(fields, values) {
  if (!values || typeof values !== "object" || Array.isArray(values)) {
    return { cleanValues: {}, fieldErrors: { _form: "Invalid form values." } };
  }
  if (fields.length > 100 || Object.keys(values).length > 100) {
    return { cleanValues: {}, fieldErrors: { _form: "Too many form fields." } };
  }
  const cleanValues = {};
  const fieldErrors = {};
  for (const field of fields) {
    if (field.type === "submit" || !field.name) continue;
    const raw = values?.[field.name];
    const value = typeof raw === "string" ? raw.trim().slice(0, 10000) : "";
    const empty = field.type === "consent" ? raw !== true : !value;
    if (field.required && empty) fieldErrors[field.name] = "This field is required.";
    else if (
      field.type === "select" &&
      value &&
      !field.options?.some((option) => option.value === value)
    )
      fieldErrors[field.name] = "Choose a valid option.";
    else if (field.type === "date" && value && !validDate(value))
      fieldErrors[field.name] = "Choose a valid date.";
    else if (
      field.type === "text" &&
      value &&
      textInputType(field) === "email" &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
    )
      fieldErrors[field.name] = "Enter a valid email address.";
    cleanValues[field.name] = field.type === "consent" ? raw === true : value;
  }
  return { cleanValues, fieldErrors };
}
