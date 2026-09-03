import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { createPortal } from "react-dom";

import SpiderWeb from "../components/navigation/SpiderWeb";
import SpiderVerseReveal from "../components/SpiderVerseReveal";
import { supabase } from "../services/supabase";
import { submitRegistration } from "../services/registrationService";
import eventData from "../data/eventData";
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
import { coordinatorDetails } from "../data/coordinatorDetails";

import RegistrationCard from "../components/registration/RegistrationCard";
import { toPng } from "html-to-image";

const DRAFT_KEY = "revibe26_registration_draft_v3";
const LEGACY_DRAFT_KEY = "revibe26_registration_draft_v2";

const PAYMENT_COORDINATOR_NUMBER = "+91 94869 76316";

const YEAR_OPTIONS = [
  { value: "", label: "Select year" },
  { value: "1st Year", label: "1st Year" },
  { value: "2nd Year", label: "2nd Year" },
  { value: "3rd Year", label: "3rd Year" },
  { value: "4th Year", label: "4th Year" },
];

function buildUpiParams(amount, note) {
  const params = new URLSearchParams({
    pa: paymentData.upiId,
    pn: "Abbas",
    am: String(amount),
    tn: note || "REVIBE 26 Registration",
    cu: "INR",
  });
  return params.toString();
}

function getUniversalUpiLink(amount, note) {
  return `upi://pay?${buildUpiParams(amount, note)}`;
}

const emptyMember = () => ({
  name: "",
  email: "",
  phone: "",
  college: "",
  department: "",
  year: "",
});

const emptyEventRegistration = () => ({
  teamSize: "1",
  teamName: "",
  members: [],
});

function hasMemberData(slug, eventRegistrations) {
  const reg = eventRegistrations[slug];
  if (!reg) return false;
  return (reg.members || []).some((m) => m.name?.trim());
}

function getEventConfig(slug) {
  return getRegistrationConfig(slug);
}

function getCoordinatorDetails(eventName) {
  return coordinatorDetails[eventName] || null;
}

function getEventFromData(slug) {
  return eventData.find((event) => event.slug === slug);
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

function parseEventTime(time) {
  const match = String(time || "").match(
    /(\d{1,2})(?::(\d{2}))?\s*(AM|PM)\s*[–-]\s*(\d{1,2})(?::(\d{2}))?\s*(AM|PM)/i
  );

  if (!match) return null;

  function toMinutes(hour, minute, period) {
    let normalizedHour = Number(hour) % 12;

    if (period.toUpperCase() === "PM") {
      normalizedHour += 12;
    }

    return normalizedHour * 60 + Number(minute || 0);
  }

  return {
    start: toMinutes(match[1], match[2], match[3]),
    end: toMinutes(match[4], match[5], match[6]),
  };
}

function eventsOverlap(firstEvent, secondEvent) {
  const firstTime = parseEventTime(getEventTime(firstEvent));
  const secondTime = parseEventTime(getEventTime(secondEvent));

  if (!firstTime || !secondTime) return false;

  return (
    firstTime.start < secondTime.end &&
    secondTime.start < firstTime.end
  );
}

function isEventTimingConflict(event, selectedSlugs, events) {
  const exemptSlugs = [
    "paper-presentation",
    "shark-tank",
  ];

  if (exemptSlugs.includes(event.slug)) return false;

  return selectedSlugs.some((selectedSlug) => {
    if (
      selectedSlug === event.slug ||
      exemptSlugs.includes(selectedSlug)
    ) {
      return false;
    }

    const selectedEvent = events.find(
      (item) => item.slug === selectedSlug
    );

    return selectedEvent && eventsOverlap(event, selectedEvent);
  });
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

  if (config.feeType === "per_team_tiered") {
    const tiers = config.feeTiers || {};
    const values = Object.values(tiers).filter(Boolean);
    return values.length > 0 ? Math.min(...values) : 0;
  }

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

      teamName:
        typeof details.teamName === "string"
          ? details.teamName
          : "",

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

    eventSlugs: [],
    eventRegistrations: {},

    rememberDetails: false,

    paymentScreenshotShared: false,
    referenceId: "",
  });

  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [timingConflict, setTimingConflict] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [submitted, setSubmitted] = useState(false);
  const [registrationNumbers, setRegistrationNumbers] = useState([]);

  const [showReveal, setShowReveal] = useState(false);
  const [revealKey, setRevealKey] = useState(0);
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [shareFile, setShareFile] = useState(null);

  const cardRefs = useRef([]);

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

        name:
          typeof saved.name === "string"
            ? saved.name
            : "",

        email:
          typeof saved.email === "string"
            ? saved.email
            : "",

        phone:
          typeof saved.phone === "string"
            ? saved.phone
            : "",

        college:
          typeof saved.college === "string"
            ? saved.college
            : "",

        department:
          typeof saved.department === "string"
            ? saved.department
            : "",

        year:
          typeof saved.year === "string"
            ? saved.year
            : "",

        eventRegistrations:
          normalizeEventRegistrations(
            saved.eventRegistrations
          ),

        rememberDetails: true,
      }));
    } catch (error) {
      console.warn(
        "Unable to restore saved registration details:",
        error
      );
    }
  }, []);

  /* =========================================================
     SAVE DETAILS ON DEVICE
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
      localStorage.setItem(
        DRAFT_KEY,
        JSON.stringify(draft)
      );
    } catch (error) {
      console.warn(
        "Unable to save registration details:",
        error
      );
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
        console.error(
          "Event loading error:",
          error
        );

        setEventsError(
          "Unable to load events right now. Please refresh the page."
        );

        setEvents([]);
      } else {
        const openEvents = (data ?? []).filter(
          (event) => {
            const registrationStatus =
              String(
                event.registration_status ?? ""
              ).toLowerCase();

            const eventStatus =
              String(
                event.status ?? ""
              ).toLowerCase();

            return (
              registrationStatus === "open" &&
              eventStatus !== "cancelled"
            );
          }
        );

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
    const eventSlug =
      searchParams.get("event");

    if (
      !eventSlug ||
      events.length === 0
    ) {
      return;
    }

    const exists = events.some(
      (event) =>
        event.slug === eventSlug
    );

    if (!exists) return;

    setForm((previous) => {
      const existingDetails =
        previous.eventRegistrations[
          eventSlug
        ] ||
        emptyEventRegistration();

      return {
        ...previous,

        eventSlugs: [eventSlug],

        eventRegistrations: {
          ...previous.eventRegistrations,

          [eventSlug]:
            existingDetails,
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
          events.find(
            (event) =>
              event.slug === slug
          ) ||
          getEventFromData(slug)
      )
      .filter(Boolean)
      .map(mergeEventData);
  }, [
    events,
    form.eventSlugs,
  ]);

  /* =========================================================
     EVENT-SPECIFIC TOTAL
  ========================================================= */

  const totalFee = useMemo(() => {
    return selectedEvents.reduce(
      (total, event) => {
        const details =
          form.eventRegistrations[
            event.slug
          ];

        const participantCount =
          Number(details?.teamSize) || 0;

        if (participantCount < 1) {
          return total;
        }

        return (
          total +
          getTotalFee(
            event.slug,
            participantCount
          )
        );
      },
      0
    );
  }, [
    selectedEvents,
    form.eventRegistrations,
  ]);

  /* =========================================================
     TEAM STATUS
  ========================================================= */

  const hasTeamEvent = useMemo(() => {
    return selectedEvents.some(
      (eventItem) => {
        const details =
          form.eventRegistrations[
            eventItem.slug
          ] ||
          emptyEventRegistration();

        return (
          Number(details.teamSize) > 1
        );
      }
    );
  }, [
    selectedEvents,
    form.eventRegistrations,
  ]);

  const teamEvent = useMemo(() => {
    return selectedEvents.find(
      (eventItem) => {
        const details =
          form.eventRegistrations[
            eventItem.slug
          ] ||
          emptyEventRegistration();

        return (
          Number(details.teamSize) > 1
        );
      }
    );
  }, [
    selectedEvents,
    form.eventRegistrations,
  ]);

  const teamName = useMemo(() => {
    if (!teamEvent) return "";

    return (
      form.eventRegistrations[
        teamEvent.slug
      ]?.teamName?.trim() || ""
    );
  }, [
    teamEvent,
    form.eventRegistrations,
  ]);

  const paymentNote = useMemo(() => {
    if (teamName) return `REVIBE 26 - ${teamName}`;
    return `REVIBE 26 - ${form.name || "Registration"}`;
  }, [teamName, form.name]);

  const getTeamGroups = () => {
    const teams = {};
    selectedEvents.forEach((eventItem) => {
      const details = form.eventRegistrations[eventItem.slug] || emptyEventRegistration();
      const participantCount = Number(details.teamSize) || 0;
      const isTeam = participantCount > 1;
      const teamKey = isTeam
        ? (details.teamName || `team-${eventItem.slug}`)
        : "__solo__";
      if (!teams[teamKey]) {
        teams[teamKey] = {
          teamName: isTeam ? details.teamName : null,
          isTeam,
        };
      }
      teams[teamKey].events = teams[teamKey].events || [];
      teams[teamKey].events.push({ eventItem, details });
    });
    return Object.values(teams);
  };

  const handleDownloadCard = async (index) => {
    const el = cardRefs.current[index];
    if (!el) return;
    try {
      const dataUrl = await toPng(el, {
        cacheBust: true,
        pixelRatio: 2,
      });
      const group = getTeamGroups()[index];
      const label = group?.isTeam
        ? group.teamName || "team"
        : form.name || "solo";
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `revibe26-${label}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Card download failed:", err);
    }
  };

  const handleShareCard = async () => {
    navigator.clipboard.writeText(
      "Hey I registered for REVIBE '26! It's your time to register now \u{1F525} revibeofficial.in"
    ).catch(() => {});
    if (shareFile && navigator.canShare && navigator.canShare({ files: [shareFile] })) {
      try {
        await navigator.share({ files: [shareFile], title: "" });
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Card share failed:", err);
        }
      }
    }
  };

  useEffect(() => {
    if (!submitted) return;
    const el = cardRefs.current[activeCardIndex];
    if (!el) return;
    let cancelled = false;
    (async () => {
      try {
        const dataUrl = await toPng(el, { cacheBust: true, pixelRatio: 2 });
        const res = await fetch(dataUrl);
        const blob = await res.blob();
        if (cancelled) return;
        const group = getTeamGroups()[activeCardIndex];
        const label = group?.isTeam
          ? group.teamName || "team"
          : form.name || "solo";
        setShareFile(new File([blob], `revibe26-${label}.png`, {
          type: "image/png",
          lastModified: Date.now(),
        }));
      } catch (err) {
        console.error("Pre-render share card failed:", err);
      }
    })();
    return () => { cancelled = true; };
  }, [submitted, activeCardIndex]);

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
    const exists = events.some(
      (event) =>
        event.slug === slug
    );

    if (!exists) return;

    const alreadySelected =
      form.eventSlugs.includes(slug);

    if (alreadySelected) {
      setForm((previous) => ({
        ...previous,

        eventSlugs:
          previous.eventSlugs.filter(
            (item) => item !== slug
          ),

        paymentScreenshotShared:
          false,

        referenceId: "",
      }));
    } else {
      const newEvent = events.find(
        (e) => e.slug === slug
      );

      if (newEvent) {
        const newTime = getEventTime(
          newEvent
        );

        const conflicting =
          form.eventSlugs
            .map((s) =>
              events.find(
                (e) => e.slug === s
              )
            )
            .filter(
              (e) =>
                e &&
                getEventTime(e) === newTime
            );

        if (conflicting.length > 0) {
          setTimingConflict({
            time: newTime,
            events: [
              newEvent.name,
              ...conflicting.map(
                (e) => e.name
              ),
            ],
          });
          setTimeout(
            () => setTimingConflict(null),
            4000
          );
        }
      }

      setForm((previous) => {
        const restoredDetails =
          previous.eventRegistrations[
            slug
          ] ||
          emptyEventRegistration();

        const config = getEventConfig(slug);
        const min = Number(config?.minTeamSize) || 1;

        const needsMinAdjust =
          Number(restoredDetails.teamSize) < min;

        return {
          ...previous,

          eventSlugs: [
            ...previous.eventSlugs,
            slug,
          ],

          eventRegistrations: {
            ...previous.eventRegistrations,

            [slug]: needsMinAdjust
              ? { ...restoredDetails, teamSize: String(min) }
              : restoredDetails,
          },

          paymentScreenshotShared:
            false,

          referenceId: "",
        };
      });
    }

    setErrors({});
    setSubmitError("");
  }

  /* =========================================================
     EVENT PARTICIPANT COUNT
  ========================================================= */

  function handleEventParticipantCountChange(
    slug,
    value
  ) {
    const event =
      selectedEvents.find(
        (item) =>
          item.slug === slug
      );

    if (!event) return;

    const range =
      getEventParticipantRange(
        event
      );

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
        previous.eventRegistrations[
          slug
        ] ||
        emptyEventRegistration();

      const members = [
        ...(previousDetails.members || []),
      ];

      while (
        members.length <
        size - 1
      ) {
        members.push(
          emptyMember()
        );
      }

      members.length =
        size - 1;

      return {
        ...previous,

        eventRegistrations: {
          ...previous.eventRegistrations,

          [slug]: {
            ...previousDetails,

            teamSize: size,

            /*
             * Keep existing team name when
             * changing participant count.
             *
             * If changed back to solo,
             * the name remains in draft but
             * is ignored during validation.
             */
            teamName:
              size > 1
                ? previousDetails.teamName ||
                  ""
                : previousDetails.teamName ||
                  "",

            members,
          },
        },
      };
    });

    setErrors((previous) => ({
      ...previous,

      [`event-${slug}-teamSize`]:
        "",

      [`event-${slug}-teamName`]:
        "",
    }));

    setSubmitError("");
  }

  /* =========================================================
     TEAM NAME UPDATE
  ========================================================= */

  function handleEventTeamNameChange(
    slug,
    value
  ) {
    setForm((previous) => {
      const previousDetails =
        previous.eventRegistrations[
          slug
        ] ||
        emptyEventRegistration();

      return {
        ...previous,

        eventRegistrations: {
          ...previous.eventRegistrations,

          [slug]: {
            ...previousDetails,
            teamName: value,
          },
        },
      };
    });

    setErrors((previous) => ({
      ...previous,

      [`event-${slug}-teamName`]:
        "",
    }));

    setSubmitError("");
  }

  /* =========================================================
     EVENT MEMBER UPDATE
  ========================================================= */

  function updateEventMember(
    slug,
    index,
    field,
    value
  ) {
    setForm((previous) => {
      const previousDetails =
        previous.eventRegistrations[
          slug
        ] ||
        emptyEventRegistration();

      const members = [
        ...(previousDetails.members || []),
      ];

      if (!members[index]) {
        members[index] =
          emptyMember();
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

      [`event-${slug}-member-${index}-${field}`]:
        "",
    }));

    setSubmitError("");
  }

  function copyTeamFromEvent(sourceSlug, targetSlug) {
    setForm((previous) => {
      const source =
        previous.eventRegistrations[sourceSlug] ||
        emptyEventRegistration();
      const target =
        previous.eventRegistrations[targetSlug] ||
        emptyEventRegistration();
      const targetSize = Number(target.teamSize) || 1;

      const members = [...(source.members || [])];
      while (members.length < targetSize - 1)
        members.push(emptyMember());
      members.length = targetSize - 1;

      return {
        ...previous,
        eventRegistrations: {
          ...previous.eventRegistrations,
          [targetSlug]: {
            ...target,
            teamName: source.teamName || "",
            members,
          },
        },
      };
    });
  }

  /* =========================================================
     PERSONAL VALIDATION
  ========================================================= */

  function validatePersonalInfoStep() {
    const nextErrors = {};

    const validators = [
      [
        "name",
        validateName(form.name),
      ],
      [
        "email",
        validateEmail(form.email),
      ],
      [
        "phone",
        validatePhone(form.phone),
      ],
      [
        "college",
        validateCollege(form.college),
      ],
      [
        "department",
        validateDepartment(
          form.department
        ),
      ],
      [
        "year",
        validateYear(form.year),
      ],
    ];

    validators.forEach(
      ([field, error]) => {
        if (error) {
          nextErrors[field] =
            error;
        }
      }
    );

    setErrors(nextErrors);

    return (
      Object.keys(
        nextErrors
      ).length === 0
    );
  }

  /* =========================================================
     TEAM NAME VALIDATION
  ========================================================= */

  function validateTeamName(
    slug,
    details,
    participantCount,
    nextErrors
  ) {
    if (participantCount <= 1) {
      return;
    }

    const teamNameValue =
      String(
        details.teamName || ""
      ).trim();

    if (!teamNameValue) {
      nextErrors[
        `event-${slug}-teamName`
      ] =
        "Team name is required when registering more than one participant.";

      return;
    }

    if (teamNameValue.length < 2) {
      nextErrors[
        `event-${slug}-teamName`
      ] =
        "Team name must contain at least 2 characters.";

      return;
    }

    if (teamNameValue.length > 100) {
      nextErrors[
        `event-${slug}-teamName`
      ] =
        "Team name must not exceed 100 characters.";
    }
  }

  /* =========================================================
     EVENT + PARTICIPANT VALIDATION
  ========================================================= */

  function validateEventSelectionStep() {
    const nextErrors = {};

    if (
      form.eventSlugs.length ===
      0
    ) {
      nextErrors.eventSlug =
        "Please select at least one event.";
    }

    for (const slug of form.eventSlugs) {
      const event =
        selectedEvents.find(
          (item) =>
            item.slug === slug
        );

      if (!event) continue;

      const eventError =
        validateEvent(slug);

      if (eventError) {
        nextErrors.eventSlug =
          eventError;

        break;
      }

      const range =
        getEventParticipantRange(
          event
        );

      const details =
        form.eventRegistrations[
          slug
        ] ||
        emptyEventRegistration();

      const participantCount =
        Number(details.teamSize) ||
        0;

      if (!details.teamSize) {
        nextErrors[
          `event-${slug}-teamSize`
        ] =
          "Please select the number of participants for this event.";

        continue;
      }

      if (
        participantCount <
          range.min ||
        participantCount >
          range.max
      ) {
        nextErrors[
          `event-${slug}-teamSize`
        ] =
          `Select between ${range.min} and ${range.max} participants for this event.`;

        continue;
      }

      validateTeamName(
        slug,
        details,
        participantCount,
        nextErrors
      );

      const expectedMembers =
        Math.max(
          0,
          participantCount - 1
        );

      const members =
        Array.isArray(
          details.members
        )
          ? details.members
          : [];

      if (
        members.length <
        expectedMembers
      ) {
        nextErrors[
          `event-${slug}-teamSize`
        ] =
          `Please provide details for all ${expectedMembers} additional team member(s).`;

        continue;
      }

      if (expectedMembers > 0) {
        const memberErrors =
          validateTeamMembers(
            members,
            form.email,
            participantCount
          );

        Object.entries(
          memberErrors || {}
        ).forEach(
          ([key, message]) => {
            const indexMatch =
              String(key).match(
                /member-(\d+)-(.+)/
              );

            if (indexMatch) {
              const [
                ,
                index,
                field,
              ] = indexMatch;

              nextErrors[
                `event-${slug}-member-${index}-${field}`
              ] = message;
            } else {
              nextErrors[
                `event-${slug}-members`
              ] = message;
            }
          }
        );
      }
    }

    setErrors(nextErrors);

    return (
      Object.keys(
        nextErrors
      ).length === 0
    );
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

    if (
      !form.paymentScreenshotShared
    ) {
      nextErrors.paymentScreenshotShared =
        `Please confirm that you have sent the payment screenshot to our coordinator at ${PAYMENT_COORDINATOR_NUMBER}.`;
    }

    setErrors(nextErrors);

    return (
      Object.keys(
        nextErrors
      ).length === 0
    );
  }

  /* =========================================================
     COMPLETE VALIDATION
  ========================================================= */

  function validateCompleteRegistration() {
    const nextErrors = {};

    const personalValidators = [
      [
        "name",
        validateName(form.name),
      ],
      [
        "email",
        validateEmail(form.email),
      ],
      [
        "phone",
        validatePhone(form.phone),
      ],
      [
        "college",
        validateCollege(form.college),
      ],
      [
        "department",
        validateDepartment(
          form.department
        ),
      ],
      [
        "year",
        validateYear(form.year),
      ],
    ];

    personalValidators.forEach(
      ([field, error]) => {
        if (error) {
          nextErrors[field] =
            error;
        }
      }
    );

    if (
      form.eventSlugs.length ===
      0
    ) {
      nextErrors.eventSlug =
        "Please select at least one event.";
    }

    for (const slug of form.eventSlugs) {
      const event =
        selectedEvents.find(
          (item) =>
            item.slug === slug
        );

      if (!event) continue;

      const eventError =
        validateEvent(slug);

      if (eventError) {
        nextErrors.eventSlug =
          eventError;

        continue;
      }

      const range =
        getEventParticipantRange(
          event
        );

      const details =
        form.eventRegistrations[
          slug
        ] ||
        emptyEventRegistration();

      const participantCount =
        Number(details.teamSize) ||
        0;

      if (!details.teamSize) {
        nextErrors[
          `event-${slug}-teamSize`
        ] =
          "Please select the number of participants for this event.";

        continue;
      }

      if (
        participantCount <
          range.min ||
        participantCount >
          range.max
      ) {
        nextErrors[
          `event-${slug}-teamSize`
        ] =
          `Select between ${range.min} and ${range.max} participants for this event.`;

        continue;
      }

      validateTeamName(
        slug,
        details,
        participantCount,
        nextErrors
      );

      const expectedMembers =
        Math.max(
          0,
          participantCount - 1
        );

      const members =
        Array.isArray(
          details.members
        )
          ? details.members
          : [];

      if (
        members.length <
        expectedMembers
      ) {
        nextErrors[
          `event-${slug}-teamSize`
        ] =
          `Please provide details for all ${expectedMembers} additional team member(s).`;

        continue;
      }

      if (expectedMembers > 0) {
        const memberErrors =
          validateTeamMembers(
            members,
            form.email,
            participantCount
          );

        Object.entries(
          memberErrors || {}
        ).forEach(
          ([key, message]) => {
            const indexMatch =
              String(key).match(
                /member-(\d+)-(.+)/
              );

            if (indexMatch) {
              const [
                ,
                index,
                field,
              ] = indexMatch;

              nextErrors[
                `event-${slug}-member-${index}-${field}`
              ] = message;
            } else {
              nextErrors[
                `event-${slug}-members`
              ] = message;
            }
          }
        );
      }
    }

    if (
      totalFee > 0 &&
      !form.paymentScreenshotShared
    ) {
      nextErrors.paymentScreenshotShared =
        `Please confirm that you have sent the payment screenshot to our coordinator at ${PAYMENT_COORDINATOR_NUMBER}.`;
    }

    setErrors(nextErrors);

    return (
      Object.keys(
        nextErrors
      ).length === 0
    );
  }

  /* =========================================================
     NEXT / BACK
  ========================================================= */

  function handleNext() {
    if (step === 1) {
      if (
        !validatePersonalInfoStep()
      ) {
        scrollToError();
        return;
      }

      setStep(2);
      scrollTop();
      return;
    }

    if (step === 2) {
      if (
        !validateEventSelectionStep()
      ) {
        scrollToError();
        return;
      }

      setStep(3);
      scrollTop();
    }
  }

  function handleBack() {
    if (step === 1) return;

    setStep(
      (previous) =>
        previous - 1
    );

    setErrors({});
    setSubmitError("");

    scrollTop();
  }

  /* =========================================================
     FINAL SUBMISSION
  ========================================================= */

  async function handleSubmit(event) {
    event.preventDefault();

    if (
      !validateCompleteRegistration()
    ) {
      scrollToError();
      return;
    }

    if (
      selectedEvents.length === 0
    ) {
      setSubmitError(
        "Please select at least one event."
      );

      setStep(2);
      scrollTop();

      return;
    }

    setSubmitting(true);
    setSubmitError("");

    try {
      const primary = {
        fullName:
          form.name.trim(),

        email:
          form.email
            .trim()
            .toLowerCase(),

        phone:
          form.phone.trim(),

        college:
          form.college.trim(),

        department:
          form.department.trim(),

        year:
          form.year.trim(),
      };

      /* =====================================================
         EVENT-SPECIFIC REGISTRATION DATA
      ===================================================== */

      const eventRegistrations =
        selectedEvents.map(
          (eventItem) => {
            const details =
              form.eventRegistrations[
                eventItem.slug
              ] ||
              emptyEventRegistration();

            const members =
              Array.isArray(
                details.members
              )
                ? details.members
                : [];

            return {
              eventId:
                eventItem.id,

              maxParticipants:
                eventItem.max_participants ??
                eventItem.maxParticipants ??
                null,

              teamName:
                Number(
                  details.teamSize
                ) > 1
                  ? details.teamName
                      ?.trim() ||
                    null
                  : null,

              participants: [
                {
                  fullName:
                    primary.fullName,

                  email:
                    primary.email,

                  phone:
                    primary.phone,

                  college:
                    primary.college,

                  department:
                    primary.department,

                  year:
                    primary.year,
                },

                ...members.map(
                  (member) => ({
                    fullName:
                      member.name
                        ?.trim() ||
                      member.fullName
                        ?.trim() ||
                      "",

                    email:
                      member.email
                        ?.trim()
                        .toLowerCase() ||
                      "",

                    phone:
                      member.phone
                        ?.trim() ||
                      "",

                    college:
                      member.college
                        ?.trim() ||
                      "",

                    department:
                      member.department
                        ?.trim() ||
                      "",

                    year:
                      member.year
                        ?.trim() ||
                      "",
                  })
                ),
              ],
            };
          }
        );

      /* =====================================================
         REGISTRATION TYPE
      ===================================================== */

      const hasTeamEventSubmission =
        eventRegistrations.some(
          (event) =>
            event.participants
              .length > 1
        );

      const registrationType =
        hasTeamEventSubmission
          ? "team"
          : "individual";

      /* =====================================================
         ONE TEAM NAME FOR REGISTRATION
         
         Existing DB has:
         registrations.team_name
         
         Therefore use the team name from
         the first selected team event.
      ===================================================== */

      const combinedTeamName =
        eventRegistrations.find(
          (event) =>
            event.participants
              .length > 1
        )?.teamName || null;

      /* =====================================================
         SUBMIT REGISTRATION
      ===================================================== */

      const result =
        await submitRegistration({
          selectedEvents:
            selectedEvents.map(
              (eventItem) => ({
                id:
                  eventItem.id,

                maxParticipants:
                  eventItem.max_participants ??
                  eventItem.maxParticipants ??
                  null,
              })
            ),

          eventRegistrations,

          registrationType,

          teamName:
            combinedTeamName,

          primary,

          /*
           * Event-specific members are
           * handled through eventRegistrations.
           */
          members: [],

          payment: {
            amount:
              totalFee,

            paymentMethod:
              totalFee > 0
                ? paymentData.paymentMethod ||
                  "Google Pay"
                : null,

            transactionReference:
              form.referenceId
                .trim() ||
              null,

            screenshotShared:
              totalFee > 0
                ? form.paymentScreenshotShared
                : false,
          },
        });

      /* =====================================================
         SUCCESS
      ===================================================== */

      const number =
        result?.registrationNumber ||
        result?.registration_number ||
        "";

      setRegistrationNumbers(
        number
          ? [
              {
                eventName:
                  selectedEvents.length ===
                  1
                    ? selectedEvents[0]
                        .name
                    : `${selectedEvents.length} selected events`,

                registrationNumber:
                  number,

                registrationType:
                  registrationType,
              },
            ]
          : []
      );

      setSubmitted(true);
      setShowReveal(true);
      setRevealKey((k) => k + 1);

      if (
        !form.rememberDetails
      ) {
        localStorage.removeItem(
          DRAFT_KEY
        );

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
      <main className="reg-page">
        {showReveal && (
          <SpiderVerseReveal
            key={revealKey}
            onComplete={() => setShowReveal(false)}
          />
        )}

        <section className="register-success-section">
          <div className="reg-shell">
            <div className="register-success-card">
              <div className="success-icon">
                <SpiderWeb className="success-icon-web" />
                <svg className="success-icon-svg" viewBox="0 0 50 50" aria-hidden="true">
                  <circle className="suc-ck-ring" cx="25" cy="25" r="20"
                    fill="#dc0000" stroke="none" />
                  <path className="suc-ck-tick" d="M15 25 L22 32 L35 19"
                    fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round"
                    strokeLinejoin="round" pathLength="1" />
                </svg>
              </div>

              <p className="reg-kicker">
                <span className="reg-kicker-dot" />
                REVIBE '26
              </p>

              <h1>
                Registration Submitted
              </h1>

              <p className="success-intro">
                Your registration has
                been submitted
                successfully.
              </p>

              <div className="success-two-col">
                <div className="success-two-col-left">
              <div className="selected-events-preview">
                <div className="selected-events-preview-header">
                  <span>REGISTRATION SUMMARY</span>
                  <span>{selectedEvents.length} event{selectedEvents.length !== 1 ? "s" : ""}</span>
                </div>

                <div className="success-preview-info">
                  <div>
                    <span>Registration Type</span>
                    <strong>{hasTeamEvent ? "TEAM" : "SOLO"}</strong>
                  </div>

                  <div>
                    <span>{hasTeamEvent ? "Lead Name" : "Participant Name"}</span>
                    <strong>{form.name}</strong>
                  </div>

                  {registrationNumbers.length > 0 && (
                    <div>
                      <span>Registration No.</span>
                      <div className="success-event-list">
                        {registrationNumbers.map((item) => (
                          <div className="success-event-item" key={item.registrationNumber}>
                            <strong>{item.registrationNumber}</strong>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="event-review-list">
                  {selectedEvents.map((eventItem) => {
                    const details = form.eventRegistrations[eventItem.slug] || emptyEventRegistration();
                    const participantCount = Number(details.teamSize) || 0;
                    const eventFee = participantCount ? getTotalFee(eventItem.slug, participantCount) : 0;

                    return (
                      <div className="event-review-item" key={eventItem.id || eventItem.slug}>
                        <div>
                          <div className="event-review-name">{eventItem.name}</div>
                          <div className="event-review-meta">
                            {formatEventSchedule(eventItem)} • {getEventVenue(eventItem)}
                          </div>
                          <div className="event-review-participants">
                            Participants: {participantCount || "Not selected"}
                          </div>
                          {participantCount > 1 && details.teamName && (
                            <div className="event-review-team-name">Team: {details.teamName}</div>
                          )}
                          {participantCount > 1 && details.members?.length > 0 && (
                            <div className="event-review-members">
                              {details.members.map((m, i) => m.name ? (
                                <span key={i}>Member {i + 2}: {m.name}</span>
                              ) : null)}
                            </div>
                          )}
                        </div>
                        <div />
                        <div className="event-review-fee">₹{eventFee}</div>
                      </div>
                    );
                  })}
                </div>

                <div className="review-total">
                  <span>TOTAL AMOUNT TO BE PAID</span>
                  <strong>₹{totalFee}</strong>
                </div>
              </div>

              <div className="success-location-section">
                <p className="success-location-text">
                  Not sure where your event is? Check the venue on our campus map.
                </p>
                <Link to="/location" className="register-location-btn">
                  Location
                </Link>
              </div>
                </div>

                <div className="success-two-col-right">
              {/* =================================================
                  REGISTRATION CARDS
              ================================================= */}

              {(() => {
                const teamGroups = getTeamGroups();

                return (
                  <div className="reg-card-section">
                    <p className="reg-card-section-title">
                      Your Registration Card{teamGroups.length > 1 ? "s" : ""}
                    </p>

                    {teamGroups.length > 1 && (
                      <div className="reg-card-carousel">
                        <button
                          className="reg-card-nav-btn reg-card-nav-prev"
                          onClick={() => setActiveCardIndex((p) => p > 0 ? p - 1 : teamGroups.length - 1)}
                          type="button"
                          aria-label="Previous card"
                        >
                          ‹
                        </button>

                        <div className="reg-card-carousel-inner">
                          <div className="reg-card-wrapper" key={activeCardIndex}>
                            <RegistrationCard
                              ref={(el) => { cardRefs.current[activeCardIndex] = el; }}
                              name={form.name}
                              teamName={teamGroups[activeCardIndex].teamName}
                              type={teamGroups[activeCardIndex].isTeam ? "team" : "solo"}
                              events={teamGroups[activeCardIndex].events.map(({ eventItem: ev, details: d }) => ({
                                name: ev.name,
                                teamSize: d.teamSize,
                              }))}
                            />
                          </div>
                        </div>

                        <button
                          className="reg-card-nav-btn reg-card-nav-next"
                          onClick={() => setActiveCardIndex((p) => p < teamGroups.length - 1 ? p + 1 : 0)}
                          type="button"
                          aria-label="Next card"
                        >
                          ›
                        </button>
                      </div>
                    )}

                    {teamGroups.length > 1 && (
                      <div className="reg-card-dots">
                        {teamGroups.map((_, i) => (
                          <button
                            key={i}
                            className={`reg-card-dot ${i === activeCardIndex ? "reg-card-dot-active" : ""}`}
                            onClick={() => setActiveCardIndex(i)}
                            type="button"
                            aria-label={`Go to card ${i + 1}`}
                          />
                        ))}
                      </div>
                    )}

                    {teamGroups.length === 1 && (
                      <div className="reg-card-wrapper">
                        <RegistrationCard
                          ref={(el) => { cardRefs.current[0] = el; }}
                          name={form.name}
                          teamName={teamGroups[0].teamName}
                          type={teamGroups[0].isTeam ? "team" : "solo"}
                          events={teamGroups[0].events.map(({ eventItem: ev, details: d }) => ({
                            name: ev.name,
                            teamSize: d.teamSize,
                          }))}
                        />
                      </div>
                    )}

                    <div className="reg-card-actions">
                      <button
                        className="reg-card-download-btn"
                        onClick={() => handleDownloadCard(activeCardIndex)}
                        type="button"
                      >
                        ↓ Download
                      </button>

                      {typeof navigator !== "undefined" && navigator.share && (
                        <button
                          className="reg-card-share-btn"
                          onClick={handleShareCard}
                          type="button"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                            <circle cx="12" cy="12" r="4"/>
                            <circle cx="18" cy="6" r="1.5" fill="currentColor" stroke="none"/>
                          </svg>
                          Share to Story
                        </button>
                      )}
                    </div>

                    <p className="reg-card-share-hint">
                      Caption copied! After sharing, paste it as your story caption.
                    </p>
                  </div>
                );
              })()}
                </div>
              </div>

              {totalFee > 0 && (
                <div className="success-warning">
                  <strong>
                    Payment verification
                    pending
                  </strong>

                  <ol>
                    <li>
                      Your payment details have been submitted.
                    </li>

                    <li>
                      Our coordinator will verify your screenshot against the actual Google Pay transaction.
                    </li>

                    <li>
                      Your registration will be confirmed only after the payment is successfully verified.
                    </li>

                    <li>
                      After successful verification, you will be added to the respective whatsapp groups for your events.
                    </li>
                  </ol>
                </div>
              )}

              {totalFee === 0 && (
                <div className="success-warning">
                  <strong>
                    Registration submitted
                  </strong>

                  <p>
                    No payment is required for these events.
                  </p>
                </div>
              )}

              <p className="success-note">
                Please keep your
                registration number(s)
                safely for future
                reference.
              </p>
            </div>
          </div>
        </section>

        <style>
          {registerStyles}
        </style>
      </main>
    );
  }

  /* =========================================================
     MAIN PAGE
  ========================================================= */

  return (
    <>
      <main className="reg-page">
        <section className="reg-hero">
          <SpiderWeb className="reg-hero-web reg-hero-web--tl" />
          <SpiderWeb className="reg-hero-web reg-hero-web--br" />
          <div className="reg-shell">
            <div className="reg-hero-copy">
              <p className="reg-kicker">
                <span className="reg-kicker-dot" />
                Participant Registration
              </p>
              <h1 className="reg-hero-title">
                Register for REVIBE '26
              </h1>
              <p className="reg-hero-subtitle">
                Complete your registration in three
                simple steps.
              </p>
            </div>
          </div>
        </section>

        <section className="reg-main">
          <div className="reg-shell">
            <div
              className="reg-steps"
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
              title="Select Event"
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
              onSubmit={handleSubmit}
              noValidate
            >
              {/* =================================================
                  STEP 1
              ================================================= */}

              {step === 1 && (
                <section className="reg-card">
                  <div className="card-heading">
                    <span className="card-number">
                      01
                    </span>

                    <div>
                      <p>
                        STEP ONE
                      </p>

                      <h2>
                        Personal
                        Information
                      </h2>
                    </div>
                  </div>

                  <p className="card-description">
                    Enter your details
                    exactly as they
                    should appear on your
                    registration.
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
                        onChange={(event) =>
                          update(
                            "name",
                            event.target
                              .value
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
                        onChange={(event) =>
                          update(
                            "email",
                            event.target
                              .value
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
                        onChange={(event) =>
                          update(
                            "phone",
                            event.target.value.replace(
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
                        value={
                          form.college
                        }
                        onChange={(event) =>
                          update(
                            "college",
                            event.target
                              .value
                          )
                        }
                        placeholder="Enter your college name"
                        autoComplete="organization"
                      />
                    </Field>

                    <Field
                      label="Department"
                      required
                      error={
                        errors.department
                      }
                    >
                      <input
                        type="text"
                        value={
                          form.department
                        }
                        onChange={(event) =>
                          update(
                            "department",
                            event.target
                              .value
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
                      <CustomSelect
                        value={form.year}
                        onChange={(val) =>
                          update("year", val)
                        }
                        options={YEAR_OPTIONS}
                        placeholder="Select year"
                      />
                    </Field>
                  </div>

                  <label className="remember-details">
                    <input
                      type="checkbox"
                      checked={
                        form.rememberDetails
                      }
                      onChange={(event) =>
                        update(
                          "rememberDetails",
                          event.target
                            .checked
                        )
                      }
                    />

                    <span className="remember-details-text">
                      <strong>
                        Remember my details
                        on this device
                      </strong>

                      <span>
                        Your participant and
                        event member details
                        will be saved locally
                        so you can continue
                        later.
                      </span>
                    </span>
                  </label>

                  <div className="step-actions">
                    <span />

                    <button
                      type="button"
                      className="register-primary-btn"
                      onClick={handleNext}
                    >
                      Continue
                    </button>
                  </div>
                </section>
              )}

              {/* =================================================
                  STEP 2
              ================================================= */}

              {step === 2 && (
                <section className="reg-card">
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
                    Select one or more
                    events. Each selected
                    event has its own
                    participant count and
                    team member details.
                  </p>

                  {eventsLoading && (
                    <div className="register-loading">
                      Loading available
                      events...
                    </div>
                  )}

                  {eventsError && (
                    <div className="register-error-box">
                      <strong>
                        Unable to load
                        events
                      </strong>

                      <p>
                        {eventsError}
                      </p>

                      <button
                        type="button"
                        onClick={() =>
                          window.location.reload()
                        }
                      >
                        Refresh
                      </button>
                    </div>
                  )}

                  {!eventsLoading &&
                    !eventsError && (
                      <>
                        <div className="event-selection">
                          <div className="event-selection-title">
                            <span>
                              SELECT ONE OR MORE
                              EVENTS
                            </span>

                            <span className="selected-events-count">
                              {
                                form
                                  .eventSlugs
                                  .length
                              }{" "}
                              selected
                            </span>
                          </div>

                          {errors.eventSlug && (
                            <p className="field-error">
                              {
                                errors.eventSlug
                              }
                            </p>
                          )}

                          {technicalEvents(
                            events
                          ).length >
                            0 && (
                            <EventCategory
                              title="Technical Events"
                              icon="🔧"
                              events={technicalEvents(
                                events
                              )}
                              allEvents={events}
                              selectedSlugs={
                                form.eventSlugs
                              }
                              onSelect={
                                handleEventChange
                              }
                            />
                          )}

                          {nonTechnicalEvents(
                            events
                          ).length >
                            0 && (
                            <EventCategory
                              title="Non-Technical Events"
                              icon="🎭"
                              events={nonTechnicalEvents(
                                events
                              )}
                              allEvents={events}
                              selectedSlugs={
                                form.eventSlugs
                              }
                              onSelect={
                                handleEventChange
                              }
                            />
                          )}

                          {events.length ===
                            0 && (
                            <div className="register-loading">
                              No events are
                              currently open
                              for
                              registration.
                            </div>
                          )}
                        </div>

                        {selectedEvents.length >
                          0 && (
                          <>
                            <div className="selected-event-card">
                              <div>
                                <span>
                                  SELECTED
                                  EVENTS
                                </span>

                                <h3>
                                  {
                                    selectedEvents.length
                                  }{" "}
                                  Event
                                  {selectedEvents.length !==
                                  1
                                    ? "s"
                                    : ""}
                                </h3>

                                <p>
                                  Select the
                                  participant
                                  count
                                  separately
                                  for each
                                  selected
                                  event.
                                </p>
                              </div>

                              <div className="event-rule-badge">
                                <span>
                                  PARTICIPANT
                                  LIMITS
                                </span>

                                <strong>
                                  Set separately
                                  per event
                                </strong>
                              </div>
                            </div>

                            <div className="selected-event-details-list">
                              {selectedEvents.map(
                                (
                                  eventItem
                                ) => {
                                  const range =
                                    getEventParticipantRange(
                                      eventItem
                                    );

                                  const details =
                                    form
                                      .eventRegistrations[
                                      eventItem
                                        .slug
                                    ] ||
                                    emptyEventRegistration();

                                  const participantCount =
                                    Number(
                                      details.teamSize
                                    ) ||
                                    0;

                                  const expectedMembers =
                                    Math.max(
                                      0,
                                      participantCount -
                                        1
                                    );

                                  const members =
                                    details.members ||
                                    [];

                                  const eventError =
                                    errors[
                                      `event-${eventItem.slug}-teamSize`
                                    ];

                                  const teamNameError =
                                    errors[
                                      `event-${eventItem.slug}-teamName`
                                    ];

                                  return (
                                    <div
                                      className="selected-event-detail-card"
                                      key={
                                        eventItem.id ||
                                        eventItem.slug
                                      }
                                    >
                                      <div className="selected-event-detail-header">
                                        <div>
                                          <span className="selected-event-detail-kicker">
                                            EVENT
                                            DETAILS
                                          </span>

                                          <h4>
                                            {
                                              eventItem.name
                                            }
                                          </h4>

                                          <p className="selected-event-detail-schedule">
                                            {formatEventSchedule(
                                              eventItem
                                            )}{" "}
                                            •{" "}
                                            {getEventVenue(
                                              eventItem
                                            )}
                                          </p>
                                        </div>

                                        <div className="selected-event-fee">
                                          <small>
                                            EVENT
                                            FEE
                                          </small>

                                          ₹
                                          {participantCount
                                            ? getTotalFee(
                                                eventItem.slug,
                                                participantCount
                                              )
                                            : getEventFee(
                                                eventItem
                                              )}
                                        </div>
                                      </div>

                                      <div className="event-participant-selector">
                                        <Field
                                          label="Number of Participants"
                                          required
                                          error={
                                            eventError
                                          }
                                        >
                                          <CustomSelect
                                            value={
                                              details.teamSize
                                            }
                                            onChange={(
                                              val
                                            ) =>
                                              handleEventParticipantCountChange(
                                                eventItem.slug,
                                                val
                                              )
                                            }
                                            options={[
                                              {
                                                value: "",
                                                label: "Select participant count",
                                              },
                                              ...Array.from(
                                                {
                                                  length:
                                                    range.max -
                                                    range.min +
                                                    1,
                                                },
                                                (
                                                  _,
                                                  index
                                                ) => {
                                                  const size =
                                                    range.min +
                                                    index;
                                                  return {
                                                    value: String(size),
                                                    label: `${size} ${size === 1 ? "Participant" : "Participants"}`,
                                                  };
                                                }
                                              ),
                                            ]}
                                            placeholder="Select participant count"
                                          />
                                        </Field>

                                        <div className="event-participant-info">
                                          <strong>
                                            Min:{" "}
                                            {
                                              range.min
                                            }{" "}
                                            | Max:{" "}
                                            {
                                              range.max
                                            }
                                          </strong>

                                          <span>
                                            Choose the
                                            actual
                                            number of
                                            participants
                                            for{" "}
                                            {
                                              eventItem.name
                                            }
                                            .
                                          </span>
                                        </div>
                                      </div>

                                      {/* =================================================
                                          TEAM DETAILS
                                      ================================================= */}

                                      {participantCount >
                                        1 && (
                                        <div className="event-members-section">
                                          <div className="team-name-field">
                                            <Field
                                              label="Team Name"
                                              required
                                              error={
                                                teamNameError
                                              }
                                            >
                                              <input
                                                type="text"
                                                value={
                                                  details.teamName ||
                                                  ""
                                                }
                                                onChange={(
                                                  event
                                                ) =>
                                                  handleEventTeamNameChange(
                                                    eventItem.slug,
                                                    event
                                                      .target
                                                      .value
                                                  )
                                                }
                                                placeholder="Enter your team name"
                                                maxLength={
                                                  100
                                                }
                                                autoComplete="off"
                                              />
                                            </Field>
                                          </div>

                                          <div className="event-members-heading">
                                            <div>
                                              <span className="selected-event-detail-kicker">
                                                TEAM
                                                DETAILS
                                              </span>

                                              <h3>
                                                TEAM
                                                MEMBER
                                                DETAILS
                                              </h3>
                                            </div>

                                            <strong>
                                              {
                                                participantCount
                                              }{" "}
                                              participants
                                              {" • "}
                                              {
                                                expectedMembers
                                              }{" "}
                                              additional
                                              member
                                              {expectedMembers !==
                                              1
                                                ? "s"
                                                : ""}
                                            </strong>
                                          </div>

                                          <p className="members-note">
                                            Enter the
                                            complete
                                            details of
                                            every
                                            additional
                                            participant
                                            for this
                                            event.
                                          </p>

                                          {(() => {
                                            const otherEventsWithData =
                                              selectedEvents.filter(
                                                (ev) =>
                                                  ev.slug !==
                                                    eventItem.slug &&
                                                  hasMemberData(
                                                    ev.slug,
                                                    form.eventRegistrations
                                                  )
                                              );

                                            if (
                                              otherEventsWithData.length === 0
                                            )
                                              return null;

                                            return (
                                              <div className="copy-team-banner">
                                                <span className="copy-team-label">
                                                  Team members
                                                  already
                                                  entered
                                                  for
                                                </span>

                                                <div className="copy-team-row">
                                                  <div className="copy-team-select-wrap">
                                                    <CustomSelect
                                                      value={""}
                                                      onChange={(val) => {
                                                        if (val)
                                                          copyTeamFromEvent(
                                                            val,
                                                            eventItem.slug
                                                          );
                                                      }}
                                                      options={otherEventsWithData.map(
                                                        (ev) => ({
                                                          value: ev.slug,
                                                          label: ev.name,
                                                        })
                                                      )}
                                                      placeholder="Select event..."
                                                    />
                                                  </div>
                                                </div>
                                              </div>
                                            );
                                          })()}

                                          {errors[
                                            `event-${eventItem.slug}-members`
                                          ] && (
                                            <p className="field-error">
                                              {
                                                errors[
                                                  `event-${eventItem.slug}-members`
                                                ]
                                              }
                                            </p>
                                          )}

                                          {members.map(
                                            (
                                              member,
                                              index
                                            ) => (
                                              <div
                                                className="event-member-card"
                                                key={`${eventItem.slug}-${index}`}
                                              >
                                                <div className="member-number">
                                                  MEMBER{" "}
                                                  {
                                                    index +
                                                    2
                                                  }
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
                                                      value={
                                                        member.name
                                                      }
                                                      onChange={(
                                                        event
                                                      ) =>
                                                        updateEventMember(
                                                          eventItem.slug,
                                                          index,
                                                          "name",
                                                          event
                                                            .target
                                                            .value
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
                                                      value={
                                                        member.email
                                                      }
                                                      onChange={(
                                                        event
                                                      ) =>
                                                        updateEventMember(
                                                          eventItem.slug,
                                                          index,
                                                          "email",
                                                          event
                                                            .target
                                                            .value
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
                                                      maxLength={
                                                        10
                                                      }
                                                      value={
                                                        member.phone
                                                      }
                                                      onChange={(
                                                        event
                                                      ) =>
                                                        updateEventMember(
                                                          eventItem.slug,
                                                          index,
                                                          "phone",
                                                          event.target.value.replace(
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
                                                        `event-${eventItem.slug}-member-${index}-college`
                                                      ]
                                                    }
                                                  >
                                                    <input
                                                      type="text"
                                                      value={
                                                        member.college
                                                      }
                                                      onChange={(
                                                        event
                                                      ) =>
                                                        updateEventMember(
                                                          eventItem.slug,
                                                          index,
                                                          "college",
                                                          event
                                                            .target
                                                            .value
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
                                                      value={
                                                        member.department
                                                      }
                                                      onChange={(
                                                        event
                                                      ) =>
                                                        updateEventMember(
                                                          eventItem.slug,
                                                          index,
                                                          "department",
                                                          event
                                                            .target
                                                            .value
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
                                                    <CustomSelect
                                                      value={
                                                        member.year
                                                      }
                                                      onChange={(
                                                        val
                                                      ) =>
                                                        updateEventMember(
                                                          eventItem.slug,
                                                          index,
                                                          "year",
                                                          val
                                                        )
                                                      }
                                                      options={
                                                        YEAR_OPTIONS
                                                      }
                                                      placeholder="Select year"
                                                    />
                                                  </Field>
                                                </div>
                                              </div>
                                            )
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  );
                                }
                              )}
                            </div>

                            <div className="fee-summary">
                              <div>
                                <span>
                                  REGISTRATION
                                  FEE
                                </span>

                                <strong>
                                  {selectedEvents.length ===
                                    1 &&
                                  selectedEvents[0]
                                    .slug &&
                                  Number(
                                    form
                                      .eventRegistrations[
                                      selectedEvents[0]
                                        .slug
                                    ]?.teamSize
                                  )
                                    ? getFeeLabel(
                                        selectedEvents[0]
                                          .slug
                                      )
                                    : `${selectedEvents.length} event(s) • per-event participant count`}
                                </strong>
                              </div>

                              <div className="total-fee">
                                <span>
                                  TOTAL
                                </span>

                                <strong>
                                  ₹{totalFee}
                                </strong>
                              </div>
                            </div>

              <div className="selected-events-preview">
                              <div className="selected-events-preview-header">
                                <span>
                                  REGISTRATION
                                  SUMMARY
                                </span>

                                <span>
                                  {
                                    selectedEvents.length
                                  }{" "}
                                  event
                                  {selectedEvents.length !==
                                  1
                                    ? "s"
                                    : ""}
                                </span>
                              </div>

                              <div className="event-review-list">
                                {selectedEvents.map(
                                  (
                                    eventItem
                                  ) => {
                                    const details =
                                      form
                                        .eventRegistrations[
                                        eventItem
                                          .slug
                                      ] ||
                                      emptyEventRegistration();

                                    const participantCount =
                                      Number(
                                        details.teamSize
                                      ) ||
                                      0;

                                    const eventFee =
                                      participantCount
                                        ? getTotalFee(
                                            eventItem.slug,
                                            participantCount
                                          )
                                        : 0;

                                    return (
                                      <div
                                        className="event-review-item"
                                        key={
                                          eventItem.id ||
                                          eventItem.slug
                                        }
                                      >
                                        <div>
                                          <div className="event-review-name">
                                            {
                                              eventItem.name
                                            }
                                          </div>

                                          <div className="event-review-meta">
                                            {formatEventSchedule(
                                              eventItem
                                            )}{" "}
                                            •{" "}
                                            {getEventVenue(
                                              eventItem
                                            )}
                                          </div>

                                          <div className="event-review-participants">
                                            Participants:{" "}
                                            {participantCount ||
                                              "Not selected"}
                                          </div>

                                          {participantCount >
                                            1 &&
                                            details.teamName && (
                                              <div className="event-review-team-name">
                                                Team:{" "}
                                                {
                                                  details.teamName
                                                }
                                              </div>
                                            )}
                                        </div>

                                        <div />

                                        <div className="event-review-fee">
                                          ₹
                                          {
                                            eventFee
                                          }
                                        </div>
                                      </div>
                                    );
                                  }
                                )}
                              </div>

                              <div className="review-total">
                                <span>
                                  TOTAL AMOUNT
                                  TO BE PAID
                                </span>

                                <strong>
                                  ₹{totalFee}
                                </strong>
                              </div>
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
                        selectedEvents.length ===
                          0
                      }
                    >
                      Continue
                    </button>
                  </div>
                </section>
              )}

              {/* =================================================
                  STEP 3
              ================================================= */}

              {step === 3 && (
                <section className="reg-card">
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
                    Complete the payment
                    using your default UPI app.
                  </p>

                  {selectedEvents.length >
                    0 && (
                    <div className="payment-summary">
                      <div>
                        <span>
                          EVENTS
                        </span>

                        <strong>
                          {
                            selectedEvents.length
                          }{" "}
                          selected
                        </strong>
                      </div>

                      <div>
                        <span>
                          PARTICIPANTS
                        </span>

                        <strong>
                          {selectedEvents.reduce(
                            (
                              total,
                              eventItem
                            ) => {
                              const count =
                                Number(
                                  form
                                    .eventRegistrations[
                                    eventItem
                                      .slug
                                  ]?.teamSize
                                );

                              return (
                                total +
                                (count ||
                                  0)
                              );
                            },
                            0
                          )}{" "}
                          total selections
                        </strong>
                      </div>

                      <div>
                        <span>
                          TOTAL AMOUNT
                        </span>

                        <strong>
                          ₹{totalFee}
                        </strong>
                      </div>
                    </div>
                  )}

                  {selectedEvents.length >
                    1 && (
                    <div className="multi-payment-events">
                      {selectedEvents.map(
                        (eventItem) => {
                          const details =
                            form
                              .eventRegistrations[
                              eventItem
                                .slug
                            ] ||
                            emptyEventRegistration();

                          const participantCount =
                            Number(
                              details.teamSize
                            ) ||
                            0;

                          return (
                            <div
                              className="multi-payment-event"
                              key={
                                eventItem.id ||
                                eventItem.slug
                              }
                            >
                              <strong>
                                {
                                  eventItem.name
                                }
                              </strong>

                              <span>
                                {
                                  participantCount
                                }{" "}
                                participant
                                {participantCount !==
                                1
                                  ? "s"
                                  : ""}{" "}
                                •{" "}
                                {formatEventSchedule(
                                  eventItem
                                )}{" "}
                                •{" "}
                                {getEventVenue(
                                  eventItem
                                )}{" "}
                                • ₹
                                {getTotalFee(
                                  eventItem.slug,
                                  participantCount
                                )}
                              </span>
                            </div>
                          );
                        }
                      )}
                    </div>
                  )}

                  {totalFee > 0 && (
                    <>
                      <div className="payment-instructions">
                        <span>
                          PAYMENT
                          INSTRUCTIONS
                        </span>

                        <ol>
                          <li>
                            <strong>
                              Complete the
                              required
                              payment using default
                              your UPI app 
                            </strong>
                          </li>

                          <li>
                            <strong>
                              Take a screenshot
                              of the successful
                              payment.
                            </strong>
                          </li>

                          <li>
                            <strong>
                              Send the payment
screenshot along with your regestired name  to our
coordinator on
WhatsApp:
                            </strong>

                            <div
                              className="abbas-payment-contact"
                            >
                              <strong>
                                Coordinator (Abbas) —{" "}
{
  PAYMENT_COORDINATOR_NUMBER
}
                              </strong>
                            </div>
                          </li>

                          <li className="payment-whatsapp-note">
                            <strong>
                              IMPORTANT — SEND ON WHATSAPP
                            </strong>

                            <span>Send the payment screenshot along with:</span>

                            <ol>
                              <li>Mobile number used for the GPay payment</li>
                              <li>Name / Lead Name</li>
                              <li>Registered Events</li>
                            </ol>
                          </li>

                          <li>
                            Our coordinator will verify
your screenshot
against the actual
Google Pay
transaction.
                          </li>

                          <li>
                            After sending the
                            screenshot, tick
                            the confirmation
                            checkbox below.
                          </li>

                          <li>
                            Click "Register for
                            the Event" to
                            submit your
                            registration.
                          </li>
                        </ol>
                      </div>

                      <div className="upi-pay-section">
                        <div
                          onClick={() => { window.location.href = getUniversalUpiLink(totalFee, paymentNote); }}
                          className="upi-pay-banner"
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => { if (e.key === 'Enter') window.location.href = getUniversalUpiLink(totalFee, paymentNote); }}
                        >
                          <img src="/Upi logos/upi-payment-icon.svg" alt="UPI" className="upi-banner-logo" />
                          <span className="upi-banner-text">PAY NOW</span>
                          <span className="upi-banner-arrow">→</span>
                        </div>
                        <p className="upi-banner-subtitle">Opens your default UPI app with ₹{totalFee} pre-filled</p>
                        <div className="upi-app-logos">
                          <img src="/Upi logos/google-pay-icon.svg" alt="GPay" className="upi-app-logo" />
                          <img src="/Upi logos/phonepe-icon.svg" alt="PhonePe" className="upi-app-logo" />
                          <img src="/Upi logos/bhim-app-icon.svg" alt="BHIM" className="upi-app-logo" />
                          <img src="/Upi logos/navi-team.png" alt="Navi" className="upi-app-logo" />
                        </div>
                      </div>

                      <div className="payment-or-divider">
                        <span>OR</span>
                      </div>

                      <div className="payment-layout">
                        <div className="qr-card">
                          <span className="payment-label">
                            SCAN TO PAY
                          </span>

                          <div className="qr-wrapper">
                            <img
                              src={
                                paymentData.qrImage
                              }
                              alt="Google Pay QR code"
                              onError={(
                                event
                              ) => {
                                event.currentTarget.style.display =
                                  "none";

                                event.currentTarget.parentElement.classList.add(
                                  "qr-missing"
                                );
                              }}
                            />

                            <span className="qr-missing-text">
                              GPay QR code
                              will appear
                              here.
                            </span>
                          </div>

                          <strong>
                            Google Pay
                          </strong>
                        </div>

                        <div className="payment-or-inline">OR</div>

                        <div className="gpay-card">
                          <span className="payment-label">
                            PAY USING GPAY
                          </span>

                          <h3>
                            GPay Number
                          </h3>

                          <div className="gpay-number">
                            {
                              paymentData.gpayNumber
                            }
                          </div>

                          <p>
                            Send exactly ₹
                            {totalFee} using
                            Google Pay.
                          </p>

                          <div className="payment-important">
                            <strong>
                              IMPORTANT
                            </strong>

                            <p>
                              Keep the
                              successful
                              payment
                              screenshot
                              after
                              completing the
                              payment.
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
                          checked={
                            form.paymentScreenshotShared
                          }
                          onChange={(event) =>
                            update(
                              "paymentScreenshotShared",
                              event.target
                                .checked
                            )
                          }
                        />

                        <span className="checkbox-text">
                          I confirm that I
have sent my
successful payment
screenshot to our coordinator
at{" "}
<strong>
  {
    PAYMENT_COORDINATOR_NUMBER
  }
</strong>
.
                        </span>
                      </label>

                      {errors.paymentScreenshotShared && (
                        <p className="field-error payment-checkbox-error">
                          {
                            errors.paymentScreenshotShared
                          }
                        </p>
                      )}

                      <div className="final-warning">
                        <strong>
                          IMPORTANT:
                          Registration is not
                          confirmed yet.
                        </strong>

                        <p>
                          Your registration is
                          currently pending
                          payment verification.
                          Our Coordinator will verify the
                          payment using your
                          screenshot and the
                          actual Google Pay
                          transaction. Once
                          your payment is
                          successfully
                          verified, your
                          registration will be
                          confirmed and you will be added to the respective whatsapp groups.
                        </p>
                      </div>
                    </>
                  )}

                  {totalFee === 0 && (
                    <div className="free-event-box">
                      <strong>
                        These events are
                        free.
                      </strong>

                      <p>
                        No payment is
                        required. You can
                        submit your
                        registration
                        directly.
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
                      onClick={handleBack}
                      disabled={
                        submitting
                      }
                    >
                      ← Back
                    </button>

                    <button
                      type="submit"
                      className="register-primary-btn register-submit"
                      disabled={
                        submitting
                      }
                    >
                      {submitting
                        ? "Submitting..."
                        : "Register for the Event"}
                    </button>
                  </div>
                </section>
              )}
            </form>
          </div>
        </section>
      </main>

      {timingConflict && (
        <div
          className="tc-toast"
          onClick={() => setTimingConflict(null)}
        >
          <span className="tc-toast-icon">⚠</span>
          <span className="tc-toast-text">
            You have selected events with the same timing!
          </span>
        </div>
      )}

      <style>
        {registerStyles}
      </style>
    </>
  );
}

/* =========================================================
   EVENT HELPERS
========================================================= */

function technicalEvents(
  events
) {
  return events.filter(
    (event) =>
      getCategory(event) ===
      "technical"
  );
}

function nonTechnicalEvents(
  events
) {
  return events.filter(
    (event) =>
      getCategory(event) ===
      "non_technical"
  );
}

/* =========================================================
   EVENT CATEGORY
========================================================= */

function EventCategory({
  title,
  icon,
  events,
  allEvents,
  selectedSlugs,
  onSelect,
}) {
  return (
    <div className="event-category">
      <div className="event-category-heading">
        <h3>
          <span>
            {icon}
          </span>

          {title}
        </h3>
      </div>

      <div className="event-grid">
        {events.map((event) => {
          const isSelected =
            selectedSlugs.includes(
              event.slug
            );

          const isTimingConflict =
            !isSelected &&
            isEventTimingConflict(
              event,
              selectedSlugs,
              allEvents
            );

          const fee =
            getEventFee(event);

          const range =
            getEventParticipantRange(
              event
            );

          return (
            <button
              type="button"
              key={
                event.id ||
                event.slug
              }
              className={`event-option ${
                isSelected
                  ? "selected"
                  : ""
              } ${
                isTimingConflict
                  ? "timing-conflict"
                  : ""
              }`}
              disabled={isTimingConflict}
              onClick={() => {
                if (!isTimingConflict) {
                  onSelect(event.slug);
                }
              }}
            >
              <div className="event-option-top">
                <h4>
                  {event.name}
                </h4>

                <span
                  className={`event-radio ${
                    isSelected
                      ? "checked"
                      : ""
                  }`}
                >
                  {isSelected
                    ? "✓"
                    : ""}
                </span>
              </div>

              {isTimingConflict && (
                <div className="event-timing-disabled">
                  <span className="event-timing-disabled-icon">⚠</span>
                  <span>
                    SAME EVENT TIMING
                    <br />
                    NOT AVAILABLE
                  </span>
                </div>
              )}

              {event.description && (
                <p className="event-description">
                  {
                    event.description
                  }
                </p>
              )}

              <p className="event-time-badge">
                {getEventTime(event)}
              </p>

              <div className="event-coordinator">
                {(() => {
                  const coordinator = getCoordinatorDetails(event.name);

                  if (!coordinator) {
                    return null;
                  }

                  return (
                    <>
                      <div className="event-coordinator-name">
                        <span>COORDINATOR</span>
                        <strong>{coordinator.name}</strong>
                      </div>

                      {coordinator.whatsapp && (
                        <a
                          href={`https://wa.me/91${String(
                            coordinator.whatsapp
                          ).replace(/\D/g, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="event-coordinator-phone"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <span>WHATSAPP</span>
                          <strong>{coordinator.whatsapp}</strong>
                        </a>
                      )}
                    </>
                  );
                })()}
              </div>

              <div className="event-option-bottom">
                <strong>
                  {fee > 0
                    ? `₹${fee}`
                    : "FREE"}
                </strong>

                <span>
                  {range.min === range.max
                    ? `Max ${range.max} ${range.max === 1 ? "participant" : "participants"}`
                    : `${range.min}-${range.max} participants`}
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
   CUSTOM SELECT
========================================================= */

function CustomSelect({
  value,
  onChange,
  options,
  placeholder,
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const dropRef = useRef(null);
  const [dropPos, setDropPos] = useState({
    top: 0,
    left: 0,
    width: 0,
  });

  useEffect(() => {
    function handleClick(e) {
      if (
        ref.current &&
        !ref.current.contains(e.target) &&
        dropRef.current &&
        !dropRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () =>
      document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    if (open && ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setDropPos({
        top: rect.bottom + window.scrollY + 4,
        left: rect.left,
        width: rect.width,
      });
    }
  }, [open]);

  const selected = options.find(
    (o) => String(o.value) === String(value)
  );

  return (
    <div className="cs-wrap" ref={ref}>
      <button
        type="button"
        className={`cs-trigger${open ? " cs-open" : ""}`}
        onClick={() => setOpen(!open)}
      >
        <span
          className={
            selected
              ? ""
              : "cs-placeholder"
          }
        >
          {selected
            ? selected.label
            : placeholder}
        </span>
        <span
          className={`cs-arrow${open ? " cs-arrow-open" : ""}`}
        >
          ▾
        </span>
      </button>
      {open &&
        createPortal(
          <ul
            ref={dropRef}
            className="cs-dropdown"
            style={{
              position: "absolute",
              top: dropPos.top,
              left: dropPos.left,
              width: dropPos.width,
              background: "#ffffff",
              zIndex: 9999,
            }}
          >
            {options.map((opt) => (
              <li key={opt.value}>
                <button
                  type="button"
                  className={`cs-option${
                    String(opt.value) ===
                    String(value)
                      ? " cs-selected"
                      : ""
                  }`}
                  onClick={() => {
                    onChange(opt.value);
                    setOpen(false);
                  }}
                >
                  {opt.label}
                </button>
              </li>
            ))}
          </ul>,
          document.body
        )}
    </div>
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
      className={`reg-step ${
        active
          ? "active"
          : ""
      } ${
        completed
          ? "completed"
          : ""
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
    const errorElement =
      document.querySelector(
        ".field-error"
      );

    if (errorElement) {
      errorElement.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, 50);
}

const registerStyles = `
  /* ═══════════════════════════════════════════════════════════════
     WEB-SLINGER MODERN — Register page
     Flat-Brutalist / Neo-Comic design system
     Off-white surface · 2px black borders · sharp corners ·
     hard offset shadows · Anton / Hanken Grotesk / JetBrains Mono
     8px grid · 12-col desktop (64px margin) · 4-col mobile (16px)
  ═══════════════════════════════════════════════════════════════ */

  .reg-page {
    width: 100%;
    background: #f5f5f5;
    color: #1a1a1a;
    overflow-x: hidden;
    font-family: 'Hanken Grotesk', sans-serif;
  }

  /* ═══ HERO ═══ */

  .reg-hero {
    position: relative;
    padding: 5rem 0 4.5rem;
    background: #f9f9f9;
    overflow: hidden;
    border-bottom: 2px solid #1a1a1a;
  }

  .reg-hero::before {
    content: "";
    position: absolute;
    inset: 0;
    background-image:
      repeating-linear-gradient(45deg, rgba(26,26,26,0.05) 0 1px, transparent 1px 28px),
      repeating-linear-gradient(-45deg, rgba(26,26,26,0.05) 0 1px, transparent 1px 28px);
    pointer-events: none;
  }

  .reg-hero-copy {
    text-align: center;
    position: relative;
    z-index: 1;
  }

  .reg-kicker {
    display: inline-flex;
    align-items: center;
    gap: 0.55rem;
    margin: 0 0 0.6rem;
    padding: 0.4rem 0.85rem;
    background: #1a1a1a;
    color: #ffffff;
    font-family: 'JetBrains Mono', monospace;
    font-weight: 700;
    font-size: 11px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
  }

  .reg-kicker-dot {
    width: 8px;
    height: 8px;
    background: #dc0000;
    display: inline-block;
  }

  .reg-hero-title {
    margin: 0;
    font-family: 'Anton', sans-serif;
    font-weight: 400;
    font-size: clamp(2rem, 6vw, 3.5rem);
    line-height: 1;
    letter-spacing: 0.04em;
    color: #0d0d0d;
    text-transform: uppercase;
  }

  .reg-hero-subtitle {
    margin: 0.8rem 0 0;
    font-family: 'Hanken Grotesk', sans-serif;
    font-size: 1.05rem;
    color: #3a3a3a;
  }

  /* ═══ SPIDER WEBS ═══ */

  .reg-hero-web {
    position: absolute;
    pointer-events: none;
    z-index: 0;
  }

  .reg-hero-web--tl {
    top: -60px;
    left: 16px;
    width: 260px;
    height: 260px;
    opacity: 0.5;
  }

  .reg-hero-web--br {
    bottom: 0;
    right: 0;
    width: 180px;
    height: 180px;
    transform: rotate(180deg);
    opacity: 0.35;
  }

  .reg-hero .reg-shell,
  .reg-main .reg-shell {
    position: relative;
    z-index: 1;
  }

  /* ═══ MAIN ═══ */

  .reg-main {
    width: 100%;
    padding: 3rem 0 5rem;
  }

  .reg-shell {
    width: 100%;
    max-width: 1280px;
    margin: 0 auto;
    padding-inline: 16px;
    box-sizing: border-box;
  }

  /* ═══ STEP INDICATOR ═══ */

  .reg-steps {
    width: 100%;
    display: flex;
    align-items: flex-start;
    justify-content: center;
    margin: 0 auto 2.2rem;
    max-width: 800px;
  }

  .reg-step {
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
    border: 1px solid rgba(220, 0, 0, 0.3);
    border-radius: 10px;
    display: grid;
    place-items: center;
    color: #dc0000;
    background: linear-gradient(180deg, #1a1a1a, #0d0d0d);
    font-family: 'Anton', sans-serif;
    font-size: 1rem;
    font-weight: 400;
    letter-spacing: 0.04em;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(220, 0, 0, 0.15);
  }

  .reg-step span:last-child {
    color: #6a6a6a;
    font-family: 'Anton', sans-serif;
    font-size: 0.7rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    text-align: center;
  }

  .reg-step.active .step-circle {
    border-color: rgba(220, 0, 0, 0.5);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2), 0 0 0 3px rgba(220, 0, 0, 0.2), inset 0 1px 0 rgba(220, 0, 0, 0.15);
  }

  .reg-step.active span:last-child {
    color: #dc0000;
    font-weight: 400;
  }

  .reg-step.completed .step-circle {
    border-color: rgba(220, 0, 0, 0.5);
    color: #dc0000;
  }

  .reg-step.completed span:last-child {
    color: #3a3a3a;
  }

  .step-line {
    flex: 1;
    height: 2px;
    max-width: 150px;
    margin: 23px 0 0;
    background: #d0d0d0;
  }

  .step-line.completed {
    background: #dc0000;
  }

  /* ═══ CARD ═══ */

  .reg-card {
    position: relative;
    width: 100%;
    box-sizing: border-box;
    border: 1px solid rgba(220, 0, 0, 0.35);
    border-radius: 16px;
    padding: clamp(1.2rem, 4vw, 2.5rem);
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.75), rgba(255, 255, 255, 0.55));
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.8);
    transition: box-shadow 0.2s ease, transform 0.2s ease;
  }

  .reg-card::after {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    border-radius: 16px 16px 0 0;
    background: linear-gradient(90deg, transparent, rgba(220, 0, 0, 0.5), transparent);
  }

  .reg-card > * {
    position: relative;
    z-index: 1;
  }

  .reg-card:hover,
  .reg-card:focus-within {
    transform: translateY(-3px);
    box-shadow: 0 14px 34px rgba(0, 0, 0, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.8);
  }

  .card-heading {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 0.7rem;
  }

  .card-number {
    width: 60px;
    height: 42px;
    flex: 0 0 auto;
    display: grid;
    place-items: center;
    border: 1px solid rgba(220, 0, 0, 0.3);
    color: white;
    background: linear-gradient(180deg, #1a1a1a, #0d0d0d);
    border-radius: 10px;
    font-family: 'Anton', sans-serif;
    font-size: 1rem;
    font-weight: 400;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(220, 0, 0, 0.15);
  }

  .card-heading p {
    margin: 0 0 0.15rem;
    color: #dc0000;
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.55rem;
    letter-spacing: 0.15em;
    text-transform: uppercase;
  }

  .card-heading h2 {
    margin: 0;
    font-family: 'Anton', sans-serif;
    font-size: clamp(1.4rem, 4vw, 2rem);
    font-weight: 400;
    line-height: 1.05;
    letter-spacing: 0.02em;
    text-transform: uppercase;
    color: #1a1a1a;
  }

  .card-description {
    margin: 0 0 1.7rem;
    max-width: 720px;
    color: #3a3a3a;
    font-family: 'Hanken Grotesk', sans-serif;
    font-size: 0.9rem;
    line-height: 1.7;
  }

  /* ═══ FIELDS ═══ */

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
    color: #1a1a1a;
    font-family: 'JetBrains Mono', monospace;
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
    border: 1px solid rgba(220, 0, 0, 0.25);
    border-radius: 8px;
    outline: none;
    padding: 0.85rem 0.9rem;
    background: rgba(255, 255, 255, 0.8);
    color: #1a1a1a;
    font-family: 'Hanken Grotesk', sans-serif;
    font-size: 0.88rem;
    transition: 0.2s ease;
  }

  .register-field select {
    appearance: none;
    -webkit-appearance: none;
    -moz-appearance: none;
    padding-right: 2.5rem;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236a6a6a' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 0.9rem center;
    background-size: 12px;
    cursor: pointer;
  }

  .register-field input:focus,
  .register-field select:focus {
    border-color: #dc0000;
    box-shadow: 0 0 0 3px rgba(220, 0, 0, 0.1);
  }

  .register-field input::placeholder {
    color: #999999;
  }

  .register-field select option {
    background: #ffffff;
    color: #1a1a1a;
  }

  .field-error {
    color: #dc0000;
    font-size: 0.7rem;
    line-height: 1.4;
    font-weight: 700;
  }

  /* ═══ CUSTOM SELECT ═══ */

  .cs-wrap {
    position: relative;
    z-index: 50;
  }

  .cs-trigger {
    width: 100%;
    min-height: 46px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
    box-sizing: border-box;
    border: 1px solid rgba(220, 0, 0, 0.25);
    border-radius: 8px;
    padding: 0.85rem 2.5rem 0.85rem 0.9rem;
    background: #ffffff;
    color: #1a1a1a;
    font-family: 'Hanken Grotesk', sans-serif;
    font-size: 0.88rem;
    cursor: pointer;
    text-align: left;
    transition: 0.2s ease;
  }

  .cs-trigger:hover {
    border-color: rgba(220, 0, 0, 0.45);
  }

  .cs-trigger.cs-open {
    border-color: #dc0000;
    box-shadow: 0 0 0 3px rgba(220, 0, 0, 0.1);
  }

  .cs-placeholder {
    color: #999999;
  }

  .cs-arrow {
    position: absolute;
    right: 0.9rem;
    top: 50%;
    transform: translateY(-50%);
    font-size: 0.8rem;
    color: #6a6a6a;
    transition: transform 0.2s ease;
    pointer-events: none;
  }

  .cs-arrow-open {
    transform: translateY(-50%) rotate(180deg);
  }

  .cs-dropdown {
    list-style: none;
    margin: 0;
    padding: 4px;
    border: 1px solid rgba(220, 0, 0, 0.35);
    border-radius: 10px;
    background: #ffffff;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
    max-height: 200px;
    overflow-y: auto;
  }

  .cs-dropdown li + li {
    margin-top: 2px;
  }

  .cs-option {
    width: 100%;
    display: block;
    padding: 0.55rem 0.85rem;
    border: none;
    border-radius: 6px;
    background: transparent;
    color: #1a1a1a;
    font-family: 'Hanken Grotesk', sans-serif;
    font-size: 0.88rem;
    text-align: left;
    cursor: pointer;
    transition: background 0.15s ease;
  }

  .cs-option:hover {
    background: rgba(220, 0, 0, 0.06);
  }

  .cs-option.cs-selected {
    background: rgba(220, 0, 0, 0.1);
    color: #dc0000;
    font-weight: 700;
  }

  .cs-dropdown::-webkit-scrollbar {
    width: 6px;
  }

  .cs-dropdown::-webkit-scrollbar-track {
    background: transparent;
  }

  .cs-dropdown::-webkit-scrollbar-thumb {
    background: rgba(220, 0, 0, 0.2);
    border-radius: 3px;
  }

  /* ═══ EVENT SELECTION ═══ */

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
    color: #1a1a1a;
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.62rem;
    font-weight: 700;
    letter-spacing: 0.1em;
  }

  .event-category {
    margin-bottom: 1.8rem;
  }

  .event-category-heading {
    margin-bottom: 0.8rem;
  }

  .event-category-heading h3 {
    margin: 0;
    color: #1a1a1a;
    font-family: 'JetBrains Mono', monospace;
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
    gap: 24px;
  }

  /* ═══ EVENT OPTION CARDS ═══ */

  .event-option {
    position: relative;
    width: 100%;
    min-width: 0;
    box-sizing: border-box;
    padding: 1rem;
    border: 1px solid rgba(220, 0, 0, 0.35);
    border-radius: 16px;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.75), rgba(255, 255, 255, 0.55));
    color: #1a1a1a;
    text-align: left;
    cursor: pointer;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.8);
    overflow: hidden;
    transition: border-color 0.2s ease, background 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;
  }

  .event-option::after {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, transparent, rgba(220, 0, 0, 0.5), transparent);
  }

  .event-option:hover {
    border-color: rgba(220, 0, 0, 0.6);
    transform: translateY(-3px);
    box-shadow: 0 14px 34px rgba(0, 0, 0, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.8);
  }

  .event-option.selected {
    border-color: #dc0000;
    box-shadow: 0 10px 30px rgba(220, 0, 0, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.8);
  }

  .event-option.timing-conflict {
    opacity: 0.5;
    border-color: rgba(26, 26, 26, 0.2);
    cursor: not-allowed;
    box-shadow: none;
  }

  .event-option.timing-conflict:hover {
    border-color: rgba(26, 26, 26, 0.2);
    transform: none;
    box-shadow: none;
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
    color: #1a1a1a;
    text-transform: uppercase;
  }

  .event-radio {
    width: 22px;
    height: 22px;
    flex: 0 0 auto;
    display: grid;
    place-items: center;
    box-sizing: border-box;
    border: 2px solid rgba(220, 0, 0, 0.35);
    border-radius: 50%;
    color: #1a1a1a;
    font-size: 0.7rem;
    font-weight: 800;
    background: #ffffff;
  }

  .event-radio.checked {
    border-color: #dc0000;
    background: #dc0000;
    color: #ffffff;
  }

  .event-description {
    margin: 0.6rem 0 0;
    color: #6a6a6a;
    font-family: 'Hanken Grotesk', sans-serif;
    font-size: 0.72rem;
    line-height: 1.45;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .event-time-badge {
    margin: 0.5rem 0 0;
    display: inline-block;
    padding: 0.2rem 0.5rem;
    border: 1px solid rgba(220, 0, 0, 0.25);
    border-radius: 6px;
    background: rgba(220, 0, 0, 0.04);
    color: #dc0000;
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.65rem;
    font-weight: 700;
    letter-spacing: 0.04em;
  }

  .event-timing-disabled {
    display: flex;
    align-items: flex-start;
    gap: 0.45rem;
    margin-top: 0.7rem;
    padding: 0.55rem 0.65rem;
    border-left: 3px solid #dc0000;
    background: rgba(220, 0, 0, 0.06);
    color: #dc0000;
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 0.06em;
    line-height: 1.45;
  }

  .event-timing-disabled-icon {
    flex-shrink: 0;
    font-size: 1rem;
    line-height: 1.2;
  }

  .event-coordinator {
    display: flex;
    flex-direction: column;
    gap: 0.45rem;
    margin-top: 0.85rem;
    padding: 0.7rem 0.8rem;
    border-left: 2px solid #dc0000;
    background: rgba(220, 0, 0, 0.035);
  }

  .event-coordinator-name,
  .event-coordinator-phone {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
  }

  .event-coordinator-name span,
  .event-coordinator-phone span {
    flex-shrink: 0;
    color: rgba(0, 0, 0, 0.48);
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.52rem;
    font-weight: 700;
    letter-spacing: 0.08em;
  }

  .event-coordinator-name strong,
  .event-coordinator-phone strong {
    color: #1a1a1a;
    font-family: 'Hanken Grotesk', sans-serif;
    font-size: 0.72rem;
    font-weight: 700;
    text-align: right;
  }

  .event-coordinator-phone {
    color: inherit;
    text-decoration: none;
  }

  .event-coordinator-phone strong {
    color: #dc0000;
  }

  .event-coordinator-phone:hover strong {
    text-decoration: underline;
  }

  @media (max-width: 480px) {
    .event-coordinator-name,
    .event-coordinator-phone {
      align-items: flex-start;
      flex-direction: column;
      gap: 0.15rem;
    }

    .event-coordinator-name strong,
    .event-coordinator-phone strong {
      text-align: left;
    }
  }

  .event-option-bottom {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.7rem;
    margin-top: 0.85rem;
    padding-top: 0.7rem;
    border-top: 1px solid rgba(220, 0, 0, 0.15);
  }

  .event-option-bottom strong {
    color: #dc0000;
    font-family: 'Anton', sans-serif;
    font-size: 0.9rem;
  }

  .event-option-bottom span {
    color: #3a3a3a;
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.68rem;
  }

  /* ═══ SELECTED EVENT ═══ */

  .selected-event-card {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    margin: 1rem 0 1.3rem;
    padding: 1rem;
    border: 1px solid rgba(220, 0, 0, 0.35);
    border-radius: 16px;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.75), rgba(255, 255, 255, 0.55));
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.8);
  }

  .selected-event-card span,
  .event-rule-badge span,
  .fee-summary span,
  .payment-summary span {
    display: block;
    margin-bottom: 0.35rem;
    color: #6a6a6a;
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.52rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  .selected-event-card h3 {
    margin: 0;
    color: #1a1a1a;
    font-family: 'Anton', sans-serif;
    font-size: 1.3rem;
    font-weight: 400;
    letter-spacing: 0.03em;
    text-transform: uppercase;
  }

  .selected-event-card p {
    margin: 0.2rem 0 0;
    color: #dc0000;
    font-size: 0.75rem;
  }

  .event-rule-badge {
    flex: 0 0 auto;
    padding: 0.75rem 0.9rem;
    border: 1px solid rgba(220, 0, 0, 0.25);
    border-radius: 10px;
    text-align: right;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.65), rgba(255, 255, 255, 0.45));
  }

  .event-rule-badge strong {
    color: #1a1a1a;
    font-size: 0.8rem;
  }

  .event-participant-selector {
    display: grid;
    grid-template-columns: minmax(0,1fr) minmax(0,1fr);
    gap: 1rem;
    align-items: start;
  }

  .event-participant-info {
    margin-top: 1.55rem;
    padding: 0.85rem;
    border-left: 3px solid #dc0000;
    border-radius: 0 8px 8px 0;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.6), rgba(255, 255, 255, 0.4));
  }

  .event-participant-info strong {
    display: block;
    color: #1a1a1a;
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.63rem;
    letter-spacing: 0.05em;
  }

  .event-participant-info span {
    display: block;
    margin-top: 0.35rem;
    color: #6a6a6a;
    font-size: 0.73rem;
    line-height: 1.5;
  }

  /* ═══ SELECTED EVENT DETAILS ═══ */

  .selected-event-details-list {
    display: grid;
    gap: 1rem;
    margin-top: 1.2rem;
  }

  .selected-event-detail-card {
    padding: 1rem;
    border: 1px solid rgba(220, 0, 0, 0.35);
    border-radius: 16px;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.75), rgba(255, 255, 255, 0.55));
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.8);
  }

  .selected-event-detail-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 1rem;
    margin-bottom: 1rem;
    padding-bottom: 0.85rem;
    border-bottom: 2px solid #1a1a1a;
  }

  .selected-event-detail-header > div:first-child {
    min-width: 0;
  }

  .selected-event-detail-kicker {
    display: block;
    margin-bottom: 0.25rem;
    color: #dc0000;
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.52rem;
    letter-spacing: 0.12em;
    font-weight: 700;
  }

  .selected-event-detail-header h4 {
    margin: 0;
    color: #1a1a1a;
    font-family: 'Anton', sans-serif;
    font-size: 1.25rem;
    font-weight: 400;
    letter-spacing: 0.02em;
    text-transform: uppercase;
  }

  .selected-event-detail-schedule {
    margin: 0.3rem 0 0;
    color: #6a6a6a;
    font-family: 'Hanken Grotesk', sans-serif;
    font-size: 0.68rem;
    line-height: 1.45;
  }

  .selected-event-fee {
    flex: 0 0 auto;
    color: #dc0000;
    font-family: 'Anton', sans-serif;
    font-size: 0.8rem;
    font-weight: 700;
    text-align: right;
  }

  .selected-event-fee small {
    display: block;
    margin-bottom: 0.2rem;
    color: #6a6a6a;
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.48rem;
    letter-spacing: 0.08em;
  }

  /* ═══ TEAM MEMBERS ═══ */

  .event-members-section {
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 2px solid #1a1a1a;
  }

  .team-name-field {
    margin-bottom: 0.5rem;
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
    color: #1a1a1a;
    font-family: 'Anton', sans-serif;
    font-size: 1.15rem;
    font-weight: 400;
    letter-spacing: 0.02em;
    text-transform: uppercase;
  }

  .event-members-heading strong {
    color: #6a6a6a;
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.68rem;
  }

  .members-note {
    margin: 0.5rem 0 0.75rem;
    color: #6a6a6a;
    font-family: 'Hanken Grotesk', sans-serif;
    font-size: 0.75rem;
  }

  .copy-team-banner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 0.5rem 0.75rem;
    padding: 0.65rem 0.85rem;
    margin-bottom: 0.75rem;
    border: 1px solid rgba(220, 0, 0, 0.2);
    border-radius: 10px;
    background: linear-gradient(135deg, rgba(255, 245, 245, 0.7), rgba(255, 235, 235, 0.5));
  }

  .copy-team-label {
    color: #6a6a6a;
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.58rem;
    letter-spacing: 0.08em;
  }

  .copy-team-row {
    width: 100%;
  }

  .copy-team-select-wrap {
    width: 100%;
  }

  .copy-team-select-wrap .cs-trigger {
    min-height: 38px;
    padding: 0.55rem 2.2rem 0.55rem 0.75rem;
    font-size: 0.75rem;
  }

  .copy-team-select-wrap .cs-option {
    padding: 0.45rem 0.75rem;
    font-size: 0.78rem;
  }

  .event-member-card {
    margin-top: 0.75rem;
    padding: 0.9rem;
    border: 1px solid rgba(220, 0, 0, 0.25);
    border-radius: 12px;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.65), rgba(255, 255, 255, 0.45));
    box-shadow: 0 6px 18px rgba(0, 0, 0, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.7);
  }

  .member-number {
    margin-bottom: 0.8rem;
    color: #6a6a6a;
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.55rem;
    letter-spacing: 0.12em;
    font-weight: 700;
  }

  .event-member-card .register-field {
    margin-bottom: 0.8rem;
  }

  /* ═══ FEE SUMMARY ═══ */

  .fee-summary {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    margin-top: 1rem;
    padding: 1rem;
    border-top: 2px solid #1a1a1a;
    border-bottom: 2px solid #1a1a1a;
  }

  .fee-summary strong {
    color: #1a1a1a;
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

  /* ═══ PAYMENT SUMMARY ═══ */

  .payment-summary {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0;
    margin-bottom: 1.4rem;
    overflow: hidden;
    border: 1px solid rgba(220, 0, 0, 0.35);
    border-radius: 12px;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.75), rgba(255, 255, 255, 0.55));
    box-shadow: 0 6px 18px rgba(0, 0, 0, 0.05);
  }

  .payment-summary > div {
    padding: 1rem;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.6), rgba(255, 255, 255, 0.4));
    border-right: 1px solid rgba(220, 0, 0, 0.15);
  }

  .payment-summary > div:last-child {
    border-right: 0;
  }

  .payment-summary strong {
    color: #1a1a1a;
    font-size: 0.85rem;
  }

  /* ═══ PAYMENT LAYOUT ═══ */

  /* ═══ UPI PAY BANNER ═══ */

  .upi-pay-section {
    display: none;
    margin-bottom: 1.5rem;
    text-align: center;
  }

  @media (max-width: 767px) {
    .upi-pay-section {
      display: block;
    }
  }

  .upi-pay-banner {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.7rem;
    width: 100%;
    padding: 0.85rem 1.2rem;
    border: 1px solid rgba(220, 0, 0, 0.3);
    border-radius: 12px;
    background: #ffffff;
    text-decoration: none;
    cursor: pointer;
    transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
  }

  .upi-pay-banner:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(220, 0, 0, 0.12);
    border-color: #dc0000;
  }

  .upi-banner-logo {
    height: 32px;
    width: auto;
    object-fit: contain;
    flex-shrink: 0;
  }

  .upi-banner-text {
    color: #1a1a1a;
    font-family: 'Anton', sans-serif;
    font-size: 1.05rem;
    letter-spacing: 0.06em;
  }

  .upi-banner-arrow {
    color: #dc0000;
    font-size: 1.1rem;
    font-weight: 700;
    transition: transform 0.2s ease;
  }

  .upi-pay-banner:hover .upi-banner-arrow {
    transform: translateX(3px);
  }

  .upi-banner-subtitle {
    margin: 0.5rem 0 0;
    color: #6a6a6a;
    font-family: 'Hanken Grotesk', sans-serif;
    font-size: 0.78rem;
    line-height: 1.4;
  }

  .upi-app-logos {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 12px;
    margin-top: 0.6rem;
  }

  .upi-app-logo {
    height: 20px;
    width: auto;
    object-fit: contain;
    opacity: 0.6;
    transition: opacity 0.2s ease;
  }

  .upi-app-logo:hover {
    opacity: 0.9;
  }

  .upi-note {
    margin: 0.8rem 0 0;
    color: #6a6a6a;
    font-family: 'Hanken Grotesk', sans-serif;
    font-size: 0.78rem;
    line-height: 1.5;
    text-align: center;
  }

  /* ═══ OR DIVIDERS ═══ */

  .payment-or-divider {
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 1rem 0;
  }

  .payment-or-divider span {
    padding: 0.3rem 1rem;
    background: transparent;
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.7rem;
    font-weight: 700;
    color: #6a6a6a;
    letter-spacing: 0.15em;
  }

  .payment-layout {
    position: relative;
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    gap: 1rem;
    margin-bottom: 1rem;
  }

  .payment-or-inline {
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.7rem;
    font-weight: 700;
    color: #6a6a6a;
    letter-spacing: 0.1em;
  }

  .qr-card,
  .gpay-card {
    min-width: 0;
    padding: 1.2rem;
    border: 1px solid rgba(220, 0, 0, 0.35);
    border-radius: 16px;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.75), rgba(255, 255, 255, 0.55));
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.8);
  }

  .payment-label {
    display: block;
    margin-bottom: 1rem;
    color: #dc0000;
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.58rem;
    letter-spacing: 0.13em;
    font-weight: 700;
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
    border: 1px solid rgba(220, 0, 0, 0.3);
    border-radius: 10px;
    background: #ffffff;
    margin-bottom: 0.9rem;
  }

  .qr-wrapper img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  .qr-missing-text {
    display: none;
    color: #1a1a1a;
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.8rem;
    font-weight: 700;
    text-align: center;
  }

  .qr-wrapper.qr-missing .qr-missing-text {
    display: block;
  }

  .qr-card > strong {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.7rem;
    letter-spacing: 0.08em;
    color: #1a1a1a;
  }

  .gpay-card h3 {
    margin: 0 0 0.6rem;
    font-family: 'Anton', sans-serif;
    font-size: 1.5rem;
    font-weight: 400;
    letter-spacing: 0.03em;
    color: #1a1a1a;
    text-transform: uppercase;
  }

  .gpay-number {
    width: 100%;
    box-sizing: border-box;
    padding: 0.9rem;
    border: 1px solid rgba(220, 0, 0, 0.35);
    border-radius: 10px;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.7), rgba(255, 240, 240, 0.5));
    color: #1a1a1a;
    font-family: 'JetBrains Mono', monospace;
    font-size: clamp(0.8rem, 2vw, 1rem);
    font-weight: 700;
    letter-spacing: 0.05em;
    overflow-wrap: anywhere;
  }

  .gpay-card > p {
    margin: 0.8rem 0;
    color: #6a6a6a;
    font-family: 'Hanken Grotesk', sans-serif;
    font-size: 0.8rem;
    line-height: 1.6;
  }

  .payment-important {
    padding: 0.8rem;
    border-left: 3px solid #dc0000;
    border-radius: 0 8px 8px 0;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.6), rgba(255, 240, 240, 0.4));
  }

  .payment-important strong {
    color: #dc0000;
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.58rem;
    letter-spacing: 0.1em;
  }

  .payment-important p {
    margin: 0.35rem 0 0;
    color: #3a3a3a;
    font-family: 'Hanken Grotesk', sans-serif;
    font-size: 0.75rem;
    line-height: 1.5;
  }

  .payment-instructions {
    margin: 1rem 0;
    padding: 1rem;
    border: 1px solid rgba(220, 0, 0, 0.25);
    border-radius: 12px;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.65), rgba(255, 255, 255, 0.45));
  }

  .payment-instructions > span {
    color: #dc0000;
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.58rem;
    letter-spacing: 0.12em;
    font-weight: 700;
  }

  .payment-instructions ol {
    margin: 0.8rem 0 0;
    padding-left: 1.2rem;
    color: #3a3a3a;
    font-family: 'Hanken Grotesk', sans-serif;
    font-size: 0.8rem;
    line-height: 1.8;
  }

  .payment-whatsapp-note {
    margin: 1rem 0;
    padding: 0.8rem;
    border-left: 3px solid #dc0000;
    border-radius: 0 8px 8px 0;
    background: linear-gradient(135deg, rgba(255, 235, 235, 0.8), rgba(255, 220, 220, 0.55));
    color: #3a3a3a;
    line-height: 1.5;
  }

  .payment-whatsapp-note > strong {
    display: block;
    color: #dc0000;
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.68rem;
    letter-spacing: 0.08em;
  }

  .payment-whatsapp-note > span {
    display: block;
    margin-top: 0.35rem;
  }

  .payment-whatsapp-note ol {
    margin: 0.35rem 0 0;
    padding-left: 1.2rem;
  }

  .abbas-payment-contact {
    margin-top: 0.6rem;
    padding: 0.7rem 0.8rem;
    border: 1px solid rgba(220, 0, 0, 0.2);
    border-radius: 8px;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.6), rgba(255, 255, 255, 0.4));
  }

  .abbas-payment-contact strong {
    color: #1a1a1a;
    font-size: 0.67rem;
  }

  /* ═══ PAYMENT CHECKBOX ═══ */

  .payment-checkbox {
    display: flex;
    align-items: flex-start;
    gap: 0.8rem;
    margin-top: 0.8rem;
    padding: 1rem;
    border: 1px solid rgba(220, 0, 0, 0.35);
    border-radius: 12px;
    cursor: pointer;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.75), rgba(255, 255, 255, 0.55));
    box-shadow: 0 6px 18px rgba(0, 0, 0, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.7);
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
  }

  .payment-checkbox:hover {
    border-color: rgba(220, 0, 0, 0.6);
    box-shadow: 0 10px 24px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.8);
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
    color: #3a3a3a;
    font-family: 'Hanken Grotesk', sans-serif;
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
    border: 1px solid rgba(240, 160, 0, 0.35);
    border-radius: 12px;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.7), rgba(255, 240, 220, 0.5));
    box-shadow: 0 6px 18px rgba(0, 0, 0, 0.05);
  }

  .final-warning strong {
    color: #1a1a1a;
    font-size: 0.8rem;
  }

  .final-warning p {
    margin: 0.35rem 0 0;
    color: #3a3a3a;
    font-family: 'Hanken Grotesk', sans-serif;
    font-size: 0.75rem;
    line-height: 1.6;
  }

  .free-event-box {
    padding: 1rem;
    border: 1px solid rgba(220, 0, 0, 0.25);
    border-radius: 12px;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.65), rgba(255, 255, 255, 0.45));
  }

  .free-event-box strong {
    color: #1a1a1a;
  }

  .free-event-box p {
    margin: 0.35rem 0 0;
    color: #6a6a6a;
    font-family: 'Hanken Grotesk', sans-serif;
    font-size: 0.8rem;
  }

  .register-loading {
    padding: 1.5rem;
    border: 1px solid rgba(220, 0, 0, 0.2);
    border-radius: 12px;
    color: #6a6a6a;
    text-align: center;
    font-family: 'Hanken Grotesk', sans-serif;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.6), rgba(255, 255, 255, 0.4));
  }

  .register-error-box,
  .submit-error {
    margin-bottom: 1rem;
    padding: 1rem;
    border: 1px solid rgba(220, 0, 0, 0.4);
    border-radius: 12px;
    background: linear-gradient(135deg, rgba(255, 235, 235, 0.7), rgba(255, 220, 220, 0.5));
  }

  .register-error-box strong,
  .submit-error {
    color: #dc0000;
  }

  .register-error-box p {
    margin: 0.35rem 0;
    color: #3a3a3a;
    font-family: 'Hanken Grotesk', sans-serif;
    font-size: 0.8rem;
  }

  .register-error-box button {
    border: 2px solid #0d0d0d;
    padding: 0.5rem 0.8rem;
    border-radius: 999px;
    background: #dc0000;
    color: #ffffff;
    cursor: pointer;
    font-family: 'Anton', sans-serif;
    font-size: 0.8rem;
    font-weight: 400;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    transition: 0.2s ease;
  }

  .register-error-box button:hover {
    background: #0d0d0d;
  }

  /* ═══ BUTTONS ═══ */

  .step-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    margin-top: 1.5rem;
    padding-top: 1.3rem;
    border-top: 2px solid #1a1a1a;
  }

  .register-primary-btn,
  .register-secondary-btn {
    min-height: 50px;
    padding: 0.95rem 1.9rem;
    border: 2px solid #0d0d0d;
    border-radius: 999px;
    font-family: 'Anton', sans-serif;
    font-size: 1.1rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    cursor: pointer;
    transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease, color 0.2s ease;
  }

  .register-primary-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    background: #dc0000;
    color: #ffffff;
    box-shadow: 0 8px 22px rgba(220, 0, 0, 0.35);
  }

  .register-primary-btn::after {
      content: "→";
    font-family: 'Hanken Grotesk', sans-serif;
    font-size: 1rem;
    transition: transform 0.2s ease;
  }

  .register-primary-btn:hover:not(:disabled)::after,
  .register-primary-btn:focus-visible::after {
    transform: translateX(4px);
  }

  .register-primary-btn:hover:not(:disabled),
  .register-primary-btn:focus-visible:not(:disabled) {
    transform: translateY(-3px);
    background: #0d0d0d;
    color: #ffffff;
    box-shadow: 0 14px 30px rgba(0, 0, 0, 0.35);
  }

  .register-primary-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .register-secondary-btn {
    background: transparent;
    color: #0d0d0d;
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.08);
  }

  .register-secondary-btn:hover:not(:disabled),
  .register-secondary-btn:focus-visible:not(:disabled) {
    transform: translateY(-3px);
    background: #0d0d0d;
    color: #ffffff;
    box-shadow: 0 14px 30px rgba(0, 0, 0, 0.3);
  }

  .register-submit {
    min-width: 230px;
  }

  /* ═══ SUCCESS ═══ */

  .register-success-section {
    min-height: 100vh;
    display: grid;
    place-items: center;
    box-sizing: border-box;
    padding: 2rem 1rem;
    background: #f5f5f5;
  }

  .register-success-card {
    width: 100%;
    max-width: 560px;
    box-sizing: border-box;
    padding: clamp(1.4rem, 5vw, 2.5rem);
    border: 1px solid rgba(220, 0, 0, 0.35);
    border-radius: 16px;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.75), rgba(255, 255, 255, 0.55));
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.8);
    text-align: center;
    overflow: hidden;
  }

  .register-success-card::after {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, transparent, rgba(220, 0, 0, 0.5), transparent);
  }

  .register-success-card > * {
    position: relative;
    z-index: 1;
  }

  .success-icon {
    position: relative;
    width: 80px;
    height: 80px;
    margin: 0 auto 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .success-icon-web {
    position: absolute;
    width: 130px;
    height: 130px;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 0;
    pointer-events: none;
    opacity: 0.14;
    color: #b2aeae;
  }

  .success-icon-svg {
    position: relative;
    z-index: 1;
    width: 64px;
    height: 64px;
  }

  .suc-ck-ring {
    transform-origin: center;
    animation: sucRingPop 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) 0.15s both;
  }

  .suc-ck-tick {
    stroke-dasharray: 1;
    stroke-dashoffset: 1;
    animation: sucDraw 0.3s ease 0.45s forwards;
  }

  @keyframes sucRingPop {
    from { opacity: 0; transform: scale(0.3); }
    to { opacity: 1; transform: scale(1); }
  }
  @keyframes sucDraw {
    from { stroke-dashoffset: 1; }
    to { stroke-dashoffset: 0; }
  }

  .register-success-card h1 {
    margin: 0;
    font-family: 'Anton', sans-serif;
    font-size: clamp(1.6rem, 7vw, 3rem);
    font-weight: 400;
    text-transform: uppercase;
    color: #1a1a1a;
    white-space: nowrap;
  }

  .success-intro {
    margin: 0 0 0.3rem;
    color: #6a6a6a;
    font-family: 'Hanken Grotesk', sans-serif;
    font-size: 0.85rem;
  }

  .success-preview-info {
    display: grid;
    gap: 0;
    margin-bottom: 0.8rem;
    border-bottom: 2px solid #1a1a1a;
  }

  .success-preview-info > div {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    padding: 0.65rem 0;
    border-bottom: 1px solid rgba(220, 0, 0, 0.12);
  }

  .success-preview-info > div:last-child {
    border-bottom: 0;
  }

  .success-preview-info span {
    color: #6a6a6a;
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.58rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  .success-preview-info strong {
    color: #1a1a1a;
    font-size: 0.78rem;
    text-align: right;
    overflow-wrap: anywhere;
  }

  .success-warning {
    margin-top: 1rem;
    padding: 1rem;
    border: 1px solid rgba(240, 160, 0, 0.35);
    border-radius: 12px;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.7), rgba(255, 240, 220, 0.5));
    text-align: left;
  }

  .success-warning strong {
    color: #1a1a1a;
    font-size: 0.8rem;
  }

  .success-warning p,
  .success-warning ol {
    margin: 0.4rem 0 0;
    color: #3a3a3a;
    font-family: 'Hanken Grotesk', sans-serif;
    font-size: 0.75rem;
    line-height: 1.6;
  }

  .success-warning ol {
    padding-left: 1.2rem;
  }

  .success-note {
    margin: 1rem 0 0;
    color: #999999;
    font-family: 'Hanken Grotesk', sans-serif;
    font-size: 0.7rem;
  }

  .success-location-section {
    margin-top: 1.2rem;
    text-align: center;
  }

  .success-location-text {
    margin: 0 0 0.6rem;
    color: #3a3a3a;
    font-family: 'Hanken Grotesk', sans-serif;
    font-size: 0.85rem;
  }

  .register-location-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    min-height: 50px;
    padding: 0.95rem 1.9rem;
    border: 2px solid #0d0d0d;
    border-radius: 999px;
    font-family: 'Anton', sans-serif;
    font-size: 1.1rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    text-decoration: none;
    background: #dc0000;
    color: #ffffff;
    box-shadow: 0 8px 22px rgba(220, 0, 0, 0.35);
    cursor: pointer;
    transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease, color 0.2s ease;
  }

  .register-location-btn::after {
    content: "\\2192";
    font-family: 'Hanken Grotesk', sans-serif;
    font-size: 1rem;
    transition: transform 0.2s ease;
  }

  .register-location-btn:hover {
    transform: translateY(-3px);
    background: #0d0d0d;
    color: #ffffff;
    box-shadow: 0 14px 30px rgba(0, 0, 0, 0.35);
  }

  .register-location-btn:hover::after {
    transform: translateX(4px);
  }

  /* ═══ MISC ═══ */

  .event-selection-note {
    margin: -0.2rem 0 1rem;
    padding: 1rem 1.1rem;
    border-left: 3px solid #f0a000;
    border-radius: 0 8px 8px 0;
    background: linear-gradient(135deg, rgba(255, 245, 220, 0.6), rgba(255, 240, 200, 0.4));
    color: #1a1a1a;
    font-family: 'Hanken Grotesk', sans-serif;
    font-size: 0.82rem;
    font-weight: 700;
    line-height: 1.6;
  }

  .event-selection-note strong {
    color: #1a1a1a;
  }

  .selected-events-count {
    color: #dc0000;
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.58rem;
    letter-spacing: 0.08em;
    font-weight: 700;
  }

  .selected-events-preview {
    margin-top: 1.25rem;
    padding: 1rem;
    border: 1px solid rgba(220, 0, 0, 0.35);
    border-radius: 16px;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.75), rgba(255, 255, 255, 0.55));
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.8);
    text-align: left;
  }

  .reg-card-wrapper + .reg-card-wrapper {
    margin-top: 1rem;
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
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.58rem;
    letter-spacing: 0.12em;
    font-weight: 700;
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
    border-bottom: 2px solid #1a1a1a;
  }

  .event-review-item:last-child {
    border-bottom: 0;
  }

  .event-review-name {
    color: #1a1a1a;
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.65rem;
    font-weight: 700;
  }

  .event-review-meta {
    color: #6a6a6a;
    font-family: 'Hanken Grotesk', sans-serif;
    font-size: 0.68rem;
    line-height: 1.45;
  }

  .event-review-participants {
    margin-top: 0.18rem;
    color: #3a3a3a;
    font-family: 'Hanken Grotesk', sans-serif;
    font-size: 0.65rem;
  }

  .event-review-team-name {
    margin-top: 0.18rem;
    color: #dc0000;
    font-size: 0.65rem;
    font-weight: 700;
  }

  .event-review-members {
    margin-top: 0.2rem;
    color: #6a6a6a;
    font-family: 'Hanken Grotesk', sans-serif;
    font-size: 0.65rem;
    display: flex;
    flex-direction: column;
    gap: 0.1rem;
  }

  .event-review-fee {
    color: #dc0000;
    font-family: 'Anton', sans-serif;
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
    border-top: 2px solid #1a1a1a;
  }

  .review-total span {
    color: #6a6a6a;
    font-family: 'JetBrains Mono', monospace;
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
    border: 1px solid rgba(220, 0, 0, 0.25);
    border-radius: 10px;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.65), rgba(255, 255, 255, 0.45));
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
    color: #3a3a3a;
    font-family: 'Hanken Grotesk', sans-serif;
    font-size: 0.76rem;
    line-height: 1.45;
    cursor: pointer;
  }

  .remember-details-text strong {
    color: #1a1a1a;
    font-size: 0.75rem;
  }

  .success-event-list {
    display: grid;
    gap: 0.35rem;
    text-align: left;
  }

  .success-event-item {
    padding: 0.4rem 0.6rem;
    border: 1px solid rgba(220, 0, 0, 0.2);
    border-radius: 6px;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.6), rgba(255, 255, 255, 0.4));
  }

  .success-event-item strong {
    display: block;
    color: #1a1a1a;
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.6rem;
  }

  .bottom-timing-note {
    margin-top: 1.2rem;
    padding: 1rem 1.1rem;
    border-left: 3px solid #f0a000;
    border-radius: 0 8px 8px 0;
    background: linear-gradient(135deg, rgba(255, 245, 220, 0.6), rgba(255, 240, 200, 0.4));
    color: #1a1a1a;
    font-family: 'Hanken Grotesk', sans-serif;
    font-size: 0.82rem;
    font-weight: 700;
    line-height: 1.6;
  }

  .bottom-timing-note strong {
    color: #1a1a1a;
  }

  .multi-payment-events {
    display: grid;
    gap: 0.6rem;
    margin-bottom: 1rem;
  }

  .multi-payment-event {
    padding: 0.75rem;
    border: 1px solid rgba(220, 0, 0, 0.2);
    border-radius: 10px;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.6), rgba(255, 255, 255, 0.4));
  }

  .multi-payment-event strong {
    display: block;
    color: #1a1a1a;
    font-size: 0.78rem;
  }

  .multi-payment-event span {
    display: block;
    margin-top: 0.25rem;
    color: #6a6a6a;
    font-family: 'Hanken Grotesk', sans-serif;
    font-size: 0.68rem;
  }

  /* ═══ TIMING CONFLICT TOAST ═══ */

  .tc-toast {
    position: fixed;
    top: 80px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 9999;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    max-width: 480px;
    width: calc(100% - 2rem);
    padding: 0.7rem 1rem;
    border-left: 3px solid #dc0000;
    border-radius: 8px;
    background: #ffffff;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    cursor: pointer;
    animation: tc-slide-in 0.3s ease;
  }

  .tc-toast-icon {
    font-size: 1rem;
    flex-shrink: 0;
  }

  .tc-toast-text {
    color: #dc0000;
    font-family: 'Hanken Grotesk', sans-serif;
    font-size: 0.8rem;
    line-height: 1.4;
    font-weight: 600;
  }

  @keyframes tc-slide-in {
    from { opacity: 0; transform: translateX(-50%) translateY(-10px); }
    to { opacity: 1; transform: translateX(-50%) translateY(0); }
  }

  @media (min-width: 600px) {
    .reg-shell {
      padding-inline: 32px;
    }
  }

  @media (min-width: 1024px) {
    .reg-shell {
      padding-inline: 64px;
    }
  }

  @media (max-width: 1024px) {
    .reg-hero {
      padding: 4rem 0 3rem;
    }
  }

  @media (max-width: 768px) {
    .reg-hero {
      padding: 3.5rem 0 2.5rem;
    }

    .reg-main {
      padding-top: 2.5rem;
    }

    .field-grid,
    .payment-layout,
    .event-grid {
      grid-template-columns: 1fr;
    }

    .event-participant-selector {
      grid-template-columns: 1fr;
    }

    .event-participant-info {
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

    .reg-hero-web {
      display: none;
    }
  }

  @media (max-width: 560px) {
    .reg-main {
      padding:
        2rem
        0
        3rem;
    }

    .reg-steps {
      margin-bottom: 1.5rem;
    }

    .reg-step {
      min-width: 72px;
    }

    .reg-step .step-circle {
      width: 38px;
      height: 38px;
      font-size: 1rem;
    }

    .reg-step span:last-child {
      font-size: 0.48rem;
    }

    .step-line {
      margin-top: 19px;
    }

    .reg-card {
      padding: 1rem;
    }

    .card-heading {
      gap: 0.7rem;
    }

    .card-number {
      width: 45px;
      height: 34px;
      font-size: 1rem;
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

    .event-members-heading {
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

    .success-preview-info > div {
      align-items: flex-start;
      flex-direction: column;
      gap: 0.25rem;
    }

    .success-preview-info strong {
      text-align: left;
    }

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

    .event-selection-note,
    .bottom-timing-note {
      font-size: 0.7rem;
    }

    .selected-event-detail-header {
      flex-direction: column;
    }

    .selected-event-fee {
      text-align: left;
    }
  }

  @media (max-width: 430px) {
    .reg-hero {
      padding: 2.75rem 0 2rem;
    }
  }

  @media (max-width: 360px) {
    .reg-main {
      padding-inline: 0;
    }

    .reg-card {
      padding: 0.85rem;
    }

    .reg-step {
      min-width: 60px;
    }

    .reg-step span:last-child {
      font-size: 0.43rem;
    }

    .step-line {
      max-width: 45px;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .reg-card,
    .event-option,
    .payment-checkbox,
    .register-primary-btn,
    .register-secondary-btn {
      transition: none;
    }
  }

  /* ═══ SUCCESS TWO-COLUMN LAYOUT ═══ */

  .success-two-col {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    margin-top: 0.5rem;
  }

  .success-two-col-left,
  .success-two-col-right {
    min-width: 0;
  }

  .success-two-col-right {
    order: -1;
  }

  @media (min-width: 768px) {
    .register-success-card {
      max-width: 1100px;
    }

    .success-two-col {
      text-align: left;
      flex-direction: row;
      align-items: flex-start;
      gap: 2rem;
    }

    .success-two-col-left {
      flex: 1 1 55%;
    }

    .success-two-col-right {
      flex: 1 1 40%;
      position: sticky;
      top: 2rem;
    }

    .success-two-col-right .reg-card-section {
      margin-top: 0;
    }
  }

  /* ═══ REGISTRATION CARD ═══ */

  .reg-card-section {
    margin-top: 2rem;
    text-align: center;
  }

  .reg-card-section-title {
    margin: 0 0 1rem;
    font-family: 'Anton', sans-serif;
    font-size: 1.3rem;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: #1a1a1a;
  }

  .reg-card-wrapper {
    max-width: 420px;
    margin: 0 auto;
    container-type: inline-size;
  }

  .reg-card-carousel {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    max-width: 420px;
    margin: 0 auto;
  }

  .reg-card-carousel-inner {
    flex: 1;
    min-width: 0;
    overflow: hidden;
  }

  .reg-card-carousel-inner .reg-card-wrapper {
    margin: 0;
  }

  .reg-card-nav-btn {
    flex-shrink: 0;
    width: 36px;
    height: 36px;
    border: 2px solid #1a1a1a;
    border-radius: 50%;
    background: #fff;
    color: #1a1a1a;
    font-size: 1.2rem;
    font-weight: 700;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.15s, transform 0.1s;
    box-shadow: 2px 2px 0 #1a1a1a;
  }

  .reg-card-nav-btn:hover {
    background: #f0f0f0;
  }

  .reg-card-nav-btn:active {
    transform: translate(1px, 1px);
    box-shadow: 1px 1px 0 #1a1a1a;
  }

  .reg-card-dots {
    display: flex;
    justify-content: center;
    gap: 0.5rem;
    margin-top: 0.75rem;
  }

  .reg-card-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    border: 2px solid #1a1a1a;
    background: transparent;
    cursor: pointer;
    padding: 0;
    transition: background 0.15s;
  }

  .reg-card-dot-active {
    background: #dc0000;
  }

  .reg-card-container {
    position: relative;
    width: 100%;
    aspect-ratio: 1545 / 1999;
    overflow: hidden;
    border: 2px solid #1a1a1a;
    background: #111;
  }

  .reg-card-bg {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    user-select: none;
    -webkit-user-drag: none;
  }

  .reg-card-name-overlay {
    position: absolute;
    top: 61.7%;
    left: 34%;
    width: 58%;
    height: 7.5%;
    display: flex;
    align-items: center;
    padding: 0 2%;
    color: #ffffff;
    font-family: 'Hanken Grotesk', sans-serif;
    font-size: clamp(0.55rem, 3.5cqw, 1.1rem);
    font-weight: 700;
    text-transform: uppercase;
    line-height: 1.15;
    overflow: hidden;
    word-break: break-word;
    -webkit-line-clamp: 2;
    display: -webkit-box;
    -webkit-box-orient: vertical;
  }

  .reg-card-events-overlay {
    position: absolute;
    top: 74%;
    left: 38%;
    width: 55%;
    height: 10%;
    display: flex;
    align-items: center;
    padding: 0 2%;
    color: #ffffff;
    font-family: 'Hanken Grotesk', sans-serif;
    font-weight: 700;
    line-height: 1.3;
    overflow: hidden;
    word-break: break-word;
    white-space: normal;
  }

  .reg-card-events-overlay.events-vertical {
    flex-direction: column;
    justify-content: center;
    text-align: center;
    gap: 0;
    line-height: 1.2;
  }

  .reg-card-events-overlay.events-vertical .reg-card-event-line {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100%;
  }

  .reg-card-event-line {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .reg-card-download-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    min-height: 50px;
    padding: 0.95rem 1.9rem;
    background: transparent;
    color: #0d0d0d;
    font-family: 'Anton', sans-serif;
    font-size: 1.1rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    border: 2px solid #0d0d0d;
    border-radius: 999px;
    cursor: pointer;
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.08);
    transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease, color 0.2s ease;
  }

  .reg-card-download-btn:hover {
    transform: translateY(-3px);
    background: #0d0d0d;
    color: #ffffff;
    box-shadow: 0 14px 30px rgba(0, 0, 0, 0.3);
  }

  .reg-card-actions {
    display: flex;
    justify-content: center;
    gap: 0.75rem;
    margin-top: 1rem;
    flex-wrap: wrap;
  }

  .reg-card-share-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    min-height: 50px;
    padding: 0.95rem 1.9rem;
    background: #dc0000;
    color: #ffffff;
    font-family: 'Anton', sans-serif;
    font-size: 1.1rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    border: 2px solid #0d0d0d;
    border-radius: 999px;
    cursor: pointer;
    box-shadow: 0 8px 22px rgba(220, 0, 0, 0.35);
    transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease, color 0.2s ease;
  }

  .reg-card-share-btn:hover {
    transform: translateY(-3px);
    background: #0d0d0d;
    box-shadow: 0 14px 30px rgba(0, 0, 0, 0.35);
  }

  .reg-card-share-btn svg {
    flex-shrink: 0;
  }

  .reg-card-share-hint {
    margin-top: 0.5rem;
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.7rem;
    letter-spacing: 0.05em;
    color: #666;
    text-align: center;
  }
`;