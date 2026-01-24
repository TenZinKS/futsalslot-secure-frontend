import React from "react";
import { Link } from "react-router-dom";

export default function Home({ me }) {
  return (
    <div className="stack">
      <section className="hero">
        <span className="badge">Live availability + secure checkout</span>
        <h1 className="page-title">Book courts in minutes</h1>
        <p className="subtle-text">
          FutsalSlot helps teams and venues coordinate instantly. View real-time slots,
          reserve a court, and get a confirmed booking without phone calls or spreadsheets.
        </p>

        {!me ? (
          <div className="hero-actions">
            <Link className="btn btn-primary" to="/login">Login</Link>
            <Link className="btn btn-ghost" to="/register">Create account</Link>
            <Link className="btn btn-ghost" to="/slots">Browse slots</Link>
          </div>
        ) : (
          <div className="hero-actions">
            <Link className="btn btn-primary" to="/slots">Browse slots</Link>
            <Link className="btn btn-ghost" to="/bookings">My bookings</Link>
          </div>
        )}
      </section>

      <section className="section-card pitch-infographic">
        <div className="pitch-graphic" aria-hidden="true">
          <div className="pitch-midline" />
          <div className="pitch-center" />
          <div className="pitch-box left" />
          <div className="pitch-box right" />
          <div className="pitch-ball" />
        </div>
        <div className="pitch-copy">
          <h3 className="section-title">Built for match-day flow</h3>
          <div className="stat-grid">
            <div className="stat-card">
              <div className="stat-value">Real-time</div>
              <div className="subtle-text">Court availability synced instantly</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">1 tap</div>
              <div className="subtle-text">Reserve and pay in seconds</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">Verified</div>
              <div className="subtle-text">Bookings confirmed after payment</div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-card infographic-strip">
        <div className="strip-card">
          <div className="strip-icon calendar" aria-hidden="true" />
          <div>
            <div className="strip-title">Flexible scheduling</div>
            <div className="subtle-text">Prime time, late night, or weekend play.</div>
          </div>
        </div>
        <div className="strip-card">
          <div className="strip-icon whistle" aria-hidden="true" />
          <div>
            <div className="strip-title">Quick check-in</div>
            <div className="subtle-text">Instant confirmation and clear status updates.</div>
          </div>
        </div>
        <div className="strip-card">
          <div className="strip-icon shield" aria-hidden="true" />
          <div>
            <div className="strip-title">Secure payments</div>
            <div className="subtle-text">Stripe Checkout keeps transactions protected.</div>
          </div>
        </div>
      </section>

      <section className="section-card">
        <h3 className="section-title">What is FutsalSlot?</h3>
        <p className="subtle-text">
          A streamlined booking platform for courts. Players can discover
          available time slots, while venues keep schedules accurate and payments secure.
        </p>
      </section>

      <section className="section-card">
        <h3 className="section-title">How it works</h3>
        <ol className="stack-tight">
          <li>Login or create an account</li>
          <li>Choose a court and time slot</li>
          <li>Pay securely via Stripe Checkout</li>
          <li>Your booking is confirmed only after webhook verification</li>
        </ol>
      </section>

      <section className="section-card timeline">
        <h3 className="section-title">From kickoff to confirmation</h3>
        <div className="timeline-track">
          <div className="timeline-step">
            <div className="timeline-dot">01</div>
            <div>
              <div className="strip-title">Find a slot</div>
              <div className="subtle-text">Filter by court, time, and price.</div>
            </div>
          </div>
          <div className="timeline-step">
            <div className="timeline-dot">02</div>
            <div>
              <div className="strip-title">Reserve & pay</div>
              <div className="subtle-text">Checkout in seconds with Stripe.</div>
            </div>
          </div>
          <div className="timeline-step">
            <div className="timeline-dot">03</div>
            <div>
              <div className="strip-title">Play confirmed</div>
              <div className="subtle-text">Webhook verification finalizes the booking.</div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-card">
        <h3 className="section-title">Why teams use it</h3>
        <div className="feature-grid">
          <div className="feature-card">
            <h4>Real-time availability</h4>
            <p className="subtle-text">No double-bookings. Always up to date across devices.</p>
          </div>
          <div className="feature-card">
            <h4>Fast confirmations</h4>
            <p className="subtle-text">Instant receipts and status updates after payment.</p>
          </div>
          <div className="feature-card">
            <h4>Clear booking history</h4>
            <p className="subtle-text">Review upcoming matches and past bookings in one place.</p>
          </div>
        </div>
      </section>

      <section className="section-card">
        <h3 className="section-title">Perfect for</h3>
        <div className="feature-grid">
          <div className="feature-card">
            <h4>Weekly leagues</h4>
            <p className="subtle-text">Lock in recurring slots without admin hassle.</p>
          </div>
          <div className="feature-card">
            <h4>Pickup games</h4>
            <p className="subtle-text">Find last-minute availability and get everyone playing.</p>
          </div>
          <div className="feature-card">
            <h4>Venue managers</h4>
            <p className="subtle-text">See bookings clearly and keep courts fully utilized.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
