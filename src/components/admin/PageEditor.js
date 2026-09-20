"use client";

import { useEffect, useMemo, useState } from "react";
import { pageDefinitions } from "@/lib/page-definitions";
import FieldRenderer from "./FieldRenderer";
import Tabs from "./Tabs";

function getAtPath(source, path) {
  return path.reduce((current, key) => current?.[key], source) || {};
}

function updateAtPath(source, path, value) {
  if (path.length === 0) return value;

  const [key, ...remainingPath] = path;
  return {
    ...source,
    [key]: updateAtPath(source?.[key] || {}, remainingPath, value),
  };
}

export default function PageEditor({ onChange, page }) {
  const definition = pageDefinitions[page.slug];
  const [activeTab, setActiveTab] = useState(definition.tabs[0].id);
  const [forms, setForms] = useState([]);

  useEffect(() => {
    setActiveTab(definition.tabs[0].id);
  }, [definition]);

  useEffect(() => {
    fetch("/api/forms")
      .then((response) => (response.ok ? response.json() : []))
      .then(setForms)
      .catch(() => setForms([]));
  }, []);

  const formOptions = useMemo(
    () => forms.map((form) => ({ label: form.name, value: form.key })),
    [forms],
  );
  const tab = definition.tabs.find((item) => item.id === activeTab);
  const tabValue = getAtPath(page, tab.path);

  return (
    <div className="admin-editor">
      <Tabs
        activeTab={activeTab}
        onChange={setActiveTab}
        tabs={definition.tabs}
      />
      <section
        aria-labelledby={`admin-tab-${tab.id}`}
        id={`admin-tab-panel-${tab.id}`}
        role="tabpanel"
      >
        <FieldRenderer
          context={{ formOptions }}
          fields={tab.fields}
          onChange={(nextValue) =>
            onChange((currentPage) =>
              updateAtPath(currentPage, tab.path, nextValue),
            )
          }
          value={tabValue}
        />
      </section>
    </div>
  );
}
