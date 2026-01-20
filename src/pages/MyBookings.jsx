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
    <div>
      <h2>My bookings</h2>
      <button onClick={load} disabled={loading} style={{ marginBottom: 12 }}>
        {loading ? "Refreshing..." : "Refresh"}
      </button>

      <div style={{ display: "grid", gap: 10 }}>
        {rows.map((b) => (
          <div key={b.id} style={{ border: "1px solid #ddd", borderRadius: 10, padding: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
              <div>
                <b>Booking #{b.id}</b>
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                <span style={{ padding: "2px 8px", border: "1px solid #ddd", borderRadius: 999, fontSize: 12 }}>
                  {b.status}
                </span>
                <button
                  onClick={() => cancelBooking(b.id)}
                  disabled={!!b.cancelled_at || b.status === "CANCELLED" || cancellingId === b.id}
                  title={b.cancelled_at || b.status === "CANCELLED" ? "Already cancelled" : "Cancel booking"}
                >
                  {cancellingId === b.id ? "Cancelling..." : "Cancel"}
                </button>
              </div>
            </div>

            <div style={{ fontSize: 14, marginTop: 6 }}>
              Created: {b.created_at}
            </div>

            {b.cancelled_at && (
              <div style={{ fontSize: 14 }}>
                Cancelled: {b.cancelled_at}
              </div>
            )}

            {b.slot && (
              <div style={{ marginTop: 8, fontSize: 14 }}>
                <div>
                  Slot: <b>{b.slot.start_time}</b> → <b>{b.slot.end_time}</b>
                </div>
                <div>
                  Court ID: {b.slot.court_id} | Price: {b.slot.price} NPR
                </div>
              </div>
            )}
          </div>
        ))}

        {!loading && rows.length === 0 && (
          <div style={{ color: "#666" }}>No bookings yet.</div>
        )}
      </div>
    </div>
  );
}
