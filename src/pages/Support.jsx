import React from "react";
import { apiFetch } from "../api";

export default function Support({ showError, showSuccess }) {
  const [subject, setSubject] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [bookingId, setBookingId] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const body = {
        subject: subject.trim(),
        message: message.trim(),
      };
      if (bookingId.trim()) body.booking_id = bookingId.trim();

      await apiFetch("/support/messages", {
        method: "POST",
        body,
      });

      showSuccess?.("Support request sent");
      setSubject("");
      setMessage("");
      setBookingId("");
    } catch (err) {
      showError?.(err.message || "Unable to send support request");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="stack">
      <section className="section-card">
        <h2>Support</h2>
        <p className="subtle-text">
          Tell us what went wrong and we will get back to you quickly.
        </p>
      </section>

      <section className="section-card">
        <h3 className="section-title">Send a request</h3>
        <form className="stack" onSubmit={submit}>
          <div className="field">
            <label>
              Subject
              <input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Booking issue / payment / schedule"
                required
              />
            </label>
          </div>
          <div className="field">
            <label>
              Booking ID (optional)
              <input
                value={bookingId}
                onChange={(e) => setBookingId(e.target.value)}
                placeholder="e.g. 12345"
              />
            </label>
          </div>
          <div className="field">
            <label>
              Message
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe the issue in detail"
                rows={4}
                required
              />
            </label>
          </div>
          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? "Sending..." : "Send support request"}
          </button>
        </form>
      </section>
    </div>
  );
}
