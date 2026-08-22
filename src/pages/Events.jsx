import { Link } from "react-router-dom";

const events = [
  {
    name: "Paper Presentation",
    slug: "paper-presentation",
    category: "Technical",
    description: "Present your ideas and technical work to a panel of judges.",
  },
  {
    name: "Mini Hackathon",
    slug: "mini-hackathon",
    category: "Technical",
    description: "A short-format build challenge to test speed and problem-solving.",
  },
  {
    name: "Technical Quiz",
    slug: "technical-quiz",
    category: "Technical",
    description: "Test your technical knowledge across multiple rounds.",
  },
  {
    name: "Coding & Debugging",
    slug: "coding-debugging",
    category: "Technical",
    description: "Solve programming problems and fix broken code under time pressure.",
  },
  {
    name: "Shark Tank × SGC",
    slug: "shark-tank-sgc",
    category: "Technical",
    description: "Pitch an idea and defend it before a judging panel.",
  },
  {
    name: "Prompt Wars",
    slug: "prompt-wars",
    category: "Technical",
    description: "A prompt-engineering challenge that rewards creativity and precision.",
  },
  {
    name: "Connections",
    slug: "connections",
    category: "Non-Technical",
    description: "A word-association style group event.",
  },
  {
    name: "Chess",
    slug: "chess",
    category: "Non-Technical",
    description: "A strategic tournament for all skill levels.",
  },
  {
    name: "Free Fire",
    slug: "free-fire",
    category: "Non-Technical",
    description: "A competitive mobile gaming event.",
  },
  {
    name: "Mehandi",
    slug: "mehandi",
    category: "Non-Technical",
    description: "A creative mehandi design competition.",
  },
  {
    name: "Cooking Without Fire",
    slug: "cooking-without-fire",
    category: "Non-Technical",
    description: "A no-flame cooking and presentation challenge.",
  },
  {
    name: "Art & Painting",
    slug: "art-painting",
    category: "Non-Technical",
    description: "An on-the-spot art and painting competition.",
  },
  {
    name: "IPL Auction",
    slug: "ipl-auction",
    category: "Non-Technical",
    description: "A strategy-based team-building and auction simulation event.",
  },
];

const technicalEvents = events.filter((event) => event.category === "Technical");
const nonTechnicalEvents = events.filter((event) => event.category === "Non-Technical");

export default function Events() {
  return (
    <>
      <main className="theme-page events-page">
        <section className="content-panel">
          <div className="page-shell">
            <p className="eyebrow accent">Event list</p>
            <h1 className="section-title">REVIBE '26 Events</h1>
          </div>
        </section>

        <span className="web-divider" aria-hidden="true" />

        <section className="content-panel muted-panel">
          <div className="page-shell">
            <div className="event-group-wrap">
              <article className="event-section-card">
                <h2>Technical Events</h2>
                <div className="event-card-grid">
                  {technicalEvents.map((event) => (
                    <article key={event.slug} className="event-card">
                      <span className="badge">Technical</span>
                      <h3>{event.name}</h3>
                      <p>{event.description}</p>
                      <Link to={`/events/${event.slug}`} className="event-link">
                        View details
                      </Link>
                    </article>
                  ))}
                </div>
              </article>

              <article className="event-section-card">
                <h2>Non-Technical Events</h2>
                <div className="event-card-grid">
                  {nonTechnicalEvents.map((event) => (
                    <article key={event.slug} className="event-card">
                      <span className="badge">Non-Technical</span>
                      <h3>{event.name}</h3>
                      <p>{event.description}</p>
                      <Link to={`/events/${event.slug}`} className="event-link">
                        View details
                      </Link>
                    </article>
                  ))}
                </div>
              </article>
            </div>
          </div>
        </section>
      </main>

      <style>{`
        /* =========================================================
           PAGE / PANEL SHELL (self-contained for Events.jsx)
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
          margin: 0;
          font-family: 'Bangers', cursive;
          font-size: clamp(1.9rem, 4vw, 2.75rem);
          letter-spacing: 0.03em;
          color: var(--white);
          text-shadow: 0 0 18px var(--shadow);
        }

        /* =========================================================
           EVENT GROUPS / CARDS
        ========================================================= */

        .event-group-wrap {
          display: grid;
          gap: 2rem;
        }

        .event-section-card {
          border: 1px solid rgba(220, 0, 0, 0.35);
          background: rgba(255, 255, 255, 0.01);
          padding: 1.4rem;
        }

        .event-section-card h2 {
          margin: 0 0 1rem;
          font-family: 'Orbitron', sans-serif;
          font-size: 1.05rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--white);
        }

        .event-card-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 1rem;
        }

        .event-card {
          display: flex;
          flex-direction: column;
          gap: 0.8rem;
          border: 1px solid rgba(220, 0, 0, 0.35);
          background: rgba(5, 5, 5, 0.4);
          padding: 1rem;
          transition: border-color 0.25s ease, box-shadow 0.25s ease;
        }

        .event-card:hover,
        .event-card:focus-within {
          border-color: rgba(220, 0, 0, 0.75);
          box-shadow: 0 0 24px var(--shadow);
        }

        .badge {
          display: inline-flex;
          align-self: flex-start;
          padding: 0.38rem 0.62rem;
          background: rgba(245, 197, 66, 0.12);
          border: 1px solid rgba(245, 197, 66, 0.55);
          color: var(--gold);
          font-family: 'Orbitron', sans-serif;
          font-size: 0.62rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }

        .event-card h3 {
          margin: 0;
          font-size: 1.2rem;
          color: var(--white);
        }

        .event-card p {
          margin: 0;
          color: var(--soft-white);
          line-height: 1.6;
        }

        .event-link {
          margin-top: auto;
          color: var(--red);
          text-decoration: none;
          font-family: 'Orbitron', sans-serif;
          font-size: 0.7rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          transition: color 0.2s ease;
        }

        .event-link:hover,
        .event-link:focus-visible {
          color: var(--gold);
        }

        /* =========================================================
           RESPONSIVE
        ========================================================= */

        @media (max-width: 1024px) {
          .content-panel {
            padding: 3.25rem 1.25rem;
          }
        }

        @media (max-width: 900px) {
          .event-card-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 768px) {
          .content-panel {
            padding: 2.75rem 1.1rem;
          }

          .section-title {
            font-size: clamp(1.6rem, 5vw, 2.1rem);
          }

          .event-section-card {
            padding: 1.1rem;
          }
        }

        @media (max-width: 620px) {
          .event-card-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 430px) {
          .content-panel {
            padding: 2.25rem 0.9rem;
          }

          .eyebrow {
            font-size: 0.68rem;
            letter-spacing: 0.22em;
          }

          .event-section-card {
            padding: 0.9rem;
          }

          .event-card {
            padding: 0.85rem;
          }

          .event-card h3 {
            font-size: 1.05rem;
          }

          .event-card p {
            font-size: 0.92rem;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .event-card,
          .event-link {
            transition: none;
          }
        }
      `}</style>
    </>
  );
}