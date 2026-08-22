import { Link, useParams } from "react-router-dom";

const eventCatalog = [
  {
    slug: "paper-presentation",
    name: "Paper Presentation",
    category: "Technical",
    description: "Present your ideas and technical work to a panel of judges.",
    rules: "To be announced.",
    teamSize: "To be announced.",
    registrationFee: "To be announced.",
    coordinator: "To be announced.",
  },
  {
    slug: "mini-hackathon",
    name: "Mini Hackathon",
    category: "Technical",
    description: "A short-format product-build challenge for teams to create and present solutions.",
    rules: "To be announced.",
    teamSize: "To be announced.",
    registrationFee: "To be announced.",
    coordinator: "To be announced.",
  },
  {
    slug: "technical-quiz",
    name: "Technical Quiz",
    category: "Technical",
    description: "Compete in fast-paced technical rounds that test knowledge across disciplines.",
    rules: "To be announced.",
    teamSize: "To be announced.",
    registrationFee: "To be announced.",
    coordinator: "To be announced.",
  },
  {
    slug: "coding-debugging",
    name: "Coding & Debugging",
    category: "Technical",
    description: "Solve coding challenges and debug faulty programs under time pressure.",
    rules: "To be announced.",
    teamSize: "To be announced.",
    registrationFee: "To be announced.",
    coordinator: "To be announced.",
  },
  {
    slug: "shark-tank-sgc",
    name: "Shark Tank × SGC",
    category: "Technical",
    description: "Pitch an innovative idea and defend it in front of a judging panel.",
    rules: "To be announced.",
    teamSize: "To be announced.",
    registrationFee: "To be announced.",
    coordinator: "To be announced.",
  },
  {
    slug: "prompt-wars",
    name: "Prompt Wars",
    category: "Technical",
    description: "A creative challenge centered on formulating high-quality prompts and problem-solving.",
    rules: "To be announced.",
    teamSize: "To be announced.",
    registrationFee: "To be announced.",
    coordinator: "To be announced.",
  },
  {
    slug: "connections",
    name: "Connections",
    category: "Non-Technical",
    description: "A word-association style group activity that rewards quick thinking.",
    rules: "To be announced.",
    teamSize: "To be announced.",
    registrationFee: "To be announced.",
    coordinator: "To be announced.",
  },
  {
    slug: "chess",
    name: "Chess",
    category: "Non-Technical",
    description: "A classic strategy tournament for players of different experience levels.",
    rules: "To be announced.",
    teamSize: "To be announced.",
    registrationFee: "To be announced.",
    coordinator: "To be announced.",
  },
  {
    slug: "free-fire",
    name: "Free Fire",
    category: "Non-Technical",
    description: "A competitive mobile gaming event for skilled players.",
    rules: "To be announced.",
    teamSize: "To be announced.",
    registrationFee: "To be announced.",
    coordinator: "To be announced.",
  },
  {
    slug: "mehandi",
    name: "Mehandi",
    category: "Non-Technical",
    description: "A creative mehndi competition centered on artistic design and elegance.",
    rules: "To be announced.",
    teamSize: "To be announced.",
    registrationFee: "To be announced.",
    coordinator: "To be announced.",
  },
  {
    slug: "cooking-without-fire",
    name: "Cooking Without Fire",
    category: "Non-Technical",
    description: "A no-flame cooking challenge combining creativity, presentation, and taste.",
    rules: "To be announced.",
    teamSize: "To be announced.",
    registrationFee: "To be announced.",
    coordinator: "To be announced.",
  },
  {
    slug: "art-painting",
    name: "Art & Painting",
    category: "Non-Technical",
    description: "An on-the-spot art and painting challenge for creatively inclined participants.",
    rules: "To be announced.",
    teamSize: "To be announced.",
    registrationFee: "To be announced.",
    coordinator: "To be announced.",
  },
  {
    slug: "ipl-auction",
    name: "IPL Auction",
    category: "Non-Technical",
    description: "A strategy-heavy team simulation and auction experience.",
    rules: "To be announced.",
    teamSize: "To be announced.",
    registrationFee: "To be announced.",
    coordinator: "To be announced.",
  },
];

export default function EventDetails() {
  const { slug } = useParams();
  const event = eventCatalog.find((item) => item.slug === slug) || {
    slug,
    name: "Event details",
    category: "To be announced.",
    description: "Event information will be updated soon.",
    rules: "To be announced.",
    teamSize: "To be announced.",
    registrationFee: "To be announced.",
    coordinator: "To be announced.",
  };

  return (
    <>
      <main className="theme-page event-details-page">
        <section className="content-panel">
          <div className="page-shell detail-shell">
            <div className="detail-header">
              <p className="eyebrow accent">Event details</p>
              <h1 className="section-title">{event.name}</h1>
              <span className="detail-badge">{event.category}</span>
            </div>

            <div className="detail-grid">
              <article className="detail-card">
                <h2>Description</h2>
                <p>{event.description}</p>
              </article>

              <article className="detail-card">
                <h2>Information</h2>
                <ul className="meta-list">
                  <li><span>Rules</span><strong>{event.rules}</strong></li>
                  <li><span>Team size</span><strong>{event.teamSize}</strong></li>
                  <li><span>Registration fee</span><strong>{event.registrationFee}</strong></li>
                  <li><span>Coordinator</span><strong>{event.coordinator}</strong></li>
                </ul>
              </article>
            </div>

            <div className="detail-actions">
              <Link to="/register" className="primary-btn">Register now</Link>
              <Link to="/events" className="secondary-btn">Back to events</Link>
            </div>
          </div>
        </section>
      </main>

      <style>{`
        /* =========================================================
           PAGE / PANEL SHELL (self-contained for EventDetails.jsx)
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

        .detail-shell {
          max-width: 980px;
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
          margin: 0 0 0.75rem;
          font-family: 'Bangers', cursive;
          font-size: clamp(1.9rem, 4vw, 2.75rem);
          letter-spacing: 0.03em;
          color: var(--white);
          text-shadow: 0 0 18px var(--shadow);
        }

        .detail-header {
          margin-bottom: 1.5rem;
        }

        .detail-badge {
          display: inline-flex;
          padding: 0.45rem 0.7rem;
          border: 1px solid rgba(220, 0, 0, 0.5);
          background: rgba(220, 0, 0, 0.05);
          color: var(--gold);
          font-family: 'Orbitron', sans-serif;
          font-size: 0.68rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }

        /* =========================================================
           DETAIL GRID / CARDS
        ========================================================= */

        .detail-grid {
          display: grid;
          grid-template-columns: 1.1fr 0.9fr;
          gap: 1.25rem;
        }

        .detail-card {
          border: 1px solid rgba(220, 0, 0, 0.35);
          background: rgba(255, 255, 255, 0.01);
          padding: 1.2rem;
        }

        .detail-card h2 {
          margin: 0 0 0.75rem;
          font-family: 'Orbitron', sans-serif;
          font-size: 0.8rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--red);
        }

        .detail-card p {
          margin: 0;
          color: var(--soft-white);
          line-height: 1.7;
        }

        .meta-list {
          list-style: none;
          margin: 0;
          padding: 0;
          display: grid;
          gap: 0.9rem;
        }

        .meta-list li {
          display: grid;
          gap: 0.2rem;
          padding-top: 0.75rem;
          border-top: 1px solid rgba(220, 0, 0, 0.2);
        }

        .meta-list li:first-child {
          border-top: 0;
          padding-top: 0;
        }

        .meta-list span {
          color: var(--muted);
          font-size: 0.7rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          font-family: 'Orbitron', sans-serif;
        }

        .meta-list strong {
          color: var(--white);
          font-weight: 600;
        }

        /* =========================================================
           ACTIONS / BUTTONS
        ========================================================= */

        .detail-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
          margin-top: 2rem;
        }

        .primary-btn,
        .secondary-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 46px;
          padding: 0.8rem 1.25rem;
          border: 1px solid transparent;
          font-family: 'Orbitron', sans-serif;
          font-size: 0.72rem;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          text-decoration: none;
          transition: transform 0.2s ease;
        }

        .primary-btn {
          background: var(--red);
          color: var(--white);
          box-shadow: 0 0 18px rgba(220, 0, 0, 0.25);
        }

        .secondary-btn {
          border-color: rgba(220, 0, 0, 0.7);
          background: rgba(255, 255, 255, 0.01);
          color: var(--white);
        }

        .primary-btn:hover,
        .primary-btn:focus-visible,
        .secondary-btn:hover,
        .secondary-btn:focus-visible {
          transform: translateY(-1px);
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

          .detail-grid {
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

          .detail-card {
            padding: 1rem;
          }

          .detail-actions {
            flex-direction: column;
          }

          .primary-btn,
          .secondary-btn {
            width: 100%;
          }
        }

        /* =========================================================
           RESPONSIVE — 320px (smallest supported)
        ========================================================= */

        @media (max-width: 320px) {
          .detail-badge {
            font-size: 0.6rem;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .primary-btn,
          .secondary-btn {
            transition: none;
          }
        }
      `}</style>
    </>
  );
}