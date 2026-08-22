export default function Location() {
  return (
    <>
      <main className="theme-page location-page">
        <section className="content-panel">
          <div className="page-shell location-shell">
            <p className="eyebrow accent">Venue</p>
            <h1 className="section-title">REVIBE '26 Venue</h1>

            <div className="location-card">
              <div className="location-block">
                <span className="meta-label">College</span>
                <strong>CAHCET</strong>
              </div>
              <div className="location-block">
                <span className="meta-label">Event date</span>
                <strong>To be confirmed</strong>
              </div>
              <div className="location-block">
                <span className="meta-label">Venue</span>
                <strong>CAHCET</strong>
              </div>
              <div className="location-block">
                <span className="meta-label">Location information</span>
                <strong>To be announced.</strong>
              </div>
            </div>

            <div className="map-placeholder" aria-label="Google Maps placeholder">
              Google Maps / venue embed will be added here.
            </div>
          </div>
        </section>
      </main>

      <style>{`
        /* =========================================================
           PAGE / PANEL SHELL (self-contained for Location.jsx)
        ========================================================= */

        .theme-page {
          width: 100%;
          background: var(--bg);
          color: var(--white);
          overflow-x: hidden;
        }

        .content-panel {
          width: 100%;
          padding: 4rem 1.5rem;
        }

        .page-shell {
          width: 100%;
          max-width: 1100px;
          margin: 0 auto;
        }

        .location-shell {
          max-width: 900px;
        }

        /* =========================================================
           TEXT / LABELS
        ========================================================= */

        .eyebrow {
          margin: 0 0 0.6rem;
          font-family: 'Orbitron', sans-serif;
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.28em;
          text-transform: uppercase;
        }

        .eyebrow.accent {
          color: var(--gold);
        }

        .section-title {
          margin: 0 0 1.25rem;
          font-family: 'Bangers', cursive;
          font-size: clamp(1.9rem, 4vw, 2.75rem);
          letter-spacing: 0.03em;
          color: var(--white);
          text-shadow: 0 0 18px var(--shadow);
        }

        /* =========================================================
           LOCATION CARDS
        ========================================================= */

        .location-card {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 1rem;
          margin-top: 1.5rem;
        }

        .location-block {
          display: flex;
          flex-direction: column;
          gap: 0.45rem;
          border: 1px solid rgba(220, 0, 0, 0.35);
          background: rgba(255, 255, 255, 0.01);
          padding: 1rem;
          transition: border-color 0.25s ease, box-shadow 0.25s ease;
        }

        .location-block:hover,
        .location-block:focus-within {
          border-color: rgba(220, 0, 0, 0.75);
          box-shadow: 0 0 20px var(--shadow);
        }

        .meta-label {
          color: var(--muted);
          font-family: 'Orbitron', sans-serif;
          font-size: 0.7rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }

        .location-block strong {
          color: var(--white);
          font-size: 1.2rem;
        }

        /* =========================================================
           MAP PLACEHOLDER
        ========================================================= */

        .map-placeholder {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 260px;
          margin-top: 2rem;
          border: 1px dashed rgba(220, 0, 0, 0.5);
          background: rgba(220, 0, 0, 0.03);
          color: var(--muted);
          text-align: center;
          padding: 1rem;
        }

        /* =========================================================
           RESPONSIVE — 1024px and below
        ========================================================= */

        @media (max-width: 1024px) {
          .content-panel {
            padding: 3.25rem 1.25rem;
          }
        }

        /* =========================================================
           RESPONSIVE — 768px and below (tablet)
        ========================================================= */

        @media (max-width: 768px) {
          .content-panel {
            padding: 2.75rem 1.1rem;
          }

          .section-title {
            font-size: clamp(1.6rem, 5vw, 2.1rem);
          }
        }

        /* =========================================================
           RESPONSIVE — 620px and below
        ========================================================= */

        @media (max-width: 620px) {
          .location-card {
            grid-template-columns: 1fr;
          }
        }

        /* =========================================================
           RESPONSIVE — 430px and below (phones)
        ========================================================= */

        @media (max-width: 430px) {
          .content-panel {
            padding: 2.25rem 0.9rem;
          }

          .eyebrow {
            font-size: 0.68rem;
            letter-spacing: 0.22em;
          }

          .location-block {
            padding: 0.9rem;
          }

          .location-block strong {
            font-size: 1.05rem;
          }

          .map-placeholder {
            min-height: 200px;
            font-size: 0.9rem;
          }
        }

        /* =========================================================
           RESPONSIVE — 320px (smallest supported)
        ========================================================= */

        @media (max-width: 320px) {
          .map-placeholder {
            min-height: 170px;
            padding: 0.75rem;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .location-block {
            transition: none;
          }
        }
      `}</style>
    </>
  );
}