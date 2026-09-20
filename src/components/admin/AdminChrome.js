"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import PasswordField from "@/components/ui/PasswordField";
import { pageDefinitions } from "@/lib/page-definitions";
import { adminRequest, StatusMessage } from "./admin-utils";

export function Login({ basePath, onLogin }) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  async function login(event) {
    event.preventDefault();
    if (submitting) return;

    setError("");
    setSubmitting(true);
    try {
      const session = await adminRequest("/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      onLogin(session.user);
      router.replace(basePath);
      router.refresh();
    } catch (loginError) {
      setError(loginError.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="section-medium">
      <div className="container">
        <div className="admin-login">
          <h1 className="h3">Admin login</h1>
          <form aria-busy={submitting} className="admin-login__form" onSubmit={login}>
            <div className="field">
              <label htmlFor="admin-email">Email</label>
              <input
                autoComplete="email"
                id="admin-email"
                onChange={(event) => setEmail(event.target.value)}
                placeholder="name@company.com"
                required
                type="email"
                value={email}
              />
            </div>
            <PasswordField
              autoComplete="current-password"
              id="admin-password"
              label="Password"
              onChange={setPassword}
              placeholder="Enter your password"
              required
              value={password}
            />
            <StatusMessage error={error} />
            <button className="btn btn-primary" disabled={submitting}>
              {submitting ? "Signing in…" : "Login"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}

export function AdminShell({ basePath, children, onLogout, user }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigation = [
    ["Dashboard", ""],
    ["Services", "services"],
    ["Projects", "projects"],
    ["News", "news"],
    ["Vacancies", "vacancies"],
    ["Meet the team", "team"],
    ["Testimonials", "testimonials"],
    ["Accreditations", "accreditations"],
    ["Pages", "pages"],
    ["Navigation", "navigation"],
    ["Form maker", "forms"],
    ["Globals", "globals"],
    ["Submissions", "submissions"],
    ["Portal users", "portal-users"],
    ["Notifications", "notifications"],
    ["Newsletter", "newsletter"],
    ["Admin users", "users"],
  ];

  useEffect(() => setMenuOpen(false), [pathname]);

  useEffect(() => {
    if (!menuOpen) return undefined;
    const close = (event) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [menuOpen]);

  return (
    <div className="admin-shell">
      <button
        aria-label="Close admin navigation"
        className={`admin-sidebar-overlay${menuOpen ? " is-open" : ""}`}
        onClick={() => setMenuOpen(false)}
        type="button"
      />
      <aside className={`admin-sidebar${menuOpen ? " is-open" : ""}`} id="admin-sidebar">
        <div className="admin-sidebar__heading">
          <Link className="admin-sidebar__brand" href={basePath}>
            <span>TRIPLE H</span>
            <small>Control centre</small>
          </Link>
          <button
            aria-label="Close admin navigation"
            className="admin-sidebar__close"
            onClick={() => setMenuOpen(false)}
            type="button"
          >
            ×
          </button>
        </div>
        <nav aria-label="Admin navigation" className="admin-sidebar__nav">
          {navigation.map(([label, path]) => {
            const href = path ? `${basePath}/${path}` : basePath;
            const active = path
              ? pathname === href || pathname.startsWith(`${href}/`)
              : pathname === href || pathname === `${href}/`;
            return (
              <Link aria-current={active ? "page" : undefined} href={href} key={label}>
                <span>{label}</span>
                <span aria-hidden="true">→</span>
              </Link>
            );
          })}
        </nav>
        <div className="admin-sidebar__account">
          <span>Signed in as</span>
          <strong>{user.email}</strong>
          <button className="btn btn-white-outline btn-small" onClick={onLogout} type="button">
            Log out
          </button>
        </div>
      </aside>
      <div className="admin-main">
        <header className="admin-mobile-header">
          <Link className="admin-mobile-header__brand" href={basePath}>
            Triple H Control
          </Link>
          <button
            aria-controls="admin-sidebar"
            aria-expanded={menuOpen}
            aria-label={menuOpen ? "Close admin navigation" : "Open admin navigation"}
            className="admin-mobile-header__toggle"
            onClick={() => setMenuOpen((current) => !current)}
            type="button"
          >
            <span />
            <span />
            <span />
          </button>
        </header>
        <main className="admin-main__content section-small">
          <div className="container">
            <div className="admin-content">{children}</div>
          </div>
        </main>
      </div>
    </div>
  );
}

export function Dashboard({ basePath }) {
  const cards = [
    ["Services", "Add, edit and publish website services", "services"],
    ["Projects", "Create and manage project case studies", "projects"],
    ["News", "Publish company news and updates", "news"],
    ["Vacancies", "Manage careers and open roles", "vacancies"],
    ["Meet the team", "Manage team cards and profiles", "team"],
    ["Testimonials", "Manage client quotes and supporting details", "testimonials"],
    ["Accreditations", "Manage certification and trust content", "accreditations"],
    ["Pages", "Edit every public page, page sections and legal policies", "pages"],
    ["Navigation", "Page links and custom URLs", "navigation"],
    ["Form maker", "Create reusable forms and sortable fields", "forms"],
    ["Globals", "Footer, contact details and social links", "globals"],
    ["Admin users", "Create and manage CMS administrator accounts", "users"],
    ["Portal users", "Manage employee and customer access", "portal-users"],
    ["Notifications", "Target portal updates by role, category or person", "notifications"],
    ["Newsletter", "View subscribers and email the active list", "newsletter"],
  ];

  return (
    <div>
      <h1 className="h3">Dashboard</h1>
      <p>Manage the site content and global settings.</p>
      <div className="admin-dashboard-grid">
        {cards.map(([title, description, path]) => (
          <a className="admin-card" href={`${basePath}/${path}`} key={path}>
            <strong>{title}</strong>
            <span>{description}</span>
          </a>
        ))}
      </div>
    </div>
  );
}

export function Pages({ basePath }) {
  return (
    <div>
      <div className="admin-title-row">
        <div><h1 className="h3">Pages</h1><p>Edit the content and SEO for every public page. Services, projects, news and vacancy detail pages live in their own sections.</p></div>
      </div>
      <div className="admin-page-list">
        {Object.entries(pageDefinitions).map(([slug, definition]) => (
          <article className="admin-page-row" key={slug}>
            <div><strong>{definition.title}</strong><span>{definition.publicPath || `/${slug}`}</span></div>
            <div className="admin-page-row__actions">
              <a className="btn btn-black-outline btn-small" href={definition.publicPath || `/${slug}`} rel="noreferrer" target="_blank">View page</a>
              <Link className="btn btn-primary btn-small" href={`${basePath}/pages/${slug}`}>Edit page</Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
