/**
 * AuditLogPage.jsx - Admin Audit Log
 * =====================================
 * Shows a chronological record of all administrative actions.
 * Each log entry includes: title, description, type (INFO/WARNING),
 * category, timestamp, and the admin who performed the action.
 *
 * FEATURES:
 *   - Filter by category: User Management, Complaint, Validation
 *   - Stat badges: Total Events, Critical, Warnings, Info counts
 *
 * NOTE: Currently uses hardcoded sample data.
 *       Connect to an audit log API for real tracking.
 */

import Header from "../ui/Header";
import Sidebar from "../ui/Sidebar";
import { useState } from "react";

export default function AuditLogPage() {
  const [openBar, setOpenBar] = useState(window.innerWidth >= 600);
  const [activeFilter, setActiveFilter] = useState("All");

  const logs = [
    {
      title: "Resolved Complaint",
      subtitle: "Complaint C-003 — Incorrect Dimensions",
      desc: "Complaint marked as resolved. Customer notified via email.",
      type: "INFO",
      category: "Complaint",
      date: "2023-10-25 11:42 AM",
    },
    {
      title: "Approved Submission",
      subtitle: "V-006 — AR Model Oak Desk",
      desc: "AR model submission approved and set to live status.",
      type: "INFO",
      category: "Validation",
      date: "2023-10-25 10:58 AM",
    },
    {
      title: "Created User Account",
      subtitle: "Emily Davis — AR Developer",
      desc: "New AR developer account created.",
      type: "INFO",
      category: "User Management",
      date: "2023-10-24 03:15 PM",
    },
    {
      title: "Rejected Submission",
      subtitle: "V-005 — Rattan Accent Chair",
      desc: "Submission rejected due to missing data.",
      type: "WARNING",
      category: "Validation",
      date: "2023-10-24 01:30 PM",
    },
  ];

  const filters = ["All", "User Management", "Complaint", "Validation"];
  const filteredLogs =
    activeFilter === "All" ? logs : logs.filter((u) => u.category === activeFilter);

  const iconEmoji = (cat) =>
    cat === "Complaint" ? "⚠️" : cat === "Validation" ? "📋" : "👤";

  const typeTagClass = (t) =>
    t === "INFO"
      ? "bg-blue-950 text-blue-400 border border-blue-900"
      : "bg-amber-950 text-amber-400 border border-amber-900";

  const iconBg = (t) =>
    t === "INFO" ? "bg-blue-950 border border-blue-900" : "bg-amber-950 border border-amber-900";

  const leftBorder = (t) =>
    t === "WARNING" ? "border-l-2 border-l-amber-500" : "border-l-2 border-l-transparent hover:border-l-indigo-500";

  return (
    <div className="flex min-h-screen bg-[#0c0e14]">
      <Sidebar openBar={openBar} setOpenBar={setOpenBar} />

      <main className="flex-1 p-6 space-y-5">
        <Header concept="Audit Log" openBar={openBar} setOpenBar={setOpenBar} />

        {/* Subtitle */}
        <p className="text-xs text-[#3a3f55]">Complete record of all administrative actions.</p>

        {/* ── Stats badges ────────────────────────────── */}
        <div className="flex gap-2 flex-wrap">
          <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-[#1a1d2b] text-[#6b7080] border border-[#1e2130]">
            ◆ Total Events: 10
          </span>
          <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-red-950 text-red-400 border border-red-900">
            ✕ Critical: 2
          </span>
          <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-950 text-amber-400 border border-amber-900">
            ⚠ Warnings: 2
          </span>
          <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-blue-950 text-blue-400 border border-blue-900">
            ℹ Info: 6
          </span>
        </div>

        {/* ── Filters ─────────────────────────────────── */}
        <div className="flex flex-wrap gap-2">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border cursor-pointer transition-all duration-150
                ${activeFilter === f
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "bg-[#1a1d2b] text-[#6b7080] border-[#1e2130] hover:bg-[#22263a] hover:text-[#c0c4d8] hover:border-[#2e3248]"
                }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* ── Log list ─────────────────────────────────── */}
        <div className="bg-[#13151f] border border-[#1e2130] rounded-2xl overflow-hidden divide-y divide-[#1a1c28]">
          {filteredLogs.map((log, i) => (
            <div
              key={i}
              className={`flex gap-4 items-start p-5 transition-colors duration-150 hover:bg-[#161825] ${leftBorder(log.type)}`}
            >
              {/* Icon */}
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-base shrink-0 ${iconBg(log.type)}`}>
                {iconEmoji(log.category)}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex gap-2 items-center flex-wrap">
                  <span className="text-sm font-bold text-[#d4d7e8]">{log.title}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full tracking-wide ${typeTagClass(log.type)}`}>
                    {log.type}
                  </span>
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#1a1d2b] text-[#4b5168] border border-[#1e2130]">
                    {log.category}
                  </span>
                </div>
                <p className="text-xs text-[#5a6070] font-medium mt-1">{log.subtitle}</p>
                <p className="text-xs text-[#3a3f55] mt-1.5 leading-relaxed">{log.desc}</p>
                <p className="text-[11px] text-[#2e3248] mt-2 font-mono flex items-center gap-1.5 flex-wrap">
                  <span className="text-[#3a3f55]">🕒 {log.date}</span>
                  <span>·</span>
                  <span>Admin User</span>
                  <span>·</span>
                  <span>192.168.1.101</span>
                </p>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
