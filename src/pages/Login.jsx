import { useState } from "react";
import { useNavigate } from "react-router-dom";

import logoWhite from "../assets/logos/logo-white.png";

// TEMP: hardcoded credential for previewing the dashboard layout only.
// Remove this once real Supabase Auth is wired in.
const TEMP_CREDENTIALS = {
  email: "coordinator@revibe.com",
  password: "coordinator123",
};

function IconShield() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 3.5 19 6.3v5.1c0 4.7-3 8.3-7 9.1-4-.8-7-4.4-7-9.1V6.3L12 3.5Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M9 12.2l2 2 4-4.2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconMail() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M4 6.5 12 13l8-6.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconLock() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="5" y="10.5" width="14" height="9.5" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8 10.5V7.8a4 4 0 0 1 8 0v2.7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function IconEye({ open }) {
  return open ? (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="2.7" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M3.5 3.5l17 17M9.9 9.9a2.7 2.7 0 0 0 3.9 3.9M6.6 6.7C4.3 8.2 2.5 12 2.5 12s3.5 6.5 9.5 6.5c1.7 0 3.2-.5 4.5-1.2M11 5.6c.3 0 .6-.06 1-.06 6 0 9.5 6.5 9.5 6.5s-.7 1.3-2 2.7"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconArrow() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 12h13M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function Login() {
  const navigate = useNavigate();

  const [formValues, setFormValues] = useState({
    identifier: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    // TEMP: layout-preview-only auth check. Replace with real Supabase
    // Auth call once services/auth.js is wired up.
    const matchesTemp =
      formValues.identifier.trim().toLowerCase() === TEMP_CREDENTIALS.email &&
      formValues.password === TEMP_CREDENTIALS.password;

    if (!matchesTemp) {
      setError("Invalid credentials. (Preview mode: use the temp login below.)");
      return;
    }

    navigate("/coordinator", {
      state: { department: "CSE", section: "A" },
    });
  };

  return (
    <>
      <main className="theme-page auth-page">
        <section className="content-panel">
          <div className="page-shell auth-shell">
            <div className="auth-header">
              <p className="auth-title">Welcome Back</p>
              <p className="auth-subtitle">
                Sign in to access the REVIBE '26 dashboard.
              </p>
            </div>

            <div className="auth-card">
              <span className="auth-badge">
                <IconShield />
                Restricted Access
              </span>

              <img
                src={logoWhite}
                alt="Student Guidance Cell logo"
                className="auth-logo"
              />

              <h1 className="auth-card-title">Coordinator &amp; Admin Portal</h1>
              <p className="auth-card-subtitle">
                Sign in using your assigned coordinator or administrator account.
              </p>

              <form className="auth-form" onSubmit={handleSubmit}>
                <label>
                  <span>Email Address</span>
                  <span className="auth-input-wrap">
                    <span className="auth-input-icon" aria-hidden="true">
                      <IconMail />
                    </span>
                    <input
                      type="text"
                      name="identifier"
                      value={formValues.identifier}
                      onChange={handleChange}
                      placeholder="Enter your email"
                      autoComplete="username"
                    />
                  </span>
                </label>

                <label>
                  <span>Password</span>
                  <span className="auth-input-wrap">
                    <span className="auth-input-icon" aria-hidden="true">
                      <IconLock />
                    </span>
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formValues.password}
                      onChange={handleChange}
                      placeholder="Enter your password"
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      className="auth-input-toggle"
                      onClick={() => setShowPassword((prev) => !prev)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      <IconEye open={showPassword} />
                    </button>
                  </span>
                </label>

                {error && <p className="auth-error">{error}</p>}

                <div className="auth-actions">
                  <button type="submit" className="primary-btn">
                    Login
                    <IconArrow />
                  </button>
                </div>
              </form>

              <p className="auth-note">
                This portal is intended exclusively for{" "}
                <strong>authorized workshop coordinators and administrators</strong>.
              </p>

              <p className="auth-temp-hint">
                Preview login — email: <code>{TEMP_CREDENTIALS.email}</code>,
                password: <code>{TEMP_CREDENTIALS.password}</code>
              </p>
            </div>
          </div>
        </section>
      </main>

      <style>{`
        /* =========================================================
           PAGE / PANEL SHELL (self-contained for Login.jsx)
        ========================================================= */

        .theme-page {
          width: 100%;
          background: var(--bg);
          color: var(--white);
          overflow-x: hidden;
        }

        .content-panel {
          width: 100%;
          padding: 4rem 1.5rem;
        }

        .page-shell {
          width: 100%;
          max-width: 1100px;
          margin: 0 auto;
        }

        /* =========================================================
           HEADER
        ========================================================= */

        .auth-shell {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .auth-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .auth-title {
          margin: 0 0 0.4rem;
          font-family: 'Bangers', cursive;
          font-size: clamp(1.9rem, 4vw, 2.75rem);
          letter-spacing: 0.03em;
          color: var(--white);
          text-shadow: 0 0 18px var(--shadow);
        }

        .auth-subtitle {
          margin: 0;
          color: var(--soft-white);
          font-size: 0.95rem;
        }

        /* =========================================================
           AUTH CARD
        ========================================================= */

        .auth-card {
          width: min(440px, 100%);
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          border: 1px solid rgba(220, 0, 0, 0.4);
          background: rgba(255, 255, 255, 0.015);
          padding: 2rem 1.75rem;
          position: relative;
        }

        .auth-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.35rem 0.85rem;
          border: 1px solid rgba(255, 191, 0, 0.5);
          background: rgba(255, 191, 0, 0.08);
          color: var(--gold);
          font-family: 'Orbitron', sans-serif;
          font-size: 0.62rem;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          margin-bottom: 1.25rem;
        }

        .auth-badge svg {
          width: 13px;
          height: 13px;
        }

        .auth-logo {
          width: 64px;
          height: 64px;
          object-fit: contain;
          border-radius: 50%;
          margin-bottom: 1rem;
          box-shadow: 0 0 22px var(--shadow);
        }

        .auth-card-title {
          margin: 0 0 0.5rem;
          font-family: 'Orbitron', sans-serif;
          font-size: 1.15rem;
          font-weight: 800;
          letter-spacing: 0.04em;
          color: var(--white);
        }

        .auth-card-subtitle {
          margin: 0 0 1.75rem;
          color: var(--soft-white);
          font-size: 0.88rem;
          line-height: 1.6;
          max-width: 340px;
        }

        /* =========================================================
           FORM
        ========================================================= */

        .auth-form {
          width: 100%;
          display: grid;
          gap: 1rem;
          text-align: left;
        }

        .auth-form label {
          display: grid;
          gap: 0.45rem;
          color: var(--soft-white);
          font-family: 'Orbitron', sans-serif;
          font-size: 0.68rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }

        .auth-input-wrap {
          position: relative;
          display: flex;
          align-items: center;
        }

        .auth-input-icon {
          position: absolute;
          left: 0.85rem;
          display: inline-flex;
          width: 17px;
          height: 17px;
          color: var(--red);
          pointer-events: none;
        }

        .auth-input-icon svg {
          width: 100%;
          height: 100%;
        }

        .auth-form input {
          width: 100%;
          min-height: 46px;
          border: 1px solid rgba(220, 0, 0, 0.35);
          background: rgba(0, 0, 0, 0.25);
          color: var(--white);
          padding: 0.8rem 2.6rem;
          transition: border-color 0.2s ease;
        }

        .auth-form input:focus-visible {
          outline: none;
          border-color: rgba(220, 0, 0, 0.85);
        }

        .auth-form input::placeholder {
          color: rgba(255, 255, 255, 0.45);
        }

        .auth-input-toggle {
          position: absolute;
          right: 0.7rem;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 26px;
          height: 26px;
          border: none;
          background: transparent;
          color: var(--muted);
          cursor: pointer;
          padding: 0;
        }

        .auth-input-toggle:hover,
        .auth-input-toggle:focus-visible {
          color: var(--red);
        }

        .auth-input-toggle svg {
          width: 18px;
          height: 18px;
        }

        /* =========================================================
           ERROR
        ========================================================= */

        .auth-error {
          margin: 0;
          padding: 0.6rem 0.75rem;
          border: 1px solid rgba(220, 0, 0, 0.5);
          background: rgba(220, 0, 0, 0.08);
          color: #ff9b9b;
          font-size: 0.82rem;
        }

        /* =========================================================
           ACTIONS / BUTTONS
        ========================================================= */

        .auth-actions {
          display: flex;
          margin-top: 0.5rem;
        }

        .auth-actions .primary-btn {
          width: 100%;
        }

        .primary-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          min-height: 46px;
          padding: 0.8rem 1.25rem;
          border: 1px solid transparent;
          font-family: 'Orbitron', sans-serif;
          font-size: 0.72rem;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          text-decoration: none;
          cursor: pointer;
          transition: transform 0.2s ease;
          background: linear-gradient(90deg, var(--red), #ff4d1a);
          color: var(--white);
          box-shadow: 0 0 18px rgba(220, 0, 0, 0.3);
        }

        .primary-btn svg {
          width: 15px;
          height: 15px;
        }

        .primary-btn:hover,
        .primary-btn:focus-visible {
          transform: translateY(-1px);
        }

        .auth-note {
          margin: 1.5rem 0 0;
          color: var(--muted);
          line-height: 1.6;
          font-size: 0.82rem;
        }

        .auth-note strong {
          color: var(--soft-white);
        }

        .auth-temp-hint {
          margin: 0.75rem 0 0;
          padding: 0.5rem 0.65rem;
          border: 1px dashed rgba(255, 191, 0, 0.4);
          color: var(--gold);
          font-size: 0.75rem;
          line-height: 1.5;
        }

        .auth-temp-hint code {
          color: var(--white);
        }

        /* =========================================================
           RESPONSIVE — 1024px and below
        ========================================================= */

        @media (max-width: 1024px) {
          .content-panel {
            padding: 3.25rem 1.25rem;
          }
        }

        /* =========================================================
           RESPONSIVE — 768px and below (tablet)
        ========================================================= */

        @media (max-width: 768px) {
          .content-panel {
            padding: 2.75rem 1.1rem;
          }

          .auth-title {
            font-size: clamp(1.6rem, 5vw, 2.1rem);
          }
        }

        /* =========================================================
           RESPONSIVE — 430px and below (phones)
        ========================================================= */

        @media (max-width: 430px) {
          .content-panel {
            padding: 2.25rem 0.9rem;
          }

          .auth-card {
            padding: 1.5rem 1.15rem;
          }

          .auth-badge {
            font-size: 0.6rem;
            letter-spacing: 0.1em;
          }
        }

        /* =========================================================
           RESPONSIVE — 320px (smallest supported)
        ========================================================= */

        @media (max-width: 320px) {
          .auth-card {
            padding: 1.25rem 1rem;
          }

          .auth-form input {
            min-height: 42px;
            padding: 0.7rem 2.4rem;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .primary-btn,
          .auth-input-toggle {
            transition: none;
          }
        }
      `}</style>
    </>
  );
}