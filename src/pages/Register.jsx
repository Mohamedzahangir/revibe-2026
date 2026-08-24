import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";
import { submitRegistration } from "../services/registrationService";
import { validateRegistrationForm } from "../services/validation";

/* ─────────────────────────────────────────────────────────────
   TODO #2 — REAL UPI PAYEE DETAILS
   Replace before going live.
───────────────────────────────────────────────────────────── */
const UPI_VPA = "PLACEHOLDER_UPI_ID@upi";
const UPI_PAYEE_NAME = "REVIBE 26 - SGC CAHCET";

function buildUpiLink({ amount, note, refId }) {
  const params = new URLSearchParams({
    pa: UPI_VPA,
    pn: UPI_PAYEE_NAME,
    tn: note,
    am: String(amount),
    cu: "INR",
    tr: refId,
  });
  return `upi://pay?${params.toString()}`;
}

const emptyMember = () => ({ name: "", email: "" });

export default function Register() {
  const [events, setEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [eventsError, setEventsError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function loadEvents() {
      setEventsLoading(true);
      setEventsError(null);

      const { data, error } = await supabase
        .from("events")
        .select("id, name, slug, category, fee, max_participants, registration_status")
        .eq("registration_status", "open")
        .order("name");

      if (cancelled) return;

      if (error) {
        setEventsError("Couldn't load events. Please refresh the page.");
      } else {
        setEvents(data ?? []);
      }
      setEventsLoading(false);
    }

    loadEvents();
    return () => {
      cancelled = true;
    };
  }, []);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    college: "",
    department: "",
    year: "",
    eventSlug: "",
    teamSize: 1,
    members: [],
    referenceId: "",
  });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [registrationNumber, setRegistrationNumber] = useState(null);
  const [upiAppClicked, setUpiAppClicked] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const selectedEvent = events.find((e) => e.slug === form.eventSlug) || null;
  const feeKnown = selectedEvent && typeof selectedEvent.fee === "number";
  const paymentRequired = feeKnown && selectedEvent.fee > 0;

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function validateAll() {
    const nextErrors = validateRegistrationForm({
      form,
      selectedEvent,
    });

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  }

  function handleTeamSizeChange(rawValue) {
    const size = Math.max(1, Math.min(10, Number(rawValue) || 1));
    setForm((prev) => {
      const members = [...prev.members];
      while (members.length < size - 1) members.push(emptyMember());
      members.length = size - 1;
      return { ...prev, teamSize: size, members };
    });
  }

  function updateMember(index, field, value) {
    setForm((prev) => {
      const members = [...prev.members];
      members[index] = { ...members[index], [field]: value };
      return { ...prev, members };
    });
  }

  function handleUpiClick(appLabel) {
    if (!feeKnown) return;
    setUpiAppClicked(appLabel);
    const refId = `${form.name.replace(/\s+/g, "")}-${Date.now()}`;
    const link = buildUpiLink({
      amount: selectedEvent.fee,
      note: `REVIBE26-${selectedEvent.slug}`,
      refId,
    });
    window.location.href = link;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validateAll()) {
      const firstErrorField = document.querySelector(".register-field-error");
      firstErrorField?.closest(".register-field")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      const isTeam = form.teamSize > 1;

      const { registrationNumber: realRegistrationNumber } = await submitRegistration({
        eventId: selectedEvent.id,
        maxParticipants: selectedEvent.max_participants,
        registrationType: isTeam ? "team" : "individual",
        teamName: null,
        primary: {
          fullName: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          college: form.college.trim(),
          department: form.department.trim(),
          year: form.year.trim(),
        },
        members: form.members.map((m) => ({
          fullName: m.name.trim(),
          email: m.email.trim(),
        })),
      });

      setRegistrationNumber(realRegistrationNumber);
      setSubmitted(true);
    } catch (err) {
      setSubmitError(err.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <main className="theme-page register-page">
        <section className="content-panel">
          <div className="page-shell register-shell register-success-shell">
            <div className="success-card">
              <p className="success-brand">REVIBE '26</p>
              <p className="success-status">Registration Successful</p>
              <div className="success-row">
                <span className="success-label">Name</span>
                <span className="success-value">{form.name}</span>
              </div>
              <div className="success-row">
                <span className="success-label">Event</span>
                <span className="success-value">{selectedEvent?.name}</span>
              </div>
              <div className="success-row">
                <span className="success-label">Registration No.</span>
                <span className="success-value">{registrationNumber}</span>
              </div>
              {paymentRequired && (
                <p className="success-pending">
                  Payment pending verification — you'll be confirmed once a
                  coordinator checks your transaction reference.
                </p>
              )}
            </div>
          </div>
        </section>
        <style>{successStyles}</style>
      </main>
    );
  }

  return (
    <>
      <main className="theme-page register-page">
        <section className="content-panel">
          <form className="page-shell register-shell" onSubmit={handleSubmit}>
            <div className="register-header">
              <p className="eyebrow accent">Participant registration</p>
              <h1 className="section-title">Register for REVIBE '26</h1>
            </div>

            <div className="register-panel">
              <h2>Participant Details</h2>
              <div className="register-field-grid">
                <Field label="Full Name" error={errors.name}>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => update("name", e.target.value)}
                    placeholder="Enter full name"
                  />
                </Field>
                <Field label="Email" error={errors.email}>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => update("email", e.target.value)}
                    placeholder="Enter email"
                  />
                </Field>
                <Field label="Mobile" error={errors.phone}>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => update("phone", e.target.value.replace(/\D/g, ""))}
                    placeholder="10-digit mobile number"
                    maxLength={10}
                  />
                </Field>
                <Field label="College" error={errors.college}>
                  <input
                    type="text"
                    value={form.college}
                    onChange={(e) => update("college", e.target.value)}
                    placeholder="Enter college name"
                  />
                </Field>
                <Field label="Department" error={errors.department}>
                  <input
                    type="text"
                    value={form.department}
                    onChange={(e) => update("department", e.target.value)}
                    placeholder="e.g. CSE, ECE"
                  />
                </Field>
                <Field label="Year of Study" error={errors.year}>
                  <select
                        value={form.year}
                        onChange={(e) => update("year", e.target.value)}
                    >
                        <option value="">Select year</option>
                        <option value="1st Year">1st Year</option>
                        <option value="2nd Year">2nd Year</option>
                        <option value="3rd Year">3rd Year</option>
                        <option value="4th Year">4th Year</option>
                    </select>
                </Field>
              </div>
            </div>

            <div className="register-panel">
              <h2>Event &amp; Team</h2>
              <div className="register-field-grid">
                <Field label="Event" error={errors.eventSlug}>
                  <select
                    value={form.eventSlug}
                    onChange={(e) => update("eventSlug", e.target.value)}
                    disabled={eventsLoading || !!eventsError}
                  >
                    <option value="">{eventsLoading ? "Loading events..." : "Select an event"}</option>
                    {events.map((ev) => (
                      <option key={ev.slug} value={ev.slug}>
                        {ev.name} ({ev.category})
                      </option>
                    ))}
                  </select>
                  {eventsError && <span className="register-field-error">{eventsError}</span>}
                </Field>
                <Field label="Number of Members" error={errors.teamSize}>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={form.teamSize}
                    onChange={(e) => handleTeamSizeChange(e.target.value)}
                  />
                </Field>
                <Field label="Registration Fee">
                  <input
                    type="text"
                    readOnly
                    value={feeKnown ? `₹${selectedEvent.fee}` : "Fee to be announced"}
                  />
                </Field>
              </div>

              {form.members.length > 0 && (
                <div className="register-team-list">
                  <p className="register-team-heading">Team members (besides you)</p>
                  {form.members.map((m, i) => (
                    <div className="register-team-row" key={i}>
                      <Field label={`Member ${i + 2} name`} error={errors[`member-${i}-name`]}>
                        <input
                          type="text"
                          value={m.name}
                          onChange={(e) => updateMember(i, "name", e.target.value)}
                          placeholder="Full name"
                        />
                      </Field>
                      <Field label={`Member ${i + 2} email`} error={errors[`member-${i}-email`]}>
                        <input
                          type="email"
                          value={m.email}
                          onChange={(e) => updateMember(i, "email", e.target.value)}
                          placeholder="Email"
                        />
                      </Field>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="register-panel">
              <h2>Payment</h2>

              {!selectedEvent && (
                <p className="register-note">
                  Select an event above to see payment options.
                </p>
              )}

              {selectedEvent && !feeKnown && (
                <p className="register-note">
                  This event's fee hasn't been announced yet — you can complete
                  registration now and pay once fees are published.
                </p>
              )}

              {feeKnown && selectedEvent.fee === 0 && (
                <p className="register-note">This event is free — no payment needed.</p>
              )}

              {paymentRequired && (
                <>
                  <p className="register-amount">
                    Amount to pay: <strong>₹{selectedEvent.fee}</strong>
                  </p>
                  <div className="register-upi-options">
                    {["GPay", "PhonePe", "Paytm", "Other UPI app"].map((appLabel) => (
                      <button
                        key={appLabel}
                        type="button"
                        className={"register-upi-btn" + (upiAppClicked === appLabel ? " is-clicked" : "")}
                        onClick={() => handleUpiClick(appLabel)}
                      >
                        Pay with {appLabel}
                      </button>
                    ))}
                  </div>
                  <p className="register-note">
                    This opens your UPI app with the amount pre-filled. After
                    paying, enter the transaction reference from your UPI app
                    below — a coordinator will verify it and confirm your
                    registration.
                  </p>
                  <div className="register-field-grid">
                    <Field label="UPI Transaction Reference" error={errors.referenceId}>
                      <input
                        type="text"
                        value={form.referenceId}
                        onChange={(e) => update("referenceId", e.target.value)}
                        placeholder="e.g. 123456789012"
                      />
                    </Field>
                  </div>
                </>
              )}
            </div>

            {submitError && <p className="register-note register-note-error">{submitError}</p>}

            <div className="register-actions">
              <button
                type="submit"
                className="primary-btn register-submit-btn"
                disabled={submitting || eventsLoading}
              >
                {submitting ? "Submitting..." : "Complete Registration"}
              </button>
            </div>
          </form>
        </section>
      </main>

      <style>{formStyles}</style>
    </>
  );
}

function Field({ label, error, children }) {
  return (
    <label className="register-field">
      <span>{label}</span>
      {children}
      {error && <span className="register-field-error">{error}</span>}
    </label>
  );
}

const formStyles = `
  .register-shell {
    max-width: 820px;
  }

  .register-panel {
    border-left: 2px solid rgba(220, 0, 0, 0.4);
    padding: 0.9rem 0 0.9rem 1.1rem;
    margin-bottom: 1.4rem;
  }

  .register-panel h2 {
    margin: 0 0 0.9rem;
    font-family: 'Orbitron', sans-serif;
    font-size: 0.74rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--red, #dc0000);
  }

  .register-field-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.75rem 1rem;
  }

  .register-field {
    display: grid;
    gap: 0.3rem;
    color: var(--soft-white, #eaeaea);
    font-family: 'Orbitron', sans-serif;
    font-size: 0.62rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }

  .register-field input,
  .register-field select {
    width: 100%;
    border: 1px solid rgba(220, 0, 0, 0.3);
    background: rgba(0, 0, 0, 0.25);
    color: var(--white, #fff);
    padding: 0.6rem 0.7rem;
    font-family: inherit;
    font-size: 0.85rem;
    letter-spacing: normal;
    text-transform: none;
  }

  .register-field input::placeholder {
    color: rgba(255,255,255,0.4);
  }

  .register-field-error {
    color: var(--red, #dc0000);
    text-transform: none;
    font-size: 0.68rem;
    letter-spacing: 0.02em;
  }

  .register-team-list {
    margin-top: 0.9rem;
    padding-top: 0.75rem;
    border-top: 1px dashed rgba(220,0,0,0.25);
  }

  .register-team-heading {
    font-family: 'Orbitron', sans-serif;
    font-size: 0.62rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: rgba(255,255,255,0.55);
    margin: 0 0 0.6rem;
  }

  .register-team-row {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.75rem;
    margin-bottom: 0.6rem;
  }

  .register-note {
    color: rgba(255,255,255,0.6);
    font-size: 0.8rem;
    line-height: 1.5;
    margin: 0.5rem 0;
  }

  .register-note-error {
    color: var(--red, #dc0000);
  }

  .register-amount {
    font-family: 'Orbitron', sans-serif;
    font-size: 0.9rem;
    margin: 0 0 0.85rem;
  }

  .register-upi-options {
    display: flex;
    flex-wrap: wrap;
    gap: 0.6rem;
    margin-bottom: 0.6rem;
  }

  .register-upi-btn {
    border: 1px solid rgba(220,0,0,0.4);
    background: rgba(220,0,0,0.08);
    color: var(--white, #fff);
    padding: 0.55rem 0.9rem;
    font-family: 'Orbitron', sans-serif;
    font-size: 0.62rem;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    cursor: pointer;
  }

  .register-upi-btn.is-clicked {
    border-color: var(--red, #dc0000);
    background: var(--red, #dc0000);
  }

  .register-actions {
    display: flex;
    justify-content: center;
    margin-top: 0.5rem;
  }

  .register-submit-btn {
    min-width: 240px;
  }

  @media (max-width: 640px) {
    .register-field-grid,
    .register-team-row {
      grid-template-columns: 1fr;
    }
  }
`;

const successStyles = `
  .register-success-shell {
    display: flex;
    justify-content: center;
    padding-top: 2.5rem;
  }

  .success-card {
    border: 1px solid var(--red, #dc0000);
    background: rgba(220,0,0,0.06);
    padding: 2rem;
    max-width: 420px;
    width: 100%;
    text-align: center;
  }

  .success-brand {
    font-family: 'Bangers', cursive;
    font-size: 2rem;
    letter-spacing: 0.06em;
    color: var(--red, #dc0000);
    margin: 0 0 0.5rem;
  }

  .success-status {
    font-family: 'Orbitron', sans-serif;
    font-size: 0.85rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    margin: 0 0 1.5rem;
  }

  .success-row {
    display: flex;
    justify-content: space-between;
    border-top: 1px solid rgba(255,255,255,0.1);
    padding: 0.6rem 0;
    font-size: 0.9rem;
  }

  .success-label {
    color: rgba(255,255,255,0.5);
  }

  .success-pending {
    margin-top: 1.25rem;
    font-size: 0.75rem;
    color: rgba(255,255,255,0.6);
    line-height: 1.5;
  }
`;