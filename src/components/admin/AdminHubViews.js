"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { adminRequest as request, StatusMessage } from "./admin-utils";
import RichTextEditor from "./RichTextEditor";
import Select from "./Select";
import PaginationControls, { usePaginatedItems } from "@/components/ui/PaginationControls";

const contentKindOptions = [
  "project",
  "news",
  "vacancy",
  "accreditation",
  "page",
  "team-member",
  "testimonial",
].map((value) => ({
  label: value
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" "),
  value,
}));

const portalRoleOptions = [
  { label: "Employee", value: "employee" },
  { label: "Customer", value: "customer" },
];

const portalUserPlaceholders = {
  name: "Full name",
  email: "name@company.com",
  category: "e.g. Operations",
  company: "Company name",
  phone: "e.g. 07939 306252",
};

const emptyContent = {
  kind: "project",
  title: "",
  slug: "",
  excerpt: "",
  body: "",
  image: "",
  category: "",
  status: "published",
};

export function ContentManager() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(emptyContent);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const fieldCopy = {
    "team-member": {
      title: "Name",
      titlePlaceholder: "e.g. Amy Hewitt",
      category: "Job title",
      categoryPlaceholder: "e.g. Managing Director",
      excerpt: "Card introduction",
      excerptPlaceholder: "Write a short team introduction",
      body: "Full profile (safe HTML supported)",
      bodyPlaceholder: "Write the full team profile",
    },
    testimonial: {
      title: "Client / contact name",
      titlePlaceholder: "e.g. Alex Turner",
      category: "Company / project",
      categoryPlaceholder: "e.g. Northline Infrastructure",
      excerpt: "Testimonial quote",
      excerptPlaceholder: "Write the client testimonial",
      body: "Additional detail (safe HTML supported)",
      bodyPlaceholder: "Add optional supporting detail",
    },
  }[form.kind] || {
    title: "Title",
    titlePlaceholder: "Enter content title",
    category: "Category / service",
    categoryPlaceholder: "e.g. Arboriculture",
    excerpt: "Summary",
    excerptPlaceholder: "Write a short summary",
    body: "Body (safe HTML supported)",
    bodyPlaceholder: "Write the full content",
  };
  const load = useCallback(() =>
    request("/api/admin-content")
      .then((result) => setItems(result.filter((item) => item.kind !== "service")))
      .catch((value) => setError(value.message)), []);
  useEffect(() => {
    void load();
  }, [load]);
  async function save(event) {
    event.preventDefault();
    setError("");
    const id = form._id;
    try {
      await request(id ? `/api/admin-content/${id}` : "/api/admin-content", {
        method: id ? "PUT" : "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(form),
      });
      setForm(emptyContent);
      setStatus("Content saved.");
      load();
    } catch (value) {
      setError(value.message);
    }
  }
  async function remove(item) {
    if (!window.confirm(`Delete ${item.title}?`)) return;
    await request(`/api/admin-content/${item._id}`, { method: "DELETE" });
    load();
  }
  return (
    <div>
      <div className="admin-title-row">
        <div>
          <h1 className="h3">Other content</h1>
          <p>Projects, news, vacancies, about pages, team profiles, testimonials and trust content.</p>
        </div>
      </div>
      <StatusMessage error={error} status={status} />
      <div className="admin-hub-grid">
        <form className="admin-panel-form" onSubmit={save}>
          <h2>{form._id ? "Edit item" : "Add content"}</h2>
          <div className="field">
            <label htmlFor="content-kind">Type</label>
            <Select
              inputId="content-kind"
              isSearchable={false}
              onChange={(option) =>
                setForm((value) => ({ ...value, kind: option?.value || "project" }))
              }
              options={contentKindOptions}
              placeholder="Select content type"
              value={contentKindOptions.find((option) => option.value === form.kind)}
            />
          </div>
          <div className="field">
            <label htmlFor="content-title">{fieldCopy.title}</label>
            <input
              id="content-title"
              onChange={(event) => setForm((value) => ({ ...value, title: event.target.value }))}
              placeholder={fieldCopy.titlePlaceholder}
              required
              value={form.title}
            />
          </div>
          <div className="field">
            <label htmlFor="content-slug">Slug</label>
            <input
              id="content-slug"
              onChange={(event) => setForm((value) => ({ ...value, slug: event.target.value }))}
              placeholder="e.g. tree-surgery"
              required
              value={form.slug}
            />
          </div>
          <div className="field">
            <label htmlFor="content-category">{fieldCopy.category}</label>
            <input
              id="content-category"
              onChange={(event) => setForm((value) => ({ ...value, category: event.target.value }))}
              placeholder={fieldCopy.categoryPlaceholder}
              value={form.category || ""}
            />
          </div>
          <div className="field">
            <label htmlFor="content-excerpt">{fieldCopy.excerpt}</label>
            <textarea
              id="content-excerpt"
              onChange={(event) => setForm((value) => ({ ...value, excerpt: event.target.value }))}
              placeholder={fieldCopy.excerptPlaceholder}
              rows="3"
              value={form.excerpt || ""}
            />
          </div>
          <div className="field admin-field">
            <label>{fieldCopy.body}</label>
            <RichTextEditor
              label={fieldCopy.body}
              onChange={(body) => setForm((value) => ({ ...value, body }))}
              value={form.body || ""}
            />
          </div>
          <div className="field">
            <label htmlFor="content-image">Cloudinary image URL</label>
            <input
              id="content-image"
              onChange={(event) => setForm((value) => ({ ...value, image: event.target.value }))}
              placeholder="https://res.cloudinary.com/..."
              type="url"
              value={form.image || ""}
            />
          </div>
          <div className="admin-actions">
            <button className="btn btn-primary" type="submit">
              Save content
            </button>
            {form._id ? (
              <button
                className="btn btn-black-outline"
                onClick={() => setForm(emptyContent)}
                type="button"
              >
                Cancel
              </button>
            ) : null}
          </div>
        </form>
        <div className="admin-list">
          <h2>All content</h2>
          {items.map((item) => (
            <div className="admin-list__item admin-list__item--actions" key={item._id}>
              <button onClick={() => setForm(item)} type="button">
                <strong>{item.title}</strong>
                <span>
                  {item.kind} · {item.status}
                </span>
              </button>
              <button
                className="btn btn-black-outline btn-small"
                onClick={() => remove(item)}
                type="button"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const emptyUser = {
  name: "",
  email: "",
  password: "",
  role: "employee",
  category: "Operations",
  company: "",
  phone: "",
  active: true,
  newsletter: false,
};
export function PortalUsers() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(emptyUser);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const pagination = usePaginatedItems(users);
  const load = useCallback(() =>
    request("/api/portal-users")
      .then(setUsers)
      .catch((value) => setError(value.message)), []);
  useEffect(() => {
    void load();
  }, [load]);
  const categories = useMemo(
    () => [...new Set(users.map((user) => user.category).filter(Boolean))],
    [users],
  );
  async function save(event) {
    event.preventDefault();
    try {
      await request(form.id ? `/api/portal-users/${form.id}` : "/api/portal-users", {
        method: form.id ? "PUT" : "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(form),
      });
      setForm(emptyUser);
      setStatus("Portal user saved.");
      load();
    } catch (value) {
      setError(value.message);
    }
  }
  async function remove(user) {
    if (!window.confirm(`Delete ${user.name}?`)) return;
    await request(`/api/portal-users/${user.id}`, { method: "DELETE" });
    load();
  }
  return (
    <div>
      <h1 className="h3">Portal users</h1>
      <p>
        Create employee and customer accounts. Categories are editable per person and become
        notification audiences.
      </p>
      <StatusMessage error={error} status={status} />
      <div className="admin-category-row">
        <strong>Current categories:</strong>
        {categories.map((category) => (
          <span key={category}>{category}</span>
        ))}
      </div>
      <div className="admin-hub-grid">
        <form className="admin-panel-form" onSubmit={save}>
          <h2>{form.id ? "Edit user" : "Add user"}</h2>
          <div className="field">
            <label htmlFor="portal-user-role">Portal</label>
            <Select
              inputId="portal-user-role"
              isSearchable={false}
              onChange={(option) =>
                setForm((value) => ({ ...value, role: option?.value || "employee" }))
              }
              options={portalRoleOptions}
              placeholder="Select portal type"
              value={portalRoleOptions.find((option) => option.value === form.role)}
            />
          </div>
          {["name", "email", "category", "company", "phone"].map((field) => (
            <div className="field" key={field}>
              <label htmlFor={`portal-user-${field}`}>{field}</label>
              <input
                id={`portal-user-${field}`}
                onChange={(event) =>
                  setForm((value) => ({ ...value, [field]: event.target.value }))
                }
                placeholder={portalUserPlaceholders[field]}
                required={["name", "email", "category"].includes(field)}
                type={field === "email" ? "email" : "text"}
                value={form[field] || ""}
              />
            </div>
          ))}
          <div className="field">
            <label htmlFor="portal-user-password">
              {form.id ? "New password (optional)" : "Temporary password"}
            </label>
            <input
              id="portal-user-password"
              minLength="10"
              onChange={(event) => setForm((value) => ({ ...value, password: event.target.value }))}
              placeholder={
                form.id
                  ? "Enter a new password to replace the current one"
                  : "Minimum 10 characters"
              }
              required={!form.id}
              type="password"
              value={form.password || ""}
            />
          </div>
          <div className="admin-actions">
            <button className="btn btn-primary" type="submit">
              Save user
            </button>
            {form.id ? (
              <button
                className="btn btn-black-outline"
                onClick={() => setForm(emptyUser)}
                type="button"
              >
                Cancel
              </button>
            ) : null}
          </div>
        </form>
        <div className="admin-list">
          <h2>Employees &amp; customers</h2>
          {pagination.pageItems.map((user) => (
            <div className="admin-list__item admin-list__item--actions" key={user.id}>
              <button onClick={() => setForm({ ...user, password: "" })} type="button">
                <strong>{user.name}</strong>
                <span>
                  {user.role} · {user.category}
                </span>
              </button>
              <button
                className="btn btn-black-outline btn-small"
                onClick={() => remove(user)}
                type="button"
              >
                Delete
              </button>
            </div>
          ))}
          <PaginationControls itemLabel="portal users" onChange={pagination.setPage} page={pagination.page} totalItems={users.length} />
        </div>
      </div>
    </div>
  );
}

export function NotificationManager() {
  const [items, setItems] = useState([]);
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({
    title: "",
    message: "",
    audienceRoles: ["employee"],
    audienceCategories: [],
    audienceUserIds: [],
  });
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const pagination = usePaginatedItems(items);
  const load = useCallback(() =>
    Promise.all([request("/api/notifications"), request("/api/portal-users")])
      .then(([notifications, portalUsers]) => {
        setItems(notifications);
        setUsers(portalUsers);
      })
      .catch((value) => setError(value.message)), []);
  useEffect(() => {
    void load();
  }, [load]);
  const categories = [
    ...new Set(
      users
        .filter((user) => form.audienceRoles.includes(user.role))
        .map((user) => user.category)
        .filter(Boolean),
    ),
  ];
  function toggle(list, value) {
    return list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
  }
  async function send(event) {
    event.preventDefault();
    try {
      await request("/api/notifications", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(form),
      });
      setStatus("Notification published.");
      setForm({
        title: "",
        message: "",
        audienceRoles: ["employee"],
        audienceCategories: [],
        audienceUserIds: [],
      });
      load();
    } catch (value) {
      setError(value.message);
    }
  }
  return (
    <div>
      <h1 className="h3">Notifications</h1>
      <p>Send to every employee or customer, selected categories, or named accounts.</p>
      <StatusMessage error={error} status={status} />
      <div className="admin-hub-grid">
        <form className="admin-panel-form" onSubmit={send}>
          <div className="field">
            <label htmlFor="notification-title">Title</label>
            <input
              id="notification-title"
              onChange={(event) => setForm((value) => ({ ...value, title: event.target.value }))}
              placeholder="Enter notification title"
              required
              value={form.title}
            />
          </div>
          <div className="field">
            <label htmlFor="notification-message">Message</label>
            <textarea
              id="notification-message"
              onChange={(event) => setForm((value) => ({ ...value, message: event.target.value }))}
              placeholder="Write the notification message"
              required
              rows="5"
              value={form.message}
            />
          </div>
          <fieldset>
            <legend>Portal audience</legend>
            {["employee", "customer"].map((role) => (
              <label className="check-field" key={role}>
                <input
                  checked={form.audienceRoles.includes(role)}
                  onChange={() =>
                    setForm((value) => ({
                      ...value,
                      audienceRoles: toggle(value.audienceRoles, role),
                    }))
                  }
                  type="checkbox"
                />
                <span>All {role}s</span>
              </label>
            ))}
          </fieldset>
          <fieldset>
            <legend>Limit by category (optional)</legend>
            {categories.map((category) => (
              <label className="check-field" key={category}>
                <input
                  checked={form.audienceCategories.includes(category)}
                  onChange={() =>
                    setForm((value) => ({
                      ...value,
                      audienceCategories: toggle(value.audienceCategories, category),
                    }))
                  }
                  type="checkbox"
                />
                <span>{category}</span>
              </label>
            ))}
          </fieldset>
          <fieldset>
            <legend>Or add named recipients</legend>
            <div className="admin-user-checks">
              {users.map((user) => (
                <label className="check-field" key={user.id}>
                  <input
                    checked={form.audienceUserIds.includes(user.id)}
                    onChange={() =>
                      setForm((value) => ({
                        ...value,
                        audienceUserIds: toggle(value.audienceUserIds, user.id),
                      }))
                    }
                    type="checkbox"
                  />
                  <span>{user.name}</span>
                </label>
              ))}
            </div>
          </fieldset>
          <button className="btn btn-primary" type="submit">
            Publish notification
          </button>
        </form>
        <div className="admin-list">
          <h2>Recent messages</h2>
          {pagination.pageItems.map((item) => (
            <article className="admin-card" key={item._id}>
              <strong>{item.title}</strong>
              <span>{item.message}</span>
              <small>{new Date(item.createdAt).toLocaleString()}</small>
            </article>
          ))}
          <PaginationControls itemLabel="messages" onChange={pagination.setPage} page={pagination.page} totalItems={items.length} />
        </div>
      </div>
    </div>
  );
}

export function NewsletterManager() {
  const [subscribers, setSubscribers] = useState([]);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const pagination = usePaginatedItems(subscribers);
  useEffect(() => {
    request("/api/newsletter/admin")
      .then(setSubscribers)
      .catch((value) => setError(value.message));
  }, []);
  async function send(event) {
    event.preventDefault();
    try {
      const result = await request("/api/newsletter/admin", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ subject, message }),
      });
      setStatus(`Newsletter sent to ${result.sent} subscribers.`);
      setSubject("");
      setMessage("");
    } catch (value) {
      setError(value.message);
    }
  }
  return (
    <div>
      <h1 className="h3">Newsletter</h1>
      <p>{subscribers.filter((item) => item.active).length} active subscribers.</p>
      <StatusMessage error={error} status={status} />
      <div className="admin-hub-grid">
        <form className="admin-panel-form" onSubmit={send}>
          <div className="field">
            <label htmlFor="newsletter-subject">Subject</label>
            <input
              id="newsletter-subject"
              onChange={(event) => setSubject(event.target.value)}
              placeholder="Enter email subject"
              required
              value={subject}
            />
          </div>
          <div className="field">
            <label htmlFor="newsletter-message">Message</label>
            <textarea
              id="newsletter-message"
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Write the newsletter message"
              required
              rows="10"
              value={message}
            />
          </div>
          <button className="btn btn-primary" type="submit">
            Email all active subscribers
          </button>
        </form>
        <div className="admin-list">
          <h2>Subscribers</h2>
          {pagination.pageItems.map((item) => (
            <div className="admin-list__item" key={item._id}>
              <strong>{item.email}</strong>
              <span>
                {item.source} · {item.active ? "active" : "unsubscribed"}
              </span>
            </div>
          ))}
          <PaginationControls itemLabel="subscribers" onChange={pagination.setPage} page={pagination.page} totalItems={subscribers.length} />
        </div>
      </div>
    </div>
  );
}
