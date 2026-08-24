// validation.js

// ─────────────────────────────────────────────
// Basic validators
// ─────────────────────────────────────────────

export function validateName(name) {
  const value = name.trim();

  if (!value) return "Full name is required";
  if (value.length < 2) return "Name must be at least 2 characters";
  if (value.length > 60) return "Name must not exceed 60 characters";

  if (!/^[A-Za-zÀ-ÖØ-öø-ÿ.' -]+$/.test(value)) {
    return "Name contains invalid characters";
  }

  return null;
}


export function validateEmail(email) {
  const value = email.trim().toLowerCase();

  if (!value) return "Email is required";
  if (value.length > 254) return "Email is too long";

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    return "Enter a valid email address";
  }

  return null;
}


export function validatePhone(phone) {
  const value = phone.trim();

  if (!value) return "Mobile number is required";

  if (!/^[6-9]\d{9}$/.test(value)) {
    return "Enter a valid 10-digit mobile number";
  }

  return null;
}


export function validateCollege(college) {
  const value = college.trim();

  if (!value) return "College name is required";
  if (value.length < 2) return "College name is too short";
  if (value.length > 150) return "College name is too long";

  return null;
}


export function validateDepartment(department) {
  const value = department.trim();

  if (!value) return "Department is required";
  if (value.length > 100) return "Department name is too long";

  return null;
}


export function validateYear(year) {
  const value = year.trim();

  if (!value) return "Year of study is required";

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
// Event / Team validation
// ─────────────────────────────────────────────

export function validateEvent(eventSlug) {
  if (!eventSlug || !eventSlug.trim()) {
    return "Please select an event";
  }

  return null;
}


export function validateTeamSize(teamSize, event = null) {
  const size = Number(teamSize);

  if (!Number.isInteger(size)) {
    return "Team size must be a whole number";
  }

  if (size < 1) {
    return "Team must have at least 1 member";
  }

  // If your event contains min/max team size,
  // enforce those values here.
  if (event) {
    if (
      event.min_team_size != null &&
      size < event.min_team_size
    ) {
      return `This event requires at least ${event.min_team_size} members`;
    }

    if (
      event.max_team_size != null &&
      size > event.max_team_size
    ) {
      return `This event allows a maximum of ${event.max_team_size} members`;
    }
  }

  return null;
}


// ─────────────────────────────────────────────
// Team member validation
// ─────────────────────────────────────────────

export function validateTeamMembers(members, primaryEmail) {
  const errors = {};

  const primary = primaryEmail.trim().toLowerCase();

  if (!Array.isArray(members)) {
    return {
      members: "Invalid team member data",
    };
  }

  const emails = [primary];

  members.forEach((member, index) => {
    const name = member.name.trim();
    const email = member.email.trim().toLowerCase();

    if (!name) {
      errors[`member-${index}-name`] = "Member name is required";
    } else if (name.length < 2) {
      errors[`member-${index}-name`] =
        "Member name must be at least 2 characters";
    } else if (name.length > 60) {
      errors[`member-${index}-name`] =
        "Member name is too long";
    }

    if (!email) {
      errors[`member-${index}-email`] =
        "Member email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors[`member-${index}-email`] =
        "Enter a valid email";
    }

    emails.push(email);
  });

  // Check duplicate emails
  const validEmails = emails.filter(Boolean);

  const duplicates = validEmails.filter(
    (email, index) =>
      validEmails.indexOf(email) !== index
  );

  if (duplicates.length > 0) {
    members.forEach((member, index) => {
      const email = member.email.trim().toLowerCase();

      if (email && duplicates.includes(email)) {
        errors[`member-${index}-email`] =
          "This email is already used by another participant";
      }
    });
  }

  return errors;
}


// ─────────────────────────────────────────────
// Payment validation
// ─────────────────────────────────────────────

export function validatePaymentReference(
  referenceId,
  paymentRequired
) {
  if (!paymentRequired) {
    return null;
  }

  const value = referenceId.trim();

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
// Complete form validation
// ─────────────────────────────────────────────

export function validateRegistrationForm({
  form,
  selectedEvent,
}) {
  const errors = {};

  const nameError = validateName(form.name);
  if (nameError) errors.name = nameError;

  const emailError = validateEmail(form.email);
  if (emailError) errors.email = emailError;

  const phoneError = validatePhone(form.phone);
  if (phoneError) errors.phone = phoneError;

  const collegeError = validateCollege(form.college);
  if (collegeError) errors.college = collegeError;

  const departmentError = validateDepartment(form.department);
  if (departmentError) errors.department = departmentError;

  const yearError = validateYear(form.year);
  if (yearError) errors.year = yearError;

  const eventError = validateEvent(form.eventSlug);
  if (eventError) errors.eventSlug = eventError;

  const teamSizeError = validateTeamSize(
    form.teamSize,
    selectedEvent
  );

  if (teamSizeError) {
    errors.teamSize = teamSizeError;
  }

  // Team members
  const memberErrors = validateTeamMembers(
    form.members,
    form.email
  );

  Object.assign(errors, memberErrors);

  // Payment
  const paymentRequired =
    selectedEvent &&
    typeof selectedEvent.fee === "number" &&
    selectedEvent.fee > 0;

  const paymentError = validatePaymentReference(
    form.referenceId,
    paymentRequired
  );

  if (paymentError) {
    errors.referenceId = paymentError;
  }

  return errors;
}