import React from "react";
import { apiFetch } from "../api";

export default function MyBookings() {
  const [rows, setRows] = React.useState([]);
  const [loading, setLoading] = React.useState(false);

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
              <span style={{ padding: "2px 8px", border: "1px solid #ddd", borderRadius: 999, fontSize: 12 }}>
                {b.status}
              </span>
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
