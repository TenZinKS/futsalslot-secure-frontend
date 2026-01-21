import React from "react";
import { Link, Routes, Route, useNavigate } from "react-router-dom";
import { apiFetch } from "./api";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Slots from "./pages/Slots";
import MyBookings from "./pages/MyBookings";
import Admin from "./pages/Admin";
import ChangePassword from "./pages/ChangePassword";

import RequireAuth from "./components/RequireAuth";
import Notify from "./components/Notify";

function Placeholder({ title }) {
  return (
    <div>
      <h2>{title}</h2>
      <p>Coming next step…</p>
    </div>
  );
}

export default function App() {
  const [me, setMe] = React.useState(null);
  const [notice, setNotice] = React.useState(null);
  const nav = useNavigate();

  function showError(message) {
    setNotice({ type: "error", message });
    window.clearTimeout(window.__noticeTimer);
    window.__noticeTimer = window.setTimeout(() => setNotice(null), 4000);
  }

  function showSuccess(message) {
    setNotice({ type: "success", message });
    window.clearTimeout(window.__noticeTimer);
    window.__noticeTimer = window.setTimeout(() => setNotice(null), 2500);
  }

  async function loadMe() {
    try {
      const data = await apiFetch("/auth/me");
      setMe(data);
    } catch {
      setMe(null);
    }
  }

  React.useEffect(() => {
    loadMe();
  }, []);

  async function logout() {
    try {
      await apiFetch("/auth/logout", { method: "POST" });
      setMe(null);
      showSuccess("Logged out");
      nav("/login");
    } catch (e) {
      showError(e.message);
    }
  }

  return (
    <div className="app-shell">
      <Notify notice={notice} onClose={() => setNotice(null)} />

      <header className="topbar">
        <div className="brand">
          <div className="brand-mark" aria-hidden="true" />
          <div>
            <div style={{ fontWeight: 700 }}>FutsalSlot</div>
            <div className="meta">Book courts with confidence</div>
          </div>
        </div>

        <nav className="nav-links">
          <Link className="nav-link" to="/">Home</Link>
          <Link className="nav-link" to="/slots">Slots</Link>
          <Link className="nav-link" to="/bookings">My bookings</Link>
          <Link className="nav-link" to="/admin">Admin</Link>
        </nav>

        <div className="nav-actions">
          {!me ? (
            <>
              <Link className="btn btn-ghost" to="/login">Login</Link>
              <Link className="btn btn-primary" to="/register">Register</Link>
            </>
          ) : (
            <>
              <Link className="btn btn-ghost" to="/change-password">Change password</Link>
              <button className="btn btn-ghost" onClick={logout}>Logout</button>
            </>
          )}
        </div>
      </header>

      {me && (
        <div className="status-card">
          Logged in as <b>{me.email}</b> — Roles: <b>{(me.roles || []).join(", ")}</b>
        </div>
      )}

      <main className="page">
        <Routes>
          <Route path="/" element={<Home me={me} />} />

          <Route
            path="/slots"
            element={
              <RequireAuth me={me}>
                <Slots />
              </RequireAuth>
            }
          />

          <Route
            path="/bookings"
            element={
              <RequireAuth me={me}>
                <MyBookings />
              </RequireAuth>
            }
          />

          <Route
            path="/admin"
            element={
              <RequireAuth me={me}>
                <Admin me={me} />
              </RequireAuth>
            }
          />

          <Route
            path="/login"
            element={
              <Login
                onAuthChange={loadMe}
                showError={showError}
                showSuccess={showSuccess}
              />
            }
          />

          <Route
            path="/change-password"
            element={
              <RequireAuth me={me}>
                <ChangePassword showError={showError} showSuccess={showSuccess} />
              </RequireAuth>
            }
          />

          <Route path="/register" element={<Register />} />
          <Route path="*" element={<Placeholder title="404 Not Found" />} />
        </Routes>
      </main>
    </div>
  );
}
