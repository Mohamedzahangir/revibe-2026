import { supabase } from "./supabase";

/*
=========================================================
REVIBE '26 - REGISTRATION SERVICE
=========================================================

REGISTRATION FLOW

Register.jsx
    ↓
submitRegistration()
    ↓
participants
    ↓
registrations
    ↓
registration_events
    ↓
registration_members
    ↓
payments
    ↓
overall  ← CONSOLIDATED RECORD

IMPORTANT
---------
The "overall" table stores ONE complete registration.

It contains:

- Registration details
- Team name
- Primary / team lead details
- Selected event details
- Complete team member details
- Total amount
- Payment details

The relational tables remain the source structure.
The "overall" table is the consolidated snapshot used
for admin/coordinator/certificate workflows.

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

const REGISTRATION_PENDING_STATUS = "pending_payment";

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
            slug: null,
            maxParticipants: null,
          };
        }

        return {
          id:
            event?.id ||
            event?.eventId ||
            null,

          slug: event?.slug || null,

          maxParticipants:
            event?.maxParticipants ??
            event?.max_participants ??
            event?.maxMembers ??
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
        slug: null,
        maxParticipants: null,
      }));
  }

  return [];
}

/*
=========================================================
RESOLVE EVENT DETAILS
=========================================================

Register.jsx may only send event IDs.

We therefore fetch the actual event information from
Supabase so that "overall.selected_events" contains:

- event_id
- event name
- slug
- category
- fee
- max participants
=========================================================
*/

async function resolveSelectedEvents(
  normalizedEvents
) {
  if (!normalizedEvents.length) {
    return [];
  }

  const eventIds = normalizedEvents
    .map((event) => event.id)
    .filter(Boolean);

  const { data, error } = await supabase
    .from("events")
    .select(
      `
        id,
        name,
        slug,
        category,
        fee,
        max_participants,
        status,
        registration_status
      `
    )
    .in("id", eventIds);

  if (error) {
    throw new Error(
      `Failed to load selected event details: ${error.message}`
    );
  }

  const eventMap = new Map(
    (data || []).map((event) => [
      String(event.id),
      event,
    ])
  );

  return normalizedEvents.map((selectedEvent) => {
    const eventRecord = eventMap.get(
      String(selectedEvent.id)
    );

    if (!eventRecord) {
      throw new Error(
        `Selected event could not be found in the database: ${selectedEvent.id}`
      );
    }

    return {
      id: eventRecord.id,

      slug:
        eventRecord.slug ||
        selectedEvent.slug ||
        null,

      name: eventRecord.name || null,

      category:
        eventRecord.category || null,

      fee:
        eventRecord.fee ?? null,

      maxParticipants:
        eventRecord.max_participants ??
        selectedEvent.maxParticipants ??
        null,

      status:
        eventRecord.status || null,

      registrationStatus:
        eventRecord.registration_status || null,
    };
  });
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

      full_name: fullName.trim(),

      email: email.trim().toLowerCase(),

      phone: phone.trim(),

      college_name: college.trim(),

      department: department.trim(),

      year: year.trim(),
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

    const registrationId = generateUUID();

    const normalizedTeamName =
      registrationType === "team"
        ? teamName?.trim() || null
        : null;

    const { error } = await supabase
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
      id: registrationEventId,

      registration_id: registrationId,

      event_id: eventId,
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
      id: generateUUID(),

      registration_id: registrationId,

      registration_event_id:
        registrationEventId,

      participant_id: participantId,

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
  const numericAmount = Number(amount) || 0;

  const paymentRequired = numericAmount > 0;

  const paymentStatus = paymentRequired
    ? PAYMENT_PENDING_STATUS
    : PAYMENT_VERIFIED_STATUS;

  let notes;

  if (!paymentRequired) {
    notes = "No payment required.";
  } else if (screenshotShared) {
    notes =
      "Participant confirmed that the successful payment screenshot was shared directly with the payment coordinator on WhatsApp. Payment is pending manual verification.";
  } else {
    notes =
      "Payment record created. Payment screenshot confirmation was not provided.";
  }

  const paidAt = paymentRequired
    ? new Date().toISOString()
    : null;

  const resolvedPaymentMethod = paymentRequired
    ? paymentMethod?.trim() || PAYMENT_METHOD
    : null;

  const { error } = await supabase
    .from("payments")
    .insert({
      id: generateUUID(),

      registration_id: registrationId,

      amount: numericAmount,

      status: paymentStatus,

      transaction_reference: null,

      payment_method:
        resolvedPaymentMethod,

      paid_at: paidAt,

      verified_at: null,

      notes,
    });

  if (error) {
    throw new Error(
      `Failed to create payment record: ${error.message}`
    );
  }

  return {
    status: paymentStatus,

    amount: numericAmount,

    paymentMethod:
      resolvedPaymentMethod,

    paidAt,

    notes,
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
  if (!participant?.fullName?.trim()) {
    throw new Error(
      `${label}: full name is required.`
    );
  }

  if (!participant?.email?.trim()) {
    throw new Error(
      `${label}: email is required.`
    );
  }

  if (!participant?.phone?.trim()) {
    throw new Error(
      `${label}: mobile number is required.`
    );
  }

  if (!participant?.college?.trim()) {
    throw new Error(
      `${label}: college name is required.`
    );
  }

  if (!participant?.department?.trim()) {
    throw new Error(
      `${label}: department is required.`
    );
  }

  if (!participant?.year?.trim()) {
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
  const emails = participants
    .map((participant) => participant?.email)
    .filter(Boolean)
    .map((email) =>
      email.trim().toLowerCase()
    );

  const uniqueEmails = new Set(emails);

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
  if (!eventRegistrations) {
    return null;
  }

  /*
   * ARRAY FORMAT
   */

  if (Array.isArray(eventRegistrations)) {
    return (
      eventRegistrations.find(
        (item) =>
          item?.eventId === event.id ||
          item?.id === event.id ||
          (
            event.slug &&
            item?.slug === event.slug
          )
      ) || null
    );
  }

  /*
   * OBJECT FORMAT
   */

  if (
    typeof eventRegistrations === "object" &&
    !Array.isArray(eventRegistrations)
  ) {
    if (
      event.slug &&
      eventRegistrations[event.slug]
    ) {
      return eventRegistrations[event.slug];
    }

    const matchingKey = Object.keys(
      eventRegistrations
    ).find((key) => {
      const item =
        eventRegistrations[key];

      return (
        item?.eventId === event.id ||
        item?.id === event.id
      );
    });

    if (matchingKey) {
      return eventRegistrations[
        matchingKey
      ];
    }
  }

  return null;
}

/*
=========================================================
NORMALIZE PARTICIPANT
=========================================================
*/

function normalizeParticipant(
  participant
) {
  return {
    fullName:
      participant?.fullName ??
      participant?.name ??
      "",

    email:
      participant?.email ??
      "",

    phone:
      participant?.phone ??
      "",

    college:
      participant?.college ??
      participant?.collegeName ??
      "",

    department:
      participant?.department ??
      "",

    year:
      participant?.year ??
      "",
  };
}

/*
=========================================================
CREATE CONSOLIDATED OVERALL RECORD
=========================================================

ONE REGISTRATION = ONE ROW IN overall.

For TEAM:

full_name
    ↓
TEAM LEAD

team_members
    ↓
ALL TEAM MEMBERS INCLUDING LEAD

selected_events
    ↓
EACH EVENT + PARTICIPANTS

For INDIVIDUAL:

full_name
    ↓
PARTICIPANT

team_members
    ↓
SINGLE PARTICIPANT
=========================================================
*/

async function insertOverallRecord({
  registration,
  registrationType,
  teamName,
  primary,
  eventParticipantGroups,
  amount,
  paymentResult,
}) {
  /*
  ========================================================
  SELECTED EVENTS
  ========================================================
  */

  const overallSelectedEvents =
    eventParticipantGroups.map(
      (event) => ({
        event_id:
          event.eventId,

        slug:
          event.slug,

        name:
          event.name,

        category:
          event.category,

        fee:
          event.fee,

        participant_count:
          event.participants.length,

        participants:
          event.participants.map(
            (participant, index) => ({
              full_name:
                participant.fullName,

              email:
                participant.email
                  .trim()
                  .toLowerCase(),

              phone:
                participant.phone,

              college_name:
                participant.college,

              department:
                participant.department,

              year:
                participant.year,

              role:
                index === 0
                  ? "leader"
                  : "member",
            })
          ),
      })
    );

  /*
  ========================================================
  ALL TEAM MEMBERS
  ========================================================

  One participant should appear only once here even if
  they participate in multiple selected events.

  Email is used as the temporary unique identifier.
  ========================================================
  */

  const memberMap = new Map();

  eventParticipantGroups.forEach(
    (event) => {
      event.participants.forEach(
        (participant, index) => {
          const normalizedEmail =
            participant.email
              .trim()
              .toLowerCase();

          if (
            !memberMap.has(
              normalizedEmail
            )
          ) {
            memberMap.set(
              normalizedEmail,
              {
                full_name:
                  participant.fullName,

                email:
                  normalizedEmail,

                phone:
                  participant.phone,

                college_name:
                  participant.college,

                department:
                  participant.department,

                year:
                  participant.year,

                role:
                  index === 0
                    ? "leader"
                    : "member",
              }
            );
          }
        }
      );
    }
  );

  const overallTeamMembers =
    Array.from(
      memberMap.values()
    );

  /*
  ========================================================
  MAKE SURE PRIMARY PARTICIPANT IS PRESENT
  ========================================================
  */

  const primaryEmail =
    primary.email
      .trim()
      .toLowerCase();

  if (
    !memberMap.has(primaryEmail)
  ) {
    overallTeamMembers.unshift({
      full_name:
        primary.fullName,

      email:
        primaryEmail,

      phone:
        primary.phone,

      college_name:
        primary.college,

      department:
        primary.department,

      year:
        primary.year,

      role: "leader",
    });
  } else {
    /*
     * Ensure primary is marked as leader.
     */

    const primaryMember =
      memberMap.get(
        primaryEmail
      );

    primaryMember.role =
      "leader";
  }

  /*
  ========================================================
  PRIMARY PARTICIPANT
  ========================================================
  */

  const normalizedAmount =
    Number(amount) || 0;

  /*
  ========================================================
  INSERT ONE ROW INTO overall
  ========================================================
  */

  const { error } =
    await supabase
      .from("overall")
      .insert({
        registration_number:
          registration.registration_number,

        registration_type:
          registrationType,

        team_name:
          teamName?.trim() || null,

        registration_status:
          REGISTRATION_PENDING_STATUS,

        /*
         * For TEAM:
         * this is the TEAM LEAD.
         *
         * For INDIVIDUAL:
         * this is the participant.
         */

        full_name:
          primary.fullName.trim(),

        email:
          primary.email
            .trim()
            .toLowerCase(),

        phone:
          primary.phone.trim(),

        college_name:
          primary.college.trim(),

        department:
          primary.department.trim(),

        year:
          primary.year.trim(),

        selected_events:
          overallSelectedEvents,

        /*
         * Complete team/member list.
         */

        team_members:
          overallTeamMembers,

        total_amount:
          normalizedAmount,

        payment_status:
          paymentResult.status,

        payment_method:
          paymentResult.paymentMethod,

        transaction_reference:
          null,

        payment_screenshot_url:
          null,

        paid_at:
          paymentResult.paidAt,

        verified_at:
          null,

        payment_notes:
          paymentResult.notes,
      });

  if (error) {
    throw new Error(
      `Failed to save consolidated overall record: ${error.message}`
    );
  }
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
  1. NORMALIZE EVENTS
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
  2. RESOLVE ACTUAL EVENT DETAILS
  ========================================================
  */

  const resolvedEvents =
    await resolveSelectedEvents(
      normalizedEvents
    );
/*
=========================================================
IPL AUCTION - MAXIMUM 10 TEAMS
=========================================================
*/

const iplEvent =
  resolvedEvents.find(
    (event) =>
      event.slug === "ipl-auction"
  );

if (iplEvent) {
  const { count, error } =
    await supabase
      .from("registration_events")
      .select("id", {
        count: "exact",
        head: true,
      })
      .eq(
        "event_id",
        iplEvent.id
      );

  if (error) {
    throw new Error(
      `Failed to check IPL Auction capacity: ${error.message}`
    );
  }

  if ((count || 0) >= 10) {
    throw new Error(
      "IPL Auction registration is full. Maximum 10 teams are allowed."
    );
  }
}
  /*
  ========================================================
  3. PRIMARY VALIDATION
  ========================================================
  */

  validateParticipant(
    primary,

    "Primary participant"
  );

  /*
  ========================================================
  4. REGISTRATION TYPE VALIDATION
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
  5. TEAM NAME VALIDATION
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
  6. SOLO REGISTRATION TEAM NAME
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
  7. BUILD EVENT PARTICIPANT GROUPS
  ========================================================
  */

  const eventParticipantGroups =
    resolvedEvents.map(
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
         * Backward compatibility:
         * if Register.jsx sends global members.
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
         * Normalize primary.
         */

        const normalizedPrimary =
          normalizeParticipant(
            primary
          );

        /*
         * Normalize event members.
         */

        const normalizedEventMembers =
          eventMembers
            .filter(Boolean)
            .map(
              normalizeParticipant
            );

        /*
         * Check whether primary is
         * already included.
         */

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
         * Build complete event
         * participant list.
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

          name:
            event.name,

          category:
            event.category,

          fee:
            event.fee,

          maxParticipants:
            event.maxParticipants,

          participants,
        };
      }
    );

  /*
  ========================================================
  8. EVENT-SPECIFIC VALIDATION
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
     * Duplicate email validation.
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
  9. PARTICIPANT CACHE
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
   * IMPORTANT
   * ----------
   * Do NOT SELECT from participants here.
   *
   * Public registration should not need
   * permission to read existing participant
   * records.
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
  10. CREATE PRIMARY PARTICIPANT
  ========================================================
  */

  const primaryParticipantId =
    await getOrCreateParticipant(
      primary
    );

  /*
  ========================================================
  11. CREATE ONE REGISTRATION
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
  12. CREATE REGISTRATION EVENTS
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
  13. CREATE ONE COMBINED PAYMENT
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
  14. CREATE CONSOLIDATED OVERALL RECORD
  ========================================================
  */

  await insertOverallRecord({
    registration,

    registrationType,

    teamName,

    primary,

    eventParticipantGroups,

    amount:
      payment?.amount,

    paymentResult,
  });

  /*
  ========================================================
  15. RETURN RESULT
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
      resolvedEvents.map(
        (event) =>
          event.id
      ),

    eventRegistrationIds,

    participantCount:
      participantCache.size,
  };
}