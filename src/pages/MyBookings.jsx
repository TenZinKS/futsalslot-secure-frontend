import React from "react";
import { apiFetch } from "../api";
import { formatDateTime, formatDate, formatTime } from "../utils/date";

export default function MyBookings() {
  const [rows, setRows] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [cancellingId, setCancellingId] = React.useState(null);
  const [courtMap, setCourtMap] = React.useState({});

  async function load() {
    setLoading(true);
    try {
      const data = await apiFetch("/bookings/me");
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function cancelBooking(id) {
    if (!confirm("Cancel this booking?")) return;

    setCancellingId(id);
    try {
      await apiFetch(`/bookings/${id}/cancel`, {
        method: "POST",
        body: { reason: "User cancelled from UI" },
      });
      await load(); // refresh list
    } catch (e) {
      alert(e.message);
    } finally {
      setCancellingId(null);
    }
  }

  async function loadCourts() {
    try {
      const data = await apiFetch("/courts");
      const list = Array.isArray(data)
        ? data
        : Array.isArray(data?.courts)
          ? data.courts
          : [];
      const next = {};
      list.forEach((court) => {
        if (court?.id) next[court.id] = court;
      });
      setCourtMap(next);
    } catch {
      setCourtMap({});
    }
  }

  React.useEffect(() => {
    load();
    loadCourts();
  }, []);

  return (
    <div className="stack">
      <div className="row" style={{ justifyContent: "space-between" }}>
        <div className="stack-tight">
          <h2>My bookings</h2>
          <p className="subtle-text">Track upcoming games and manage cancellations.</p>
        </div>
        <button onClick={load} disabled={loading} className="btn btn-ghost">
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      <div className="grid-list">
        {rows.map((b) => {
          const status = b.status || "UNKNOWN";
          const statusClass =
            status === "CONFIRMED"
              ? "pill-success"
              : status === "CANCELLED"
                ? "pill-cancelled"
                : "pill-muted";
          return (
            <div key={b.id} className="list-item stack booking-card">
              <div className="row booking-header" style={{ justifyContent: "space-between" }}>
                <div>
                  <div className="booking-title">Booking #{b.id}</div>
                  <div className="meta">Created: {formatDateTime(b.created_at)}</div>
                </div>
                <div className="row booking-actions">
                  <span className={`pill ${statusClass}`}>{status}</span>
                  {status !== "CANCELLED" && (
                    <button
                      onClick={() => cancelBooking(b.id)}
                      disabled={cancellingId === b.id}
                      title="Cancel booking"
                      className="btn btn-danger"
                    >
                      {cancellingId === b.id ? "Cancelling..." : "Cancel booking"}
                    </button>
                  )}
                </div>
              </div>

              {b.cancelled_at && (
                <div className="meta">
                  Cancelled: {formatDateTime(b.cancelled_at)}
                </div>
              )}

              {b.slot && (
                <div className="stack-tight booking-details">
                  <div className="meta">
                    Court: {b.court?.name || b.slot?.court?.name || b.slot?.court_name || b.court_name || courtMap[b.slot.court_id]?.name || "Unknown"}
                  </div>
                  <div className="meta">
                    Date: {formatDate(b.slot.start_time)}
                  </div>
                  <div className="meta">
                    Time: {formatTime(b.slot.start_time)} → {formatTime(b.slot.end_time)}
                  </div>
                  <div className="meta">
                    Price: {b.slot.price} NPR
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {!loading && rows.length === 0 && (
          <div className="subtle-text">No bookings yet.</div>
        )}
      </div>
    </div>
  );
}
