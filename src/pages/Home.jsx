import React from "react";
import { Link } from "react-router-dom";

export default function Home({ me }) {
  return (
    <div style={{ display: "grid", gap: 14 }}>
      <h1 style={{ margin: 0 }}>FutsalSlot</h1>
      <p style={{ marginTop: 0, color: "#555" }}>
        Book futsal courts securely. Pay via Stripe. Admins can manage courts and time slots.
      </p>

      {!me ? (
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Link to="/login"><button>Login</button></Link>
          <Link to="/register"><button>Create account</button></Link>
          <Link to="/slots"><button>Browse slots</button></Link>
        </div>
      ) : (
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Link to="/slots"><button>Browse slots</button></Link>
          <Link to="/bookings"><button>My bookings</button></Link>
          <Link to="/admin"><button>Admin</button></Link>
        </div>
      )}

      <div style={{ marginTop: 10, padding: 12, border: "1px solid #ddd", borderRadius: 10 }}>
        <h3 style={{ marginTop: 0 }}>How it works</h3>
        <ol style={{ marginBottom: 0 }}>
          <li>Login or create an account</li>
          <li>Choose a court and time slot</li>
          <li>Pay securely via Stripe Checkout</li>
          <li>Your booking is confirmed only after webhook verification</li>
        </ol>
      </div>
    </div>
  );
}
