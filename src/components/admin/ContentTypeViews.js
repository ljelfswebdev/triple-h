"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { closestCenter, DndContext, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import MediaField from "./MediaField";
import RichTextEditor from "./RichTextEditor";
import Select from "./Select";
import Tabs from "./Tabs";
import PageBuilderEditor from "./PageBuilderEditor";
import PaginationControls, { usePaginatedItems } from "@/components/ui/PaginationControls";
import { adminRequest as request, StatusMessage } from "./admin-utils";

const statusOptions = [
  { label: "Published", value: "published" },
  { label: "Draft", value: "draft" },
  { label: "Closed", value: "closed" },
];

const newsSortOptions = [
  { label: "Date: newest first", value: "date-desc" },
  { label: "Date: oldest first", value: "date-asc" },
  { label: "Title: A–Z", value: "title-asc" },
  { label: "Title: Z–A", value: "title-desc" },
];

function detailLink(form, key) {
  return form.meta?.[key] || { label: "", url: "", newTab: false };
}

export const contentTypeDefinitions = {
  services: {
    kind: "service", singular: "service", plural: "Services",
    description: "Manage the services shown on the website and in the main navigation.",
    publicBase: "/services", categoryLabel: "Category / eyebrow",
    categoryPlaceholder: "e.g. Arboriculture", titlePlaceholder: "e.g. Tree Surgery",
    editorNote: "Changes update the public service page and the Services navigation menu.", highlights: true, detailFields: true, orderable: true, pageBuilder: true,
  },
  projects: {
    kind: "project", singular: "project", plural: "Projects",
    description: "Create and manage project case studies shown across the website.",
    publicBase: "/projects", categoryLabel: "Service / category",
    categoryPlaceholder: "e.g. Rope Access", titlePlaceholder: "e.g. Bridge Rope Access Clearance", detailFields: true, projectFields: true, orderable: true, pageBuilder: true,
  },
  news: {
    kind: "news", singular: "news article", plural: "News",
    description: "Publish company news, fleet updates and stories from the team.",
    publicBase: "/news", categoryLabel: "News category",
    categoryPlaceholder: "e.g. Company", titlePlaceholder: "Enter the article headline", date: true, detailFields: true, pageBuilder: true,
  },
  vacancies: {
    kind: "vacancy", singular: "vacancy", plural: "Vacancies",
    description: "Manage the roles listed on the careers page and their application pages.",
    publicBase: "/careers", categoryLabel: "Department",
    categoryPlaceholder: "e.g. Operations", titlePlaceholder: "e.g. General Operative", vacancyFields: true, orderable: true,
  },
  accreditations: {
    kind: "accreditation", singular: "accreditation", plural: "Accreditations",
    description: "Maintain trust marks, certification details and supporting information.",
    publicBase: "/compliance", categoryLabel: "Accreditation type",
    categoryPlaceholder: "e.g. Quality management", titlePlaceholder: "e.g. ISO 9001", archiveOnly: true, orderable: true,
  },
  "about-pages": {
    kind: "page", singular: "about page", plural: "About pages",
    description: "Manage editorial pages such as Our Story and Values.",
    publicBase: "/about", categoryLabel: "Eyebrow",
    categoryPlaceholder: "e.g. About Triple H", titlePlaceholder: "Enter the page title",
  },
  team: {
    kind: "team-member", singular: "team member", plural: "Meet the team",
    description: "Add and edit the people shown on the Meet the Team page.",
    publicBase: "/about/meet-the-team", categoryLabel: "Job title",
    categoryPlaceholder: "e.g. Contracts Manager", titleLabel: "Name",
    titlePlaceholder: "e.g. Amy Hewitt", excerptLabel: "Card introduction", archiveOnly: true, orderable: true,
  },
  testimonials: {
    kind: "testimonial", singular: "testimonial", plural: "Testimonials",
    description: "Manage client quotes and the organisations or projects behind them.",
    publicBase: "/about/testimonials", categoryLabel: "Company / project",
    categoryPlaceholder: "e.g. Northline Infrastructure", titleLabel: "Client / contact name",
    titlePlaceholder: "e.g. Alex Turner", excerptLabel: "Testimonial quote", archiveOnly: true, orderable: true,
  },
};

function slugify(value) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function emptyItem(definition) {
  return {
    kind: definition.kind, title: "", slug: "", category: "", excerpt: "", body: "", image: "",
    location: "", salary: "", hours: "", publishedAt: new Date().toISOString().slice(0, 10),
    status: "published", meta: { highlights: [], duties: [], pageBuilderEnabled: false, blocks: [] },
    seo: { title: "", description: "", keywords: "", ogTitle: "", ogDescription: "", ogImage: null, canonical: "", noIndex: false },
  };
}

function publicUrl(definition, item) {
  if (!definition.publicBase) return "";
  return definition.archiveOnly ? definition.publicBase : `${definition.publicBase}/${item.slug}`;
}

function SortablePostRow({ children, id, position, title }) {
  const { attributes, isDragging, listeners, setNodeRef, transform, transition } = useSortable({ id });

  return (
    <article
      className={`admin-post-row admin-post-row--sortable${isDragging ? " is-dragging" : ""}`}
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
    >
      <button
        aria-label={`Drag ${title} to a new position`}
        className="admin-post-row__drag"
        type="button"
        {...attributes}
        {...listeners}
      >
        <span className="admin-post-row__position">{String(position).padStart(2, "0")}</span>
        <span aria-hidden="true" className="admin-post-row__grip">⋮⋮</span>
      </button>
      {children}
    </article>
  );
}

export function ContentTypeList({ basePath, type }) {
  const definition = contentTypeDefinitions[type];
  const [deleting, setDeleting] = useState("");
  const [error, setError] = useState("");
  const [items, setItems] = useState(null);
  const [orderStatus, setOrderStatus] = useState("");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("date-desc");
  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();
    const matches = query ? (items || []).filter((item) => [
      item.title,
      item.slug,
      item.category,
      item.excerpt,
      item.location,
      item.status,
    ].some((value) => String(value || "").toLowerCase().includes(query))) : [...(items || [])];

    if (!definition.date) return matches;
    return matches.sort((first, second) => {
      if (sort === "title-asc") return first.title.localeCompare(second.title);
      if (sort === "title-desc") return second.title.localeCompare(first.title);
      const firstDate = new Date(first.publishedAt || 0).getTime();
      const secondDate = new Date(second.publishedAt || 0).getTime();
      return sort === "date-asc" ? firstDate - secondDate : secondDate - firstDate;
    });
  }, [definition.date, items, search, sort]);
  const pagination = usePaginatedItems(filteredItems);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const load = useCallback(() => request(`/api/admin-content?kind=${definition.kind}`)
    .then(setItems)
    .catch((loadError) => setError(loadError.message)), [definition.kind]);

  useEffect(() => {
    void load();
  }, [load]);

  async function remove(item) {
    if (!window.confirm(`Delete ${item.title}? This cannot be undone.`)) return;
    setDeleting(item._id);
    setError("");
    try {
      await request(`/api/admin-content/${item._id}`, { method: "DELETE" });
      await load();
    } catch (deleteError) {
      setError(deleteError.message);
    } finally {
      setDeleting("");
    }
  }

  async function reorder({ active, over }) {
    if (!definition.orderable || !over || active.id === over.id) return;
    const previous = items;
    const oldIndex = previous.findIndex((item) => String(item._id) === String(active.id));
    const newIndex = previous.findIndex((item) => String(item._id) === String(over.id));
    if (oldIndex < 0 || newIndex < 0) return;

    const reordered = arrayMove(previous, oldIndex, newIndex).map((item, sortOrder) => ({ ...item, sortOrder }));
    setItems(reordered);
    setError("");
    setOrderStatus("Saving order…");
    try {
      await request("/api/admin-content", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ kind: definition.kind, orderedIds: reordered.map((item) => item._id) }),
      });
      setOrderStatus("Order saved.");
    } catch (reorderError) {
      setItems(previous);
      setOrderStatus("");
      setError(reorderError.message);
    }
  }

  const rows = pagination.pageItems.map((item) => {
    const content = (
      <>
        <div className="admin-post-row__identity"><strong>{item.title}</strong><span>/{item.slug}</span></div>
        <span className={`admin-post-status admin-post-status--${item.status}`}>{item.status}</span>
        <div className="admin-post-row__actions">
          <Link className="btn btn-black-outline btn-small" href={`${basePath}/${type}/${item._id}`}>Edit</Link>
          {publicUrl(definition, item) ? <a className="btn btn-black-outline btn-small" href={publicUrl(definition, item)} rel="noreferrer" target="_blank">View</a> : null}
          <button className="btn btn-black-outline btn-small" disabled={deleting === item._id} onClick={() => remove(item)} type="button">{deleting === item._id ? "Deleting…" : "Delete"}</button>
        </div>
      </>
    );

    const position = (items || []).findIndex((record) => String(record._id) === String(item._id)) + 1;
    return definition.orderable ? <SortablePostRow id={String(item._id)} key={item._id} position={position} title={item.title}>{content}</SortablePostRow> : <article className="admin-post-row" key={item._id}>{content}</article>;
  });

  return (
    <div>
      <div className="admin-title-row">
        <div><h1 className="h3">{definition.plural}</h1><p>{definition.description}</p></div>
        <Link className="btn btn-primary" href={`${basePath}/${type}/new`}>Add {definition.singular}</Link>
      </div>
      <StatusMessage error={error} status={orderStatus} />
      {!items && !error ? <p role="status">Loading {definition.plural.toLowerCase()}…</p> : null}
      {items?.length === 0 ? <p className="admin-empty-value">No {definition.plural.toLowerCase()} created yet.</p> : null}
      {items?.length ? (
        <div className="admin-post-list">
          <div className={`admin-post-search${definition.date ? " admin-post-search--with-sort" : ""}`} role="search">
            <div className="field">
              <label className="visually-hidden" htmlFor={`${type}-search`}>Search {definition.plural.toLowerCase()}</label>
              <input
                autoComplete="off"
                id={`${type}-search`}
                onChange={(event) => {
                  setSearch(event.target.value);
                  pagination.setPage(1);
                }}
                placeholder={`Search ${definition.plural.toLowerCase()} by title, category or status`}
                type="search"
                value={search}
              />
            </div>
            {definition.date ? (
              <div className="field admin-post-search__sort">
                <label className="visually-hidden" htmlFor={`${type}-sort`}>Sort {definition.plural.toLowerCase()}</label>
                <Select
                  aria-label={`Sort ${definition.plural.toLowerCase()}`}
                  inputId={`${type}-sort`}
                  isSearchable={false}
                  onChange={(option) => {
                    setSort(option?.value || "date-desc");
                    pagination.setPage(1);
                  }}
                  options={newsSortOptions}
                  placeholder="Sort news"
                  value={newsSortOptions.find((option) => option.value === sort)}
                />
              </div>
            ) : null}
            <span aria-live="polite" className="admin-post-search__count">
              {filteredItems.length} of {items.length} {definition.plural.toLowerCase()}
            </span>
            {search ? <button className="btn btn-black-outline btn-small" onClick={() => { setSearch(""); pagination.setPage(1); }} type="button">Clear search</button> : null}
          </div>
          {filteredItems.length ? (
            <>
              <div className={`admin-post-list__head${definition.orderable ? " admin-post-list__head--sortable" : ""}`} aria-hidden="true">{definition.orderable ? <span /> : null}<span>{definition.plural}</span><span>Status</span><span>Actions</span></div>
              {definition.orderable ? (
                <DndContext collisionDetection={closestCenter} onDragEnd={reorder} sensors={sensors}>
                  <SortableContext items={pagination.pageItems.map((item) => String(item._id))} strategy={verticalListSortingStrategy}>
                    {rows}
                  </SortableContext>
                </DndContext>
              ) : rows}
              <PaginationControls itemLabel={definition.plural.toLowerCase()} onChange={pagination.setPage} page={pagination.page} totalItems={filteredItems.length} />
            </>
          ) : <p className="admin-empty-value">No {definition.plural.toLowerCase()} match “{search}”.</p>}
        </div>
      ) : null}
    </div>
  );
}

export function ContentTypeEditor({ basePath, itemId, type }) {
  const definition = contentTypeDefinitions[type];
  const creating = itemId === "new";
  const hasDetailsTab = Boolean(definition.date || definition.detailFields || definition.highlights || definition.projectFields || definition.vacancyFields);
  const editorTabs = [
    { id: "content", label: "Content" },
    ...(hasDetailsTab ? [{ id: "details", label: "Details" }] : []),
    ...(definition.pageBuilder ? [{ id: "builder", label: "Page builder" }] : []),
    { id: "publishing", label: "Media & publishing" },
    { id: "seo", label: "SEO & sharing" },
  ];
  const [activeTab, setActiveTab] = useState("content");
  const [error, setError] = useState("");
  const [form, setForm] = useState(creating ? emptyItem(definition) : null);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (creating) return;
    request(`/api/admin-content/${itemId}`)
      .then((item) => {
        if (item.kind !== definition.kind) throw new Error(`That item is not a ${definition.singular}.`);
        setForm({ ...emptyItem(definition), ...item, meta: { ...emptyItem(definition).meta, ...item.meta }, seo: { ...emptyItem(definition).seo, ...item.seo } });
      })
      .catch((loadError) => setError(loadError.message));
  }, [creating, definition, itemId]);

  function update(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function save(event) {
    event.preventDefault();
    setError("");
    setStatus("");
    if (!form.title.trim() || !form.slug.trim()) {
      setActiveTab("content");
      setError("Add a title and URL slug before saving.");
      return;
    }
    setSaving(true);
    try {
      const saved = await request(creating ? "/api/admin-content" : `/api/admin-content/${itemId}`, {
        method: creating ? "POST" : "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...form, kind: definition.kind }),
      });
      setForm((current) => ({ ...current, ...saved }));
      setStatus(`${definition.singular.charAt(0).toUpperCase()}${definition.singular.slice(1)} saved.`);
      if (creating) router.replace(`${basePath}/${type}/${saved._id}`);
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!window.confirm(`Delete ${form.title}? This cannot be undone.`)) return;
    try {
      await request(`/api/admin-content/${itemId}`, { method: "DELETE" });
      router.replace(`${basePath}/${type}`);
    } catch (deleteError) {
      setError(deleteError.message);
    }
  }

  if (!form && !error) return <p role="status">Loading {definition.singular}…</p>;

  return (
    <div>
      <Link className="admin-back" href={`${basePath}/${type}`}>← {definition.plural}</Link>
      <div className="admin-title-row">
        <div><h1 className="h3">{creating ? `Add ${definition.singular}` : `Edit ${form?.title || definition.singular}`}</h1><p>{definition.editorNote || definition.description}</p></div>
      </div>
      <StatusMessage error={error} status={status} />
      {form ? (
        <form className="admin-post-editor" onSubmit={save}>
          <Tabs activeTab={activeTab} onChange={setActiveTab} tabs={editorTabs} />
          <section aria-labelledby={`admin-tab-${activeTab}`} id={`admin-tab-panel-${activeTab}`} role="tabpanel">
            {activeTab === "content" ? (
              <fieldset className="admin-group">
                <legend>{definition.singular.charAt(0).toUpperCase()}{definition.singular.slice(1)} content</legend>
                <div className="admin-post-editor__two-column">
                  <div className="field">
                    <label htmlFor={`${type}-title`}>{definition.titleLabel || "Title"}</label>
                    <input id={`${type}-title`} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value, slug: creating ? slugify(event.target.value) : current.slug }))} placeholder={definition.titlePlaceholder} required value={form.title} />
                  </div>
                  <div className="field"><label htmlFor={`${type}-slug`}>URL slug</label><input id={`${type}-slug`} onChange={(event) => update("slug", slugify(event.target.value))} placeholder="e.g. clear-descriptive-title" required value={form.slug} /></div>
                </div>
                <div className="field"><label htmlFor={`${type}-category`}>{definition.categoryLabel}</label><input id={`${type}-category`} onChange={(event) => update("category", event.target.value)} placeholder={definition.categoryPlaceholder} value={form.category || ""} /></div>
                <div className="field"><label htmlFor={`${type}-summary`}>{definition.excerptLabel || "Summary"}</label><textarea id={`${type}-summary`} onChange={(event) => update("excerpt", event.target.value)} placeholder={definition.kind === "testimonial" ? "Write the client testimonial" : "Write a short summary for cards and search results"} rows="4" value={form.excerpt || ""} /></div>
                <div className="field admin-field"><label>Page content</label><RichTextEditor label={`${definition.singular} content`} onChange={(value) => update("body", value)} value={form.body || ""} /></div>
              </fieldset>
            ) : null}

            {activeTab === "details" && hasDetailsTab ? (
              <fieldset className="admin-group">
                <legend>Additional details</legend>
                {definition.date ? <div className="field"><label htmlFor="news-date">Publication date</label><input id="news-date" onChange={(event) => update("publishedAt", event.target.value)} placeholder="Choose publication date" type="date" value={String(form.publishedAt || "").slice(0, 10)} /></div> : null}
                {definition.vacancyFields ? (
                  <>
                    <p className="admin-field-note">Every field is optional. Leave it empty and that content will not appear on this vacancy.</p>
                    <div className="admin-post-editor__two-column">
                      <div className="field"><label htmlFor="vacancy-location">Location</label><input id="vacancy-location" onChange={(event) => update("location", event.target.value)} placeholder="e.g. Yorkshire / Nationwide" value={form.location || ""} /></div>
                      <div className="field"><label htmlFor="vacancy-hours">Hours</label><input id="vacancy-hours" onChange={(event) => update("hours", event.target.value)} placeholder="e.g. Full time" value={form.hours || ""} /></div>
                      <div className="field"><label htmlFor="vacancy-salary">Salary</label><input id="vacancy-salary" onChange={(event) => update("salary", event.target.value)} placeholder="e.g. Competitive" value={form.salary || ""} /></div>
                      <div className="field"><label htmlFor="vacancy-hero-eyebrow">Hero eyebrow</label><input id="vacancy-hero-eyebrow" onChange={(event) => update("meta", { ...form.meta, heroEyebrow: event.target.value })} placeholder="e.g. Careers" value={form.meta?.heroEyebrow || ""} /></div>
                      <div className="field"><label htmlFor="vacancy-role-eyebrow">Role eyebrow</label><input id="vacancy-role-eyebrow" onChange={(event) => update("meta", { ...form.meta, roleEyebrow: event.target.value })} placeholder="e.g. The role" value={form.meta?.roleEyebrow || ""} /></div>
                      <div className="field"><label htmlFor="vacancy-role-heading">Role heading</label><input id="vacancy-role-heading" onChange={(event) => update("meta", { ...form.meta, roleHeading: event.target.value })} placeholder="Add a role heading" value={form.meta?.roleHeading || ""} /></div>
                      <div className="field"><label htmlFor="vacancy-duties-heading">Duties heading</label><input id="vacancy-duties-heading" onChange={(event) => update("meta", { ...form.meta, dutiesHeading: event.target.value })} placeholder="e.g. What you’ll do" value={form.meta?.dutiesHeading || ""} /></div>
                      <div className="field"><label htmlFor="vacancy-requirements-heading">Requirements heading</label><input id="vacancy-requirements-heading" onChange={(event) => update("meta", { ...form.meta, requirementsHeading: event.target.value })} placeholder="e.g. What you’ll bring" value={form.meta?.requirementsHeading || ""} /></div>
                      <div className="field"><label htmlFor="vacancy-apply-prefix">Application eyebrow</label><input id="vacancy-apply-prefix" onChange={(event) => update("meta", { ...form.meta, applyPrefix: event.target.value })} placeholder="e.g. Apply for" value={form.meta?.applyPrefix || ""} /></div>
                      <div className="field"><label htmlFor="vacancy-apply-heading">Application heading</label><input id="vacancy-apply-heading" onChange={(event) => update("meta", { ...form.meta, applyHeading: event.target.value })} placeholder="Add an application heading" value={form.meta?.applyHeading || ""} /></div>
                    </div>
                  </>
                ) : null}
                {definition.projectFields ? (
                  <div className="admin-post-editor__two-column">
                    <div className="field"><label htmlFor="project-sector">Sector</label><input id="project-sector" onChange={(event) => update("meta", { ...form.meta, sector: event.target.value })} placeholder="e.g. Infrastructure" value={form.meta?.sector || ""} /></div>
                    <div className="field"><label htmlFor="project-location">Location</label><input id="project-location" onChange={(event) => update("location", event.target.value)} placeholder="e.g. West Yorkshire" value={form.location || ""} /></div>
                  </div>
                ) : null}
                {definition.detailFields ? (
                  <div className="admin-post-editor__detail-fields">
                    <h2 className="h5">Detail-page content</h2>
                    <p className="admin-field-note">Every field is optional. Leave it empty and that content will not appear on this {definition.singular}.</p>
                    <div className="admin-post-editor__two-column">
                      <div className="field"><label htmlFor={`${type}-hero-eyebrow`}>Hero eyebrow</label><input id={`${type}-hero-eyebrow`} onChange={(event) => update("meta", { ...form.meta, heroEyebrow: event.target.value })} placeholder="e.g. Our capability" value={form.meta?.heroEyebrow || ""} /></div>
                      <div className="field"><label htmlFor={`${type}-content-eyebrow`}>Content eyebrow</label><input id={`${type}-content-eyebrow`} onChange={(event) => update("meta", { ...form.meta, contentEyebrow: event.target.value })} placeholder="e.g. Built around the job" value={form.meta?.contentEyebrow || ""} /></div>
                      <div className="field"><label htmlFor={`${type}-content-heading`}>Content heading</label><input id={`${type}-content-heading`} onChange={(event) => update("meta", { ...form.meta, contentHeading: event.target.value })} placeholder="e.g. The brief" value={form.meta?.contentHeading || ""} /></div>
                      <div className="field"><label htmlFor={`${type}-safety-heading`}>Closing heading</label><input id={`${type}-safety-heading`} onChange={(event) => update("meta", { ...form.meta, safetyHeading: event.target.value })} placeholder="e.g. Safe by design" value={form.meta?.safetyHeading || ""} /></div>
                    </div>
                    <div className="field admin-field"><label>Closing text</label><RichTextEditor label={`${definition.singular} closing text`} onChange={(safetyText) => update("meta", { ...form.meta, safetyText })} value={form.meta?.safetyText || ""} /></div>
                    <div className="admin-post-editor__two-column">
                      <div className="field"><label htmlFor={`${type}-enquiry-eyebrow`}>Enquiry eyebrow</label><input id={`${type}-enquiry-eyebrow`} onChange={(event) => update("meta", { ...form.meta, enquiryEyebrow: event.target.value })} placeholder="e.g. Need this capability?" value={form.meta?.enquiryEyebrow || ""} /></div>
                      <div className="field"><label htmlFor={`${type}-enquiry-heading`}>Enquiry heading</label><input id={`${type}-enquiry-heading`} onChange={(event) => update("meta", { ...form.meta, enquiryHeading: event.target.value })} placeholder="e.g. Let’s look at the job" value={form.meta?.enquiryHeading || ""} /></div>
                      <div className="field"><label htmlFor={`${type}-next-eyebrow`}>Next-step eyebrow</label><input id={`${type}-next-eyebrow`} onChange={(event) => update("meta", { ...form.meta, nextEyebrow: event.target.value })} placeholder="e.g. Next step" value={form.meta?.nextEyebrow || ""} /></div>
                      <div className="field"><label htmlFor={`${type}-next-heading`}>Next-step heading</label><input id={`${type}-next-heading`} onChange={(event) => update("meta", { ...form.meta, nextHeading: event.target.value })} placeholder="Add the next-step heading" value={form.meta?.nextHeading || ""} /></div>
                    </div>
                    {[{ key: "enquiryLink", label: "Enquiry button" }, { key: "projectsLink", label: "Secondary button" }].map(({ key, label }) => {
                      const linkValue = detailLink(form, key);
                      return <fieldset className="admin-group admin-link-field" key={key}><legend>{label}</legend><div className="admin-post-editor__two-column"><div className="field"><label htmlFor={`${type}-${key}-label`}>Label</label><input id={`${type}-${key}-label`} onChange={(event) => update("meta", { ...form.meta, [key]: { ...linkValue, label: event.target.value } })} placeholder="Button label" value={linkValue.label || ""} /></div><div className="field"><label htmlFor={`${type}-${key}-url`}>Destination</label><input id={`${type}-${key}-url`} onChange={(event) => update("meta", { ...form.meta, [key]: { ...linkValue, url: event.target.value } })} placeholder="/contact or https://…" value={linkValue.url || ""} /></div></div><label className="admin-checkbox"><input checked={Boolean(linkValue.newTab)} onChange={(event) => update("meta", { ...form.meta, [key]: { ...linkValue, newTab: event.target.checked } })} type="checkbox" /><span>Open in a new tab</span></label></fieldset>;
                    })}
                  </div>
                ) : null}
                {definition.highlights ? <div className="field"><label htmlFor="service-highlights">Service highlights</label><textarea id="service-highlights" onChange={(event) => update("meta", { ...form.meta, highlights: event.target.value.split("\n").map((item) => item.trim()).filter(Boolean) })} placeholder="Add one highlight per line" rows="5" value={(form.meta?.highlights || []).join("\n")} /></div> : null}
                {definition.vacancyFields ? <div className="field"><label htmlFor="vacancy-duties">Role duties</label><textarea id="vacancy-duties" onChange={(event) => update("meta", { ...form.meta, duties: event.target.value.split("\n").map((item) => item.trim()).filter(Boolean) })} placeholder="Add one duty per line" rows="6" value={(form.meta?.duties || []).join("\n")} /></div> : null}
                {definition.vacancyFields ? <div className="field admin-field"><label>Requirements text</label><RichTextEditor label="Vacancy requirements text" onChange={(requirementsText) => update("meta", { ...form.meta, requirementsText })} value={form.meta?.requirementsText || ""} /></div> : null}
                {definition.vacancyFields ? <div className="field admin-field"><label>Application introduction</label><RichTextEditor label="Vacancy application introduction" onChange={(applyText) => update("meta", { ...form.meta, applyText })} value={form.meta?.applyText || ""} /></div> : null}
              </fieldset>
            ) : null}

            {activeTab === "builder" && definition.pageBuilder ? (
              <PageBuilderEditor
                blocks={form.meta?.blocks || []}
                enabled={Boolean(form.meta?.pageBuilderEnabled)}
                onChange={(blocks) => update("meta", { ...form.meta, blocks })}
                onEnabledChange={(pageBuilderEnabled) => update("meta", { ...form.meta, pageBuilderEnabled })}
              />
            ) : null}

            {activeTab === "publishing" ? (
              <fieldset className="admin-group">
                <legend>Media & publishing</legend>
                <div className="field"><label htmlFor={`${type}-status`}>Status</label><Select inputId={`${type}-status`} isSearchable={false} onChange={(option) => update("status", option?.value || "draft")} options={statusOptions} placeholder="Select publishing status" value={statusOptions.find((option) => option.value === form.status)} /></div>
                <MediaField
                  accept={definition.mediaType || "image"}
                  label={`${definition.singular.charAt(0).toUpperCase()}${definition.singular.slice(1)} image`}
                  onChange={(media) => setForm((current) => ({
                    ...current,
                    image: media?.secureUrl || media?.url || "",
                    meta: { ...current.meta, imageAlt: media?.alt || "" },
                  }))}
                  value={form.image ? { secureUrl: form.image, alt: form.meta?.imageAlt || form.title, resourceType: definition.mediaType } : null}
                />
              </fieldset>
            ) : null}

            {activeTab === "seo" ? (
              <fieldset className="admin-group">
                <legend>SEO & social sharing</legend>
                <div className="admin-post-editor__two-column">
                  <div className="field"><label htmlFor={`${type}-seo-title`}>SEO title</label><input id={`${type}-seo-title`} onChange={(event) => update("seo", { ...form.seo, title: event.target.value })} placeholder="Search result and browser title" value={form.seo?.title || ""} /></div>
                  <div className="field"><label htmlFor={`${type}-seo-canonical`}>Canonical URL</label><input id={`${type}-seo-canonical`} onChange={(event) => update("seo", { ...form.seo, canonical: event.target.value })} placeholder={`${definition.publicBase}/${form.slug || "page-slug"}`} value={form.seo?.canonical || ""} /></div>
                </div>
                <div className="field"><label htmlFor={`${type}-seo-description`}>Meta description</label><textarea id={`${type}-seo-description`} onChange={(event) => update("seo", { ...form.seo, description: event.target.value })} placeholder="Write the description shown in search results" rows="4" value={form.seo?.description || ""} /></div>
                <div className="field"><label htmlFor={`${type}-seo-keywords`}>Keywords</label><input id={`${type}-seo-keywords`} onChange={(event) => update("seo", { ...form.seo, keywords: event.target.value })} placeholder="Comma-separated keywords" value={form.seo?.keywords || ""} /></div>
                <div className="admin-post-editor__two-column">
                  <div className="field"><label htmlFor={`${type}-og-title`}>Open Graph title</label><input id={`${type}-og-title`} onChange={(event) => update("seo", { ...form.seo, ogTitle: event.target.value })} placeholder="Social sharing title" value={form.seo?.ogTitle || ""} /></div>
                  <div className="field"><label htmlFor={`${type}-og-description`}>Open Graph description</label><textarea id={`${type}-og-description`} onChange={(event) => update("seo", { ...form.seo, ogDescription: event.target.value })} placeholder="Social sharing description" rows="3" value={form.seo?.ogDescription || ""} /></div>
                </div>
                <MediaField accept="image" label="Open Graph image" onChange={(media) => update("seo", { ...form.seo, ogImage: media || null })} value={form.seo?.ogImage || null} />
                <label className="admin-checkbox"><input checked={Boolean(form.seo?.noIndex)} onChange={(event) => update("seo", { ...form.seo, noIndex: event.target.checked })} type="checkbox" /><span>Prevent search engine indexing</span></label>
              </fieldset>
            ) : null}
          </section>
          <div className="admin-actions">
            <button className="btn btn-primary" disabled={saving} type="submit">{saving ? "Saving…" : `Save ${definition.singular}`}</button>
            {!creating ? <button className="btn btn-black-outline" onClick={remove} type="button">Delete {definition.singular}</button> : null}
          </div>
        </form>
      ) : null}
    </div>
  );
}

export function ServicesList({ basePath }) {
  return <ContentTypeList basePath={basePath} type="services" />;
}

export function ServiceEditor({ basePath, serviceId }) {
  return <ContentTypeEditor basePath={basePath} itemId={serviceId} type="services" />;
}
