import React from "react";
import { apiFetch } from "../api";
import { formatDateTime, formatDate, formatTime } from "../utils/date";

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
    me?.roles?.includes("ADMIN");

  const [courts, setCourts] = React.useState([]);
  const [courtMap, setCourtMap] = React.useState({});
  const [userMap, setUserMap] = React.useState({});
  const [bookings, setBookings] = React.useState([]);
  const [loadingBookings, setLoadingBookings] = React.useState(false);
  const [cancellingBookingId, setCancellingBookingId] = React.useState(null);

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
      const list = Array.isArray(data) ? data : [];
      setCourts(list);
      const next = {};
      list.forEach((court) => {
        if (court?.id) next[court.id] = court;
      });
      setCourtMap(next);
    } catch (e) {
      // if not logged in or no access, keep empty
      setCourts([]);
      setCourtMap({});
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

  async function loadUsers() {
    try {
      const data = await apiFetch("/admin/users?role=PLAYER");
      const list = Array.isArray(data) ? data : [];
      const next = {};
      list.forEach((user) => {
        if (user?.id) next[user.id] = user;
      });
      setUserMap(next);
    } catch {
      setUserMap({});
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

  React.useEffect(() => {
    loadCourts();
    loadBookings();
    loadUsers();
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
        <h2>Venue Admin</h2>
        <p className="subtle-text">Admin access only.</p>
        <div className="row">
          <a className="btn btn-primary" href="/admin-login">
            Go to admin login
          </a>
          <a className="btn btn-ghost" href="/admin-register">
            Create admin account
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="stack admin-shell">
      <div className="admin-banner">
        <div>
          <h2>Venue Admin</h2>
          <p className="subtle-text">Create courts, manage slots, and review bookings.</p>
        </div>
        <span className="pill pill-muted">Owner/Staff</span>
      </div>

      <div className="row">
        <a className="btn btn-ghost" href="#create-court">Create court</a>
        <a className="btn btn-ghost" href="#create-slot">Create slot</a>
        <a className="btn btn-primary" href="#bookings">Bookings</a>
      </div>

      <section className="section-card stack">
        <h3 className="section-title">Start here</h3>
        <div className="grid-list">
          <div className="list-item stack">
            <div style={{ fontWeight: 700 }}>1) Create courts</div>
            <div className="meta">Add court details so players can see your venue.</div>
          </div>
          <div className="list-item stack">
            <div style={{ fontWeight: 700 }}>2) Create slots</div>
            <div className="meta">Set availability and pricing for each court.</div>
          </div>
          <div className="list-item stack">
            <div style={{ fontWeight: 700 }}>3) Review bookings</div>
            <div className="meta">Monitor bookings and cancel if needed.</div>
          </div>
        </div>
      </section>

      <section className="section-card stack" id="create-court">
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

      <section className="section-card stack" id="create-slot">
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

      <section className="section-card stack" id="bookings">
        <div className="row" style={{ justifyContent: "space-between" }}>
          <h3 className="section-title">Recent bookings</h3>
          <button className="btn btn-ghost" onClick={loadBookings} disabled={loadingBookings}>
            {loadingBookings ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        <div className="grid-list">
          {bookings.map((b) => {
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
                        className="btn btn-danger"
                        onClick={() => adminCancelBooking(b)}
                        disabled={status !== "CONFIRMED" || cancellingBookingId === b.id}
                        title={
                          status !== "CONFIRMED"
                            ? "Only CONFIRMED bookings can be cancelled"
                            : "Cancel booking"
                        }
                      >
                        {cancellingBookingId === b.id ? "Cancelling..." : "Cancel booking"}
                      </button>
                    )}
                  </div>
                </div>

                {b.cancelled_at && (
                  <div className="meta">
                    Cancelled: {formatDateTime(b.cancelled_at)}
                  </div>
                )}

                <div className="stack-tight">
                  <div>
                    Player:{" "}
                    <b>
                      {b.user_full_name ||
                        b.user?.full_name ||
                        userMap[b.user_id]?.full_name ||
                        "Not provided"}
                    </b>
                  </div>
                  <div className="meta">
                    Phone: {b.user_phone_number || b.user?.phone_number || userMap[b.user_id]?.phone_number || "Not provided"}
                  </div>
                  <div className="meta">
                    Email: {b.player_email || b.user_email || b.user?.email || b.player?.email || b.email || userMap[b.user_id]?.email || "Not provided"}
                  </div>
                </div>

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
                      Court ID: {b.slot.court_id} · Price: {b.slot.price} NPR
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {!loadingBookings && bookings.length === 0 && (
            <div className="subtle-text">No bookings yet.</div>
          )}
        </div>
      </section>
    </div>
  );
}
