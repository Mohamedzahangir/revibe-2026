import { useState } from "react";
import { useLocation } from "react-router-dom";
import {
  Users,
  BadgeCheck,
  Clock3,
  IndianRupee,
  LogOut,
  Check,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import Header from "../components/navigation/Header";
import Footer from "../components/Footer";

// TEMP: mock data for previewing the dashboard layout only.
// Replace with a real fetch (getStudentsByCoordinator) once
// services/supabase.js + services/studentService.js are wired up.
const MOCK_STUDENTS = [
  { id: 1, name: "Abdullah", roll_number: "24704", team_name: "Doctor Doom", payment_status: true },
  { id: 2, name: "Mohammed Saad K", roll_number: "24660", team_name: "Doctor Doom", payment_status: true },
  { id: 3, name: "Deepadharshini Sankar", roll_number: "24621", team_name: "Doctor Doom", payment_status: true },
  { id: 4, name: "Mohamed Riyaz", roll_number: "24647", team_name: "Doctor Doom", payment_status: true },
  { id: 5, name: "B Archana", roll_number: "24616", team_name: "Doctor Doom", payment_status: true },
  { id: 6, name: "Harini Priya", roll_number: "24628", team_name: "Flash", payment_status: true },
  { id: 7, name: "Mohamed Zaid", roll_number: "24651", team_name: "Thanos", payment_status: true },
  { id: 8, name: "Dhivya Tharini", roll_number: "24624", team_name: "Thanos", payment_status: true },
  { id: 9, name: "S Kavitha Sri", roll_number: "24636", team_name: "Thanos", payment_status: true },
  { id: 10, name: "Dharshan M", roll_number: "24622", team_name: "Thanos", payment_status: true },
  { id: 11, name: "Amjath Khan", roll_number: "24612", team_name: "Thanos", payment_status: false },
];

const registrationFee = 25;

const statCards = [
  { key: "totalStudents", label: "Total Students", icon: Users, iconClass: "text-sky-400", ringClass: "bg-sky-500/10" },
  { key: "paidStudents", label: "Paid Students", icon: BadgeCheck, iconClass: "text-emerald-400", ringClass: "bg-emerald-500/10" },
  { key: "pendingStudents", label: "Pending Payments", icon: Clock3, iconClass: "text-amber-400", ringClass: "bg-amber-500/10" },
  { key: "totalCollection", label: "Total Collection", icon: IndianRupee, iconClass: "text-fuchsia-400", ringClass: "bg-fuchsia-500/10" },
];

const CoordinatorDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [students] = useState(MOCK_STUDENTS);
  const [searchTerm, setSearchTerm] = useState("");

  const department = location.state?.department || "CSE";
  const section = location.state?.section || "A";

  const totalStudents = students.length;
  const paidStudents = students.filter((student) => student.payment_status).length;
  const pendingStudents = totalStudents - paidStudents;
  const totalCollection = paidStudents * registrationFee;

  const stats = { totalStudents, paidStudents, pendingStudents, totalCollection };

  const handleLogout = () => {
    navigate("/login");
  };

  const filteredStudents = students.filter((student) => {
    const search = searchTerm.trim().toLowerCase();

    const isPaidSearch =
      "paid".startsWith(search) ||
      "payment".startsWith(search) ||
      ["p", "pay", "paid", "payment", "yes", "true", "done"].includes(search);

    const isUnpaidSearch =
      "unpaid".startsWith(search) ||
      "pending".startsWith(search) ||
      ["u", "un", "unp", "unpaid", "pending", "no", "false"].includes(search);

    return (
      student.name?.toLowerCase().includes(search) ||
      student.roll_number?.toString().includes(search) ||
      student.team_name?.toLowerCase().includes(search) ||
      (isPaidSearch && student.payment_status) ||
      (isUnpaidSearch && !student.payment_status)
    );
  });

  return (
    <>
      <Header />

      <main className="min-h-screen bg-[#030712] pt-28 pb-16 text-white">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-8 flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-slate-400">Welcome back,</p>
              <h1 className="text-2xl font-bold text-white">Coordinator Dashboard</h1>

              <div className="mt-3 flex flex-wrap gap-2">
                <span className="inline-flex items-center rounded-full bg-red-500/15 px-3 py-1 text-xs font-semibold text-red-400 ring-1 ring-inset ring-red-500/30">
                  Coordinator
                </span>
                <span className="inline-flex items-center rounded-full bg-white/5 px-3 py-1 text-xs font-semibold text-slate-300 ring-1 ring-inset ring-white/10">
                  {department} - {section}
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

          <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {statCards.map(({ key, label, icon: Icon, iconClass, ringClass }) => (
              <div key={key} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
                  <p className="mt-2 text-2xl font-bold text-white">
                    {key === "totalCollection" ? `₹${stats.totalCollection}` : stats[key]}
                  </p>
                </div>
                <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${ringClass}`}>
                  <Icon className={`h-5 w-5 ${iconClass}`} />
                </span>
              </div>
            ))}
          </div>

          <div className="mb-6">
            <input
              type="text"
              placeholder="Search by Name, Roll No, Team or Paid/Unpaid..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-slate-400 focus:border-red-500 focus:outline-none"
            />
          </div>

          <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 text-xs uppercase tracking-wide text-slate-400">
                  <th className="px-5 py-3 font-medium">Name</th>
                  <th className="px-5 py-3 font-medium">Payment</th>
                  <th className="px-5 py-3 font-medium">Roll No</th>
                  <th className="px-5 py-3 font-medium">Team</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-5 py-8 text-center text-slate-400">
                      No students found.
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((student) => (
                    <tr key={student.id} className="border-b border-white/5 last:border-b-0 hover:bg-white/[0.02]">
                      <td className="px-5 py-3 font-medium text-white">{student.name}</td>
                      <td className="px-5 py-3">
                        <span
                          className={`inline-flex h-5 w-5 items-center justify-center rounded ${
                            student.payment_status ? "bg-emerald-500/90 text-white" : "border border-white/20 bg-transparent"
                          }`}
                        >
                          {student.payment_status && <Check className="h-3.5 w-3.5" />}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-slate-300">{student.roll_number}</td>
                      <td className="px-5 py-3 text-slate-300">{student.team_name}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
};

export default CoordinatorDashboard;