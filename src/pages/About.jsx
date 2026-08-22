const technicalEvents = [
  "Paper Presentation",
  "Mini Hackathon",
  "Technical Quiz",
  "Coding & Debugging",
  "Shark Tank × SGC",
  "Prompt Wars",
];

const nonTechnicalEvents = [
  "Connections",
  "Chess",
  "Free Fire",
  "Mehandi",
  "Cooking Without Fire",
  "Art & Painting",
  "IPL Auction",
];

const galleryItems = [1, 2, 3, 4];

export default function About() {
  return (
    <>
      <main className="theme-page about-page">
        <section className="content-panel">
          <div className="page-shell about-shell">
            <p className="eyebrow accent">About REVIBE</p>
            <h1 className="section-title">About REVIBE</h1>
            <p className="lead-copy">
              REVIBE '26 is a National Level Symposium organized by the Student
              Guidance Cell (SGC), C. Abdul Hakeem College of Engineering &amp;
              Technology (CAHCET). The platform brings together students to
              participate in a carefully curated mix of technical and creative
              experiences.
            </p>
          </div>
        </section>

        <span className="web-divider" aria-hidden="true" />

        <section className="content-panel muted-panel">
          <div className="page-shell">
            <p className="eyebrow accent">About the events</p>
            <h2 className="section-title">Technical and Non-Technical Events</h2>

            <div className="dual-columns about-columns">
              <article className="info-card">
                <h3>Technical Events</h3>
                <ul>
                  {technicalEvents.map((event) => (
                    <li key={event}>{event}</li>
                  ))}
                </ul>
              </article>

              <article className="info-card">
                <h3>Non-Technical Events</h3>
                <ul>
                  {nonTechnicalEvents.map((event) => (
                    <li key={event}>{event}</li>
                  ))}
                </ul>
              </article>
            </div>
          </div>
        </section>

        <span className="web-divider" aria-hidden="true" />

        <section className="content-panel">
          <div className="page-shell">
            <p className="eyebrow accent">Previous edition</p>
            <h2 className="section-title">Previous REVIBE '24</h2>
            <p className="lead-copy">
              Highlights and details from REVIBE '24 will be published here
              once finalized.
            </p>
          </div>
        </section>

        <span className="web-divider" aria-hidden="true" />

        <section className="content-panel muted-panel">
          <div className="page-shell">
            <p className="eyebrow accent">Gallery</p>
            <h2 className="section-title">Gallery</h2>
            <div className="gallery-grid" aria-label="Gallery placeholder">
              {galleryItems.map((item) => (
                <div key={item} className="gallery-slot">
                  Gallery images will be added.
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <style>{`
        /* =========================================================
           PAGE / PANEL SHELL (self-contained for About.jsx)
        ========================================================= */

        .theme-page {
          width: 100%;
          background: var(--bg);
          overflow-x: hidden;
        }

        .content-panel {
          width: 100%;
          padding: 4rem 1.5rem;
        }

        .muted-panel {
          background: var(--bg-soft);
        }

        .page-shell {
          width: 100%;
          max-width: 1100px;
          margin: 0 auto;
        }

        .about-shell {
          max-width: 900px;
        }

        .web-divider {
          display: block;
          width: 100%;
          height: 1px;
          background: linear-gradient(
            90deg,
            transparent,
            var(--red) 20%,
            var(--gold) 50%,
            var(--red) 80%,
            transparent
          );
          opacity: 0.5;
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

        .lead-copy {
          margin: 0;
          max-width: 760px;
          color: var(--soft-white);
          line-height: 1.8;
          font-size: 1.05rem;
        }

        /* =========================================================
           EVENT COLUMNS
        ========================================================= */

        .dual-columns {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 1.25rem;
        }

        .about-columns {
          margin-top: 1.5rem;
        }

        .info-card {
          position: relative;
          border: 1px solid rgba(220, 0, 0, 0.35);
          background: rgba(255, 255, 255, 0.01);
          padding: 1.4rem 1.2rem;
          transition: border-color 0.25s ease, box-shadow 0.25s ease;
        }

        .info-card:hover,
        .info-card:focus-within {
          border-color: rgba(220, 0, 0, 0.75);
          box-shadow: 0 0 24px var(--shadow);
        }

        .info-card h3 {
          margin: 0 0 1rem;
          font-family: 'Orbitron', sans-serif;
          font-size: 0.95rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--white);
        }

        .info-card ul {
          margin: 0;
          padding-left: 1.1rem;
          display: grid;
          gap: 0.55rem;
          color: var(--soft-white);
          line-height: 1.7;
          font-size: 0.98rem;
        }

        .info-card li::marker {
          color: var(--red);
        }

        /* =========================================================
           GALLERY
        ========================================================= */

        .gallery-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 1rem;
          margin-top: 1.5rem;
        }

        .gallery-slot {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 180px;
          border: 1px dashed rgba(220, 0, 0, 0.5);
          background: rgba(220, 0, 0, 0.03);
          color: var(--muted);
          text-align: center;
          padding: 1rem;
          font-size: 0.9rem;
        }

        /* =========================================================
           RESPONSIVE — 1024px and below
        ========================================================= */

        @media (max-width: 1024px) {
          .content-panel {
            padding: 3.25rem 1.25rem;
          }

          .gallery-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
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

          .dual-columns {
            grid-template-columns: 1fr;
          }

          .gallery-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
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

          .lead-copy {
            font-size: 0.95rem;
            line-height: 1.7;
          }

          .info-card {
            padding: 1.1rem 1rem;
          }

          .gallery-slot {
            min-height: 140px;
            font-size: 0.82rem;
          }
        }

        /* =========================================================
           RESPONSIVE — 320px (smallest supported)
        ========================================================= */

        @media (max-width: 320px) {
          .gallery-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .info-card {
            transition: none;
          }
        }
      `}</style>
    </>
  );
}