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
    <div className="stack">
      <div className="row">
        <div className="stack-tight">
          <h2>Slots</h2>
          <p className="subtle-text">Filter by court and date to find availability.</p>
        </div>
      </div>

      <div className="toolbar">
        <div className="field">
          <label>
            Court
            <select value={courtId} onChange={(e) => setCourtId(e.target.value)}>
              <option value="">All courts</option>
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
            Date
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </label>
        </div>

        <button className="btn btn-ghost" onClick={() => loadSlots().catch((e) => alert(e.message))}>
          Refresh
        </button>
      </div>

      {loading && <div className="subtle-text">Loading slots...</div>}

      <div className="grid-list">
        {slots.map((s) => (
          <div key={s.id} className="list-item row" style={{ justifyContent: "space-between" }}>
            <div className="stack-tight">
              <div style={{ fontWeight: 700 }}>
                Court {s.court_id}
              </div>
              <div className="meta">
                {s.start_time} → {s.end_time}
              </div>
              <div className="meta">Price: {s.price} NPR</div>
              <div>
                <span className={`pill ${s.available ? "pill-success" : "pill-muted"}`}>
                  {s.available ? "Available" : "Booked"}
                </span>
              </div>
            </div>

            <button
              className="btn btn-primary"
              disabled={!s.available || payingSlotId === s.id}
              onClick={() => bookAndPay(s.id)}
              title={!s.available ? "Already booked" : "Book and pay via Stripe"}
            >
              {payingSlotId === s.id ? "Redirecting..." : "Book & Pay"}
            </button>
          </div>
        ))}

        {!loading && slots.length === 0 && (
          <div className="subtle-text">No slots found for this filter.</div>
        )}
      </div>
    </div>
  );
}
