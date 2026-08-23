import { Fragment } from "react";
import WebNode from "./WebNode";

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
      <nav className="desktop-web-nav" aria-label="Primary navigation">
        <div className="desktop-nav-row">
          {navItems.map((item, index) => (
            <Fragment key={item.to}>
              <WebNode
                label={item.label}
                to={item.to}
                className="desktop-web-node"
              />

              {index < navItems.length - 1 && (
                <span className="nav-web-connector" aria-hidden="true">
                  <svg viewBox="0 0 40 20" preserveAspectRatio="none" focusable="false">
                    <path d="M2 10 H38" />
                    <circle cx="20" cy="10" r="3" />
                  </svg>
                </span>
              )}
            </Fragment>
          ))}
        </div>
      </nav>

      <style>{`
        .desktop-web-nav {
          display: block;
          width: 100%;
          min-width: 0;
          overflow-x: auto;
          overflow-y: hidden;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: thin;
        }

        .desktop-web-nav::-webkit-scrollbar {
          height: 4px;
        }

        .desktop-web-nav::-webkit-scrollbar-thumb {
          background: rgba(220, 0, 0, 0.4);
        }

        .desktop-nav-row {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          flex-wrap: nowrap;
          width: max-content;
          margin: 0 auto;
          padding: 0 0.15rem;
        }

        .desktop-web-node {
          flex-shrink: 0;
          font-size: 0.72rem;
          padding: 0.5rem 0.8rem;
          white-space: nowrap;
        }

        .nav-web-connector {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 26px;
          height: 18px;
          opacity: 0.9;
          flex-shrink: 0;
        }

        .nav-web-connector svg {
          width: 100%;
          height: 100%;
          overflow: visible;
        }

        .nav-web-connector path,
        .nav-web-connector circle {
          stroke: rgba(220, 0, 0, 0.82);
          stroke-width: 1.4;
          fill: rgba(220, 0, 0, 0.7);
        }

        @media (min-width: 640px) {
          .desktop-nav-row {
            gap: 0.6rem;
          }

          .desktop-web-node {
            font-size: 0.8rem;
            padding: 0.6rem 1rem;
          }

          .nav-web-connector {
            width: 40px;
          }
        }

        @media (min-width: 900px) {
          .desktop-web-nav {
            overflow: visible;
          }

          .desktop-nav-row {
            width: auto;
          }
        }
      `}</style>
    </>
  );
}