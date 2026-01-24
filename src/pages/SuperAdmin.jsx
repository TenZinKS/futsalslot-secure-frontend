import React from "react";
import { apiFetch } from "../api";
import { formatDateTime } from "../utils/date";

function normalizeStatus(value) {
  return (value || "").toUpperCase();
}

function normalizeRole(role) {
  if (!role) return "";
  if (role === "OWNER") return "ADMIN";
  if (["SUPER_ADMIN", "ADMIN", "PLAYER"].includes(role)) return role;
  return "";
}

function formatRoleLabel(role) {
  const normalized = normalizeRole(role);
  if (!normalized) return "";
  if (normalized === "SUPER_ADMIN") return "Superadmin";
  if (normalized === "ADMIN") return "Admin";
  if (normalized === "PLAYER") return "Player";
  return normalized;
}

function formatRoles(input) {
  const roles = Array.isArray(input) ? input : input ? [input] : [];
  const labeled = roles
    .map((role) => formatRoleLabel(role))
    .filter(Boolean);
  return labeled.length > 0 ? labeled.join(", ") : "";
}

function resolveVerificationStatus(user) {
  const status =
    user?.status ??
    user?.verification_status ??
    user?.admin_status ??
    user?.court_status ??
    user?.court?.status ??
    user?.futsal?.status ??
    "";
  return normalizeStatus(status);
}

function mergeCourts(profileCourts, courtAccess) {
  const map = new Map();
  (profileCourts || []).forEach((court) => {
    if (!court) return;
    const key = court.id ?? court.court_id ?? court.name ?? JSON.stringify(court);
    map.set(key, { ...court });
  });
  (courtAccess || []).forEach((court) => {
    if (!court) return;
    const key = court.id ?? court.court_id ?? court.name ?? JSON.stringify(court);
    const existing = map.get(key) || {};
    map.set(key, { ...existing, ...court });
  });
  return Array.from(map.values());
}

export default function SuperAdmin({ me }) {
  const isSuperAdmin = me?.roles?.includes("SUPER_ADMIN");

  const [requests, setRequests] = React.useState([]);
  const [players, setPlayers] = React.useState([]);
  const [admins, setAdmins] = React.useState([]);
  const [blockedEmails, setBlockedEmails] = React.useState([]);
  const [blockedEmailInput, setBlockedEmailInput] = React.useState("");
  const [blockedReason, setBlockedReason] = React.useState("");
  const [supportMessages, setSupportMessages] = React.useState([]);
  const [adminDetails, setAdminDetails] = React.useState({});
  const [loadingCourtsFor, setLoadingCourtsFor] = React.useState({});

  const [loadingRequests, setLoadingRequests] = React.useState(false);
  const [loadingPlayers, setLoadingPlayers] = React.useState(false);
  const [loadingAdmins, setLoadingAdmins] = React.useState(false);
  const [loadingBlocked, setLoadingBlocked] = React.useState(false);
  const [loadingSupport, setLoadingSupport] = React.useState(false);

  const [requestError, setRequestError] = React.useState("");
  const [playersError, setPlayersError] = React.useState("");
  const [adminsError, setAdminsError] = React.useState("");
  const [blockedError, setBlockedError] = React.useState("");
  const [supportError, setSupportError] = React.useState("");

  async function loadRequests() {
    setLoadingRequests(true);
    setRequestError("");
    try {
      const data = await apiFetch("/super-admin/requests?status=PENDING");
      const list = Array.isArray(data)
        ? data
        : Array.isArray(data?.requests)
          ? data.requests
          : Array.isArray(data?.data)
            ? data.data
            : [];
      setRequests(list);
    } catch (e) {
      setRequestError(e.message || "Unable to load requests.");
      setRequests([]);
    } finally {
      setLoadingRequests(false);
    }
  }

  async function loadPlayers() {
    setLoadingPlayers(true);
    setPlayersError("");
    try {
      const data = await apiFetch("/admin/users?role=PLAYER");
      const list = Array.isArray(data) ? data : [];
      const filtered = list.filter((user) => {
        const roles = Array.isArray(user?.roles) ? user.roles : [user?.role].filter(Boolean);
        const normalized = roles.map(normalizeRole).filter(Boolean);
        const status = resolveVerificationStatus(user);
        const isAdminish = normalized.some((r) => ["ADMIN", "SUPER_ADMIN"].includes(r));
        const isRejected = status === "REJECTED";
        const isPending = status === "PENDING";
        if (isAdminish) return false;
        if (isRejected || isPending) return false;
        return true;
      });
      setPlayers(filtered);
    } catch (e) {
      setPlayersError(e.message || "Unable to load players.");
      setPlayers([]);
    } finally {
      setLoadingPlayers(false);
    }
  }

  async function loadAdmins() {
    setLoadingAdmins(true);
    setAdminsError("");
    try {
      const data = await apiFetch("/super-admin/admins");
      const list = Array.isArray(data) ? data : [];
      const filtered = list.filter((user) => {
        const status = resolveVerificationStatus(user);
        if (!status) return true;
        return status === "VERIFIED" || status === "APPROVED";
      });
      setAdmins(filtered);
    } catch (e) {
      setAdminsError(e.message || "Unable to load admins.");
      setAdmins([]);
    } finally {
      setLoadingAdmins(false);
    }
  }

  async function loadBlockedEmails() {
    setLoadingBlocked(true);
    setBlockedError("");
    try {
      const data = await apiFetch("/super-admin/blocked-emails");
      setBlockedEmails(Array.isArray(data) ? data : []);
    } catch (e) {
      setBlockedError(e.message || "Unable to load blocked emails.");
      setBlockedEmails([]);
    } finally {
      setLoadingBlocked(false);
    }
  }

  async function loadSupportMessages() {
    setLoadingSupport(true);
    setSupportError("");
    try {
      const data = await apiFetch("/super-admin/support-messages");
      setSupportMessages(Array.isArray(data) ? data : []);
    } catch (e) {
      setSupportError(e.message || "Unable to load support messages.");
      setSupportMessages([]);
    } finally {
      setLoadingSupport(false);
    }
  }

  async function updateSupportStatus(msgId, status) {
    try {
      await apiFetch(`/super-admin/support-messages/${msgId}/status`, {
        method: "POST",
        body: { status },
      });
      await loadSupportMessages();
    } catch (e) {
      alert(e.message);
    }
  }

  function resolveAdminId(user) {
    if (!user) return "";
    return (
      user.id ??
      user.user_id ??
      user.userId ??
      user.admin_id ??
      user.adminId ??
      ""
    );
  }

  async function loadAdminCourts(userId) {
    if (!userId) return;
    setLoadingCourtsFor((prev) => ({ ...prev, [userId]: true }));
    try {
      const data = await apiFetch(`/super-admin/admins/${userId}`);
      const profileCourts = Array.isArray(data?.courts)
        ? data.courts
        : Array.isArray(data?.futsals)
          ? data.futsals
          : [];
      setAdminDetails((prev) => ({
        ...prev,
        [userId]: {
          futsals: profileCourts,
          courts: Array.isArray(data?.courts) ? data.courts : [],
          loaded: true,
        },
      }));
    } catch (e) {
      alert(e.message);
      setAdminDetails((prev) => ({
        ...prev,
        [userId]: { futsals: [], courts: [], loaded: true },
      }));
    } finally {
      setLoadingCourtsFor((prev) => ({ ...prev, [userId]: false }));
    }
  }

  function handleToggleCourt(court, ownerId) {
    const action = court.is_active ? "block" : "unblock";
    apiFetch(`/super-admin/courts/${court.id}/${action}`, {
      method: "POST",
    })
      .then(() => loadAdminCourts(ownerId))
      .catch((e) => alert(e.message));
  }

  async function blockEmail() {
    if (!blockedEmailInput.trim()) {
      alert("Email is required.");
      return;
    }
    try {
      await apiFetch("/super-admin/blocked-emails", {
        method: "POST",
        body: {
          email: blockedEmailInput.trim(),
          reason: blockedReason.trim() || undefined,
        },
      });
      setBlockedEmailInput("");
      setBlockedReason("");
      await loadBlockedEmails();
      alert("Email blocked.");
    } catch (e) {
      alert(e.message);
    }
  }

  async function blockEmailAddress(email) {
    if (!email) return;
    try {
      await apiFetch("/super-admin/blocked-emails", {
        method: "POST",
        body: { email },
      });
      await loadBlockedEmails();
      alert("Email blocked.");
    } catch (e) {
      alert(e.message);
    }
  }

  async function unblockEmail(id) {
    try {
      await apiFetch(`/super-admin/blocked-emails/${id}`, { method: "DELETE" });
      await loadBlockedEmails();
      alert("Email unblocked.");
    } catch (e) {
      alert(e.message);
    }
  }

  function findBlockedRecord(email) {
    if (!email) return null;
    const needle = email.trim().toLowerCase();
    return blockedEmails.find((row) => (row.email || "").trim().toLowerCase() === needle) || null;
  }

  async function updateCourtStatus(court, status) {
    const courtId = court.id ?? court.court_id ?? court.futsal_id;
    if (!courtId) {
      alert("Court ID not found.");
      return;
    }
    try {
      const body = { status };
      if (status === "REJECTED") {
        const reason = prompt("Rejection reason (optional):");
        if (reason === null) return;
        if (reason.trim()) body.reason = reason.trim();
      }
      await apiFetch(`/admin/courts/${courtId}/verify`, {
        method: "POST",
        body,
      });
      await loadRequests();
      alert(`Court ${status.toLowerCase()}.`);
    } catch (e) {
      alert(e.message);
    }
  }

  React.useEffect(() => {
    loadRequests();
    loadPlayers();
    loadAdmins();
    loadBlockedEmails();
    loadSupportMessages();
  }, []);

  if (!me) return <div>Please login first.</div>;
  if (!isSuperAdmin) {
    return (
      <div className="section-card admin-shell">
        <h2>Super Admin</h2>
        <p className="subtle-text">Super admin access only.</p>
        <div className="row">
          <a className="btn btn-primary" href="/superadmin-login">
            Go to super admin login
          </a>
          <a className="btn btn-ghost" href="/admin-login">
            Staff admin login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="stack admin-shell superadmin-shell">
      <div className="admin-banner">
        <div>
          <h2>Super Admin Console</h2>
          <p className="subtle-text">Verify court requests and monitor users.</p>
        </div>
        <span className="pill pill-muted">Super Admin</span>
      </div>

      <section className="section-card stack">
        <h3 className="section-title">Start here</h3>
        <div className="grid-list">
          <div className="list-item stack">
            <div style={{ fontWeight: 700 }}>
              Pending requests
            </div>
            <div className="meta">
              Review and verify new court registrations first.
            </div>
            <div className="meta">Open: {requests.length}</div>
          </div>
          <div className="list-item stack">
            <div style={{ fontWeight: 700 }}>Players</div>
            <div className="meta">Monitor registered player accounts.</div>
            <div className="meta">Total: {players.length}</div>
          </div>
          <div className="list-item stack">
            <div style={{ fontWeight: 700 }}>Admins</div>
            <div className="meta">Verified admin accounts.</div>
            <div className="meta">Total: {admins.length}</div>
          </div>
          <div className="list-item stack">
            <div style={{ fontWeight: 700 }}>Blocked emails</div>
            <div className="meta">Prevent access for specific addresses.</div>
            <div className="meta">Total: {blockedEmails.length}</div>
          </div>
          <div className="list-item stack">
            <div style={{ fontWeight: 700 }}>Support messages</div>
            <div className="meta">Player reports and issues.</div>
            <div className="meta">Open: {supportMessages.length}</div>
          </div>
        </div>
      </section>

      <section className="section-card stack">
        <div className="row" style={{ justifyContent: "space-between" }}>
          <div className="stack-tight">
            <h3 className="section-title">Verification requests</h3>
            <p className="subtle-text">Pending court registrations awaiting approval.</p>
          </div>
          <button className="btn btn-ghost" onClick={loadRequests} disabled={loadingRequests}>
            {loadingRequests ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {requestError && <div className="subtle-text">{requestError}</div>}

        <div className="grid-list">
          {requests.map((item) => {
            const court = item.court || item.futsal || {};
            const owner = item.owner || {};
            const status = normalizeStatus(court.status);
            const isVerified = status === "VERIFIED";
            const isRejected = status === "REJECTED";
            return (
              <div key={court.id || court.name || owner.email} className="list-item stack">
                <div className="row" style={{ justifyContent: "space-between" }}>
                  <div style={{ fontWeight: 700 }}>
                    {court.name || `Court #${court.id || "n/a"}`}
                  </div>
                  <span className={`pill ${isVerified ? "pill-success" : "pill-muted"}`}>
                    {status || "PENDING"}
                  </span>
                </div>
                {court.location && <div className="meta">Location: {court.location}</div>}
                {court.maps_link && (
                  <div className="meta">
                    Maps:{" "}
                    <a className="slot-link" href={court.maps_link} target="_blank" rel="noreferrer">
                      Open in Google Maps
                    </a>
                  </div>
                )}
                {owner.email || owner.full_name ? (
                  <>
                    <div className="meta">Owner: {owner.full_name || owner.email}</div>
                    {owner.email && <div className="meta">Email: {owner.email}</div>}
                    {owner.phone_number && <div className="meta">Phone: {owner.phone_number}</div>}
                  </>
                ) : null}
                <div className="row">
                  <button
                    className="btn btn-primary"
                    onClick={() => updateCourtStatus(court, "VERIFIED")}
                    disabled={isVerified}
                  >
                    {isVerified ? "Verified" : "Verify"}
                  </button>
                  <button
                    className="btn btn-ghost"
                    onClick={() => updateCourtStatus(court, "REJECTED")}
                    disabled={isRejected}
                  >
                    {isRejected ? "Rejected" : "Reject"}
                  </button>
                </div>
              </div>
            );
          })}

          {!loadingRequests && requests.length === 0 && (
            <div className="subtle-text">No pending requests.</div>
          )}
        </div>
      </section>

      <section className="section-card stack">
        <div className="row" style={{ justifyContent: "space-between" }}>
          <div className="stack-tight">
            <h3 className="section-title">Players</h3>
            <p className="subtle-text">Registered player accounts.</p>
          </div>
          <button className="btn btn-ghost" onClick={loadPlayers} disabled={loadingPlayers}>
            {loadingPlayers ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {playersError && <div className="subtle-text">{playersError}</div>}

        <div className="grid-list">
          {players.map((user) => (
            <div key={user.id || user.email} className="list-item stack">
              <div className="row" style={{ justifyContent: "space-between" }}>
                <div style={{ fontWeight: 700 }}>{user.email || user.full_name}</div>
                {(() => {
                  const blocked = user.blocked || findBlockedRecord(user.email);
                  const blockedRecord = findBlockedRecord(user.email);
                  return blocked ? (
                    <button
                      className="btn btn-ghost"
                      onClick={() => blockedRecord && unblockEmail(blockedRecord.id)}
                      disabled={!blockedRecord}
                      title={!blockedRecord ? "Refresh blocked list to unblock" : "Unblock email"}
                    >
                      Unblock
                    </button>
                  ) : (
                    <button
                      className="btn btn-ghost"
                      onClick={() => blockEmailAddress(user.email)}
                      disabled={!user.email}
                      title={!user.email ? "Email missing" : "Block email"}
                    >
                      Block
                    </button>
                  );
                })()}
              </div>
              {user.full_name && <div className="meta">Name: {user.full_name}</div>}
              {user.phone_number && <div className="meta">Phone: {user.phone_number}</div>}
              {user.created_at && (
                <div className="meta">Joined: {formatDateTime(user.created_at)}</div>
              )}
              {user.blocked && <div className="meta">Status: Blocked</div>}
            </div>
          ))}

          {!loadingPlayers && players.length === 0 && (
            <div className="subtle-text">No players found.</div>
          )}
        </div>
      </section>

      <section className="section-card stack">
        <div className="row" style={{ justifyContent: "space-between" }}>
          <div className="stack-tight">
            <h3 className="section-title">Admins</h3>
            <p className="subtle-text">Verified admin accounts.</p>
          </div>
          <button className="btn btn-ghost" onClick={loadAdmins} disabled={loadingAdmins}>
            {loadingAdmins ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {adminsError && <div className="subtle-text">{adminsError}</div>}

        <div className="grid-list">
          {admins.map((user) => {
            const roles = formatRoles(user.roles?.length ? user.roles : user.role);
            const adminId = resolveAdminId(user);
            const details = adminDetails[adminId] || { futsals: [], courts: [], loaded: false };
            const profileCourts =
              Array.isArray(details.futsals) && details.futsals.length > 0
                ? details.futsals
                : Array.isArray(details.courts)
                  ? details.courts
                  : [];
            const courtAccess = Array.isArray(details.courts)
              ? details.courts.filter((court) => typeof court.is_active === "boolean")
              : [];
            const mergedCourts = mergeCourts(profileCourts, courtAccess);
            return (
              <div key={adminId || user.email} className="list-item stack">
                <div className="row" style={{ justifyContent: "space-between" }}>
                  <div style={{ fontWeight: 700 }}>{user.email || user.full_name}</div>
                  <span className="pill pill-muted">{roles || "Admin"}</span>
                </div>
                <div className="row" style={{ justifyContent: "space-between" }}>
                  <div className="meta">Access control</div>
                  {(() => {
                    const blocked = user.blocked || findBlockedRecord(user.email);
                    const blockedRecord = findBlockedRecord(user.email);
                    return blocked ? (
                      <button
                        className="btn btn-ghost"
                        onClick={() => blockedRecord && unblockEmail(blockedRecord.id)}
                        disabled={!blockedRecord}
                        title={!blockedRecord ? "Refresh blocked list to unblock" : "Unblock email"}
                      >
                        Unblock
                      </button>
                    ) : (
                      <button
                        className="btn btn-ghost"
                        onClick={() => blockEmailAddress(user.email)}
                        disabled={!user.email}
                        title={!user.email ? "Email missing" : "Block email"}
                      >
                        Block
                      </button>
                    );
                  })()}
                </div>
                {user.full_name && <div className="meta">Name: {user.full_name}</div>}
                {user.phone_number && <div className="meta">Phone: {user.phone_number}</div>}
                {user.created_at && (
                  <div className="meta">Joined: {formatDateTime(user.created_at)}</div>
                )}
                {user.blocked && <div className="meta">Status: Blocked</div>}
                <div className="row">
                  <button
                    className="btn btn-ghost"
                    onClick={() => loadAdminCourts(adminId)}
                    disabled={!adminId || loadingCourtsFor[adminId]}
                    title={!adminId ? "Admin ID missing" : undefined}
                  >
                    {loadingCourtsFor[adminId] ? "Loading courts..." : "View court details"}
                  </button>
                </div>
                {mergedCourts.length > 0 && (
                  <div className="stack">
                    <div className="meta" style={{ fontWeight: 700 }}>
                      Courts ({mergedCourts.length})
                    </div>
                    {mergedCourts.map((court) => (
                      <div key={court.id || court.court_id || court.name} className="list-item stack">
                        <div className="row" style={{ justifyContent: "space-between" }}>
                          <div style={{ fontWeight: 700 }}>
                            {court.name || `Court #${court.id || "n/a"}`}
                          </div>
                          <div className="row">
                            <span className="pill pill-muted">
                              {normalizeStatus(court.status) || "PENDING"}
                            </span>
                            {typeof court.is_active === "boolean" && (
                              <span className={`pill ${court.is_active ? "pill-success" : "pill-muted"}`}>
                                {court.is_active ? "Active" : "Blocked"}
                              </span>
                            )}
                          </div>
                        </div>
                        {court.location && <div className="meta">Location: {court.location}</div>}
                        {court.created_at && (
                          <div className="meta">Created: {formatDateTime(court.created_at)}</div>
                        )}
                        {typeof court.is_active === "boolean" && (
                          <div className="row">
                            <button
                              className="btn btn-ghost"
                              onClick={() => handleToggleCourt(court, user.id)}
                            >
                              {court.is_active ? "Block court" : "Unblock court"}
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                {details.loaded && mergedCourts.length === 0 && (
                  <div className="meta">No courts found for this admin.</div>
                )}
              </div>
            );
          })}

          {!loadingAdmins && admins.length === 0 && (
            <div className="subtle-text">No admin accounts found.</div>
          )}
        </div>
      </section>

      <section className="section-card stack">
        <div className="row" style={{ justifyContent: "space-between" }}>
          <div className="stack-tight">
            <h3 className="section-title">Blocked emails</h3>
            <p className="subtle-text">Blocked emails cannot register, login, or receive emails.</p>
          </div>
          <button className="btn btn-ghost" onClick={loadBlockedEmails} disabled={loadingBlocked}>
            {loadingBlocked ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {blockedError && <div className="subtle-text">{blockedError}</div>}

        <div className="stack" style={{ maxWidth: 520 }}>
          <div className="field">
            <label>
              Email to block
              <input
                value={blockedEmailInput}
                onChange={(e) => setBlockedEmailInput(e.target.value)}
                placeholder="user@example.com"
                autoComplete="email"
              />
            </label>
          </div>
          <div className="field">
            <label>
              Reason (optional)
              <input
                value={blockedReason}
                onChange={(e) => setBlockedReason(e.target.value)}
                placeholder="Spam / abuse"
              />
            </label>
          </div>
          <button className="btn btn-primary" onClick={blockEmail} disabled={loadingBlocked}>
            Block email
          </button>
        </div>

        <div className="grid-list">
          {blockedEmails.map((item) => (
            <div key={item.id || item.email} className="list-item stack">
              <div className="row" style={{ justifyContent: "space-between" }}>
                <div style={{ fontWeight: 700 }}>{item.email}</div>
                <button className="btn btn-ghost" onClick={() => unblockEmail(item.id)}>
                  Unblock
                </button>
              </div>
              {item.reason && <div className="meta">Reason: {item.reason}</div>}
              {item.created_at && (
                <div className="meta">Blocked: {formatDateTime(item.created_at)}</div>
              )}
            </div>
          ))}

          {!loadingBlocked && blockedEmails.length === 0 && (
            <div className="subtle-text">No blocked emails.</div>
          )}
        </div>
      </section>

      <section className="section-card stack">
        <div className="row" style={{ justifyContent: "space-between" }}>
          <div className="stack-tight">
            <h3 className="section-title">Support messages</h3>
            <p className="subtle-text">Reports submitted by players.</p>
          </div>
          <button className="btn btn-ghost" onClick={loadSupportMessages} disabled={loadingSupport}>
            {loadingSupport ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {supportError && <div className="subtle-text">{supportError}</div>}

        <div className="grid-list">
          {supportMessages.map((msg) => (
            <div key={msg.id} className="list-item stack">
              <div className="row" style={{ justifyContent: "space-between" }}>
                <div style={{ fontWeight: 700 }}>{msg.subject || "Support request"}</div>
                <span className={`pill ${msg.status === "CLOSED" ? "pill-muted" : "pill-success"}`}>
                  {msg.status}
                </span>
              </div>
              {msg.user?.email && <div className="meta">From: {msg.user.email}</div>}
              {msg.user?.full_name && <div className="meta">Name: {msg.user.full_name}</div>}
              {msg.user?.phone_number && <div className="meta">Phone: {msg.user.phone_number}</div>}
              {(msg.court?.name || msg.futsal?.name) && (
                <div className="meta">Court: {msg.court?.name || msg.futsal?.name}</div>
              )}
              {(msg.court?.location || msg.futsal?.location) && (
                <div className="meta">Location: {msg.court?.location || msg.futsal?.location}</div>
              )}
              <div className="meta">Message: {msg.message}</div>
              <div className="row">
                <button
                  className="btn btn-ghost"
                  onClick={() => updateSupportStatus(msg.id, msg.status === "CLOSED" ? "OPEN" : "CLOSED")}
                >
                  {msg.status === "CLOSED" ? "Reopen" : "Close"}
                </button>
              </div>
            </div>
          ))}

          {!loadingSupport && supportMessages.length === 0 && (
            <div className="subtle-text">No support messages yet.</div>
          )}
        </div>
      </section>
    </div>
  );
}
