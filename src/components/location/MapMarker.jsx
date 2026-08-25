const COLORS = {
  green: { fill: "#4CAF50", glow: "rgba(76, 175, 80, 0.5)", border: "#2E7D32" },
  red: { fill: "#e63946", glow: "rgba(230, 57, 70, 0.5)", border: "#b7102a" },
  cyan: { fill: "#3aa5d1", glow: "rgba(58, 165, 209, 0.5)", border: "#1a6a94" },
};

export default function MapMarker({ location, isActive, onClick }) {
  const c = COLORS[location.color] || COLORS.cyan;

  return (
    <button
      type="button"
      className={"hx" + (isActive ? " hx--active" : "")}
      style={{
        left: location.x + "%",
        top: location.y + "%",
        "--hx-color": c.fill,
        "--hx-glow": c.glow,
        "--hx-border": c.border,
      }}
      onClick={() => onClick(location)}
      aria-label={location.name}
    >
      <span className="hx__pulse" />
      <span className="hx__shape">
        <img src="/song-spidey.svg" alt="" className="hx__svg" />
      </span>
      <span className="hx__label">{location.name}</span>

      <style>{`
        .hx {
          position: absolute;
          transform: translate(-50%, -50%);
          background: none;
          border: none;
          padding: 0;
          cursor: pointer;
          z-index: 10;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
          -webkit-tap-highlight-color: transparent;
        }

        .hx__pulse {
          position: absolute;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: var(--hx-glow);
          animation: hx-pulse 2.2s ease-out infinite;
          pointer-events: none;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }

        .hx--active .hx__pulse {
          animation: hx-pulse-active 1.5s ease-out infinite;
        }

        @keyframes hx-pulse {
          0% { transform: translate(-50%, -50%) scale(0.5); opacity: 1; }
          100% { transform: translate(-50%, -50%) scale(2.5); opacity: 0; }
        }

        @keyframes hx-pulse-active {
          0% { transform: translate(-50%, -50%) scale(0.7); opacity: 1; }
          100% { transform: translate(-50%, -50%) scale(3); opacity: 0; }
        }

        .hx__shape {
          position: relative;
          z-index: 2;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          overflow: hidden;
          transition: transform 0.2s ease, filter 0.2s ease;
        }

        .hx__svg {
          width: 100%;
          height: 100%;
          filter: drop-shadow(0 2px 4px rgba(0,0,0,0.4));
        }

        .hx:hover .hx__shape,
        .hx:focus-visible .hx__shape {
          transform: scale(1.2);
          filter: drop-shadow(0 0 8px var(--hx-glow));
        }

        .hx--active .hx__shape {
          transform: scale(1.3);
          filter: drop-shadow(0 0 12px var(--hx-glow));
        }

        .hx__label {
          position: relative;
          white-space: nowrap;
          font-family: 'JetBrains Mono', monospace;
          font-size: 7px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.75);
          background: rgba(10, 22, 40, 0.8);
          padding: 2px 5px;
          border-radius: 3px;
          border: 1px solid rgba(42, 143, 181, 0.25);
          pointer-events: none;
          z-index: 3;
          transition: color 0.15s, background 0.15s, border-color 0.15s;
        }

        .hx:hover .hx__label,
        .hx--active .hx__label {
          color: #ffffff;
          background: rgba(42, 143, 181, 0.25);
          border-color: rgba(42, 143, 181, 0.6);
        }

        @media (min-width: 1024px) {
          .hx__shape { width: 34px; height: 34px; }
          .hx__pulse { width: 40px; height: 40px; }
          .hx__label { font-size: 8px; padding: 2px 6px; }
        }

        @media (max-width: 430px) {
          .hx__shape { width: 22px; height: 22px; }
          .hx__pulse { width: 26px; height: 26px; }
          .hx__label { font-size: 6px; padding: 1px 3px; }
        }

        @media (prefers-reduced-motion: reduce) {
          .hx__pulse { animation: none; }
        }
      `}</style>
    </button>
  );
}
