"use client";

import { createFieldDefaults, pageDefinitions } from "@/lib/page-definitions";
import { formPlaceholder } from "@/lib/form-placeholders";
import MediaField from "./MediaField";
import RichTextEditor from "./RichTextEditor";
import Select from "./Select";
import SortableRepeater from "./SortableRepeater";

const pageOptions = Object.entries(pageDefinitions).map(([value, definition]) => ({
  label: definition.title,
  value,
}));

function SelectField({ controlId, field, onChange, options, value }) {
  const selectedOption = options.find((option) => option.value === value) || null;

  return (
    <div className="field admin-field">
      <label htmlFor={controlId}>{field.label}</label>
      <Select
        arrow="primary"
        inputId={controlId}
        onChange={(option) => onChange(option?.value || "")}
        options={options}
        placeholder={
          field.placeholder ||
          formPlaceholder({ label: field.label, name: field.name, type: "select" })
        }
        value={selectedOption}
      />
    </div>
  );
}

function Field({ context, field, idPrefix, onChange, parentValue, value }) {
  const controlId = `${idPrefix}-${field.name}`;
  if (field.showWhen) {
    const currentValue = parentValue?.[field.showWhen.field];
    const matches = Array.isArray(field.showWhen.values)
      ? field.showWhen.values.includes(currentValue)
      : currentValue === field.showWhen.value;

    if (!matches) return null;
  }

  switch (field.type) {
    case "richtext":
      return (
        <div className="field admin-field">
          <label>{field.label}</label>
          <RichTextEditor label={field.label} onChange={onChange} value={value || ""} />
        </div>
      );

    case "text":
      return (
        <div className="field admin-field">
          <label htmlFor={controlId}>{field.label}</label>
          {field.multiline ? (
            <textarea
              id={controlId}
              onChange={(event) => onChange(event.target.value)}
              placeholder={
                field.placeholder ||
                formPlaceholder({ label: field.label, name: field.name, type: "textarea" })
              }
              rows={4}
              value={value || ""}
            />
          ) : (
            <input
              id={controlId}
              onChange={(event) => onChange(event.target.value)}
              placeholder={
                field.placeholder ||
                formPlaceholder({
                  inputType: field.inputType,
                  label: field.label,
                  name: field.name,
                  type: "text",
                })
              }
              type={field.inputType || "text"}
              value={value || ""}
            />
          )}
        </div>
      );

    case "boolean":
      return (
        <label className="admin-checkbox">
          <input
            checked={Boolean(value)}
            onChange={(event) => onChange(event.target.checked)}
            type="checkbox"
          />
          <span>{field.label}</span>
        </label>
      );

    case "radio":
      return (
        <fieldset className="admin-choice-group">
          <legend>{field.label}</legend>
          <div className="admin-choice-group__options">
            {field.options.map((option) => (
              <label className="admin-radio" key={option.value}>
                <input
                  checked={value === option.value}
                  name={controlId}
                  onChange={() => onChange(option.value)}
                  type="radio"
                  value={option.value}
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
        </fieldset>
      );

    case "select":
      return (
        <SelectField
          controlId={controlId}
          field={field}
          onChange={onChange}
          options={field.options || []}
          value={value}
        />
      );

    case "pageSelect":
      return (
        <SelectField
          controlId={controlId}
          field={field}
          onChange={onChange}
          options={pageOptions}
          value={value}
        />
      );

    case "formSelect":
      return (
        <SelectField
          controlId={controlId}
          field={field}
          onChange={onChange}
          options={context.formOptions || []}
          value={value}
        />
      );

    case "media":
      return (
        <MediaField
          accept={field.accept}
          label={field.label}
          onChange={onChange}
          value={value || null}
        />
      );

    case "link": {
      const link = value || { label: "", url: "", newTab: false };

      return (
        <fieldset className="admin-group admin-link-field">
          <legend>{field.label}</legend>
          <div className="field admin-field">
            <label htmlFor={`${controlId}-label`}>Label</label>
            <input
              id={`${controlId}-label`}
              onChange={(event) => onChange({ ...link, label: event.target.value })}
              placeholder="Link label"
              type="text"
              value={link.label || ""}
            />
          </div>
          <div className="field admin-field">
            <label htmlFor={`${controlId}-url`}>URL</label>
            <input
              id={`${controlId}-url`}
              onChange={(event) => onChange({ ...link, url: event.target.value })}
              placeholder="https://example.com"
              type="url"
              value={link.url || ""}
            />
          </div>
          <label className="admin-checkbox">
            <input
              checked={Boolean(link.newTab)}
              onChange={(event) => onChange({ ...link, newTab: event.target.checked })}
              type="checkbox"
            />
            <span>Open in a new tab</span>
          </label>
        </fieldset>
      );
    }

    case "repeater":
      return (
        <SortableRepeater
          createItem={() => createFieldDefaults(field.fields)}
          items={value || []}
          label={field.label}
          onChange={onChange}
          renderItem={(item, index, updateItem) => (
            <FieldRenderer
              context={context}
              fields={field.fields}
              idPrefix={`${controlId}-${index}`}
              onChange={updateItem}
              value={item}
            />
          )}
        />
      );

    default:
      return null;
  }
}

export default function FieldRenderer({
  context = {},
  fields,
  idPrefix = "field",
  onChange,
  value = {},
}) {
  function updateField(name, nextValue) {
    onChange({ ...value, [name]: nextValue });
  }

  return (
    <div className="admin-fields">
      {fields.map((field) => (
        <Field
          context={context}
          field={field}
          idPrefix={idPrefix}
          key={field.name}
          onChange={(nextValue) => updateField(field.name, nextValue)}
          parentValue={value}
          value={value?.[field.name]}
        />
      ))}
    </div>
  );
}
