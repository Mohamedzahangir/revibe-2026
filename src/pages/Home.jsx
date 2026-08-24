import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const COUNTDOWN_TARGET = new Date("2026-09-12T09:00:00").getTime();

function useCountdown(target) {
  const getRemaining = () => {
    const diff = Math.max(0, target - Date.now());
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    return { diff, days, hours, minutes, seconds };
  };

  const [remaining, setRemaining] = useState(getRemaining);

  useEffect(() => {
    const id = setInterval(() => setRemaining(getRemaining()), 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return remaining;
}

function TimerUnit({ value, label }) {
  return (
    <div className="timer-unit">
      <span className="timer-value">
        {String(value).padStart(2, "0")}
      </span>
      <span className="timer-label">{label}</span>
    </div>
  );
}

function CornerWeb({ className = "" }) {
  return (
    <svg
      className={`corner-web ${className}`}
      viewBox="0 0 160 160"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
      focusable="false"
    >
      <g
        stroke="rgba(220, 0, 0, 0.45)"
        strokeWidth="0.9"
        strokeLinecap="round"
        fill="none"
      >
        {/* radial strands from the corner origin (0,0) */}
        <path d="M0 0 L160 12" />
        <path d="M0 0 L160 34" />
        <path d="M0 0 L160 58" />
        <path d="M0 0 L160 86" />
        <path d="M0 0 L160 116" />
        <path d="M0 0 L160 150" />
        <path d="M0 0 L12 160" />
        <path d="M0 0 L34 160" />
        <path d="M0 0 L58 160" />
        <path d="M0 0 L86 160" />
        <path d="M0 0 L116 160" />
        <path d="M0 0 L150 160" />
        {/* concentric arcs — irregular for organic feel */}
        <path d="M22 0 A22 22 0 0 1 0 22" />
        <path d="M44 0 A44 44 0 0 1 0 44" strokeWidth="0.7" />
        <path d="M68 0 A68 68 0 0 1 0 68" />
        <path d="M94 0 A94 94 0 0 1 0 94" strokeWidth="0.7" />
        <path d="M122 0 A122 122 0 0 1 0 122" />
        {/* tiny dewdrops on strands */}
        <circle cx="18" cy="6" r="1.1" fill="rgba(220,0,0,0.35)" stroke="none" />
        <circle cx="6" cy="38" r="0.9" fill="rgba(220,0,0,0.3)" stroke="none" />
        <circle cx="40" cy="40" r="1" fill="rgba(220,0,0,0.28)" stroke="none" />
      </g>
      {/* small spider hanging on the web */}
      <g transform="translate(30 30)" opacity="0.6">
        <ellipse cx="0" cy="0" rx="3.2" ry="2.4" fill="#0d0d0d" />
        <circle cx="0" cy="-2.4" r="1.6" fill="#0d0d0d" />
        <g stroke="#0d0d0d" strokeWidth="0.6" strokeLinecap="round" fill="none">
          <path d="M-2.6 -0.8 L-6 -2.4" />
          <path d="M2.6 -0.8 L6 -2.4" />
          <path d="M-2.4 0.8 L-6.4 1.2" />
          <path d="M2.4 0.8 L6.4 1.2" />
          <path d="M-2 1.8 L-5 4" />
          <path d="M2 1.8 L5 4" />
        </g>
      </g>
    </svg>
  );
}

export default function Home() {
  const { diff, days, hours, minutes, seconds } = useCountdown(COUNTDOWN_TARGET);
  const ended = diff <= 0;

  return (
    <>
      <main className="theme-page home-page">
        <section className="page-hero home-hero" aria-labelledby="hero-title">
          <CornerWeb className="corner-web hero-web-tl" />
          <div className="hero-particles" aria-hidden="true">
            <span className="hero-particle" />
            <span className="hero-particle" />
            <span className="hero-particle" />
            <span className="hero-particle" />
            <span className="hero-particle" />
          </div>
          <div className="page-shell">
            <div className="hero-copy">
              <h1 id="hero-title" className="display-title">Revibe <span className="display-year">'26</span></h1>
              <p className="hero-subtitle">National Level Symposium</p>

              <p className="hero-description">
                A student-driven national symposium that brings together creativity,
                technology and participation under one web-powered experience.
              </p>

              <div className="hero-meta" aria-label="REVIBE '26 event overview">
                <span>13 Events</span>
                <span>6 Technical</span>
                <span>7 Non-Technical</span>
              </div>

              <div className="countdown-block" aria-label="Time until REVIBE '26 begins">
                <CornerWeb className="corner-web timer-web-tr" />
                {ended ? (
                  <p className="countdown-ended">The web has awakened.</p>
                ) : (
                  <>
                    <p className="countdown-heading">Symposium begins in</p>
                    <div className="timer-row">
                      <TimerUnit value={days} label="Days" />
                      <span className="timer-sep" aria-hidden="true">:</span>
                      <TimerUnit value={hours} label="Hours" />
                      <span className="timer-sep" aria-hidden="true">:</span>
                      <TimerUnit value={minutes} label="Mins" />
                      <span className="timer-sep" aria-hidden="true">:</span>
                      <TimerUnit value={seconds} label="Secs" />
                    </div>
                    <p className="countdown-target">
                      12 September 2026 • 9:00 AM
                    </p>
                  </>
                )}
              </div>

              <div className="cta-row">
                <Link to="/events" className="primary-btn">Enter the Web</Link>
                <Link to="/register" className="secondary-btn">Register</Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <style>{`
        .theme-page {
          width: 100%;
          color: #1a1a1a;
          overflow-x: hidden;
          background: #f4f1ec;
        }

        .page-shell {
          width: min(1200px, calc(100% - 2rem));
          margin: 0 auto;
        }

        .page-hero {
          position: relative;
          padding: 5rem 0 4rem;
          background:
            radial-gradient(circle at 20% 30%, rgba(220, 0, 0, 0.10), transparent 32%),
            radial-gradient(circle at 80% 70%, rgba(220, 0, 0, 0.08), transparent 30%),
            linear-gradient(180deg, #f7f4ef 0%, #ece7df 100%);
          overflow: hidden;
        }

        .page-hero .page-shell {
          display: flex;
          justify-content: center;
        }

        .hero-copy {
          max-width: 820px;
          text-align: center;
          position: relative;
          z-index: 1;
        }

        .display-title {
          margin: 1.4rem 0 0;
          font-family: 'Brusher', cursive;
          font-size: clamp(4rem, 13vw, 10rem);
          line-height: 1;
          letter-spacing: 0.04em;
          color: #0d0d0d;
          word-break: break-word;
          display: flex;
          align-items: baseline;
          justify-content: center;
          gap: 0.1em;
        }

        .display-year {
          font-family: 'Brusher', cursive;
          font-size: clamp(2.2rem, 7vw, 4.5rem);
          line-height: 1;
          letter-spacing: 0.06em;
          color: #dc0000;
        }

        .hero-subtitle {
          margin: 0.5rem 0 0;
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(1rem, 2.2vw, 1.4rem);
          font-weight: 400;
          letter-spacing: 0.18em;
          color: #dc0000;
          text-transform: uppercase;
        }

        .hero-description {
          max-width: 620px;
          margin: 1rem auto 0;
          font-family: 'Inter', sans-serif;
          font-size: 1.05rem;
          line-height: 1.7;
          color: #3a3a3a;
        }

        .hero-meta {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 0.75rem;
          margin-top: 1.5rem;
        }

        .hero-meta span {
          padding: 0.55rem 0.9rem;
          border: 1px solid rgba(220, 0, 0, 0.45);
          background: linear-gradient(135deg, rgba(255,255,255,0.7), rgba(220, 0, 0, 0.06));
          color: #0d0d0d;
          font-family: 'Bebas Neue', sans-serif;
          font-size: 0.82rem;
          font-weight: 400;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .hero-meta span:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 14px rgba(220, 0, 0, 0.15);
        }

        /* =====================================================
           COUNTDOWN
           ===================================================== */

        .countdown-block {
          position: relative;
          margin: 2.25rem auto 0;
          max-width: 640px;
          padding: 1.75rem 1.25rem;
          border: 1px solid rgba(220, 0, 0, 0.35);
          border-radius: 16px;
          background:
            linear-gradient(135deg, rgba(255, 255, 255, 0.75), rgba(255, 255, 255, 0.55));
          box-shadow:
            0 10px 30px rgba(0, 0, 0, 0.08),
            inset 0 1px 0 rgba(255, 255, 255, 0.8);
          overflow: hidden;
        }

        .countdown-block::after {
          content: "";
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 3px;
          background: linear-gradient(90deg, transparent, rgba(220, 0, 0, 0.5), transparent);
        }

        /* =====================================================
           CORNER WEB DECORATIONS
           ===================================================== */

        .corner-web {
          position: absolute;
          pointer-events: none;
          z-index: 0;
        }

        .hero-web-tl {
          top: 0;
          left: 0;
          width: 220px;
          height: 220px;
          opacity: 0.55;
        }

        .hero-particles {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 0;
        }

        .hero-particle {
          position: absolute;
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: rgba(220, 0, 0, 0.25);
          box-shadow: 0 0 6px rgba(220, 0, 0, 0.3);
          animation: hero-float 9s ease-in-out infinite;
        }

        .hero-particle:nth-child(1) { top: 18%; left: 12%; animation-delay: 0s; }
        .hero-particle:nth-child(2) { top: 32%; left: 82%; animation-delay: 1.4s; }
        .hero-particle:nth-child(3) { top: 58%; left: 22%; animation-delay: 2.8s; }
        .hero-particle:nth-child(4) { top: 72%; left: 68%; animation-delay: 4.2s; }
        .hero-particle:nth-child(5) { top: 44%; left: 50%; animation-delay: 5.6s; }

        @keyframes hero-float {
          0%, 100% { transform: translateY(0) scale(1); opacity: 0.25; }
          50% { transform: translateY(-14px) scale(1.4); opacity: 0.5; }
        }

        .timer-web-tr {
          top: -10px;
          right: -10px;
          width: 110px;
          height: 110px;
          transform: scaleX(-1);
          opacity: 0.5;
        }

        .countdown-block > *:not(.corner-web) {
          position: relative;
          z-index: 1;
        }

        .countdown-heading {
          margin: 0 0 0.9rem;
          font-family: 'Bebas Neue', sans-serif;
          font-size: 1.3rem;
          letter-spacing: 0.1em;
          color: #0d0d0d;
          text-transform: uppercase;
        }

        .timer-row {
          display: flex;
          align-items: flex-start;
          justify-content: center;
          gap: 0.5rem;
          flex-wrap: nowrap;
        }

        .timer-unit {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.3rem;
          min-width: 3.2rem;
        }

        .timer-value {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(2rem, 6vw, 3.2rem);
          line-height: 1;
          color: #dc0000;
          background: linear-gradient(180deg, #1a1a1a, #0d0d0d);
          border: 1px solid rgba(220, 0, 0, 0.3);
          border-radius: 10px;
          padding: 0.55rem 0.65rem;
          min-width: 2.6rem;
          text-align: center;
          box-shadow:
            0 4px 12px rgba(0, 0, 0, 0.2),
            inset 0 1px 0 rgba(220, 0, 0, 0.15);
        }

        .timer-label {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 0.72rem;
          font-weight: 400;
          letter-spacing: 0.1em;
          color: #3a3a3a;
          text-transform: uppercase;
        }

        .timer-sep {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(2rem, 6vw, 3.2rem);
          line-height: 1;
          color: #0d0d0d;
          padding-top: 0.5rem;
        }

        .countdown-target {
          margin: 1rem 0 0;
          font-family: 'Bebas Neue', sans-serif;
          font-size: 0.88rem;
          font-weight: 400;
          letter-spacing: 0.1em;
          color: #6a6a6a;
          text-transform: uppercase;
        }

        .countdown-ended {
          margin: 0;
          font-family: 'Bebas Neue', sans-serif;
          font-size: 2rem;
          letter-spacing: 0.08em;
          color: #dc0000;
          text-transform: uppercase;
        }

        /* =====================================================
           CTA
           ===================================================== */

        .cta-row {
          display: flex;
          justify-content: center;
          flex-wrap: wrap;
          gap: 1rem;
          margin-top: 2rem;
        }

        .primary-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          min-height: 50px;
          padding: 0.95rem 1.9rem;
          border: 2px solid #0d0d0d;
          border-radius: 999px;
          font-family: 'Bebas Neue', sans-serif;
          font-size: 1.1rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          text-decoration: none;
          background: #dc0000;
          color: #ffffff;
          box-shadow: 0 8px 22px rgba(220, 0, 0, 0.35);
          transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
        }

        .primary-btn::after {
          content: "→";
          font-family: 'Inter', sans-serif;
          font-size: 1rem;
          transition: transform 0.2s ease;
        }

        .primary-btn:hover,
        .primary-btn:focus-visible {
          transform: translateY(-3px);
          background: #0d0d0d;
          color: #ffffff;
          box-shadow: 0 14px 30px rgba(0, 0, 0, 0.35);
        }

        .primary-btn:hover::after,
        .primary-btn:focus-visible::after {
          transform: translateX(4px);
        }

        .secondary-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          min-height: 50px;
          padding: 0.95rem 1.9rem;
          border: 2px solid #0d0d0d;
          border-radius: 999px;
          font-family: 'Bebas Neue', sans-serif;
          font-size: 1.1rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          text-decoration: none;
          background: transparent;
          color: #0d0d0d;
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.08);
          transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease, color 0.2s ease;
        }

        .secondary-btn:hover,
        .secondary-btn:focus-visible {
          transform: translateY(-3px);
          background: #0d0d0d;
          color: #ffffff;
          box-shadow: 0 14px 30px rgba(0, 0, 0, 0.3);
        }

        /* =====================================================
           RESPONSIVE
           ===================================================== */

        @media (max-width: 1024px) {
          .page-hero {
            padding: 4rem 0 3rem;
          }
        }

        @media (max-width: 768px) {
          .page-hero {
            padding: 3.5rem 0 2.5rem;
          }

          .hero-description {
            font-size: 1rem;
          }
        }

        @media (max-width: 430px) {
          .page-shell {
            width: min(1200px, calc(100% - 1.6rem));
          }

          .page-hero {
            padding: 3rem 0 2rem;
          }

          .hero-meta span {
            padding: 0.5rem 0.7rem;
            font-size: 0.74rem;
          }

          .primary-btn,
          .secondary-btn {
            min-height: 46px;
            padding: 0.75rem 1.3rem;
            font-size: 0.98rem;
          }

          .cta-row {
            gap: 0.7rem;
          }

          .timer-unit {
            min-width: 2.4rem;
          }

          .timer-value {
            padding: 0.4rem 0.45rem;
            min-width: 2rem;
          }
        }

        @media (max-width: 360px) {
          .timer-row {
            gap: 0.25rem;
          }

          .timer-sep {
            display: none;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .primary-btn,
          .primary-btn::after {
            transition: none;
          }

          .hero-particle {
            animation: none;
          }
        }
      `}</style>
    </>
  );
}
