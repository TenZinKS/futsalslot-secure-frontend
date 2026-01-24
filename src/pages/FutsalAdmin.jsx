import React from "react";
import { apiFetch } from "../api";
import { formatDateTime } from "../utils/date";

function buildPayload(base, extraText) {
  if (!extraText.trim()) return base;
  let parsed;
  try {
    parsed = JSON.parse(extraText);
  } catch (e) {
    throw new Error("Extra fields must be valid JSON.");
  }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("Extra fields must be a JSON object.");
  }
  return { ...base, ...parsed };
}

function renderMemberLabel(member) {
  return (
    member.full_name ||
    member.name ||
    member.email ||
    member.phone_number ||
    `Member #${member.id || "unknown"}`
  );
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

export default function FutsalAdmin() {
  const [futsal, setFutsal] = React.useState(null);
  const [members, setMembers] = React.useState([]);
  const [loadingFutsal, setLoadingFutsal] = React.useState(false);
  const [loadingMembers, setLoadingMembers] = React.useState(false);
  const [error, setError] = React.useState("");

  const [name, setName] = React.useState("");
  const [location, setLocation] = React.useState("");
  const [phoneNumber, setPhoneNumber] = React.useState("");
  const [contactEmail, setContactEmail] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [registerExtra, setRegisterExtra] = React.useState("");
  const [registering, setRegistering] = React.useState(false);

  const [acceptInviteId, setAcceptInviteId] = React.useState("");
  const [acceptInviteToken, setAcceptInviteToken] = React.useState("");
  const [accepting, setAccepting] = React.useState(false);

  const [revokeInviteId, setRevokeInviteId] = React.useState("");
  const [revoking, setRevoking] = React.useState(false);

  async function loadFutsal() {
    setLoadingFutsal(true);
    setError("");
    try {
      const data = await apiFetch("/courts/me");
      setFutsal(data || null);
    } catch (e) {
      setError(e.message || "Unable to load court profile.");
      setFutsal(null);
    } finally {
      setLoadingFutsal(false);
    }
  }

  async function loadMembers() {
    setLoadingMembers(true);
    setError("");
    try {
      const data = await apiFetch("/courts/members");
      setMembers(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message || "Unable to load court members.");
      setMembers([]);
    } finally {
      setLoadingMembers(false);
    }
  }

  React.useEffect(() => {
    loadFutsal();
    loadMembers();
  }, []);

  async function registerFutsal() {
    setRegistering(true);
    setError("");
    try {
      const base = {};
      if (name.trim()) base.name = name.trim();
      if (location.trim()) base.location = location.trim();
      if (phoneNumber.trim()) base.phone_number = phoneNumber.trim();
      if (contactEmail.trim()) base.email = contactEmail.trim();
      if (description.trim()) base.description = description.trim();
      const body = buildPayload(base, registerExtra);
      await apiFetch("/courts/register", {
        method: "POST",
        body,
      });
      await loadFutsal();
      alert("Court registered.");
    } catch (e) {
      alert(e.message);
    } finally {
      setRegistering(false);
    }
  }

  async function acceptInvite() {
    setAccepting(true);
    setError("");
    try {
      const body = {};
      if (acceptInviteId.trim()) body.invite_id = Number(acceptInviteId);
      if (acceptInviteToken.trim()) body.token = acceptInviteToken.trim();
      await apiFetch("/courts/invites/accept", {
        method: "POST",
        body,
      });
      alert("Invite accepted.");
      setAcceptInviteId("");
      setAcceptInviteToken("");
      await loadMembers();
    } catch (e) {
      alert(e.message);
    } finally {
      setAccepting(false);
    }
  }

  async function revokeInvite() {
    if (!revokeInviteId.trim()) {
      alert("Invite ID is required.");
      return;
    }
    setRevoking(true);
    setError("");
    try {
      const body = {};
      await apiFetch(`/courts/invites/${revokeInviteId}/revoke`, {
        method: "POST",
        body,
      });
      alert("Invite revoked.");
      setRevokeInviteId("");
    } catch (e) {
      alert(e.message);
    } finally {
      setRevoking(false);
    }
  }

  return (
    <div className="stack">
      <div className="admin-banner">
        <div>
          <h2>Court Admin</h2>
          <p className="subtle-text">Register your venue and manage team access.</p>
        </div>
        <span className="pill pill-muted">Owner</span>
      </div>

      {error && <div className="subtle-text">{error}</div>}

      <section className="section-card stack">
        <div className="row" style={{ justifyContent: "space-between" }}>
          <h3 className="section-title">My court</h3>
          <button className="btn btn-ghost" onClick={loadFutsal} disabled={loadingFutsal}>
            {loadingFutsal ? "Refreshing..." : "Refresh"}
          </button>
        </div>
        {futsal ? (
          <div className="grid-list">
            <div className="list-item stack">
              <div style={{ fontWeight: 700 }}>{futsal.name || "Court"}</div>
              {futsal.location && <div className="meta">Location: {futsal.location}</div>}
              {futsal.email && <div className="meta">Email: {futsal.email}</div>}
              {futsal.phone_number && <div className="meta">Phone: {futsal.phone_number}</div>}
              {futsal.description && <div className="meta">{futsal.description}</div>}
              {typeof futsal.verified !== "undefined" && (
                <div className="meta">
                  Status: {futsal.verified ? "Verified" : "Pending verification"}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="subtle-text">No court profile found yet.</div>
        )}
      </section>

      <section className="section-card stack">
        <h3 className="section-title">Register court</h3>
        <div className="stack" style={{ maxWidth: 520 }}>
          <input
            placeholder="Court name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            placeholder="Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
          <input
            placeholder="Contact phone"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
          />
          <input
            placeholder="Contact email"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
          />
          <textarea
            placeholder="Description"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <textarea
            placeholder='Extra fields JSON (optional) e.g. {"owner_name":"Rita"}'
            rows={3}
            value={registerExtra}
            onChange={(e) => setRegisterExtra(e.target.value)}
          />
          <button
            className="btn btn-primary"
            onClick={registerFutsal}
            disabled={registering || !name.trim() || !location.trim()}
          >
            {registering ? "Submitting..." : "Register court"}
          </button>
        </div>
      </section>

      <section className="section-card stack">
        <div className="row" style={{ justifyContent: "space-between" }}>
          <h3 className="section-title">Members</h3>
          <button className="btn btn-ghost" onClick={loadMembers} disabled={loadingMembers}>
            {loadingMembers ? "Refreshing..." : "Refresh"}
          </button>
        </div>
        <div className="grid-list">
          {members.map((member) => (
            <div key={member.id || member.email} className="list-item stack">
              <div style={{ fontWeight: 700 }}>{renderMemberLabel(member)}</div>
              {member.email && <div className="meta">Email: {member.email}</div>}
              {member.role && formatRoleLabel(member.role) && (
                <div className="meta">Role: {formatRoleLabel(member.role)}</div>
              )}
              {Array.isArray(member.roles) && formatRoles(member.roles) && (
                <div className="meta">
                  Roles: {formatRoles(member.roles)}
                </div>
              )}
              {member.joined_at && (
                <div className="meta">Joined: {formatDateTime(member.joined_at)}</div>
              )}
            </div>
          ))}
          {!loadingMembers && members.length === 0 && (
            <div className="subtle-text">No members yet.</div>
          )}
        </div>
      </section>

      <section className="section-card stack">
        <h3 className="section-title">Accept invite</h3>
        <div className="stack" style={{ maxWidth: 520 }}>
          <div className="field">
            <label>
              Invite ID (from the email)
              <input
                placeholder="e.g. 42"
                value={acceptInviteId}
                onChange={(e) => setAcceptInviteId(e.target.value)}
              />
            </label>
          </div>
          <div className="field">
            <label>
              Invite token (from the email)
              <input
                placeholder="Paste the token here"
                value={acceptInviteToken}
                onChange={(e) => setAcceptInviteToken(e.target.value)}
              />
            </label>
            <div className="meta">Copy both values from the invite email.</div>
          </div>
          <button
            className="btn btn-primary"
            onClick={acceptInvite}
            disabled={accepting || (!acceptInviteId.trim() && !acceptInviteToken.trim())}
          >
            {accepting ? "Accepting..." : "Accept invite"}
          </button>
        </div>
      </section>

      <section className="section-card stack">
        <h3 className="section-title">Revoke invite</h3>
        <div className="stack" style={{ maxWidth: 520 }}>
          <div className="field">
            <label>
              Invite ID to revoke
              <input
                placeholder="e.g. 42"
                value={revokeInviteId}
                onChange={(e) => setRevokeInviteId(e.target.value)}
              />
            </label>
            <div className="meta">Use the Invite ID from the email.</div>
          </div>
          <button className="btn btn-danger" onClick={revokeInvite} disabled={revoking}>
            {revoking ? "Revoking..." : "Revoke invite"}
          </button>
        </div>
      </section>
    </div>
  );
}
