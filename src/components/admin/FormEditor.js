"use client";

import { useState } from "react";
import { formFieldDefinition } from "@/lib/admin-definitions";
import FieldRenderer from "./FieldRenderer";
import FormFieldsEditor from "./FormFieldsEditor";
import Tabs from "./Tabs";

const tabs = [
  { id: "settings", label: "Settings" },
  { id: "fields", label: "Fields" },
];

const settingsFields = [
  { name: "name", label: "Form name", type: "text" },
  { name: "key", label: "Form key", type: "text" },
  {
    name: "recipientEmail",
    label: "Recipient email",
    type: "text",
    inputType: "email",
  },
  {
    name: "successMessage",
    label: "Submission success message",
    type: "richtext",
  },
  {
    name: "errorMessage",
    label: "Submission error message",
    type: "richtext",
  },
];

export default function FormEditor({ form, onChange }) {
  const [activeTab, setActiveTab] = useState(tabs[0].id);

  return (
    <div className="admin-editor">
      <Tabs activeTab={activeTab} onChange={setActiveTab} tabs={tabs} />
      <section
        aria-labelledby={`admin-tab-${activeTab}`}
        id={`admin-tab-panel-${activeTab}`}
        role="tabpanel"
      >
        {activeTab === "settings" ? (
          <FieldRenderer fields={settingsFields} onChange={onChange} value={form} />
        ) : (
          <FormFieldsEditor
            definition={formFieldDefinition}
            fields={form.fields || []}
            onChange={(fields) => onChange({ ...form, fields })}
          />
        )}
      </section>
    </div>
  );
}
