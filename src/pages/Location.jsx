import { useCallback, useState } from "react";
import SpiderWeb from "../components/navigation/SpiderWeb";
import CampusMap from "../components/location/CampusMap";

export default function Location() {
  const [mapKey, setMapKey] = useState(0);
  const handleReload = useCallback(() => setMapKey((k) => k + 1), []);

  return (
    <>
      <main className="ws-page">
        <section className="ws-hero" aria-labelledby="loc-title">
          <SpiderWeb className="loc-web loc-web--tl" />
          <SpiderWeb className="loc-web loc-web--br" />
          <div className="ws-container ws-container--narrow">
            <p className="ws-label">CAHCET</p>
            <h1 id="loc-title" className="ws-display">
              REVIBE '26 Venue
            </h1>
            <p className="ws-accent-line">
              Your battleground is on!
            </p>
          </div>
        </section>

        <section className="ws-section ws-section--map">
          <div className="ws-container ws-container--narrow">
            <div className="loc-map-wrap">
              <CampusMap key={mapKey} onReload={handleReload} />
            </div>
          </div>
        </section>
      </main>

      <style>{`
        .ws-page {
          width: 100%;
          height: 100vh;
          background: #f5f5f5;
          color: #1a1a1a;
          overflow: hidden;
          font-family: 'Hanken Grotesk', sans-serif;
          display: flex;
          flex-direction: column;
        }

        .ws-container {
          width: 100%;
          max-width: 1280px;
          margin: 0 auto;
          padding-inline: 16px;
          box-sizing: border-box;
        }

        .ws-container--narrow {
          max-width: 700px;
        }

        .ws-hero {
          position: relative;
          padding: 36px 0 20px;
          background: #f9f9f9;
          overflow: hidden;
          flex-shrink: 0;
        }

        .ws-hero::before {
          content: "";
          position: absolute;
          inset: 0;
          background-image:
            repeating-linear-gradient(45deg, rgba(26,26,26,0.05) 0 1px, transparent 1px 28px),
            repeating-linear-gradient(-45deg, rgba(26,26,26,0.05) 0 1px, transparent 1px 28px);
          pointer-events: none;
        }

        .ws-hero .ws-container {
          position: relative;
          z-index: 1;
        }

        .ws-section {
          padding: 20px 0;
          background: #f5f5f5;
          flex-shrink: 0;
        }

        .ws-section--map {
          flex: 1;
          display: flex;
          align-items: stretch;
          padding: 0;
          min-height: 0;
          background: #f5f5f5;
          position: relative;
          overflow: hidden;
        }

        .ws-section--map::before {
          content: "";
          position: absolute;
          inset: 0;
          background-image:
            repeating-linear-gradient(45deg, rgba(26,26,26,0.05) 0 1px, transparent 1px 28px),
            repeating-linear-gradient(-45deg, rgba(26,26,26,0.05) 0 1px, transparent 1px 28px);
          pointer-events: none;
        }

        .ws-section--map .ws-container {
          display: flex;
          flex-direction: column;
          width: 100%;
          max-width: 800px;
        }

        .loc-map-wrap {
          position: relative;
          flex: 1;
          min-height: 0;
        }

        .ws-label {
          margin: 0 0 6px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          font-weight: 700;
          line-height: 14px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #dc0000;
        }

        .ws-display {
          margin: 0 0 8px;
          font-family: 'Anton', sans-serif;
          font-weight: 400;
          font-size: clamp(28px, 7vw, 56px);
          line-height: 0.98;
          letter-spacing: 0.01em;
          color: #1a1a1a;
          text-transform: uppercase;
        }

        .ws-accent-line {
          margin: 0;
          font-family: 'Anton', sans-serif;
          font-size: clamp(16px, 3.5vw, 24px);
          line-height: 1.1;
          letter-spacing: 0.02em;
          color: #dc0000;
        }

        .loc-web {
          position: absolute;
          pointer-events: none;
          z-index: 0;
          opacity: 0.4;
        }

        .loc-web--tl {
          top: -16px;
          left: -16px;
          width: 120px;
          height: 120px;
        }

        .loc-web--br {
          bottom: -16px;
          right: -16px;
          width: 100px;
          height: 100px;
          transform: rotate(180deg);
        }

        @media (min-width: 600px) {
          .ws-container { padding-inline: 32px; }
          .loc-web--tl { width: 180px; height: 180px; }
          .loc-web--br { width: 150px; height: 150px; }
        }

        @media (min-width: 1024px) {
          .ws-container { padding-inline: 64px; }
          .ws-hero { padding: 48px 0 28px; }
          .ws-section { padding: 28px 0; }
          .loc-web--tl { width: 240px; height: 240px; }
          .loc-web--br { width: 200px; height: 200px; }
        }

        @media (max-width: 430px) {
          .ws-hero { padding: 24px 0 12px; }
          .ws-section { padding: 14px 0; }
          .ws-section--map { padding: 0; }
          .loc-map-wrap { padding: 0; }
          .loc-web--tl { width: 90px; height: 90px; }
          .loc-web--br { width: 80px; height: 80px; }
        }
      `}</style>
    </>
  );
}
