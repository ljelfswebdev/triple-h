"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PasswordField from "@/components/ui/PasswordField";
import PaginationControls, { usePaginatedItems } from "@/components/ui/PaginationControls";
import { adminRequest, StatusMessage } from "./admin-utils";

export function AdminUsers({ basePath, currentUser }) {
  const [error, setError] = useState("");
  const [users, setUsers] = useState(null);
  const pagination = usePaginatedItems(users || []);

  useEffect(() => {
    adminRequest("/api/admin-users")
      .then(setUsers)
      .catch((loadError) => setError(loadError.message));
  }, []);

  return (
    <div>
      <div className="admin-title-row">
        <h1 className="h3">Admin users</h1>
        <a className="btn btn-primary" href={`${basePath}/users/new`}>
          Create admin
        </a>
      </div>
      <StatusMessage error={error} />
      {!users && !error ? <p role="status">Loading admin users…</p> : null}
      {users ? (
        <div className="admin-list admin-user-list">
          {pagination.pageItems.map((user) => (
            <a
              className="admin-list__item admin-user-list__item"
              href={`${basePath}/users/${user.id}`}
              key={user.id}
            >
              <span className="admin-user-list__identity">
                <strong>{user.name}</strong>
                <span>{user.email}</span>
              </span>
              <span
                className={`admin-submission-status ${user.active ? "" : "admin-submission-status--inactive"}`.trim()}
              >
                {user.active ? "Active" : "Inactive"}
              </span>
              <span>{user.id === currentUser.id ? "Your account" : "Edit →"}</span>
            </a>
          ))}
          <PaginationControls itemLabel="admin users" onChange={pagination.setPage} page={pagination.page} totalItems={users.length} />
        </div>
      ) : null}
    </div>
  );
}

export function AdminUserView({ basePath, currentUser, onCurrentUserChange, userId }) {
  const creating = userId === "new";
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");
  const [user, setUser] = useState(
    creating
      ? {
          name: "",
          email: "",
          password: "",
          confirmPassword: "",
          active: true,
        }
      : null,
  );
  const router = useRouter();

  useEffect(() => {
    if (creating) return;
    adminRequest(`/api/admin-users/${userId}`)
      .then((result) => setUser({ ...result, password: "", confirmPassword: "" }))
      .catch((loadError) => setError(loadError.message));
  }, [creating, userId]);

  async function save(event) {
    event.preventDefault();
    setError("");
    setStatus("");
    if (user.password && user.password !== user.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setSaving(true);
    try {
      const result = await adminRequest(
        creating ? "/api/admin-users" : `/api/admin-users/${userId}`,
        {
          method: creating ? "POST" : "PUT",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(user),
        },
      );
      setUser({ ...result, password: "", confirmPassword: "" });
      setStatus("Admin user saved.");
      if (creating) router.replace(`${basePath}/users/${result.id}`);
      if (result.id === currentUser.id) {
        onCurrentUserChange({ ...currentUser, email: result.email });
      }
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!window.confirm(`Delete ${user.name}? This cannot be undone.`)) return;
    setError("");
    try {
      await adminRequest(`/api/admin-users/${userId}`, { method: "DELETE" });
      router.replace(`${basePath}/users`);
    } catch (deleteError) {
      setError(deleteError.message);
    }
  }

  if (!user && !error) return <p role="status">Loading admin user…</p>;

  return (
    <div>
      <a className="admin-back" href={`${basePath}/users`}>
        ← Admin users
      </a>
      <h1 className="h3">{creating ? "Create admin" : user?.name}</h1>
      <StatusMessage error={error} status={status} />
      {user ? (
        <form className="admin-user-form" onSubmit={save}>
          <div className="field admin-field">
            <label htmlFor="admin-user-name">Name</label>
            <input
              autoComplete="name"
              id="admin-user-name"
              onChange={(event) => setUser({ ...user, name: event.target.value })}
              placeholder="Full name"
              required
              type="text"
              value={user.name}
            />
          </div>
          <div className="field admin-field">
            <label htmlFor="admin-user-email">Email address</label>
            <input
              autoComplete="email"
              id="admin-user-email"
              onChange={(event) => setUser({ ...user, email: event.target.value })}
              placeholder="name@company.com"
              required
              type="email"
              value={user.email}
            />
          </div>
          <PasswordField
            autoComplete="new-password"
            id="admin-user-password"
            label={`Password${creating ? "" : " (leave blank to keep the current password)"}`}
            minLength={10}
            onChange={(password) => setUser({ ...user, password })}
            placeholder={
              creating ? "Minimum 10 characters" : "Enter a new password to replace the current one"
            }
            required={creating}
            value={user.password}
          />
          <PasswordField
            autoComplete="new-password"
            id="admin-user-confirm-password"
            label={creating ? "Confirm password" : "Confirm new password"}
            minLength={10}
            onChange={(confirmPassword) => setUser({ ...user, confirmPassword })}
            placeholder="Repeat the new password"
            required={creating || Boolean(user.password)}
            value={user.confirmPassword || ""}
          />
          <label className="admin-checkbox">
            <input
              checked={user.active}
              disabled={!creating && user.id === currentUser.id}
              onChange={(event) => setUser({ ...user, active: event.target.checked })}
              type="checkbox"
            />
            <span>Active — can sign in to the CMS</span>
          </label>
          {!creating && user.id === currentUser.id ? (
            <p className="admin-empty-value">You cannot deactivate or delete your own account.</p>
          ) : null}
          <div className="admin-actions">
            <button className="btn btn-primary" disabled={saving} type="submit">
              {saving ? "Saving…" : "Save admin"}
            </button>
            {!creating && user.id !== currentUser.id ? (
              <button className="btn btn-black-outline" onClick={remove} type="button">
                Delete admin
              </button>
            ) : null}
          </div>
        </form>
      ) : null}
    </div>
  );
}
