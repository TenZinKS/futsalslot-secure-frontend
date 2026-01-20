import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { apiFetch } from "../api";

export default function Login({ onAuthChange, showError, showSuccess }) {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const nav = useNavigate();
  const location = useLocation();
  const from = location.state?.from || "/";

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await apiFetch("/auth/login", {
        method: "POST",
        body: { email, password },
      });

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
    <div className="section-card form-card stack">
      <div className="stack-tight">
        <h2>Welcome back</h2>
        <p className="subtle-text">Sign in to manage your bookings.</p>
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

      <p className="meta">
        No account? <Link to="/register">Register</Link>
      </p>
    </div>
  );
}
