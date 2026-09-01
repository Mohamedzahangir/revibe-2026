import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  BadgeCheck,
  Clock,
  IndianRupee,
  Search,
  RefreshCw,
  LogOut,
  Loader2,
  AlertCircle,
  X,
  Image as ImageIcon,
  Clipboard,
  Check,
  Filter,
  UsersRound,
  CalendarDays,
} from "lucide-react";

import { supabase } from "../services/supabase";
import Header from "../components/navigation/Header";



/*
=========================================================
REVIBE '26 — ADMIN DASHBOARD
=========================================================

DATA SOURCE:
public.overall

ADMIN CAN:
- View ALL registrations
- Search registrations
- Filter by event
- Filter by payment status
- Filter by registration type
- View complete registration details
- View team lead
- View team members
- View selected events
- View payment details
- Verify pending payments

PAYMENT VERIFICATION:
When admin verifies a payment:

payment_status = "paid"
paid_at        = current timestamp
verified_at    = current timestamp
registration_status = "confirmed"
=========================================================
*/

/* ======================================================
   HELPERS
====================================================== */

function normalize(value) {
  return String(value || "").trim().toLowerCase();
}

function safeArray(value) {
  return Array.isArray(value) ? value : [];
}

function formatCurrency(value) {
  const amount = Number(value || 0);

  return `₹${amount.toLocaleString("en-IN")}`;
}

function formatDate(value) {
  if (!value) return "—";

  try {
    return new Date(value).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
}

/*
  Supabase stores verified payments as:

  payment_status = "paid"

  We also support "verified" here in case
  older records already contain that value.
*/
function isPaid(row) {
  const status = normalize(row?.payment_status);

  return status === "paid" || status === "verified";
}

function normalizeParticipant(participant = {}) {
  // JSONB can contain slightly different key names depending
  // on which registration form created the record.
  return {
    full_name:
      participant.full_name ||
      participant.fullName ||
      participant.name ||
      participant.student_name ||
      participant.studentName ||
      "",

    email:
      participant.email ||
      participant.student_email ||
      participant.studentEmail ||
      "",

    phone:
      participant.phone ||
      participant.mobile ||
      participant.mobile_number ||
      participant.mobileNumber ||
      participant.student_phone ||
      participant.studentPhone ||
      "",

    college_name:
      participant.college_name ||
      participant.college ||
      participant.collegeName ||
      "",

    department:
      participant.department ||
      participant.dept ||
      "",

    year:
      participant.year ||
      participant.study_year ||
      participant.studyYear ||
      "",

    role:
      participant.role ||
      participant.member_role ||
      "member",
  };
}

function getAllParticipants(row) {
  const teamMembers = safeArray(row?.team_members);

  if (teamMembers.length > 0) {
    return teamMembers.map(normalizeParticipant);
  }

  return [
    normalizeParticipant({
      full_name: row?.full_name,
      email: row?.email,
      phone: row?.phone,
      college_name: row?.college_name,
      department: row?.department,
      year: row?.year,
      role: "leader",
    }),
  ];
}

function getLeader(row) {
  const participants = getAllParticipants(row);

  return (
    participants.find(
      (participant) =>
        normalize(participant.role) === "leader"
    ) ||
    participants[0] ||
    normalizeParticipant()
  );
}

function normalizeSelectedEvent(event = {}) {
  // selected_events may contain objects OR plain event slugs.
  if (typeof event === "string") {
    return {
      event_name: event,
      slug: event,
      participant_count: null,
    };
  }

  return {
    event_name:
      event?.event_name ||
      event?.eventName ||
      event?.name ||
      event?.title ||
      event?.event_title ||
      event?.eventTitle ||
      event?.slug ||
      event?.event_id ||
      event?.eventId ||
      "Unknown Event",

    slug:
      event?.slug ||
      event?.event_slug ||
      event?.eventSlug ||
      "",

    participant_count:
      event?.participant_count ??
      event?.participantCount ??
      event?.participants_count ??
      event?.participantsCount ??
      null,
  };
}

function getEventNames(row) {
  return safeArray(row?.selected_events)
    .map((event) => normalizeSelectedEvent(event).event_name)
    .filter(Boolean);
}

/* ======================================================
   COMPONENT
====================================================== */

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [registrations, setRegistrations] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");

  const [eventFilter, setEventFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const [selectedRegistration, setSelectedRegistration] =
    useState(null);

  const [copiedPhone, setCopiedPhone] = useState("");

  const [verifyingId, setVerifyingId] = useState(null);
  const [verifyError, setVerifyError] = useState("");

  /* ======================================================
     FETCH ALL REGISTRATIONS
  ====================================================== */

  async function fetchRegistrations({ showRefresh = false } = {}) {
    if (showRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    try {
      const { data, error: overallError } = await supabase
        .from("overall")
        .select(`
          id,
          registration_number,
          registration_type,
          team_name,
          registration_status,

          full_name,
          email,
          phone,

          college_name,
          department,
          year,

          selected_events,
          team_members,

          total_amount,

          payment_status,
          payment_method,
          transaction_reference,
          payment_screenshot_url,

          paid_at,
          verified_at,
          payment_notes,

          registered_at,
          created_at,
          updated_at
        `)
        .order("created_at", {
          ascending: false,
        });

      if (overallError) {
        throw overallError;
      }

      setRegistrations(safeArray(data));
    } catch (fetchError) {
      console.error(
        "Admin dashboard error:",
        fetchError
      );

      setRegistrations([]);

      const message = String(
        fetchError?.message || ""
      );

      if (
        message
          .toLowerCase()
          .includes("permission denied")
      ) {
        setError(
          'Permission denied reading "overall". The authenticated role needs SELECT permission on public.overall.'
        );
      } else {
        setError(
          message ||
            "Unable to load admin dashboard."
        );
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  /* ======================================================
     INITIAL LOAD
  ====================================================== */

  useEffect(() => {
    let mounted = true;

    async function initializeDashboard() {
      try {
        setLoading(true);
        setError("");

        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) {
          throw sessionError;
        }

        if (!session?.user) {
          if (mounted) {
            setLoading(false);
            navigate("/login", { replace: true });
          }

          return;
        }

        if (mounted) {
          await fetchRegistrations();
        }
      } catch (err) {
        console.error(
          "Dashboard initialization error:",
          err
        );

        if (mounted) {
          setLoading(false);

          setError(
            err?.message ||
              "Unable to initialize admin dashboard."
          );
        }
      }
    }

    initializeDashboard();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        console.log(
          "[AdminDashboard] Auth event:",
          event,
          session?.user?.id
        );

        if (!session?.user) {
          setRegistrations([]);
          setLoading(false);

          navigate("/login", {
            replace: true,
          });

          return;
        }

        if (
          event === "SIGNED_IN" ||
          event === "TOKEN_REFRESHED" ||
          event === "INITIAL_SESSION"
        ) {
          await fetchRegistrations();
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [navigate]);

  /* ======================================================
     LOGOUT
  ====================================================== */

  async function handleLogout() {
    try {
      await supabase.auth.signOut();
    } catch (logoutError) {
      console.error(
        "Logout error:",
        logoutError
      );
    }

    navigate("/login");
  }

  /* ======================================================
     COPY PHONE
  ====================================================== */

  async function handleCopyPhone(phone) {
    if (!phone) return;

    try {
      await navigator.clipboard.writeText(
        String(phone)
      );

      setCopiedPhone(String(phone));

      window.setTimeout(() => {
        setCopiedPhone("");
      }, 1600);
    } catch (copyError) {
      console.error(
        "Unable to copy phone:",
        copyError
      );
    }
  }

  /* ======================================================
     VERIFY PAYMENT
  ====================================================== */

  async function handleVerifyPayment(row) {
  if (!row?.id) {
    return;
  }

  if (verifyingId === row.id) {
    return;
  }

  if (isPaid(row)) {
    return;
  }

  setVerifyingId(row.id);
  setVerifyError("");

  const verificationTime =
    new Date().toISOString();

  try {
    /*
    =====================================================
    UPDATE SUPABASE
    =====================================================
    */

    const { data: updatedRow, error: updateError } =
      await supabase
        .from("overall")
        .update({
          payment_status: "paid",
          paid_at: verificationTime,
          verified_at: verificationTime,
          registration_status: "confirmed",
          updated_at: verificationTime,
        })
        .eq("id", row.id)
        .select(`
          id,
          payment_status,
          paid_at,
          verified_at,
          registration_status,
          updated_at
        `)
        .maybeSingle();

    /*
    =====================================================
    DATABASE ERROR
    =====================================================
    */

    if (updateError) {
      throw updateError;
    }

    /*
    =====================================================
    IMPORTANT:
    If updatedRow is null, Supabase did NOT return
    an updated record.

    This usually means:
    - RLS UPDATE policy problem
    - Wrong row ID
    - authenticated user cannot update this row
    =====================================================
    */

    if (!updatedRow) {
      throw new Error(
        "Payment update was not applied in Supabase. Check the UPDATE policy on public.overall."
      );
    }

    /*
    =====================================================
    VERIFY ACTUAL DATABASE VALUE
    =====================================================
    */

    if (
      normalize(updatedRow.payment_status) !==
      "paid"
    ) {
      throw new Error(
        `Supabase update returned payment_status="${updatedRow.payment_status}" instead of "paid".`
      );
    }

    /*
    =====================================================
    UPDATE TABLE STATE
    =====================================================
    */

    setRegistrations((current) =>
      current.map((registration) =>
        registration.id === row.id
          ? {
              ...registration,
              payment_status:
                updatedRow.payment_status,
              paid_at:
                updatedRow.paid_at,
              verified_at:
                updatedRow.verified_at,
              registration_status:
                updatedRow.registration_status,
              updated_at:
                updatedRow.updated_at,
            }
          : registration
      )
    );

    /*
    =====================================================
    UPDATE MODAL STATE
    =====================================================
    */

    setSelectedRegistration((current) => {
      if (
        !current ||
        current.id !== row.id
      ) {
        return current;
      }

      return {
        ...current,
        payment_status:
          updatedRow.payment_status,
        paid_at:
          updatedRow.paid_at,
        verified_at:
          updatedRow.verified_at,
        registration_status:
          updatedRow.registration_status,
        updated_at:
          updatedRow.updated_at,
      };
    });

    /*
    =====================================================
    FINAL REFRESH FROM SUPABASE
    =====================================================
    */

    await fetchRegistrations({
      showRefresh: true,
    });

  } catch (verifyErr) {
    console.error(
      "Verify payment error:",
      verifyErr
    );

    const message = String(
      verifyErr?.message || ""
    );

    if (
      message
        .toLowerCase()
        .includes("permission denied")
    ) {
      setVerifyError(
        "Permission denied. The authenticated role needs UPDATE permission on public.overall."
      );
    } else {
      setVerifyError(
        message ||
          "Could not verify this payment."
      );
    }
  } finally {
    setVerifyingId(null);
  }
}

  /* ======================================================
     EVENT FILTER OPTIONS
  ====================================================== */

  const eventOptions = useMemo(() => {
    const eventSet = new Map();

    registrations.forEach((row) => {
      safeArray(row.selected_events).forEach(
        (event) => {
          const label =
            normalizeSelectedEvent(event)
              .event_name;

          if (!label) return;

          const key = normalize(label);

          if (!eventSet.has(key)) {
            eventSet.set(key, label);
          }
        }
      );
    });

    return Array.from(eventSet.entries())
      .map(([value, label]) => ({
        value,
        label,
      }))
      .sort((a, b) =>
        a.label.localeCompare(b.label)
      );
  }, [registrations]);

  /* ======================================================
     FILTERED REGISTRATIONS
  ====================================================== */

  const filteredRegistrations = useMemo(() => {
    const query = normalize(searchTerm);

    return registrations.filter((row) => {
      const participants =
        getAllParticipants(row);

      const participantText =
        participants
          .map((participant) =>
            [
              participant.full_name,
              participant.email,
              participant.phone,
              participant.college_name,
              participant.department,
              participant.year,
              participant.role,
            ]
              .filter(Boolean)
              .join(" ")
          )
          .join(" ");

      const eventText =
        getEventNames(row).join(" ");

      const searchableText = [
        row.registration_number,
        row.registration_type,
        row.team_name,

        row.full_name,
        row.email,
        row.phone,

        row.college_name,
        row.department,
        row.year,

        row.payment_status,
        row.payment_method,

        eventText,
        participantText,
      ]
        .filter(Boolean)
        .join(" ");

      if (
        query &&
        !normalize(searchableText).includes(query)
      ) {
        return false;
      }

      /* EVENT */

      if (eventFilter !== "all") {
        const matchesEvent = safeArray(
          row.selected_events
        ).some((event) => {
          const normalizedEvent =
            normalizeSelectedEvent(event);

          return (
            normalize(
              normalizedEvent.event_name
            ) === normalize(eventFilter)
          );
        });

        if (!matchesEvent) {
          return false;
        }
      }

      /* PAYMENT */

      if (paymentFilter === "paid") {
        if (!isPaid(row)) {
          return false;
        }
      }

      if (paymentFilter === "pending") {
        if (isPaid(row)) {
          return false;
        }
      }

      /* REGISTRATION TYPE */

      if (
        typeFilter !== "all" &&
        normalize(
          row.registration_type
        ) !== normalize(typeFilter)
      ) {
        return false;
      }

      return true;
    });
  }, [
    registrations,
    searchTerm,
    eventFilter,
    paymentFilter,
    typeFilter,
  ]);

  /* ======================================================
     STATS
  ====================================================== */

  const stats = useMemo(() => {
    let totalParticipants = 0;
    let paidParticipants = 0;
    let pendingParticipants = 0;

    let totalCollection = 0;
    let pendingAmount = 0;

    registrations.forEach((row) => {
      const participants =
        getAllParticipants(row);

      const count =
        participants.length || 1;

      totalParticipants += count;

      if (isPaid(row)) {
        paidParticipants += count;

        totalCollection += Number(
          row.total_amount || 0
        );
      } else {
        pendingParticipants += count;

        pendingAmount += Number(
          row.total_amount || 0
        );
      }
    });

    return {
      totalRegistrations:
        registrations.length,

      totalParticipants,

      paidParticipants,

      pendingParticipants,

      totalCollection,

      pendingAmount,
    };
  }, [registrations]);

  /* ======================================================
     RENDER
  ====================================================== */

  return (
    <>
      <main className="admin-page">
        <div className="admin-shell">

          {/* HERO */}

          <section className="admin-hero">
            <div>
              <p className="admin-eyebrow">
                REVIBE '26
              </p>

              <h1 className="admin-title">
                Admin Dashboard
              </h1>

              <div className="admin-badges">
                <span className="admin-badge admin-badge-role">
                  Administrator
                </span>

                <span className="admin-badge admin-badge-master">
                  All Registrations
                </span>
              </div>
            </div>

            <div className="admin-hero-actions">
              <button
                type="button"
                className="admin-btn admin-btn-secondary"
                onClick={() =>
                  fetchRegistrations({
                    showRefresh: true,
                  })
                }
                disabled={
                  loading || refreshing
                }
              >
                {refreshing ? (
                  <Loader2
                    size={16}
                    className="admin-spin"
                  />
                ) : (
                  <RefreshCw size={16} />
                )}

                Refresh
              </button>

              <button
                type="button"
                className="admin-btn admin-btn-danger"
                onClick={handleLogout}
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          </section>

          {/* ERROR */}

          {error && (
            <section className="admin-error">
              <AlertCircle size={21} />

              <div>
                <p className="admin-error-title">
                  Dashboard could not load
                </p>

                <p className="admin-error-message">
                  {error}
                </p>

                <button
                  type="button"
                  className="admin-btn admin-btn-danger admin-error-btn"
                  onClick={() =>
                    fetchRegistrations()
                  }
                >
                  Try Again
                </button>
              </div>
            </section>
          )}

          {/* STATS */}

          <section className="admin-stats">
            <AdminStatCard
              label="Registrations"
              value={
                loading
                  ? null
                  : stats.totalRegistrations
              }
              icon={<Clipboard size={23} />}
              tone="red"
            />

            <AdminStatCard
              label="Total Students"
              value={
                loading
                  ? null
                  : stats.totalParticipants
              }
              icon={<Users size={23} />}
              tone="blue"
            />

            <AdminStatCard
              label="Paid Students"
              value={
                loading
                  ? null
                  : stats.paidParticipants
              }
              icon={<BadgeCheck size={23} />}
              tone="green"
            />

            <AdminStatCard
              label="Pending Payments"
              value={
                loading
                  ? null
                  : stats.pendingParticipants
              }
              icon={<Clock size={23} />}
              tone="amber"
            />

            <AdminStatCard
              label="Verified Collection"
              value={
                loading
                  ? null
                  : formatCurrency(
                      stats.totalCollection
                    )
              }
              icon={<IndianRupee size={23} />}
              tone="gold"
            />
          </section>

          {/* FILTERS */}

          <section className="admin-filter-panel">
            <div className="admin-filter-heading">
              <Filter size={17} />
              <span>
                Registration Filters
              </span>
            </div>

            <div className="admin-search-wrap">
              <Search
                size={18}
                className="admin-search-icon"
              />

              <input
                type="text"
                className="admin-search-input"
                value={searchTerm}
                onChange={(event) =>
                  setSearchTerm(
                    event.target.value
                  )
                }
                placeholder="Search by name, registration number, team, email, phone, college..."
              />
            </div>

            <div className="admin-filter-grid">

              {/* EVENT */}

              <div className="admin-select-wrap">
                <label>
                  <CalendarDays size={14} />
                  Event
                </label>

                <select
                  value={eventFilter}
                  onChange={(event) =>
                    setEventFilter(
                      event.target.value
                    )
                  }
                >
                  <option value="all">
                    All Events
                  </option>

                  {eventOptions.map(
                    (event) => (
                      <option
                        key={event.value}
                        value={event.value}
                      >
                        {event.label}
                      </option>
                    )
                  )}
                </select>
              </div>

              {/* PAYMENT */}

              <div className="admin-select-wrap">
                <label>
                  <IndianRupee size={14} />
                  Payment
                </label>

                <select
                  value={paymentFilter}
                  onChange={(event) =>
                    setPaymentFilter(
                      event.target.value
                    )
                  }
                >
                  <option value="all">
                    All Payments
                  </option>

                  <option value="paid">
                    Paid / Verified
                  </option>

                  <option value="pending">
                    Pending
                  </option>
                </select>
              </div>

              {/* TYPE */}

              <div className="admin-select-wrap">
                <label>
                  <UsersRound size={14} />
                  Registration Type
                </label>

                <select
                  value={typeFilter}
                  onChange={(event) =>
                    setTypeFilter(
                      event.target.value
                    )
                  }
                >
                  <option value="all">
                    All Types
                  </option>

                  <option value="individual">
                    Individual
                  </option>

                  <option value="team">
                    Team
                  </option>
                </select>
              </div>
            </div>
          </section>

          {/* RESULT COUNT */}

          <div className="admin-result-bar">
            <span>
              {loading
                ? "Loading registrations..."
                : `${filteredRegistrations.length} registration${
                    filteredRegistrations.length ===
                    1
                      ? ""
                      : "s"
                  } found`}
            </span>

            {(searchTerm ||
              eventFilter !== "all" ||
              paymentFilter !== "all" ||
              typeFilter !== "all") && (
              <button
                type="button"
                className="admin-clear-btn"
                onClick={() => {
                  setSearchTerm("");
                  setEventFilter("all");
                  setPaymentFilter("all");
                  setTypeFilter("all");
                }}
              >
                Clear Filters
              </button>
            )}
          </div>

          {/* TABLE */}

          <section className="admin-table-wrap">
            <div className="admin-table-header">
              <span>
                Team Lead / Student
              </span>

              <span>
                Registration No.
              </span>

              <span>
                Event(s)
              </span>

              <span>
                Type
              </span>

              <span>
                Students
              </span>

              <span>
                Payment
              </span>

              <span>
                Amount
              </span>

              <span>
                Action
              </span>
            </div>

            {loading ? (
              <AdminSkeletonRows />
            ) : filteredRegistrations.length ===
              0 ? (
              <AdminEmptyState />
            ) : (
              filteredRegistrations.map(
                (row) => {
                  const leader =
                    getLeader(row);

                  const events =
                    getEventNames(row);

                  const participantCount =
                    getAllParticipants(row)
                      .length;

                  return (
                    <div
                      className="admin-table-row"
                      key={row.id}
                    >
                      <span className="admin-name-cell">
                        <strong>
                          {leader.full_name ||
                            row.full_name ||
                            "—"}
                        </strong>

                        {row.registration_type ===
                          "team" && (
                          <small>
                            Team Lead
                          </small>
                        )}
                      </span>

                      <span className="admin-mono">
                        {row.registration_number ||
                          "—"}
                      </span>

                      <span className="admin-event-cell">
                        {events.length > 0
                          ? events
                              .slice(0, 2)
                              .join(", ")
                          : "—"}

                        {events.length >
                          2 && (
                          <small>
                            +
                            {events.length -
                              2}{" "}
                            more
                          </small>
                        )}
                      </span>

                      <span>
                        <RegistrationTypeBadge
                          type={
                            row.registration_type
                          }
                        />
                      </span>

                      <span>
                        {participantCount}
                      </span>

                      <span>
                        <PaymentBadge
                          row={row}
                        />
                      </span>

                      <span className="admin-amount">
                        {formatCurrency(
                          row.total_amount
                        )}
                      </span>

                      <span>
                        <button
                          type="button"
                          className="admin-view-btn"
                          onClick={() =>
                            setSelectedRegistration(
                              row
                            )
                          }
                        >
                          View
                        </button>
                      </span>
                    </div>
                  );
                }
              )
            )}
          </section>

          {/* MOBILE */}

          <section className="admin-mobile-list">
            {loading ? (
              <AdminMobileSkeleton />
            ) : filteredRegistrations.length ===
              0 ? (
              <AdminEmptyState />
            ) : (
              filteredRegistrations.map(
                (row) => {
                  const leader =
                    getLeader(row);

                  return (
                    <button
                      type="button"
                      className="admin-mobile-card"
                      key={row.id}
                      onClick={() =>
                        setSelectedRegistration(
                          row
                        )
                      }
                    >
                      <div className="admin-mobile-top">
                        <div>
                          <strong>
                            {leader.full_name ||
                              row.full_name ||
                              "—"}
                          </strong>

                          <small>
                            {row.registration_number ||
                              "—"}
                          </small>
                        </div>

                        <PaymentBadge
                          row={row}
                        />
                      </div>

                      <div className="admin-mobile-info">
                        <span>
                          <b>Type</b>
                          {row.registration_type ||
                            "—"}
                        </span>

                        <span>
                          <b>Students</b>
                          {
                            getAllParticipants(
                              row
                            ).length
                          }
                        </span>

                        <span>
                          <b>Amount</b>
                          {formatCurrency(
                            row.total_amount
                          )}
                        </span>
                      </div>
                    </button>
                  );
                }
              )
            )}
          </section>
        </div>
      </main>

      {/* DETAILS MODAL */}

      {selectedRegistration && (
        <AdminRegistrationModal
          row={selectedRegistration}
          onClose={() => {
            setSelectedRegistration(
              null
            );

            setVerifyError("");
          }}
          onCopyPhone={
            handleCopyPhone
          }
          copiedPhone={copiedPhone}
          onVerify={
            handleVerifyPayment
          }
          verifying={
            verifyingId ===
            selectedRegistration.id
          }
          verifyError={verifyError}
        />
      )}

      <style>{adminStyles}</style>
    </>
  );
}

/* =========================================================
   STAT CARD
========================================================= */

function AdminStatCard({
  label,
  value,
  icon,
  tone = "red",
}) {
  return (
    <div
      className={`admin-stat-card admin-tone-${tone}`}
    >
      <div>
        <p className="admin-stat-label">
          {label}
        </p>

        <p className="admin-stat-value">
          {value === null ? (
            <span className="admin-stat-skeleton" />
          ) : (
            value
          )}
        </p>
      </div>

      <div className="admin-stat-icon">
        {icon}
      </div>
    </div>
  );
}

/* =========================================================
   PAYMENT BADGE
========================================================= */

function PaymentBadge({ row }) {
  const paid = isPaid(row);

  return (
    <span
      className={`admin-payment-badge ${
        paid
          ? "admin-payment-paid"
          : "admin-payment-pending"
      }`}
    >
      {paid ? "Paid" : "Pending"}
    </span>
  );
}

/* =========================================================
   REGISTRATION TYPE
========================================================= */

function RegistrationTypeBadge({ type }) {
  const team =
    normalize(type) === "team";

  return (
    <span
      className={`admin-type-badge ${
        team
          ? "admin-type-team"
          : "admin-type-individual"
      }`}
    >
      {team ? "Team" : "Individual"}
    </span>
  );
}

/* =========================================================
   EMPTY
========================================================= */

function AdminEmptyState() {
  return (
    <div className="admin-empty">
      <Users size={40} />

      <h3>
        No registrations found
      </h3>

      <p>
        Try changing the search or
        filters.
      </p>
    </div>
  );
}

/* =========================================================
   SKELETON
========================================================= */

function AdminSkeletonRows() {
  return (
    <>
      {[1, 2, 3, 4].map(
        (item) => (
          <div
            className="admin-table-row"
            key={item}
          >
            {[
              1,
              2,
              3,
              4,
              5,
              6,
              7,
              8,
            ].map((cell) => (
              <span
                className="admin-skeleton-line"
                key={cell}
              />
            ))}
          </div>
        )
      )}
    </>
  );
}

function AdminMobileSkeleton() {
  return (
    <>
      {[1, 2, 3].map(
        (item) => (
          <div
            className="admin-mobile-card admin-mobile-skeleton"
            key={item}
          >
            <span />
            <span />
            <span />
          </div>
        )
      )}
    </>
  );
}

/* =========================================================
   MODAL
========================================================= */

function AdminRegistrationModal({
  row,
  onClose,
  onCopyPhone,
  copiedPhone,
  onVerify,
  verifying,
  verifyError,
}) {
  const participants =
    getAllParticipants(row);

  const leader = getLeader(row);

  const members =
    participants.filter(
      (participant) =>
        normalize(
          participant.role
        ) !== "leader"
    );

  const isTeam =
    normalize(
      row.registration_type
    ) === "team" ||
    participants.length > 1;

  const paid = isPaid(row);

  const events =
    safeArray(row.selected_events);

  return (
    <div
      className="admin-modal-overlay"
      onClick={onClose}
    >
      <div
        className="admin-modal"
        onClick={(event) =>
          event.stopPropagation()
        }
      >
        {/* HEADER */}

        <div className="admin-modal-header">
          <div>
            <p className="admin-modal-eyebrow">
              Registration Details
            </p>

            <h2>
              {isTeam
                ? "Team Registration"
                : "Individual Registration"}
            </h2>
          </div>

          <button
            type="button"
            className="admin-modal-close"
            onClick={onClose}
          >
            <X size={21} />
          </button>
        </div>

        {/* BODY */}

        <div className="admin-modal-body">

          {/* REGISTRATION */}

          <section className="admin-modal-section">
            <p className="admin-section-title">
              Registration
            </p>

            <AdminDetailRow
              label="Registration Number"
              value={
                row.registration_number ||
                "—"
              }
            />

            <AdminDetailRow
              label="Registration Type"
              value={
                <RegistrationTypeBadge
                  type={
                    row.registration_type
                  }
                />
              }
            />

            <AdminDetailRow
              label="Registration Status"
              value={
                row.registration_status ||
                "—"
              }
            />

            <AdminDetailRow
              label="Registered At"
              value={formatDate(
                row.registered_at ||
                  row.created_at
              )}
            />

            {row.team_name && (
              <AdminDetailRow
                label="Team Name"
                value={row.team_name}
              />
            )}
          </section>

          {/* TEAM LEAD */}

          <section className="admin-modal-section">
            <p className="admin-section-title">
              {isTeam
                ? "Team Lead"
                : "Participant Details"}
            </p>

            <AdminDetailRow
              label="Name"
              value={
                leader.full_name ||
                row.full_name ||
                "—"
              }
            />

            <AdminDetailRow
              label="Email"
              value={
                leader.email ||
                row.email ||
                "—"
              }
            />

            <AdminDetailRow
              label="Phone"
              value={
                leader.phone ||
                row.phone ||
                "—"
              }
              onCopy={() =>
                onCopyPhone(
                  leader.phone ||
                    row.phone
                )
              }
              copied={
                copiedPhone ===
                String(
                  leader.phone ||
                    row.phone ||
                    ""
                )
              }
            />

            <AdminDetailRow
              label="College"
              value={
                leader.college_name ||
                row.college_name ||
                "—"
              }
            />

            <AdminDetailRow
              label="Department"
              value={
                leader.department ||
                row.department ||
                "—"
              }
            />

            <AdminDetailRow
              label="Year"
              value={
                leader.year ||
                row.year ||
                "—"
              }
            />
          </section>

          {/* TEAM MEMBERS */}

          {isTeam && (
            <section className="admin-modal-section">
              <div className="admin-section-title-row">
                <p className="admin-section-title">
                  Team Members
                </p>

                <span className="admin-member-count">
                  {members.length}{" "}
                  {members.length === 1
                    ? "Member"
                    : "Members"}
                </span>
              </div>

              {members.length === 0 ? (
                <div className="admin-no-members">
                  No additional team
                  members found.
                </div>
              ) : (
                <div className="admin-member-list">
                  {members.map(
                    (
                      member,
                      index
                    ) => (
                      <div
                        className="admin-member-card"
                        key={`${member.email}-${index}`}
                      >
                        <div className="admin-member-top">
                          <span className="admin-member-number">
                            {String(
                              index + 1
                            ).padStart(
                              2,
                              "0"
                            )}
                          </span>

                          <div>
                            <strong>
                              {member.full_name ||
                                "Unnamed Member"}
                            </strong>

                            <small>
                              {member.department ||
                                "—"}{" "}
                              •{" "}
                              {member.year ||
                                "—"}
                            </small>
                          </div>
                        </div>

                        <div className="admin-member-details">
                          <AdminMemberDetail
                            label="Email"
                            value={
                              member.email ||
                              "—"
                            }
                          />

                          <AdminMemberDetail
                            label="Phone"
                            value={
                              member.phone ||
                              "—"
                            }
                            onCopy={
                              member.phone
                                ? () =>
                                    onCopyPhone(
                                      member.phone
                                    )
                                : null
                            }
                            copied={
                              copiedPhone ===
                              String(
                                member.phone ||
                                  ""
                              )
                            }
                          />

                          <AdminMemberDetail
                            label="College"
                            value={
                              member.college_name ||
                              "—"
                            }
                          />
                        </div>
                      </div>
                    )
                  )}
                </div>
              )}
            </section>
          )}

          {/* SELECTED EVENTS */}

          <section className="admin-modal-section">
            <p className="admin-section-title">
              Selected Events
            </p>

            <div className="admin-event-list">
              {events.length === 0 ? (
                <span className="admin-muted">
                  No event data
                </span>
              ) : (
                events.map(
                  (event, index) => {
                    const normalizedEvent =
                      normalizeSelectedEvent(event);

                    const eventName =
                      normalizedEvent.event_name;

                    const participantCount =
                      normalizedEvent.participant_count;

                    return (
                      <div
                        className="admin-event-item"
                        key={
                          (typeof event === "object" &&
                            (event?.event_id ||
                              event?.eventId ||
                              event?.slug)) ||
                          normalizedEvent.slug ||
                          `${eventName}-${index}`
                        }
                      >
                        <div>
                          <strong>
                            {eventName}
                          </strong>

                          {normalizedEvent.slug &&
                            normalizedEvent.slug !==
                              eventName && (
                            <small>
                              {normalizedEvent.slug}
                            </small>
                          )}
                        </div>

                        {participantCount !== null &&
                          participantCount !==
                            undefined && (
                          <span>
                            {participantCount}{" "}
                            {Number(participantCount) ===
                            1
                              ? "Participant"
                              : "Participants"}
                          </span>
                        )}
                      </div>
                    );
                  }
                )
              )}
            </div>
          </section>

          {/* PAYMENT */}

          <section className="admin-modal-section">
            <p className="admin-section-title">
              Payment Details
            </p>

            <AdminDetailRow
              label="Payment Status"
              value={
                <PaymentBadge
                  row={row}
                />
              }
            />

            <AdminDetailRow
              label="Payment Method"
              value={
                row.payment_method ||
                "—"
              }
            />

            <AdminDetailRow
              label="Total Amount"
              value={formatCurrency(
                row.total_amount
              )}
            />


            <AdminDetailRow
              label="Verified At"
              value={formatDate(
                row.verified_at
              )}
            />
  
            {/* VERIFY */}

            {!paid && (
              <div className="admin-verify-box">
                <button
                  type="button"
                  className="admin-btn admin-btn-primary"
                  onClick={() =>
                    onVerify(row)
                  }
                  disabled={verifying}
                >
                  {verifying ? (
                    <Loader2
                      size={16}
                      className="admin-spin"
                    />
                  ) : (
                    <BadgeCheck
                      size={16}
                    />
                  )}

                  {verifying
                    ? "Verifying..."
                    : "Mark Payment as Verified"}
                </button>

                {verifyError && (
                  <p className="admin-verify-error">
                    {verifyError}
                  </p>
                )}
              </div>
            )}

            {/* PAID CONFIRMATION */}

            {paid && (
              <div className="admin-paid-confirmation">
                <BadgeCheck size={17} />

                <span>
                  Payment has been
                  verified successfully.
                </span>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   DETAIL ROW
========================================================= */

function AdminDetailRow({
  label,
  value,
  onCopy,
  copied,
}) {
  return (
    <div className="admin-detail-row">
      <span className="admin-detail-label">
        {label}
      </span>

      <span className="admin-detail-value">
        {value}

        {onCopy && (
          <button
            type="button"
            className="admin-copy-btn"
            onClick={onCopy}
          >
            {copied ? (
              <Check size={12} />
            ) : (
              <Clipboard size={12} />
            )}
          </button>
        )}
      </span>
    </div>
  );
}

/* =========================================================
   MEMBER DETAIL
========================================================= */

function AdminMemberDetail({
  label,
  value,
  onCopy,
  copied,
}) {
  return (
    <div className="admin-member-detail">
      <small>
        {label}
      </small>

      <div>
        <span>
          {value}
        </span>

        {onCopy && (
          <button
            type="button"
            className="admin-copy-btn"
            onClick={onCopy}
          >
            {copied ? (
              <Check size={12} />
            ) : (
              <Clipboard size={12} />
            )}
          </button>
        )}
      </div>
    </div>
  );
}

/* =========================================================
   STYLES
========================================================= */

const adminStyles = `
  .admin-page {
    min-height: 100vh;
    background: #fdf9fa;
    color: #181414;
    padding: 2rem 0 5rem;
    box-sizing: border-box;
  }

  .admin-shell {
    width: min(1440px, calc(100% - 2rem));
    margin: 0 auto;
  }

  .admin-hero {
    background: #ffffff;
    border: 1px solid rgba(220, 0, 0, 0.14);
    border-radius: 22px;
    padding: 1.8rem 2rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1.5rem;
    margin-bottom: 1.25rem;
    box-shadow: 0 10px 30px rgba(0,0,0,0.045);
  }

  .admin-eyebrow {
    margin: 0 0 0.35rem;
    font-family: 'Orbitron', sans-serif;
    font-size: 0.68rem;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: #dc0000;
  }

  .admin-title {
    margin: 0 0 0.8rem;
    font-family: 'Bangers', cursive;
    font-size: clamp(2rem, 4vw, 3rem);
    letter-spacing: 0.035em;
    color: #161313;
  }

  .admin-badges {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .admin-badge {
    display: inline-flex;
    align-items: center;
    padding: 0.42rem 0.85rem;
    border-radius: 999px;
    font-family: 'Orbitron', sans-serif;
    font-size: 0.63rem;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }

  .admin-badge-role {
    color: #b91c1c;
    background: rgba(220,0,0,0.07);
    border: 1px solid rgba(220,0,0,0.18);
  }

  .admin-badge-master {
    color: #6b4d00;
    background: rgba(245,197,66,0.16);
    border: 1px solid rgba(245,197,66,0.4);
  }

  .admin-hero-actions {
    display: flex;
    gap: 0.65rem;
    flex-shrink: 0;
  }

  .admin-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.45rem;
    border-radius: 12px;
    padding: 0.7rem 1rem;
    border: 1px solid transparent;
    font-family: 'Orbitron', sans-serif;
    font-size: 0.67rem;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    cursor: pointer;
    transition: 0.18s ease;
    text-decoration: none;
  }

  .admin-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .admin-btn-secondary {
    background: #ffffff;
    color: #222;
    border-color: rgba(0,0,0,0.12);
  }

  .admin-btn-secondary:hover:not(:disabled) {
    background: #f7f2f2;
  }

  .admin-btn-danger {
    color: #b91c1c;
    background: rgba(220,0,0,0.06);
    border-color: rgba(220,0,0,0.25);
  }

  .admin-btn-danger:hover:not(:disabled) {
    background: rgba(220,0,0,0.11);
  }

  .admin-btn-primary {
    color: #fff;
    background: #dc0000;
    border-color: #dc0000;
  }

  .admin-btn-primary:hover:not(:disabled) {
    background: #f01818;
  }

  .admin-spin {
    animation: admin-spin 0.8s linear infinite;
  }

  @keyframes admin-spin {
    to {
      transform: rotate(360deg);
    }
  }

  .admin-error {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    padding: 1.2rem 1.3rem;
    margin-bottom: 1.25rem;
    border-radius: 17px;
    color: #7f1d1d;
    background: rgba(220,0,0,0.055);
    border: 1px solid rgba(220,0,0,0.25);
  }

  .admin-error-title {
    margin: 0 0 0.3rem;
    font-weight: 800;
  }

  .admin-error-message {
    margin: 0;
    font-size: 0.85rem;
    line-height: 1.5;
  }

  .admin-error-btn {
    margin-top: 0.75rem;
  }

  .admin-stats {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 1rem;
    margin-bottom: 1.25rem;
  }

  .admin-stat-card {
    background: #ffffff;
    border: 1px solid rgba(220,0,0,0.1);
    border-radius: 18px;
    padding: 1.25rem;
    min-height: 105px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    box-shadow: 0 8px 22px rgba(0,0,0,0.035);
  }

  .admin-stat-label {
    margin: 0 0 0.45rem;
    color: #777;
    font-size: 0.74rem;
  }

  .admin-stat-value {
    margin: 0;
    font-family: 'Orbitron', sans-serif;
    font-size: 1.65rem;
    font-weight: 800;
    color: #171313;
  }

  .admin-stat-icon {
    width: 50px;
    height: 50px;
    flex-shrink: 0;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .admin-tone-red .admin-stat-icon {
    color: #dc0000;
    background: rgba(220,0,0,0.08);
  }

  .admin-tone-blue .admin-stat-icon {
    color: #2563eb;
    background: rgba(37,99,235,0.08);
  }

  .admin-tone-green .admin-stat-icon {
    color: #16a34a;
    background: rgba(22,163,74,0.09);
  }

  .admin-tone-amber .admin-stat-icon {
    color: #d97706;
    background: rgba(217,119,6,0.1);
  }

  .admin-tone-gold .admin-stat-icon {
    color: #8a6400;
    background: rgba(245,197,66,0.18);
  }

  .admin-stat-skeleton {
    display: inline-block;
    width: 45px;
    height: 25px;
    border-radius: 6px;
    background: linear-gradient(
      90deg,
      #eeeeee 25%,
      #f8f8f8 50%,
      #eeeeee 75%
    );
    background-size: 200% 100%;
    animation: admin-shimmer 1.2s infinite;
  }

  @keyframes admin-shimmer {
    0% {
      background-position: 200% 0;
    }

    100% {
      background-position: -200% 0;
    }
  }

  .admin-filter-panel {
    background: #ffffff;
    border: 1px solid rgba(220,0,0,0.1);
    border-radius: 18px;
    padding: 1.1rem;
    margin-bottom: 0.8rem;
    box-shadow: 0 7px 20px rgba(0,0,0,0.035);
  }

  .admin-filter-heading {
    display: flex;
    align-items: center;
    gap: 0.45rem;
    margin-bottom: 0.8rem;
    font-family: 'Orbitron', sans-serif;
    font-size: 0.68rem;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: #b91c1c;
  }

  .admin-search-wrap {
    position: relative;
    margin-bottom: 0.85rem;
  }

  .admin-search-icon {
    position: absolute;
    left: 1rem;
    top: 50%;
    transform: translateY(-50%);
    color: #999;
  }

  .admin-search-input {
    width: 100%;
    box-sizing: border-box;
    padding: 0.9rem 1rem 0.9rem 2.65rem;
    border-radius: 13px;
    border: 1px solid rgba(0,0,0,0.12);
    background: #fff;
    color: #222;
    font-size: 0.88rem;
  }

  .admin-search-input:focus {
    outline: none;
    border-color: rgba(220,0,0,0.4);
  }

  .admin-filter-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.8rem;
  }

  .admin-select-wrap label {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    margin-bottom: 0.4rem;
    font-size: 0.7rem;
    color: #777;
  }

  .admin-select-wrap select {
    width: 100%;
    box-sizing: border-box;
    border-radius: 11px;
    border: 1px solid rgba(0,0,0,0.12);
    background: #fff;
    padding: 0.72rem 0.8rem;
    color: #222;
    font-size: 0.82rem;
  }

  .admin-select-wrap select:focus {
    outline: none;
    border-color: rgba(220,0,0,0.4);
  }

  .admin-result-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    min-height: 38px;
    color: #777;
    font-size: 0.78rem;
  }

  .admin-clear-btn {
    background: none;
    border: none;
    color: #b91c1c;
    font-size: 0.76rem;
    cursor: pointer;
    font-weight: 700;
  }

  .admin-table-wrap {
    background: #ffffff;
    border: 1px solid rgba(220,0,0,0.1);
    border-radius: 18px;
    overflow-x: auto;
    box-shadow: 0 8px 22px rgba(0,0,0,0.035);
  }

  .admin-table-header,
  .admin-table-row {
    min-width: 1050px;
    display: grid;
    grid-template-columns:
      1.45fr
      1.15fr
      1.4fr
      0.8fr
      0.65fr
      0.85fr
      0.8fr
      0.6fr;
    gap: 0.8rem;
    align-items: center;
    padding: 0.95rem 1.1rem;
  }

  .admin-table-header {
    background: #fbf2f2;
    color: #866d6d;
    font-family: 'Orbitron', sans-serif;
    font-size: 0.61rem;
    letter-spacing: 0.07em;
    text-transform: uppercase;
  }

  .admin-table-row {
    border-top: 1px solid rgba(0,0,0,0.055);
    font-size: 0.8rem;
  }

  .admin-name-cell {
    display: flex;
    flex-direction: column;
    gap: 0.22rem;
    min-width: 0;
  }

  .admin-name-cell strong {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .admin-name-cell small,
  .admin-event-cell small {
    color: #b91c1c;
    font-size: 0.62rem;
  }

  .admin-mono {
    font-family: monospace;
    font-size: 0.78rem;
  }

  .admin-event-cell {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  .admin-type-badge,
  .admin-payment-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: fit-content;
    padding: 0.3rem 0.62rem;
    border-radius: 999px;
    font-family: 'Orbitron', sans-serif;
    font-size: 0.58rem;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .admin-type-team {
    color: #6b4d00;
    background: rgba(245,197,66,0.16);
  }

  .admin-type-individual {
    color: #2563eb;
    background: rgba(37,99,235,0.08);
  }

  .admin-payment-paid {
    color: #15803d;
    background: rgba(22,163,74,0.1);
  }

  .admin-payment-pending {
    color: #b45309;
    background: rgba(217,119,6,0.11);
  }

  .admin-amount {
    font-family: 'Orbitron', sans-serif;
    font-size: 0.72rem;
    font-weight: 700;
  }

  .admin-view-btn {
    border: none;
    background: none;
    color: #b91c1c;
    font-size: 0.8rem;
    font-weight: 800;
    cursor: pointer;
  }

  .admin-view-btn:hover {
    text-decoration: underline;
  }

  .admin-skeleton-line {
    height: 12px;
    width: 75%;
    border-radius: 5px;
    background: linear-gradient(
      90deg,
      #eee 25%,
      #f8f8f8 50%,
      #eee 75%
    );
    background-size: 200% 100%;
    animation: admin-shimmer 1.2s infinite;
  }

  .admin-empty {
    padding: 4rem 1rem;
    text-align: center;
    color: #aaa;
  }

  .admin-empty h3 {
    color: #333;
    margin: 0.75rem 0 0.35rem;
  }

  .admin-empty p {
    margin: 0;
    font-size: 0.82rem;
  }

  .admin-mobile-list {
    display: none;
  }

  .admin-mobile-card {
    display: block;
    width: 100%;
    text-align: left;
    background: #fff;
    border: 1px solid rgba(220,0,0,0.1);
    border-radius: 16px;
    padding: 1rem;
    margin-bottom: 0.75rem;
    cursor: pointer;
  }

  .admin-mobile-top {
    display: flex;
    justify-content: space-between;
    gap: 0.8rem;
    margin-bottom: 0.8rem;
  }

  .admin-mobile-top > div {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .admin-mobile-top small {
    color: #999;
    font-family: monospace;
  }

  .admin-mobile-info {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.5rem;
  }

  .admin-mobile-info span {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
    color: #555;
    font-size: 0.76rem;
  }

  .admin-mobile-info b {
    color: #aaa;
    font-size: 0.62rem;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .admin-mobile-skeleton {
    display: flex;
    flex-direction: column;
    gap: 0.55rem;
  }

  .admin-mobile-skeleton span {
    display: block;
    height: 12px;
    border-radius: 5px;
    background: #eee;
  }

  .admin-modal-overlay {
    position: fixed;
    inset: 0;
    z-index: 100;
    background: rgba(0,0,0,0.48);
    display: flex;
    justify-content: center;
    align-items: flex-start;
    padding: 1.5rem 1rem;
    overflow-y: auto;
  }

  .admin-modal {
    width: 100%;
    max-width: 760px;
    background: #fff;
    border-radius: 21px;
    overflow: hidden;
    box-shadow: 0 25px 70px rgba(0,0,0,0.28);
  }

  .admin-modal-header {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    align-items: center;
    padding: 1.25rem 1.4rem;
    border-bottom: 1px solid rgba(0,0,0,0.08);
  }

  .admin-modal-eyebrow {
    margin: 0 0 0.25rem;
    color: #dc0000;
    font-family: 'Orbitron', sans-serif;
    font-size: 0.58rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }

  .admin-modal-header h2 {
    margin: 0;
    font-family: 'Bangers', cursive;
    font-size: 1.6rem;
    letter-spacing: 0.04em;
  }

  .admin-modal-close {
    width: 36px;
    height: 36px;
    border: none;
    border-radius: 10px;
    background: #f5f1f1;
    color: #555;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
  }

  .admin-modal-body {
    padding: 1.25rem 1.4rem 2rem;
  }

  .admin-modal-section {
    margin-bottom: 1.55rem;
  }

  .admin-section-title {
    margin: 0 0 0.7rem;
    color: #b91c1c;
    font-family: 'Orbitron', sans-serif;
    font-size: 0.64rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .admin-detail-row {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 1rem;
    padding: 0.58rem 0;
    border-top: 1px solid rgba(0,0,0,0.05);
    font-size: 0.83rem;
  }

  .admin-detail-label {
    color: #999;
    flex-shrink: 0;
  }

  .admin-detail-value {
    text-align: right;
    display: inline-flex;
    align-items: center;
    justify-content: flex-end;
    gap: 0.35rem;
    word-break: break-word;
    color: #171313 !important;
    opacity: 1 !important;
  }

  .admin-detail-value > * {
    color: inherit;
  }

  .admin-detail-label {
    color: #999 !important;
    opacity: 1 !important;
  }

  .admin-modal-header h2 {
    color: #171313 !important;
  }

  .admin-member-top strong {
    color: #171313 !important;
    opacity: 1 !important;
  }

  .admin-member-top small {
    color: #777 !important;
    opacity: 1 !important;
  }

  .admin-member-detail > div {
    color: #171313 !important;
    opacity: 1 !important;
  }

  .admin-member-detail > div span {
    color: #171313 !important;
  }

  .admin-event-item strong {
    color: #171313 !important;
    opacity: 1 !important;
  }

  .admin-event-item small {
    color: #777 !important;
    opacity: 1 !important;
  }

  .admin-event-item > span {
    color: #777 !important;
    opacity: 1 !important;
  }

  .admin-copy-btn {
    width: 23px;
    height: 23px;
    flex-shrink: 0;
    border: none;
    border-radius: 6px;
    background: rgba(0,0,0,0.055);
    color: #666;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
  }

  .admin-section-title-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
  }

  .admin-member-count {
    color: #888;
    font-size: 0.72rem;
  }

  .admin-member-list {
    display: grid;
    gap: 0.75rem;
  }

  .admin-member-card {
    border: 1px solid rgba(0,0,0,0.08);
    border-radius: 14px;
    padding: 1rem;
    background: #fff;
  }

  .admin-member-top {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 0.8rem;
  }

  .admin-member-number {
    width: 34px;
    height: 34px;
    flex-shrink: 0;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #b91c1c;
    background: rgba(220,0,0,0.08);
    font-family: 'Orbitron', sans-serif;
    font-size: 0.7rem;
  }

  .admin-member-top div {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
  }

  .admin-member-top small {
    color: #888;
    font-size: 0.72rem;
  }

  .admin-member-details {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.7rem;
  }

  .admin-member-detail {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .admin-member-detail small {
    color: #aaa;
    font-size: 0.63rem;
    text-transform: uppercase;
  }

  .admin-member-detail > div {
    display: flex;
    align-items: center;
    gap: 0.3rem;
    font-size: 0.78rem;
    word-break: break-word;
  }

  .admin-no-members {
    border: 1px dashed rgba(0,0,0,0.14);
    border-radius: 12px;
    padding: 1rem;
    text-align: center;
    color: #999;
    font-size: 0.8rem;
  }

  .admin-event-list {
    display: grid;
    gap: 0.55rem;
  }

  .admin-event-item {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    align-items: center;
    padding: 0.75rem 0.85rem;
    border-radius: 11px;
    background: #faf6f6;
    border: 1px solid rgba(220,0,0,0.07);
  }

  .admin-event-item > div {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
  }

  .admin-event-item strong {
    font-size: 0.8rem;
  }

  .admin-event-item small {
    color: #999;
    font-family: monospace;
    font-size: 0.65rem;
  }

  .admin-event-item > span {
    color: #888;
    font-size: 0.7rem;
    flex-shrink: 0;
  }

  .admin-screenshot-box {
    margin-top: 1rem;
  }

  .admin-muted {
    color: #999;
    font-size: 0.8rem;
  }

  .admin-verify-box {
    margin-top: 1.15rem;
    padding-top: 1rem;
    border-top: 1px solid rgba(0,0,0,0.08);
  }

  .admin-verify-error {
    margin: 0.6rem 0 0;
    color: #b91c1c;
    font-size: 0.78rem;
  }

  /*
    New success message shown after
    payment has been verified.
  */
  .admin-paid-confirmation {
    margin-top: 1.15rem;
    padding: 0.9rem 1rem;
    border-radius: 12px;
    display: flex;
    align-items: center;
    gap: 0.55rem;
    color: #15803d;
    background: rgba(22,163,74,0.08);
    border: 1px solid rgba(22,163,74,0.16);
    font-size: 0.78rem;
    font-weight: 700;
  }

  @media (max-width: 1200px) {
    .admin-stats {
      grid-template-columns: repeat(3, 1fr);
    }
  }

  @media (max-width: 900px) {
    .admin-hero {
      align-items: flex-start;
      flex-direction: column;
    }

    .admin-hero-actions {
      width: 100%;
    }

    .admin-hero-actions .admin-btn {
      flex: 1;
    }

    .admin-stats {
      grid-template-columns: repeat(2, 1fr);
    }

    .admin-table-wrap {
      display: none;
    }

    .admin-mobile-list {
      display: block;
    }
  }

  @media (max-width: 650px) {
    .admin-page {
      padding-top: 1.2rem;
    }

    .admin-shell {
      width: min(100% - 1rem, 1440px);
    }

    .admin-hero {
      padding: 1.3rem;
    }

    .admin-title {
      font-size: 2rem;
    }

    .admin-stats {
      grid-template-columns: 1fr;
    }

    .admin-filter-grid {
      grid-template-columns: 1fr;
    }

    .admin-member-details {
      grid-template-columns: 1fr;
    }

    .admin-mobile-info {
      grid-template-columns: repeat(3, 1fr);
    }

    .admin-modal-overlay {
      padding: 0.5rem;
    }

    .admin-modal-body {
      padding: 1rem;
    }

    .admin-detail-row {
      flex-direction: column;
      gap: 0.2rem;
    }

    .admin-detail-value {
      text-align: left;
      justify-content: flex-start;
    }
  }
`;