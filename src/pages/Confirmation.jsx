import { useParams } from "react-router-dom";

export default function Confirmation() {
  const { registrationNumber } = useParams();

  return (
    <>
      <main className="theme-page confirmation-page">
        <section className="content-panel">
          <div className="page-shell confirm-shell">
            <p className="eyebrow accent">Registration</p>
            <h1 className="section-title">Registration Confirmed</h1>

            <div className="confirm-card">
              <div className="confirm-row">
                <span>Registration Number</span>
                <strong>{registrationNumber || "To be confirmed."}</strong>
              </div>
              <div className="confirm-row">
                <span>Participant Name</span>
                <strong>To be confirmed.</strong>
              </div>
              <div className="confirm-row">
                <span>Selected Event</span>
                <strong>To be confirmed.</strong>
              </div>
              <div className="confirm-row">
                <span>Category</span>
                <strong>To be confirmed.</strong>
              </div>
              <div className="confirm-row">
                <span>Payment Status</span>
                <strong>To be confirmed.</strong>
              </div>
              <div className="confirm-row">
                <span>Registration Date</span>
                <strong>To be confirmed.</strong>
              </div>
            </div>
          </div>
        </section>
      </main>

      <style>{`
        .confirm-shell {
          max-width: 900px;
        }

        .confirm-card {
          display: grid;
          gap: 0.8rem;
          margin-top: 1.5rem;
          border: 1px solid rgba(220, 0, 0, 0.35);
          background: rgba(255, 255, 255, 0.01);
          padding: 1.2rem;
        }

        .confirm-row {
          display: grid;
          grid-template-columns: minmax(180px, 220px) minmax(0, 1fr);
          gap: 1rem;
          align-items: baseline;
          padding-top: 0.7rem;
          border-top: 1px solid rgba(220, 0, 0, 0.2);
        }

        .confirm-row:first-child {
          border-top: 0;
          padding-top: 0;
        }

        .confirm-row span {
          color: var(--muted);
          font-family: 'Orbitron', sans-serif;
          font-size: 0.7rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }

        .confirm-row strong {
          color: var(--white);
          font-size: 1.05rem;
        }

        @media (max-width: 620px) {
          .confirm-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </>
  );
}
