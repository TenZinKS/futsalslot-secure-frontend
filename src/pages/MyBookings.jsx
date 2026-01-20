import React from "react";
import { apiFetch } from "../api";

export default function MyBookings() {
  const [rows, setRows] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [cancellingId, setCancellingId] = React.useState(null);

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

  async function cancelBooking(id) {
    if (!confirm("Cancel this booking?")) return;

    try {
        await apiFetch(`/bookings/${id}/cancel`, {
        method: "POST",
        body: { reason: "User cancelled from UI" },
        });
        await load(); // refresh list
    } catch (e) {
        alert(e.message);
    }
    }


  React.useEffect(() => {
    load();
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
        {rows.map((b) => (
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
                    onClick={() => cancelBooking(b.id)}
                    disabled={cancellingId === b.id}
                    title="Cancel booking"
                    className="btn btn-danger"
                  >
                    {cancellingId === b.id ? "Cancelling..." : "Cancel"}
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

        {!loading && rows.length === 0 && (
          <div className="subtle-text">No bookings yet.</div>
        )}
      </div>
    </div>
  );
}
