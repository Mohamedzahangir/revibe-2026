import { supabase } from "./supabase";

/*
=========================================================
UUID GENERATOR
=========================================================
*/

function generateUUID() {
  if (
    typeof globalThis !== "undefined" &&
    globalThis.crypto &&
    typeof globalThis.crypto.getRandomValues === "function"
  ) {
    const bytes = new Uint8Array(16);

    globalThis.crypto.getRandomValues(bytes);

    // UUID v4
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;

    const hex = Array.from(bytes).map((byte) =>
      byte.toString(16).padStart(2, "0")
    );

    return (
      `${hex.slice(0, 4).join("")}-` +
      `${hex.slice(4, 6).join("")}-` +
      `${hex.slice(6, 8).join("")}-` +
      `${hex.slice(8, 10).join("")}-` +
      `${hex.slice(10, 16).join("")}`
    );
  }

  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
    /[xy]/g,
    (character) => {
      const random = Math.floor(Math.random() * 16);

      const value =
        character === "x"
          ? random
          : (random & 0x3) | 0x8;

      return value.toString(16);
    }
  );
}

/*
=========================================================
REGISTRATION NUMBER
=========================================================
*/

function generateRegistrationNumber() {
  const randomNumber = Math.floor(
    100000 + Math.random() * 900000
  );

  return `REVIBE26-${randomNumber}`;
}

/*
=========================================================
EVENT INPUT NORMALIZATION
=========================================================
*/

function normalizeSelectedEvents({
  eventIds,
  selectedEvents,
}) {
  if (
    Array.isArray(selectedEvents) &&
    selectedEvents.length > 0
  ) {
    return selectedEvents
      .map((event) => {
        if (typeof event === "string") {
          return {
            id: event,
            maxParticipants: null,
          };
        }

        return {
          id:
            event?.id ||
            event?.eventId ||
            null,

          maxParticipants:
            event?.maxParticipants ??
            event?.max_participants ??
            null,
        };
      })
      .filter((event) => event.id);
  }

  if (
    Array.isArray(eventIds) &&
    eventIds.length > 0
  ) {
    return eventIds
      .filter(Boolean)
      .map((id) => ({
        id,
        maxParticipants: null,
      }));
  }

  return [];
}

/*
=========================================================
VALIDATE EVENT CAPACITY
=========================================================

Capacity is now checked PER EVENT.

Example:

Coding & Debugging → 1 participant
Free Fire           → 4 participants

Both are allowed.

=========================================================
*/

function validateEventCapacity({
  selectedEvents,
}) {
  for (const event of selectedEvents) {
    const participantCount =
      Array.isArray(event.participants)
        ? event.participants.length
        : 0;

    if (participantCount < 1) {
      throw new Error(
        "Each selected event must have at least one participant."
      );
    }

    if (event.maxParticipants == null) {
      continue;
    }

    const maxParticipants = Number(
      event.maxParticipants
    );

    if (
      Number.isFinite(maxParticipants) &&
      participantCount > maxParticipants
    ) {
      throw new Error(
        `This event allows a maximum of ${maxParticipants} participant(s).`
      );
    }
  }
}

/*
=========================================================
INSERT PARTICIPANT
=========================================================
*/

async function insertParticipant({
  fullName,
  email,
  phone,
  college,
  department,
  year,
}) {
  if (!fullName?.trim()) {
    throw new Error(
      "Participant full name is required."
    );
  }

  if (!email?.trim()) {
    throw new Error(
      "Participant email is required."
    );
  }

  if (!phone?.trim()) {
    throw new Error(
      "Participant mobile number is required."
    );
  }

  if (!college?.trim()) {
    throw new Error(
      "Participant college name is required."
    );
  }

  if (!department?.trim()) {
    throw new Error(
      "Participant department is required."
    );
  }

  if (!year?.trim()) {
    throw new Error(
      "Participant year of study is required."
    );
  }

  const participantId = generateUUID();

  const { error } = await supabase
    .from("participants")
    .insert({
      id: participantId,

      full_name:
        fullName.trim(),

      email:
        email.trim().toLowerCase(),

      phone:
        phone.trim(),

      college_name:
        college.trim(),

      department:
        department.trim(),

      year:
        year.trim(),
    });

  if (error) {
    throw new Error(
      `Failed to save participant: ${error.message}`
    );
  }

  return participantId;
}

/*
=========================================================
CREATE REGISTRATION
=========================================================
*/

async function insertRegistrationWithRetry(
  {
    primaryParticipantId,
    registrationType,
    teamName,
  },
  attempts = 3
) {
  for (
    let attempt = 0;
    attempt < attempts;
    attempt++
  ) {
    const registrationNumber =
      generateRegistrationNumber();

    const registrationId =
      generateUUID();

    const { error } = await supabase
      .from("registrations")
      .insert({
        id:
          registrationId,

        primary_participant_id:
          primaryParticipantId,

        registration_number:
          registrationNumber,

        registration_type:
          registrationType,

        team_name:
          teamName?.trim() || null,

        status:
          "pending_payment",
      });

    if (!error) {
      return {
        id:
          registrationId,

        registration_number:
          registrationNumber,
      };
    }

    if (
      error.code !== "23505" ||
      attempt === attempts - 1
    ) {
      throw new Error(
        `Failed to create registration: ${error.message}`
      );
    }
  }

  throw new Error(
    "Failed to generate a unique registration number."
  );
}

/*
=========================================================
CREATE REGISTRATION EVENT
=========================================================

Returns the generated registration_event ID.

That ID is then used by registration_members.

=========================================================
*/

async function insertRegistrationEvent({
  registrationId,
  eventId,
}) {
  const registrationEventId =
    generateUUID();

  const { error } = await supabase
    .from("registration_events")
    .insert({
      id:
        registrationEventId,

      registration_id:
        registrationId,

      event_id:
        eventId,
    });

  if (error) {
    throw new Error(
      `Failed to link event to registration: ${error.message}`
    );
  }

  return registrationEventId;
}

/*
=========================================================
INSERT REGISTRATION MEMBER
=========================================================
*/

async function insertRegistrationMember({
  registrationId,
  registrationEventId,
  participantId,
  role,
}) {
  const { error } = await supabase
    .from("registration_members")
    .insert({
      id:
        generateUUID(),

      registration_id:
        registrationId,

      registration_event_id:
        registrationEventId,

      participant_id:
        participantId,

      role,
    });

  if (error) {
    throw new Error(
      `Failed to link participant to event: ${error.message}`
    );
  }
}

/*
=========================================================
CREATE PAYMENT
=========================================================

One registration = ONE combined payment.

=========================================================
*/

async function insertPayment({
  registrationId,
  amount,
  paymentMethod,
  transactionReference,
  screenshotShared,
}) {
  const numericAmount =
    Number(amount) || 0;

  const paymentRequired =
    numericAmount > 0;

  const { error } = await supabase
    .from("payments")
    .insert({
      id:
        generateUUID(),

      registration_id:
        registrationId,

      amount:
        numericAmount,

      status:
        "pending",

      transaction_reference:
        transactionReference?.trim() ||
        null,

      payment_method:
        paymentRequired
          ? paymentMethod?.trim() ||
            "Google Pay"
          : null,

      paid_at:
        null,

      verified_at:
        null,

      notes:
        paymentRequired
          ? screenshotShared
            ? "Participant confirmed that the successful payment screenshot was shared with the respective event coordinator."
            : "Payment submitted. Screenshot confirmation was not provided."
          : "No payment required.",
    });

  if (error) {
    throw new Error(
      `Failed to create payment record: ${error.message}`
    );
  }

  return {
    status:
      "pending",
  };
}

/*
=========================================================
VALIDATE PARTICIPANT
=========================================================
*/

function validateParticipant(
  participant,
  label = "Participant"
) {
  if (
    !participant?.fullName?.trim()
  ) {
    throw new Error(
      `${label}: full name is required.`
    );
  }

  if (
    !participant?.email?.trim()
  ) {
    throw new Error(
      `${label}: email is required.`
    );
  }

  if (
    !participant?.phone?.trim()
  ) {
    throw new Error(
      `${label}: mobile number is required.`
    );
  }

  if (
    !participant?.college?.trim()
  ) {
    throw new Error(
      `${label}: college name is required.`
    );
  }

  if (
    !participant?.department?.trim()
  ) {
    throw new Error(
      `${label}: department is required.`
    );
  }

  if (
    !participant?.year?.trim()
  ) {
    throw new Error(
      `${label}: year of study is required.`
    );
  }
}

/*
=========================================================
DUPLICATE EMAIL VALIDATION
=========================================================

The same participant may legitimately participate
in multiple events.

Therefore duplicate emails across EVENTS are allowed.

We only reject duplicate emails inside the SAME event.

=========================================================
*/

function validateEventDuplicateEmails(
  participants
) {
  const emails =
    participants
      .map(
        (participant) =>
          participant?.email
      )
      .filter(Boolean)
      .map((email) =>
        email.trim().toLowerCase()
      );

  const uniqueEmails =
    new Set(emails);

  if (
    uniqueEmails.size !==
    emails.length
  ) {
    throw new Error(
      "Each participant in an event must use a different email address."
    );
  }
}

/*
=========================================================
NORMALIZE EVENT PARTICIPANTS
=========================================================

Expected:

eventRegistrations: [
  {
    eventId: "...",
    maxParticipants: 4,
    participants: [...]
  }
]

=========================================================
*/

function normalizeEventRegistrations({
  selectedEvents,
  eventRegistrations,
  primary,
}) {
  const source =
    Array.isArray(eventRegistrations)
      ? eventRegistrations
      : [];

  return selectedEvents.map(
    (selectedEvent) => {
      const eventId =
        selectedEvent.id;

      const matchingEvent =
        source.find(
          (event) =>
            event?.eventId ===
              eventId ||
            event?.id ===
              eventId
        );

      let participants =
        matchingEvent?.participants;

      /*
       * Support the current UI structure:
       *
       * eventRegistrations[slug]
       *
       * This conversion is handled in submitRegistration
       * when an object keyed by slug is supplied.
       */

      if (
        !Array.isArray(participants)
      ) {
        participants = [];
      }

      return {
        eventId,

        maxParticipants:
          selectedEvent.maxParticipants,

        participants,
      };
    }
  );
}

/*
=========================================================
MAIN REGISTRATION FUNCTION
=========================================================

IMPORTANT:

Each event now owns its own participant list.

One participant can appear in multiple events.

One registration.

One combined payment.

=========================================================
*/

export async function submitRegistration({
  eventIds = [],
  selectedEvents = [],

  /*
   * New preferred format:
   *
   * [
   *   {
   *     eventId: "...",
   *     participants: [...]
   *   }
   * ]
   *
   * Also accepts the current UI object:
   *
   * {
   *   "coding-debugging": {
   *      teamSize: "1",
   *      members: [...]
   *   }
   * }
   */
  eventRegistrations = [],

  registrationType,

  teamName,

  primary,

  /*
   * Kept for backwards compatibility.
   *
   * New flow should use eventRegistrations.
   */
  members = [],

  payment = {},
}) {
  /*
  ========================================================
  NORMALIZE EVENTS
  ========================================================
  */

  const normalizedEvents =
    normalizeSelectedEvents({
      eventIds,
      selectedEvents,
    });

  if (
    normalizedEvents.length === 0
  ) {
    throw new Error(
      "Please select at least one event."
    );
  }

  /*
  ========================================================
  PRIMARY VALIDATION
  ========================================================
  */

  validateParticipant(
    primary,
    "Primary participant"
  );

  /*
  ========================================================
  REGISTRATION TYPE VALIDATION
  ========================================================
  */

  if (
    registrationType !==
      "individual" &&
    registrationType !==
      "team"
  ) {
    throw new Error(
      "Invalid registration type."
    );
  }

  /*
  ========================================================
  BUILD EVENT-SPECIFIC PARTICIPANTS
  ========================================================

  The Register.jsx currently stores:

  form.eventRegistrations[event.slug]

  So we support that structure directly.

  Each event gets:

  Primary participant
  +
  that event's members
  ========================================================
  */

  const eventParticipantGroups =
    normalizedEvents.map(
      (selectedEvent) => {
        const eventId =
          selectedEvent.id;

        /*
         * selectedEvents from Register.jsx
         * should eventually include slug.
         *
         * If it does not, matching can be done
         * using eventId supplied by the caller.
         */

        let details = null;

        if (
          eventRegistrations &&
          !Array.isArray(
            eventRegistrations
          )
        ) {
          /*
           * Object format:
           *
           * eventRegistrations[slug]
           */
          const possibleKeys =
            Object.keys(
              eventRegistrations
            );

          details =
            possibleKeys
              .map(
                (key) =>
                  eventRegistrations[
                    key
                  ]
              )
              .find(
                (item) =>
                  item?.eventId ===
                    eventId ||
                  item?.id ===
                    eventId
              );
        }

        /*
         * Array format:
         *
         * [
         *   {
         *     eventId,
         *     members
         *   }
         * ]
         */
        if (
          !details &&
          Array.isArray(
            eventRegistrations
          )
        ) {
          details =
            eventRegistrations.find(
              (item) =>
                item?.eventId ===
                  eventId ||
                item?.id ===
                  eventId
            );
        }

        /*
         * Members entered for this event.
         */
        const eventMembers =
          Array.isArray(
            details?.members
          )
            ? details.members
            : [];

        /*
         * Every event always includes
         * the primary participant.
         */
        const participants = [
          {
            ...primary,
          },

          ...eventMembers.map(
            (member) => ({
              fullName:
                member.fullName ??
                member.name,

              email:
                member.email,

              phone:
                member.phone,

              college:
                member.college ??
                member.collegeName,

              department:
                member.department,

              year:
                member.year,
            })
          ),
        ];

        return {
          eventId,

          maxParticipants:
            selectedEvent.maxParticipants,

          participants,
        };
      }
    );

  /*
  ========================================================
  BACKWARD COMPATIBILITY
  ========================================================

  If the caller still supplies members[]
  but does not supply event-specific data,
  use those members for every selected event.

  This prevents an immediate breaking change.

  ========================================================
  */

  const hasEventSpecificMembers =
    eventParticipantGroups.some(
      (event) =>
        event.participants.length >
        1
    );

  if (
    !hasEventSpecificMembers &&
    Array.isArray(members) &&
    members.length > 0
  ) {
    for (
      const event of
        eventParticipantGroups
    ) {
      event.participants = [
        {
          ...primary,
        },

        ...members.map(
          (member) => ({
            fullName:
              member.fullName ??
              member.name,

            email:
              member.email,

            phone:
              member.phone,

            college:
              member.college ??
              member.collegeName,

            department:
              member.department,

            year:
              member.year,
          })
        ),
      ];
    }
  }

  /*
  ========================================================
  EVENT-SPECIFIC VALIDATION
  ========================================================
  */

  for (
    const event of
      eventParticipantGroups
  ) {
    const participants =
      event.participants;

    /*
     * Validate count against this
     * event's own limit.
     */
    if (
      participants.length < 1
    ) {
      throw new Error(
        "Each selected event must have at least one participant."
      );
    }

    if (
      event.maxParticipants !=
        null
    ) {
      const maxParticipants =
        Number(
          event.maxParticipants
        );

      if (
        Number.isFinite(
          maxParticipants
        ) &&
        participants.length >
          maxParticipants
      ) {
        throw new Error(
          `This event allows a maximum of ${maxParticipants} participant(s).`
        );
      }
    }

    /*
     * Check duplicate emails only
     * within this event.
     */
    validateEventDuplicateEmails(
      participants
    );

    /*
     * Validate every participant.
     */
    participants.forEach(
      (participant, index) => {
        validateParticipant(
          participant,
          index === 0
            ? "Event leader"
            : `Event member ${index + 1}`
        );
      }
    );
  }

  /*
  ========================================================
  CREATE UNIQUE PARTICIPANT RECORDS
  ========================================================

  Important:

  The same person can participate in
  multiple events.

  We reuse their participant ID
  within this registration when their
  email matches.

  ========================================================
  */

  const participantCache =
    new Map();

  async function getOrCreateParticipant(
    participant
  ) {
    const normalizedEmail =
      participant.email
        .trim()
        .toLowerCase();

    if (
      participantCache.has(
        normalizedEmail
      )
    ) {
      return participantCache.get(
        normalizedEmail
      );
    }

    const participantId =
      await insertParticipant({
        fullName:
          participant.fullName,

        email:
          participant.email,

        phone:
          participant.phone,

        college:
          participant.college,

        department:
          participant.department,

        year:
          participant.year,
      });

    participantCache.set(
      normalizedEmail,
      participantId
    );

    return participantId;
  }

  /*
  ========================================================
  CREATE PRIMARY PARTICIPANT
  ========================================================
  */

  const primaryParticipantId =
    await getOrCreateParticipant(
      primary
    );

  /*
  ========================================================
  CREATE ONE REGISTRATION
  ========================================================
  */

  const registration =
    await insertRegistrationWithRetry({
      primaryParticipantId,

      /*
       * Overall registration type is based
       * on the submitted registration.
       */
      registrationType,

      teamName,
    });

  /*
  ========================================================
  CREATE EVENT + MEMBERS
  ========================================================
  */

  const eventRegistrationIds =
    [];

  for (
    const event of
      eventParticipantGroups
  ) {
    /*
     * Create registration_events row.
     */
    const registrationEventId =
      await insertRegistrationEvent({
        registrationId:
          registration.id,

        eventId:
          event.eventId,
      });

    eventRegistrationIds.push(
      registrationEventId
    );

    /*
     * First participant is always
     * the primary participant / leader.
     */
    for (
      let index = 0;
      index <
      event.participants.length;
      index++
    ) {
      const participant =
        event.participants[index];

      const participantId =
        await getOrCreateParticipant(
          participant
        );

      /*
       * Primary participant is leader.
       *
       * For individual event:
       * leader
       *
       * For team event:
       * leader
       */
      const role =
        index === 0
          ? "leader"
          : "member";

      await insertRegistrationMember({
        registrationId:
          registration.id,

        registrationEventId,

        participantId,

        role,
      });
    }
  }

  /*
  ========================================================
  CREATE ONE COMBINED PAYMENT
  ========================================================
  */

  const paymentResult =
    await insertPayment({
      registrationId:
        registration.id,

      amount:
        payment?.amount,

      paymentMethod:
        payment?.paymentMethod ||
        "Google Pay",

      transactionReference:
        payment?.transactionReference,

      screenshotShared:
        Boolean(
          payment?.screenshotShared
        ),
    });

  /*
  ========================================================
  RETURN SUCCESS
  ========================================================
  */

  return {
    registrationId:
      registration.id,

    registrationNumber:
      registration.registration_number,

    paymentStatus:
      paymentResult.status,

    selectedEventIds:
      normalizedEvents.map(
        (event) => event.id
      ),

    eventRegistrationIds,

    participantCount:
      participantCache.size,
  };
}