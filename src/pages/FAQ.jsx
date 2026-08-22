const faqItems = [
  {
    question: "How can I register for REVIBE '26?",
    answer:
      "Participants can browse events, select the appropriate option, and complete the registration form through the website.",
  },
  {
    question: "Are both Technical and Non-Technical events available?",
    answer:
      "Yes. REVIBE '26 includes both categories, giving students the opportunity to participate in a varied lineup of events.",
  },
  {
    question: "Can I register for multiple events?",
    answer:
      "Multiple-event participation is subject to the final event rules and organizer confirmation.",
  },
  {
    question: "How will payment be handled?",
    answer:
      "The registration flow will specify the applicable event fee and payment status as it is finalized by the organizers.",
  },
  {
    question: "When will registration confirmation be shared?",
    answer:
      "Confirmation details will be communicated through the registration workflow once the review and verification process is complete.",
  },
  {
    question: "Where and when will REVIBE '26 be held?",
    answer:
      "The event date and venue details will be published once confirmed by the organizing team.",
  },
];

export default function FAQ() {
  return (
    <>
      <main className="theme-page faq-page">
        <section className="content-panel">
          <div className="page-shell faq-shell">
            <p className="eyebrow accent">Frequently asked</p>
            <h1 className="section-title">FAQs</h1>

            <div className="faq-list">
              {faqItems.map((faq) => (
                <article key={faq.question} className="faq-entry">
                  <h2>{faq.question}</h2>
                  <p>{faq.answer}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>

      <style>{`
        /* =========================================================
           PAGE / PANEL SHELL (self-contained for FAQ.jsx)
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

        .faq-shell {
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
          margin: 0 0 1.25rem;
          font-family: 'Bangers', cursive;
          font-size: clamp(1.9rem, 4vw, 2.75rem);
          letter-spacing: 0.03em;
          color: var(--white);
          text-shadow: 0 0 18px var(--shadow);
        }

        /* =========================================================
           FAQ LIST
        ========================================================= */

        .faq-list {
          display: grid;
          gap: 1rem;
          margin-top: 1.5rem;
        }

        .faq-entry {
          border-left: 2px solid rgba(220, 0, 0, 0.7);
          background: rgba(255, 255, 255, 0.01);
          padding: 1.1rem 1.2rem;
          transition: border-color 0.25s ease, box-shadow 0.25s ease;
        }

        .faq-entry:hover,
        .faq-entry:focus-within {
          border-color: rgba(220, 0, 0, 0.95);
          box-shadow: 0 0 20px var(--shadow);
        }

        .faq-entry h2 {
          margin: 0 0 0.5rem;
          font-size: 1.08rem;
          color: var(--white);
        }

        .faq-entry p {
          margin: 0;
          color: var(--soft-white);
          line-height: 1.7;
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

          .faq-entry {
            padding: 0.95rem 1rem;
          }

          .faq-entry h2 {
            font-size: 1rem;
          }

          .faq-entry p {
            font-size: 0.92rem;
          }
        }

        /* =========================================================
           RESPONSIVE — 320px (smallest supported)
        ========================================================= */

        @media (max-width: 320px) {
          .faq-entry {
            padding: 0.85rem 0.9rem;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .faq-entry {
            transition: none;
          }
        }
      `}</style>
    </>
  );
}