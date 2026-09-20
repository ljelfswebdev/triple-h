"use client";

export default function Tabs({ activeTab, onChange, tabs }) {
  return (
    <div aria-label="Editor sections" className="admin-tabs" role="tablist">
      {tabs.map((tab) => (
        <button
          aria-controls={`admin-tab-panel-${tab.id}`}
          aria-selected={activeTab === tab.id}
          className="admin-tabs__button"
          id={`admin-tab-${tab.id}`}
          key={tab.id}
          onClick={() => onChange(tab.id)}
          role="tab"
          type="button"
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
