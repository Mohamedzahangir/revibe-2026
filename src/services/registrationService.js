import { supabase } from "./supabase";

/*
=========================================================
REVIBE '26 - REGISTRATION SERVICE
=========================================================

REGISTRATION FLOW

Student
  ↓
Registers for event(s)
  ↓
Pays via Google Pay
  ↓
Sends payment screenshot to Coordinator (Abbas)
  ↓
Registration created as PENDING
  ↓
Coordinator manually checks:
  • Screenshot
  • Actual GPay transaction
  • Payer name
  • Transaction ID
  • Amount
  ↓
Later:
Coordinator marks payment as VERIFIED / PAID
  ↓
Official confirmation email can be sent

IMPORTANT:
- No event coordinator is involved in payment submission.
- Payment screenshot is shared directly with the payment coordinator.
- This service does NOT upload/store the screenshot.
- The checkbox only records that the participant says
  the screenshot was sent.
=========================================================
*/

/*
=========================================================
CONSTANTS
=========================================================
*/

const PAYMENT_METHOD = "Google Pay";

const PAYMENT_PENDING_STATUS = "pending";

const PAYMENT_VERIFIED_STATUS = "verified";

const REGISTRATION_PENDING_STATUS =
  "pending_payment";

/*
=========================================================
UUID GENERATOR
=========================================================
*/

function generateUUID() {
  if (
    typeof globalThis !== "undefined" &&
    globalThis.crypto &&
    typeof globalThis.crypto.getRandomValues ===
      "function"
  ) {
    const bytes = new Uint8Array(16);

    globalThis.crypto.getRandomValues(bytes);

    // UUID v4
    bytes[6] =
      (bytes[6] & 0x0f) | 0x40;

    bytes[8] =
      (bytes[8] & 0x3f) | 0x80;

    const hex = Array.from(bytes).map(
      (byte) =>
        byte
          .toString(16)
          .padStart(2, "0")
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
      const random =
        Math.floor(Math.random() * 16);

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
  const randomNumber =
    Math.floor(
      100000 +
        Math.random() * 900000
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
        if (
          typeof event ===
          "string"
        ) {
          return {
            id: event,
            maxParticipants: null,
            slug: null,
          };
        }

        return {
          id:
            event?.id ||
            event?.eventId ||
            null,

          slug:
            event?.slug ||
            null,

          maxParticipants:
            event?.maxParticipants ??
            event?.max_participants ??
            event?.maxMembers ??
            null,
        };
      })
      .filter(
        (event) => event.id
      );
  }

  if (
    Array.isArray(eventIds) &&
    eventIds.length > 0
  ) {
    return eventIds
      .filter(Boolean)
      .map((id) => ({
        id,
        slug: null,
        maxParticipants: null,
      }));
  }

  return [];
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

  const participantId =
    generateUUID();

  const { error } =
    await supabase
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

    const normalizedTeamName =
      registrationType === "team"
        ? teamName?.trim() || null
        : null;

    const { error } =
      await supabase
        .from("registrations")
        .insert({
          id: registrationId,

          primary_participant_id:
            primaryParticipantId,

          registration_number:
            registrationNumber,

          registration_type:
            registrationType,

          team_name:
            normalizedTeamName,

          status:
            REGISTRATION_PENDING_STATUS,
        });

    if (!error) {
      return {
        id: registrationId,

        registration_number:
          registrationNumber,
      };
    }

    if (
      error.code !== "23505" ||
      attempt ===
        attempts - 1
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
*/

async function insertRegistrationEvent({
  registrationId,
  eventId,
}) {
  const registrationEventId =
    generateUUID();

  const { error } =
    await supabase
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
  const { error } =
    await supabase
      .from("registration_members")
      .insert({
        id: generateUUID(),

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
*/

async function insertPayment({
  registrationId,
  amount,
  paymentMethod,
  screenshotShared,
}) {
  const numericAmount =
    Number(amount) || 0;

  const paymentRequired =
    numericAmount > 0;

  const paymentStatus =
    paymentRequired
      ? PAYMENT_PENDING_STATUS
      : PAYMENT_VERIFIED_STATUS;

  let notes;

  if (!paymentRequired) {
    notes =
      "No payment required.";
  } else if (
    screenshotShared
  ) {
    notes =
      "Participant confirmed that the successful payment screenshot was shared directly with the payment coordinator on WhatsApp. Payment is pending manual verification.";
  } else {
    notes =
      "Payment record created. Payment screenshot confirmation was not provided.";
  }

  const { error } =
    await supabase
      .from("payments")
      .insert({
        id: generateUUID(),

        registration_id:
          registrationId,

        amount:
          numericAmount,

        status:
          paymentStatus,

        transaction_reference:
          null,

        payment_method:
          paymentRequired
            ? paymentMethod?.trim() ||
              PAYMENT_METHOD
            : null,

        paid_at:
          paymentRequired
            ? new Date().toISOString()
            : null,

        verified_at:
          null,

        notes,
      });

  if (error) {
    throw new Error(
      `Failed to create payment record: ${error.message}`
    );
  }

  return {
    status:
      paymentStatus,
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
        email
          .trim()
          .toLowerCase()
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
*/

function getEventDetails({
  eventRegistrations,
  event,
}) {
  if (
    !eventRegistrations
  ) {
    return null;
  }

  /*
   * ARRAY FORMAT
   */
  if (
    Array.isArray(
      eventRegistrations
    )
  ) {
    return (
      eventRegistrations.find(
        (item) =>
          item?.eventId ===
            event.id ||
          item?.id ===
            event.id ||
          (
            event.slug &&
            item?.slug ===
              event.slug
          )
      ) || null
    );
  }

  /*
   * OBJECT FORMAT
   */
  if (
    typeof eventRegistrations ===
      "object" &&
    !Array.isArray(
      eventRegistrations
    )
  ) {
    if (
      event.slug &&
      eventRegistrations[
        event.slug
      ]
    ) {
      return (
        eventRegistrations[
          event.slug
        ]
      );
    }

    const matchingKey =
      Object.keys(
        eventRegistrations
      ).find((key) => {
        const item =
          eventRegistrations[
            key
          ];

        return (
          item?.eventId ===
            event.id ||
          item?.id ===
            event.id
        );
      });

    if (matchingKey) {
      return (
        eventRegistrations[
          matchingKey
        ]
      );
    }
  }

  return null;
}

/*
=========================================================
MAIN REGISTRATION FUNCTION
=========================================================
*/

export async function submitRegistration({
  eventIds = [],

  selectedEvents = [],

  eventRegistrations = [],

  registrationType,

  teamName,

  primary,

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
    normalizedEvents.length ===
    0
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
  TEAM NAME VALIDATION
  ========================================================
  */

  if (
    registrationType ===
    "team"
  ) {
    const normalizedTeamName =
      teamName?.trim() || "";

    if (
      !normalizedTeamName
    ) {
      throw new Error(
        "Team name is required for team registration."
      );
    }

    if (
      normalizedTeamName.length >
      100
    ) {
      throw new Error(
        "Team name must be 100 characters or less."
      );
    }
  }

  /*
  ========================================================
  SOLO REGISTRATION TEAM NAME
  ========================================================
  */

  if (
    registrationType ===
    "individual"
  ) {
    teamName = null;
  }

  /*
  ========================================================
  BUILD EVENT PARTICIPANT GROUPS
  ========================================================
  */

  const eventParticipantGroups =
    normalizedEvents.map(
      (event) => {
        const details =
          getEventDetails({
            eventRegistrations,

            event,
          });

        let eventMembers =
          Array.isArray(
            details?.participants
          )
            ? details.participants
            : Array.isArray(
                details?.members
              )
            ? details.members
            : [];

        /*
         * Backward compatibility with
         * older submitRegistration()
         * calls using global members.
         */
        if (
          eventMembers.length ===
            0 &&
          Array.isArray(members) &&
          members.length > 0
        ) {
          eventMembers =
            members;
        }

        /*
         * Normalize every participant.
         *
         * IMPORTANT:
         * Register.jsx already sends the primary
         * participant inside eventMembers.
         *
         * The previous code used:
         *
         * member !== primary
         *
         * which compares object references.
         *
         * Because Register.jsx can create a different
         * object containing the same primary participant,
         * the primary could be added twice.
         *
         * We now compare normalized email addresses
         * instead.
         */

        const normalizedPrimary = {
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
        };

        const normalizedEventMembers =
          eventMembers
            .filter(Boolean)
            .map(
              (member) => ({
                fullName:
                  member.fullName ??
                  member.name ??
                  "",

                email:
                  member.email ??
                  "",

                phone:
                  member.phone ??
                  "",

                college:
                  member.college ??
                  member.collegeName ??
                  "",

                department:
                  member.department ??
                  "",

                year:
                  member.year ??
                  "",
              })
            );

        const primaryEmail =
          primary.email
            .trim()
            .toLowerCase();

        const hasPrimaryAlready =
          normalizedEventMembers.some(
            (member) =>
              member.email
                .trim()
                .toLowerCase() ===
              primaryEmail
          );

        /*
         * If the primary participant is already
         * included, don't add them again.
         *
         * Otherwise prepend the primary.
         */
        const participants =
          hasPrimaryAlready
            ? normalizedEventMembers
            : [
                normalizedPrimary,
                ...normalizedEventMembers,
              ];

        return {
          eventId:
            event.id,

          slug:
            event.slug,

          maxParticipants:
            event.maxParticipants,

          participants,
        };
      }
    );

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
     * Minimum one participant.
     */
    if (
      participants.length <
      1
    ) {
      throw new Error(
        "Each selected event must have at least one participant."
      );
    }

    /*
     * Maximum participant count.
     */
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
     * Same email cannot appear twice
     * inside one event.
     */
    validateEventDuplicateEmails(
      participants
    );

    /*
     * Validate every participant.
     */
    participants.forEach(
      (
        participant,
        index
      ) => {
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
  PARTICIPANT CACHE
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

    /*
     * Already processed during
     * this registration.
     */
    if (
      participantCache.has(
        normalizedEmail
      )
    ) {
      return participantCache.get(
        normalizedEmail
      );
    }

    /*
     * Try to find an existing
     * participant by email.
     */
    const {
      data: existingParticipant,
      error: existingParticipantError,
    } = await supabase
      .from("participants")
      .select("id")
      .eq(
        "email",
        normalizedEmail
      )
      .maybeSingle();

    if (
      existingParticipantError
    ) {
      throw new Error(
        `Failed to check existing participant: ${existingParticipantError.message}`
      );
    }

    if (
      existingParticipant?.id
    ) {
      participantCache.set(
        normalizedEmail,

        existingParticipant.id
      );

      return (
        existingParticipant.id
      );
    }

    /*
     * Create a new participant.
     */
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

      registrationType,

      teamName,
    });

  /*
  ========================================================
  CREATE REGISTRATION EVENTS
  ========================================================
  */

  const eventRegistrationIds =
    [];

  for (
    const event of
      eventParticipantGroups
  ) {
    /*
     * Create registration_events.
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
     * Add every participant
     * to this event.
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
        PAYMENT_METHOD,

      screenshotShared:
        Boolean(
          payment?.screenshotShared
        ),
    });

  /*
  ========================================================
  RETURN RESULT
  ========================================================
  */

  return {
    registrationId:
      registration.id,

    registrationNumber:
      registration.registration_number,

    paymentStatus:
      paymentResult.status,

    registrationStatus:
      REGISTRATION_PENDING_STATUS,

    selectedEventIds:
      normalizedEvents.map(
        (event) =>
          event.id
      ),

    eventRegistrationIds,

    participantCount:
      participantCache.size,
  };
}