import { supabase } from "./supabase";

async function ensureEventCapacity(eventId, maxParticipants, participantCount) {
  if (maxParticipants == null) return;

  const { data, error } = await supabase
    .from("registrations")
    .select("registration_members(count)")
    .eq("event_id", eventId);

  if (error) throw new Error(`Failed to check event availability: ${error.message}`);

  const registeredParticipants = (data ?? []).reduce(
    (total, registration) =>
      total + (registration.registration_members?.[0]?.count ?? 0),
    0
  );

  if (registeredParticipants + participantCount > Number(maxParticipants)) {
    throw new Error("This event is full. Please select another event.");
  }
}

/**
 * Generates a REVIBE26-XXXXXX style registration number.
 * Collision is unlikely but not impossible; insertRegistrationWithRetry
 * retries with a fresh number a few times if one collides.
 */
function generateRegistrationNumber() {
  const rand = Math.floor(100000 + Math.random() * 900000);
  return `REVIBE26-${rand}`;
}

/**
 * Inserts one row into `participants` and returns its id.
 * fullName, email, phone are required — the DB rejects NULLs for these.
 */
async function insertParticipant({ fullName, email, phone, college, department, year }) {
  const id = crypto.randomUUID();
  const { error } = await supabase
    .from("participants")
    .insert({
      id,
      full_name: fullName,
      email,
      phone,
      college_name: college ?? null,
      department: department ?? null,
      year: year ?? null,
    });

  if (error) throw new Error(`Failed to save participant: ${error.message}`);
  return id;
}

/**
 * Inserts a `registrations` row, retrying with a new number on collision.
 * status is left unset so it falls back to the DB default: 'pending_payment'.
 */
async function insertRegistrationWithRetry(
  { eventId, primaryParticipantId, registrationType, teamName },
  attempts = 3
) {
  for (let i = 0; i < attempts; i++) {
    const registrationNumber = generateRegistrationNumber();
    const id = crypto.randomUUID();
    const { error } = await supabase
      .from("registrations")
      .insert({
        id,
        event_id: eventId,
        primary_participant_id: primaryParticipantId,
        registration_number: registrationNumber,
        registration_type: registrationType,
        team_name: teamName ?? null,
      });

    if (!error) return { id, registration_number: registrationNumber };

    // 23505 = unique_violation (Postgres). Retry with a new number,
    // otherwise it's a different error and we should stop and surface it.
    if (error.code !== "23505" || i === attempts - 1) {
      throw new Error(`Failed to create registration: ${error.message}`);
    }
  }
}

/** Links a participant to a registration in registration_members. */
async function insertRegistrationMember({ registrationId, participantId, role }) {
  const { error } = await supabase.from("registration_members").insert({
    registration_id: registrationId,
    participant_id: participantId,
    role,
  });

  if (error) throw new Error(`Failed to link participant to registration: ${error.message}`);
}

/**
 * Full registration flow:
 *   1. save primary participant
 *   2. save each team member as their own participant row
 *   3. create the registration
 *   4. link everyone to it via registration_members (primary = 'leader')
 *
 * @param {Object} payload
 * @param {string} payload.eventId - events.id (uuid)
 * @param {"individual"|"team"} payload.registrationType
 * @param {string} [payload.teamName]
 * @param {Object} payload.primary - { fullName, email, phone, college, department, year }
 * @param {Object[]} [payload.members] - team members besides the primary,
 *   { fullName, email }. Phone is not collected for members; a placeholder
 *   is used since participants.phone is NOT NULL in the DB.
 *
 * @returns {Promise<{ registrationId: string, registrationNumber: string }>}
 */
export async function submitRegistration({
  eventId,
  maxParticipants,
  registrationType,
  teamName,
  primary,
  members = [],
}) {
  if (!eventId) throw new Error("eventId is required");
  if (!primary?.fullName || !primary?.email || !primary?.phone) {
    throw new Error("Primary participant needs fullName, email, and phone");
  }

  await ensureEventCapacity(
    eventId,
    maxParticipants,
    members.length + 1
  );

  const primaryParticipantId = await insertParticipant(primary);

  const memberParticipantIds = [];
  for (const member of members) {
    if (!member.fullName || !member.email) {
      throw new Error("Every team member needs fullName and email");
    }
    // Team members only submit name + email today. participants.phone is
    // NOT NULL in the DB, so we use a placeholder for members (not a real
    // constraint violation — NOT NULL only blocks actual null, not a string).
    const id = await insertParticipant({
      ...member,
      phone: member.phone?.trim() || "N/A",
    });
    memberParticipantIds.push(id);
  }

  const registration = await insertRegistrationWithRetry({
    eventId,
    primaryParticipantId,
    registrationType,
    teamName,
  });

  await insertRegistrationMember({
    registrationId: registration.id,
    participantId: primaryParticipantId,
    role: registrationType === "team" ? "leader" : "member",
  });

  for (const participantId of memberParticipantIds) {
    await insertRegistrationMember({
      registrationId: registration.id,
      participantId,
      role: "member",
    });
  }

  return {
    registrationId: registration.id,
    registrationNumber: registration.registration_number,
  };
}