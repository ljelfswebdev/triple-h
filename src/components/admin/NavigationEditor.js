"use client";

import { navigationItemFields } from "@/lib/admin-definitions";
import FieldRenderer from "./FieldRenderer";

const fields = [
  {
    name: "items",
    label: "Navigation items",
    type: "repeater",
    fields: navigationItemFields,
  },
];

export default function NavigationEditor({
  activeKey,
  menus,
  navigation,
  onChange,
  onSelect,
}) {
  return (
    <div className="admin-editor">
      <div aria-label="Editor sections" className="admin-tabs" role="tablist">
        {menus.map((menu) => (
          <button
            aria-controls={`navigation-panel-${menu.key}`}
            aria-selected={activeKey === menu.key}
            className="admin-tabs__button"
            id={`navigation-tab-${menu.key}`}
            key={menu.key}
            onClick={() => onSelect(menu.key)}
            role="tab"
            type="button"
          >
            {menu.label}
          </button>
        ))}
      </div>
      <section
        aria-labelledby={`navigation-tab-${activeKey}`}
        id={`navigation-panel-${activeKey}`}
        role="tabpanel"
      >
        <p className="admin-navigation-description">{navigation.description}</p>
        <FieldRenderer fields={fields} onChange={onChange} value={navigation} />
      </section>
    </div>
  );
}
