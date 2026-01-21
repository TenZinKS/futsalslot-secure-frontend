import React from "react";
import { apiFetch } from "../api";

function toLocalInputValue(value) {
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
}

function defaultStartEnd() {
  const start = new Date();
  start.setMinutes(0, 0, 0);
  const end = new Date(start);
  end.setHours(end.getHours() + 1);
  return { start, end };
}

function toIsoLocalSeconds(value) {
  if (!value) return "";
  return value.length === 16 ? `${value}:00` : value;
}

export default function Admin({ me }) {
  const isStaff =
    me?.roles?.includes("ADMIN") || me?.roles?.includes("STAFF");
  const isAdmin = me?.roles?.includes("ADMIN");

  const [courts, setCourts] = React.useState([]);
  const [bookings, setBookings] = React.useState([]);
  const [loadingBookings, setLoadingBookings] = React.useState(false);
  const [cancellingBookingId, setCancellingBookingId] = React.useState(null);
  const [auditLogs, setAuditLogs] = React.useState([]);
  const [loadingAudit, setLoadingAudit] = React.useState(false);
  const [auditError, setAuditError] = React.useState("");

  // court form
  const [courtName, setCourtName] = React.useState("");
  const [courtLocation, setCourtLocation] = React.useState("");
  const [courtDescription, setCourtDescription] = React.useState("");
  const [courtMapsLink, setCourtMapsLink] = React.useState("");

  // slot form
  const [courtId, setCourtId] = React.useState("");
  const { start, end } = defaultStartEnd();
  const [startTime, setStartTime] = React.useState(toLocalInputValue(start));
  const [endTime, setEndTime] = React.useState(toLocalInputValue(end));
  const [price, setPrice] = React.useState(1500);

  async function loadCourts() {
    try {
      const data = await apiFetch("/courts");
      setCourts(Array.isArray(data) ? data : []);
    } catch (e) {
      // if not logged in or no access, keep empty
      setCourts([]);
    }
  }

  async function loadBookings() {
    setLoadingBookings(true);
    try {
      const data = await apiFetch("/bookings");
      setBookings(Array.isArray(data) ? data : []);
    } catch (e) {
      alert(e.message);
      setBookings([]);
    } finally {
      setLoadingBookings(false);
    }
  }

  async function adminCancelBooking(booking) {
    if (booking.status !== "CONFIRMED") {
      alert("Only CONFIRMED bookings can be cancelled.");
      return;
    }
    if (!confirm("Cancel this booking?")) return;
    setCancellingBookingId(booking.id);
    try {
      await apiFetch(`/bookings/${booking.id}/admin_cancel`, {
        method: "POST",
        body: { reason: "Admin cancelled from UI" },
      });
      await loadBookings();
    } catch (e) {
      alert(e.message);
    } finally {
      setCancellingBookingId(null);
    }
  }

  async function loadAuditLogs() {
    setLoadingAudit(true);
    setAuditError("");
    try {
      const data = await apiFetch("/admin/audit-logs?limit=100");
      setAuditLogs(Array.isArray(data) ? data : []);
    } catch (e) {
      setAuditError(e.message || "Unable to load audit logs.");
      setAuditLogs([]);
    } finally {
      setLoadingAudit(false);
    }
  }

  function exportAuditLogsCsv() {
    if (!auditLogs.length) {
      alert("No audit logs to export.");
      return;
    }

    const headers = [
      "id",
      "created_at",
      "user_id",
      "action",
      "entity",
      "entity_id",
      "ip",
      "user_agent",
      "metadata",
    ];

    const escapeCsv = (value) => {
      if (value === null || value === undefined) return "";
      const str = typeof value === "string" ? value : JSON.stringify(value);
      if (/[",\n]/.test(str)) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const rows = auditLogs.map((log) => [
      log.id,
      log.created_at,
      log.user_id,
      log.action,
      log.entity,
      log.entity_id,
      log.ip,
      log.user_agent,
      log.metadata,
    ]);

    const csv = [headers.join(",")]
      .concat(rows.map((row) => row.map(escapeCsv).join(",")))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const ts = new Date().toISOString().replace(/[:.]/g, "-");
    link.href = url;
    link.download = `audit-logs-${ts}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  React.useEffect(() => {
    loadCourts();
    loadBookings();
    if (isAdmin) {
      loadAuditLogs();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function createCourt() {
    try {
      await apiFetch("/courts", {
        method: "POST",
        body: {
          name: courtName,
          location: courtLocation,
          description: courtDescription,
          maps_link: courtMapsLink,
        },
      });
      setCourtName("");
      setCourtLocation("");
      setCourtDescription("");
      setCourtMapsLink("");
      await loadCourts();
      alert("Court created");
    } catch (e) {
      alert(e.message);
    }
  }

  async function createSlot() {
    try {
      await apiFetch("/slots", {
        method: "POST",
        body: {
          court_id: Number(courtId),
          start_time: toIsoLocalSeconds(startTime),
          end_time: toIsoLocalSeconds(endTime),
          price: Number(price),
        },
      });
      alert("Slot created");
    } catch (e) {
      alert(e.message);
    }
  }

  if (!me) return <div>Please login first.</div>;
  if (!isStaff) {
    return (
      <div className="section-card admin-shell">
        <h2>Admin Dashboard</h2>
        <p className="subtle-text">Staff access only.</p>
        <a className="btn btn-primary" href="/admin-login">
          Go to admin login
        </a>
      </div>
    );
  }

  return (
    <div className="stack admin-shell">
      <div className="admin-banner">
        <div>
          <h2>Admin Dashboard</h2>
          <p className="subtle-text">Manage courts, slots, and customer bookings.</p>
        </div>
        <span className="pill pill-muted">Staff</span>
      </div>

      <section className="section-card stack">
        <h3 className="section-title">Create court</h3>
        <div className="stack" style={{ maxWidth: 420 }}>
          <input
            placeholder="Court name (unique)"
            value={courtName}
            onChange={(e) => setCourtName(e.target.value)}
          />
          <input
            placeholder="Location"
            value={courtLocation}
            onChange={(e) => setCourtLocation(e.target.value)}
          />
          <textarea
            placeholder="Description"
            value={courtDescription}
            onChange={(e) => setCourtDescription(e.target.value)}
            rows={3}
          />
          <input
            placeholder="Google Maps link"
            value={courtMapsLink}
            onChange={(e) => setCourtMapsLink(e.target.value)}
          />
          <button
            className="btn btn-primary"
            onClick={createCourt}
            disabled={
              !courtName.trim() ||
              !courtLocation.trim() ||
              !courtDescription.trim() ||
              !courtMapsLink.trim()
            }
          >
            Create court
          </button>
        </div>
      </section>

      <section className="section-card stack">
        <h3 className="section-title">Create slot</h3>

        <div className="stack" style={{ maxWidth: 520 }}>
          <div className="field">
            <label>
              Court
              <select value={courtId} onChange={(e) => setCourtId(e.target.value)}>
                <option value="">Select a court</option>
                {courts.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          </div>

          <div className="field">
            <label>
              Start time
              <input
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </label>
          </div>

          <div className="field">
            <label>
              End time
              <input
                type="datetime-local"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </label>
          </div>

          <div className="field">
            <label>
              Price (NPR)
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                min="0"
              />
            </label>
          </div>

          <button className="btn btn-primary" onClick={createSlot} disabled={!courtId}>
            Create slot
          </button>
        </div>

        <p className="meta">Tip: Times are entered in your local timezone.</p>
      </section>

      <section className="section-card stack">
        <div className="row" style={{ justifyContent: "space-between" }}>
          <h3 className="section-title">Recent bookings</h3>
          <button className="btn btn-ghost" onClick={loadBookings} disabled={loadingBookings}>
            {loadingBookings ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        <div className="grid-list">
          {bookings.map((b) => (
            <div key={b.id} className="list-item stack">
              <div className="row" style={{ justifyContent: "space-between" }}>
                <div>
                  <b>Booking #{b.id}</b>
                </div>
                <div className="row">
                  <span className={`pill ${b.status === "CANCELLED" ? "pill-cancelled" : ""}`}>
                    {b.status}
                  </span>
                  {b.status !== "CANCELLED" && (
                    <button
                      className="btn btn-danger"
                      onClick={() => adminCancelBooking(b)}
                      disabled={b.status !== "CONFIRMED" || cancellingBookingId === b.id}
                      title={
                        b.status !== "CONFIRMED"
                          ? "Only CONFIRMED bookings can be cancelled"
                          : "Cancel booking"
                      }
                    >
                      {cancellingBookingId === b.id ? "Cancelling..." : "Admin cancel"}
                    </button>
                  )}
                </div>
              </div>

              <div className="meta">
                Created: {b.created_at}
              </div>

              {b.cancelled_at && (
                <div className="meta">
                  Cancelled: {b.cancelled_at}
                </div>
              )}

              <div className="stack-tight">
                <div>
                  Player:{" "}
                  <b>{b.user_full_name || b.user?.full_name || "Not provided"}</b>
                </div>
                <div className="meta">
                  Phone: {b.user_phone_number || b.user?.phone_number || "Not provided"}
                </div>
                <div className="meta">
                  Email: {b.user?.email || "Not provided"}
                </div>
              </div>

              {b.slot && (
                <div className="stack-tight">
                  <div>
                    Slot: <b>{b.slot.start_time}</b> → <b>{b.slot.end_time}</b>
                  </div>
                  <div className="meta">
                    Court ID: {b.slot.court_id} | Price: {b.slot.price} NPR
                  </div>
                </div>
              )}
            </div>
          ))}

          {!loadingBookings && bookings.length === 0 && (
            <div className="subtle-text">No bookings yet.</div>
          )}
        </div>
      </section>

      {isAdmin && (
        <section className="section-card stack">
          <div className="row" style={{ justifyContent: "space-between" }}>
            <div className="stack-tight">
              <h3 className="section-title">Audit logs</h3>
              <p className="subtle-text">Latest admin-level events.</p>
            </div>
            <div className="row">
              <button className="btn btn-ghost" onClick={exportAuditLogsCsv}>
                Export CSV
              </button>
              <button className="btn btn-ghost" onClick={loadAuditLogs} disabled={loadingAudit}>
                {loadingAudit ? "Refreshing..." : "Refresh"}
              </button>
            </div>
          </div>

          {auditError && <div className="subtle-text">{auditError}</div>}

          <div className="grid-list">
            {auditLogs.map((log) => (
              <div key={log.id} className="list-item stack">
                <div className="row" style={{ justifyContent: "space-between" }}>
                  <div>
                    <b>{log.action || "EVENT"}</b>
                  </div>
                  {log.created_at && <span className="meta">{log.created_at}</span>}
                </div>

                <div className="meta">
                  User: {log.user_id ?? "n/a"} | Entity: {log.entity || "n/a"} {log.entity_id ? `#${log.entity_id}` : ""}
                </div>

                {log.ip && <div className="meta">IP: {log.ip}</div>}

                {log.metadata && (
                  <pre className="meta" style={{ margin: 0, whiteSpace: "pre-wrap" }}>
                    {JSON.stringify(log.metadata, null, 2)}
                  </pre>
                )}
              </div>
            ))}

            {!loadingAudit && auditLogs.length === 0 && !auditError && (
              <div className="subtle-text">No audit logs found.</div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
