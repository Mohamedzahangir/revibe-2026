import { Link } from "react-router-dom";

const technicalEvents = [
  { name: "Paper Presentation", slug: "paper-presentation" },
  { name: "Mini Hackathon", slug: "mini-hackathon" },
  { name: "Technical Quiz", slug: "technical-quiz" },
  { name: "Coding & Debugging", slug: "coding-debugging" },
  { name: "Shark Tank × SGC", slug: "shark-tank-sgc" },
  { name: "Prompt Wars", slug: "prompt-wars" },
];

const nonTechnicalEvents = [
  { name: "Connections", slug: "connections" },
  { name: "Chess", slug: "chess" },
  { name: "Free Fire", slug: "free-fire" },
  { name: "Mehandi", slug: "mehandi" },
  { name: "Cooking Without Fire", slug: "cooking-without-fire" },
  { name: "Art & Painting", slug: "art-painting" },
  { name: "IPL Auction", slug: "ipl-auction" },
];

export default function Home() {
  return (
    <>
      <main className="theme-page home-page">
        <section className="page-hero home-hero" aria-labelledby="hero-title">
          <div className="page-shell">
            <div className="hero-copy">
              <p className="eyebrow">Student Guidance Cell • CAHCET</p>
              <h1 id="hero-title" className="display-title">REVIBE '26</h1>
              <p className="hero-subtitle">National Level Symposium</p>
              <p className="hero-description">
                A student-driven national symposium that brings together creativity,
                technology and participation under one web-powered experience.
              </p>

              <div className="hero-meta" aria-label="REVIBE '26 event overview">
                <span>13 Events</span>
                <span>6 Technical</span>
                <span>7 Non-Technical</span>
              </div>

              <div className="cta-row">
                <Link to="/about" className="primary-btn">Enter the Web</Link>
              </div>
            </div>
          </div>
        </section>

        <section className="content-panel" aria-labelledby="about-title">
          <div className="page-shell compact-layout">
            <div>
              <p className="eyebrow accent">About REVIBE</p>
              <h2 id="about-title" className="section-title">Discover. Participate. REVIBE.</h2>
            </div>

            <div className="text-grid">
              <p>
                REVIBE '26 is a National Level Symposium organized by the Student
                Guidance Cell (SGC), C. Abdul Hakeem College of Engineering &amp;
                Technology.
              </p>
              <p>
                The symposium brings together technical and non-technical events that
                highlight innovation, teamwork, creativity, and problem-solving.
              </p>
            </div>

            <div className="mini-feature-list">
              <span>Explore events</span>
              <span>Compare categories</span>
              <span>Register online</span>
              <span>Track confirmation</span>
            </div>
          </div>
        </section>

        <section className="content-panel muted-panel" aria-labelledby="events-title">
          <div className="page-shell">
            <p className="eyebrow accent">Explore the web</p>
            <h2 id="events-title" className="section-title">Event Highlights</h2>

            <div className="dual-columns">
              <article className="event-group">
                <h3>Technical</h3>
                <ul className="event-list">
                  {technicalEvents.map((event) => (
                    <li key={event.slug}>
                      <span>{event.name}</span>
                      <Link to="/events">View Details</Link>
                    </li>
                  ))}
                </ul>
              </article>

              <article className="event-group">
                <h3>Non-Technical</h3>
                <ul className="event-list">
                  {nonTechnicalEvents.map((event) => (
                    <li key={event.slug}>
                      <span>{event.name}</span>
                      <Link to="/events">View Details</Link>
                    </li>
                  ))}
                </ul>
              </article>
            </div>
          </div>
        </section>
      </main>

      <style>{`
        .theme-page {
          width: 100%;
          color: var(--white);
          overflow-x: hidden;
        }

        .page-shell {
          width: min(1200px, calc(100% - 2rem));
          margin: 0 auto;
        }

        .page-hero {
          position: relative;
          padding: 5rem 0 3rem;
          background:
            radial-gradient(circle at center, rgba(220, 0, 0, 0.12), transparent 28%),
            linear-gradient(180deg, rgba(255, 255, 255, 0.01), rgba(220, 0, 0, 0.04));
        }

        .page-hero .page-shell {
          display: flex;
          justify-content: center;
        }

        .hero-copy {
          max-width: 780px;
          text-align: center;
        }

        .eyebrow {
          margin: 0 0 1rem;
          font-family: 'Orbitron', sans-serif;
          font-size: 0.76rem;
          letter-spacing: 0.16em;
          color: var(--muted);
          text-transform: uppercase;
        }

        .eyebrow.accent {
          color: var(--gold);
        }

        .display-title {
          margin: 0;
          font-family: 'Bangers', cursive;
          font-size: clamp(3rem, 8vw, 8rem);
          line-height: 0.9;
          letter-spacing: 0.06em;
          color: var(--white);
          text-transform: uppercase;
          text-shadow: 0 0 20px rgba(220, 0, 0, 0.18);
          word-break: break-word;
        }

        .hero-subtitle {
          margin: 0.5rem 0 0;
          font-family: 'Orbitron', sans-serif;
          font-size: clamp(0.9rem, 2vw, 1.25rem);
          letter-spacing: 0.18em;
          color: var(--red);
          text-transform: uppercase;
        }

        .hero-description {
          max-width: 620px;
          margin: 1rem auto 0;
          font-size: 1.05rem;
          line-height: 1.7;
          color: var(--soft-white);
        }

        .hero-meta {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 0.75rem;
          margin-top: 1.5rem;
        }

        .hero-meta span {
          padding: 0.55rem 0.8rem;
          border: 1px solid rgba(220, 0, 0, 0.5);
          background: rgba(255, 255, 255, 0.02);
          color: var(--white);
          font-family: 'Orbitron', sans-serif;
          font-size: 0.68rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }

        .cta-row {
          display: flex;
          justify-content: center;
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

        .content-panel {
          padding: 1.5rem 0 3rem;
        }

        .muted-panel {
          background: rgba(255, 255, 255, 0.01);
          border-top: 1px solid rgba(220, 0, 0, 0.25);
          border-bottom: 1px solid rgba(220, 0, 0, 0.25);
        }

        .compact-layout {
          display: grid;
          gap: 1.5rem;
        }

        .section-title {
          margin: 0;
          font-size: clamp(1.8rem, 4vw, 3rem);
          color: var(--white);
          font-family: 'Orbitron', sans-serif;
          letter-spacing: 0.04em;
        }

        .text-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 1.25rem;
          color: var(--soft-white);
        }

        .text-grid p {
          margin: 0;
          line-height: 1.7;
        }

        .mini-feature-list {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
        }

        .mini-feature-list span {
          padding: 0.6rem 0.8rem;
          border: 1px solid rgba(220, 0, 0, 0.5);
          background: rgba(220, 0, 0, 0.04);
          color: var(--white);
          font-family: 'Orbitron', sans-serif;
          font-size: 0.68rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }

        .dual-columns {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 1.5rem;
          margin-top: 1.5rem;
        }

        .event-group {
          border: 1px solid rgba(220, 0, 0, 0.4);
          background: rgba(255, 255, 255, 0.01);
          padding: 1.2rem;
        }

        .event-group h3 {
          margin: 0 0 1rem;
          font-family: 'Orbitron', sans-serif;
          color: var(--white);
          font-size: 1rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }

        .event-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 0.7rem;
        }

        .event-list li {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.75rem;
          padding-top: 0.7rem;
          border-top: 1px solid rgba(220, 0, 0, 0.2);
        }

        .event-list li:first-child {
          border-top: 0;
          padding-top: 0;
        }

        .event-list li span {
          color: var(--white);
          font-size: 1rem;
        }

        .event-list li a {
          flex-shrink: 0;
          color: var(--gold);
          text-decoration: none;
          font-family: 'Orbitron', sans-serif;
          font-size: 0.66rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          white-space: nowrap;
        }

        .event-list li a:hover,
        .event-list li a:focus-visible {
          color: var(--white);
        }

        /* =========================================================
           RESPONSIVE — 1024px and below
        ========================================================= */

        @media (max-width: 1024px) {
          .page-hero {
            padding: 4rem 0 2.5rem;
          }

          .content-panel {
            padding: 1.25rem 0 2.5rem;
          }
        }

        /* =========================================================
           RESPONSIVE — 768px and below (tablet)
        ========================================================= */

        @media (max-width: 768px) {
          .dual-columns,
          .text-grid {
            grid-template-columns: 1fr;
          }

          .page-hero {
            padding: 3.5rem 0 2rem;
          }

          .hero-description {
            font-size: 1rem;
          }

          .content-panel {
            padding: 1rem 0 2.25rem;
          }
        }

        /* =========================================================
           RESPONSIVE — 430px and below (phones)
        ========================================================= */

        @media (max-width: 430px) {
          .page-shell {
            width: min(1200px, calc(100% - 1.6rem));
          }

          .page-hero {
            padding: 3rem 0 1.75rem;
          }

          .eyebrow {
            font-size: 0.68rem;
            letter-spacing: 0.12em;
          }

          .display-title {
            letter-spacing: 0.02em;
          }

          .hero-meta span,
          .mini-feature-list span {
            padding: 0.5rem 0.7rem;
            font-size: 0.64rem;
          }

          .primary-btn,
          .secondary-btn {
            width: 100%;
            min-height: 48px;
          }

          .cta-row {
            flex-direction: column;
          }

          .event-group {
            padding: 1rem;
          }

          .event-list li {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.3rem;
          }
        }

        /* =========================================================
           RESPONSIVE — 320px (smallest supported)
        ========================================================= */

        @media (max-width: 320px) {
          .hero-meta,
          .mini-feature-list {
            gap: 0.5rem;
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