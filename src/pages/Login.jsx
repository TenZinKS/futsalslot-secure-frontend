import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { apiFetch } from "../api";

export default function Login({
  onAuthChange,
  showError,
  showSuccess,
  title,
  subtitle,
  variant,
  endpoint,
  hideRegisterLink,
  secondaryLink,
  defaultRedirect,
  requireRoles,
}) {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [otpStep, setOtpStep] = React.useState(false);
  const [otpToken, setOtpToken] = React.useState("");
  const [otpCode, setOtpCode] = React.useState("");
  const [otpExpiresIn, setOtpExpiresIn] = React.useState(null);

  const nav = useNavigate();
  const location = useLocation();
  const from = location.state?.from || defaultRedirect || "/";

  function resetOtp() {
    setOtpStep(false);
    setOtpToken("");
    setOtpCode("");
    setOtpExpiresIn(null);
  }

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await apiFetch(endpoint || "/auth/login", {
        method: "POST",
        body: { email, password },
      });

      if (data?.otp_required) {
        setOtpStep(true);
        setOtpToken(data.otp_token || "");
        setOtpExpiresIn(data.otp_expires_in ?? null);
        showSuccess?.("OTP sent. Check your email.");
        return;
      }

      await onAuthChange?.();
      showSuccess?.("Logged in successfully");
      nav(from, { replace: true });
    } catch (err) {
      showError?.(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  async function verifyOtp(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await apiFetch("/auth/otp/verify", {
        method: "POST",
        body: { otp_token: otpToken, code: otpCode },
      });

      if (Array.isArray(requireRoles) && requireRoles.length > 0) {
        try {
          const me = await apiFetch("/auth/me");
          const roles = Array.isArray(me?.roles) ? me.roles : [];
          const hasRequired = requireRoles.some((role) => roles.includes(role));
          if (!hasRequired) {
            await apiFetch("/auth/logout", { method: "POST" }).catch(() => {});
            showError?.("Forbidden. This login is for admin accounts only.");
            resetOtp();
            return;
          }
        } catch (checkErr) {
          await apiFetch("/auth/logout", { method: "POST" }).catch(() => {});
          showError?.(checkErr.message || "Login failed");
          resetOtp();
          return;
        }
      }

      await onAuthChange?.();
      showSuccess?.("Logged in successfully");
      nav(from, { replace: true });
    } catch (err) {
      const remaining = err?.payload?.attempts_remaining;
      showError?.(
        remaining != null
          ? `${err.message || "Invalid code"} (attempts left: ${remaining})`
          : err.message || "OTP verification failed"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={`section-card form-card stack ${variant === "admin" ? "admin-login" : ""}`}>
      <div className="stack-tight">
        <h2>{title || "Welcome back"}</h2>
        <p className="subtle-text">
          {otpStep
            ? "Enter the one-time code sent to your email."
            : subtitle || "Sign in to manage your bookings."}
        </p>
      </div>

      {!otpStep ? (
        <form onSubmit={submit} className="stack">
          <div className="field">
            <label>
              Email
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                required
              />
            </label>
          </div>

          <div className="field">
            <label>
              Password
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                autoComplete="current-password"
                required
              />
            </label>
          </div>

          <button className="btn btn-primary" disabled={loading} type="submit">
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      ) : (
        <form onSubmit={verifyOtp} className="stack">
          <div className="field">
            <label>
              One-time code
              <input
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="Enter 6-digit code"
                required
              />
            </label>
          </div>

          {otpExpiresIn ? (
            <div className="meta">Code expires in {Math.ceil(otpExpiresIn / 60)} min</div>
          ) : null}

          <div className="row">
            <button className="btn btn-ghost" type="button" onClick={resetOtp} disabled={loading}>
              Back
            </button>
            <button className="btn btn-primary" disabled={loading} type="submit">
              {loading ? "Verifying..." : "Verify & continue"}
            </button>
          </div>
        </form>
      )}

      {!otpStep && !hideRegisterLink && (
        <p className="meta">
          No account?{" "}
          <Link to={variant === "admin" ? "/admin-register" : "/register"}>
            {variant === "admin" ? "Create admin" : "Register"}
          </Link>
        </p>
      )}
      {!otpStep && secondaryLink && (
        <p className="meta">
          {secondaryLink.text} <Link to={secondaryLink.to}>{secondaryLink.label}</Link>
        </p>
      )}
    </div>
  );
}
