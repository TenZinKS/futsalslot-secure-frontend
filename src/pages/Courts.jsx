import React from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../api";

export default function Courts({ me }) {
  const [courts, setCourts] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [locationQuery, setLocationQuery] = React.useState("");

  async function loadCourts() {
    setLoading(true);
    setError("");
    try {
      const base = me ? "/courts" : "/public/courts";
      const data = await apiFetch(base);
      const normalized = Array.isArray(data)
        ? data
        : Array.isArray(data?.courts)
          ? data.courts
          : [];
      setCourts(normalized);
    } catch (e) {
      setCourts([]);
      setError(e.message || "Unable to load courts.");
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    loadCourts();
  }, [me]);


  return (
    <div className="stack">
      <div className="row" style={{ justifyContent: "space-between" }}>
        <div className="stack-tight">
          <h2>Courts</h2>
          <p className="subtle-text">Browse all courts and view locations.</p>
        </div>
        <button className="btn btn-ghost" onClick={loadCourts} disabled={loading}>
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      <div className="toolbar">
        <div className="field">
          <label>
            Search courts
            <input
              value={locationQuery}
              onChange={(e) => setLocationQuery(e.target.value)}
              placeholder="Search by court name or area"
            />
          </label>
        </div>
      </div>

      {error && <div className="subtle-text">{error}</div>}

      <div className="grid-list">
        {courts
          .filter((c) => {
            if (!locationQuery.trim()) return true;
            const q = locationQuery.trim().toLowerCase();
            return (
              (c.location || "").toLowerCase().includes(q) ||
              (c.name || "").toLowerCase().includes(q) ||
              (c.description || "").toLowerCase().includes(q)
            );
          })
          .map((c) => (
          <div key={c.id} className="list-item stack">
            <div className="row" style={{ justifyContent: "space-between" }}>
              <div style={{ fontWeight: 700 }}>
                Court name: {c.name || `Court ${c.id}`}
              </div>
              <div className="row">
                <Link className="btn btn-ghost" to={`/slots?court_id=${c.id}`}>
                  View slots
                </Link>
                {c.maps_link && (
                  <a className="slot-link" href={c.maps_link} target="_blank" rel="noreferrer">
                    Open in Google Maps
                  </a>
                )}
              </div>
            </div>
            {c.location && <div className="meta">Location: {c.location}</div>}
            {c.description && <div className="meta">Details: {c.description}</div>}
          </div>
        ))}

        {!loading && courts.length === 0 && (
          <div className="subtle-text">No courts available yet.</div>
        )}
      </div>
    </div>
  );
}
