import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { apiFetch } from "../api";

export default function Register() {
  const [fullName, setFullName] = React.useState("");
  const [phoneNumber, setPhoneNumber] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const nav = useNavigate();

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await apiFetch("/auth/register", {
        method: "POST",
        body: {
          email,
          password,
          full_name: fullName.trim(),
          phone_number: phoneNumber.trim(),
        },
      });
      alert("Registered successfully. Now login.");
      nav("/login");
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="section-card form-card stack">
      <div className="stack-tight">
        <h2>Create your account</h2>
        <p className="subtle-text">Get started and lock in your next match.</p>
      </div>
      <form onSubmit={submit} className="stack">
        <div className="field">
          <label>
            Full name
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Your full name"
              autoComplete="name"
              required
            />
          </label>
        </div>

        <div className="field">
          <label>
            Phone number
            <input
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="+977 9800000000"
              autoComplete="tel"
              required
            />
          </label>
        </div>

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
            Password (min 12 characters)
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              autoComplete="new-password"
              minLength={12}
              required
            />
          </label>
        </div>

        <button className="btn btn-primary" disabled={loading} type="submit">
          {loading ? "Creating..." : "Create account"}
        </button>
      </form>

      <p className="meta">
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </div>
  );
}
