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

  const [courts, setCourts] = React.useState([]);

  // court form
  const [courtName, setCourtName] = React.useState("");
  const [courtLocation, setCourtLocation] = React.useState("");

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

  React.useEffect(() => {
    loadCourts();
  }, []);

  async function createCourt() {
    try {
      await apiFetch("/courts", {
        method: "POST",
        body: { name: courtName, location: courtLocation || null },
      });
      setCourtName("");
      setCourtLocation("");
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
  if (!isStaff) return <div>Admin/Staff only.</div>;

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <h2>Admin</h2>

      <div style={{ border: "1px solid #ddd", borderRadius: 10, padding: 12 }}>
        <h3 style={{ marginTop: 0 }}>Create court</h3>
        <div style={{ display: "grid", gap: 10, maxWidth: 420 }}>
          <input
            placeholder="Court name (unique)"
            value={courtName}
            onChange={(e) => setCourtName(e.target.value)}
          />
          <input
            placeholder="Location (optional)"
            value={courtLocation}
            onChange={(e) => setCourtLocation(e.target.value)}
          />
          <button onClick={createCourt} disabled={!courtName.trim()}>
            Create court
          </button>
        </div>
      </div>

      <div style={{ border: "1px solid #ddd", borderRadius: 10, padding: 12 }}>
        <h3 style={{ marginTop: 0 }}>Create slot</h3>

        <div style={{ display: "grid", gap: 10, maxWidth: 520 }}>
          <label>
            Court
            <select value={courtId} onChange={(e) => setCourtId(e.target.value)}>
              <option value="">Select a court</option>
              {courts.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} (#{c.id})
                </option>
              ))}
            </select>
          </label>

          <label>
            Start time
            <input
              type="datetime-local"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />
          </label>

          <label>
            End time
            <input
              type="datetime-local"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
            />
          </label>

          <label>
            Price (NPR)
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              min="0"
            />
          </label>

          <button onClick={createSlot} disabled={!courtId}>
            Create slot
          </button>
        </div>

        <p style={{ marginTop: 10, color: "#666", fontSize: 13 }}>
          Tip: Times are entered in your local timezone.
        </p>
      </div>
    </div>
  );
}
