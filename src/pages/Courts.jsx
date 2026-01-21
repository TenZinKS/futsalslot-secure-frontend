import React from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../api";

export default function Courts() {
  const [courts, setCourts] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [userLat, setUserLat] = React.useState("");
  const [userLng, setUserLng] = React.useState("");
  const [maxDistanceKm, setMaxDistanceKm] = React.useState("");
  const [locationQuery, setLocationQuery] = React.useState("");
  const [locating, setLocating] = React.useState(false);
  const [locationError, setLocationError] = React.useState("");

  async function loadCourts() {
    setLoading(true);
    try {
      const qs = new URLSearchParams();
      if (userLat && userLng) {
        qs.set("user_lat", userLat);
        qs.set("user_lng", userLng);
      }
      if (maxDistanceKm) qs.set("max_distance_km", maxDistanceKm);
      const url = qs.toString() ? `/courts?${qs.toString()}` : "/courts";
      const data = await apiFetch(url);
      setCourts(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  }

  function useMyLocation() {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by this browser.");
      return;
    }
    setLocating(true);
    setLocationError("");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLat(pos.coords.latitude.toFixed(6));
        setUserLng(pos.coords.longitude.toFixed(6));
        setLocating(false);
      },
      () => {
        setLocationError("Unable to access your location.");
        setLocating(false);
      }
    );
  }

  function formatDistance(value) {
    if (value === null || value === undefined) return null;
    const km = Number(value);
    if (Number.isNaN(km)) return null;
    return `${km.toFixed(1)} km`;
  }

  React.useEffect(() => {
    loadCourts().catch(() => setCourts([]));
  }, []);

  return (
    <div className="stack">
      <div className="row" style={{ justifyContent: "space-between" }}>
        <div className="stack-tight">
          <h2>Courts</h2>
          <p className="subtle-text">Browse all futsal courts and view locations.</p>
        </div>
        <button className="btn btn-ghost" onClick={loadCourts} disabled={loading}>
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      <div className="toolbar">
        <div className="field">
          <label>
            Location
            <input
              value={locationQuery}
              onChange={(e) => setLocationQuery(e.target.value)}
              placeholder="Search by area or name"
            />
          </label>
        </div>
        <div className="field">
          <label>
            Max distance (km)
            <input
              type="number"
              min="1"
              value={maxDistanceKm}
              onChange={(e) => setMaxDistanceKm(e.target.value)}
              placeholder="e.g. 5"
            />
          </label>
        </div>
        <div className="row">
          <button className="btn btn-ghost" onClick={useMyLocation} disabled={locating}>
            {locating ? "Locating..." : "Use my location"}
          </button>
          <button className="btn btn-primary" onClick={loadCourts} disabled={loading}>
            Apply filter
          </button>
        </div>
      </div>

      {locationError && <div className="subtle-text">{locationError}</div>}

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
              <div style={{ fontWeight: 700 }}>{c.name}</div>
              <div className="row">
                <Link className="btn btn-ghost" to={`/slots?court_id=${c.id}`}>
                  View slots
                </Link>
                {c.maps_link && (
                  <a className="slot-link" href={c.maps_link} target="_blank" rel="noreferrer">
                    Google Maps
                  </a>
                )}
              </div>
            </div>
            {c.location && <div className="meta">{c.location}</div>}
            {c.description && <div className="meta">{c.description}</div>}
            {formatDistance(c.distance_km) && (
              <div className="meta">Distance: {formatDistance(c.distance_km)}</div>
            )}
          </div>
        ))}

        {!loading && courts.length === 0 && (
          <div className="subtle-text">No courts available yet.</div>
        )}
      </div>
    </div>
  );
}
