/*
=========================================================
REVIBE '26 - REGISTRATION CONFIGURATION
=========================================================

This file contains registration-specific configuration.

Do NOT put Supabase/database logic here.

Team rule:
Every event allows a minimum of 1 participant.
The maximum is based on the official event team size.

Example:
Min: 1 | Max: 4

If participant selects:
1 -> only primary participant
2 -> primary + 1 member
3 -> primary + 2 members
4 -> primary + 3 members
=========================================================
*/

export const registrationEvents = {
  "paper-presentation": {
    minTeamSize: 1,
    maxTeamSize: 2,
    fee: 100,
    feeType: "per_person",
  },

  "mini-hackathon": {
    minTeamSize: 1,
    maxTeamSize: 2,
    fee: 50,
    feeType: "per_person",
  },

  "technical-quiz": {
    minTeamSize: 1,
    maxTeamSize: 2,
    fee: 50,
    feeType: "per_person",
  },

  "coding-debugging": {
    minTeamSize: 1,
    maxTeamSize: 2,
    fee: 50,
    feeType: "per_person",
  },

  "shark-tank": {
    minTeamSize: 1,
    maxTeamSize: 2,
    fee: 50,
    feeType: "per_person",
  },

  "prompt-wars": {
    minTeamSize: 1,
    maxTeamSize: 2,
    fee: 50,
    feeType: "per_person",
  },

  mehandi: {
    minTeamSize: 1,
    maxTeamSize: 1,
    fee: 50,
    feeType: "per_person",
  },

  "cooking-without-fire": {
    minTeamSize: 2,
    maxTeamSize: 3,
    fee: 0,
    feeType: "per_team_tiered",
    feeTiers: {
      2: 100,
      3: 150,
    },
  },

  "ipl-auction": {
    minTeamSize: 5,
    maxTeamSize: 5,
    fee: 200,
    feeType: "per_team",
  },

  "art-painting": {
    minTeamSize: 1,
    maxTeamSize: 1,
    fee: 50,
    feeType: "per_person",
  },

  connection: {
    minTeamSize: 1,
    maxTeamSize: 2,
    fee: 50,
    feeType: "per_person",
  },

  chess: {
    minTeamSize: 1,
    maxTeamSize: 1,
    fee: 50,
    feeType: "per_person",
  },

  "free-fire": {
    minTeamSize: 1,
    maxTeamSize: 4,
    fee: 50,
    feeType: "per_person",
  },
};

/*
=========================================================
PAYMENT DETAILS
=========================================================

Replace these with the real GPay details before
production deployment.
=========================================================
*/

export const paymentData = {
  upiId: "mohammedabbas2729-1@okhdfcbank",
  gpayNumber: "+919486976316",

  qrImage: "/gpay-qr.jpeg",

  paymentMethod: "Google Pay",

  instructions: [
    "Scan the GPay QR code or use the GPay number.",
    "Complete the required payment.",
    "Take a screenshot of the successful payment.",
    "Send the screenshot to the respective event coordinator.",
    "Tick the confirmation checkbox after sending the screenshot.",
    "Submit the registration form.",
  ],

  verificationNote:
    "Your registration is considered confirmed only after the payment has been successfully verified.",
};

/*
=========================================================
HELPERS
=========================================================
*/

export function getRegistrationConfig(slug) {
  return (
    registrationEvents[slug] || {
      minTeamSize: 1,
      maxTeamSize: 1,
      fee: 0,
      feeType: "per_person",
    }
  );
}

export function getTotalFee(slug, teamSize) {
  const config = getRegistrationConfig(slug);

  if (config.feeType === "per_team_tiered") {
    return config.feeTiers?.[teamSize] || 0;
  }

  if (!config.fee || config.fee <= 0) {
    return 0;
  }

  if (config.feeType === "per_team") {
    return config.fee;
  }

  return config.fee * teamSize;
}

export function getFeeLabel(slug) {
  const config = getRegistrationConfig(slug);

  if (config.feeType === "per_team_tiered") {
    const tiers = config.feeTiers || {};
    const entries = Object.entries(tiers);
    if (entries.length > 0) {
      return entries.map(([size, fee]) => `₹${fee} (${size})`).join(" / ");
    }
    return "Tiered pricing";
  }

  if (!config.fee || config.fee <= 0) {
    return "Free";
  }

  return config.feeType === "per_team"
    ? `₹${config.fee} / team`
    : `₹${config.fee} / person`;
}