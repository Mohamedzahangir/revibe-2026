import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  BadgeCheck,
  Clock3,
  IndianRupee,
  LogOut,
  GraduationCap,
  ArrowRight,
} from "lucide-react";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

import { signOut } from "../services/auth";
import { getAllStudents, getDepartmentCounts } from "../services/studentService";

const statCards = [
  {
    key: "totalStudents",
    label: "Total Students",
    icon: Users,
    iconClass: "text-sky-400",
    ringClass: "bg-sky-500/10",
  },
  {
    key: "paidStudents",
    label: "Paid Students",
    icon: BadgeCheck,
    iconClass: "text-emerald-400",
    ringClass: "bg-emerald-500/10",
  },
  {
    key: "pendingStudents",
    label: "Pending Payments",
    icon: Clock3,
    iconClass: "text-amber-400",
    ringClass: "bg-amber-500/10",
  },
  {
    key: "totalCollection",
    label: "Total Collection",
    icon: IndianRupee,
    iconClass: "text-fuchsia-400",
    ringClass: "bg-fuchsia-500/10",
  },
];

const AdminDashboard = () => {
  const navigate = useNavigate();

  const [students, setStudents] = useState([]);
  const [departmentCounts, setDepartmentCounts] = useState([]);
  const [loading, setLoading] = useState(true);

  const registrationFee = 25;

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);

    const [
      { data: studentsData, error: studentsError },
      { data: departmentData, error: departmentError },
    ] = await Promise.all([getAllStudents(), getDepartmentCounts()]);

    if (!studentsError) {
      setStudents(studentsData || []);
    } else {
      console.error(studentsError);
    }

    if (!departmentError) {
      setDepartmentCounts(departmentData || []);
    } else {
      console.error(departmentError);
    }

    setLoading(false);
  };

  const handleLogout = async () => {
    // TODO: confirm signOut export name/shape in services/auth.js
    try {
      await signOut();
    } catch (error) {
      console.error(error);
    } finally {
      navigate("/login");
    }
  };

  const handleOpenDepartment = (department, section) => {
    navigate("/coordinator", { state: { department, section } });
  };

  const totalStudents = students.length;
  const paidStudents = students.filter((student) => student.payment_status).length;
  const pendingStudents = totalStudents - paidStudents;
  const totalCollection = paidStudents * registrationFee;

  const stats = {
    totalStudents,
    paidStudents,
    pendingStudents,
    totalCollection,
  };

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-[#030712] pt-28 pb-16 text-white">
        <div className="mx-auto max-w-7xl px-6">
          {/* Header */}
          <div className="mb-8 flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-slate-400">Welcome back,</p>
              <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>

              <div className="mt-3 flex flex-wrap gap-2">
                <span className="inline-flex items-center rounded-full bg-red-500/15 px-3 py-1 text-xs font-semibold text-red-400 ring-1 ring-inset ring-red-500/30">
                  Admin
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-2 self-start rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-400 transition hover:bg-red-500/20 sm:self-auto"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>

          {loading ? (
            <div className="mt-10 text-center text-slate-400">
              Loading dashboard...
            </div>
          ) : (
            <>
              {/* Stats */}
              <div className="mb-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {statCards.map(({ key, label, icon: Icon, iconClass, ringClass }) => (
                  <div
                    key={key}
                    className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] p-5"
                  >
                    <div>
                      <p className="text-xs uppercase tracking-wide text-slate-400">
                        {label}
                      </p>
                      <p className="mt-2 text-2xl font-bold text-white">
                        {key === "totalCollection"
                          ? `₹${stats.totalCollection}`
                          : stats[key]}
                      </p>
                    </div>
                    <span
                      className={`flex h-11 w-11 items-center justify-center rounded-xl ${ringClass}`}
                    >
                      <Icon className={`h-5 w-5 ${iconClass}`} />
                    </span>
                  </div>
                ))}
              </div>

              {/* Departments */}
              <div>
                <h2 className="mb-4 text-lg font-bold text-white">Departments</h2>

                {departmentCounts.length === 0 ? (
                  <p className="text-sm text-slate-400">No departments found.</p>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {departmentCounts.map((department) => (
                      <button
                        key={`${department.department}-${department.section}`}
                        type="button"
                        onClick={() =>
                          handleOpenDepartment(
                            department.department,
                            department.section
                          )
                        }
                        className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-left transition hover:border-red-500/40 hover:bg-white/[0.05]"
                      >
                        <div className="flex items-center gap-3">
                          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10">
                            <GraduationCap className="h-5 w-5 text-red-400" />
                          </span>
                          <div>
                            <p className="font-semibold text-white">
                              {department.department} - {department.section}
                            </p>
                            <p className="text-xs text-slate-400">
                              {department.studentCount} Students
                            </p>
                          </div>
                        </div>
                        <ArrowRight className="h-4 w-4 text-slate-500" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
};

export default AdminDashboard;