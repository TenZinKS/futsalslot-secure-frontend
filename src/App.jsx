import React from "react";
import { Link, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { apiFetch } from "./api";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Courts from "./pages/Courts";
import Slots from "./pages/Slots";
import MyBookings from "./pages/MyBookings";
import Admin from "./pages/Admin";
import ChangePassword from "./pages/ChangePassword";
import Profile from "./pages/Profile";

import RequireAuth from "./components/RequireAuth";
import Notify from "./components/Notify";
import Logo from "./assets/futsalslot-logo.png";

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
  const [profileOpen, setProfileOpen] = React.useState(false);
  const nav = useNavigate();
  const location = useLocation();

  function maskEmail(value) {
    if (!value || !value.includes("@")) return "";
    const [name, domain] = value.split("@");
    if (!name) return "";
    const visible = name.length > 2 ? `${name[0]}***${name[name.length - 1]}` : `${name[0]}*`;
    return `${visible}@${domain}`;
  }

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

  React.useEffect(() => {
    setProfileOpen(false);
  }, [location.pathname]);

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
          <img className="brand-logo" src={Logo} alt="FutsalSlot logo" />
          <div>
            <div style={{ fontWeight: 700 }}>FutsalSlot</div>
            <div className="meta">Book courts with confidence</div>
          </div>
        </div>

        <nav className="nav-links">
          <Link className="nav-link" to="/">Home</Link>
          <Link className="nav-link" to="/courts">Courts</Link>
          <Link className="nav-link" to="/slots">Slots</Link>
        </nav>

        <div className="nav-actions">
          {!me ? (
            <>
              <Link className="btn btn-ghost" to="/login">Login</Link>
              <Link className="btn btn-primary" to="/register">Register</Link>
            </>
          ) : (
            <div className="profile-menu">
              <button
                className="profile-trigger"
                onClick={() => setProfileOpen((open) => !open)}
                aria-haspopup="menu"
                aria-expanded={profileOpen}
                type="button"
              >
                <span className="profile-dot" aria-hidden="true">
                  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                    <path
                      d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4zm0 2c-4.2 0-7 2.1-7 5v1h14v-1c0-2.9-2.8-5-7-5z"
                      fill="currentColor"
                    />
                  </svg>
                </span>
                <span className="profile-label">Profile</span>
              </button>
              {profileOpen && (
                <div className="profile-dropdown" role="menu">
                  <div className="profile-summary">
                    <div className="profile-name">Signed in</div>
                    <div className="profile-meta">{maskEmail(me.email) || "Account"}</div>
                  </div>
                  <Link className="profile-item" to="/profile">Profile</Link>
                  <Link className="profile-item" to="/bookings">My bookings</Link>
                  <Link className="profile-item" to="/change-password">Change password</Link>
                  <button className="profile-item danger" onClick={logout} type="button">Logout</button>
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      <main className="page">
        <Routes>
          <Route path="/" element={<Home me={me} />} />
          <Route path="/courts" element={<Courts />} />

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
            path="/admin-login"
            element={
              <Login
                onAuthChange={loadMe}
                showError={showError}
                showSuccess={showSuccess}
                title="Admin access"
                subtitle="Sign in with a staff account to manage courts and bookings."
                variant="admin"
              />
            }
          />

          <Route
            path="/profile"
            element={
              <RequireAuth me={me}>
                <Profile me={me} showError={showError} showSuccess={showSuccess} />
              </RequireAuth>
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
