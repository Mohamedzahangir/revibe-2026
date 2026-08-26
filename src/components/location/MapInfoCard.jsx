export default function MapInfoCard({ location, onClose }) {
  if (!location) return null;

  return (
    <div className="cminfo">
      <div className="cminfo__head">
        <span className="cminfo__dot" />
        <span className="cminfo__name">{location.name}</span>
        <button type="button" className="cminfo__close" onClick={onClose} aria-label="Close">&#10005;</button>
      </div>
      <p className="cminfo__desc">{location.desc}</p>
      {location.tag && (
        <div className="cminfo__tags">
          {location.tag.split(",").map((t, i) => (
            <span key={i} className="cminfo__tag">{t.trim()}</span>
          ))}
        </div>
      )}

      <style>{`
        .cminfo {
          position: absolute;
          bottom: 12px;
          left: 50%;
          transform: translateX(-50%);
          width: calc(100% - 24px);
          max-width: 340px;
          background: rgba(10, 22, 40, 0.94);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 2px solid #2a8fb5;
          border-radius: 8px;
          padding: 12px 14px;
          z-index: 50;
          animation: cminfo-in 0.2s ease-out;
          box-shadow: 0 4px 20px rgba(0,0,0,0.4), 0 0 15px rgba(42, 143, 181, 0.1);
        }

        @keyframes cminfo-in {
          from { opacity: 0; transform: translateX(-50%) translateY(8px); }
          to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }

        .cminfo__head {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 6px;
        }

        .cminfo__dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #2a8fb5;
          box-shadow: 0 0 6px rgba(42, 143, 181, 0.5);
          flex-shrink: 0;
        }

        .cminfo__name {
          flex: 1;
          font-family: 'Anton', sans-serif;
          font-size: 15px;
          letter-spacing: 0.06em;
          color: #2a8fb5;
          text-transform: uppercase;
        }

        .cminfo__close {
          background: none;
          border: 1px solid rgba(42, 143, 181, 0.3);
          color: rgba(255,255,255,0.5);
          font-size: 11px;
          cursor: pointer;
          padding: 2px 7px;
          border-radius: 4px;
          transition: color 0.15s, border-color 0.15s;
        }

        .cminfo__close:hover {
          color: #ffffff;
          border-color: #2a8fb5;
        }

        .cminfo__desc {
          margin: 0 0 8px;
          font-family: 'Hanken Grotesk', sans-serif;
          font-size: 12px;
          line-height: 17px;
          color: rgba(255,255,255,0.55);
        }

        .cminfo__tags {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }

        .cminfo__tag {
          display: inline-block;
          font-family: 'JetBrains Mono', monospace;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #2a8fb5;
          background: rgba(42, 143, 181, 0.1);
          border: 1px solid rgba(42, 143, 181, 0.3);
          padding: 2px 8px;
          border-radius: 3px;
        }

        @media (max-width: 430px) {
          .cminfo {
            bottom: 8px;
            width: calc(100% - 16px);
            padding: 10px 12px;
          }
        }
      `}</style>
    </div>
  );
}
