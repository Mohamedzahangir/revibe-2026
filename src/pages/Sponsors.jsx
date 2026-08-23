const sponsors = [
  { name: "Sponsor 01", category: "TITLE SPONSOR", logo: null },
  { name: "Sponsor 02", category: "EVENT PARTNER", logo: null },
  { name: "Sponsor 03", category: "POWERED BY", logo: null },
  { name: "Sponsor 04", category: "TECH PARTNER", logo: null },
  { name: "Sponsor 05", category: "COMMUNITY PARTNER", logo: null },
  { name: "Sponsor 06", category: "MEDIA PARTNER", logo: null },
];

export default function Sponsors() {
  return (
    <>
      <main className="sponsors-page">
        <section className="sponsors-panel">
          <div className="sponsors-shell">
            <p className="sponsors-eyebrow">REVIBE '26 PRESENTS</p>
            <h1 className="sponsors-title">MEET OUR SPONSORS</h1>
            <p className="sponsors-intro">
              The teams helping us bring the next chapter of REVIBE '26 to life.
            </p>

            <div className="sponsors-grid">
              {sponsors.map((sponsor, index) => (
                <article className="sponsor-card" key={sponsor.name}>
                  <span className="sponsor-number">0{index + 1}</span>
                  <div className="sponsor-logo" aria-label={`${sponsor.name} logo placeholder`}>
                    {sponsor.logo ? (
                      <img src={sponsor.logo} alt={`${sponsor.name} logo`} />
                    ) : (
                      <span>LOGO</span>
                    )}
                  </div>
                  <div className="sponsor-card-copy">
                    <p className="sponsor-category">{sponsor.category}</p>
                    <h2>{sponsor.name}</h2>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>

      <style>{`
        .sponsors-page {
          width: 100%;
          min-height: 60vh;
          overflow: hidden;
          color: #ffffff;
          background:
            radial-gradient(circle at 15% 18%, rgba(220, 0, 0, 0.16), transparent 25%),
            radial-gradient(circle at 88% 82%, rgba(245, 197, 66, 0.07), transparent 22%),
            #050505;
        }

        .sponsors-panel {
          position: relative;
          padding: 4.5rem 1.5rem 5.5rem;
        }

        .sponsors-panel::before {
          content: "";
          position: absolute;
          inset: 0;
          opacity: 0.22;
          pointer-events: none;
          background-image:
            linear-gradient(30deg, transparent 49.5%, rgba(220, 0, 0, 0.35) 50%, transparent 50.5%),
            linear-gradient(150deg, transparent 49.5%, rgba(220, 0, 0, 0.25) 50%, transparent 50.5%);
          background-size: 190px 190px;
        }

        .sponsors-shell {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 1120px;
          margin: 0 auto;
        }

        .sponsors-eyebrow,
        .sponsor-category,
        .sponsor-number {
          font-family: "Orbitron", sans-serif;
          font-weight: 700;
          letter-spacing: 0.16em;
          text-transform: uppercase;
        }

        .sponsors-eyebrow {
          margin: 0 0 0.65rem;
          color: #f5c542;
          font-size: 0.72rem;
        }

        .sponsors-title {
          max-width: 760px;
          margin: 0;
          color: #ffffff;
          font-family: "Bangers", cursive;
          font-size: clamp(2.4rem, 6vw, 4.8rem);
          font-weight: 400;
          letter-spacing: 0.04em;
          line-height: 0.98;
          text-shadow: 0 0 22px rgba(220, 0, 0, 0.42);
        }

        .sponsors-intro {
          max-width: 560px;
          margin: 1rem 0 2.7rem;
          color: #d4d4d8;
          font-family: "Rajdhani", sans-serif;
          font-size: 1.05rem;
          line-height: 1.5;
        }

        .sponsors-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 1.2rem;
        }

        .sponsor-card {
          position: relative;
          display: flex;
          min-height: 245px;
          flex-direction: column;
          justify-content: space-between;
          overflow: hidden;
          padding: 1.35rem;
          border: 1px solid rgba(220, 0, 0, 0.72);
          background: linear-gradient(145deg, rgba(52, 0, 0, 0.68), rgba(8, 8, 8, 0.96) 62%);
          box-shadow: inset 0 0 28px rgba(220, 0, 0, 0.06), 0 0 16px rgba(220, 0, 0, 0.1);
          transition: transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease;
        }

        .sponsor-card::after {
          content: "";
          position: absolute;
          right: -38px;
          bottom: -48px;
          width: 150px;
          height: 150px;
          border: 1px solid rgba(220, 0, 0, 0.48);
          border-radius: 50%;
          box-shadow: 0 0 0 18px rgba(220, 0, 0, 0.07), 0 0 0 36px rgba(220, 0, 0, 0.045);
          pointer-events: none;
        }

        .sponsor-card:hover {
          transform: translateY(-5px);
          border-color: #f5c542;
          box-shadow: inset 0 0 28px rgba(220, 0, 0, 0.1), 0 8px 28px rgba(220, 0, 0, 0.2);
        }

        .sponsor-number {
          position: absolute;
          top: 1rem;
          right: 1.2rem;
          color: rgba(245, 197, 66, 0.78);
          font-size: 0.64rem;
        }

        .sponsor-logo {
          display: grid;
          width: 100%;
          min-height: 112px;
          place-items: center;
          border: 1px dashed rgba(245, 197, 66, 0.7);
          background: rgba(0, 0, 0, 0.48);
          color: #f5c542;
          font-family: "Orbitron", sans-serif;
          font-size: 0.75rem;
          letter-spacing: 0.2em;
        }

        .sponsor-logo img {
          max-width: 80%;
          max-height: 80px;
          object-fit: contain;
        }

        .sponsor-card-copy {
          position: relative;
          z-index: 1;
          margin-top: 1.4rem;
        }

        .sponsor-category {
          margin: 0 0 0.45rem;
          color: #f5c542;
          font-size: 0.62rem;
        }

        .sponsor-card h2 {
          margin: 0;
          color: #ffffff;
          font-family: "Rajdhani", sans-serif;
          font-size: 1.45rem;
          letter-spacing: 0.04em;
        }

        @media (max-width: 768px) {
          .sponsors-panel {
            padding: 3.5rem 1.1rem 4rem;
          }

          .sponsors-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 520px) {
          .sponsors-panel {
            padding: 2.7rem 0.9rem 3.5rem;
          }

          .sponsors-eyebrow {
            font-size: 0.62rem;
          }

          .sponsors-title {
            font-size: clamp(2.2rem, 12vw, 3.4rem);
          }

          .sponsors-intro {
            margin-bottom: 2rem;
            font-size: 0.98rem;
          }

          .sponsors-grid {
            grid-template-columns: 1fr;
            gap: 1rem;
          }

          .sponsor-card {
            min-height: 220px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .sponsor-card {
            transition: none;
          }
        }
      `}</style>
    </>
  );
}
