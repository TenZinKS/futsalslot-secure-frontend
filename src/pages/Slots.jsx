import React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { apiFetch } from "../api";
import { formatDate, formatTime } from "../utils/date";

function todayISO() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export default function Slots({ me }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [courts, setCourts] = React.useState([]);
  const [courtId, setCourtId] = React.useState(searchParams.get("court_id") || "");
  const [date, setDate] = React.useState(todayISO());
  const [slots, setSlots] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [payingSlotId, setPayingSlotId] = React.useState(null);
  const nav = useNavigate();
  const isStaffAccount = me?.roles?.some((role) =>
    ["ADMIN", "SUPER_ADMIN"].includes(role)
  );

  async function bookAndPay(slot_id) {
    if (!me) {
      nav("/login", { state: { from: "/slots" } });
      return;
    }
    if (isStaffAccount) {
      alert("Booking is only available for player accounts.");
      return;
    }
    setPayingSlotId(slot_id);
    try {
        // start stripe checkout (returns checkout_url)
        const pay = await apiFetch("/payments/start", {
          method: "POST",
          body: { slot_id },
        });

        // redirect to Stripe
        window.location.href = pay.checkout_url;
    } catch (e) {
        if (e.status === 401) {
          nav("/login", { state: { from: "/slots" } });
          return;
        }
        alert(e.message);
    } finally {
        setPayingSlotId(null);
    }
    }

  async function loadCourts() {
    const data = await apiFetch(me ? "/courts" : "/public/courts");
    const normalized = Array.isArray(data)
      ? data
      : Array.isArray(data?.courts)
        ? data.courts
        : [];
    setCourts(normalized);
  }

  async function loadSlots() {
    setLoading(true);
    try {
      const qs = new URLSearchParams();
      if (courtId) qs.set("court_id", courtId);
      if (date) qs.set("date", date);

      const base = me ? "/slots" : "/public/slots";
      const data = await apiFetch(`${base}?${qs.toString()}`);
      setSlots(data);
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    loadCourts().catch((e) => alert(e.message));
  }, [me]);

  React.useEffect(() => {
    loadSlots().catch((e) => alert(e.message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courtId, date, me]);

  React.useEffect(() => {
    const param = searchParams.get("court_id") || "";
    if (param !== courtId) setCourtId(param);
  }, [searchParams, courtId]);

  function getMapsLink(court) {
    if (!court) return null;
    if (court.maps_link) return court.maps_link;
    const query = court.location || court.name;
    if (!query) return null;
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
  }

  return (
    <div className="stack">
      <div className="row">
        <div className="stack-tight">
          <h2>Slots</h2>
          <p className="subtle-text">Filter by court and date to find availability.</p>
          {!me && (
            <p className="meta">Login is required only when you book a slot.</p>
          )}
          {isStaffAccount && (
            <p className="meta">Admin accounts cannot book slots.</p>
          )}
          <p className="meta">Stripe checkout is available for payments.</p>
        </div>
      </div>

      <div className="toolbar">
        <div className="field">
          <label>
            Court
            <select
              value={courtId}
              onChange={(e) => {
                const next = e.target.value;
                setCourtId(next);
                if (next) {
                  setSearchParams({ court_id: next });
                } else {
                  setSearchParams({});
                }
              }}
            >
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
          <div key={s.id} className="list-item row slot-item">
            <div className="stack-tight slot-meta">
              {(() => {
                const court = courts.find((c) => c.id === s.court_id);
                const mapsLink = getMapsLink(court);
                return (
                  <>
                    <div style={{ fontWeight: 700 }}>
                      Court name: {court?.name || `Court ${s.court_id}`}
                    </div>
                    {court?.location && <div className="meta">Location: {court.location}</div>}
                    {court?.description && <div className="meta">Details: {court.description}</div>}
                    {mapsLink && (
                      <a className="slot-link" href={mapsLink} target="_blank" rel="noreferrer">
                        View on Google Maps
                      </a>
                    )}
                  </>
                );
              })()}
              <div className="meta">
                Date: {formatDate(s.start_time)}
              </div>
              <div className="meta">
                Time: {formatTime(s.start_time)} → {formatTime(s.end_time)}
              </div>
              <div className="meta">Price: {s.price} NPR</div>
              <div>
                <span className={`pill ${s.available ? "pill-success" : "pill-muted"}`}>
                  {s.available ? "Available" : "Booked"}
                </span>
              </div>
            </div>

            <div className="row">
              <button
                className="btn btn-primary"
                disabled={!s.available || payingSlotId === s.id || isStaffAccount}
                onClick={() => bookAndPay(s.id)}
                title={
                  !s.available
                    ? "Already booked"
                    : isStaffAccount
                      ? "Admin accounts cannot book"
                      : me
                        ? "Book and pay via Stripe"
                        : "Login to book"
                }
              >
                {payingSlotId === s.id
                  ? "Redirecting..."
                  : isStaffAccount
                    ? "Admin account"
                    : me
                      ? "Book & Pay"
                      : "Login to book"}
              </button>
            </div>
          </div>
        ))}

        {!loading && slots.length === 0 && (
          <div className="subtle-text">No slots found for this filter.</div>
        )}
      </div>
    </div>
  );
}
