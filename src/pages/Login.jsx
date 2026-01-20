import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiFetch } from "../api";

export default function Login({ onAuthChange }) {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const nav = useNavigate();

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await apiFetch("/auth/login", {
        method: "POST",
        body: { email, password },
      });
      await onAuthChange?.();
      nav("/");
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 420 }}>
      <h2>Login</h2>
      <form onSubmit={submit} style={{ display: "grid", gap: 10 }}>
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

        <button disabled={loading} type="submit">
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>

      <p style={{ marginTop: 10 }}>
        No account? <Link to="/register">Register</Link>
      </p>
    </div>
  );
}
