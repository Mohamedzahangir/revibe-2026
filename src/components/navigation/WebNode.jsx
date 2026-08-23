import { NavLink } from "react-router-dom";

export default function WebNode({
  label,
  to,
  active = false,
  onClick,
  className = "",
  variant = "default",
}) {
  const classes = [
    "web-node",
    variant === "action" ? "web-node-action" : "",
    variant === "mobile" ? "web-node-mobile" : "",
    active ? "is-active" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  if (!to) {
    return (
      <button type="button" className={classes} onClick={onClick}>
        <span className="web-node-label">{label}</span>
      </button>
    );
  }

  return (
    <>
      <NavLink
        to={to}
        end={to === "/"}
        onClick={onClick}
        className={({ isActive }) =>
          [classes, isActive || active ? "is-active" : ""]
            .filter(Boolean)
            .join(" ")
        }
      >
        <span className="web-node-label">{label}</span>
      </NavLink>

      <style>{`
        .web-node {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 42px;
          padding: 0.7rem 1rem;
          border: 1px solid transparent;
          background: rgba(255, 255, 255, 0.02);
          color: var(--white);
          font-family: 'Orbitron', sans-serif;
          font-size: 0.72rem;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          white-space: nowrap;
          text-decoration: none;
          transition: all 0.2s ease;
        }

        .web-node:hover,
        .web-node:focus-visible {
          color: var(--soft-white);
          border-color: rgba(220, 0, 0, 0.7);
          box-shadow: inset 0 0 0 1px rgba(220, 0, 0, 0.2);
        }

        .web-node.is-active {
          color: var(--white);
          border-color: rgba(220, 0, 0, 0.9);
          background: rgba(220, 0, 0, 0.12);
          box-shadow: inset 0 0 0 1px rgba(220, 0, 0, 0.4), 0 0 18px rgba(220, 0, 0, 0.15);
        }

        .web-node-action {
          min-height: 38px;
          padding-inline: 0.95rem;
        }

        .web-node-action.is-active {
          background: rgba(220, 0, 0, 0.16);
        }

        .web-node-mobile {
          width: 100%;
          justify-content: flex-start;
          padding: 0.8rem 1rem;
          border-left: 2px solid rgba(220, 0, 0, 0.7);
          border-right: 0;
          border-top: 0;
          border-bottom: 0;
          background: rgba(255, 255, 255, 0.01);
          overflow: hidden;
        }

        .web-node-mobile.is-active {
          background: rgba(220, 0, 0, 0.12);
        }

        .web-node-label {
          position: relative;
          z-index: 1;
        }
      `}</style>
    </>
  );
}