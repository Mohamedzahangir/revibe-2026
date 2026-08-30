import React from "react";

export default function RegisterUI({
  step,
  form,
  errors,

  events,
  eventsLoading,
  eventsError,

  selectedEvents = [],
  selectedEvent,
  minTeamSize,
  maxTeamSize,
  totalFee,

  paymentData,
  getFeeLabel,

  submitted,
  registrationNumber,
  registrationNumbers = [],

  submitting,
  submitError,

  onUpdate,
  onEventChange,
  onTeamSizeChange,
  onMemberUpdate,

  onNext,
  onBack,
  onSubmit,

  onRefreshEvents,
}) {
  /*
   * selectedEvents is now the source of truth.
   *
   * selectedEvent is kept as a fallback so the component
   * remains compatible with the current Register.jsx while
   * we transition the UI.
   */

  const activeEvents =
    Array.isArray(selectedEvents) &&
    selectedEvents.length > 0
      ? selectedEvents
      : selectedEvent
        ? [selectedEvent]
        : [];

  const firstSelectedEvent =
    activeEvents[0] || null;

  const participantCount =
    Number(form.teamSize) || 1;

  const memberCount =
    Math.max(participantCount - 1, 0);

  /*
   * Event selection helper.
   *
   * Register.jsx should pass the selected event slug to
   * onEventChange(). The parent is responsible for adding/
   * removing the event from selectedEvents.
   */
  const isEventSelected = (event) =>
    activeEvents.some(
      (item) =>
        item.id === event.id ||
        item.slug === event.slug
    );

  /*
   * Selected event fee.
   *
   * totalFee is already calculated by Register.jsx.
   */
  const selectedEventNames =
    activeEvents.map((event) => event.name);

  if (submitted) {
    return (
      <main className="register-page">
        <section className="register-success-section">
          <div className="register-shell">
            <div className="register-success-card">

              <div className="success-icon">
                ✓
              </div>

              <p className="register-eyebrow">
                REVIBE '26
              </p>

              <h1>
                Registration Submitted
              </h1>

              <p className="success-intro">
                Your registration details and payment
                have been submitted successfully.
              </p>

              <div className="success-details">

                <div>
                  <span>
                    Participant
                  </span>

                  <strong>
                    {form.name || "—"}
                  </strong>
                </div>

                <div>
                  <span>
                    Events
                  </span>

                  <strong>
                    {selectedEventNames.length > 0
                      ? selectedEventNames.join(", ")
                      : "—"}
                  </strong>
                </div>

                <div>
                  <span>
                    Participants
                  </span>

                  <strong>
                    {participantCount}
                  </strong>
                </div>

                {registrationNumber && (
                  <div>
                    <span>
                      Registration No.
                    </span>

                    <strong>
                      {registrationNumber}
                    </strong>
                  </div>
                )}

                {Array.isArray(
                  registrationNumbers
                ) &&
                  registrationNumbers.length > 0 &&
                  !registrationNumber && (
                    <div>
                      <span>
                        Registration No.
                      </span>

                      <strong>
                        {registrationNumbers
                          .map(
                            (item) =>
                              item.registrationNumber
                          )
                          .filter(Boolean)
                          .join(", ")}
                      </strong>
                    </div>
                  )}

                <div>
                  <span>
                    Amount
                  </span>

                  <strong>
                    ₹{totalFee}
                  </strong>
                </div>

              </div>

              {totalFee > 0 && (
                <div className="success-warning">

                  <strong>
                    Payment verification pending
                  </strong>

                  <p>
                    Your payment is pending verification.
                    Your registration will be confirmed
                    only after successful payment verification.
                  </p>

                </div>
              )}

              <div className="success-group-note">
                <strong>
                  WhatsApp Group
                </strong>

                <p>
                  After successful payment verification,
                  you will be added to the respective
                  event WhatsApp group.
                </p>
              </div>

              <p className="success-note">
                Please keep your registration number
                safely for future reference.
              </p>

            </div>
          </div>
        </section>

        <RegisterStyles />
      </main>
    );
  }

  return (
    <>
      <main className="register-page">
        <section className="register-main">
          <div className="register-shell">

            {/* =================================================
                HEADER
            ================================================= */}

            <div className="register-heading">

              <p className="register-eyebrow">
                PARTICIPANT REGISTRATION
              </p>

              <h1>
                Register for REVIBE '26
              </h1>

              <p>
                Complete your registration in three
                simple steps.
              </p>

            </div>

            {/* =================================================
                STEPS
            ================================================= */}

            <div
              className="register-steps"
              aria-label="Registration progress"
            >

              <Step
                number="01"
                title="Personal Info"
                active={step === 1}
                completed={step > 1}
              />

              <div
                className={`step-line ${
                  step > 1
                    ? "completed"
                    : ""
                }`}
              />

              <Step
                number="02"
                title="Select Events"
                active={step === 2}
                completed={step > 2}
              />

              <div
                className={`step-line ${
                  step > 2
                    ? "completed"
                    : ""
                }`}
              />

              <Step
                number="03"
                title="Payment"
                active={step === 3}
                completed={false}
              />

            </div>

            <form
              onSubmit={onSubmit}
              noValidate
            >

              {/* =================================================
                  STEP 1
              ================================================= */}

              {step === 1 && (
                <section className="register-card">

                  <div className="card-heading">

                    <span className="card-number">
                      01
                    </span>

                    <div>
                      <p>
                        STEP ONE
                      </p>

                      <h2>
                        Personal Information
                      </h2>
                    </div>

                  </div>

                  <p className="card-description">
                    Enter the details of the team lead
                    or individual participant.
                  </p>

                  <div className="field-grid">

                    <Field
                      label="Full Name"
                      required
                      error={errors.name}
                    >
                      <input
                        type="text"
                        value={form.name}
                        onChange={(e) =>
                          onUpdate(
                            "name",
                            e.target.value
                          )
                        }
                        placeholder="Enter your full name"
                        autoComplete="name"
                      />
                    </Field>

                    <Field
                      label="Email Address"
                      required
                      error={errors.email}
                    >
                      <input
                        type="email"
                        value={form.email}
                        onChange={(e) =>
                          onUpdate(
                            "email",
                            e.target.value
                          )
                        }
                        placeholder="your@email.com"
                        autoComplete="email"
                      />
                    </Field>

                    <Field
                      label="Mobile Number"
                      required
                      error={errors.phone}
                    >
                      <input
                        type="tel"
                        inputMode="numeric"
                        value={form.phone}
                        maxLength={10}
                        onChange={(e) =>
                          onUpdate(
                            "phone",
                            e.target.value.replace(
                              /\D/g,
                              ""
                            )
                          )
                        }
                        placeholder="10-digit mobile number"
                        autoComplete="tel"
                      />
                    </Field>

                    <Field
                      label="College Name"
                      required
                      error={errors.college}
                    >
                      <input
                        type="text"
                        value={form.college}
                        onChange={(e) =>
                          onUpdate(
                            "college",
                            e.target.value
                          )
                        }
                        placeholder="Enter your college name"
                      />
                    </Field>

                    <Field
                      label="Department"
                      required
                      error={errors.department}
                    >
                      <input
                        type="text"
                        value={form.department}
                        onChange={(e) =>
                          onUpdate(
                            "department",
                            e.target.value
                          )
                        }
                        placeholder="e.g. CSE, IT, ECE"
                      />
                    </Field>

                    <Field
                      label="Year of Study"
                      required
                      error={errors.year}
                    >
                      <select
                        value={form.year}
                        onChange={(e) =>
                          onUpdate(
                            "year",
                            e.target.value
                          )
                        }
                      >
                        <option value="">
                          Select year
                        </option>

                        <option value="1st Year">
                          1st Year
                        </option>

                        <option value="2nd Year">
                          2nd Year
                        </option>

                        <option value="3rd Year">
                          3rd Year
                        </option>

                        <option value="4th Year">
                          4th Year
                        </option>
                      </select>
                    </Field>

                  </div>

                  <div className="step-actions">

                    <span />

                    <button
                      type="button"
                      className="register-primary-btn"
                      onClick={onNext}
                    >
                      Continue
                      <span>→</span>
                    </button>

                  </div>

                </section>
              )}

              {/* =================================================
                  STEP 2
              ================================================= */}

              {step === 2 && (
                <section className="register-card">

                  <div className="card-heading">

                    <span className="card-number">
                      02
                    </span>

                    <div>
                      <p>
                        STEP TWO
                      </p>

                      <h2>
                        Select Events
                      </h2>
                    </div>

                  </div>

                  <p className="card-description">
                    Select one or more events. All selected
                    events will be included in one registration
                    slot and one combined payment.
                  </p>

                  {eventsLoading && (
                    <div className="register-loading">
                      Loading available events...
                    </div>
                  )}

                  {eventsError && (
                    <div className="register-error-box">

                      <strong>
                        Unable to load events
                      </strong>

                      <p>
                        {eventsError}
                      </p>

                      <button
                        type="button"
                        onClick={onRefreshEvents}
                      >
                        Refresh
                      </button>

                    </div>
                  )}

                  {!eventsLoading &&
                    !eventsError && (
                      <>

                        {/* =================================================
                            EVENT SELECT
                        ================================================= */}

                        <div className="event-selection-heading">

                          <div>
                            <span>
                              AVAILABLE EVENTS
                            </span>

                            <h3>
                              Choose Your Events
                            </h3>
                          </div>

                          <strong>
                            {activeEvents.length}{" "}
                            selected
                          </strong>

                        </div>

                        {errors.eventSlug && (
                          <p className="field-error event-selection-error">
                            {errors.eventSlug}
                          </p>
                        )}

                        <div className="events-grid">

                          {events.map((event) => {

                            const selected =
                              isEventSelected(event);

                            return (
                              <button
                                type="button"
                                key={event.id}
                                className={`event-option ${
                                  selected
                                    ? "selected"
                                    : ""
                                }`}
                                onClick={() =>
                                  onEventChange(
                                    event.slug
                                  )
                                }
                              >

                                <span className="event-check">
                                  {selected
                                    ? "✓"
                                    : ""}
                                </span>

                                <span className="event-option-content">

                                  <strong>
                                    {event.name}
                                  </strong>

                                  {event.category && (
                                    <small>
                                      {event.category}
                                    </small>
                                  )}

                                </span>

                              </button>
                            );
                          })}

                        </div>

                        {/* =================================================
                            SELECTED EVENTS
                        ================================================= */}

                        {activeEvents.length > 0 && (
                          <div className="selected-events-card">

                            <div className="selected-events-heading">

                              <div>
                                <span>
                                  SELECTED EVENTS
                                </span>

                                <h3>
                                  Your Events
                                </h3>
                              </div>

                              <strong>
                                {activeEvents.length}
                              </strong>

                            </div>

                            <div className="selected-events-list">

                              {activeEvents.map(
                                (event) => (
                                  <div
                                    className="selected-event-row"
                                    key={event.id}
                                  >

                                    <div>
                                      <strong>
                                        {event.name}
                                      </strong>

                                      {event.category && (
                                        <span>
                                          {event.category}
                                        </span>
                                      )}
                                    </div>

                                    <button
                                      type="button"
                                      onClick={() =>
                                        onEventChange(
                                          event.slug
                                        )
                                      }
                                      aria-label={`Remove ${event.name}`}
                                    >
                                      ×
                                    </button>

                                  </div>
                                )
                              )}

                            </div>

                          </div>
                        )}

                        {/* =================================================
                            PARTICIPANT COUNT
                        ================================================= */}

                        {activeEvents.length > 0 && (
                          <div className="participant-configuration">

                            <div className="configuration-heading">

                              <span>
                                PARTICIPANT CONFIGURATION
                              </span>

                              <h3>
                                Team / Participant Details
                              </h3>

                            </div>

                            <p className="configuration-note">
                              Select the number of participants
                              for this registration. The same
                              participant list will be registered
                              for all selected events.
                            </p>

                            <div className="team-size-section">

                              <Field
                                label="Number of Participants"
                                required
                                error={
                                  errors.teamSize
                                }
                              >

                                <select
                                  value={
                                    form.teamSize
                                  }
                                  onChange={(e) =>
                                    onTeamSizeChange(
                                      e.target.value
                                    )
                                  }
                                >

                                  {Array.from(
                                    {
                                      length:
                                        maxTeamSize -
                                        minTeamSize +
                                        1,
                                    },
                                    (_, index) => {

                                      const size =
                                        minTeamSize +
                                        index;

                                      return (
                                        <option
                                          key={size}
                                          value={size}
                                        >
                                          {size}{" "}
                                          {size === 1
                                            ? "Participant"
                                            : "Participants"}
                                        </option>
                                      );
                                    }
                                  )}

                                </select>

                              </Field>

                              <div className="team-info">

                                <strong>
                                  Min: {minTeamSize}{" "}
                                  | Max:{" "}
                                  {maxTeamSize}
                                </strong>

                                <span>
                                  This participant count
                                  applies to the complete
                                  registration.
                                </span>

                              </div>

                            </div>

                          </div>
                        )}

                        {/* =================================================
                            TEAM MEMBERS
                        ================================================= */}

                        {activeEvents.length > 0 &&
                          participantCount > 1 && (
                            <div className="members-section">

                              <div className="members-heading">

                                <div>
                                  <span>
                                    TEAM MEMBERS
                                  </span>

                                  <h3>
                                    Member Details
                                  </h3>
                                </div>

                                <strong>
                                  {memberCount}{" "}
                                  {memberCount === 1
                                    ? "Member"
                                    : "Members"}
                                </strong>

                              </div>

                              <p className="members-note">
                                The participant above is the
                                team lead. Enter the complete
                                details of every additional
                                member.
                              </p>

                              <div className="members-list">

                                {form.members.map(
                                  (member, index) => (
                                    <div
                                      className="member-card"
                                      key={index}
                                    >

                                      <div className="member-number">
                                        TEAM MEMBER{" "}
                                        {index + 2}
                                      </div>

                                      <div className="field-grid">

                                        <Field
                                          label="Full Name"
                                          required
                                          error={
                                            errors[
                                              `member-${index}-name`
                                            ] ||
                                            errors[
                                              `member-${index}-fullName`
                                            ]
                                          }
                                        >

                                          <input
                                            type="text"
                                            value={
                                              member.fullName ??
                                              member.name ??
                                              ""
                                            }
                                            onChange={(e) =>
                                              onMemberUpdate(
                                                index,
                                                "fullName",
                                                e.target.value
                                              )
                                            }
                                            placeholder="Enter full name"
                                          />

                                        </Field>

                                        <Field
                                          label="Email Address"
                                          required
                                          error={
                                            errors[
                                              `member-${index}-email`
                                            ]
                                          }
                                        >

                                          <input
                                            type="email"
                                            value={
                                              member.email ??
                                              ""
                                            }
                                            onChange={(e) =>
                                              onMemberUpdate(
                                                index,
                                                "email",
                                                e.target.value
                                              )
                                            }
                                            placeholder="member@email.com"
                                          />

                                        </Field>

                                        <Field
                                          label="Mobile Number"
                                          required
                                          error={
                                            errors[
                                              `member-${index}-phone`
                                            ]
                                          }
                                        >

                                          <input
                                            type="tel"
                                            inputMode="numeric"
                                            maxLength={10}
                                            value={
                                              member.phone ??
                                              ""
                                            }
                                            onChange={(e) =>
                                              onMemberUpdate(
                                                index,
                                                "phone",
                                                e.target.value.replace(
                                                  /\D/g,
                                                  ""
                                                )
                                              )
                                            }
                                            placeholder="10-digit mobile number"
                                          />

                                        </Field>

                                        <Field
                                          label="College Name"
                                          required
                                          error={
                                            errors[
                                              `member-${index}-college`
                                            ]
                                          }
                                        >

                                          <input
                                            type="text"
                                            value={
                                              member.college ??
                                              ""
                                            }
                                            onChange={(e) =>
                                              onMemberUpdate(
                                                index,
                                                "college",
                                                e.target.value
                                              )
                                            }
                                            placeholder="Enter college name"
                                          />

                                        </Field>

                                        <Field
                                          label="Department"
                                          required
                                          error={
                                            errors[
                                              `member-${index}-department`
                                            ]
                                          }
                                        >

                                          <input
                                            type="text"
                                            value={
                                              member.department ??
                                              ""
                                            }
                                            onChange={(e) =>
                                              onMemberUpdate(
                                                index,
                                                "department",
                                                e.target.value
                                              )
                                            }
                                            placeholder="e.g. CSE, IT, ECE"
                                          />

                                        </Field>

                                        <Field
                                          label="Year of Study"
                                          required
                                          error={
                                            errors[
                                              `member-${index}-year`
                                            ]
                                          }
                                        >

                                          <select
                                            value={
                                              member.year ??
                                              ""
                                            }
                                            onChange={(e) =>
                                              onMemberUpdate(
                                                index,
                                                "year",
                                                e.target.value
                                              )
                                            }
                                          >

                                            <option value="">
                                              Select year
                                            </option>

                                            <option value="1st Year">
                                              1st Year
                                            </option>

                                            <option value="2nd Year">
                                              2nd Year
                                            </option>

                                            <option value="3rd Year">
                                              3rd Year
                                            </option>

                                            <option value="4th Year">
                                              4th Year
                                            </option>

                                          </select>

                                        </Field>

                                      </div>
                                    </div>
                                  )
                                )}

                              </div>
                            </div>
                          )}

                        {/* =================================================
                            SOLO INFO
                        ================================================= */}

                        {activeEvents.length > 0 &&
                          participantCount === 1 && (
                            <div className="solo-info">

                              <strong>
                                Individual Registration
                              </strong>

                              <p>
                                You are registering as a
                                single participant for all
                                selected events.
                              </p>

                            </div>
                          )}

                        {/* =================================================
                            COMBINED FEE
                        ================================================= */}

                        {activeEvents.length > 0 && (
                          <div className="fee-summary">

                            <div>
                              <span>
                                SELECTED EVENTS
                              </span>

                              <strong>
                                {activeEvents.length}
                              </strong>
                            </div>

                            <div>
                              <span>
                                PARTICIPANTS
                              </span>

                              <strong>
                                {participantCount}
                              </strong>
                            </div>

                            <div className="total-fee">
                              <span>
                                COMBINED TOTAL
                              </span>

                              <strong>
                                ₹{totalFee}
                              </strong>
                            </div>

                          </div>
                        )}

                      </>
                    )}

                  <div className="step-actions">

                    <button
                      type="button"
                      className="register-secondary-btn"
                      onClick={onBack}
                    >
                      ← Back
                    </button>

                    <button
                      type="button"
                      className="register-primary-btn"
                      onClick={onNext}
                      disabled={
                        eventsLoading ||
                        !!eventsError ||
                        activeEvents.length === 0
                      }
                    >
                      Continue
                      <span>→</span>
                    </button>

                  </div>

                </section>
              )}

              {/* =================================================
                  STEP 3 — PAYMENT
              ================================================= */}

              {step === 3 && (
                <section className="register-card">

                  <div className="card-heading">

                    <span className="card-number">
                      03
                    </span>

                    <div>
                      <p>
                        STEP THREE
                      </p>

                      <h2>
                        Payment
                      </h2>
                    </div>

                  </div>

                  <p className="card-description">
                    Make one combined payment for all your
                    selected events.
                  </p>

                  {/* =================================================
                      PAYMENT SUMMARY
                  ================================================= */}

                  <div className="payment-summary">

                    <div className="payment-summary-events">

                      <span>
                        SELECTED EVENTS
                      </span>

                      <div className="payment-event-list">

                        {activeEvents.map(
                          (event) => (
                            <strong
                              key={event.id}
                            >
                              {event.name}
                            </strong>
                          )
                        )}

                      </div>

                    </div>

                    <div>
                      <span>
                        PARTICIPANTS
                      </span>

                      <strong>
                        {participantCount}
                      </strong>
                    </div>

                    <div>
                      <span>
                        COMBINED AMOUNT
                      </span>

                      <strong className="payment-total">
                        ₹{totalFee}
                      </strong>
                    </div>

                  </div>

                  {totalFee > 0 && (
                    <>

                      {/* =================================================
                          QR + GPAY
                      ================================================= */}

                      <div className="payment-layout">

                        <div className="qr-card">

                          <span className="payment-label">
                            SCAN TO PAY
                          </span>

                          <div className="qr-wrapper">

                            <img
                              src={
                                paymentData?.qrImage
                              }
                              alt="Google Pay QR code"
                            />

                          </div>

                          <strong>
                            Google Pay
                          </strong>

                        </div>

                        <div className="gpay-card">

                          <span className="payment-label">
                            PAY USING GPAY
                          </span>

                          <h3>
                            GPay Number
                          </h3>

                          <div className="gpay-number">
                            {
                              paymentData?.gpayNumber
                            }
                          </div>

                          <p>
                            You can also send the complete
                            combined amount directly to this
                            GPay number.
                          </p>

                          <div className="payment-important">

                            <strong>
                              IMPORTANT
                            </strong>

                            <p>
                              Pay exactly ₹{totalFee}
                              {" "}for all selected events
                              and keep the successful payment
                              screenshot.
                            </p>

                          </div>

                        </div>

                      </div>

                      {/* =================================================
                          PAYMENT INSTRUCTIONS
                      ================================================= */}

                      <div className="payment-instructions">

                        <span>
                          PAYMENT INSTRUCTIONS
                        </span>

                        <ol>

                          {Array.isArray(
                            paymentData?.instructions
                          ) &&
                            paymentData.instructions.map(
                              (
                                instruction,
                                index
                              ) => (
                                <li
                                  key={index}
                                >
                                  {instruction}
                                </li>
                              )
                            )}

                        </ol>

                      </div>

                      {/* =================================================
                          TRANSACTION REFERENCE
                      ================================================= */}

                      <Field
                        label="Transaction Reference / UTR"
                      >

                        <input
                          type="text"
                          value={
                            form.referenceId
                          }
                          onChange={(e) =>
                            onUpdate(
                              "referenceId",
                              e.target.value
                            )
                          }
                          placeholder="Enter UTR / transaction reference"
                        />

                      </Field>

                      {/* =================================================
                          SCREENSHOT CHECKBOX
                      ================================================= */}

                      <label
                        className={`payment-checkbox ${
                          errors.paymentScreenshotShared
                            ? "payment-checkbox-error-state"
                            : ""
                        }`}
                        htmlFor="payment-screenshot-confirmation"
                      >

                        <input
                          id="payment-screenshot-confirmation"
                          type="checkbox"
                          checked={Boolean(
                            form.paymentScreenshotShared
                          )}
                          onChange={(e) =>
                            onUpdate(
                              "paymentScreenshotShared",
                              e.target.checked
                            )
                          }
                        />

                        <span
                          className="checkbox-box"
                          aria-hidden="true"
                        >
                          {form.paymentScreenshotShared
                            ? "✓"
                            : ""}
                        </span>

                        <span className="checkbox-text">
                          I confirm that I have sent my
                          successful payment screenshot to
                          the respective event coordinator.
                        </span>

                      </label>

                      {errors.paymentScreenshotShared && (
                        <p className="field-error payment-checkbox-error">
                          {
                            errors.paymentScreenshotShared
                          }
                        </p>
                      )}

                      {/* =================================================
                          COORDINATOR NOTE
                      ================================================= */}

                      <div className="coordinator-note">

                        <strong>
                          PAYMENT SCREENSHOT
                        </strong>

                        <p>
                          Send the successful payment
                          screenshot to the coordinator of
                          your respective event on WhatsApp.
                        </p>

                        <p>
                          After successful payment
                          verification, you will be added to
                          the respective event WhatsApp group.
                        </p>

                      </div>

                      <div className="final-warning">

                        <strong>
                          Payment verification is mandatory.
                        </strong>

                        <p>
                          {
                            paymentData?.verificationNote
                          }{" "}
                          Simply submitting the registration
                          form does not mean that your
                          registration is confirmed.
                        </p>

                      </div>

                    </>
                  )}

                  {totalFee === 0 && (
                    <div className="free-event-box">

                      <strong>
                        This registration is free.
                      </strong>

                      <p>
                        No payment is required. You can
                        submit your registration directly.
                      </p>

                    </div>
                  )}

                  {submitError && (
                    <div className="submit-error">
                      {submitError}
                    </div>
                  )}

                  <div className="step-actions">

                    <button
                      type="button"
                      className="register-secondary-btn"
                      onClick={onBack}
                      disabled={submitting}
                    >
                      ← Back
                    </button>

                    <button
                      type="submit"
                      className="register-primary-btn register-submit"
                      disabled={submitting}
                    >

                      {submitting
                        ? "Submitting..."
                        : "Register for the Event"}

                      {!submitting && (
                        <span>
                          ✓
                        </span>
                      )}

                    </button>

                  </div>

                </section>
              )}

            </form>
          </div>
        </section>
      </main>

      <RegisterStyles />
    </>
  );
}

/* =========================================================
   STEP
========================================================= */

function Step({
  number,
  title,
  active,
  completed,
}) {
  return (
    <div
      className={`register-step ${
        active ? "active" : ""
      } ${
        completed ? "completed" : ""
      }`}
    >

      <div className="step-circle">
        {completed
          ? "✓"
          : number}
      </div>

      <span>
        {title}
      </span>

    </div>
  );
}

/* =========================================================
   FIELD
========================================================= */

function Field({
  label,
  required = false,
  error,
  children,
}) {
  return (
    <label className="register-field">

      <span className="field-label">

        {label}

        {required && (
          <b aria-hidden="true">
            *
          </b>
        )}

      </span>

      {children}

      {error && (
        <span className="field-error">
          {error}
        </span>
      )}

    </label>
  );
}

/* =========================================================
   STYLES
========================================================= */

function RegisterStyles() {
  return (
    <style>{`

      .register-page {
        min-height: 100vh;
        width: 100%;
        background:
          radial-gradient(
            circle at 20% 10%,
            rgba(220, 0, 0, 0.08),
            transparent 32%
          ),
          radial-gradient(
            circle at 85% 35%,
            rgba(220, 0, 0, 0.05),
            transparent 30%
          ),
          #050505;
        color: #fff;
        overflow-x: hidden;
      }

      .register-main {
        width: 100%;
        padding: 4rem 1rem 5rem;
        box-sizing: border-box;
      }

      .register-shell {
        width: 100%;
        max-width: 1050px;
        margin: 0 auto;
      }

      .register-heading {
        text-align: center;
        margin-bottom: 2.5rem;
      }

      .register-eyebrow {
        margin: 0 0 .7rem;
        color: #dc0000;
        font-family: 'Orbitron', sans-serif;
        font-size: .7rem;
        font-weight: 700;
        letter-spacing: .18em;
        text-transform: uppercase;
      }

      .register-heading h1 {
        margin: 0;
        font-family: 'Anton', sans-serif;
        font-size: clamp(2rem, 6vw, 3.8rem);
        font-weight: 400;
        letter-spacing: .04em;
        text-transform: uppercase;
        line-height: 1;
      }

      .register-heading > p:last-child {
        margin: .9rem 0 0;
        color: rgba(255,255,255,.62);
        font-size: .95rem;
      }

      .register-steps {
        width: 100%;
        display: flex;
        align-items: flex-start;
        justify-content: center;
        margin: 0 auto 2.2rem;
        max-width: 800px;
      }

      .register-step {
        flex: 0 0 auto;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: .55rem;
        min-width: 105px;
      }

      .step-circle {
        width: 46px;
        height: 46px;
        border: 1px solid rgba(255,255,255,.22);
        border-radius: 50%;
        display: grid;
        place-items: center;
        color: rgba(255,255,255,.45);
        background: #090909;
        font-family: 'Orbitron', sans-serif;
        font-size: .7rem;
        font-weight: 700;
      }

      .register-step span:last-child {
        color: rgba(255,255,255,.42);
        font-family: 'Orbitron', sans-serif;
        font-size: .58rem;
        letter-spacing: .08em;
        text-transform: uppercase;
        text-align: center;
      }

      .register-step.active .step-circle {
        border-color: #dc0000;
        background: #dc0000;
        color: #fff;
        box-shadow:
          0 0 0 5px rgba(220,0,0,.08),
          0 0 25px rgba(220,0,0,.25);
      }

      .register-step.active span:last-child {
        color: #fff;
      }

      .register-step.completed .step-circle {
        border-color: #dc0000;
        color: #fff;
      }

      .register-step.completed span:last-child {
        color: rgba(255,255,255,.8);
      }

      .step-line {
        flex: 1;
        height: 1px;
        max-width: 150px;
        margin: 23px 0 0;
        background: rgba(255,255,255,.12);
      }

      .step-line.completed {
        background: #dc0000;
      }

      .register-card {
        width: 100%;
        box-sizing: border-box;
        border: 1px solid rgba(220,0,0,.3);
        border-radius: 18px;
        padding: clamp(1.2rem,4vw,2.5rem);
        background:
          linear-gradient(
            145deg,
            rgba(255,255,255,.045),
            rgba(255,255,255,.015)
          );
        box-shadow:
          0 25px 70px rgba(0,0,0,.4),
          inset 0 1px 0 rgba(255,255,255,.05);
      }

      .card-heading {
        display: flex;
        align-items: center;
        gap: 1rem;
        margin-bottom: .7rem;
      }

      .card-number {
        width: 42px;
        height: 42px;
        flex: 0 0 auto;
        display: grid;
        place-items: center;
        border: 1px solid rgba(220,0,0,.5);
        color: #dc0000;
        border-radius: 50%;
        font-family: 'Orbitron', sans-serif;
        font-size: .65rem;
        font-weight: 700;
      }

      .card-heading p {
        margin: 0 0 .15rem;
        color: #dc0000;
        font-family: 'Orbitron', sans-serif;
        font-size: .55rem;
        letter-spacing: .15em;
      }

      .card-heading h2 {
        margin: 0;
        font-family: 'Anton', sans-serif;
        font-size: clamp(1.4rem,4vw,2rem);
        font-weight: 400;
        letter-spacing: .04em;
        text-transform: uppercase;
      }

      .card-description {
        margin: 0 0 1.7rem;
        max-width: 760px;
        color: rgba(255,255,255,.6);
        font-size: .9rem;
        line-height: 1.7;
      }

      .field-grid {
        display: grid;
        grid-template-columns: repeat(2,minmax(0,1fr));
        gap: 1rem;
      }

      .register-field {
        min-width: 0;
        display: grid;
        gap: .45rem;
        margin-bottom: 1rem;
      }

      .field-label {
        color: rgba(255,255,255,.82);
        font-family: 'Orbitron', sans-serif;
        font-size: .62rem;
        font-weight: 700;
        letter-spacing: .08em;
        text-transform: uppercase;
      }

      .field-label b {
        color: #dc0000;
        margin-left: .25rem;
      }

      .register-field input,
      .register-field select {
        width: 100%;
        min-width: 0;
        min-height: 46px;
        box-sizing: border-box;
        border: 1px solid rgba(255,255,255,.13);
        border-radius: 8px;
        outline: none;
        padding: .85rem .9rem;
        background: rgba(0,0,0,.38);
        color: #fff;
        font-family: inherit;
        font-size: .88rem;
      }

      .register-field input:focus,
      .register-field select:focus {
        border-color: rgba(220,0,0,.75);
        box-shadow: 0 0 0 3px rgba(220,0,0,.08);
      }

      .register-field input::placeholder {
        color: rgba(255,255,255,.3);
      }

      .register-field select option {
        background: #090909;
        color: #fff;
      }

      .field-error {
        color: #ff5b5b;
        font-size: .7rem;
        line-height: 1.4;
      }

      .event-selection-heading,
      .selected-events-heading,
      .members-heading {
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
        gap: 1rem;
      }

      .event-selection-heading {
        margin-bottom: .8rem;
      }

      .event-selection-heading span,
      .selected-events-heading span,
      .configuration-heading span,
      .members-heading span {
        color: #dc0000;
        font-family: 'Orbitron', sans-serif;
        font-size: .55rem;
        letter-spacing: .12em;
      }

      .event-selection-heading h3,
      .selected-events-heading h3,
      .configuration-heading h3,
      .members-heading h3 {
        margin: .25rem 0 0;
        font-family: 'Anton', sans-serif;
        font-size: 1.4rem;
        font-weight: 400;
      }

      .event-selection-heading strong,
      .selected-events-heading > strong,
      .members-heading > strong {
        color: rgba(255,255,255,.6);
        font-size: .75rem;
      }

      .event-selection-error {
        margin: 0 0 .8rem;
      }

      .events-grid {
        display: grid;
        grid-template-columns: repeat(2,minmax(0,1fr));
        gap: .75rem;
      }

      .event-option {
        position: relative;
        width: 100%;
        min-height: 70px;
        display: flex;
        align-items: center;
        gap: .8rem;
        padding: .85rem;
        box-sizing: border-box;
        border: 1px solid rgba(255,255,255,.1);
        border-radius: 10px;
        background: rgba(0,0,0,.22);
        color: #fff;
        text-align: left;
        cursor: pointer;
        transition:
          border-color .18s ease,
          background .18s ease,
          transform .18s ease;
      }

      .event-option:hover {
        border-color: rgba(220,0,0,.5);
        transform: translateY(-1px);
      }

      .event-option.selected {
        border-color: rgba(220,0,0,.75);
        background: rgba(220,0,0,.07);
      }

      .event-check {
        width: 24px;
        height: 24px;
        flex: 0 0 auto;
        display: grid;
        place-items: center;
        border: 1px solid rgba(255,255,255,.25);
        border-radius: 6px;
        background: #080808;
        color: #fff;
        font-weight: 800;
      }

      .event-option.selected .event-check {
        border-color: #dc0000;
        background: #dc0000;
      }

      .event-option-content {
        min-width: 0;
        display: grid;
        gap: .25rem;
      }

      .event-option-content strong {
        font-family: 'Orbitron', sans-serif;
        font-size: .68rem;
        letter-spacing: .03em;
        line-height: 1.4;
      }

      .event-option-content small {
        color: rgba(255,255,255,.45);
        font-size: .68rem;
      }

      .selected-events-card {
        margin-top: 1rem;
        padding: 1rem;
        border: 1px solid rgba(220,0,0,.25);
        border-radius: 12px;
        background: rgba(220,0,0,.035);
      }

      .selected-events-list {
        display: grid;
        gap: .55rem;
        margin-top: .9rem;
      }

      .selected-event-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: .8rem;
        padding: .7rem .8rem;
        border: 1px solid rgba(255,255,255,.08);
        border-radius: 8px;
        background: rgba(0,0,0,.2);
      }

      .selected-event-row > div {
        min-width: 0;
        display: grid;
        gap: .2rem;
      }

      .selected-event-row strong {
        color: #fff;
        font-size: .78rem;
      }

      .selected-event-row span {
        color: rgba(255,255,255,.4);
        font-size: .65rem;
      }

      .selected-event-row button {
        width: 28px;
        height: 28px;
        flex: 0 0 auto;
        border: 1px solid rgba(255,255,255,.14);
        border-radius: 6px;
        background: transparent;
        color: rgba(255,255,255,.6);
        cursor: pointer;
        font-size: 1.1rem;
        line-height: 1;
      }

      .selected-event-row button:hover {
        border-color: #dc0000;
        color: #fff;
        background: #dc0000;
      }

      .participant-configuration {
        margin-top: 1.5rem;
        padding-top: 1.5rem;
        border-top: 1px solid rgba(255,255,255,.08);
      }

      .configuration-note {
        margin: .5rem 0 1rem;
        color: rgba(255,255,255,.5);
        font-size: .78rem;
        line-height: 1.6;
      }

      .team-size-section {
        display: grid;
        grid-template-columns: minmax(0,1fr) minmax(0,1fr);
        gap: 1rem;
        align-items: start;
      }

      .team-info {
        margin-top: 1.55rem;
        padding: .85rem;
        border-left: 2px solid #dc0000;
        background: rgba(255,255,255,.025);
      }

      .team-info strong {
        display: block;
        color: #fff;
        font-family: 'Orbitron', sans-serif;
        font-size: .65rem;
        letter-spacing: .05em;
      }

      .team-info span {
        display: block;
        margin-top: .35rem;
        color: rgba(255,255,255,.52);
        font-size: .75rem;
        line-height: 1.5;
      }

      .solo-info {
        margin: 1rem 0;
        padding: 1rem;
        border: 1px solid rgba(255,255,255,.09);
        border-radius: 10px;
        background: rgba(255,255,255,.025);
      }

      .solo-info strong {
        color: #fff;
        font-family: 'Orbitron', sans-serif;
        font-size: .65rem;
        letter-spacing: .08em;
        text-transform: uppercase;
      }

      .solo-info p {
        margin: .4rem 0 0;
        color: rgba(255,255,255,.55);
        font-size: .78rem;
      }

      .members-section {
        margin-top: .5rem;
        padding-top: 1.5rem;
        border-top: 1px solid rgba(255,255,255,.08);
      }

      .members-note {
        margin: .5rem 0 1rem;
        color: rgba(255,255,255,.5);
        font-size: .78rem;
      }

      .members-list {
        display: grid;
        gap: .8rem;
      }

      .member-card {
        padding: 1rem;
        border: 1px solid rgba(255,255,255,.09);
        border-radius: 10px;
        background: rgba(0,0,0,.22);
      }

      .member-number {
        margin-bottom: .8rem;
        color: rgba(255,255,255,.5);
        font-family: 'Orbitron', sans-serif;
        font-size: .55rem;
        letter-spacing: .12em;
      }

      .fee-summary {
        display: grid;
        grid-template-columns: 1fr 1fr 1.2fr;
        gap: 1px;
        margin-top: 1rem;
        overflow: hidden;
        border: 1px solid rgba(255,255,255,.08);
        border-radius: 10px;
        background: rgba(255,255,255,.08);
      }

      .fee-summary > div {
        padding: 1rem;
        background: rgba(0,0,0,.25);
      }

      .fee-summary span {
        display: block;
        margin-bottom: .35rem;
        color: rgba(255,255,255,.45);
        font-family: 'Orbitron', sans-serif;
        font-size: .52rem;
        letter-spacing: .1em;
      }

      .fee-summary strong {
        color: #fff;
        font-size: .85rem;
      }

      .fee-summary .total-fee {
        text-align: right;
      }

      .fee-summary .total-fee strong {
        color: #dc0000;
        font-family: 'Anton', sans-serif;
        font-size: 1.6rem;
        font-weight: 400;
      }

      .payment-summary {
        display: grid;
        grid-template-columns: 1.5fr .7fr .8fr;
        gap: 1px;
        margin-bottom: 1.4rem;
        overflow: hidden;
        border: 1px solid rgba(255,255,255,.09);
        border-radius: 10px;
        background: rgba(255,255,255,.08);
      }

      .payment-summary > div {
        padding: 1rem;
        background: rgba(0,0,0,.25);
      }

      .payment-summary span {
        display: block;
        margin-bottom: .35rem;
        color: rgba(255,255,255,.45);
        font-family: 'Orbitron', sans-serif;
        font-size: .52rem;
        letter-spacing: .1em;
      }

      .payment-summary strong {
        color: #fff;
        font-size: .8rem;
      }

      .payment-total {
        color: #dc0000 !important;
        font-family: 'Anton', sans-serif;
        font-size: 1.45rem !important;
        font-weight: 400;
      }

      .payment-event-list {
        display: grid;
        gap: .25rem;
      }

      .payment-event-list strong {
        font-size: .72rem;
      }

      .payment-layout {
        display: grid;
        grid-template-columns: .85fr 1.15fr;
        gap: 1rem;
        margin-bottom: 1rem;
      }

      .qr-card,
      .gpay-card {
        min-width: 0;
        padding: 1.2rem;
        border: 1px solid rgba(255,255,255,.09);
        border-radius: 12px;
        background: rgba(0,0,0,.2);
      }

      .payment-label {
        display: block;
        margin-bottom: 1rem;
        color: #dc0000;
        font-family: 'Orbitron', sans-serif;
        font-size: .58rem;
        letter-spacing: .13em;
      }

      .qr-card {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
      }

      .qr-wrapper {
        width: min(250px,100%);
        aspect-ratio: 1;
        display: grid;
        place-items: center;
        padding: .65rem;
        box-sizing: border-box;
        border-radius: 10px;
        background: #fff;
        margin-bottom: .9rem;
      }

      .qr-wrapper img {
        width: 100%;
        height: 100%;
        object-fit: contain;
        border-radius: 5px;
        display: block;
      }

      .qr-card > strong {
        font-family: 'Orbitron', sans-serif;
        font-size: .7rem;
        letter-spacing: .08em;
      }

      .gpay-card h3 {
        margin: 0 0 .6rem;
        font-family: 'Anton', sans-serif;
        font-size: 1.5rem;
        font-weight: 400;
      }

      .gpay-number {
        width: 100%;
        box-sizing: border-box;
        padding: .9rem;
        border: 1px solid rgba(220,0,0,.35);
        border-radius: 8px;
        background: rgba(220,0,0,.05);
        color: #fff;
        font-family: 'Orbitron', sans-serif;
        font-size: clamp(.8rem,2vw,1rem);
        font-weight: 700;
        overflow-wrap: anywhere;
      }

      .gpay-card > p {
        margin: .8rem 0;
        color: rgba(255,255,255,.55);
        font-size: .8rem;
        line-height: 1.6;
      }

      .payment-important {
        padding: .8rem;
        border-left: 2px solid #dc0000;
        background: rgba(220,0,0,.05);
      }

      .payment-important strong {
        color: #dc0000;
        font-family: 'Orbitron', sans-serif;
        font-size: .58rem;
      }

      .payment-important p {
        margin: .35rem 0 0;
        color: rgba(255,255,255,.65);
        font-size: .75rem;
      }

      .payment-instructions {
        margin: 1rem 0;
        padding: 1rem;
        border: 1px solid rgba(220,0,0,.25);
        border-radius: 10px;
        background: rgba(220,0,0,.035);
      }

      .payment-instructions > span {
        color: #dc0000;
        font-family: 'Orbitron', sans-serif;
        font-size: .58rem;
        letter-spacing: .12em;
      }

      .payment-instructions ol {
        margin: .8rem 0 0;
        padding-left: 1.2rem;
        color: rgba(255,255,255,.68);
        font-size: .8rem;
        line-height: 1.8;
      }

      .payment-checkbox {
        position: relative;
        z-index: 2;
        display: flex;
        align-items: flex-start;
        gap: .8rem;
        margin-top: .5rem;
        padding: 1rem;
        border: 1px solid rgba(255,255,255,.12);
        border-radius: 10px;
        cursor: pointer;
        background: rgba(255,255,255,.02);
        user-select: none;
      }

      .payment-checkbox-error-state {
        border-color: rgba(255,91,91,.65);
      }

      .payment-checkbox input {
        position: absolute;
        width: 1px;
        height: 1px;
        opacity: 0;
      }

      .checkbox-box {
        width: 22px;
        height: 22px;
        flex: 0 0 auto;
        display: grid;
        place-items: center;
        border: 1px solid rgba(255,255,255,.3);
        border-radius: 5px;
        color: #fff;
        background: #090909;
        font-weight: 800;
      }

      .payment-checkbox input:checked + .checkbox-box {
        border-color: #dc0000;
        background: #dc0000;
      }

      .checkbox-text {
        color: rgba(255,255,255,.75);
        font-size: .8rem;
        line-height: 1.55;
      }

      .payment-checkbox-error {
        margin-top: .45rem;
      }

      .coordinator-note {
        margin-top: 1rem;
        padding: 1rem;
        border: 1px solid rgba(220,0,0,.25);
        border-left: 3px solid #dc0000;
        border-radius: 10px;
        background: rgba(220,0,0,.035);
      }

      .coordinator-note strong {
        color: #dc0000;
        font-family: 'Orbitron', sans-serif;
        font-size: .58rem;
        letter-spacing: .1em;
      }

      .coordinator-note p {
        margin: .4rem 0 0;
        color: rgba(255,255,255,.62);
        font-size: .76rem;
        line-height: 1.6;
      }

      .coordinator-note p + p {
        margin-top: .55rem;
      }

      .final-warning {
        margin-top: 1rem;
        padding: 1rem;
        border: 1px solid rgba(255,185,0,.2);
        border-radius: 10px;
        background: rgba(255,185,0,.035);
      }

      .final-warning strong {
        color: #fff;
        font-size: .8rem;
      }

      .final-warning p {
        margin: .35rem 0 0;
        color: rgba(255,255,255,.58);
        font-size: .75rem;
        line-height: 1.6;
      }

      .free-event-box {
        padding: 1rem;
        border: 1px solid rgba(255,255,255,.1);
        border-radius: 10px;
        background: rgba(255,255,255,.025);
      }

      .free-event-box p {
        margin: .35rem 0 0;
        color: rgba(255,255,255,.55);
        font-size: .8rem;
      }

      .register-loading,
      .register-error-box,
      .submit-error {
        padding: 1rem;
        border-radius: 10px;
      }

      .register-loading {
        border: 1px solid rgba(255,255,255,.08);
        color: rgba(255,255,255,.55);
        text-align: center;
      }

      .register-error-box,
      .submit-error {
        margin-bottom: 1rem;
        border: 1px solid rgba(220,0,0,.35);
        background: rgba(220,0,0,.06);
      }

      .register-error-box strong,
      .submit-error {
        color: #ff5b5b;
      }

      .register-error-box p {
        margin: .35rem 0;
        color: rgba(255,255,255,.6);
        font-size: .8rem;
      }

      .register-error-box button {
        border: 0;
        padding: .5rem .8rem;
        border-radius: 6px;
        background: #dc0000;
        color: #fff;
        cursor: pointer;
      }

      .step-actions {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 1rem;
        margin-top: 1.5rem;
        padding-top: 1.3rem;
        border-top: 1px solid rgba(255,255,255,.08);
      }

      .register-primary-btn,
      .register-secondary-btn {
        min-height: 46px;
        padding: .75rem 1.25rem;
        border-radius: 8px;
        font-family: 'Orbitron', sans-serif;
        font-size: .65rem;
        font-weight: 700;
        letter-spacing: .08em;
        text-transform: uppercase;
        cursor: pointer;
      }

      .register-primary-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: .65rem;
        border: 1px solid #dc0000;
        background: #dc0000;
        color: #fff;
      }

      .register-primary-btn:hover:not(:disabled) {
        background: #f00000;
      }

      .register-primary-btn:disabled {
        opacity: .5;
        cursor: not-allowed;
      }

      .register-secondary-btn {
        border: 1px solid rgba(255,255,255,.2);
        background: transparent;
        color: rgba(255,255,255,.75);
      }

      .register-submit {
        min-width: 230px;
      }

      .register-success-section {
        min-height: 100vh;
        display: grid;
        place-items: center;
        box-sizing: border-box;
        padding: 2rem 1rem;
      }

      .register-success-card {
        width: 100%;
        max-width: 620px;
        box-sizing: border-box;
        padding: clamp(1.4rem,5vw,2.5rem);
        border: 1px solid rgba(220,0,0,.35);
        border-radius: 18px;
        background: rgba(255,255,255,.025);
        text-align: center;
      }

      .success-icon {
        width: 58px;
        height: 58px;
        margin: 0 auto 1rem;
        display: grid;
        place-items: center;
        border-radius: 50%;
        background: #dc0000;
        color: #fff;
        font-size: 1.5rem;
        font-weight: 800;
      }

      .register-success-card h1 {
        margin: 0;
        font-family: 'Anton', sans-serif;
        font-size: clamp(2rem,7vw,3rem);
        font-weight: 400;
        text-transform: uppercase;
      }

      .success-intro {
        margin: .7rem 0 1.5rem;
        color: rgba(255,255,255,.6);
        font-size: .85rem;
      }

      .success-details {
        display: grid;
        border: 1px solid rgba(255,255,255,.08);
        border-radius: 10px;
        overflow: hidden;
        text-align: left;
      }

      .success-details > div {
        display: flex;
        justify-content: space-between;
        gap: 1rem;
        padding: .85rem 1rem;
        border-bottom: 1px solid rgba(255,255,255,.07);
      }

      .success-details > div:last-child {
        border-bottom: 0;
      }

      .success-details span {
        color: rgba(255,255,255,.45);
        font-size: .72rem;
      }

      .success-details strong {
        max-width: 70%;
        color: #fff;
        font-size: .78rem;
        text-align: right;
      }

      .success-warning {
        margin-top: 1rem;
        padding: 1rem;
        border: 1px solid rgba(255,185,0,.22);
        border-radius: 10px;
        background: rgba(255,185,0,.04);
        text-align: left;
      }

      .success-warning p {
        margin: .4rem 0 0;
        color: rgba(255,255,255,.58);
        font-size: .75rem;
        line-height: 1.6;
      }

      .success-group-note {
        margin-top: 1rem;
        padding: 1rem;
        border: 1px solid rgba(220,0,0,.25);
        border-radius: 10px;
        background: rgba(220,0,0,.035);
        text-align: left;
      }

      .success-group-note strong {
        color: #dc0000;
        font-family: 'Orbitron', sans-serif;
        font-size: .58rem;
        letter-spacing: .1em;
      }

      .success-group-note p {
        margin: .4rem 0 0;
        color: rgba(255,255,255,.62);
        font-size: .75rem;
        line-height: 1.6;
      }

      .success-note {
        margin: 1rem 0 0;
        color: rgba(255,255,255,.4);
        font-size: .7rem;
      }

      @media (max-width: 768px) {

        .register-main {
          padding-top: 2.5rem;
        }

        .field-grid,
        .payment-layout,
        .team-size-section {
          grid-template-columns: 1fr;
        }

        .team-info {
          margin-top: 0;
        }

        .payment-summary,
        .fee-summary {
          grid-template-columns: 1fr;
        }

        .fee-summary .total-fee {
          text-align: left;
        }

        .events-grid {
          grid-template-columns: 1fr;
        }

      }

      @media (max-width: 560px) {

        .register-main {
          padding: 2rem .75rem 3rem;
        }

        .register-step {
          min-width: 72px;
        }

        .step-circle {
          width: 38px;
          height: 38px;
        }

        .register-step span:last-child {
          font-size: .48rem;
        }

        .step-line {
          margin-top: 19px;
        }

        .register-card {
          border-radius: 12px;
          padding: 1rem;
        }

        .register-field input,
        .register-field select {
          font-size: 16px;
        }

        .members-heading,
        .event-selection-heading,
        .selected-events-heading {
          align-items: flex-start;
          flex-direction: column;
        }

        .step-actions {
          align-items: stretch;
          flex-direction: column-reverse;
        }

        .register-primary-btn,
        .register-secondary-btn {
          width: 100%;
        }

        .register-submit {
          min-width: 0;
        }

        .success-details > div {
          align-items: flex-start;
          flex-direction: column;
          gap: .25rem;
        }

        .success-details strong {
          max-width: 100%;
          text-align: left;
        }

      }

      @media (max-width: 360px) {

        .register-main {
          padding-inline: .55rem;
        }

        .register-card {
          padding: .85rem;
        }

        .register-step {
          min-width: 60px;
        }

        .register-step span:last-child {
          font-size: .43rem;
        }

        .step-line {
          max-width: 45px;
        }

      }

    `}</style>
  );
}