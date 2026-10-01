"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { usePathname, useRouter } from "next/navigation";
import {
  defaultForm,
  defaultGlobals,
  defaultNavigations,
} from "@/lib/admin-definitions";
import { createDefaultPage, pageDefinitions } from "@/lib/page-definitions";
import { CUSTOMER_PORTAL_ENABLED, isPublicPageEnabled } from "@/lib/features";
import { AdminShell, Dashboard, Login, Pages } from "./AdminChrome";
import { AdminUsers, AdminUserView } from "./AdminUserViews";
import PaginationControls from "@/components/ui/PaginationControls";
import {
  NewsletterManager,
  NotificationManager,
  PortalUsers,
} from "./AdminHubViews";
import {
  ContentTypeEditor,
  ContentTypeList,
  contentTypeDefinitions,
} from "./ContentTypeViews";
import {
  adminRequest as request,
  mergeDefaults,
  StatusMessage,
  stripAdminKeys,
  submissionStatus,
  SubmissionTableField,
  submissionValue,
} from "./admin-utils";

const editorLoading = () => <p role="status">Loading editor…</p>;
const FormEditor = dynamic(() => import("./FormEditor"), {
  loading: editorLoading,
});
const GlobalsEditor = dynamic(() => import("./GlobalsEditor"), {
  loading: editorLoading,
});
const NavigationEditor = dynamic(() => import("./NavigationEditor"), {
  loading: editorLoading,
});
const PageEditor = dynamic(() => import("./PageEditor"), {
  loading: editorLoading,
});

function PageView({ basePath, slug }) {
  const [error, setError] = useState("");
  const [page, setPage] = useState(null);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");

  useEffect(() => {
    setError("");
    request(`/api/pages/${slug}`)
      .then((result) => setPage(mergeDefaults(createDefaultPage(slug), result)))
      .catch((loadError) => setError(loadError.message));
  }, [slug]);

  async function save() {
    setError("");
    setStatus("");
    setSaving(true);
    try {
      const result = await request(`/api/pages/${slug}`, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(
          stripAdminKeys({
            title: page.title,
            content: page.content,
            seo: page.seo,
          }),
        ),
      });
      setPage((current) => mergeDefaults(current, result));
      setStatus("Page saved.");
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setSaving(false);
    }
  }

  if (!page && !error) return <p role="status">Loading page…</p>;

  return (
    <div>
      <a className="admin-back" href={`${basePath}/pages`}>
        ← Pages
      </a>
      <div className="admin-title-row">
        <div><h1 className="h3">{page?.title || pageDefinitions[slug]?.title}</h1><p>{pageDefinitions[slug]?.publicPath}</p></div>
        <a className="btn btn-black-outline" href={pageDefinitions[slug]?.publicPath || `/${slug}`} rel="noreferrer" target="_blank">View page</a>
      </div>
      <StatusMessage error={error} status={status} />
      {page && <PageEditor onChange={setPage} page={page} />}
      {page && (
        <div className="admin-actions">
          <button className="btn btn-primary" disabled={saving} onClick={save}>
            {saving ? "Saving…" : "Save page"}
          </button>
        </div>
      )}
    </div>
  );
}

function GlobalsView() {
  const [error, setError] = useState("");
  const [globals, setGlobals] = useState(null);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");

  useEffect(() => {
    request("/api/globals")
      .then((result) => setGlobals(mergeDefaults(defaultGlobals, result)))
      .catch((loadError) => setError(loadError.message));
  }, []);

  async function save() {
    setError("");
    setStatus("");
    setSaving(true);
    try {
      const result = await request("/api/globals", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(stripAdminKeys(globals)),
      });
      setGlobals((current) => mergeDefaults(current, result));
      setStatus("Global settings saved.");
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setSaving(false);
    }
  }

  if (!globals && !error) return <p role="status">Loading globals…</p>;

  return (
    <div>
      <h1 className="h3">Globals</h1>
      <StatusMessage error={error} status={status} />
      {globals && <GlobalsEditor globals={globals} onChange={setGlobals} />}
      {globals && (
        <div className="admin-actions">
          <button className="btn btn-primary" disabled={saving} onClick={save}>
            {saving ? "Saving…" : "Save globals"}
          </button>
        </div>
      )}
    </div>
  );
}

function NavigationView() {
  const [activeKey, setActiveKey] = useState(defaultNavigations[0].key);
  const [error, setError] = useState("");
  const [navigations, setNavigations] = useState(null);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");

  useEffect(() => {
    request("/api/navigation")
      .then((result) => {
        setNavigations(
          defaultNavigations.map((defaults) => {
            const saved = result.find((item) => item.key === defaults.key);
            return saved
              ? { ...defaults, ...saved, items: saved.items || [] }
              : structuredClone(defaults);
          }),
        );
      })
      .catch((loadError) => setError(loadError.message));
  }, []);

  const navigation = navigations?.find((item) => item.key === activeKey);

  function updateNavigation(nextNavigation) {
    setNavigations((current) =>
      current.map((item) =>
        item.key === activeKey ? nextNavigation : item,
      ),
    );
  }

  async function save() {
    setError("");
    setStatus("");
    setSaving(true);
    try {
      const result = await request("/api/navigation", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(stripAdminKeys(navigation)),
      });
      updateNavigation({ ...navigation, ...result, items: result.items || [] });
      setStatus(`${navigation.label} saved.`);
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setSaving(false);
    }
  }

  if (!navigations && !error) return <p role="status">Loading navigation…</p>;

  return (
    <div>
      <h1 className="h3">Navigation</h1>
      <p>Manage the header and footer menus. Drag items to change their order.</p>
      <StatusMessage error={error} status={status} />
      {navigation && (
        <NavigationEditor
          activeKey={activeKey}
          menus={navigations}
          navigation={navigation}
          onChange={updateNavigation}
          onSelect={(key) => {
            setActiveKey(key);
            setError("");
            setStatus("");
          }}
        />
      )}
      {navigation && (
        <div className="admin-actions">
          <button className="btn btn-primary" disabled={saving} onClick={save}>
            {saving ? "Saving…" : "Save navigation"}
          </button>
        </div>
      )}
    </div>
  );
}

function Forms({ basePath }) {
  const [error, setError] = useState("");
  const [forms, setForms] = useState(null);

  useEffect(() => {
    request("/api/forms")
      .then(setForms)
      .catch((loadError) => setError(loadError.message));
  }, []);

  return (
    <div>
      <div className="admin-title-row">
        <h1 className="h3">Form maker</h1>
        <a className="btn btn-primary" href={`${basePath}/forms/new`}>
          Create form
        </a>
      </div>
      <StatusMessage error={error} />
      {!forms && !error && <p role="status">Loading forms…</p>}
      {forms && forms.length === 0 && (
        <p className="admin-empty-value">No forms created yet.</p>
      )}
      {forms && (
        <div className="admin-list">
          {forms.map((form) => (
            <a
              className="admin-list__item"
              href={`${basePath}/forms/${form.key}`}
              key={form._id}
            >
              <strong>{form.name}</strong>
              <span>{form.fields?.length || 0} fields →</span>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

function FormView({ basePath, formKey }) {
  const creating = formKey === "new";
  const [error, setError] = useState("");
  const [form, setForm] = useState(
    creating ? structuredClone(defaultForm) : null,
  );
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (creating) return;
    request(`/api/forms/${formKey}`)
      .then((result) => setForm(mergeDefaults(defaultForm, result)))
      .catch((loadError) => setError(loadError.message));
  }, [creating, formKey]);

  async function save() {
    setError("");
    setStatus("");
    setSaving(true);
    try {
      const result = await request(
        creating ? "/api/forms" : `/api/forms/${formKey}`,
        {
          method: creating ? "POST" : "PUT",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(stripAdminKeys(form)),
        },
      );
      setForm(result);
      setStatus("Form saved.");
      if (creating) router.replace(`${basePath}/forms/${result.key}`);
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!window.confirm("Delete this form? This cannot be undone.")) return;
    try {
      await request(`/api/forms/${formKey}`, { method: "DELETE" });
      router.replace(`${basePath}/forms`);
    } catch (deleteError) {
      setError(deleteError.message);
    }
  }

  if (!form && !error) return <p role="status">Loading form…</p>;

  return (
    <div>
      <a className="admin-back" href={`${basePath}/forms`}>
        ← Forms
      </a>
      <h1 className="h3">{creating ? "Create form" : form?.name}</h1>
      <StatusMessage error={error} status={status} />
      {form && <FormEditor form={form} onChange={setForm} />}
      {form && (
        <div className="admin-actions">
          <button className="btn btn-primary" disabled={saving} onClick={save}>
            {saving ? "Saving…" : "Save form"}
          </button>
          {!creating && (
            <button className="btn btn-black-outline" onClick={remove}>
              Delete form
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function Submissions({ basePath }) {
  const [deletingId, setDeletingId] = useState("");
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [sort, setSort] = useState({ column: "date", direction: "desc" });
  const [status, setStatus] = useState("");
  const [submissions, setSubmissions] = useState(null);

  useEffect(() => {
    setSubmissions(null);
    request(`/api/submissions?page=${page}&limit=10`)
      .then((result) => {
        setSubmissions(result.items);
        setPagination(result.pagination);
      })
      .catch((loadError) => setError(loadError.message));
  }, [page]);

  const sortedSubmissions = useMemo(() => {
    if (!submissions) return [];
    const direction = sort.direction === "asc" ? 1 : -1;

    return [...submissions].sort((first, second) => {
      if (sort.column === "form") {
        const comparison = String(first.formName || "").localeCompare(
          String(second.formName || ""),
        );
        if (comparison) return comparison * direction;
      }

      return (
        (new Date(first.createdAt).getTime() -
          new Date(second.createdAt).getTime()) *
        direction
      );
    });
  }, [sort, submissions]);

  function changeSort(column) {
    setSort((current) => ({
      column,
      direction:
        current.column === column
          ? current.direction === "asc"
            ? "desc"
            : "asc"
          : column === "date"
            ? "desc"
            : "asc",
    }));
  }

  function sortDirection(column) {
    if (sort.column !== column) return "none";
    return sort.direction === "asc" ? "ascending" : "descending";
  }

  function sortArrow(column) {
    if (sort.column !== column) return "↕";
    return sort.direction === "asc" ? "↑" : "↓";
  }

  async function removeSubmission(submission) {
    if (
      !window.confirm(
        `Delete this ${submission.formName} submission? This cannot be undone.`,
      )
    ) {
      return;
    }

    setDeletingId(submission._id);
    setError("");
    setStatus("");
    try {
      await request(`/api/submissions/${submission._id}`, {
        method: "DELETE",
      });
      setSubmissions((current) =>
        current.filter((item) => item._id !== submission._id),
      );
      setPagination((current) =>
        current ? { ...current, total: Math.max(0, current.total - 1) } : current,
      );
      setStatus("Submission deleted.");
    } catch (deleteError) {
      setError(deleteError.message);
    } finally {
      setDeletingId("");
    }
  }

  return (
    <div>
      <h1 className="h3">Submissions</h1>
      <StatusMessage error={error} status={status} />
      {!submissions && !error && <p role="status">Loading submissions…</p>}
      {submissions?.length === 0 && (
        <p className="admin-empty-value">No form submissions yet.</p>
      )}
      {submissions?.length ? (
        <>
          <div className="admin-submission-table-wrap">
            <table className="admin-submission-table">
            <caption className="visually-hidden">Form submissions</caption>
            <thead>
              <tr>
                <th aria-sort={sortDirection("form")} scope="col">
                  <button
                    className="admin-table-sort"
                    onClick={() => changeSort("form")}
                    type="button"
                  >
                    Form <span aria-hidden="true">{sortArrow("form")}</span>
                  </button>
                </th>
                <th aria-sort={sortDirection("date")} scope="col">
                  <button
                    className="admin-table-sort"
                    onClick={() => changeSort("date")}
                    type="button"
                  >
                    Submission date{" "}
                    <span aria-hidden="true">{sortArrow("date")}</span>
                  </button>
                </th>
                <th scope="col">First field</th>
                <th scope="col">Second field</th>
                <th scope="col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedSubmissions.map((submission) => (
                <tr key={submission._id}>
                  <td>
                    <a
                      className="admin-submission-table__form"
                      href={`${basePath}/submissions/${submission._id}`}
                    >
                      {submission.formName}
                    </a>
                    <span className="admin-submission-status">
                      {submissionStatus(submission.status)}
                    </span>
                  </td>
                  <td>{new Date(submission.createdAt).toLocaleString()}</td>
                  <td>
                    <SubmissionTableField field={submission.fields?.[0]} />
                  </td>
                  <td>
                    <SubmissionTableField field={submission.fields?.[1]} />
                  </td>
                  <td>
                    <div className="admin-submission-table__actions">
                      <a
                        className="btn btn-primary-outline btn-small"
                        href={`${basePath}/submissions/${submission._id}`}
                      >
                        View
                      </a>
                      <button
                        className="btn btn-black-outline btn-small"
                        disabled={deletingId === submission._id}
                        onClick={() => removeSubmission(submission)}
                        type="button"
                      >
                        {deletingId === submission._id
                          ? "Deleting…"
                          : "Delete"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            </table>
          </div>
          {pagination ? <PaginationControls itemLabel="submissions" onChange={setPage} page={pagination.page} pageSize={10} totalItems={pagination.total} /> : null}
        </>
      ) : null}
    </div>
  );
}

function SubmissionDetail({ basePath, submissionId }) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [submission, setSubmission] = useState(null);
  const router = useRouter();

  useEffect(() => {
    request(`/api/submissions/${submissionId}`)
      .then(setSubmission)
      .catch((loadError) => setError(loadError.message));
  }, [submissionId]);

  async function removeSubmission() {
    if (!window.confirm("Delete this submission? This cannot be undone.")) {
      return;
    }

    setDeleting(true);
    setError("");
    try {
      await request(`/api/submissions/${submissionId}`, {
        method: "DELETE",
      });
      router.replace(`${basePath}/submissions`);
    } catch (deleteError) {
      setError(deleteError.message);
      setDeleting(false);
    }
  }

  return (
    <div>
      <a className="admin-back" href={`${basePath}/submissions`}>
        ← Submissions
      </a>
      <StatusMessage error={error} />
      {!submission && !error ? (
        <p role="status">Loading submission…</p>
      ) : null}
      {submission ? (
        <article className="admin-submission-detail">
          <div className="admin-title-row">
            <div>
              <h1 className="h3">{submission.formName}</h1>
              <p>{new Date(submission.createdAt).toLocaleString()}</p>
            </div>
            <div className="admin-submission-detail__actions">
              <span className="admin-submission-status">
                {submissionStatus(submission.status)}
              </span>
              <button
                className="btn btn-black-outline btn-small"
                disabled={deleting}
                onClick={removeSubmission}
                type="button"
              >
                {deleting ? "Deleting…" : "Delete submission"}
              </button>
            </div>
          </div>

          <dl className="admin-submission-fields">
            {submission.fields.map((field) => (
              <div key={field.name}>
                <dt>{field.label}</dt>
                <dd>{submissionValue(field.value)}</dd>
              </div>
            ))}
          </dl>
        </article>
      ) : null}
    </div>
  );
}

export default function AdminApp({ initialSession, route }) {
  const pathname = usePathname();
  const router = useRouter();
  const basePath = `/${pathname.split("/")[1] || "admin"}`;
  const [session, setSession] = useState(initialSession);
  const isLogin = route[0] === "login";

  useEffect(() => {
    if (session === null && !isLogin) router.replace(`${basePath}/login`);
  }, [basePath, isLogin, router, session]);

  async function logout() {
    await request("/api/auth/logout", { method: "POST" });
    setSession(null);
    router.replace(`${basePath}/login`);
  }

  if (session === undefined) {
    return (
      <main className="section-medium">
        <div className="container">
          <div className="admin-content"><p role="status">Loading admin…</p></div>
        </div>
      </main>
    );
  }

  if (isLogin || !session) {
    return <Login basePath={basePath} onLogin={setSession} />;
  }

  let content;
  if (!route[0]) content = <Dashboard basePath={basePath} />;
  else if (route[0] === "pages" && !route[1])
    content = <Pages basePath={basePath} />;
  else if (route[0] === "pages" && pageDefinitions[route[1]] && isPublicPageEnabled(route[1])) {
    content = <PageView basePath={basePath} slug={route[1]} />;
  } else if (route[0] === "navigation") content = <NavigationView />;
  else if (route[0] === "forms" && !route[1])
    content = <Forms basePath={basePath} />;
  else if (route[0] === "forms" && route[1]) {
    content = <FormView basePath={basePath} formKey={route[1]} />;
  } else if (route[0] === "globals") content = <GlobalsView />;
  else if (route[0] === "submissions" && route[1]) {
    content = (
      <SubmissionDetail basePath={basePath} submissionId={route[1]} />
    );
  } else if (route[0] === "submissions") {
    content = <Submissions basePath={basePath} />;
  } else if (route[0] === "users" && route[1]) {
    content = (
      <AdminUserView
        basePath={basePath}
        currentUser={session}
        onCurrentUserChange={setSession}
        userId={route[1]}
      />
    );
  } else if (route[0] === "users") {
    content = <AdminUsers basePath={basePath} currentUser={session} />;
  } else if (contentTypeDefinitions[route[0]] && route[1]) {
    content = <ContentTypeEditor basePath={basePath} itemId={route[1]} type={route[0]} />;
  } else if (contentTypeDefinitions[route[0]]) {
    content = <ContentTypeList basePath={basePath} type={route[0]} />;
  } else if (CUSTOMER_PORTAL_ENABLED && route[0] === "portal-users") {
    content = <PortalUsers />;
  } else if (CUSTOMER_PORTAL_ENABLED && route[0] === "notifications") {
    content = <NotificationManager />;
  } else if (route[0] === "newsletter") {
    content = <NewsletterManager />;
  } else content = <Dashboard basePath={basePath} />;

  return (
    <AdminShell basePath={basePath} onLogout={logout} user={session}>
      {content}
    </AdminShell>
  );
}
