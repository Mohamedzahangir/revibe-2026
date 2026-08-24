import logoWhite from "../../assets/logos/logo-white.png";
import DesktopWebNav from "./DesktopWebNav";
import MobileWebNav from "./MobileWebNav";

export default function Header() {
  return (
    <>
      <header className="site-header">
        <div className="header-inner">

          {/* =================================================
              SGC BRAND (left corner)
              ================================================= */}
          <a
            href="https://teamsgc.in"
            target="_blank"
            rel="noopener noreferrer"
            className="nav-brand"
            aria-label="Visit the official Student Guidance Cell website (teamsgc.in)"
          >
            <img
              src={logoWhite}
              alt="Student Guidance Cell logo"
              className="nav-brand-logo"
            />

            <span className="nav-brand-copy" aria-label="Student Guidance Cell">
              <span className="nav-brand-name">SGC</span>
              <span className="nav-brand-subtitle">Student Guidance Cell</span>
            </span>
          </a>

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

          display: flex;
          align-items: center;
          justify-content: center;

          width: 100%;
          max-width: 1280px;

          margin: 0 auto;

          padding:
            0.45rem
            0;

          box-sizing: border-box;
        }


        /* =====================================================
           SGC BRAND
           ===================================================== */

        .nav-brand {
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          z-index: 2;

          display: inline-flex;
          align-items: center;
          gap: 0.5rem;

          min-width: 0;

          color: #0d0d0d;
          text-decoration: none;
        }

        .nav-brand-logo {
          width: 34px;
          height: 34px;

          object-fit: contain;
          flex-shrink: 0;

          filter: drop-shadow(0 0 10px rgba(220, 0, 0, 0.35));
        }

        .nav-brand-copy {
          display: flex;
          flex-direction: column;
          min-width: 0;
          line-height: 1;
        }

        .nav-brand-name {
          font-family: "Bebas Neue", sans-serif;
          font-size: 0.95rem;
          font-weight: 400;
          letter-spacing: 0.1em;
          color: #0d0d0d;
        }

        .nav-brand-subtitle {
          margin-top: 0.16rem;
          font-family: "Inter", sans-serif;
          font-size: 0.62rem;
          color: #6a6a6a;
          letter-spacing: 0.055em;
          text-transform: uppercase;
          white-space: nowrap;
        }


        /* =====================================================
           DESKTOP NAVIGATION
           ===================================================== */

        .header-row-two {
          display: flex;
          justify-content: center;

          flex: 1 1 auto;
          min-width: 0;

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
              0.5rem
              0;
          }

          .nav-brand-logo {
            width: 40px;
            height: 40px;
          }

          .nav-brand-name {
            font-size: 1.05rem;
          }

          .nav-brand-subtitle {
            font-size: 0.7rem;
          }
        }


        /* =====================================================
           MOBILE
           ===================================================== */

        @media (max-width: 899px) {

          .header-inner {
            padding:
              0.4rem
              0;
          }

          /* Logo only — hide name on mobile */
          .nav-brand-copy {
            display: none;
          }

          .nav-brand-logo {
            width: 30px;
            height: 30px;
          }

          .nav-brand {
            gap: 0;
          }

          /*
             Hide desktop nav
          */

          .desktop-header-navigation {
            display: none;
          }

          /*
             Show mobile nav — centered
          */

          .mobile-header-navigation {
            display: flex;
            justify-content: center;

            flex: 1 1 auto;
            min-width: 0;

            padding-bottom: 0.4rem;
          }
        }


        /* =====================================================
           SMALL PHONES
           ===================================================== */

        @media (max-width: 390px) {

          .nav-brand-logo {
            width: 27px;
            height: 27px;
          }
        }

      `}</style>
    </>
  );
}
