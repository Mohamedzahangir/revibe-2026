import { NavLink } from "react-router-dom";

const navItems = [
  { label: "Home", to: "/" },
  { label: "About", to: "/about" },
  { label: "Events", to: "/events" },
  { label: "Sponsors", to: "/sponsors" },
  { label: "Location", to: "/location" },
];

export default function MobileWebNav() {
  return (
    <>
      <nav className="mobile-pill-nav" aria-label="Mobile navigation">
        <div className="mobile-pill-inner">
          {navItems.map((item, index) => (
            <div className="mobile-pill-item" key={item.to}>
              <NavLink
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) =>
                  ["mobile-pill-link", isActive ? "is-active" : ""]
                    .filter(Boolean)
                    .join(" ")
                }
              >
                <span>{item.label}</span>
              </NavLink>

              {index < navItems.length - 1 && (
                <span className="mobile-pill-divider" aria-hidden="true" />
              )}
            </div>
          ))}
        </div>
      </nav>

      <style>{`
        .mobile-pill-nav {
          display: flex;
          justify-content: center;
          width: 100%;
          max-width: 100%;
          margin: 0;
          padding: 0;
          background: transparent;
          box-sizing: border-box;
          overflow: hidden;
        }

        .mobile-pill-inner {
          display: inline-flex;
          align-items: stretch;
          justify-content: center;
          gap: 0;
          flex-wrap: nowrap;
          width: max-content;
          max-width: 100%;
          margin: 0 auto;
          padding: 0.2rem;

          background: rgba(245, 245, 245, 0.94);
          border: 1px solid rgba(220, 0, 0, 0.35);
          border-radius: 999px;

          box-shadow:
            0 2px 10px rgba(0, 0, 0, 0.12),
            inset 0 0 0 1px rgba(255, 255, 255, 0.6);
        }

        .mobile-pill-item {
          display: inline-flex;
          align-items: stretch;
          flex: 0 0 auto;
        }

        .mobile-pill-link {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0.3rem 0.5rem;
          min-height: 1.9rem;

          border-radius: 999px;

          color: #1a1a1a;
          background: transparent;
          border: 1px solid transparent;

          font-family: "Bebas Neue", sans-serif;
          font-size: 0.62rem;
          letter-spacing: 0.05em;
          text-transform: uppercase;

          white-space: nowrap;
          text-decoration: none;

          transition:
            color 0.2s ease,
            background 0.2s ease,
            box-shadow 0.2s ease;
        }

        .mobile-pill-link:hover,
        .mobile-pill-link:focus-visible {
          color: #dc0000;
          background: rgba(220, 0, 0, 0.08);
        }

        .mobile-pill-link.is-active {
          color: #ffffff;
          background: #dc0000;
          box-shadow: 0 0 10px rgba(220, 0, 0, 0.45);
        }

        .mobile-pill-divider {
          align-self: center;
          width: 1px;
          height: 0.95rem;
          margin: 0 0.05rem;
          background: rgba(220, 0, 0, 0.28);
          flex-shrink: 0;
        }

        @media (min-width: 500px) and (max-width: 899px) {
          .mobile-pill-link {
            min-height: 2.1rem;
            padding: 0.34rem 0.7rem;
            font-size: 0.72rem;
            letter-spacing: 0.055em;
          }

          .mobile-pill-divider {
            height: 1.1rem;
          }
        }

        @media (max-width: 390px) {
          .mobile-pill-link {
            min-height: 1.8rem;
            padding: 0.26rem 0.4rem;
            font-size: 0.56rem;
            letter-spacing: 0.03em;
          }

          .mobile-pill-divider {
            height: 0.85rem;
          }
        }

        @media (max-width: 340px) {
          .mobile-pill-link {
            min-height: 1.7rem;
            padding: 0.24rem 0.32rem;
            font-size: 0.52rem;
          }

          .mobile-pill-divider {
            height: 0.75rem;
          }
        }

        @media (min-width: 900px) {
          .mobile-pill-nav {
            display: none !important;
          }
        }
      `}</style>
    </>
  );
}
