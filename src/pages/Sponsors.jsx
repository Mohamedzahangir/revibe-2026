import SpiderWeb from "../components/navigation/SpiderWeb";

const sponsors = [
  {
    name: "Sponsor 01",
    category: "Title Sponsor",
    logo: null,
    blurb: "Powering the headline stage of REVIBE '26 and the spotlight on every champion.",
  },
  {
    name: "Sponsor 02",
    category: "Powered By",
    logo: null,
    blurb: "The engine behind the web — fuelling the experience, end to end.",
  },
  {
    name: "Sponsor 03",
    category: "Event Partner",
    logo: null,
    blurb: "Standing shoulder-to-shoulder with us across all thirteen battles.",
  },
  {
    name: "Sponsor 04",
    category: "Tech Partner",
    logo: null,
    blurb: "Architecting the infrastructure that keeps the web alive.",
  },
  {
    name: "Sponsor 05",
    category: "Community Partner",
    logo: null,
    blurb: "Helping curious minds from every corner find their way to the web.",
  },
  {
    name: "Sponsor 06",
    category: "Media Partner",
    logo: null,
    blurb: "Carrying the story of REVIBE '26 far beyond the auditorium walls.",
  },
];

export default function Sponsors() {
  return (
    <>
      <main className="sp-page">
        {/* ============================================================
            HERO
            ============================================================ */}
        <section className="sp-hero" aria-labelledby="sponsors-title">
          <SpiderWeb className="sp-hero-web sp-hero-web--tl" />
          <SpiderWeb className="sp-hero-web sp-hero-web--tr" />
          <SpiderWeb className="sp-hero-web sp-hero-web--bl" />
          <SpiderWeb className="sp-hero-web sp-hero-web--br" />

          <div className="sp-container sp-container--narrow">
            <p className="sp-label">REVIBE '26 Presents</p>

            <h1 id="sponsors-title" className="sp-display">
              The Web is held together by its partners.
            </h1>

            <p className="sp-body-lg">
              Every thread of REVIBE '26 is woven with the strength of the
              teams who believed in the idea before the lights ever came on.
              Meet the names helping us sling the next chapter into existence.
            </p>
          </div>
        </section>

        <hr className="sp-rule" aria-hidden="true" />

        {/* ============================================================
            SPONSOR GRID
            ============================================================ */}
        <section className="sp-section" aria-labelledby="grid-title">
          <div className="sp-container">
            <p className="sp-label">The Roster</p>
            <h2 id="grid-title" className="sp-headline">
              Six threads. One web.
            </h2>
            <p className="sp-body">
              From the title stage to the community that carries the story
              forward — each partner holds a strand of the REVIBE '26 web.
            </p>

            <div className="sp-grid-wrap" aria-label="Sponsor roster">
              <SpiderWeb className="sp-grid-web sp-grid-web--tl" />
              <SpiderWeb className="sp-grid-web sp-grid-web--br" />

              <ul className="sp-grid" role="list">
                {sponsors.map((sponsor, index) => (
                  <li className="sp-card" key={sponsor.name}>
                    <span className="sp-card-number">
                      {String(index + 1).padStart(2, "0")}
                    </span>

                    <div
                      className="sp-card-logo"
                      aria-label={`${sponsor.name} logo placeholder`}
                    >
                      {sponsor.logo ? (
                        <img src={sponsor.logo} alt={`${sponsor.name} logo`} />
                      ) : (
                        <span className="sp-card-logo-mark">LOGO</span>
                      )}
                    </div>

                    <div className="sp-card-copy">
                      <p className="sp-card-category">{sponsor.category}</p>
                      <h3 className="sp-card-name">{sponsor.name}</h3>
                      <p className="sp-card-blurb">{sponsor.blurb}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      </main>

      <style>{`
        /* =========================================================
           WEB-SLINGER MODERN — Sponsors page
           Mirrors the neo-comic system used by Home + About.
           Off-white surface · 2px black borders · sharp corners ·
           hard offset shadows · Anton / Hanken Grotesk / JetBrains Mono
           8px grid · 12-col desktop (64px margin) · 4-col mobile (16px)
        ========================================================= */

        .sp-page {
          width: 100%;
          background: #f5f5f5;
          color: #1a1a1a;
          overflow-x: hidden;
          font-family: 'Hanken Grotesk', sans-serif;
        }

        .sp-container {
          width: 100%;
          max-width: 1280px;
          margin: 0 auto;
          padding-inline: 16px;
          box-sizing: border-box;
        }

        .sp-container--narrow {
          max-width: 900px;
        }

        /* ---------- sections ---------- */

        .sp-hero {
          position: relative;
          padding: 96px 0 72px;
          background: #f9f9f9;
          overflow: hidden;
          border-bottom: 2px solid #1a1a1a;
        }

        .sp-section {
          padding: 72px 0;
          background: #f5f5f5;
        }

        .sp-hero-web {
          position: absolute;
          pointer-events: none;
          z-index: 0;
          opacity: 0.35;
        }

        .sp-hero-web--tl {
          top: 0;
          left: 0;
          width: 200px;
          height: 200px;
        }

        .sp-hero-web--tr {
          top: 0;
          right: 0;
          width: 150px;
          height: 150px;
          transform: scaleX(-1);
        }

        .sp-hero-web--bl {
          bottom: 0;
          left: 0;
          width: 150px;
          height: 150px;
          transform: scaleY(-1);
        }

        .sp-hero-web--br {
          bottom: 0;
          right: 0;
          width: 200px;
          height: 200px;
          transform: rotate(180deg);
        }

        .sp-hero .sp-container {
          position: relative;
          z-index: 1;
          text-align: center;
        }

        /* ---------- 2px black panel dividers ---------- */

        .sp-rule {
          display: block;
          width: 100%;
          height: 0;
          border: 0;
          border-top: 2px solid #1a1a1a;
          margin: 0;
        }

        /* ---------- typography ---------- */

        .sp-label {
          margin: 0 0 16px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 12px;
          font-weight: 700;
          line-height: 16px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #dc0000;
        }

        .sp-display {
          margin: 0 0 32px;
          font-family: 'Anton', sans-serif;
          font-weight: 400;
          font-size: clamp(36px, 8vw, 72px);
          line-height: 0.98;
          letter-spacing: 0.01em;
          color: #1a1a1a;
          text-transform: uppercase;
        }

        .sp-headline {
          margin: 0 0 20px;
          font-family: 'Anton', sans-serif;
          font-weight: 400;
          font-size: clamp(32px, 6vw, 48px);
          line-height: 1;
          letter-spacing: 0.02em;
          color: #1a1a1a;
          text-transform: uppercase;
        }

        .sp-body-lg {
          margin: 0 auto 24px;
          max-width: 760px;
          font-family: 'Hanken Grotesk', sans-serif;
          font-size: 18px;
          line-height: 28px;
          color: #1a1a1a;
        }

        .sp-body {
          margin: 0 auto 8px;
          max-width: 760px;
          font-family: 'Hanken Grotesk', sans-serif;
          font-size: 16px;
          line-height: 24px;
          color: #3a3a3a;
        }

        /* =========================================================
           SPONSOR GRID
           ========================================================= */

        .sp-grid-wrap {
          position: relative;
          margin-top: 40px;
        }

        .sp-grid-web {
          position: absolute;
          z-index: 3;
          pointer-events: none;
          opacity: 0.4;
        }

        .sp-grid-web--tl {
          top: -50px;
          left: -50px;
          width: 160px;
          height: 160px;
        }

        .sp-grid-web--br {
          bottom: -50px;
          right: -50px;
          width: 160px;
          height: 160px;
          transform: rotate(180deg);
        }

        .sp-grid {
          position: relative;
          z-index: 2;
          list-style: none;
          margin: 0;
          padding: 0;
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 24px;
        }

        .sp-card {
          position: relative;
          display: flex;
          flex-direction: column;
          gap: 16px;
          padding: 20px;
          border: 1px solid rgba(220, 0, 0, 0.35);
          border-radius: 16px;
          background:
            linear-gradient(135deg, rgba(255, 255, 255, 0.75), rgba(255, 255, 255, 0.55));
          box-shadow:
            0 10px 30px rgba(0, 0, 0, 0.08),
            inset 0 1px 0 rgba(255, 255, 255, 0.8);
          overflow: hidden;
          transition: box-shadow 0.2s ease, transform 0.2s ease, border-color 0.2s ease;
        }

        .sp-card::after {
          content: "";
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 3px;
          background: linear-gradient(90deg, transparent, rgba(220, 0, 0, 0.5), transparent);
          pointer-events: none;
        }

        .sp-card:hover,
        .sp-card:focus-within {
          transform: translateY(-3px);
          border-color: rgba(220, 0, 0, 0.6);
          box-shadow:
            0 14px 34px rgba(0, 0, 0, 0.12),
            inset 0 1px 0 rgba(255, 255, 255, 0.8);
        }

        .sp-card-number {
          position: absolute;
          top: 12px;
          right: 12px;
          z-index: 2;
          padding: 6px 12px;
          background: linear-gradient(180deg, #1a1a1a, #0d0d0d);
          color: #ffffff;
          border: 1px solid rgba(220, 0, 0, 0.3);
          border-radius: 10px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.12em;
          box-shadow:
            0 4px 12px rgba(0, 0, 0, 0.2),
            inset 0 1px 0 rgba(220, 0, 0, 0.15);
        }

        .sp-card-logo {
          position: relative;
          z-index: 1;
          display: grid;
          place-items: center;
          width: 100%;
          min-height: 150px;
          margin-top: 28px;
          border: 1px dashed rgba(220, 0, 0, 0.45);
          border-radius: 12px;
          background:
            linear-gradient(135deg, rgba(255, 255, 255, 0.7), rgba(220, 0, 0, 0.04));
        }

        .sp-card-logo img {
          max-width: 80%;
          max-height: 110px;
          object-fit: contain;
        }

        .sp-card-logo-mark {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.2em;
          color: #6a6a6a;
        }

        .sp-card-copy {
          position: relative;
          z-index: 1;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .sp-card-category {
          margin: 0;
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: #dc0000;
        }

        .sp-card-name {
          margin: 0 0 6px;
          font-family: 'Anton', sans-serif;
          font-weight: 400;
          font-size: 1.5rem;
          line-height: 1.05;
          letter-spacing: 0.02em;
          color: #1a1a1a;
          text-transform: uppercase;
        }

        .sp-card-blurb {
          margin: 0;
          font-family: 'Hanken Grotesk', sans-serif;
          font-size: 0.95rem;
          line-height: 1.5;
          color: #3a3a3a;
        }

        /* =========================================================
           RESPONSIVE — tablet
           ========================================================= */

        @media (min-width: 600px) {
          .sp-container {
            padding-inline: 32px;
          }
        }

        /* =========================================================
           RESPONSIVE — desktop
           ========================================================= */

        @media (min-width: 1024px) {
          .sp-container {
            padding-inline: 64px;
          }

          .sp-hero {
            padding: 128px 0 96px;
          }

          .sp-section {
            padding: 96px 0;
          }

          .sp-card {
            padding: 24px;
          }

          .sp-card-logo {
            min-height: 180px;
          }
        }

        /* =========================================================
           RESPONSIVE — mobile
           ========================================================= */

        @media (max-width: 899px) {
          .sp-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 16px;
          }

          .sp-hero-web--tr,
          .sp-hero-web--bl {
            display: none;
          }
        }

        @media (max-width: 560px) {
          .sp-hero {
            padding: 80px 0 56px;
          }

          .sp-hero-web--tl,
          .sp-hero-web--br {
            width: 130px;
            height: 130px;
            opacity: 0.25;
          }

          .sp-grid {
            grid-template-columns: 1fr;
            gap: 16px;
          }

          .sp-grid-web--tl,
          .sp-grid-web--br {
            width: 110px;
            height: 110px;
          }
        }

        @media (max-width: 360px) {
          .sp-card-number {
            font-size: 10px;
            padding: 4px 8px;
          }
        }

        /* =========================================================
           REDUCED MOTION
           ========================================================= */

        @media (prefers-reduced-motion: reduce) {
          .sp-card {
            transition: none;
          }
        }
      `}</style>
    </>
  );
}
