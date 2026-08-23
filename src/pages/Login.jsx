import { useState } from "react";

export default function Login() {
  const [formValues, setFormValues] = useState({
    identifier: "",
    password: "",
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    // TODO: wire to services/supabase.js + registrationService.js once reviewed.
    // Placeholder only — no auth call made yet.
  };

  return (
    <>
      <main className="theme-page auth-page">
        <section className="content-panel">
          <div className="page-shell auth-shell">
            <div className="auth-card">
              <p className="eyebrow accent">Member access</p>
              <h1 className="section-title">Login</h1>

              <form className="auth-form" onSubmit={handleSubmit}>
                <label>
                  <span>Email / Username</span>
                  <input
                    type="text"
                    name="identifier"
                    value={formValues.identifier}
                    onChange={handleChange}
                    placeholder="Enter your email or username"
                    autoComplete="username"
                  />
                </label>

                <label>
                  <span>Password</span>
                  <input
                    type="password"
                    name="password"
                    value={formValues.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                  />
                </label>

                <div className="auth-actions">
                  <button type="submit" className="primary-btn">Login</button>
                </div>

                <p className="auth-note">
                  Login access is provided by the organizing team. Contact your
                  coordinator if you don't have credentials yet.
                </p>
              </form>
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
           TEXT / LABELS
        ========================================================= */

        .eyebrow {
          margin: 0 0 0.6rem;
          font-family: 'Orbitron', sans-serif;
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.28em;
          text-transform: uppercase;
        }

        .eyebrow.accent {
          color: var(--gold);
        }

        .section-title {
          margin: 0 0 0.25rem;
          font-family: 'Bangers', cursive;
          font-size: clamp(1.9rem, 4vw, 2.75rem);
          letter-spacing: 0.03em;
          color: var(--white);
          text-shadow: 0 0 18px var(--shadow);
        }

        /* =========================================================
           AUTH CARD / FORM
        ========================================================= */

        .auth-shell {
          display: flex;
          justify-content: center;
        }

        .auth-card {
          width: min(520px, 100%);
          border: 1px solid rgba(220, 0, 0, 0.4);
          background: rgba(255, 255, 255, 0.01);
          padding: 1.5rem;
        }

        .auth-form {
          display: grid;
          gap: 1rem;
          margin-top: 1.2rem;
        }

        .auth-form label {
          display: grid;
          gap: 0.45rem;
          color: var(--soft-white);
          font-family: 'Orbitron', sans-serif;
          font-size: 0.7rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }

        .auth-form input {
          width: 100%;
          min-height: 46px;
          border: 1px solid rgba(220, 0, 0, 0.35);
          background: rgba(0, 0, 0, 0.25);
          color: var(--white);
          padding: 0.8rem 0.85rem;
          transition: border-color 0.2s ease;
        }

        .auth-form input:focus-visible {
          outline: none;
          border-color: rgba(220, 0, 0, 0.85);
        }

        .auth-form input::placeholder {
          color: rgba(255, 255, 255, 0.45);
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

        .primary-btn,
        .secondary-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
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
        }

        .primary-btn {
          background: var(--red);
          color: var(--white);
          box-shadow: 0 0 18px rgba(220, 0, 0, 0.25);
        }

        .secondary-btn {
          border-color: rgba(220, 0, 0, 0.7);
          background: rgba(255, 255, 255, 0.01);
          color: var(--white);
        }

        .primary-btn:hover,
        .primary-btn:focus-visible,
        .secondary-btn:hover,
        .secondary-btn:focus-visible {
          transform: translateY(-1px);
        }

        .auth-note {
          margin: 0;
          color: var(--muted);
          line-height: 1.6;
          font-size: 0.9rem;
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

          .section-title {
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
            padding: 1.15rem;
          }

          .eyebrow {
            font-size: 0.68rem;
            letter-spacing: 0.22em;
          }

          .auth-actions {
            flex-direction: column;
          }

          .primary-btn,
          .secondary-btn {
            width: 100%;
          }
        }

        /* =========================================================
           RESPONSIVE — 320px (smallest supported)
        ========================================================= */

        @media (max-width: 320px) {
          .auth-card {
            padding: 1rem;
          }

          .auth-form input {
            min-height: 42px;
            padding: 0.7rem 0.75rem;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .primary-btn,
          .secondary-btn {
            transition: none;
          }
        }
      `}</style>
    </>
  );
}