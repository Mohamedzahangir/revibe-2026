import { useLocation, useParams } from "react-router-dom";

export default function Confirmation() {
  const { registrationNumber } = useParams();
  const location = useLocation();

  const registration =
    location.state?.registration ||
    location.state ||
    {};

  const registrationType =
    registration.registrationType ||
    registration.registration_type ||
    "solo";

  const isTeam =
    registrationType === "team" ||
    Boolean(
      registration.teamName ||
      registration.team_name
    );

  const participantName =
    registration.participantName ||
    registration.primaryParticipantName ||
    registration.leadName ||
    registration.primary?.fullName ||
    registration.primary?.full_name ||
    "To be confirmed";

  const teamName =
    registration.teamName ||
    registration.team_name ||
    "To be confirmed";

  const events =
    registration.events ||
    registration.selectedEvents ||
    registration.selectedEventNames ||
    [];

  const amount =
    registration.amount ??
    registration.totalAmount ??
    registration.totalFee ??
    null;

  const paymentStatus =
    registration.paymentStatus ||
    registration.payment_status ||
    "pending";

  const registrationDate =
    registration.registrationDate ||
    registration.registeredAt ||
    registration.registered_at ||
    null;

  const normalizedEvents = Array.isArray(events)
    ? events
    : events
      ? [events]
      : [];

  const isPaymentVerified =
    paymentStatus === "verified" ||
    paymentStatus === "paid" ||
    paymentStatus === "Payment Verified";

  const displayPaymentStatus =
    isPaymentVerified
      ? "Payment Verified"
      : "Pending Verification";

  const formatAmount = (value) => {
    if (
      value === null ||
      value === undefined ||
      value === ""
    ) {
      return "To be confirmed";
    }

    const numericValue = Number(value);

    if (!Number.isNaN(numericValue)) {
      return `₹${numericValue}`;
    }

    return String(value);
  };

  const formatDate = (value) => {
    if (!value) {
      return "To be confirmed";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return String(value);
    }

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <>
      <main className="theme-page confirmation-page">
        <section className="content-panel">
          <div className="page-shell confirm-shell">

            <p className="eyebrow accent">
              Registration
            </p>

            <h1 className="section-title">
              Registration Submitted
            </h1>

            <p className="confirmation-intro">
              Your registration has been submitted
              successfully. Your payment is currently
              awaiting verification.
            </p>

            <div className="confirm-card">

              {/* SOLO / TEAM */}
              {isTeam ? (
                <>
                  <div className="confirm-row">
                    <span>Team Name</span>

                    <strong>
                      {teamName}
                    </strong>
                  </div>

                  <div className="confirm-row">
                    <span>Lead Name</span>

                    <strong>
                      {participantName}
                    </strong>
                  </div>
                </>
              ) : (
                <div className="confirm-row">
                  <span>Participant Name</span>

                  <strong>
                    {participantName}
                  </strong>
                </div>
              )}

              {/* EVENTS */}
              <div className="confirm-row">
                <span>Events Registered</span>

                <div className="event-list">
                  {normalizedEvents.length > 0 ? (
                    normalizedEvents.map(
                      (event, index) => {
                        const eventName =
                          typeof event === "string"
                            ? event
                            : event?.name ||
                              event?.eventName ||
                              event?.title ||
                              "Event";

                        const participantCount =
                          typeof event === "object"
                            ? event?.participantCount ||
                              event?.teamSize ||
                              null
                            : null;

                        return (
                          <div
                            key={
                              event?.id ||
                              event?.slug ||
                              `${eventName}-${index}`
                            }
                            className="event-item"
                          >
                            <strong>
                              {eventName}
                            </strong>

                            {participantCount && (
                              <span>
                                {participantCount}{" "}
                                participant
                                {Number(
                                  participantCount
                                ) > 1
                                  ? "s"
                                  : ""}
                              </span>
                            )}
                          </div>
                        );
                      }
                    )
                  ) : (
                    <strong>
                      To be confirmed
                    </strong>
                  )}
                </div>
              </div>

              {/* REGISTRATION NUMBER */}
              <div className="confirm-row">
                <span>
                  Registration Number
                </span>

                <strong>
                  {registrationNumber ||
                    registration.registrationNumber ||
                    registration.registration_number ||
                    "To be confirmed"}
                </strong>
              </div>

              {/* AMOUNT */}
              <div className="confirm-row">
                <span>Amount</span>

                <strong>
                  {formatAmount(amount)}
                </strong>
              </div>

              {/* PAYMENT STATUS */}
              <div className="confirm-row">
                <span>Payment Status</span>

                <strong
                  className={
                    isPaymentVerified
                      ? "status-verified"
                      : "status-pending"
                  }
                >
                  {displayPaymentStatus}
                </strong>
              </div>

              {/* REGISTRATION DATE */}
              <div className="confirm-row">
                <span>
                  Registration Date
                </span>

                <strong>
                  {formatDate(
                    registrationDate
                  )}
                </strong>
              </div>
            </div>

            {/* PAYMENT VERIFICATION NOTE */}
            <div className="verification-note">
              <strong>
                Payment Verification
              </strong>

              <p>
                Your payment is currently
                <strong className="inline-status">
                  {" "}
                  pending verification
                </strong>
                .
              </p>

              <p>
                Our coordinator will verify
your screenshot
against the actual
Google Pay
transaction.
              </p>

              <p>
                Once your payment is successfully
                verified, your registration will be
                confirmed and you will receive the
                <strong>
                  {" "}
                  official confirmation email
                </strong>
                .
              </p>
            </div>

            {/* IMPORTANT NOTE */}
            <div className="important-note">
              <span className="note-label">
                Important
              </span>

              <p>
                Please keep your registration number
                safe for future reference.
              </p>

              <p>
                Registration submission does not
                mean that the payment has already
                been verified.
              </p>
            </div>

          </div>
        </section>
      </main>

      <style>{`
        .confirm-shell {
          max-width: 900px;
        }

        .confirmation-intro {
          max-width: 720px;
          margin-top: 0.8rem;
          color: var(--muted);
          line-height: 1.7;
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
          grid-template-columns:
            minmax(180px, 220px)
            minmax(0, 1fr);

          gap: 1rem;
          align-items: baseline;

          padding-top: 0.7rem;

          border-top:
            1px solid
            rgba(220, 0, 0, 0.2);
        }

        .confirm-row:first-child {
          border-top: 0;
          padding-top: 0;
        }

        .confirm-row > span {
          color: var(--muted);

          font-family:
            'Orbitron',
            sans-serif;

          font-size: 0.7rem;

          letter-spacing: 0.12em;

          text-transform: uppercase;
        }

        .confirm-row > strong {
          color: var(--white);
          font-size: 1.05rem;
        }

        .event-list {
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
        }

        .event-item {
          display: flex;
          flex-direction: column;
          gap: 0.15rem;
        }

        .event-item strong {
          color: var(--white);
          font-size: 1rem;
        }

        .event-item span {
          color: var(--muted);
          font-size: 0.75rem;
        }

        .status-pending {
          color: #f5c451 !important;
        }

        .status-verified {
          color: #55d98a !important;
        }

        .verification-note,
        .important-note {
          margin-top: 1rem;
          padding: 1rem 1.1rem;

          border:
            1px solid
            rgba(220, 0, 0, 0.25);

          background:
            rgba(255, 255, 255, 0.015);
        }

        .verification-note > strong {
          display: block;

          margin-bottom: 0.45rem;

          color: var(--white);

          font-family:
            'Orbitron',
            sans-serif;

          font-size: 0.75rem;

          letter-spacing: 0.1em;

          text-transform: uppercase;
        }

        .verification-note p,
        .important-note p {
          margin: 0.45rem 0 0;

          color: var(--muted);

          font-size: 0.9rem;

          line-height: 1.7;
        }

        .inline-status {
          color: #f5c451;
        }

        .verification-note p strong:not(.inline-status) {
          color: var(--white);
        }

        .note-label {
          display: inline-block;

          margin-bottom: 0.35rem;

          color: #ffffff;

          font-family:
            'Orbitron',
            sans-serif;

          font-size: 0.7rem;

          font-weight: 700;

          letter-spacing: 0.12em;

          text-transform: uppercase;
        }

        @media (max-width: 620px) {
          .confirm-row {
            grid-template-columns: 1fr;
            gap: 0.4rem;
          }

          .confirm-row > strong {
            font-size: 0.95rem;
          }

          .confirm-card {
            padding: 1rem;
          }
        }
      `}</style>
    </>
  );
}