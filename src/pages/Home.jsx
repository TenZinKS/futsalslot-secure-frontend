import React from "react";
import { Link } from "react-router-dom";

export default function Home({ me }) {
  return (
    <div className="stack">
      <section className="hero">
        <span className="badge">Secure Stripe payments</span>
        <h1 className="page-title">FutsalSlot</h1>
        <p className="subtle-text">
          Book futsal courts without the back-and-forth. Find a slot, pay securely, and play.
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

      <section className="section-card">
        <h3 className="section-title">How it works</h3>
        <ol className="stack-tight">
          <li>Login or create an account</li>
          <li>Choose a court and time slot</li>
          <li>Pay securely via Stripe Checkout</li>
          <li>Your booking is confirmed only after webhook verification</li>
        </ol>
      </section>
    </div>
  );
}
