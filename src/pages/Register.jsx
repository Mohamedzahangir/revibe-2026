import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { supabase } from "../services/supabase";
import { submitRegistration } from "../services/registrationService";
import eventData from "../data/eventData";
import { coordinatorDetails } from "../data/coordinatorDetails";
import {
  validateName,
  validateEmail,
  validatePhone,
  validateCollege,
  validateDepartment,
  validateYear,
  validateEvent,
  validateTeamMembers,
} from "../services/validation";

import {
  paymentData,
  getRegistrationConfig,
  getTotalFee,
  getFeeLabel,
} from "../data/registrationData";

const DRAFT_KEY = "revibe26_registration_draft_v3";
const LEGACY_DRAFT_KEY = "revibe26_registration_draft_v2";

const emptyMember = () => ({
  name: "",
  email: "",
  phone: "",
  college: "",
  department: "",
  year: "",
});

const emptyEventRegistration = () => ({
  teamSize: "",
  members: [],
});

function getEventConfig(slug) {
  return getRegistrationConfig(slug);
}

function getEventFromData(slug) {
  return eventData.find((event) => event.slug === slug);
}
function getCoordinatorDetails(eventName) {
  return coordinatorDetails[eventName] || {
    name: "Event Coordinator",
    whatsapp: "",
  };
}

function mergeEventData(event) {
  const fallback = getEventFromData(event?.slug) || {};
  return { ...fallback, ...event };
}

function getCategory(event) {
  const category = String(event?.category ?? "").toLowerCase();

  if (
    category.includes("non") ||
    category.includes("cultural") ||
    category.includes("fun")
  ) {
    return "non_technical";
  }

  return "technical";
}

function getEventTime(event) {
  const item = mergeEventData(event);

  const start =
    item.start_time ??
    item.startTime ??
    item.start ??
    item.time_start ??
    null;

  const end =
    item.end_time ??
    item.endTime ??
    item.end ??
    item.time_end ??
    null;

  const directTime =
    item.time ??
    item.timing ??
    item.schedule_time ??
    null;

  if (start && end) return `${start} – ${end}`;
  if (start) return String(start);
  if (directTime) return String(directTime);

  return "Time TBA";
}

function getEventDate(event) {
  const item = mergeEventData(event);

  return (
    item.event_date ??
    item.eventDate ??
    item.date ??
    item.day ??
    "Date TBA"
  );
}

function getEventVenue(event) {
  const item = mergeEventData(event);

  return item.venue ?? item.location ?? item.room ?? "Venue TBA";
}

function getEventFee(event) {
  const item = mergeEventData(event);
  const config = getEventConfig(item.slug);

  return Number(item.fee ?? config?.fee ?? 0);
}

function getEventParticipantRange(event) {
  const config = getEventConfig(event?.slug);

  const min = Number(config?.minTeamSize) || 1;
  const max =
    Number(config?.maxTeamSize) ||
    Number(event?.max_participants) ||
    1;

  return {
    min: Math.max(1, min),
    max: Math.max(Math.max(1, min), max),
  };
}

function formatEventSchedule(event) {
  return `${getEventDate(event)} • ${getEventTime(event)}`;
}

function normalizeMembers(members) {
  if (!Array.isArray(members)) return [];

  return members.map((member) => ({
    ...emptyMember(),
    ...(member || {}),
  }));
}

function normalizeEventRegistrations(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  const result = {};

  Object.entries(value).forEach(([slug, details]) => {
    if (!details || typeof details !== "object") return;

    const rawSize = details.teamSize;
    const teamSize =
      rawSize === "" || rawSize == null
        ? ""
        : Number.isFinite(Number(rawSize))
          ? Number(rawSize)
          : "";

    result[slug] = {
      teamSize,
      members: normalizeMembers(details.members),
    };
  });

  return result;
}

export default function Register() {
  const [searchParams] = useSearchParams();

  const [step, setStep] = useState(1);

  const [events, setEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [eventsError, setEventsError] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    college: "",
    department: "",
    year: "",

    // Multiple events are supported. Each event has its own
    // participant count and its own additional-member list.
    eventSlugs: [],
    eventRegistrations: {},

    rememberDetails: false,

    paymentScreenshotShared: false,
    referenceId: "",
  });

  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [submitted, setSubmitted] = useState(false);
  const [registrationNumbers, setRegistrationNumbers] = useState([]);

  /* =========================================================
     LOAD SAVED DETAILS
  ========================================================= */

  useEffect(() => {
    try {
      const raw =
        localStorage.getItem(DRAFT_KEY) ||
        localStorage.getItem(LEGACY_DRAFT_KEY);
      if (!raw) return;

      const saved = JSON.parse(raw);
      if (!saved || typeof saved !== "object") return;

      setForm((previous) => ({
        ...previous,
        name: typeof saved.name === "string" ? saved.name : "",
        email: typeof saved.email === "string" ? saved.email : "",
        phone: typeof saved.phone === "string" ? saved.phone : "",
        college: typeof saved.college === "string" ? saved.college : "",
        department:
          typeof saved.department === "string" ? saved.department : "",
        year: typeof saved.year === "string" ? saved.year : "",
        eventRegistrations: normalizeEventRegistrations(
          saved.eventRegistrations
        ),
        rememberDetails: true,
      }));
    } catch (error) {
      console.warn("Unable to restore saved registration details:", error);
    }
  }, []);

  /* =========================================================
     SAVE DETAILS ON DEVICE

     Selected events are deliberately not saved as the active
     selection. Event-specific participant details are saved by
     event slug, so selecting that event again can restore them.
  ========================================================= */

  useEffect(() => {
    if (!form.rememberDetails) {
      localStorage.removeItem(DRAFT_KEY);
      return;
    }

    const draft = {
      name: form.name,
      email: form.email,
      phone: form.phone,
      college: form.college,
      department: form.department,
      year: form.year,
      eventRegistrations: form.eventRegistrations,
    };

    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    } catch (error) {
      console.warn("Unable to save registration details:", error);
    }
  }, [
    form.name,
    form.email,
    form.phone,
    form.college,
    form.department,
    form.year,
    form.eventRegistrations,
    form.rememberDetails,
  ]);

  /* =========================================================
     LOAD EVENTS
  ========================================================= */

  useEffect(() => {
    let cancelled = false;

    async function loadEvents() {
      setEventsLoading(true);
      setEventsError("");

      const { data, error } = await supabase
        .from("events")
        .select(
          `
            id,
            name,
            slug,
            category,
            description,
            fee,
            status,
            registration_status,
            venue,
            max_participants,
            event_date
          `
        )
        .order("name");

      if (cancelled) return;

      if (error) {
        console.error("Event loading error:", error);
        setEventsError(
          "Unable to load events right now. Please refresh the page."
        );
        setEvents([]);
      } else {
        const openEvents = (data ?? []).filter((event) => {
          const registrationStatus = String(
            event.registration_status ?? ""
          ).toLowerCase();
          const eventStatus = String(event.status ?? "").toLowerCase();

          return (
            registrationStatus === "open" && eventStatus !== "cancelled"
          );
        });

        setEvents(openEvents);
      }

      setEventsLoading(false);
    }

    loadEvents();

    return () => {
      cancelled = true;
    };
  }, []);

  /* =========================================================
     URL EVENT PREFILL
  ========================================================= */

  useEffect(() => {
    const eventSlug = searchParams.get("event");
    if (!eventSlug || events.length === 0) return;

    const exists = events.some((event) => event.slug === eventSlug);
    if (!exists) return;

    setForm((previous) => {
      const existingDetails =
        previous.eventRegistrations[eventSlug] || emptyEventRegistration();

      return {
        ...previous,
        eventSlugs: [eventSlug],
        eventRegistrations: {
          ...previous.eventRegistrations,
          [eventSlug]: existingDetails,
        },
        paymentScreenshotShared: false,
        referenceId: "",
      };
    });
  }, [searchParams, events]);

  /* =========================================================
     SELECTED EVENTS
  ========================================================= */

  const selectedEvents = useMemo(() => {
    return form.eventSlugs
      .map(
        (slug) =>
          events.find((event) => event.slug === slug) ||
          getEventFromData(slug)
      )
      .filter(Boolean)
      .map(mergeEventData);
  }, [events, form.eventSlugs]);

  /* =========================================================
     EVENT-SPECIFIC TOTAL
  ========================================================= */

  const totalFee = useMemo(() => {
    return selectedEvents.reduce((total, event) => {
      const details = form.eventRegistrations[event.slug];
      const participantCount = Number(details?.teamSize) || 0;

      if (participantCount < 1) return total;

      return (
        total + getTotalFee(event.slug, participantCount)
      );
    }, 0);
  }, [selectedEvents, form.eventRegistrations]);

  /* =========================================================
     GENERIC UPDATE
  ========================================================= */

  function update(field, value) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));

    setErrors((previous) => ({
      ...previous,
      [field]: "",
    }));

    setSubmitError("");
  }

  /* =========================================================
     EVENT TOGGLE
  ========================================================= */

  function handleEventChange(slug) {
    const exists = events.some((event) => event.slug === slug);
    if (!exists) return;

    setForm((previous) => {
      const alreadySelected = previous.eventSlugs.includes(slug);

      if (alreadySelected) {
        return {
          ...previous,
          eventSlugs: previous.eventSlugs.filter((item) => item !== slug),
          paymentScreenshotShared: false,
          referenceId: "",
        };
      }

      const restoredDetails =
        previous.eventRegistrations[slug] || emptyEventRegistration();

      return {
        ...previous,
        eventSlugs: [...previous.eventSlugs, slug],
        eventRegistrations: {
          ...previous.eventRegistrations,
          [slug]: restoredDetails,
        },
        paymentScreenshotShared: false,
        referenceId: "",
      };
    });

    setErrors({});
    setSubmitError("");
  }

  /* =========================================================
     EVENT PARTICIPANT COUNT
  ========================================================= */

  function handleEventParticipantCountChange(slug, value) {
    const event = selectedEvents.find((item) => item.slug === slug);
    if (!event) return;

    const range = getEventParticipantRange(event);
    const size = Number(value);

    if (
      !Number.isFinite(size) ||
      size < range.min ||
      size > range.max
    ) {
      return;
    }

    setForm((previous) => {
      const previousDetails =
        previous.eventRegistrations[slug] || emptyEventRegistration();

      const members = [...(previousDetails.members || [])];

      while (members.length < size - 1) {
        members.push(emptyMember());
      }

      members.length = size - 1;

      return {
        ...previous,
        eventRegistrations: {
          ...previous.eventRegistrations,
          [slug]: {
            ...previousDetails,
            teamSize: size,
            members,
          },
        },
      };
    });

    setErrors((previous) => ({
      ...previous,
      [`event-${slug}-teamSize`]: "",
    }));

    setSubmitError("");
  }

  /* =========================================================
     EVENT MEMBER UPDATE
  ========================================================= */

  function updateEventMember(slug, index, field, value) {
    setForm((previous) => {
      const previousDetails =
        previous.eventRegistrations[slug] || emptyEventRegistration();
      const members = [...(previousDetails.members || [])];

      if (!members[index]) {
        members[index] = emptyMember();
      }

      members[index] = {
        ...members[index],
        [field]: value,
      };

      return {
        ...previous,
        eventRegistrations: {
          ...previous.eventRegistrations,
          [slug]: {
            ...previousDetails,
            members,
          },
        },
      };
    });

    setErrors((previous) => ({
      ...previous,
      [`event-${slug}-member-${index}-${field}`]: "",
    }));

    setSubmitError("");
  }

  /* =========================================================
     PERSONAL VALIDATION
  ========================================================= */

  function validatePersonalInfoStep() {
    const nextErrors = {};

    const validators = [
      ["name", validateName(form.name)],
      ["email", validateEmail(form.email)],
      ["phone", validatePhone(form.phone)],
      ["college", validateCollege(form.college)],
      ["department", validateDepartment(form.department)],
      ["year", validateYear(form.year)],
    ];

    validators.forEach(([field, error]) => {
      if (error) nextErrors[field] = error;
    });

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  /* =========================================================
     EVENT + PER-EVENT PARTICIPANT VALIDATION
  ========================================================= */

  function validateEventSelectionStep() {
    const nextErrors = {};

    if (form.eventSlugs.length === 0) {
      nextErrors.eventSlug = "Please select at least one event.";
    }

    for (const slug of form.eventSlugs) {
      const event = selectedEvents.find((item) => item.slug === slug);
      if (!event) continue;

      const eventError = validateEvent(slug);
      if (eventError) {
        nextErrors.eventSlug = eventError;
        break;
      }

      const range = getEventParticipantRange(event);
      const details =
        form.eventRegistrations[slug] || emptyEventRegistration();
      const participantCount = Number(details.teamSize) || 0;

      if (!details.teamSize) {
        nextErrors[`event-${slug}-teamSize`] =
          "Please select the number of participants for this event.";
        continue;
      }

      if (
        participantCount < range.min ||
        participantCount > range.max
      ) {
        nextErrors[`event-${slug}-teamSize`] =
          `Select between ${range.min} and ${range.max} participants for this event.`;
        continue;
      }

      const expectedMembers = Math.max(0, participantCount - 1);
const members = Array.isArray(details.members)
  ? details.members
  : [];

if (members.length < expectedMembers) {
  nextErrors[`event-${slug}-teamSize`] =
    `Please provide details for all ${expectedMembers} additional team member(s).`;
  continue;
}

      if (expectedMembers > 0) {
        const memberErrors = validateTeamMembers(
          members,
          form.email,
          participantCount
        );

        Object.entries(memberErrors || {}).forEach(([key, message]) => {
          const indexMatch = String(key).match(/member-(\d+)-(.+)/);

          if (indexMatch) {
            const [, index, field] = indexMatch;
            nextErrors[
              `event-${slug}-member-${index}-${field}`
            ] = message;
          } else {
            nextErrors[`event-${slug}-members`] = message;
          }
        });
      }
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  /* =========================================================
     PAYMENT VALIDATION
  ========================================================= */

  function validatePaymentStep() {
    const nextErrors = {};

    if (totalFee <= 0) {
      setErrors({});
      return true;
    }

    if (!form.paymentScreenshotShared) {
      nextErrors.paymentScreenshotShared =
        "Please confirm that you have sent the payment screenshot to the respective event coordinator.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  /* =========================================================
     COMPLETE VALIDATION
  ========================================================= */

  function validateCompleteRegistration() {
    const nextErrors = {};

    const personalValidators = [
      ["name", validateName(form.name)],
      ["email", validateEmail(form.email)],
      ["phone", validatePhone(form.phone)],
      ["college", validateCollege(form.college)],
      ["department", validateDepartment(form.department)],
      ["year", validateYear(form.year)],
    ];

    personalValidators.forEach(([field, error]) => {
      if (error) nextErrors[field] = error;
    });

    if (form.eventSlugs.length === 0) {
      nextErrors.eventSlug = "Please select at least one event.";
    }

    for (const slug of form.eventSlugs) {
      const event = selectedEvents.find((item) => item.slug === slug);
      if (!event) continue;

      const eventError = validateEvent(slug);
      if (eventError) {
        nextErrors.eventSlug = eventError;
        continue;
      }

      const range = getEventParticipantRange(event);
      const details =
        form.eventRegistrations[slug] || emptyEventRegistration();
      const participantCount = Number(details.teamSize) || 0;

      if (!details.teamSize) {
        nextErrors[`event-${slug}-teamSize`] =
          "Please select the number of participants for this event.";
        continue;
      }

      if (
        participantCount < range.min ||
        participantCount > range.max
      ) {
        nextErrors[`event-${slug}-teamSize`] =
          `Select between ${range.min} and ${range.max} participants for this event.`;
        continue;
      }

      const expectedMembers = Math.max(0, participantCount - 1);
const members = Array.isArray(details.members)
  ? details.members
  : [];

if (members.length < expectedMembers) {
  nextErrors[`event-${slug}-teamSize`] =
    `Please provide details for all ${expectedMembers} additional team member(s).`;
  continue;
}

      if (expectedMembers > 0) {
        const memberErrors = validateTeamMembers(
          members,
          form.email,
          participantCount
        );

        Object.entries(memberErrors || {}).forEach(([key, message]) => {
          const indexMatch = String(key).match(/member-(\d+)-(.+)/);

          if (indexMatch) {
            const [, index, field] = indexMatch;
            nextErrors[
              `event-${slug}-member-${index}-${field}`
            ] = message;
          } else {
            nextErrors[`event-${slug}-members`] = message;
          }
        });
      }
    }

    if (totalFee > 0 && !form.paymentScreenshotShared) {
      nextErrors.paymentScreenshotShared =
        "Please confirm that you have sent the payment screenshot to the respective event coordinator.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  /* =========================================================
     NEXT / BACK
  ========================================================= */

  function handleNext() {
    if (step === 1) {
      if (!validatePersonalInfoStep()) {
        scrollToError();
        return;
      }

      setStep(2);
      scrollTop();
      return;
    }

    if (step === 2) {
      if (!validateEventSelectionStep()) {
        scrollToError();
        return;
      }

      setStep(3);
      scrollTop();
    }
  }

  function handleBack() {
    if (step === 1) return;

    setStep((previous) => previous - 1);
    setErrors({});
    setSubmitError("");
    scrollTop();
  }

  /* =========================================================
     FINAL SUBMISSION
  ========================================================= */

  async function handleSubmit(event) {
  event.preventDefault();

  if (!validateCompleteRegistration()) {
    scrollToError();
    return;
  }

  if (selectedEvents.length === 0) {
    setSubmitError("Please select at least one event.");
    setStep(2);
    scrollTop();
    return;
  }

  setSubmitting(true);
  setSubmitError("");

  try {
    const primary = {
      fullName: form.name.trim(),
      email: form.email.trim().toLowerCase(),
      phone: form.phone.trim(),
      college: form.college.trim(),
      department: form.department.trim(),
      year: form.year.trim(),
    };

    /*
     * =====================================================
     * EVENT-SPECIFIC REGISTRATION DATA
     * =====================================================
     *
     * Each selected event can now have its own
     * participant count and member list.
     *
     * Example:
     *
     * Coding & Debugging
     *   → 1 participant
     *
     * Free Fire
     *   → 4 participants
     *
     * Both are allowed in ONE registration.
     */

    const eventRegistrations = selectedEvents.map(
      (eventItem) => {
        const details =
          form.eventRegistrations[eventItem.slug] ||
          emptyEventRegistration();

        const members = Array.isArray(details.members)
          ? details.members
          : [];

        return {
          eventId: eventItem.id,

          maxParticipants:
            eventItem.max_participants ??
            eventItem.maxParticipants ??
            null,

          participants: [
            {
              fullName: primary.fullName,
              email: primary.email,
              phone: primary.phone,
              college: primary.college,
              department: primary.department,
              year: primary.year,
            },

            ...members.map((member) => ({
              fullName:
                member.name?.trim() ||
                member.fullName?.trim() ||
                "",

              email:
                member.email?.trim().toLowerCase() ||
                "",

              phone:
                member.phone?.trim() ||
                "",

              college:
                member.college?.trim() ||
                "",

              department:
                member.department?.trim() ||
                "",

              year:
                member.year?.trim() ||
                "",
            })),
          ],
        };
      }
    );

    /*
     * =====================================================
     * REGISTRATION TYPE
     * =====================================================
     *
     * Overall registration is considered a team if
     * at least one selected event has additional members.
     */

    const hasTeamEvent =
      eventRegistrations.some(
        (event) =>
          event.participants.length > 1
      );

    const registrationType =
      hasTeamEvent
        ? "team"
        : "individual";

    /*
     * =====================================================
     * ONE COMBINED REGISTRATION
     * ONE COMBINED PAYMENT
     * =====================================================
     */

    const result = await submitRegistration({
      selectedEvents: selectedEvents.map(
        (eventItem) => ({
          id: eventItem.id,

          maxParticipants:
            eventItem.max_participants ??
            eventItem.maxParticipants ??
            null,
        })
      ),

      eventRegistrations,

      registrationType,

      teamName: null,

      primary,

      /*
       * Kept for compatibility with the service.
       * Event-specific members are now handled through
       * eventRegistrations.
       */
      members: [],

      payment: {
        amount: totalFee,

        paymentMethod:
          totalFee > 0
            ? paymentData.paymentMethod ||
              "Google Pay"
            : null,

        transactionReference:
          form.referenceId.trim() || null,

        screenshotShared:
          totalFee > 0
            ? form.paymentScreenshotShared
            : false,
      },
    });

    /*
     * =====================================================
     * SUCCESS
     * =====================================================
     */

    const number =
      result?.registrationNumber ||
      result?.registration_number ||
      "";

    setRegistrationNumbers(
      number
        ? [
            {
              eventName:
                selectedEvents.length === 1
                  ? selectedEvents[0].name
                  : `${selectedEvents.length} selected events`,

              registrationNumber:
                number,
            },
          ]
        : []
    );

    setSubmitted(true);

    if (!form.rememberDetails) {
      localStorage.removeItem(DRAFT_KEY);
      localStorage.removeItem(
        LEGACY_DRAFT_KEY
      );
    }

    scrollTop();
  } catch (error) {
    console.error(
      "Registration submission error:",
      error
    );

    setSubmitError(
      error instanceof Error
        ? error.message
        : "Registration could not be completed. Please try again."
    );

    scrollToError();
  } finally {
    setSubmitting(false);
  }
}

  /* =========================================================
     SUCCESS SCREEN
  ========================================================= */

  if (submitted) {
    return (
      <main className="register-page">
        <section className="register-success-section">
          <div className="register-shell">
            <div className="register-success-card">
              <div className="success-icon">✓</div>

              <p className="register-eyebrow">REVIBE '26</p>

              <h1>Registration Submitted</h1>

              <p className="success-intro">
                Your registration has been submitted successfully.
              </p>

              <div className="success-details">
                <div>
                  <span>Participant</span>
                  <strong>{form.name}</strong>
                </div>

                <div>
                  <span>Events</span>
                  <div className="success-event-list">
                    {selectedEvents.map((eventItem) => {
                      const details =
                        form.eventRegistrations[eventItem.slug] ||
                        emptyEventRegistration();

                      return (
                        <div
                          className="success-event-item"
                          key={eventItem.id || eventItem.slug}
                        >
                          <strong>{eventItem.name}</strong>
                          <span>
                            {details.teamSize} participant(s) • {formatEventSchedule(eventItem)} • {getEventVenue(eventItem)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {registrationNumbers.length > 0 && (
                  <div>
                    <span>Registration No.</span>
                    <div className="success-event-list">
                      {registrationNumbers.map((item) => (
                        <div
                          className="success-event-item"
                          key={item.registrationNumber}
                        >
                          <strong>{item.registrationNumber}</strong>
                          <span>{item.eventName}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <span>Amount</span>
                  <strong>₹{totalFee}</strong>
                </div>
              </div>

              {totalFee > 0 && (
                <div className="success-warning">
                  <strong>Payment verification pending</strong>
                  <ol>
  <li>Your payment details have been submitted.</li>
  <li>Your registration will be considered confirmed only after successful payment verification.</li>
  <li>After successful verification, you will be added to the respective event WhatsApp group.</li>
</ol>
                </div>
              )}

              {totalFee === 0 && (
                <div className="success-warning">
                  <strong>Registration submitted</strong>
                  <p>No payment is required for these events.</p>
                </div>
              )}

              <p className="success-note">
                Please keep your registration number(s) safely for future reference.
              </p>
            </div>
          </div>
        </section>

        <style>{registerStyles}</style>
      </main>
    );
  }

  /* =========================================================
     MAIN PAGE
  ========================================================= */

  return (
    <>
      <main className="register-page">
        <section className="register-main">
          <div className="register-shell">
            <div className="register-heading">
              <p className="register-eyebrow">PARTICIPANT REGISTRATION</p>
              <h1>Register for REVIBE '26</h1>
              <p>Complete your registration in three simple steps.</p>
            </div>

            <div className="register-steps" aria-label="Registration progress">
              <Step number="01" title="Personal Info" active={step === 1} completed={step > 1} />
              <div className={`step-line ${step > 1 ? "completed" : ""}`} />
              <Step number="02" title="Select Event" active={step === 2} completed={step > 2} />
              <div className={`step-line ${step > 2 ? "completed" : ""}`} />
              <Step number="03" title="Payment" active={step === 3} completed={false} />
            </div>

            <form onSubmit={handleSubmit} noValidate>
              {/* =================================================
                  STEP 1
              ================================================= */}

              {step === 1 && (
                <section className="register-card">
                  <div className="card-heading">
                    <span className="card-number">01</span>
                    <div>
                      <p>STEP ONE</p>
                      <h2>Personal Information</h2>
                    </div>
                  </div>

                  <p className="card-description">
                    Enter your details exactly as they should appear on your registration.
                  </p>

                  <div className="field-grid">
                    <Field label="Full Name" required error={errors.name}>
                      <input
                        type="text"
                        value={form.name}
                        onChange={(event) => update("name", event.target.value)}
                        placeholder="Enter your full name"
                        autoComplete="name"
                      />
                    </Field>

                    <Field label="Email Address" required error={errors.email}>
                      <input
                        type="email"
                        value={form.email}
                        onChange={(event) => update("email", event.target.value)}
                        placeholder="your@email.com"
                        autoComplete="email"
                      />
                    </Field>

                    <Field label="Mobile Number" required error={errors.phone}>
                      <input
                        type="tel"
                        inputMode="numeric"
                        value={form.phone}
                        maxLength={10}
                        onChange={(event) =>
                          update("phone", event.target.value.replace(/\D/g, ""))
                        }
                        placeholder="10-digit mobile number"
                        autoComplete="tel"
                      />
                    </Field>

                    <Field label="College Name" required error={errors.college}>
                      <input
                        type="text"
                        value={form.college}
                        onChange={(event) => update("college", event.target.value)}
                        placeholder="Enter your college name"
                        autoComplete="organization"
                      />
                    </Field>

                    <Field label="Department" required error={errors.department}>
                      <input
                        type="text"
                        value={form.department}
                        onChange={(event) => update("department", event.target.value)}
                        placeholder="e.g. CSE, IT, ECE"
                      />
                    </Field>

                    <Field label="Year of Study" required error={errors.year}>
                      <select
                        value={form.year}
                        onChange={(event) => update("year", event.target.value)}
                      >
                        <option value="">Select year</option>
                        <option value="1st Year">1st Year</option>
                        <option value="2nd Year">2nd Year</option>
                        <option value="3rd Year">3rd Year</option>
                        <option value="4th Year">4th Year</option>
                      </select>
                    </Field>
                  </div>

                  <label className="remember-details">
                    <input
                      type="checkbox"
                      checked={form.rememberDetails}
                      onChange={(event) =>
                        update("rememberDetails", event.target.checked)
                      }
                    />
                    <span className="remember-details-text">
                      <strong>Remember my details on this device</strong>
                      <span>
                        Your participant and event member details will be saved locally so you can continue later.
                      </span>
                    </span>
                  </label>

                  <div className="step-actions">
                    <span />
                    <button type="button" className="register-primary-btn" onClick={handleNext}>
                      Continue <span>→</span>
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
                    <span className="card-number">02</span>
                    <div>
                      <p>STEP TWO</p>
                      <h2>Select Events</h2>
                    </div>
                  </div>

                  <p className="card-description">
                    Select one or more events. Each selected event has its own participant count and team member details.
                  </p>

                  {eventsLoading && (
                    <div className="register-loading">Loading available events...</div>
                  )}

                  {eventsError && (
                    <div className="register-error-box">
                      <strong>Unable to load events</strong>
                      <p>{eventsError}</p>
                      <button type="button" onClick={() => window.location.reload()}>
                        Refresh
                      </button>
                    </div>
                  )}

                  {!eventsLoading && !eventsError && (
                    <>
                      <div className="event-selection">
                        <div className="event-selection-title">
                          <span>SELECT ONE OR MORE EVENTS</span>
                          <span className="selected-events-count">
                            {form.eventSlugs.length} selected
                          </span>
                        </div>

                        <div className="event-selection-note">
  <strong>NOTE:</strong> Selecting more than 1 event — please check the timings carefully and make sure you are available for all your selected events.
</div>

                        {errors.eventSlug && (
                          <p className="field-error">{errors.eventSlug}</p>
                        )}

                        {technicalEvents(events).length > 0 && (
                          <EventCategory
                            title="Technical Events"
                            icon="🔧"
                            events={technicalEvents(events)}
                            selectedSlugs={form.eventSlugs}
                            onSelect={handleEventChange}
                          />
                        )}

                        {nonTechnicalEvents(events).length > 0 && (
                          <EventCategory
                            title="Non-Technical Events"
                            icon="🎭"
                            events={nonTechnicalEvents(events)}
                            selectedSlugs={form.eventSlugs}
                            onSelect={handleEventChange}
                          />
                        )}

                        {events.length === 0 && (
                          <div className="register-loading">
                            No events are currently open for registration.
                          </div>
                        )}
                      </div>

                      {selectedEvents.length > 0 && (
                        <>
                          <div className="selected-event-card">
                            <div>
                              <span>SELECTED EVENTS</span>
                              <h3>
                                {selectedEvents.length} Event{selectedEvents.length !== 1 ? "s" : ""}
                              </h3>
                              <p>
                                Select the participant count separately for each selected event.
                              </p>
                            </div>

                            <div className="event-rule-badge">
                              <span>PARTICIPANT LIMITS</span>
                              <strong>Set separately per event</strong>
                            </div>
                          </div>

                          <div className="selected-event-details-list">
                            {selectedEvents.map((eventItem) => {
                              const range = getEventParticipantRange(eventItem);
                              const details =
                                form.eventRegistrations[eventItem.slug] ||
                                emptyEventRegistration();
                              const participantCount = Number(details.teamSize) || 0;
                              const expectedMembers = Math.max(0, participantCount - 1);
                              const members = details.members || [];
                              const eventError =
                                errors[`event-${eventItem.slug}-teamSize`];

                              return (
                                <div
                                  className="selected-event-detail-card"
                                  key={eventItem.id || eventItem.slug}
                                >
                                  <div className="selected-event-detail-header">
                                    <div>
                                      <span className="selected-event-detail-kicker">
                                        EVENT DETAILS
                                      </span>
                                      <h4>{eventItem.name}</h4>
                                      <p className="selected-event-detail-schedule">
                                        {formatEventSchedule(eventItem)} • {getEventVenue(eventItem)}
                                      </p>
                                    </div>

                                    <div className="selected-event-fee">
                                      <small>EVENT FEE</small>
                                      ₹
                                      {participantCount
                                        ? getTotalFee(eventItem.slug, participantCount)
                                        : getEventFee(eventItem)}
                                    </div>
                                  </div>

                                  <div className="event-participant-selector">
                                    <Field
                                      label="Number of Participants"
                                      required
                                      error={eventError}
                                    >
                                      <select
                                        value={details.teamSize}
                                        onChange={(event) =>
                                          handleEventParticipantCountChange(
                                            eventItem.slug,
                                            event.target.value
                                          )
                                        }
                                      >
                                        <option value="">
                                          Select participant count
                                        </option>

                                        {Array.from(
                                          { length: range.max - range.min + 1 },
                                          (_, index) => {
                                            const size = range.min + index;
                                            return (
                                              <option key={size} value={size}>
                                                {size} {size === 1 ? "Participant" : "Participants"}
                                              </option>
                                            );
                                          }
                                        )}
                                      </select>
                                    </Field>

                                    <div className="event-participant-info">
                                      <strong>
                                        Min: {range.min} | Max: {range.max}
                                      </strong>
                                      <span>
                                        Choose the actual number of participants for {eventItem.name}.
                                      </span>
                                    </div>
                                  </div>

                                  {participantCount > 1 && (
                                    <div className="event-members-section">
                                      <div className="event-members-heading">
                                        <div>
                                          <span className="selected-event-detail-kicker">
                                            TEAM DETAILS
                                          </span>
                                          <h3>
                                            TEAM MEMBER DETAILS
                                          </h3>
                                        </div>
                                        <strong>
                                          {participantCount} participants • {expectedMembers} additional member{expectedMembers !== 1 ? "s" : ""}
                                        </strong>
                                      </div>

                                      <p className="members-note">
                                        Enter the complete details of every additional participant for this event.
                                      </p>

                                      {errors[`event-${eventItem.slug}-members`] && (
                                        <p className="field-error">
                                          {errors[`event-${eventItem.slug}-members`]}
                                        </p>
                                      )}

                                      {members.map((member, index) => (
                                        <div className="event-member-card" key={`${eventItem.slug}-${index}`}>
                                          <div className="member-number">
                                            MEMBER {index + 2}
                                          </div>

                                          <div className="field-grid">
                                            <Field
                                              label="Full Name"
                                              required
                                              error={
                                                errors[
                                                  `event-${eventItem.slug}-member-${index}-name`
                                                ]
                                              }
                                            >
                                              <input
                                                type="text"
                                                value={member.name}
                                                onChange={(event) =>
                                                  updateEventMember(
                                                    eventItem.slug,
                                                    index,
                                                    "name",
                                                    event.target.value
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
                                                  `event-${eventItem.slug}-member-${index}-email`
                                                ]
                                              }
                                            >
                                              <input
                                                type="email"
                                                value={member.email}
                                                onChange={(event) =>
                                                  updateEventMember(
                                                    eventItem.slug,
                                                    index,
                                                    "email",
                                                    event.target.value
                                                  )
                                                }
                                                placeholder="Enter email address"
                                              />
                                            </Field>

                                            <Field
                                              label="Mobile Number"
                                              required
                                              error={
                                                errors[
                                                  `event-${eventItem.slug}-member-${index}-phone`
                                                ]
                                              }
                                            >
                                              <input
                                                type="tel"
                                                inputMode="numeric"
                                                maxLength={10}
                                                value={member.phone}
                                                onChange={(event) =>
                                                  updateEventMember(
                                                    eventItem.slug,
                                                    index,
                                                    "phone",
                                                    event.target.value.replace(/\D/g, "")
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
                                                  `event-${eventItem.slug}-member-${index}-college`
                                                ]
                                              }
                                            >
                                              <input
                                                type="text"
                                                value={member.college}
                                                onChange={(event) =>
                                                  updateEventMember(
                                                    eventItem.slug,
                                                    index,
                                                    "college",
                                                    event.target.value
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
                                                  `event-${eventItem.slug}-member-${index}-department`
                                                ]
                                              }
                                            >
                                              <input
                                                type="text"
                                                value={member.department}
                                                onChange={(event) =>
                                                  updateEventMember(
                                                    eventItem.slug,
                                                    index,
                                                    "department",
                                                    event.target.value
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
                                                  `event-${eventItem.slug}-member-${index}-year`
                                                ]
                                              }
                                            >
                                              <select
                                                value={member.year}
                                                onChange={(event) =>
                                                  updateEventMember(
                                                    eventItem.slug,
                                                    index,
                                                    "year",
                                                    event.target.value
                                                  )
                                                }
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
                                      ))}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>

                          <div className="fee-summary">
                            <div>
                              <span>REGISTRATION FEE</span>
                              <strong>
                                {selectedEvents.length === 1 &&
                                selectedEvents[0].slug &&
                                Number(
                                  form.eventRegistrations[selectedEvents[0].slug]?.teamSize
                                )
                                  ? getFeeLabel(selectedEvents[0].slug)
                                  : `${selectedEvents.length} event(s) • per-event participant count`}
                              </strong>
                            </div>

                            <div className="total-fee">
                              <span>TOTAL</span>
                              <strong>₹{totalFee}</strong>
                            </div>
                          </div>

                          <div className="selected-events-preview">
                            <div className="selected-events-preview-header">
                              <span>REGISTRATION SUMMARY</span>
                              <span>
                                {selectedEvents.length} event{selectedEvents.length !== 1 ? "s" : ""}
                              </span>
                            </div>

                            <div className="event-review-list">
                              {selectedEvents.map((eventItem) => {
                                const details =
                                  form.eventRegistrations[eventItem.slug] ||
                                  emptyEventRegistration();
                                const participantCount = Number(details.teamSize) || 0;
                                const eventFee = participantCount
                                  ? getTotalFee(eventItem.slug, participantCount)
                                  : 0;

                                return (
                                  <div
                                    className="event-review-item"
                                    key={eventItem.id || eventItem.slug}
                                  >
                                    <div>
                                      <div className="event-review-name">
                                        {eventItem.name}
                                      </div>
                                      <div className="event-review-meta">
                                        {formatEventSchedule(eventItem)} • {getEventVenue(eventItem)}
                                      </div>
                                      <div className="event-review-participants">
                                        Participants: {participantCount || "Not selected"}
                                      </div>
                                    </div>

                                    <div />

                                    <div className="event-review-fee">
                                      ₹{eventFee}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>

                            <div className="review-total">
                              <span>TOTAL AMOUNT TO BE PAID</span>
                              <strong>₹{totalFee}</strong>
                            </div>
                          </div>

                          <div className="bottom-timing-note">
  <strong>NOTE:</strong> Selecting more than 1 event — please check the timings carefully and make sure you are available for all your selected events.
</div>
                        </>
                      )}
                    </>
                  )}

                  <div className="step-actions">
                    <button
                      type="button"
                      className="register-secondary-btn"
                      onClick={handleBack}
                    >
                      ← Back
                    </button>

                    <button
                      type="button"
                      className="register-primary-btn"
                      onClick={handleNext}
                      disabled={
                        eventsLoading ||
                        !!eventsError ||
                        selectedEvents.length === 0
                      }
                    >
                      Continue <span>→</span>
                    </button>
                  </div>
                </section>
              )}

              {/* =================================================
                  STEP 3
              ================================================= */}

              {step === 3 && (
                <section className="register-card">
                  <div className="card-heading">
                    <span className="card-number">03</span>
                    <div>
                      <p>STEP THREE</p>
                      <h2>Payment</h2>
                    </div>
                  </div>

                  <p className="card-description">
                    Complete the payment using Google Pay.
                  </p>

                  {selectedEvents.length > 0 && (
                    <div className="payment-summary">
                      <div>
                        <span>EVENTS</span>
                        <strong>{selectedEvents.length} selected</strong>
                      </div>
                      <div>
                        <span>PARTICIPANTS</span>
                        <strong>
                          {selectedEvents.reduce((total, eventItem) => {
                            const count = Number(
                              form.eventRegistrations[eventItem.slug]?.teamSize
                            );
                            return total + (count || 0);
                          }, 0)} total selections
                        </strong>
                      </div>
                      <div>
                        <span>TOTAL AMOUNT</span>
                        <strong>₹{totalFee}</strong>
                      </div>
                    </div>
                  )}

                  {selectedEvents.length > 1 && (
                    <div className="multi-payment-events">
                      {selectedEvents.map((eventItem) => {
                        const details =
                          form.eventRegistrations[eventItem.slug] ||
                          emptyEventRegistration();
                        const participantCount = Number(details.teamSize) || 0;

                        return (
                          <div
                            className="multi-payment-event"
                            key={eventItem.id || eventItem.slug}
                          >
                            <strong>{eventItem.name}</strong>
                            <span>
                              {participantCount} participant(s) • {formatEventSchedule(eventItem)} • {getEventVenue(eventItem)} • ₹
                              {getTotalFee(eventItem.slug, participantCount)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {totalFee > 0 && (
                    <>
                      <div className="payment-instructions">
                        <span>PAYMENT INSTRUCTIONS</span>

                        <ol>
  <li>
    <strong>Take a screenshot of the successful payment.</strong>
  </li>

  <li>
    <strong>
      Send the payment screenshot to the respective event
      coordinator(s) on WhatsApp.
    </strong>

    <div style={{ marginTop: "0.6rem" }}>
      {selectedEvents.map((eventItem) => {
        const coordinator = getCoordinatorDetails(eventItem.name);

        return (
          <div
            key={eventItem.id || eventItem.slug}
            style={{
              marginBottom: "0.5rem",
              padding: "0.6rem 0.7rem",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "6px",
              background: "rgba(255,255,255,0.025)",
            }}
          >
            <strong style={{ color: "#ffffff" }}>
              {eventItem.name}
            </strong>

            <div
              style={{
                marginTop: "0.25rem",
                color: "rgba(255,255,255,0.55)",
                fontSize: "0.72rem",
              }}
            >
              Coordinator:{" "}
              <span style={{ color: "#ffffff" }}>
                {coordinator.name}
              </span>

              {coordinator.whatsapp && (
                <>
                  {" • "}
                  <a
                    href={`https://wa.me/91${String(
                      coordinator.whatsapp
                    ).replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.35rem",
                      marginTop: "0.45rem",
                      padding: "0.45rem 0.7rem",
                      borderRadius: "6px",
                      background: "rgba(37, 211, 102, 0.1)",
                      border: "1px solid rgba(37, 211, 102, 0.25)",
                      color: "#25D366",
                      fontWeight: 700,
                      textDecoration: "none",
                      fontSize: "0.7rem",
                    }}
                  >
                    💬 {coordinator.whatsapp}
                  </a>
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>

    <div
      style={{
        marginTop: "0.7rem",
        padding: "0.65rem 0.75rem",
        borderRadius: "6px",
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <strong>
        For multiple events, make ONE combined payment and mention
        the amount for each event + the total amount when sharing
        the screenshot with the respective coordinators.
      </strong>

      <div
        style={{
          marginTop: "0.35rem",
          color: "rgba(255,255,255,0.65)",
          fontSize: "0.75rem",
        }}
      >
        Example: Paper Presentation ₹150 + Free Fire ₹150 = ₹300 Total.
      </div>
    </div>
  </li>

  <li>
    If you have selected multiple events, send the same payment
    screenshot to the coordinator of each selected event.
  </li>

  <li>
    After sending the screenshot, tick the confirmation checkbox below.
  </li>

  <li>
    Click "Register for the Event" to submit your registration.
  </li>
</ol>
                      </div>

                      <div className="payment-layout">
                        <div className="qr-card">
                          <span className="payment-label">SCAN TO PAY</span>
                          <div className="qr-wrapper">
                            <img
                              src={paymentData.qrImage}
                              alt="Google Pay QR code"
                              onError={(event) => {
                                event.currentTarget.style.display = "none";
                                event.currentTarget.parentElement.classList.add("qr-missing");
                              }}
                            />
                            <span className="qr-missing-text">
                              GPay QR code will appear here.
                            </span>
                          </div>
                          <strong>Google Pay</strong>
                        </div>

                        <div className="gpay-card">
                          <span className="payment-label">PAY USING GPAY</span>
                          <h3>GPay Number</h3>
                          <div className="gpay-number">{paymentData.gpayNumber}</div>
                          <p>Send exactly ₹{totalFee} using Google Pay.</p>

                          <div className="payment-important">
                            <strong>IMPORTANT</strong>
                            <p>
                              Keep the successful payment screenshot after completing the payment.
                            </p>
                          </div>
                        </div>
                      </div>

                      <label
  className={`payment-checkbox ${
    errors.paymentScreenshotShared
      ? "payment-checkbox-error-state"
      : ""
  }`}
>
  <input
    type="checkbox"
    checked={form.paymentScreenshotShared}
    onChange={(event) =>
      update("paymentScreenshotShared", event.target.checked)
    }
  />

  <span className="checkbox-text">
    I confirm that I have sent my successful payment screenshot to the respective event coordinator(s).

    <span
      style={{
        display: "block",
        marginTop: "0.55rem",
      }}
    >
      {selectedEvents.map((eventItem) => {
        const coordinator = getCoordinatorDetails(eventItem.name);

        return (
          <span
            key={eventItem.id || eventItem.slug}
            style={{
              display: "block",
              marginBottom: "0.35rem",
            }}
          >
            <strong style={{ color: "#ffffff" }}>
              {eventItem.name}
            </strong>

            {" — "}

            <span style={{ color: "rgba(255,255,255,0.65)" }}>
              {coordinator.name}
            </span>

            {coordinator.whatsapp && (
              <>
                {" • "}
                <a
                  href={`https://wa.me/91${String(
                    coordinator.whatsapp
                  ).replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    color: "#25D366",
                    fontWeight: 700,
                    textDecoration: "none",
                  }}
                >
                  {coordinator.whatsapp}
                </a>
              </>
            )}
          </span>
        );
      })}
    </span>
  </span>
</label>

                      {errors.paymentScreenshotShared && (
                        <p className="field-error payment-checkbox-error">
                          {errors.paymentScreenshotShared}
                        </p>
                      )}

                      <div className="final-warning">
                        <strong>IMPORTANT: Registration is not confirmed yet.</strong>
<p>
  Your registration will be confirmed only after the respective event coordinator verifies your payment. Once your payment is verified, the coordinator will add your WhatsApp number to the respective event WhatsApp group.
</p>
                      </div>
                    </>
                  )}

                  {totalFee === 0 && (
                    <div className="free-event-box">
                      <strong>These events are free.</strong>
                      <p>
                        No payment is required. You can submit your registration directly.
                      </p>
                    </div>
                  )}

                  {submitError && <div className="submit-error">{submitError}</div>}

                  <div className="step-actions">
                    <button
                      type="button"
                      className="register-secondary-btn"
                      onClick={handleBack}
                      disabled={submitting}
                    >
                      ← Back
                    </button>

                    <button
                      type="submit"
                      className="register-primary-btn register-submit"
                      disabled={submitting}
                    >
                      {submitting ? "Submitting..." : "Register for the Event"}
                      {!submitting && <span>✓</span>}
                    </button>
                  </div>
                </section>
              )}
            </form>
          </div>
        </section>
      </main>

      <style>{registerStyles}</style>
    </>
  );
}

/* =========================================================
   EVENT HELPERS
========================================================= */

function technicalEvents(events) {
  return events.filter((event) => getCategory(event) === "technical");
}

function nonTechnicalEvents(events) {
  return events.filter((event) => getCategory(event) === "non_technical");
}

/* =========================================================
   EVENT CATEGORY
========================================================= */

function EventCategory({
  title,
  icon,
  events,
  selectedSlugs,
  onSelect,
}) {
  return (
    <div className="event-category">
      <div className="event-category-heading">
        <h3>
          <span>{icon}</span>
          {title}
        </h3>
      </div>

      <div className="event-grid">
        {events.map((event) => {
          const selected = selectedSlugs.includes(event.slug);
          const fee = getEventFee(event);
          const maxTeam = getEventParticipantRange(event).max;

          return (
            <button
              type="button"
              key={event.id || event.slug}
              className={`event-option ${selected ? "selected" : ""}`}
              onClick={() => onSelect(event.slug)}
            >
              <div className="event-option-top">
                <h4>{event.name}</h4>
                <span className={`event-radio ${selected ? "checked" : ""}`}>
                  {selected ? "✓" : ""}
                </span>
              </div>

              {event.description && (
                <p className="event-description">{event.description}</p>
              )}

              <div className="event-option-bottom">
                <strong>{fee > 0 ? `₹${fee}` : "FREE"}</strong>
                <span>
                  Max {maxTeam} {maxTeam === 1 ? "participant" : "participants"}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* =========================================================
   STEP
========================================================= */

function Step({ number, title, active, completed }) {
  return (
    <div className={`register-step ${active ? "active" : ""} ${completed ? "completed" : ""}`}>
      <div className="step-circle">{completed ? "✓" : number}</div>
      <span>{title}</span>
    </div>
  );
}

/* =========================================================
   FIELD
========================================================= */

function Field({ label, required = false, error, children }) {
  return (
    <label className="register-field">
      <span className="field-label">
        {label}
        {required && <b aria-hidden="true">*</b>}
      </span>
      {children}
      {error && <span className="field-error">{error}</span>}
    </label>
  );
}

/* =========================================================
   SCROLL
========================================================= */

function scrollTop() {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
}

function scrollToError() {
  setTimeout(() => {
    const errorElement = document.querySelector(".field-error");

    if (errorElement) {
      errorElement.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, 50);
}

const registerStyles = `
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
    color: #ffffff;
    overflow-x: hidden;
  }

  .register-main {
    width: 100%;
    padding: 4rem 1rem 5rem;
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
    margin: 0 0 0.7rem;
    color: #dc0000;
    font-family: 'Orbitron', sans-serif;
    font-size: 0.7rem;
    font-weight: 700;
    letter-spacing: 0.18em;
    text-transform: uppercase;
  }

  .register-heading h1 {
    margin: 0;
    font-family: 'Anton', sans-serif;
    font-size: clamp(2rem, 6vw, 3.8rem);
    font-weight: 400;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    line-height: 1;
  }

  .register-heading > p:last-child {
    margin: 0.9rem 0 0;
    color: rgba(255,255,255,0.62);
    font-size: 0.95rem;
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
    gap: 0.55rem;
    min-width: 105px;
  }

  .step-circle {
    width: 46px;
    height: 46px;
    border: 1px solid rgba(255,255,255,0.22);
    border-radius: 50%;
    display: grid;
    place-items: center;
    color: rgba(255,255,255,0.45);
    background: #090909;
    font-family: 'Orbitron', sans-serif;
    font-size: 0.7rem;
    font-weight: 700;
  }

  .register-step span:last-child {
    color: rgba(255,255,255,0.42);
    font-family: 'Orbitron', sans-serif;
    font-size: 0.58rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    text-align: center;
  }

  .register-step.active .step-circle {
    border-color: #dc0000;
    background: #dc0000;
    color: #ffffff;
    box-shadow:
      0 0 0 5px rgba(220,0,0,0.08),
      0 0 25px rgba(220,0,0,0.25);
  }

  .register-step.active span:last-child {
    color: #ffffff;
  }

  .register-step.completed .step-circle {
    border-color: #dc0000;
    color: #ffffff;
  }

  .register-step.completed span:last-child {
    color: rgba(255,255,255,0.8);
  }

  .step-line {
    flex: 1;
    height: 1px;
    max-width: 150px;
    margin: 23px 0 0;
    background: rgba(255,255,255,0.12);
  }

  .step-line.completed {
    background: #dc0000;
  }

  .register-card {
    width: 100%;
    box-sizing: border-box;
    border: 1px solid rgba(220,0,0,0.3);
    border-radius: 18px;
    padding: clamp(1.2rem, 4vw, 2.5rem);
    background:
      linear-gradient(
        145deg,
        rgba(255,255,255,0.045),
        rgba(255,255,255,0.015)
      );
    box-shadow:
      0 25px 70px rgba(0,0,0,0.4),
      inset 0 1px 0 rgba(255,255,255,0.05);
  }

  .card-heading {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 0.7rem;
  }

  .card-number {
    width: 42px;
    height: 42px;
    flex: 0 0 auto;
    display: grid;
    place-items: center;
    border: 1px solid rgba(220,0,0,0.5);
    color: #dc0000;
    border-radius: 50%;
    font-family: 'Orbitron', sans-serif;
    font-size: 0.65rem;
    font-weight: 700;
  }

  .card-heading p {
    margin: 0 0 0.15rem;
    color: #dc0000;
    font-family: 'Orbitron', sans-serif;
    font-size: 0.55rem;
    letter-spacing: 0.15em;
  }

  .card-heading h2 {
    margin: 0;
    font-family: 'Anton', sans-serif;
    font-size: clamp(1.4rem, 4vw, 2rem);
    font-weight: 400;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .card-description {
    margin: 0 0 1.7rem;
    max-width: 720px;
    color: rgba(255,255,255,0.6);
    font-size: 0.9rem;
    line-height: 1.7;
  }

  .field-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0,1fr));
    gap: 1rem;
  }

  .register-field {
    min-width: 0;
    display: grid;
    gap: 0.45rem;
    margin-bottom: 1rem;
  }

  .field-label {
    color: rgba(255,255,255,0.82);
    font-family: 'Orbitron', sans-serif;
    font-size: 0.62rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .field-label b {
    color: #dc0000;
    margin-left: 0.25rem;
  }

  .register-field input,
  .register-field select {
    width: 100%;
    min-width: 0;
    min-height: 46px;
    box-sizing: border-box;
    border: 1px solid rgba(255,255,255,0.13);
    border-radius: 8px;
    outline: none;
    padding: 0.85rem 0.9rem;
    background: rgba(0,0,0,0.38);
    color: #ffffff;
    font-family: inherit;
    font-size: 0.88rem;
    transition: 0.2s ease;
  }

  .register-field input:focus,
  .register-field select:focus {
    border-color: rgba(220,0,0,0.75);
    box-shadow:
      0 0 0 3px rgba(220,0,0,0.08);
  }

  .register-field input::placeholder {
    color: rgba(255,255,255,0.3);
  }

  .register-field select option {
    background: #090909;
    color: #ffffff;
  }

  .field-error {
    color: #ff5b5b;
    font-size: 0.7rem;
    line-height: 1.4;
  }

  /*
  =========================================================
  EVENT SELECTION
  =========================================================
  */

  .event-selection {
    margin-top: 0.5rem;
  }

  .event-selection-title {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1rem;
  }

  .event-selection-title > span {
    color: rgba(255,255,255,0.8);
    font-family: 'Orbitron', sans-serif;
    font-size: 0.62rem;
    font-weight: 700;
    letter-spacing: 0.1em;
  }

  .event-selection-title small {
    color: #ff5b5b;
    font-size: 0.72rem;
  }

  .event-category {
    margin-bottom: 1.8rem;
  }

  .event-category-heading {
    margin-bottom: 0.8rem;
  }

  .event-category-heading h3 {
    margin: 0;
    color: #ffffff;
    font-family: 'Orbitron', sans-serif;
    font-size: 0.72rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .event-category-heading h3 span {
    margin-right: 0.45rem;
  }

  .event-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0,1fr));
    gap: 0.9rem;
  }

  .event-option {
    position: relative;
    width: 100%;
    min-width: 0;
    box-sizing: border-box;
    padding: 1rem;
    border: 1px solid rgba(255,255,255,0.11);
    border-radius: 12px;
    background: rgba(4,8,20,0.72);
    color: #ffffff;
    text-align: left;
    cursor: pointer;
    transition:
      border-color 0.2s ease,
      background 0.2s ease,
      transform 0.2s ease;
  }

  .event-option:hover {
    border-color: rgba(220,0,0,0.5);
    transform: translateY(-2px);
  }

  .event-option.selected {
    border-color: #dc0000;
    background:
      linear-gradient(
        135deg,
        rgba(220,0,0,0.11),
        rgba(220,0,0,0.025)
      );
    box-shadow:
      0 0 0 1px rgba(220,0,0,0.15);
  }

  .event-option-top {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 0.8rem;
  }

  .event-option h4 {
    margin: 0;
    font-family: 'Anton', sans-serif;
    font-size: 1.05rem;
    font-weight: 400;
    letter-spacing: 0.02em;
  }

  .event-radio {
    width: 22px;
    height: 22px;
    flex: 0 0 auto;
    display: grid;
    place-items: center;
    box-sizing: border-box;
    border: 2px solid rgba(255,255,255,0.22);
    border-radius: 50%;
    color: #ffffff;
    font-size: 0.7rem;
    font-weight: 800;
  }

  .event-radio.checked {
    border-color: #dc0000;
    background: #dc0000;
  }

  .event-description {
    margin: 0.6rem 0 0;
    color: rgba(255,255,255,0.48);
    font-size: 0.72rem;
    line-height: 1.45;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .event-option-bottom {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.7rem;
    margin-top: 0.85rem;
    padding-top: 0.7rem;
    border-top: 1px solid rgba(255,255,255,0.08);
  }

  .event-option-bottom strong {
    color: #f0a000;
    font-size: 0.9rem;
  }

  .event-option-bottom span {
    color: #00b889;
    font-size: 0.68rem;
  }

  .selected-event-card {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    margin: 1rem 0 1.3rem;
    padding: 1rem;
    border: 1px solid rgba(220,0,0,0.28);
    border-radius: 12px;
    background: rgba(220,0,0,0.04);
  }

  .selected-event-card span,
  .event-rule-badge span,
  .fee-summary span,
  .payment-summary span {
    display: block;
    margin-bottom: 0.35rem;
    color: rgba(255,255,255,0.45);
    font-family: 'Orbitron', sans-serif;
    font-size: 0.52rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  .selected-event-card h3 {
    margin: 0;
    color: #ffffff;
    font-family: 'Anton', sans-serif;
    font-size: 1.3rem;
    font-weight: 400;
    letter-spacing: 0.03em;
  }

  .selected-event-card p {
    margin: 0.2rem 0 0;
    color: #dc0000;
    font-size: 0.75rem;
  }

  .event-rule-badge {
    flex: 0 0 auto;
    padding: 0.75rem 0.9rem;
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 8px;
    text-align: right;
  }

  .event-rule-badge strong {
    color: #ffffff;
    font-size: 0.8rem;
  }

  .team-size-section {
    display: grid;
    grid-template-columns: minmax(0,1fr) minmax(0,1fr);
    gap: 1rem;
    align-items: start;
  }

  .team-info {
    margin-top: 1.55rem;
    padding: 0.85rem;
    border-left: 2px solid #dc0000;
    background: rgba(255,255,255,0.025);
  }

  .team-info strong {
    display: block;
    color: #ffffff;
    font-family: 'Orbitron', sans-serif;
    font-size: 0.65rem;
    letter-spacing: 0.05em;
  }

  .team-info span {
    display: block;
    margin-top: 0.35rem;
    color: rgba(255,255,255,0.52);
    font-size: 0.75rem;
    line-height: 1.5;
  }

  /*
  =========================================================
  TEAM MEMBER DETAILS
  =========================================================
  */

  .members-section {
    margin-top: 1.2rem;
    padding-top: 1.5rem;
    border-top: 1px solid rgba(255,255,255,0.08);
  }

  .members-heading {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    gap: 1rem;
  }

  .members-heading span {
    color: #dc0000;
    font-family: 'Orbitron', sans-serif;
    font-size: 0.55rem;
    letter-spacing: 0.12em;
  }

  .members-heading h3 {
    margin: 0.25rem 0 0;
    font-family: 'Anton', sans-serif;
    font-size: 1.4rem;
    font-weight: 400;
  }

  .members-heading strong {
    color: rgba(255,255,255,0.6);
    font-size: 0.75rem;
  }

  .members-note {
    margin: 0.5rem 0 1rem;
    color: rgba(255,255,255,0.5);
    font-size: 0.78rem;
    line-height: 1.5;
  }

  .member-card {
    margin-bottom: 0.9rem;
    padding: 1rem;
    border: 1px solid rgba(255,255,255,0.09);
    border-radius: 10px;
    background: rgba(0,0,0,0.22);
  }

  .member-number {
    margin-bottom: 0.8rem;
    color: rgba(255,255,255,0.5);
    font-family: 'Orbitron', sans-serif;
    font-size: 0.55rem;
    letter-spacing: 0.12em;
  }

  .member-card .register-field {
    margin-bottom: 0.8rem;
  }

  /*
  =========================================================
  FEE
  =========================================================
  */

  .fee-summary {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    margin-top: 1rem;
    padding: 1rem;
    border-top: 1px solid rgba(255,255,255,0.08);
    border-bottom: 1px solid rgba(255,255,255,0.08);
  }

  .fee-summary strong {
    color: #ffffff;
    font-size: 0.9rem;
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

  /*
  =========================================================
  PAYMENT
  =========================================================
  */

  .payment-summary {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1px;
    margin-bottom: 1.4rem;
    overflow: hidden;
    border: 1px solid rgba(255,255,255,0.09);
    border-radius: 10px;
    background: rgba(255,255,255,0.08);
  }

  .payment-summary > div {
    padding: 1rem;
    background: rgba(0,0,0,0.25);
  }

  .payment-summary strong {
    color: #ffffff;
    font-size: 0.85rem;
  }

  .payment-layout {
    display: grid;
    grid-template-columns: 0.85fr 1.15fr;
    gap: 1rem;
    margin-bottom: 1rem;
  }

  .qr-card,
  .gpay-card {
    min-width: 0;
    padding: 1.2rem;
    border: 1px solid rgba(255,255,255,0.09);
    border-radius: 12px;
    background: rgba(0,0,0,0.2);
  }

  .payment-label {
    display: block;
    margin-bottom: 1rem;
    color: #dc0000;
    font-family: 'Orbitron', sans-serif;
    font-size: 0.58rem;
    letter-spacing: 0.13em;
  }

  .qr-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .qr-wrapper {
    position: relative;
    width: min(250px, 100%);
    aspect-ratio: 1;
    display: grid;
    place-items: center;
    padding: 0.65rem;
    box-sizing: border-box;
    border-radius: 10px;
    background: #ffffff;
    margin-bottom: 0.9rem;
  }

  .qr-wrapper img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    border-radius: 5px;
  }

  .qr-missing-text {
    display: none;
    color: #111111;
    font-size: 0.8rem;
    font-weight: 700;
    text-align: center;
  }

  .qr-wrapper.qr-missing .qr-missing-text {
    display: block;
  }

  .qr-card > strong {
    font-family: 'Orbitron', sans-serif;
    font-size: 0.7rem;
    letter-spacing: 0.08em;
  }

  .gpay-card h3 {
    margin: 0 0 0.6rem;
    font-family: 'Anton', sans-serif;
    font-size: 1.5rem;
    font-weight: 400;
    letter-spacing: 0.03em;
  }

  .gpay-number {
    width: 100%;
    box-sizing: border-box;
    padding: 0.9rem;
    border: 1px solid rgba(220,0,0,0.35);
    border-radius: 8px;
    background: rgba(220,0,0,0.05);
    color: #ffffff;
    font-family: 'Orbitron', sans-serif;
    font-size: clamp(0.8rem, 2vw, 1rem);
    font-weight: 700;
    letter-spacing: 0.05em;
    overflow-wrap: anywhere;
  }

  .gpay-card > p {
    margin: 0.8rem 0;
    color: rgba(255,255,255,0.55);
    font-size: 0.8rem;
    line-height: 1.6;
  }

  .payment-important {
    padding: 0.8rem;
    border-left: 2px solid #dc0000;
    background: rgba(220,0,0,0.05);
  }

  .payment-important strong {
    color: #dc0000;
    font-family: 'Orbitron', sans-serif;
    font-size: 0.58rem;
    letter-spacing: 0.1em;
  }

  .payment-important p {
    margin: 0.35rem 0 0;
    color: rgba(255,255,255,0.65);
    font-size: 0.75rem;
    line-height: 1.5;
  }

  .payment-instructions {
    margin: 1rem 0;
    padding: 1rem;
    border: 1px solid rgba(220,0,0,0.25);
    border-radius: 10px;
    background: rgba(220,0,0,0.035);
  }

  .payment-instructions > span {
    color: #dc0000;
    font-family: 'Orbitron', sans-serif;
    font-size: 0.58rem;
    letter-spacing: 0.12em;
  }

  .payment-instructions ol {
    margin: 0.8rem 0 0;
    padding-left: 1.2rem;
    color: rgba(255,255,255,0.68);
    font-size: 0.8rem;
    line-height: 1.8;
  }

  /*
  =========================================================
  PROPER CLICKABLE PAYMENT CHECKBOX
  =========================================================
  */

  .payment-checkbox {
    display: flex;
    align-items: flex-start;
    gap: 0.8rem;
    margin-top: 0.8rem;
    padding: 1rem;
    border: 1px solid rgba(255,255,255,0.15);
    border-radius: 10px;
    cursor: pointer;
    background: rgba(255,255,255,0.025);
    transition:
      border-color 0.2s ease,
      background 0.2s ease;
  }

  .payment-checkbox:hover {
    border-color: rgba(220,0,0,0.5);
    background: rgba(220,0,0,0.035);
  }

  .payment-checkbox input {
    position: static;
    width: 20px;
    height: 20px;
    flex: 0 0 auto;
    margin: 1px 0 0;
    opacity: 1;
    pointer-events: auto;
    accent-color: #dc0000;
    cursor: pointer;
  }

  .payment-checkbox-error-state {
    border-color: #dc0000;
  }

  .checkbox-text {
    color: rgba(255,255,255,0.75);
    font-size: 0.8rem;
    line-height: 1.55;
    cursor: pointer;
  }

  .payment-checkbox-error {
    margin-top: 0.5rem;
  }

  .final-warning {
    margin-top: 1rem;
    padding: 1rem;
    border: 1px solid rgba(255,185,0,0.2);
    border-radius: 10px;
    background: rgba(255,185,0,0.035);
  }

  .final-warning strong {
    color: #ffffff;
    font-size: 0.8rem;
  }

  .final-warning p {
    margin: 0.35rem 0 0;
    color: rgba(255,255,255,0.58);
    font-size: 0.75rem;
    line-height: 1.6;
  }

  .free-event-box {
    padding: 1rem;
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 10px;
    background: rgba(255,255,255,0.025);
  }

  .free-event-box strong {
    color: #ffffff;
  }

  .free-event-box p {
    margin: 0.35rem 0 0;
    color: rgba(255,255,255,0.55);
    font-size: 0.8rem;
  }

  /*
  =========================================================
  LOADING / ERRORS
  =========================================================
  */

  .register-loading {
    padding: 1.5rem;
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 10px;
    color: rgba(255,255,255,0.55);
    text-align: center;
  }

  .register-error-box,
  .submit-error {
    margin-bottom: 1rem;
    padding: 1rem;
    border: 1px solid rgba(220,0,0,0.35);
    border-radius: 10px;
    background: rgba(220,0,0,0.06);
  }

  .register-error-box strong,
  .submit-error {
    color: #ff5b5b;
  }

  .register-error-box p {
    margin: 0.35rem 0;
    color: rgba(255,255,255,0.6);
    font-size: 0.8rem;
  }

  .register-error-box button {
    border: 0;
    padding: 0.5rem 0.8rem;
    border-radius: 6px;
    background: #dc0000;
    color: #ffffff;
    cursor: pointer;
  }

  /*
  =========================================================
  BUTTONS
  =========================================================
  */

  .step-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    margin-top: 1.5rem;
    padding-top: 1.3rem;
    border-top: 1px solid rgba(255,255,255,0.08);
  }

  .register-primary-btn,
  .register-secondary-btn {
    min-height: 46px;
    padding: 0.75rem 1.25rem;
    border-radius: 8px;
    font-family: 'Orbitron', sans-serif;
    font-size: 0.65rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    cursor: pointer;
    transition: 0.2s ease;
  }

  .register-primary-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.65rem;
    border: 1px solid #dc0000;
    background: #dc0000;
    color: #ffffff;
  }

  .register-primary-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    background: #f00000;
    box-shadow:
      0 12px 28px rgba(220,0,0,0.22);
  }

  .register-primary-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .register-secondary-btn {
    border: 1px solid rgba(255,255,255,0.2);
    background: transparent;
    color: rgba(255,255,255,0.75);
  }

  .register-secondary-btn:hover:not(:disabled) {
    border-color: rgba(255,255,255,0.45);
    color: #ffffff;
  }

  .register-submit {
    min-width: 230px;
  }

  /*
  =========================================================
  SUCCESS
  =========================================================
  */

  .register-success-section {
    min-height: 100vh;
    display: grid;
    place-items: center;
    box-sizing: border-box;
    padding: 2rem 1rem;
  }

  .register-success-card {
    width: 100%;
    max-width: 560px;
    box-sizing: border-box;
    padding: clamp(1.4rem, 5vw, 2.5rem);
    border: 1px solid rgba(220,0,0,0.35);
    border-radius: 18px;
    background: rgba(255,255,255,0.025);
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
    color: #ffffff;
    font-size: 1.5rem;
    font-weight: 800;
  }

  .register-success-card h1 {
    margin: 0;
    font-family: 'Anton', sans-serif;
    font-size: clamp(2rem, 7vw, 3rem);
    font-weight: 400;
    text-transform: uppercase;
  }

  .success-intro {
    margin: 0.7rem 0 1.5rem;
    color: rgba(255,255,255,0.6);
    font-size: 0.85rem;
  }

  .success-details {
    display: grid;
    gap: 0;
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 10px;
    overflow: hidden;
    text-align: left;
  }

  .success-details > div {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    padding: 0.85rem 1rem;
    border-bottom: 1px solid rgba(255,255,255,0.07);
  }

  .success-details > div:last-child {
    border-bottom: 0;
  }

  .success-details span {
    color: rgba(255,255,255,0.45);
    font-size: 0.72rem;
  }

  .success-details strong {
    color: #ffffff;
    font-size: 0.78rem;
    text-align: right;
    overflow-wrap: anywhere;
  }

  .success-warning {
    margin-top: 1rem;
    padding: 1rem;
    border: 1px solid rgba(255,185,0,0.22);
    border-radius: 10px;
    background: rgba(255,185,0,0.04);
    text-align: left;
  }

  .success-warning strong {
    color: #ffffff;
    font-size: 0.8rem;
  }

  .success-warning p {
    margin: 0.4rem 0 0;
    color: rgba(255,255,255,0.58);
    font-size: 0.75rem;
    line-height: 1.6;
  }

  .success-note {
    margin: 1rem 0 0;
    color: rgba(255,255,255,0.4);
    font-size: 0.7rem;
  }

  /*
  =========================================================
  RESPONSIVE
  =========================================================
  */

  @media (max-width: 768px) {
    .register-main {
      padding-top: 2.5rem;
    }

    .field-grid,
    .payment-layout,
    .team-size-section,
    .event-grid {
      grid-template-columns: 1fr;
    }

    .team-info {
      margin-top: 0;
    }

    .payment-summary {
      grid-template-columns: 1fr;
    }

    .selected-event-card {
      align-items: flex-start;
      flex-direction: column;
    }

    .event-rule-badge {
      width: 100%;
      box-sizing: border-box;
      text-align: left;
    }

    .register-submit {
      min-width: 0;
    }
  }

  @media (max-width: 560px) {
    .register-main {
      padding:
        2rem
        0.75rem
        3rem;
    }

    .register-heading {
      margin-bottom: 1.8rem;
    }

    .register-steps {
      margin-bottom: 1.5rem;
    }

    .register-step {
      min-width: 72px;
    }

    .step-circle {
      width: 38px;
      height: 38px;
      font-size: 0.58rem;
    }

    .register-step span:last-child {
      font-size: 0.48rem;
    }

    .step-line {
      margin-top: 19px;
    }

    .register-card {
      border-radius: 12px;
      padding: 1rem;
    }

    .card-heading {
      gap: 0.7rem;
    }

    .card-number {
      width: 34px;
      height: 34px;
      font-size: 0.55rem;
    }

    .card-description {
      font-size: 0.78rem;
    }

    .field-grid {
      gap: 0;
    }

    .register-field input,
    .register-field select {
      font-size: 16px;
    }

    .members-heading {
      align-items: flex-start;
      flex-direction: column;
    }

    .fee-summary {
      align-items: flex-start;
      flex-direction: column;
    }

    .fee-summary .total-fee {
      text-align: left;
    }

    .step-actions {
      align-items: stretch;
      flex-direction: column-reverse;
    }

    .register-primary-btn,
    .register-secondary-btn {
      width: 100%;
    }

    .payment-checkbox {
      padding: 0.85rem;
    }

    .success-details > div {
      align-items: flex-start;
      flex-direction: column;
      gap: 0.25rem;
    }

    .success-details strong {
      text-align: left;
    }
  }

  @media (max-width: 360px) {
    .register-main {
      padding-inline: 0.55rem;
    }

    .register-card {
      padding: 0.85rem;
    }

    .register-step {
      min-width: 60px;
    }

    .register-step span:last-child {
      font-size: 0.43rem;
    }

    .step-line {
      max-width: 45px;
    }
  }

  /* =========================================================
     MULTI-EVENT / DRAFT / REVIEW
  ========================================================= */

  .event-selection-note {
  margin: -0.2rem 0 1rem;
  padding: 1rem 1.1rem;
  border-left: 4px solid #f0a000;
  border-radius: 6px;
  background: rgba(240,160,0,0.14);
  color: #ffffff;
  font-size: 0.82rem;
  font-weight: 700;
  line-height: 1.6;
  box-shadow: 0 0 18px rgba(240,160,0,0.06);
}

  .event-selection-note strong {
    color: #ffffff;
  }

  .selected-events-count {
    color: #dc0000;
    font-family: 'Orbitron', sans-serif;
    font-size: 0.58rem;
    letter-spacing: 0.08em;
  }

  .selected-events-preview {
    margin-top: 1.25rem;
    padding: 1rem;
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 12px;
    background: rgba(255,255,255,0.018);
  }

  .selected-events-preview-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    margin-bottom: 0.8rem;
  }

  .selected-events-preview-header span {
    color: #dc0000;
    font-family: 'Orbitron', sans-serif;
    font-size: 0.58rem;
    letter-spacing: 0.12em;
  }

  .event-review-list {
    display: grid;
    gap: 0.55rem;
  }

  .event-review-item {
    display: grid;
    grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr) auto;
    gap: 0.75rem;
    align-items: center;
    padding: 0.75rem 0;
    border-bottom: 1px solid rgba(255,255,255,0.07);
  }

  .event-review-item:last-child {
    border-bottom: 0;
  }

  .event-review-name {
    color: #ffffff;
    font-family: 'Orbitron', sans-serif;
    font-size: 0.65rem;
    font-weight: 700;
  }

  .event-review-meta {
    color: rgba(255,255,255,0.5);
    font-size: 0.68rem;
    line-height: 1.45;
  }

  .event-review-fee {
    color: #f0a000;
    font-size: 0.78rem;
    font-weight: 700;
    text-align: right;
  }

  .review-total {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    margin-top: 0.75rem;
    padding-top: 0.8rem;
    border-top: 1px solid rgba(255,255,255,0.1);
  }

  .review-total span {
    color: rgba(255,255,255,0.5);
    font-family: 'Orbitron', sans-serif;
    font-size: 0.58rem;
    letter-spacing: 0.1em;
  }

  .review-total strong {
    color: #dc0000;
    font-family: 'Anton', sans-serif;
    font-size: 1.45rem;
    font-weight: 400;
  }

  .remember-details {
    display: flex;
    align-items: flex-start;
    gap: 0.7rem;
    margin-top: 0.25rem;
    padding: 0.85rem 0.9rem;
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 9px;
    background: rgba(255,255,255,0.018);
    cursor: pointer;
  }

  .remember-details input {
    width: 18px;
    height: 18px;
    flex: 0 0 auto;
    margin: 1px 0 0;
    accent-color: #dc0000;
    cursor: pointer;
  }

  .remember-details-text {
    display: grid;
    gap: 0.18rem;
    color: rgba(255,255,255,0.7);
    font-size: 0.76rem;
    line-height: 1.45;
    cursor: pointer;
  }

  .remember-details-text strong {
    color: #ffffff;
    font-size: 0.75rem;
  }

  .success-event-list {
    display: grid;
    gap: 0.5rem;
    text-align: left;
  }

  .success-event-item {
    padding: 0.7rem 0.8rem;
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 8px;
  }

  .success-event-item strong {
    display: block;
    color: #ffffff;
    font-size: 0.78rem;
  }

  .success-event-item span {
    display: block;
    margin-top: 0.2rem;
    color: rgba(255,255,255,0.45);
    font-size: 0.68rem;
  }

  @media (max-width: 560px) {
    .event-review-item {
      grid-template-columns: 1fr auto;
    }

    .event-review-meta {
      grid-column: 1 / -1;
      grid-row: 2;
    }

    .event-review-fee {
      grid-column: 2;
      grid-row: 1;
    }

    .selected-events-preview-header {
      align-items: flex-start;
      flex-direction: column;
    }
  }

  /* =========================================================
     PER-EVENT PARTICIPANT DETAILS
  ========================================================= */

  .selected-event-details-list {
    display: grid;
    gap: 1rem;
    margin-top: 1.2rem;
  }

  .selected-event-detail-card {
    padding: 1rem;
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 12px;
    background: rgba(0,0,0,0.2);
  }

  .selected-event-detail-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 1rem;
    margin-bottom: 1rem;
    padding-bottom: 0.85rem;
    border-bottom: 1px solid rgba(255,255,255,0.08);
  }

  .selected-event-detail-header > div:first-child {
    min-width: 0;
  }

  .selected-event-detail-kicker {
    display: block;
    margin-bottom: 0.25rem;
    color: #dc0000;
    font-family: 'Orbitron', sans-serif;
    font-size: 0.52rem;
    letter-spacing: 0.12em;
  }

  .selected-event-detail-header h4 {
    margin: 0;
    color: #ffffff;
    font-family: 'Anton', sans-serif;
    font-size: 1.25rem;
    font-weight: 400;
    letter-spacing: 0.02em;
  }

  .selected-event-detail-schedule {
    margin: 0.3rem 0 0;
    color: rgba(255,255,255,0.55);
    font-size: 0.68rem;
    line-height: 1.45;
  }

  .selected-event-fee {
    flex: 0 0 auto;
    color: #f0a000;
    font-size: 0.8rem;
    font-weight: 700;
    text-align: right;
  }

  .selected-event-fee small {
    display: block;
    margin-bottom: 0.2rem;
    color: rgba(255,255,255,0.42);
    font-family: 'Orbitron', sans-serif;
    font-size: 0.48rem;
    letter-spacing: 0.08em;
  }

  .event-participant-selector {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    gap: 1rem;
    align-items: start;
  }

  .event-participant-info {
    margin-top: 1.55rem;
    padding: 0.85rem;
    border-left: 2px solid #dc0000;
    background: rgba(255,255,255,0.025);
  }

  .event-participant-info strong {
    display: block;
    color: #ffffff;
    font-family: 'Orbitron', sans-serif;
    font-size: 0.63rem;
    letter-spacing: 0.05em;
  }

  .event-participant-info span {
    display: block;
    margin-top: 0.35rem;
    color: rgba(255,255,255,0.52);
    font-size: 0.73rem;
    line-height: 1.5;
  }

  .event-members-section {
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid rgba(255,255,255,0.07);
  }

  .event-members-heading {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    margin-bottom: 0.75rem;
  }

  .event-members-heading h3 {
    margin: 0.25rem 0 0;
    color: #ffffff;
    font-family: 'Anton', sans-serif;
    font-size: 1.15rem;
    font-weight: 400;
    letter-spacing: 0.02em;
  }

  .event-members-heading strong {
    color: rgba(255,255,255,0.55);
    font-size: 0.68rem;
  }

  .event-member-card {
    margin-top: 0.75rem;
    padding: 0.9rem;
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 9px;
    background: rgba(0,0,0,0.18);
  }

  .event-member-card .member-number {
    margin-bottom: 0.7rem;
  }

  .bottom-timing-note {
  margin-top: 1.2rem;
  padding: 1rem 1.1rem;
  border-left: 4px solid #f0a000;
  border-radius: 6px;
  background: rgba(240,160,0,0.14);
  color: #ffffff;
  font-size: 0.82rem;
  font-weight: 700;
  line-height: 1.6;
  box-shadow: 0 0 18px rgba(240,160,0,0.06);
}

  .bottom-timing-note strong {
    color: #ffffff;
  }

  .event-review-participants {
    margin-top: 0.18rem;
    color: rgba(255,255,255,0.62);
    font-size: 0.65rem;
  }

  @media (max-width: 768px) {
    .event-participant-selector {
      grid-template-columns: 1fr;
    }

    .event-participant-info {
      margin-top: 0;
    }
  }

  @media (max-width: 560px) {
    .selected-event-detail-header {
      flex-direction: column;
    }

    .selected-event-fee {
      text-align: left;
    }

    .event-selection-note,
    .bottom-timing-note {
      font-size: 0.7rem;
    }
  }

`;