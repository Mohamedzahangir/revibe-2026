import WebNode from "./WebNode";

const navItems = [
  { label: "Home", to: "/" },
  { label: "About", to: "/about" },
  { label: "Events", to: "/events" },
  { label: "FAQ", to: "/faq" },
  { label: "Location", to: "/location" },
];

function NavSeparator() {
  return (
    <span className="mobile-nav-separator" aria-hidden="true">
      <span className="mobile-nav-dot" />
    </span>
  );
}

export default function MobileWebNav() {
  return (
    <>
      <nav className="mobile-web-nav" aria-label="Mobile navigation">
        <div className="mobile-navigation-row">
          {navItems.map((item, index) => (
            <div
              className="mobile-navigation-item"
              key={item.to}
            >
              <WebNode
                label={item.label}
                to={item.to}
                className="mobile-nav-link"
                variant="mobile"
              />

              {index < navItems.length - 1 && <NavSeparator />}
            </div>
          ))}
        </div>
      </nav>

      <style>{`
        /* =====================================================
           MOBILE NAVIGATION
           REVIBE '26
           ===================================================== */

        .mobile-web-nav {
          display: block;

          width: 100%;
          max-width: 100%;

          margin: 0;

          padding:
            0.38rem
            0.15rem;

          background:
            linear-gradient(
              180deg,
              rgba(12, 0, 0, 0.98),
              rgba(5, 5, 5, 0.98)
            );

          border-top:
            1px solid rgba(220, 0, 0, 0.32);

          border-bottom:
            1px solid rgba(220, 0, 0, 0.32);

          box-sizing: border-box;

          overflow: hidden;
        }


        /* =====================================================
           SINGLE ROW
           ===================================================== */

        .mobile-navigation-row {
          width: 100%;

          display: flex;

          align-items: center;

          justify-content: center;

          flex-wrap: nowrap;

          min-width: 0;

          margin: 0;
          padding: 0;

          white-space: nowrap;

          box-sizing: border-box;
        }


        /* =====================================================
           NAV ITEM
           ===================================================== */

        .mobile-navigation-item {
          display: flex;

          align-items: center;

          justify-content: center;

          min-width: 0;

          flex: 1 1 auto;
        }


        /* =====================================================
           NAV LINK
           ===================================================== */

        .mobile-nav-link {
          display: inline-flex;

          align-items: center;

          justify-content: center;

          width: auto;

          min-width: 0;

          min-height: 2rem;

          padding:
            0.3rem
            0.42rem;

          color: #f4f4f5;

          background:
            rgba(15, 15, 15, 0.78);

          border:
            1px solid transparent;

          text-decoration: none;

          white-space: nowrap;

          font-family:
            "Orbitron",
            sans-serif;

          font-size: 0.56rem;

          font-weight: 700;

          letter-spacing: 0.035em;

          text-transform: uppercase;

          box-sizing: border-box;

          transition:
            color 0.2s ease,
            background 0.2s ease,
            border-color 0.2s ease,
            box-shadow 0.2s ease;
        }


        /* =====================================================
           HOVER
           ===================================================== */

        .mobile-nav-link:hover {
          color: #ffffff;

          background:
            rgba(80, 0, 0, 0.42);

          border-color:
            rgba(220, 0, 0, 0.6);

          box-shadow:
            0 0 8px rgba(220, 0, 0, 0.16);
        }


        /* =====================================================
           ACTIVE
           ===================================================== */

        .mobile-nav-link.active,
        .mobile-nav-link[aria-current="page"] {
          color: #ffffff;

          background:
            linear-gradient(
              135deg,
              rgba(105, 0, 0, 0.5),
              rgba(45, 0, 0, 0.35)
            );

          border-color:
            #dc0000;

          box-shadow:
            0 0 10px rgba(220, 0, 0, 0.22),
            inset 0 0 8px rgba(220, 0, 0, 0.08);
        }


        /* =====================================================
           WEB SEPARATOR
           ===================================================== */

        .mobile-nav-separator {
          position: relative;

          display: inline-flex;

          align-items: center;

          justify-content: center;

          width: 0.28rem;

          height: 1px;

          margin:
            0
            0.03rem;

          flex-shrink: 0;

          background:
            rgba(220, 0, 0, 0.8);
        }


        .mobile-nav-separator::before {
          content: "";

          position: absolute;

          left: 0;
          right: 0;

          top: 50%;

          height: 1px;

          background:
            rgba(220, 0, 0, 0.8);
        }


        /* =====================================================
           WEB NODE DOT
           ===================================================== */

        .mobile-nav-dot {
          position: relative;

          z-index: 2;

          width: 4px;
          height: 4px;

          border-radius: 50%;

          background:
            #ef1b1b;

          box-shadow:
            0 0 5px rgba(239, 27, 27, 0.9),
            0 0 9px rgba(239, 27, 27, 0.35);
        }


        /* =====================================================
           500px+
           ===================================================== */

        @media (min-width: 500px) and (max-width: 899px) {

          .mobile-web-nav {
            padding:
              0.45rem
              0.35rem;
          }

          .mobile-nav-link {
            min-height: 2.15rem;

            padding:
              0.34rem
              0.58rem;

            font-size: 0.62rem;

            letter-spacing: 0.045em;
          }

          .mobile-nav-separator {
            width: 0.4rem;
          }
        }


        /* =====================================================
           SMALL PHONES
           ===================================================== */

        @media (max-width: 390px) {

          .mobile-web-nav {
            padding:
              0.35rem
              0.08rem;
          }

          .mobile-nav-link {
            min-height: 1.9rem;

            padding:
              0.27rem
              0.3rem;

            font-size: 0.49rem;

            letter-spacing: 0.018em;
          }

          .mobile-nav-separator {
            width: 0.22rem;

            margin:
              0
              0.01rem;
          }

          .mobile-nav-dot {
            width: 3.5px;
            height: 3.5px;
          }
        }


        /* =====================================================
           VERY SMALL PHONES
           ===================================================== */

        @media (max-width: 340px) {

          .mobile-web-nav {
            padding:
              0.3rem
              0;
          }

          .mobile-nav-link {
            min-height: 1.8rem;

            padding:
              0.24rem
              0.22rem;

            font-size: 0.44rem;

            letter-spacing: 0.005em;
          }

          .mobile-nav-separator {
            width: 0.18rem;
          }

          .mobile-nav-dot {
            width: 3px;
            height: 3px;
          }
        }


        /* =====================================================
           DESKTOP
           ===================================================== */

        @media (min-width: 900px) {

          .mobile-web-nav {
            display: none !important;
          }
        }

      `}</style>
    </>
  );
}