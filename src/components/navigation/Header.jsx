import { Link } from "react-router-dom";

import logoWhite from "../../assets/logos/logo-white.png";
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
            <Link
              to="/"
              className="brand-link sgc-brand-link"
              aria-label="REVIBE '26 Home"
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
            </Link>

            {/* REVIBE IDENTITY */}
            <span className="sgc-brand-event">
              REVIBE '26
            </span>

            {/* LOGIN / REGISTER */}
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

              <WebNode
                label="Login"
                to="/login"
                className="header-action-secondary"
                variant="action"
              />
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
              90deg,
              rgba(18, 5, 0, 0.98),
              rgba(5, 5, 5, 0.98),
              rgba(18, 0, 0, 0.98)
            );

          border-bottom:
            1px solid rgba(220, 0, 0, 0.45);

          backdrop-filter: blur(10px);

          box-shadow:
            0 8px 24px rgba(0, 0, 0, 0.3);

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
              rgba(245, 197, 66, 0.12),
              transparent 22%
            ),

            radial-gradient(
              circle at 88% 50%,
              rgba(220, 0, 0, 0.12),
              transparent 24%
            );

          pointer-events: none;
        }


        /* =====================================================
           HEADER INNER
           ===================================================== */

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
          display: grid;

          grid-template-columns:
            minmax(0, 1fr)
            auto
            minmax(0, 1fr);

          align-items: center;

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

          color: #ffffff;

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
          font-family: "Orbitron", sans-serif;

          font-size: 0.95rem;

          font-weight: 800;

          letter-spacing: 0.1em;

          color: #ffffff;
        }


        .sgc-brand-subtitle {
          margin-top: 0.18rem;

          font-family: "Rajdhani", sans-serif;

          font-size: 0.62rem;

          color: #a1a1aa;

          letter-spacing: 0.055em;

          text-transform: uppercase;

          white-space: nowrap;
        }


        /* =====================================================
           REVIBE 26
           ===================================================== */

       .sgc-brand-event {
  justify-self: center;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);

  font-family: "Bangers", cursive;
  font-size: clamp(2rem, 6vw, 5rem);
  line-height: 1;
  letter-spacing: 0.05em;
  color: #ffffff;
  white-space: nowrap;
  text-align: center;
  text-decoration: none;

  text-shadow:
    0 0 10px rgba(220, 0, 0, 0.35);
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
          background: #f5c542;

          border-color: #f5c542;

          color: #1a1000;

          font-weight: 800;

          box-shadow:
            0 0 12px rgba(245, 197, 66, 0.28);
        }


        .header-action-primary:hover {
          background: #ffd45c;

          border-color: #ffd45c;

          box-shadow:
            0 0 16px rgba(245, 197, 66, 0.42);
        }


        /* LOGIN */

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
           DESKTOP NAVIGATION
           ===================================================== */

        .header-row-two {
          display: flex;

          justify-content: center;

          width: 100%;

          margin-top: 0.55rem;

          padding-top: 0.55rem;

          border-top:
            1px solid rgba(255, 255, 255, 0.07);

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


          /*
             ROW 1

             SGC       REVIBE       REGISTER LOGIN
          */

          .header-row-one {
            grid-template-columns:
              minmax(0, 1fr)
              auto
              auto;

            gap: 0.3rem;
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


          /* REVIBE */

          .sgc-brand-event {
            font-size: 0.92rem;

            padding:
              0 0.15rem;
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


          /*
             Hide desktop nav
          */

          .desktop-header-navigation {
            display: none;
          }


          /*
             Show mobile nav
          */

          .mobile-header-navigation {
            display: block;

            width: 100%;

            margin-top: 0.45rem;
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


          .sgc-brand-event {
            font-size: 0.82rem;

            padding: 0 0.1rem;
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


          .sgc-brand-event {
            font-size: 0.74rem;
          }


          .header-action-primary,
          .header-action-secondary {
            min-height: 1.55rem;

            padding:
              0.22rem
              0.28rem;

            font-size: 0.38rem;
          }
        }

      `}</style>
    </>
  );
}