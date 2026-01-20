import React from "react";
import { apiFetch } from "../api";

function todayISO() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export default function Slots() {
  const [courts, setCourts] = React.useState([]);
  const [courtId, setCourtId] = React.useState("");
  const [date, setDate] = React.useState(todayISO());
  const [slots, setSlots] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [payingSlotId, setPayingSlotId] = React.useState(null);

  async function bookAndPay(slot_id) {
    setPayingSlotId(slot_id);
    try {
        // 1) create booking (PENDING_PAYMENT)
        const booking = await apiFetch("/bookings", { method: "POST", body: { slot_id } });

        // 2) start stripe checkout (returns checkout_url)
        const pay = await apiFetch("/payments/start", {
        method: "POST",
        body: { booking_id: booking.id },
        });

        // 3) redirect to Stripe
        window.location.href = pay.checkout_url;
    } catch (e) {
        alert(e.message);
    } finally {
        setPayingSlotId(null);
    }
    }

  async function loadCourts() {
    const data = await apiFetch("/courts");
    setCourts(data);
  }

  async function loadSlots() {
    setLoading(true);
    try {
      const qs = new URLSearchParams();
      if (courtId) qs.set("court_id", courtId);
      if (date) qs.set("date", date);

      const data = await apiFetch(`/slots?${qs.toString()}`);
      setSlots(data);
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    loadCourts().catch((e) => alert(e.message));
  }, []);

  React.useEffect(() => {
    loadSlots().catch((e) => alert(e.message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courtId, date]);

  return (
    <div>
      <h2>Slots</h2>

      <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 12, flexWrap: "wrap" }}>
        <label>
          Court&nbsp;
          <select value={courtId} onChange={(e) => setCourtId(e.target.value)}>
            <option value="">All courts</option>
            {courts.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} (#{c.id})
              </option>
            ))}
          </select>
        </label>

        <label>
          Date&nbsp;
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </label>

        <button onClick={() => loadSlots().catch((e) => alert(e.message))}>
          Refresh
        </button>
      </div>

      {loading && <div>Loading slots...</div>}

      <div style={{ display: "grid", gap: 10 }}>
        {slots.map((s) => (
          <div
            key={s.id}
            style={{
              border: "1px solid #ddd",
              borderRadius: 10,
              padding: 12,
              display: "flex",
              justifyContent: "space-between",
              gap: 12,
              alignItems: "center",
            }}
          >
            <div>
              <div style={{ fontWeight: 700 }}>
                Slot #{s.id} — Court {s.court_id}
              </div>
              <div style={{ fontSize: 14 }}>
                {s.start_time} → {s.end_time}
              </div>
              <div style={{ fontSize: 14 }}>Price: {s.price} NPR</div>
              <div style={{ marginTop: 6 }}>
                <span
                  style={{
                    padding: "2px 8px",
                    borderRadius: 999,
                    border: "1px solid #ddd",
                    fontSize: 12,
                  }}
                >
                  {s.available ? "Available" : "Booked"}
                </span>
              </div>
            </div>

            <button
                disabled={!s.available || payingSlotId === s.id}
                onClick={() => bookAndPay(s.id)}
                title={!s.available ? "Already booked" : "Book and pay via Stripe"}
                >
                {payingSlotId === s.id ? "Redirecting..." : "Book & Pay"}
            </button>

          </div>
        ))}

        {!loading && slots.length === 0 && (
          <div style={{ color: "#666" }}>No slots found for this filter.</div>
        )}
      </div>
    </div>
  );
}
