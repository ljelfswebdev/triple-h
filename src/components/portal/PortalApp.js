"use client";

import { useEffect, useState } from "react";
import PasswordField from "@/components/ui/PasswordField";
import { useSiteCopy } from "@/components/global/SiteCopyProvider";
import { trackConversion, trackEvent, trackFormCompleted, trackFormFailed } from "@/lib/analytics-events";

function Login({ copy, onLogin, onRegister }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    const response = await fetch("/api/portal/auth/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const result = await response.json();
    if (response.ok) {
      trackEvent("Portal Action", { action: "login", role: result.user.role });
      trackFormCompleted("portal-login", { role: result.user.role });
      trackConversion("portal", "logged-in", { role: result.user.role });
      onLogin(result.user);
    } else {
      trackFormFailed("portal-login", { stage: "authentication" });
      setMessage(result.error || copy.loginErrorMessage);
    }
    setBusy(false);
  }
  async function forgot() {
    if (!email) {
      setMessage(copy.emailFirstMessage);
      return;
    }
    const response = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email }),
    });
    if (response.ok) trackEvent("Portal Action", { action: "password-reset-requested" });
    setMessage(copy.resetSentMessage);
  }
  return (
    <div className="portal-login">
      <p className="eyebrow">{copy.loginEyebrow}</p>
      <h1>{copy.loginTitle}</h1>
      <p>{copy.loginText}</p>
      <form data-analytics-form="portal-login" onSubmit={submit}>
        <div className="field">
          <label htmlFor="portal-email">{copy.emailLabel}</label>
          <input
            id="portal-email"
            onChange={(event) => setEmail(event.target.value)}
            placeholder={copy.emailPlaceholder}
            required
            type="email"
            value={email}
          />
        </div>
        <PasswordField
          id="portal-password"
          label={copy.passwordLabel}
          onChange={setPassword}
          placeholder={copy.passwordPlaceholder}
          required
          value={password}
        />
        <button className="btn btn-primary" disabled={busy} type="submit">
          {busy ? copy.signingInLabel : copy.signInLabel}
        </button>
        <button className="portal-login__forgot" onClick={forgot} type="button">
          {copy.forgotLabel}
        </button>
        {message ? (
          <p aria-live="polite" className="form-status">
            {message}
          </p>
        ) : null}
      </form>
      <div className="portal-login__register">
        <span>{copy.newCustomerLabel}</span>
        <button onClick={onRegister} type="button">
          {copy.createAccountLinkLabel}
        </button>
      </div>
    </div>
  );
}

function Register({ copy, onBack, onRegister }) {
  const [fields, setFields] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    consent: false,
    newsletter: false,
  });
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  function update(name, value) {
    setFields((current) => ({ ...current, [name]: value }));
  }
  async function submit(event) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setMessage("");
    const response = await fetch("/api/portal/auth/register", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(fields),
    });
    const result = await response.json();
    if (response.ok) {
      trackEvent("Customer Registration", { newsletter: fields.newsletter });
      trackFormCompleted("customer-registration", { newsletter: fields.newsletter });
      if (fields.newsletter) trackEvent("Newsletter Signup", { source: "customer-registration" });
      onRegister(result.user);
    } else {
      trackFormFailed("customer-registration", { stage: "submission" });
      setMessage(result.error || copy.registerErrorMessage);
    }
    setBusy(false);
  }
  return (
    <div className="portal-login portal-register">
      <button className="portal-login__back" onClick={onBack} type="button">
        ← {copy.backToLoginLabel}
      </button>
      <p className="eyebrow">{copy.registerEyebrow}</p>
      <h1>{copy.registerTitle}</h1>
      <p>{copy.registerText}</p>
      <form data-analytics-form="customer-registration" onSubmit={submit}>
        <div className="portal-register__grid">
          <div className="field">
            <label htmlFor="register-name">{copy.nameLabel}</label>
            <input
              autoComplete="name"
              id="register-name"
              onChange={(event) => update("name", event.target.value)}
              placeholder={copy.namePlaceholder}
              required
              value={fields.name}
            />
          </div>
          <div className="field">
            <label htmlFor="register-company">{copy.companyLabel}</label>
            <input
              autoComplete="organization"
              id="register-company"
              onChange={(event) => update("company", event.target.value)}
              placeholder={copy.companyPlaceholder}
              required
              value={fields.company}
            />
          </div>
          <div className="field">
            <label htmlFor="register-email">{copy.workEmailLabel}</label>
            <input
              autoComplete="email"
              id="register-email"
              onChange={(event) => update("email", event.target.value)}
              placeholder={copy.emailPlaceholder}
              required
              type="email"
              value={fields.email}
            />
          </div>
          <div className="field">
            <label htmlFor="register-phone">{copy.phoneLabel}</label>
            <input
              autoComplete="tel"
              id="register-phone"
              onChange={(event) => update("phone", event.target.value)}
              placeholder={copy.phonePlaceholder}
              type="tel"
              value={fields.phone}
            />
          </div>
          <PasswordField
            autoComplete="new-password"
            id="register-password"
            label={copy.newPasswordLabel}
            onChange={(value) => update("password", value)}
            placeholder={copy.newPasswordPlaceholder}
            required
            value={fields.password}
          />
          <PasswordField
            autoComplete="new-password"
            id="register-confirm-password"
            label={copy.confirmPasswordLabel}
            onChange={(value) => update("confirmPassword", value)}
            placeholder={copy.confirmPasswordPlaceholder}
            required
            value={fields.confirmPassword}
          />
        </div>
        <label className="check-field">
          <input
            checked={fields.consent}
            onChange={(event) => update("consent", event.target.checked)}
            required
            type="checkbox"
          />
          <span>{copy.consentLabel}</span>
        </label>
        <label className="check-field">
          <input
            checked={fields.newsletter}
            onChange={(event) => update("newsletter", event.target.checked)}
            type="checkbox"
          />
          <span>{copy.newsletterConsentLabel}</span>
        </label>
        {message ? (
          <p aria-live="polite" className="form-status form-status--error">
            {message}
          </p>
        ) : null}
        <button className="btn btn-primary" disabled={busy} type="submit">
          {busy ? copy.creatingAccountLabel : copy.createAccountLabel}
        </button>
      </form>
    </div>
  );
}

function PasswordChange({ copy, onDone }) {
  const [fields, setFields] = useState({ currentPassword: "", password: "", confirmPassword: "" });
  const [message, setMessage] = useState("");
  async function submit(event) {
    event.preventDefault();
    const response = await fetch("/api/portal/password", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(fields),
    });
    const result = await response.json();
    setMessage(response.ok ? copy.passwordUpdatedMessage : result.error);
    if (response.ok) {
      trackEvent("Portal Action", { action: "password-changed" });
      trackFormCompleted("portal-password-change");
      onDone();
    } else {
      trackFormFailed("portal-password-change", { stage: "submission" });
    }
  }
  return (
    <form className="portal-password" data-analytics-form="portal-password-change" onSubmit={submit}>
      <h2>{copy.changePasswordTitle}</h2>
      <PasswordField
        id="portal-current-password"
        label={copy.currentPasswordLabel}
        onChange={(value) => setFields((state) => ({ ...state, currentPassword: value }))}
        placeholder={copy.currentPasswordPlaceholder}
        required
        value={fields.currentPassword}
      />
      <PasswordField
        id="portal-new-password"
        label={copy.changedPasswordLabel}
        onChange={(value) => setFields((state) => ({ ...state, password: value }))}
        placeholder={copy.newPasswordPlaceholder}
        required
        value={fields.password}
      />
      <PasswordField
        id="portal-confirm-password"
        label={copy.changedConfirmLabel}
        onChange={(value) => setFields((state) => ({ ...state, confirmPassword: value }))}
        placeholder={copy.changedConfirmPlaceholder}
        required
        value={fields.confirmPassword}
      />
      <button className="btn btn-primary" type="submit">
        {copy.updatePasswordLabel}
      </button>
      {message ? <p className="form-status">{message}</p> : null}
    </form>
  );
}

function Dashboard({ copy, initialUser, onLogout }) {
  const [data, setData] = useState({ session: initialUser, notifications: [] });
  const [showPassword, setShowPassword] = useState(Boolean(initialUser.mustChangePassword));
  const user = data.session;
  useEffect(() => {
    trackEvent("Portal Action", { action: "dashboard-viewed", role: user.role });
  }, [user.role]);
  useEffect(() => {
    fetch("/api/portal/overview")
      .then((response) => response.json())
      .then((result) => {
        if (result.session) setData(result);
      });
  }, []);
  async function toggleNewsletter(event) {
    const active = event.target.checked;
    const response = await fetch("/api/newsletter", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: user.email, name: user.name, source: "portal", active }),
    });
    if (!response.ok) return;
    trackEvent("Portal Action", { action: active ? "newsletter-enabled" : "newsletter-disabled", role: user.role });
    if (active) trackEvent("Newsletter Signup", { source: "portal" });
    setData((state) => ({ ...state, session: { ...state.session, newsletter: active } }));
  }
  const employeeCards = copy.employeeMetrics;
  const customerCards = copy.customerMetrics;
  return (
    <div className="portal-shell">
      <header className="portal-topbar">
        <div>
          <p className="eyebrow">{user.role} {copy.portalSuffix}</p>
          <strong>{user.name}</strong>
          <span>{user.category}</span>
        </div>
        <div>
          <button
            className="btn btn-black-outline btn-small"
            onClick={() => setShowPassword((value) => !value)}
            type="button"
          >
            {copy.passwordButtonLabel}
          </button>
          <button className="btn btn-primary btn-small" onClick={onLogout} type="button">
            {copy.logoutLabel}
          </button>
        </div>
      </header>
      {user.mustChangePassword ? (
        <div className="portal-alert">
          <strong>{copy.securityTitle}</strong>
          <span>{copy.securityText}</span>
        </div>
      ) : null}
      <section className="portal-welcome">
        <div>
          <p className="eyebrow">{copy.dashboardEyebrow}</p>
          <h1>{copy.greetingPrefix}, {user.name.split(" ")[0]}.</h1>
          <p>
            {user.role === "employee"
              ? copy.employeeWelcomeText
              : copy.customerWelcomeText}
          </p>
        </div>
        <label className="portal-newsletter">
          <input checked={Boolean(user.newsletter)} onChange={toggleNewsletter} type="checkbox" />
          <span>{copy.newsletterToggleLabel}</span>
        </label>
      </section>
      <div className="portal-metrics">
        {(user.role === "employee" ? employeeCards : customerCards).map((item) => (
          <article key={item.label}>
            <span>{item.label}</span>
            <strong>{item.value}</strong>
            <p>{item.text}</p>
          </article>
        ))}
      </div>
      <div className="portal-columns">
        <section>
          <div className="portal-section-title">
            <div>
              <p className="eyebrow">{copy.notificationsEyebrow}</p>
              <h2>{copy.notificationsTitle}</h2>
            </div>
            <span>{data.notifications.length} {copy.updatesLabel}</span>
          </div>
          <div className="notification-list">
            {data.notifications.length ? (
              data.notifications.map((item) => (
                <article key={item._id}>
                  <time>{new Date(item.createdAt).toLocaleDateString("en-GB")}</time>
                  <h3>{item.title}</h3>
                  <p>{item.message}</p>
                </article>
              ))
            ) : (
              <p className="empty-state">{copy.noNotificationsText}</p>
            )}
          </div>
        </section>
        <aside>
          <p className="eyebrow">{copy.quickActionsEyebrow}</p>
          <h2>{user.role === "employee" ? copy.employeeActionsTitle : copy.customerActionsTitle}</h2>
          <ul className="portal-actions">
            {(user.role === "employee"
              ? copy.employeeActions
              : copy.customerActions
            ).map((action) => (
              <li key={action.text}>
                <button onClick={() => trackEvent("Portal Action", { action: "quick-action", label: action.text, role: user.role })} type="button">
                  {action.text}
                  <span>↗</span>
                </button>
              </li>
            ))}
          </ul>
        </aside>
      </div>
      {showPassword ? (
        <PasswordChange
          copy={copy}
          onDone={() => {
            setShowPassword(false);
            setData((state) => ({
              ...state,
              session: { ...state.session, mustChangePassword: false },
            }));
          }}
        />
      ) : null}
    </div>
  );
}

export default function PortalApp({ initialUser, managedCopy }) {
  const { portal: fallbackCopy } = useSiteCopy();
  const copy = { ...fallbackCopy, ...managedCopy };
  const [user, setUser] = useState(initialUser);
  const [registering, setRegistering] = useState(false);
  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    trackEvent("Portal Action", { action: "logout", role: user?.role || "unknown" });
    setUser(null);
  }
  if (user) return <Dashboard copy={copy} initialUser={user} onLogout={logout} />;
  if (registering) return <Register copy={copy} onBack={() => setRegistering(false)} onRegister={setUser} />;
  return <Login copy={copy} onLogin={setUser} onRegister={() => setRegistering(true)} />;
}
