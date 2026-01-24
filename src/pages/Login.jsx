import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { apiFetch } from "../api";

export default function Login({
  onAuthChange,
  showError,
  showSuccess,
  title,
  subtitle,
  variant,
  endpoint,
  hideRegisterLink,
  secondaryLink,
  defaultRedirect,
  requireRoles,
}) {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const nav = useNavigate();
  const location = useLocation();
  const from = location.state?.from || defaultRedirect || "/";

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await apiFetch(endpoint || "/auth/login", {
        method: "POST",
        body: { email, password },
      });

      if (Array.isArray(requireRoles) && requireRoles.length > 0) {
        try {
          const me = await apiFetch("/auth/me");
          const roles = Array.isArray(me?.roles) ? me.roles : [];
          const hasRequired = requireRoles.some((role) => roles.includes(role));
          if (!hasRequired) {
            await apiFetch("/auth/logout", { method: "POST" }).catch(() => {});
            showError?.("Forbidden. This login is for admin accounts only.");
            return;
          }
        } catch (checkErr) {
          await apiFetch("/auth/logout", { method: "POST" }).catch(() => {});
          showError?.(checkErr.message || "Login failed");
          return;
        }
      }

      await onAuthChange?.();
      showSuccess?.("Logged in successfully");
      nav(from, { replace: true });
    } catch (err) {
      showError?.(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={`section-card form-card stack ${variant === "admin" ? "admin-login" : ""}`}>
      <div className="stack-tight">
        <h2>{title || "Welcome back"}</h2>
        <p className="subtle-text">{subtitle || "Sign in to manage your bookings."}</p>
      </div>

      <form onSubmit={submit} className="stack">
        <div className="field">
          <label>
            Email
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
          </label>
        </div>

        <div className="field">
          <label>
            Password
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              autoComplete="current-password"
              required
            />
          </label>
        </div>

        <button className="btn btn-primary" disabled={loading} type="submit">
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>

      {!hideRegisterLink && (
        <p className="meta">
          No account?{" "}
          <Link to={variant === "admin" ? "/admin-register" : "/register"}>
            {variant === "admin" ? "Create admin" : "Register"}
          </Link>
        </p>
      )}
      {secondaryLink && (
        <p className="meta">
          {secondaryLink.text} <Link to={secondaryLink.to}>{secondaryLink.label}</Link>
        </p>
      )}
    </div>
  );
}
