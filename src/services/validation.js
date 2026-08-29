// validation.js

// ─────────────────────────────────────────────
// Basic validators
// ─────────────────────────────────────────────

export function validateName(name = "") {
  const value = String(name).trim();

  if (!value) return "Full name is required";
  if (value.length < 2) {
    return "Name must be at least 2 characters";
  }
  if (value.length > 60) {
    return "Name must not exceed 60 characters";
  }

  if (!/^[A-Za-zÀ-ÖØ-öø-ÿ.' -]+$/.test(value)) {
    return "Name contains invalid characters";
  }

  return null;
}

export function validateEmail(email = "") {
  const value = String(email).trim().toLowerCase();

  if (!value) return "Email is required";

  if (value.length > 254) {
    return "Email is too long";
  }

  // Correct email validation
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    return "Enter a valid email address";
  }

  return null;
}

export function validatePhone(phone = "") {
  const value = String(phone).trim();

  if (!value) {
    return "Mobile number is required";
  }

  if (!/^[6-9]\d{9}$/.test(value)) {
    return "Enter a valid 10-digit mobile number";
  }

  return null;
}

export function validateCollege(college = "") {
  const value = String(college).trim();

  if (!value) {
    return "College name is required";
  }

  if (value.length < 2) {
    return "College name is too short";
  }

  if (value.length > 150) {
    return "College name is too long";
  }

  return null;
}

export function validateDepartment(department = "") {
  const value = String(department).trim();

  if (!value) {
    return "Department is required";
  }

  if (value.length > 100) {
    return "Department name is too long";
  }

  return null;
}

export function validateYear(year = "") {
  const value = String(year).trim();

  if (!value) {
    return "Year of study is required";
  }

  const validYears = [
    "1st Year",
    "2nd Year",
    "3rd Year",
    "4th Year",
  ];

  if (!validYears.includes(value)) {
    return "Select a valid year of study";
  }

  return null;
}

// ─────────────────────────────────────────────
// Event validation
// ─────────────────────────────────────────────

export function validateEvent(eventSlug = "") {
  if (!String(eventSlug).trim()) {
    return "Please select an event";
  }

  return null;
}

// ─────────────────────────────────────────────
// Team size validation
//
// Every event:
// MIN = 1
// MAX = configured team size
//
// Examples:
//
// PPT            → Min: 1 | Max: 2
// Cooking        → Min: 1 | Max: 3
// IPL Auction    → Min: 1 | Max: 6
// Free Fire      → Min: 1 | Max: 4
// ─────────────────────────────────────────────

export function validateTeamSize(
  teamSize,
  event = null,
  maxTeamSize = null
) {
  const size = Number(teamSize);

  if (!Number.isInteger(size)) {
    return "Team size must be a whole number";
  }

  if (size < 1) {
    return "Team must have at least 1 member";
  }

  /*
   * Support both:
   *
   * event.min_team_size / event.max_team_size
   *
   * and
   *
   * event.minTeamSize / event.maxTeamSize
   */

  const eventMin =
    event?.min_team_size ??
    event?.minTeamSize ??
    1;

  const eventMax =
    event?.max_team_size ??
    event?.maxTeamSize ??
    maxTeamSize;

  const min = Number(eventMin) || 1;
  const max =
    Number(eventMax) ||
    Math.max(min, 1);

  /*
   * Minimum is always 1.
   */

  if (size < 1 || size < min) {
    return `Minimum team size is ${min}`;
  }

  /*
   * Maximum comes from the event.
   */

  if (size > max) {
    return `Maximum team size is ${max}`;
  }

  return null;
}

// ─────────────────────────────────────────────
// Team member validation
//
// The primary participant is already stored in:
//
// form.name
// form.email
//
// Therefore `members` contains ONLY additional
// participants.
//
// Example:
//
// Team size = 1
// members = []
//
// Team size = 2
// members = [member 2]
//
// Team size = 4
// members = [member 2, member 3, member 4]
// ─────────────────────────────────────────────

export function validateTeamMembers(
  members = [],
  primaryEmail = "",
  teamSize = 1
) {
  const errors = {};

  if (!Array.isArray(members)) {
    return {
      members: "Invalid team member data",
    };
  }

  const primary = String(primaryEmail)
    .trim()
    .toLowerCase();

  /*
   * Expected number of additional members.
   *
   * Team size 1 → 0 additional members
   * Team size 2 → 1 additional member
   * Team size 4 → 3 additional members
   */

  const expectedMembers = Math.max(
    0,
    Number(teamSize) - 1
  );

  if (members.length !== expectedMembers) {
    return {
      teamSize:
        `Please provide details for all ${expectedMembers} additional team member${
          expectedMembers === 1 ? "" : "s"
        }.`,
    };
  }

  /*
   * Store all participant emails.
   *
   * Primary participant is included first
   * so we can detect duplicate email between
   * leader and team members.
   */

  const emails = [];

  if (primary) {
    emails.push({
      email: primary,
      index: -1,
    });
  }

  members.forEach((member, index) => {
    const name = String(
      member?.name ?? ""
    ).trim();

    const email = String(
      member?.email ?? ""
    )
      .trim()
      .toLowerCase();

    /*
     * NAME
     */

    if (!name) {
      errors[`member-${index}-name`] =
        "Member name is required";
    } else if (name.length < 2) {
      errors[`member-${index}-name`] =
        "Member name must be at least 2 characters";
    } else if (name.length > 60) {
      errors[`member-${index}-name`] =
        "Member name is too long";
    } else if (
      !/^[A-Za-zÀ-ÖØ-öø-ÿ.' -]+$/.test(
        name
      )
    ) {
      errors[`member-${index}-name`] =
        "Member name contains invalid characters";
    }

    /*
     * EMAIL
     */

    if (!email) {
      errors[`member-${index}-email`] =
        "Member email is required";
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        email
      )
    ) {
      errors[`member-${index}-email`] =
        "Enter a valid email";
    }

    /*
     * Add email for duplicate checking.
     */

    if (email) {
      emails.push({
        email,
        index,
      });
    }
  });

  /*
   * DUPLICATE EMAIL CHECK
   *
   * This catches:
   *
   * Leader ↔ Member
   * Member ↔ Member
   */

  const emailMap = new Map();

  emails.forEach(({ email, index }) => {
    if (!emailMap.has(email)) {
      emailMap.set(email, []);
    }

    emailMap
      .get(email)
      .push(index);
  });

  emailMap.forEach((indexes) => {
    if (indexes.length <= 1) {
      return;
    }

    indexes.forEach((index) => {
      /*
       * Primary participant
       */

      if (index === -1) {
        return;
      }

      errors[`member-${index}-email`] =
        "This email is already used by another participant";
    });

    /*
     * If the duplicate is the primary
     * participant, mark the member fields.
     *
     * The primary field itself is already
     * validated separately.
     */
  });

  return errors;
}

// ─────────────────────────────────────────────
// Payment validation
//
// Payment flow:
//
// GPay QR / GPay Number
//        ↓
// Make payment
//        ↓
// Send screenshot to coordinator
//        ↓
// Tick confirmation checkbox
//
// No Razorpay.
// No online payment gateway.
// ─────────────────────────────────────────────

export function validatePaymentScreenshot(
  screenshotShared,
  paymentRequired = true
) {
  if (!paymentRequired) {
    return null;
  }

  if (!screenshotShared) {
    return "Please confirm that you have sent the payment screenshot to the event coordinator";
  }

  return null;
}

// ─────────────────────────────────────────────
// Optional transaction/reference validation
//
// Kept for compatibility with existing code.
//
// This is NOT mandatory for the new GPay
// screenshot-based flow.
// ─────────────────────────────────────────────

export function validatePaymentReference(
  referenceId,
  paymentRequired = false
) {
  /*
   * New payment flow does not require
   * a transaction reference.
   */

  if (!paymentRequired) {
    return null;
  }

  const value = String(
    referenceId ?? ""
  ).trim();

  if (!value) {
    return "Enter your UPI transaction reference";
  }

  if (value.length < 6) {
    return "Transaction reference is too short";
  }

  if (value.length > 50) {
    return "Transaction reference is too long";
  }

  return null;
}

// ─────────────────────────────────────────────
// Complete registration validation
// ─────────────────────────────────────────────

export function validateRegistrationForm({
  form,
  selectedEvent,
  maxTeamSize = null,
  paymentRequired = true,
}) {
  const errors = {};

  /*
   * PERSONAL DETAILS
   */

  const nameError = validateName(
    form?.name
  );

  if (nameError) {
    errors.name = nameError;
  }

  const emailError = validateEmail(
    form?.email
  );

  if (emailError) {
    errors.email = emailError;
  }

  const phoneError = validatePhone(
    form?.phone
  );

  if (phoneError) {
    errors.phone = phoneError;
  }

  const collegeError = validateCollege(
    form?.college
  );

  if (collegeError) {
    errors.college = collegeError;
  }

  const departmentError =
    validateDepartment(
      form?.department
    );

  if (departmentError) {
    errors.department =
      departmentError;
  }

  const yearError = validateYear(
    form?.year
  );

  if (yearError) {
    errors.year = yearError;
  }

  /*
   * EVENT
   */

  const eventError = validateEvent(
    form?.eventSlug
  );

  if (eventError) {
    errors.eventSlug = eventError;
  }

  /*
   * TEAM SIZE
   */

  const teamSizeError =
    validateTeamSize(
      form?.teamSize,
      selectedEvent,
      maxTeamSize
    );

  if (teamSizeError) {
    errors.teamSize =
      teamSizeError;
  }

  /*
   * TEAM MEMBERS
   *
   * Only required when teamSize > 1.
   *
   * Solo registration:
   *
   * teamSize = 1
   * members = []
   *
   * No extra fields required.
   */

  const memberErrors =
    validateTeamMembers(
      form?.members || [],
      form?.email || "",
      Number(form?.teamSize) || 1
    );

  Object.assign(
    errors,
    memberErrors
  );

  /*
   * PAYMENT
   *
   * New flow:
   *
   * QR → GPay → Screenshot →
   * Coordinator → Checkbox
   */

  const paymentError =
    validatePaymentScreenshot(
      form?.paymentScreenshotShared,
      paymentRequired
    );

  if (paymentError) {
    errors.paymentScreenshotShared =
      paymentError;
  }

  return errors;
}