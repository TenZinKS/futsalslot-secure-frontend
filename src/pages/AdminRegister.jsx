import React from "react";
import { Link } from "react-router-dom";
import PasswordStrengthBar from "react-password-strength-bar";
import { apiFetch } from "../api";

export default function AdminRegister() {
  const [fullName, setFullName] = React.useState("");
  const [phoneNumber, setPhoneNumber] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [futsalName, setFutsalName] = React.useState("");
  const [futsalLocation, setFutsalLocation] = React.useState("");
  const [futsalPhone, setFutsalPhone] = React.useState("");
  const [futsalEmail, setFutsalEmail] = React.useState("");
  const [futsalDescription, setFutsalDescription] = React.useState("");
  const [courtMapsLink, setCourtMapsLink] = React.useState("");
  const [pwPolicy, setPwPolicy] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);

  React.useEffect(() => {
    if (!password) {
      setPwPolicy(null);
      return;
    }
    const handle = setTimeout(async () => {
      try {
        const data = await apiFetch("/auth/password_strength", {
          method: "POST",
          body: { password },
        });
        setPwPolicy(data);
      } catch {
        // Ignore policy errors to avoid blocking typing.
      }
    }, 300);
    return () => clearTimeout(handle);
  }, [password]);

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const body = {
        email: email.trim(),
        password,
        full_name: fullName.trim(),
        phone_number: phoneNumber.trim(),
        court: {
          name: futsalName.trim(),
          location: futsalLocation.trim(),
          phone_number: futsalPhone.trim(),
          email: futsalEmail.trim(),
          description: futsalDescription.trim(),
          maps_link: courtMapsLink.trim(),
        },
      };
      await apiFetch("/auth/admin/register", {
        method: "POST",
        body,
      });
      setSubmitted(true);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="section-card form-card stack admin-login">
        <div className="stack-tight">
          <h2>Request submitted</h2>
          <p className="subtle-text">
            Thanks! Your details were submitted for verification. You will receive an email
            once the super admin approves your court. Until then, please wait for
            verification before logging in.
          </p>
        </div>
        <div className="row">
          <Link className="btn btn-primary" to="/court-onboarding">
            Back to onboarding
          </Link>
          <Link className="btn btn-ghost" to="/courts">
            Browse courts
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="section-card form-card stack admin-login">
      <div className="stack-tight">
        <h2>Create admin account</h2>
        <p className="subtle-text">
          Submit your admin and court details. You will be able to login only after
          verification by the super admin.
        </p>
      </div>
      <form onSubmit={submit} className="stack">
        <div className="field">
          <label>
            Full name
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Staff name"
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
              placeholder="+977 9800000000"
              autoComplete="tel"
              required
            />
          </label>
        </div>

        <div className="field">
          <label>
            Email
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              autoComplete="email"
              required
            />
          </label>
        </div>

        <div className="field">
          <label>
            Password (min 12 characters)
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              autoComplete="new-password"
              minLength={12}
              required
            />
            <PasswordStrengthBar password={password} className="password-strength" />
          </label>
          {pwPolicy && pwPolicy.valid === false && Array.isArray(pwPolicy.feedback) && (
            <div className="password-policy">
              <div className="meta">Password requirements:</div>
              <ul>
                {pwPolicy.feedback.map((msg) => (
                  <li key={msg}>{msg}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="field">
          <label>
            Court name
            <input
              value={futsalName}
              onChange={(e) => setFutsalName(e.target.value)}
              placeholder="Court name"
              required
            />
          </label>
        </div>

        <div className="field">
          <label>
            Court location
            <input
              value={futsalLocation}
              onChange={(e) => setFutsalLocation(e.target.value)}
              placeholder="Area, city"
              required
            />
          </label>
        </div>

        <div className="field">
          <label>
            Court phone number
            <input
              value={futsalPhone}
              onChange={(e) => setFutsalPhone(e.target.value)}
              placeholder="+977 9800000000"
              autoComplete="tel"
              required
            />
          </label>
        </div>

        <div className="field">
          <label>
            Court email
            <input
              value={futsalEmail}
              onChange={(e) => setFutsalEmail(e.target.value)}
              placeholder="venue@example.com"
              autoComplete="email"
              required
            />
          </label>
        </div>

        <div className="field">
          <label>
            Court description
            <textarea
              value={futsalDescription}
              onChange={(e) => setFutsalDescription(e.target.value)}
              placeholder="Courts, amenities, hours"
              rows={3}
              required
            />
          </label>
        </div>

        <div className="field">
          <label>
            Google Maps link
            <input
              value={courtMapsLink}
              onChange={(e) => setCourtMapsLink(e.target.value)}
              placeholder="https://maps.google.com/..."
              required
            />
          </label>
        </div>

        <button className="btn btn-primary" disabled={loading} type="submit">
          {loading ? "Submitting..." : "Submit for verification"}
        </button>
      </form>

      <p className="meta">
        Already verified? <Link to="/admin-login">Admin login</Link>
      </p>
    </div>
  );
}
