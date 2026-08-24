import { Link } from "react-router-dom";

import logoWhite from "../../assets/logos/logo-white.png";
import spideyWebm from "../../assets/videos/hanging-spidey-Picsart-BackgroundRemover.webm";
import DesktopWebNav from "./DesktopWebNav";
import MobileWebNav from "./MobileWebNav";
import WebNode from "./WebNode";

export default function Header() {
  return (
    <>
      <header className="site-header">
        <div className="header-inner">

          {/* =================================================
              TOP HEADER
              ================================================= */}

          <div className="header-row-one">

            {/* SGC BRAND */}
            <a
              href="https://teamsgc.in"
              target="_blank"
              rel="noopener noreferrer"
              className="brand-link sgc-brand-link"
              aria-label="Visit the official Student Guidance Cell website (teamsgc.in)"
            >
              <img
                src={logoWhite}
                alt="Student Guidance Cell logo"
                className="sgc-logo"
              />

              <span
                className="sgc-brand-copy"
                aria-label="Student Guidance Cell"
              >
                <span className="sgc-brand-name">
                  SGC
                </span>

                <span className="sgc-brand-subtitle">
                  Student Guidance Cell
                </span>
              </span>
            </a>

            {/* REVIBE IDENTITY */}
            <span className="sgc-brand-event">
              REVIBE '26
            </span>

            {/* REGISTER + HANGING SPIDEY */}
            <div
              className="header-actions-slot"
              aria-label="Account actions"
            >
              <WebNode
                label="Register"
                to="/register"
                className="header-action-primary"
                variant="action"
              />

              <Link
                to="/register"
                className="spidey-hang"
                aria-label="Register now to become a spidey"
              >
                <video
                  className="spidey-hang-video"
                  src={spideyWebm}
                  autoPlay
                  loop
                  muted
                  playsInline
                />

                <span className="spidey-hang-dialog" role="tooltip">
                  <span className="spidey-hang-dialog-text">
                    Register now to become a spidey
                  </span>
                  <span className="spidey-hang-dialog-arrow" aria-hidden="true" />
                </span>
              </Link>
            </div>

          </div>

          {/* =================================================
              DESKTOP NAVIGATION
              ================================================= */}

          <div className="header-row-two desktop-header-navigation">
            <DesktopWebNav />
          </div>

          {/* =================================================
              MOBILE NAVIGATION
              ================================================= */}

          <div className="mobile-header-navigation">
            <MobileWebNav />
          </div>

        </div>
      </header>

      <style>{`

        /* =====================================================
           MAIN HEADER
           ===================================================== */

        .site-header {
          position: sticky;
          top: 0;
          z-index: 20;

          width: 100%;

          background:
            linear-gradient(
              180deg,
              rgba(247, 244, 239, 0.96) 0%,
              rgba(236, 231, 223, 0.94) 100%
            );

          border-bottom:
            1px solid rgba(220, 0, 0, 0.22);

          backdrop-filter: blur(14px) saturate(140%);

          box-shadow:
            0 8px 28px rgba(0, 0, 0, 0.22),
            0 2px 6px rgba(0, 0, 0, 0.14);

          overflow: visible;
        }


        /* =====================================================
           SUBTLE SPIDER WEB GLOW
           ===================================================== */

        .site-header::before {
          content: "";

          position: absolute;
          inset: 0;

          background:
            radial-gradient(
              circle at 12% 50%,
              rgba(220, 0, 0, 0.08),
              transparent 22%
            ),

            radial-gradient(
              circle at 88% 50%,
              rgba(220, 0, 0, 0.10),
              transparent 24%
            );

          pointer-events: none;
        }

        .header-inner {
          position: relative;
          z-index: 1;

          width: 100%;
          max-width: 1280px;

          margin: 0 auto;

          padding:
            0.7rem
            1rem;

          box-sizing: border-box;
        }


        /* =====================================================
           TOP ROW
           ===================================================== */

        .header-row-one {
          position: relative;
          display: flex;

          align-items: center;
          justify-content: space-between;

          width: 100%;

          gap: 0.6rem;
        }


        /* =====================================================
           SGC BRAND
           ===================================================== */

        .brand-link {
          display: inline-flex;

          align-items: center;

          gap: 0.55rem;

          min-width: 0;

          justify-self: start;

          color: #0d0d0d;

          text-decoration: none;
        }


        .sgc-logo {
          width: 38px;
          height: 38px;

          object-fit: contain;

          flex-shrink: 0;

          filter:
            drop-shadow(
              0 0 10px rgba(220, 0, 0, 0.35)
            );
        }


        .sgc-brand-copy {
          display: flex;

          flex-direction: column;

          min-width: 0;

          line-height: 1;
        }


        .sgc-brand-name {
          font-family: "Bebas Neue", sans-serif;

          font-size: 0.95rem;

          font-weight: 400;

          letter-spacing: 0.1em;

          color: #0d0d0d;
        }


        .sgc-brand-subtitle {
          margin-top: 0.18rem;

          font-family: "Inter", sans-serif;

          font-size: 0.62rem;

          color: #6a6a6a;

          letter-spacing: 0.055em;

          text-transform: uppercase;

          white-space: nowrap;
        }


        /* =====================================================
           REVIBE 26
           Grid-centered via justify-self (NOT position:absolute).
           An earlier version used position:absolute here, which
           removed this element from the 3-column grid entirely —
           that collapsed the grid to 2 items and pushed the
           Register/Login actions into the middle column, on top
           of the title. Keep this centered via the grid, not
           positioning tricks.
           ===================================================== */

        .sgc-brand-event {
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);

          font-family: "Brusher", cursive;
          font-size: clamp(1.3rem, 2.6vw, 2.2rem);
          line-height: 1;
          letter-spacing: 0.02em;
          color: #0d0d0d;
          white-space: nowrap;
          text-align: center;
          text-decoration: none;
          pointer-events: none;

          text-shadow:
            0 0 10px rgba(220, 0, 0, 0.18);
        }


        /* =====================================================
           ACCOUNT ACTIONS
           ===================================================== */

        .header-actions-slot {
          display: flex;

          align-items: center;

          justify-content: flex-end;

          gap: 0.35rem;

          min-width: 0;

          justify-self: end;
        }


        .header-action-primary,
        .header-action-secondary {
          display: inline-flex;

          align-items: center;
          justify-content: center;

          min-height: 2.05rem;

          padding:
            0.35rem
            0.7rem;

          font-size: 0.62rem;

          white-space: nowrap;

          flex-shrink: 0;

          box-sizing: border-box;
        }


        /* REGISTER */

        .header-action-primary {
          background: #dc0000;

          border-color: #dc0000;

          color: #ffffff;

          font-weight: 800;

          box-shadow:
            0 0 12px rgba(220, 0, 0, 0.28);
        }


        .header-action-primary:hover {
          background: #ff1a1a;

          border-color: #ff1a1a;

          box-shadow:
            0 0 16px rgba(220, 0, 0, 0.42);
        }


        /* LOGIN (legacy, unused) */

        .header-action-secondary {
          background:
            rgba(255, 255, 255, 0.035);

          border-color:
            rgba(255, 255, 255, 0.4);

          color: #ffffff;
        }


        .header-action-secondary:hover {
          background:
            rgba(255, 255, 255, 0.1);

          border-color: #ffffff;
        }


        /* =====================================================
           HANGING SPIDEY (beside Register button)
           ===================================================== */

        .spidey-hang {
          position: relative;
          display: inline-flex;
          align-items: flex-start;
          justify-content: center;

          width: 44px;
          height: 70px;

          flex-shrink: 0;

          text-decoration: none;
          cursor: pointer;
        }

        .spidey-hang::before {
          content: "";
          position: absolute;
          top: 0;
          left: 50%;
          width: 1px;
          height: 22px;
          background: rgba(220, 0, 0, 0.5);
          transform: translateX(-50%);
          z-index: 0;
        }

        .spidey-hang-video {
          position: relative;
          z-index: 1;
          width: 44px;
          height: 44px;
          object-fit: contain;
          display: block;
          pointer-events: none;
          margin-top: 22px;
          filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.22));
          animation: spidey-sway 4s ease-in-out infinite;
          transform-origin: top center;
        }

        @keyframes spidey-sway {
          0%, 100% { transform: rotate(-3deg); }
          50% { transform: rotate(3deg); }
        }

        .spidey-hang-dialog {
          position: absolute;
          top: calc(100% + 10px);
          right: -6px;
          z-index: 40;

          display: block;
          width: max-content;
          max-width: 220px;
          padding: 0.55rem 0.85rem;

          background: #0d0d0d;
          border: 1px solid rgba(220, 0, 0, 0.6);
          border-radius: 10px;
          box-shadow: 0 8px 22px rgba(0, 0, 0, 0.3);

          opacity: 0;
          visibility: hidden;
          transform: translateY(-6px);
          pointer-events: none;

          transition:
            opacity 0.25s ease,
            visibility 0.25s ease,
            transform 0.25s ease;
        }

        .spidey-hang-dialog-text {
          display: block;
          font-family: 'Bebas Neue', sans-serif;
          font-size: 0.78rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #ffffff;
          text-align: center;
          line-height: 1.3;
        }

        .spidey-hang-dialog-arrow {
          position: absolute;
          top: -6px;
          right: 16px;
          width: 10px;
          height: 10px;
          background: #0d0d0d;
          border-left: 1px solid rgba(220, 0, 0, 0.6);
          border-top: 1px solid rgba(220, 0, 0, 0.6);
          transform: rotate(45deg);
        }

        .spidey-hang:hover .spidey-hang-dialog,
        .spidey-hang:focus-visible .spidey-hang-dialog {
          opacity: 1;
          visibility: visible;
          transform: translateY(0);
        }

        .spidey-hang:hover .spidey-hang-video,
        .spidey-hang:focus-visible .spidey-hang-video {
          filter: drop-shadow(0 0 10px rgba(220, 0, 0, 0.4));
        }


        /* =====================================================
           DESKTOP NAVIGATION
           ===================================================== */

        .header-row-two {
          display: flex;

          justify-content: center;

          width: 100%;

          margin-top: 0.55rem;

          padding-top: 0.55rem;

          border-top:
            1px solid rgba(220, 0, 0, 0.22);

          box-sizing: border-box;
        }


        .desktop-header-navigation {
          display: flex;
        }


        /* =====================================================
           MOBILE NAVIGATION
           ===================================================== */

        .mobile-header-navigation {
          display: none;
        }


        /* =====================================================
           DESKTOP
           ===================================================== */

        @media (min-width: 900px) {

          .header-inner {
            padding:
              0.8rem
              1.25rem;
          }

          .sgc-logo {
            width: 42px;
            height: 42px;
          }

          .sgc-brand-name {
            font-size: 1.05rem;
          }

          .sgc-brand-subtitle {
            font-size: 0.7rem;
          }

          .header-action-primary,
          .header-action-secondary {
            min-height: 2.25rem;

            padding:
              0.45rem
              0.9rem;

            font-size: 0.68rem;
          }

          .header-row-two {
            margin-top: 0.7rem;

            padding-top: 0.7rem;
          }
        }


        /* =====================================================
           MOBILE
           ===================================================== */

        @media (max-width: 899px) {

          .header-inner {
            padding:
              0.55rem
              0.45rem
              0;
          }


          /* SGC */

          .sgc-logo {
            width: 31px;
            height: 31px;
          }


          .brand-link {
            gap: 0.35rem;

            min-width: 0;

            overflow: hidden;
          }


          .sgc-brand-name {
            font-size: 0.72rem;
          }


          .sgc-brand-subtitle {
            margin-top: 0.12rem;

            font-size: 0.42rem;

            letter-spacing: 0.025em;

            overflow: hidden;

            text-overflow: ellipsis;
          }


          /* REVIBE — hidden on mobile */

          .sgc-brand-event {
            display: none;
          }


          /* BUTTONS */

          .header-actions-slot {
            gap: 0.2rem;
          }


          .header-action-primary,
          .header-action-secondary {
            min-height: 1.75rem;

            padding:
              0.27rem
              0.42rem;

            font-size: 0.46rem;

            letter-spacing: 0.02em;
          }

          .spidey-hang {
            width: 30px;
            height: 50px;
          }

          .spidey-hang-video {
            width: 30px;
            height: 30px;
            margin-top: 14px;
          }

          .spidey-hang::before {
            height: 14px;
          }

          .spidey-hang-dialog {
            max-width: 160px;
            padding: 0.4rem 0.6rem;
          }

          .spidey-hang-dialog-text {
            font-size: 0.6rem;
          }


          /*
             Hide desktop nav
          */

          .desktop-header-navigation {
            display: none;
          }


          /*
             Show mobile nav — centered, transparent background
          */

          .mobile-header-navigation {
            display: flex;
            justify-content: center;

            width: 100%;

            margin-top: 0.45rem;
            padding-top: 0.55rem;
            border-top: 1px solid rgba(220, 0, 0, 0.22);
          }
        }


        /* =====================================================
           SMALL PHONES
           ===================================================== */

        @media (max-width: 390px) {

          .header-inner {
            padding-left: 0.3rem;
            padding-right: 0.3rem;
          }


          .header-row-one {
            gap: 0.18rem;
          }


          .sgc-logo {
            width: 28px;
            height: 28px;
          }


          .brand-link {
            gap: 0.28rem;
          }


          .sgc-brand-name {
            font-size: 0.66rem;
          }


          .sgc-brand-subtitle {
            display: none;
          }


          .header-actions-slot {
            gap: 0.15rem;
          }


          .header-action-primary,
          .header-action-secondary {
            min-height: 1.65rem;

            padding:
              0.24rem
              0.34rem;

            font-size: 0.42rem;
          }

          .spidey-hang {
            width: 26px;
            height: 44px;
          }

          .spidey-hang-video {
            width: 26px;
            height: 26px;
            margin-top: 12px;
          }

          .spidey-hang::before {
            height: 12px;
          }
        }


        /* =====================================================
           VERY SMALL PHONES
           ===================================================== */

        @media (max-width: 340px) {

          .sgc-logo {
            width: 26px;
            height: 26px;
          }


          .sgc-brand-name {
            font-size: 0.6rem;
          }


          .header-action-primary,
          .header-action-secondary {
            min-height: 1.55rem;

            padding:
              0.22rem
              0.28rem;

            font-size: 0.38rem;
          }

          .spidey-hang {
            width: 24px;
            height: 40px;
          }

          .spidey-hang-video {
            width: 24px;
            height: 24px;
            margin-top: 10px;
          }

          .spidey-hang::before {
            height: 10px;
          }
        }

      `}</style>
    </>
  );
}