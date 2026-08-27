import { useState } from "react";
import { Link } from "react-router-dom";
import SpiderWeb from "../components/navigation/SpiderWeb";
import eventData from "../data/eventData";

const FILTERS = ["All", "Technical", "Non-Technical"];

export default function Events() {
  const [activeFilter, setActiveFilter] = useState("All");

  const filtered =
    activeFilter === "All"
      ? eventData
      : eventData.filter((event) => event.category === activeFilter);

  return (
    <>
      <main className="ev-page">
        <section className="ev-hero">
          <div className="ev-shell">
            <div className="ev-hero-copy">
              <p className="ev-kicker">
                <span className="ev-kicker-dot" />
                Event list
              </p>
              <h1 className="ev-title">REVIBE '26 Events</h1>
              <p className="ev-subtitle">
                {eventData.length} events across technical and non-technical
                domains.
              </p>
            </div>
          </div>
        </section>

        <section className="ev-filters">
          <div className="ev-shell">
            <div className="ev-filter-pill">
              {FILTERS.map((filter, index) => (
                <span key={filter} className="ev-filter-inner">
                  <button
                    type="button"
                    className={`ev-filter-btn${activeFilter === filter ? " ev-filter-btn--active" : ""}`}
                    onClick={() => setActiveFilter(filter)}
                  >
                    {filter}
                  </button>
                  {index < FILTERS.length - 1 && (
                    <span className="ev-filter-divider" />
                  )}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section className="ev-grid-section">
          <SpiderWeb className="ev-web ev-web--tl" />
          <SpiderWeb className="ev-web ev-web--br" />
          <div className="ev-shell">
            {filtered.length > 0 ? (
              <div className="ev-grid">
                {filtered.map((event, index) => (
                  <Link
                    key={event.slug}
                    to={`/events/${event.slug}`}
                    className="ev-card"
                  >
                    <SpiderWeb className="ev-card-web" />
                    <img
                      src={event.chibi}
                      alt=""
                      className="ev-card-chibi"
                    />
                    <span className="ev-card-num">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className={`ev-card-cat${event.category === "Technical" ? " ev-card-cat--tech" : " ev-card-cat--non"}`}>
                      {event.category}
                    </span>
                    <h3 className="ev-card-name">{event.name}</h3>
                    <p className="ev-card-desc">{event.description}</p>
                    <span className="ev-card-link">
                      View details <span className="ev-card-arrow">→</span>
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="ev-empty">
                <h2>No events found</h2>
                <p>There are currently no events available in this category.</p>
              </div>
            )}
          </div>
        </section>
      </main>

      <style>{`
        .ev-page {
          width: 100%;
          background: #f5f5f5;
          color: #1a1a1a;
          overflow-x: hidden;
        }

        .ev-shell {
          width: 100%;
          max-width: 1280px;
          margin: 0 auto;
          padding-inline: 16px;
          box-sizing: border-box;
        }

        @media (min-width: 1024px) {
          .ev-shell { padding-inline: 64px; }
        }

        /* ═══ HERO ═══ */

        .ev-hero {
          position: relative;
          padding: 5rem 0 3rem;
          background: #f9f9f9;
          overflow: hidden;
          border-bottom: 2px solid #1a1a1a;
        }

        .ev-hero::before {
          content: "";
          position: absolute;
          inset: 0;
          background-image:
            repeating-linear-gradient(45deg, rgba(26,26,26,0.05) 0 1px, transparent 1px 28px),
            repeating-linear-gradient(-45deg, rgba(26,26,26,0.05) 0 1px, transparent 1px 28px);
          pointer-events: none;
        }

        .ev-hero-copy {
          text-align: center;
          position: relative;
          z-index: 1;
        }

        .ev-kicker {
          display: inline-flex;
          align-items: center;
          gap: 0.55rem;
          margin: 0 0 0.6rem;
          padding: 0.4rem 0.85rem;
          background: #1a1a1a;
          color: #ffffff;
          font-family: "JetBrains Mono", monospace;
          font-weight: 700;
          font-size: 11px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
        }

        .ev-kicker-dot {
          width: 8px;
          height: 8px;
          background: #dc0000;
          display: inline-block;
        }

        .ev-title {
          margin: 0;
          font-family: "Anton", sans-serif;
          font-weight: 400;
          font-size: clamp(2rem, 6vw, 3.5rem);
          line-height: 1;
          letter-spacing: 0.04em;
          color: #0d0d0d;
          text-transform: uppercase;
        }

        .ev-subtitle {
          margin: 0.8rem 0 0;
          font-family: "Hanken Grotesk", sans-serif;
          font-size: 1.05rem;
          color: #3a3a3a;
        }

        /* ═══ SPIDER WEBS ═══ */

        .ev-web {
          position: absolute;
          pointer-events: none;
          z-index: 0;
        }

        .ev-web--tl {
          top: -60px;
          left: 16px;
          width: 260px;
          height: 260px;
          opacity: 0.5;
        }

        .ev-web--br {
          bottom: 0;
          right: 0;
          width: 180px;
          height: 180px;
          transform: rotate(180deg);
          opacity: 0.35;
        }

        /* ═══ FILTER PILLS ═══ */

        .ev-filters {
          padding: 1.5rem 0;
          background: #f5f5f5;
          display: flex;
          justify-content: center;
        }

        .ev-filter-pill {
          display: inline-flex;
          align-items: stretch;
          padding: 0.25rem;
          background: rgba(245, 245, 245, 0.94);
          border: 1px solid rgba(220, 0, 0, 0.35);
          border-radius: 999px;
          box-shadow:
            0 2px 10px rgba(0, 0, 0, 0.18),
            inset 0 0 0 1px rgba(255, 255, 255, 0.6);
        }

        .ev-filter-inner {
          display: inline-flex;
          align-items: stretch;
        }

        .ev-filter-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0.5rem 1.1rem;
          min-height: 38px;
          border-radius: 999px;
          border: 1px solid transparent;
          background: transparent;
          color: #1a1a1a;
          font-family: "Bebas Neue", sans-serif;
          font-size: 0.95rem;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          cursor: pointer;
          white-space: nowrap;
          transition: color 0.2s ease, background 0.2s ease, box-shadow 0.2s ease;
        }

        .ev-filter-btn:hover {
          color: #dc0000;
          background: rgba(220, 0, 0, 0.08);
        }

        .ev-filter-btn--active {
          color: #ffffff;
          background: #1a1a1a;
          box-shadow: 0 0 12px rgba(0, 0, 0, 0.45);
        }

        .ev-filter-btn--active:hover {
          background: #333333;
          color: #ffffff;
        }

        .ev-filter-divider {
          align-self: center;
          width: 1px;
          height: 1.1rem;
          margin: 0 0.1rem;
          background: rgba(220, 0, 0, 0.28);
          flex-shrink: 0;
        }

        /* ═══ GRID ═══ */

        .ev-grid-section {
          position: relative;
          overflow: hidden;
          padding: 2.5rem 0 4rem;
          background: #f5f5f5;
        }

        .ev-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
          position: relative;
          z-index: 1;
        }

        /* ═══ EVENT CARD ═══ */

        .ev-card {
          position: relative;
          display: flex;
          flex-direction: column;
          gap: 12px;
          padding: 24px;
          padding-bottom: 60px;
          border: 1px solid rgba(220, 0, 0, 0.35);
          border-radius: 16px;
          background:
            linear-gradient(135deg, rgba(255, 255, 255, 0.75), rgba(255, 255, 255, 0.55));
          box-shadow:
            0 10px 30px rgba(0, 0, 0, 0.08),
            inset 0 1px 0 rgba(255, 255, 255, 0.8);
          overflow: hidden;
          text-decoration: none;
          color: inherit;
          transition: box-shadow 0.2s ease, transform 0.2s ease, border-color 0.2s ease;
        }

        .ev-card::after {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, transparent, rgba(220, 0, 0, 0.5), transparent);
          pointer-events: none;
          z-index: 3;
        }

        .ev-card:hover,
        .ev-card:focus-visible {
          transform: translateY(-3px);
          border-color: rgba(220, 0, 0, 0.6);
          box-shadow:
            0 14px 34px rgba(0, 0, 0, 0.12),
            inset 0 1px 0 rgba(255, 255, 255, 0.8);
        }

        .ev-card:hover .ev-card-arrow,
        .ev-card:focus-visible .ev-card-arrow {
          transform: translateX(4px);
        }

        .ev-card-web {
          position: absolute;
          bottom: 50px;
          right: 18px;
          width: 140px;
          height: 140px;
          opacity: 0.4;
          pointer-events: none;
          z-index: 0;
        }

        .ev-card-chibi {
          position: absolute;
          bottom: 10px;
          right: -20px;
          margin-left: 20px;
          width: 200px;
          height: auto;
          object-fit: contain;
          pointer-events: none;
          z-index: 1;
        }

        .ev-card-num {
          position: absolute;
          top: 12px;
          right: 12px;
          z-index: 2;
          padding: 6px 12px;
          background: linear-gradient(180deg, #1a1a1a, #0d0d0d);
          color: #ffffff;
          border: 1px solid rgba(220, 0, 0, 0.3);
          border-radius: 10px;
          font-family: "JetBrains Mono", monospace;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.12em;
          box-shadow:
            0 4px 12px rgba(0, 0, 0, 0.2),
            inset 0 1px 0 rgba(220, 0, 0, 0.15);
        }

        .ev-card-cat {
          display: inline-flex;
          align-self: flex-start;
          margin-top: 20px;
          padding: 4px 10px;
          font-family: "JetBrains Mono", monospace;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          border-radius: 6px;
          
        }

        .ev-card-cat--tech {
          background: rgba(220, 0, 0, 0.08);
          border: 1px solid rgba(220, 0, 0, 0.4);
          color: #dc0000;
        }

        .ev-card-cat--non {
          background: rgba(26, 26, 26, 0.06);
          border: 1px solid rgba(26, 26, 26, 0.3);
          color: #1a1a1a;
        }

        .ev-card-name {
          margin: 0;
          font-family: "Anton", sans-serif;
          font-weight: 400;
          font-size: 1.5rem;
          line-height: 1.05;
          letter-spacing: 0.02em;
          color: #1a1a1a;
          text-transform: uppercase;
          padding-right: 100px;
          
        
        }

        .ev-card-desc {
          margin: 0;
          font-family: "Hanken Grotesk", sans-serif;
          font-size: 0.95rem;
          line-height: 1.5;
          color: #3a3a3a;
          flex: 1;
        
          
        
          
        }

        .ev-card-link {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          margin-top: auto;
          padding-top: 4px;
          font-family: "Anton", sans-serif;
          font-size: 0.9rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #dc0000;
          
        }

        .ev-card-arrow {
          display: inline-block;
          transition: transform 0.2s ease;
        }

        /* ═══ EMPTY STATE ═══ */

        .ev-empty {
          position: relative;
          z-index: 1;
          max-width: 600px;
          margin: 0 auto;
          padding: 3rem 1.5rem;
          text-align: center;
          border: 1px solid rgba(220, 0, 0, 0.3);
          border-radius: 16px;
          background: rgba(255, 255, 255, 0.65);
        }

        .ev-empty h2 {
          margin: 0 0 0.5rem;
          font-family: "Anton", sans-serif;
          font-size: 1.8rem;
          font-weight: 400;
          text-transform: uppercase;
        }

        .ev-empty p {
          margin: 0;
          font-family: "Hanken Grotesk", sans-serif;
          color: #555555;
        }

        /* ═══ RESPONSIVE ═══ */

        @media (max-width: 1024px) {
          .ev-hero { padding: 4rem 0 2.5rem; }
        }

        @media (max-width: 900px) {
          .ev-grid { grid-template-columns: repeat(2, 1fr); }
        }

        @media (max-width: 768px) {
          .ev-hero { padding: 3.5rem 0 2rem; }
          .ev-title { font-size: clamp(1.8rem, 7vw, 2.8rem); }
          .ev-grid-section { padding: 2rem 0 3rem; }
        }

        @media (max-width: 620px) {
          .ev-grid { grid-template-columns: 1fr; }
        }

        @media (max-width: 430px) {
          .ev-shell { padding-inline: 12px; }
          .ev-hero { padding: 2.75rem 0 1.5rem; }
          .ev-title { font-size: clamp(1.6rem, 8vw, 2.2rem); }
          .ev-subtitle { font-size: 0.95rem; }

          .ev-web--tl { display: none; }
          .ev-web--br { display: none; }

          .ev-filters { padding: 1rem 0; }
          .ev-filter-pill { max-width: calc(100vw - 24px); }
          .ev-filter-btn { padding: 0.35rem 0.7rem; min-height: 32px; font-size: 0.82rem; }

          .ev-grid-section { padding: 1.5rem 0 2.5rem; }
          .ev-grid { gap: 16px; }
          .ev-card { padding: 20px; padding-bottom: 50px; }
          .ev-card-chibi { width: 150px;right: -20px; }
          .ev-card-web { width: 110px; height: 110px; bottom:30px; right:0px; }
          .ev-card-name { font-size: 1.3rem; padding-right: 50px; }
          .ev-card-desc { font-size: 0.9rem; }
        }

        @media (max-width: 390px) {
          .ev-filter-btn {
            min-height: 28px;
            padding-inline: 0.55rem;
            font-size: 0.72rem;
            letter-spacing: 0.05em;
          }
          .ev-filter-divider { height: 0.85rem; }
        }

        @media (prefers-reduced-motion: reduce) {
          .ev-card { transition: none; }
          .ev-card-arrow { transition: none; }
          .ev-filter-btn { transition: none; }
        }
      `}</style>
    </>
  );
}
