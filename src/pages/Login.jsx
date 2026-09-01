import { useState } from "react";
import { useNavigate } from "react-router-dom";

import logoWhite from "../assets/logos/preview.png";
import { supabase } from "../services/supabase";

function IconShield() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 3.5 19 6.3v5.1c0 4.7-3 8.3-7 9.1-4-.8-7-4.4-7-9.1V6.3L12 3.5Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M9 12.2l2 2 4-4.2"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconMail() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect
        x="3"
        y="5"
        width="18"
        height="14"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="M4 7l8 6 8-6"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconLock() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect
        x="5"
        y="10"
        width="14"
        height="10"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="M8 10V7.5a4 4 0 0 1 8 0V10"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconEye({ open }) {
  if (open) {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        <circle
          cx="12"
          cy="12"
          r="2.7"
          stroke="currentColor"
          strokeWidth="1.6"
        />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M3.5 3.5l17 17"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M6.6 6.7C4.3 8.2 2.5 12 2.5 12s3.5 6.5 9.5 6.5c1.7 0 3.2-.5 4.5-1.2"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M11 5.6c.3 0 .6-.1 1-.1 6 0 9.5 6.5 9.5 6.5s-.7 1.3-2 2.7"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconArrow() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M5 12h13"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="m13 6 6 6-6 6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconCalendar() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect
        x="3.5"
        y="5"
        width="17"
        height="16"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="M7.5 3.5v3M16.5 3.5v3M3.5 9h17"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
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
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormValues((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (error) {
      setError("");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (loading) {
      return;
    }

    const email = formValues.identifier.trim().toLowerCase();
    const password = formValues.password;

    if (!email || !password) {
      setError("Please enter your email address and password.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // =====================================================
      // 1. SUPABASE AUTHENTICATION
      // =====================================================

      const {
        data: authData,
        error: authError,
      } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        throw authError;
      }

      const user = authData?.user;

      if (!user) {
        throw new Error("Authentication failed. No user was returned.");
      }

      // =====================================================
      // 2. LOAD APPLICATION PROFILE
      // =====================================================

      const {
        data: profile,
        error: profileError,
      } = await supabase
        .from("profiles")
        .select("id, full_name, role, department")
        .eq("id", user.id)
        .maybeSingle();

      if (profileError) {
        console.error("Profile lookup error:", profileError);

        await supabase.auth.signOut();

        throw new Error(
          `Unable to load your profile: ${profileError.message}`
        );
      }

      if (!profile) {
        await supabase.auth.signOut();

        throw new Error(
          "Your account is authenticated, but no profile was found. Please contact the administrator."
        );
      }

      // =====================================================
      // 3. ADMIN LOGIN
      // =====================================================

      if (profile.role === "admin") {
        navigate("/admin", {
          replace: true,
          state: {
            userId: user.id,
            role: "admin",
            profile,
          },
        });

        return;
      }

      // =====================================================
      // 4. COORDINATOR LOGIN
      // =====================================================

      if (profile.role === "coordinator") {
        /*
         * Find the event assigned to this coordinator.
         *
         * event_staff:
         *   event_id
         *   profile_id
         *   role
         *
         * events:
         *   id
         *   name
         *   slug
         */

        const {
          data: staffAssignment,
          error: assignmentError,
        } = await supabase
          .from("event_staff")
          .select(
            `
              event_id,
              role,
              events (
                id,
                name,
                slug
              )
            `
          )
          .eq("profile_id", user.id)
          .eq("role", "coordinator")
          .maybeSingle();

        if (assignmentError) {
          console.error(
            "Coordinator assignment lookup error:",
            assignmentError
          );

          await supabase.auth.signOut();

          throw new Error(
            `Unable to load your event assignment: ${assignmentError.message}`
          );
        }

        if (!staffAssignment) {
          await supabase.auth.signOut();

          throw new Error(
            "Your coordinator account is valid, but no event has been assigned to it yet. Please contact the administrator."
          );
        }

        const assignedEvent = staffAssignment.events;

        navigate("/coordinator", {
          replace: true,
          state: {
            userId: user.id,
            role: "coordinator",
            profile,
            assignment: staffAssignment,
            assignedEvent,
          },
        });

        return;
      }

      // =====================================================
      // 5. UNKNOWN / UNAUTHORIZED ROLE
      // =====================================================

      await supabase.auth.signOut();

      throw new Error(
        "Your account does not have an authorized administrator or coordinator role."
      );
    } catch (loginError) {
      console.error("Login error:", loginError);

      const message = String(loginError?.message || "");
      const lowerMessage = message.toLowerCase();

      if (
        lowerMessage.includes("invalid login credentials") ||
        lowerMessage.includes("invalid credentials")
      ) {
        setError("Invalid email or password.");
      } else if (
        lowerMessage.includes("email not confirmed")
      ) {
        setError(
          "Please confirm this email address in Supabase Authentication."
        );
      } else if (
        lowerMessage.includes("too many requests")
      ) {
        setError(
          "Too many login attempts. Please wait a moment and try again."
        );
      } else {
        setError(
          message || "Unable to login. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <main className="login-page">
        {/* Decorative background elements */}
        <div className="login-web web-left" />
        <div className="login-web web-right" />

        <section className="login-container">
          {/* Top heading */}
          <div className="login-heading">
            <div className="event-chip">
              <IconShield />
              <span>Restricted Access</span>
            </div>

            <h1>Welcome Back</h1>

            <p>
              Sign in to access the REVIBE &apos;26 dashboard.
            </p>
          </div>

          {/* Login card */}
          <div className="login-card">
            <div className="card-accent" />

            <div className="logo-container">
              <img
                src={logoWhite}
                alt="Student Guidance Cell"
                className="login-logo"
              />
            </div>

            <h2>Coordinator &amp; Admin Portal</h2>

            <p className="card-description">
              Sign in using your assigned coordinator or
              administrator account.
            </p>

            <div className="security-line">
              <span className="security-dot" />
              <span>SECURE AUTHENTICATION</span>
            </div>

            <form
              className="login-form"
              onSubmit={handleSubmit}
            >
              {/* Email */}
              <div className="form-group">
                <label htmlFor="identifier">
                  Email Address
                </label>

                <div className="input-wrapper">
                  <span className="input-icon">
                    <IconMail />
                  </span>

                  <input
                    id="identifier"
                    type="email"
                    name="identifier"
                    value={formValues.identifier}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    autoComplete="username"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Password */}
              <div className="form-group">
                <label htmlFor="password">
                  Password
                </label>

                <div className="input-wrapper">
                  <span className="input-icon">
                    <IconLock />
                  </span>

                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formValues.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    disabled={loading}
                  />

                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() =>
                      setShowPassword(
                        (previous) => !previous
                      )
                    }
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                    disabled={loading}
                  >
                    <IconEye open={showPassword} />
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="login-error">
                  <span className="error-mark">!</span>
                  <span>{error}</span>
                </div>
              )}

              {/* Login button */}
              <button
                type="submit"
                className="login-button"
                disabled={loading}
              >
                <span>
                  {loading ? "Signing In..." : "Login"}
                </span>

                {!loading && <IconArrow />}

                {loading && (
                  <span className="loading-spinner" />
                )}
              </button>
            </form>

            {/* Portal information */}
            <div className="portal-info">
              <div className="info-icon">
                <IconCalendar />
              </div>

              <div>
                <strong>REVIBE &apos;26</strong>
                <span>
                  National Level Symposium
                </span>
              </div>
            </div>

            <div className="login-footer">
              This portal is exclusively for authorized
              <strong>
                {" "}
                coordinators and administrators
              </strong>
              .
            </div>
          </div>

          <p className="copyright">
            Student Guidance Cell • REVIBE &apos;26
          </p>
        </section>
      </main>

      <style>{`
        .login-page {
          min-height: 100vh;
          width: 100%;
          position: relative;
          overflow: hidden;

          background:
            radial-gradient(
              circle at 15% 15%,
              rgba(229, 57, 53, 0.07),
              transparent 28%
            ),
            radial-gradient(
              circle at 85% 80%,
              rgba(229, 57, 53, 0.05),
              transparent 30%
            ),
            #ffffff;

          color: #171717;

          display: flex;
          align-items: center;
          justify-content: center;

          padding: 4rem 1.25rem;
          box-sizing: border-box;
        }

        .login-container {
          width: 100%;
          max-width: 480px;

          position: relative;
          z-index: 2;

          display: flex;
          flex-direction: column;
          align-items: center;
        }

        /* =====================================================
           DECORATIVE WEB ELEMENTS
           ===================================================== */

        .login-web {
          position: absolute;
          width: 250px;
          height: 250px;
          opacity: 0.13;
          pointer-events: none;
        }

        .web-left {
          top: -100px;
          left: -100px;

          border-radius: 50%;
          border: 2px solid #d6d6d6;

          box-shadow:
            25px 25px 0 -23px #d6d6d6,
            50px 50px 0 -48px #d6d6d6,
            75px 75px 0 -73px #d6d6d6,
            100px 100px 0 -98px #d6d6d6;
        }

        .web-right {
          bottom: -100px;
          right: -100px;

          border-radius: 50%;
          border: 2px solid #d6d6d6;

          box-shadow:
            -25px -25px 0 -23px #d6d6d6,
            -50px -50px 0 -48px #d6d6d6,
            -75px -75px 0 -73px #d6d6d6,
            -100px -100px 0 -98px #d6d6d6;
        }

        /* =====================================================
           HEADING
           ===================================================== */

        .login-heading {
          text-align: center;
          margin-bottom: 1.5rem;
        }

        .event-chip {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.45rem;

          padding: 0.4rem 0.8rem;

          border: 1px solid #e2b900;
          background: #fffdf2;

          color: #987900;

          font-family: 'Orbitron', sans-serif;
          font-size: 0.62rem;
          font-weight: 700;

          letter-spacing: 0.13em;
          text-transform: uppercase;

          margin-bottom: 1rem;
        }

        .event-chip svg {
          width: 14px;
          height: 14px;
        }

        .login-heading h1 {
          margin: 0;

          font-family: 'Bangers', cursive;
          font-size: clamp(2.5rem, 7vw, 3.6rem);
          font-weight: 400;

          line-height: 1;

          letter-spacing: 0.025em;

          color: #111111;
        }

        .login-heading p {
          margin: 0.7rem 0 0;

          color: #666666;

          font-family: 'Poppins', sans-serif;
          font-size: 0.9rem;

          line-height: 1.6;
        }

        /* =====================================================
           CARD
           ===================================================== */

        .login-card {
          width: 100%;
          position: relative;

          box-sizing: border-box;

          background: #ffffff;

          border: 1px solid #eeeeee;

          padding: 2rem;

          box-shadow:
            0 15px 45px rgba(0, 0, 0, 0.08),
            0 3px 12px rgba(220, 0, 0, 0.04);
        }

        .card-accent {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;

          height: 3px;

          background: linear-gradient(
            90deg,
            #e60000,
            #ff4020,
            #e60000
          );
        }

        .logo-container {
          display: flex;
          justify-content: center;

          margin-bottom: 1rem;
        }

        .login-logo {
          width: 68px;
          height: 68px;

          object-fit: contain;

          border-radius: 50%;

          /*
           * Keeps the SGC logo visible even if the supplied
           * logo asset contains white areas.
           */
          background: #ffffff;

          filter: drop-shadow(
            0 5px 12px rgba(0, 0, 0, 0.1)
          );
        }

        .login-card h2 {
          margin: 0;

          text-align: center;

          color: #161616;

          font-family: 'Orbitron', sans-serif;
          font-size: 1.08rem;
          font-weight: 800;

          letter-spacing: 0.025em;
        }

        .card-description {
          max-width: 350px;

          margin: 0.55rem auto 1.15rem;

          text-align: center;

          color: #707070;

          font-family: 'Poppins', sans-serif;
          font-size: 0.83rem;

          line-height: 1.6;
        }

        /* =====================================================
           SECURITY LINE
           ===================================================== */

        .security-line {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.45rem;

          margin-bottom: 1.35rem;

          color: #999999;

          font-family: 'Orbitron', sans-serif;
          font-size: 0.55rem;
          font-weight: 700;

          letter-spacing: 0.14em;
        }

        .security-dot {
          width: 6px;
          height: 6px;

          border-radius: 50%;

          background: #e60000;

          box-shadow:
            0 0 0 3px rgba(230, 0, 0, 0.08);
        }

        /* =====================================================
           FORM
           ===================================================== */

        .login-form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.45rem;
        }

        .form-group label {
          color: #292929;

          font-family: 'Orbitron', sans-serif;
          font-size: 0.64rem;
          font-weight: 700;

          letter-spacing: 0.1em;
          text-transform: uppercase;
        }

        .input-wrapper {
          position: relative;

          display: flex;
          align-items: center;
        }

        .input-icon {
          position: absolute;
          left: 0.9rem;

          display: flex;
          align-items: center;
          justify-content: center;

          width: 17px;
          height: 17px;

          color: #e60000;

          pointer-events: none;

          z-index: 1;
        }

        .input-icon svg {
          width: 100%;
          height: 100%;
        }

        .form-group input {
          width: 100%;
          height: 48px;

          box-sizing: border-box;

          border: 1px solid #dddddd;

          background: #fafafa;

          color: #191919;

          padding: 0 2.8rem;

          font-family: 'Poppins', sans-serif;
          font-size: 0.84rem;

          transition:
            border-color 0.2s ease,
            box-shadow 0.2s ease,
            background 0.2s ease;
        }

        .form-group input::placeholder {
          color: #aaaaaa;
        }

        .form-group input:hover {
          border-color: #cccccc;
        }

        .form-group input:focus {
          outline: none;

          background: #ffffff;

          border-color: #e60000;

          box-shadow:
            0 0 0 3px rgba(230, 0, 0, 0.07);
        }

        .form-group input:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .password-toggle {
          position: absolute;
          right: 0.65rem;

          width: 30px;
          height: 30px;

          display: flex;
          align-items: center;
          justify-content: center;

          border: 0;
          background: transparent;

          color: #999999;

          padding: 0;

          cursor: pointer;

          transition: color 0.2s ease;
        }

        .password-toggle:hover,
        .password-toggle:focus-visible {
          color: #e60000;
        }

        .password-toggle:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .password-toggle svg {
          width: 18px;
          height: 18px;
        }

        /* =====================================================
           ERROR
           ===================================================== */

        .login-error {
          display: flex;
          align-items: flex-start;
          gap: 0.6rem;

          padding: 0.75rem 0.85rem;

          border: 1px solid #f0aaaa;

          background: #fff5f5;

          color: #c40000;

          font-family: 'Poppins', sans-serif;
          font-size: 0.76rem;

          line-height: 1.5;
        }

        .error-mark {
          flex: 0 0 auto;

          display: flex;
          align-items: center;
          justify-content: center;

          width: 17px;
          height: 17px;

          border-radius: 50%;

          background: #e60000;

          color: #ffffff;

          font-family: Arial, sans-serif;
          font-size: 0.68rem;
          font-weight: 700;
        }

        /* =====================================================
           LOGIN BUTTON
           ===================================================== */

        .login-button {
          width: 100%;
          min-height: 49px;

          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.55rem;

          margin-top: 0.35rem;

          border: 0;

          background: linear-gradient(
            90deg,
            #e60000,
            #ff351c
          );

          color: #ffffff;

          font-family: 'Orbitron', sans-serif;
          font-size: 0.72rem;
          font-weight: 800;

          letter-spacing: 0.13em;
          text-transform: uppercase;

          cursor: pointer;

          box-shadow:
            0 8px 20px rgba(230, 0, 0, 0.2);

          transition:
            transform 0.2s ease,
            box-shadow 0.2s ease,
            opacity 0.2s ease;
        }

        .login-button:hover:not(:disabled) {
          transform: translateY(-2px);

          box-shadow:
            0 11px 25px rgba(230, 0, 0, 0.27);
        }

        .login-button:active:not(:disabled) {
          transform: translateY(0);
        }

        .login-button:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }

        .login-button svg {
          width: 16px;
          height: 16px;
        }

        .loading-spinner {
          width: 15px;
          height: 15px;

          border: 2px solid rgba(255, 255, 255, 0.35);
          border-top-color: #ffffff;

          border-radius: 50%;

          animation: login-spin 0.7s linear infinite;
        }

        @keyframes login-spin {
          to {
            transform: rotate(360deg);
          }
        }

        /* =====================================================
           PORTAL INFO
           ===================================================== */

        .portal-info {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.7rem;

          margin-top: 1.35rem;
          padding-top: 1.1rem;

          border-top: 1px solid #eeeeee;
        }

        .info-icon {
          width: 30px;
          height: 30px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 50%;

          background: #fff1f1;

          color: #e60000;
        }

        .info-icon svg {
          width: 16px;
          height: 16px;
        }

        .portal-info div:last-child {
          display: flex;
          flex-direction: column;
          gap: 0.1rem;
        }

        .portal-info strong {
          color: #222222;

          font-family: 'Orbitron', sans-serif;
          font-size: 0.68rem;

          letter-spacing: 0.08em;
        }

        .portal-info span {
          color: #888888;

          font-family: 'Poppins', sans-serif;
          font-size: 0.68rem;
        }

        /* =====================================================
           FOOTER
           ===================================================== */

        .login-footer {
          margin-top: 1rem;

          color: #999999;

          text-align: center;

          font-family: 'Poppins', sans-serif;
          font-size: 0.69rem;

          line-height: 1.5;
        }

        .login-footer strong {
          color: #666666;
        }

        .copyright {
          margin: 1.2rem 0 0;

          color: #b0b0b0;

          font-family: 'Orbitron', sans-serif;
          font-size: 0.55rem;

          letter-spacing: 0.1em;
          text-transform: uppercase;

          text-align: center;
        }

        /* =====================================================
           RESPONSIVE
           ===================================================== */

        @media (max-width: 600px) {
          .login-page {
            padding: 2.5rem 1rem;
          }

          .login-card {
            padding: 1.6rem 1.25rem;
          }

          .login-heading {
            margin-bottom: 1.2rem;
          }

          .login-heading h1 {
            font-size: 2.7rem;
          }

          .login-heading p {
            font-size: 0.82rem;
          }

          .login-web {
            opacity: 0.08;
          }
        }

        @media (max-width: 380px) {
          .login-page {
            padding: 2rem 0.75rem;
          }

          .login-card {
            padding: 1.4rem 1rem;
          }

          .login-heading h1 {
            font-size: 2.35rem;
          }

          .event-chip {
            font-size: 0.55rem;
          }

          .login-card h2 {
            font-size: 0.95rem;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .login-button,
          .form-group input,
          .password-toggle {
            transition: none;
          }

          .loading-spinner {
            animation: none;
          }
        }
      `}</style>
    </>
  );
}