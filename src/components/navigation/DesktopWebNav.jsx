import { NavLink } from "react-router-dom";

const navItems = [
  { label: "Home", to: "/" },
  { label: "About", to: "/about" },
  { label: "Events", to: "/events" },
  { label: "Sponsors", to: "/sponsors" },
  { label: "Location", to: "/location" },
];

export default function DesktopWebNav() {
  return (
    <>
      <nav className="pill-nav" aria-label="Primary navigation">
        <div className="pill-nav-inner">
          {navItems.map((item, index) => (
            <div className="pill-nav-item" key={item.to}>
              <NavLink
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) =>
                  ["pill-nav-link", isActive ? "is-active" : ""]
                    .filter(Boolean)
                    .join(" ")
                }
              >
                <span className="pill-nav-label">{item.label}</span>
              </NavLink>

              {index < navItems.length - 1 && (
                <span className="pill-nav-divider" aria-hidden="true" />
              )}
            </div>
          ))}
        </div>
      </nav>

      <style>{`
        .pill-nav {
          display: flex;
          justify-content: center;
          width: 100%;
          min-width: 0;
          overflow-x: auto;
          overflow-y: hidden;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
        }

        .pill-nav::-webkit-scrollbar {
          display: none;
        }

        .pill-nav-inner {
          display: inline-flex;
          align-items: stretch;
          justify-content: center;
          gap: 0;
          flex-wrap: nowrap;
          width: max-content;
          max-width: 100%;
          margin: 0 auto;
          padding: 0.25rem;

          background: rgba(245, 245, 245, 0.94);
          border: 1px solid rgba(220, 0, 0, 0.35);
          border-radius: 999px;

          box-shadow:
            0 2px 10px rgba(0, 0, 0, 0.18),
            inset 0 0 0 1px rgba(255, 255, 255, 0.6);
        }

        .pill-nav-item {
          display: inline-flex;
          align-items: stretch;
          flex-shrink: 0;
        }

        .pill-nav-link {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0.5rem 1.1rem;
          min-height: 38px;

          border-radius: 999px;

          color: #1a1a1a;
          background: transparent;
          border: 1px solid transparent;

          font-family: "Bebas Neue", sans-serif;
          font-size: 0.95rem;
          letter-spacing: 0.06em;
          text-transform: uppercase;

          white-space: nowrap;
          text-decoration: none;

          transition:
            color 0.2s ease,
            background 0.2s ease,
            box-shadow 0.2s ease;
        }

        .pill-nav-link:hover,
        .pill-nav-link:focus-visible {
          color: #dc0000;
          background: rgba(220, 0, 0, 0.08);
        }

        .pill-nav-link.is-active {
          color: #ffffff;
          background: #dc0000;
          box-shadow: 0 0 12px rgba(220, 0, 0, 0.45);
        }

        .pill-nav-label {
          position: relative;
          z-index: 1;
        }

        .pill-nav-divider {
          align-self: center;
          width: 1px;
          height: 1.1rem;
          margin: 0 0.1rem;
          background: rgba(220, 0, 0, 0.28);
          flex-shrink: 0;
        }

        @media (min-width: 640px) {
          .pill-nav-link {
            padding: 0.55rem 1.35rem;
            font-size: 1.02rem;
          }
        }

        @media (min-width: 900px) {
          .pill-nav {
            overflow: visible;
          }

          .pill-nav-inner {
            width: auto;
          }
        }
      `}</style>
    </>
  );
}
