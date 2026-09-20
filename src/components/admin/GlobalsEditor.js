"use client";

import { useState } from "react";
import { globalTabs } from "@/lib/admin-definitions";
import FieldRenderer from "./FieldRenderer";
import Tabs from "./Tabs";

function getAtPath(source, path) {
  return path.reduce((current, key) => current?.[key], source) || source;
}

function updateAtPath(source, path, value) {
  if (path.length === 0) return { ...source, ...value };

  const [key, ...remainingPath] = path;
  return {
    ...source,
    [key]: updateAtPath(source?.[key] || {}, remainingPath, value),
  };
}

export default function GlobalsEditor({ globals, onChange }) {
  const [activeTab, setActiveTab] = useState(globalTabs[0].id);
  const tab = globalTabs.find((item) => item.id === activeTab);

  return (
    <div className="admin-editor">
      <Tabs activeTab={activeTab} onChange={setActiveTab} tabs={globalTabs} />
      <section
        aria-labelledby={`admin-tab-${tab.id}`}
        id={`admin-tab-panel-${tab.id}`}
        role="tabpanel"
      >
        <FieldRenderer
          fields={tab.fields}
          onChange={(nextValue) =>
            onChange((current) => updateAtPath(current, tab.path, nextValue))
          }
          value={getAtPath(globals, tab.path)}
        />
      </section>
    </div>
  );
}
