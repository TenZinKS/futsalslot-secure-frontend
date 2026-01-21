import React from "react";
import { apiFetch } from "../api";

export default function ChangePassword({ showError, showSuccess }) {
  const [currentPassword, setCurrentPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  async function submit(e) {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showError?.("New password and confirmation do not match");
      return;
    }

    setLoading(true);
    try {
      await apiFetch("/auth/change_password", {
        method: "POST",
        body: {
          current_password: currentPassword,
          new_password: newPassword,
        },
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      showSuccess?.("Password updated");
    } catch (err) {
      const details = Array.isArray(err.payload?.details) ? err.payload.details.join(" ") : null;
      showError?.(details || err.message || "Unable to update password");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="section-card form-card stack">
      <div className="stack-tight">
        <h2>Change password</h2>
        <p className="subtle-text">Use a strong passphrase you haven't used before.</p>
      </div>

      <form onSubmit={submit} className="stack">
        <div className="field">
          <label>
            Current password
            <input
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              type="password"
              autoComplete="current-password"
              required
            />
          </label>
        </div>

        <div className="field">
          <label>
            New password
            <input
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              type="password"
              autoComplete="new-password"
              required
            />
          </label>
        </div>

        <div className="field">
          <label>
            Confirm new password
            <input
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              type="password"
              autoComplete="new-password"
              required
            />
          </label>
        </div>

        <button className="btn btn-primary" disabled={loading} type="submit">
          {loading ? "Updating..." : "Update password"}
        </button>
      </form>
    </div>
  );
}
