import React from "react";
import { Link, Routes, Route, useNavigate } from "react-router-dom";
import { apiFetch } from "./api";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Slots from "./pages/Slots";
import MyBookings from "./pages/MyBookings";


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
  const nav = useNavigate();

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
      nav("/login");
    } catch (e) {
      alert(e.message);
    }
  }

  return (
    <div style={{ maxWidth: 960, margin: "0 auto", padding: 16, fontFamily: "system-ui" }}>
      <header style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 16, flexWrap: "wrap" }}>
        <h2 style={{ marginRight: "auto" }}>FutsalSlot</h2>

        <Link to="/">Home</Link>
        <Link to="/slots">Slots</Link>
        <Link to="/bookings">My bookings</Link>
        <Link to="/admin">Admin</Link>

        {!me ? (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        ) : (
          <button onClick={logout}>Logout</button>
        )}
      </header>

      {me && (
        <div style={{ padding: 10, border: "1px solid #ddd", borderRadius: 8, marginBottom: 16 }}>
          Logged in as <b>{me.email}</b> — Roles: <b>{(me.roles || []).join(", ")}</b>
        </div>
      )}

      <Routes>
        {/* Landing */}
        <Route path="/" element={<Home me={me} />} />

        {/* Main pages */}
        <Route path="/slots" element={<Slots />} />
        <Route path="/login" element={<Login onAuthChange={loadMe} />} />
        <Route path="/register" element={<Register />} />

        {/* Next steps (we’ll build these pages later) */}
        <Route path="/bookings" element={<MyBookings />} />
        <Route path="/admin" element={<Placeholder title="Admin" />} />

        {/* fallback */}
        <Route path="*" element={<Placeholder title="404 Not Found" />} />
      </Routes>
    </div>
  );
}
