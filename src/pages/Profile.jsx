import React from "react";
import { apiFetch } from "../api";

export default function Profile({ me, showError, showSuccess }) {
  const email = me?.email || "";
  const nameFromMe = me?.full_name || me?.name || "";
  const phoneFromMe = me?.phone_number || me?.phone || "";
  const initials = email ? email[0].toUpperCase() : "U";
  const maskedEmail = maskEmail(email);
  const [fullName, setFullName] = React.useState(nameFromMe);
  const [phoneNumber, setPhoneNumber] = React.useState(phoneFromMe);
  const [loading, setLoading] = React.useState(false);

  function maskEmail(value) {
    if (!value || !value.includes("@")) return "";
    const [name, domain] = value.split("@");
    if (!name) return "";
    const visible = name.length > 2 ? `${name[0]}***${name[name.length - 1]}` : `${name[0]}*`;
    return `${visible}@${domain}`;
  }

  React.useEffect(() => {
    let active = true;

    async function loadProfile() {
      try {
        const data = await apiFetch("/auth/profile");
        if (!active) return;
        if (typeof data.full_name === "string") setFullName(data.full_name);
        if (typeof data.phone_number === "string") setPhoneNumber(data.phone_number);
      } catch {
        // Ignore profile load errors; form can still be used.
      }
    }

    loadProfile();
    return () => {
      active = false;
    };
  }, []);

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await apiFetch("/auth/profile", {
        method: "POST",
        body: {
          full_name: fullName,
          phone_number: phoneNumber,
        },
      });
      showSuccess?.("Details saved");
    } catch (err) {
      showError?.(err.message || "Unable to save details");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="stack">
      <section className="section-card profile-header">
        <div className="profile-avatar" aria-hidden="true">
          {initials}
        </div>
        <div>
          <h2>Profile</h2>
          <p className="subtle-text">Manage your bookings and security.</p>
        </div>
      </section>

      <section className="section-card profile-infographic">
        <div className="profile-stat">
          <div className="profile-stat-label">Account</div>
          <div className="profile-stat-value">{maskedEmail || "Signed in"}</div>
          <div className="subtle-text">We keep your details private.</div>
        </div>
        <div className="profile-stat">
          <div className="profile-stat-label">Support</div>
          <div className="profile-stat-value">Need help?</div>
          <div className="subtle-text">Contact us anytime for booking assistance.</div>
        </div>
        <div className="profile-stat">
          <div className="profile-stat-label">Bookings</div>
          <div className="profile-stat-value">View schedule</div>
          <div className="subtle-text">See upcoming matches.</div>
        </div>
      </section>

      <section className="section-card">
        <h3 className="section-title">Personal details</h3>
        <form className="stack" onSubmit={submit}>
          <div className="field">
            <label>
              Full name
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your name"
                autoComplete="name"
                required
              />
            </label>
          </div>

          <div className="field">
            <label>
              Phone number
              <input
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="e.g. 98XXXXXXXX"
                autoComplete="tel"
                required
              />
            </label>
          </div>

          <div className="field">
            <label>
              Email
              <input value={email} disabled />
            </label>
          </div>

          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? "Saving..." : "Save details"}
          </button>
        </form>
      </section>
    </div>
  );
}
