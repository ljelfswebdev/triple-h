import mongoose from "mongoose";
import { defaultFormErrorMessage, defaultFormSuccessMessage } from "./form-messages.js";
import { sanitizeHtml } from "./security.js";
import { RequestError } from "./request-security.js";

const allowedFieldTypes = new Set(["text", "date", "select", "textarea", "consent", "submit"]);

const inputFieldTypes = new Set(["text", "date", "select", "textarea"]);
const placeholderFieldTypes = new Set(["text", "select", "textarea"]);

const stringValue = (value) => (typeof value === "string" ? value.trim() : "");
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function formLookup(identifier) {
  if (mongoose.Types.ObjectId.isValid(identifier)) {
    return { $or: [{ _id: identifier }, { key: identifier }] };
  }
  return { key: identifier };
}

export function normaliseForm(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new RequestError("A form object is required");
  }
  const key = stringValue(input.key)
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "");

  if (!key) throw new RequestError("A valid form key is required");
  if (!stringValue(input.name)) throw new RequestError("Form name is required");
  const recipientEmail = stringValue(input.recipientEmail).toLowerCase();
  if (recipientEmail && !emailPattern.test(recipientEmail)) {
    throw new RequestError("Enter a valid recipient email address");
  }

  const sourceFields = Array.isArray(input.fields) ? input.fields : [];
  if (sourceFields.length > 100) throw new RequestError("Forms can contain at most 100 fields");

  const result = {
    name: stringValue(input.name).slice(0, 200),
    key,
    recipientEmail,
    successMessage:
      sanitizeHtml(stringValue(input.successMessage)).slice(0, 2_000) || defaultFormSuccessMessage,
    errorMessage:
      sanitizeHtml(stringValue(input.errorMessage)).slice(0, 2_000) || defaultFormErrorMessage,
    fields: sourceFields
      .filter((field) => allowedFieldTypes.has(field.type))
      .map((field, index) => {
        const isSubmit = field.type === "submit";

        const layoutRow = stringValue(field.layoutRow);
        const layoutColumns = [2, 3].includes(Number(field.layoutColumns))
          ? Number(field.layoutColumns)
          : 1;

        if (isSubmit) {
          return {
            type: "submit",
            buttonText: stringValue(field.buttonText) || stringValue(field.label) || "Submit",
            busyText: stringValue(field.busyText) || "Submitting…",
            ...(layoutRow ? { layoutRow, layoutColumns } : {}),
          };
        }

        const supportsInputLayout = inputFieldTypes.has(field.type);
        const label = stringValue(field.label);
        const fallbackName = (label || `${field.type}-${index + 1}`)
          .toLowerCase()
          .replace(/[^a-z0-9_-]+/g, "_")
          .replace(/^_+|_+$/g, "");
        const name =
          stringValue(field.name)
            .toLowerCase()
            .replace(/[^a-z0-9_-]+/g, "_") || fallbackName;
        const normalisedField = {
          type: field.type,
          label: label.slice(0, 200),
          name,
          required: Boolean(field.required),
          ...(layoutRow ? { layoutRow, layoutColumns } : {}),
        };

        if (supportsInputLayout) {
          normalisedField.width = field.width === "half" ? "half" : "full";
        }

        if (field.type === "select") {
          normalisedField.options = (Array.isArray(field.options) ? field.options : [])
            .slice(0, 100)
            .map((option) =>
              typeof option === "string"
                ? { label: option, value: option }
                : {
                    label: stringValue(option.label),
                    value: stringValue(option.value) || stringValue(option.label),
                  },
            );
          const optionValues = new Set();
          for (const option of normalisedField.options) {
            const identity = option.value.toLocaleLowerCase();
            if (!identity)
              throw new RequestError(`Select field "${label || name}" has an empty option value`);
            if (optionValues.has(identity))
              throw new RequestError(`Select field "${label || name}" has duplicate option values`);
            optionValues.add(identity);
          }
          const placeholder = stringValue(field.placeholder).slice(0, 200);
          const duplicatesOption = normalisedField.options.some((option) =>
            [option.label, option.value].some(
              (value) => value && value.toLocaleLowerCase() === placeholder.toLocaleLowerCase(),
            ),
          );
          normalisedField.placeholder =
            !placeholder || duplicatesOption ? "Please Select" : placeholder;
        } else if (placeholderFieldTypes.has(field.type)) {
          normalisedField.placeholder = stringValue(field.placeholder).slice(0, 200);
        }

        return normalisedField;
      }),
  };

  const names = new Set();
  for (const field of result.fields) {
    if (field.type === "submit") continue;
    if (!field.name) throw new RequestError("Every form field requires a valid name");
    if (names.has(field.name)) throw new RequestError(`Duplicate form field name: ${field.name}`);
    names.add(field.name);
  }
  return result;
}

export function publicForm(form) {
  const source = form.toObject ? form.toObject() : { ...form };
  const result = { ...source, ...normaliseForm(source) };
  delete result.recipientEmail;
  return result;
}
