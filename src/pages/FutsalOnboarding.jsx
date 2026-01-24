import React from "react";
import { Link } from "react-router-dom";

export default function FutsalOnboarding({ showSuccess }) {
  function handleToast(message) {
    return () => {
      if (showSuccess) showSuccess(message);
    };
  }

  return (
    <div className="stack">
      <div className="admin-banner">
        <div>
          <h2>Court onboarding</h2>
          <p className="subtle-text">
            Submit your details and get verified before managing your own court.
          </p>
        </div>
        <span className="pill pill-muted">Super admin verification</span>
      </div>

      <section className="section-card stack">
        <h3 className="section-title">How it works</h3>
        <div className="timeline">
          <div className="timeline-track">
            <div className="timeline-step">
              <div className="timeline-dot">1</div>
              <div>
                <div style={{ fontWeight: 700 }}>Create your admin account</div>
                <div className="meta">Use your admin email to get started.</div>
              </div>
            </div>
            <div className="timeline-step">
              <div className="timeline-dot">2</div>
              <div>
                <div style={{ fontWeight: 700 }}>Register your court</div>
                <div className="meta">
                  Add your venue details so the super admin can verify them.
                </div>
              </div>
            </div>
            <div className="timeline-step">
              <div className="timeline-dot">3</div>
              <div>
                <div style={{ fontWeight: 700 }}>Wait for verification</div>
                <div className="meta">
                  Your status stays pending until approval and a confirmation email.
                </div>
              </div>
            </div>
            <div className="timeline-step">
              <div className="timeline-dot">4</div>
              <div>
                <div style={{ fontWeight: 700 }}>Manage only your court</div>
                <div className="meta">
                  After approval, you can manage slots and bookings for your own venue.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-card stack">
        <div className="row" style={{ justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h3 className="section-title" style={{ marginBottom: 4 }}>
              Ready to start?
            </h3>
            <p className="subtle-text">
              Create your admin account, then submit your court for verification.
            </p>
          </div>
          <div className="row">
            <Link
              className="btn btn-primary"
              to="/admin-register"
              onClick={handleToast("Create your admin account, then register your court.")}
            >
              Create admin account
            </Link>
            <Link
              className="btn btn-ghost"
              to="/admin-login"
              onClick={handleToast("Login to continue with your court registration.")}
            >
              Admin login
            </Link>
          </div>
        </div>
      </section>

      <section className="section-card stack">
        <h3 className="section-title">Verification status</h3>
        <div className="grid-list">
          <div className="list-item stack">
            <div className="row">
              <span className="pill pill-muted">Pending verification</span>
              <span className="meta">Submitted and waiting for approval.</span>
            </div>
          </div>
          <div className="list-item stack">
            <div className="row">
              <span className="pill pill-success">Verified</span>
              <span className="meta">Approved and ready to manage your court.</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
