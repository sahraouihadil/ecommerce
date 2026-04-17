/**
 * ValidationPage.jsx - Content Validation Queue (Admin)
 * ========================================================
 * Admin page for reviewing and approving/rejecting submissions.
 * Items can be: Products, AR Models, Campaigns, or Promotions.
 *
 * LAYOUT:
 *   - Left panel: filterable list of submissions (by type)
 *   - Right panel: detailed view of selected submission
 *   - Top stats: Pending / Approved / Rejected counts
 *   - Actions: Approve or Reject with optional rejection note
 *
 * NOTE: Currently uses hardcoded sample data.
 *       Connect to a submissions API for real data.
 */

import Header from "../ui/Header";
import Sidebar from "../ui/Sidebar";
import { useState } from "react";
import {
  LayoutDashboard, Users, MessageSquare, CheckSquare,
  BarChart, Activity, Settings, X,
} from "lucide-react";

export default function ValidationPage() {
  const [openBar, setOpenBar] = useState(window.innerWidth >= 600);
  const [selected, setSelected] = useState(null);
  const [showList, setShowList] = useState(false);
  const [activeFilter, setActiveFilter] = useState("All");

  const items = [
    { title: "Scandinavian Bookshelf Pro",  type: "Products",   user: "Mike Ross",    status: "Pending"  },
    { title: "AR Model — Lounge Chair v2",  type: "AR",         user: "Elena Vance",  status: "Pending"  },
    { title: "Black Friday Mega Sale",       type: "Campaigns",  user: "Sarah Miller", status: "Pending"  },
    { title: "15% Off — New Arrivals",       type: "Promotions", user: "Sarah Miller", status: "Approved" },
    { title: "Rattan Accent Chair",          type: "Products",   user: "Mike Ross",    status: "Rejected" },
    { title: "AR Model — Oak Desk",          type: "AR",         user: "Elena Vance",  status: "Approved" },
  ];

  const filters = ["All", "Products", "AR", "Campaigns", "Promotions"];
  const filteredTypes =
    activeFilter === "All" ? items : items.filter((u) => u.type === activeFilter);

  const statusColor = (s) =>
    s === "Pending"  ? "text-amber-500"   :
    s === "Approved" ? "text-emerald-500" : "text-red-500";

  const pillClass = (s) =>
    s === "Pending"
      ? "bg-amber-50 text-amber-600 border border-amber-200"
      : s === "Approved"
      ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
      : "bg-red-50 text-red-500 border border-red-200";

  const pillIcon = (s) =>
    s === "Pending" ? "⏳" : s === "Approved" ? "✓" : "✕";
  
    const adminLinks = [
     { to: "/admin-dash", label: "Dashboard", icon: <LayoutDashboard size={18} />, end: true },
    { to: "/admin-dash/accounts", label: "Accounts", icon: <Users size={18} /> },
    { to: "/admin-dash/complaints", label: "Complaints", icon: <MessageSquare size={18} /> },
    { to: "/admin-dash/reports", label: "Reports", icon: <BarChart size={18} /> },
    { to: "/admin-dash/engagement", label: "Engagement", icon: <Activity size={18} /> },
    { to: "/admin-dash/configuration", label: "Configuration", icon: <Settings size={18} /> },
    { to: "/admin-dash/validation", label: "Validation", icon: <CheckSquare size={18} /> },
     ];

  return (
    <div className="flex min-h-screen bg-gray-50">
          <Sidebar
                     openBar={openBar}
                     setOpenBar={setOpenBar}
                     links={adminLinks}
                     title="AdminCore"
                     subtitle="Enterprise Suite"
                     role="Super Admin"
                     />

      <main className="flex-1 p-6 space-y-6">
        <Header concept="Validation" setOpenBar={setOpenBar} openBar={openBar} />

        {/* ── Stats ─────────────────────────────────────── */}
        <div className="grid grid-cols-3 gap-4">

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-base shrink-0">⏳</div>
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Pending</p>
              <p className="text-xl font-bold text-gray-800">3</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-base shrink-0">✅</div>
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Approved</p>
              <p className="text-xl font-bold text-gray-800">3</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-base shrink-0">❌</div>
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Rejected</p>
              <p className="text-xl font-bold text-gray-800">2</p>
            </div>
          </div>

        </div>

        {/* ── Content ──────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 min-h-[520px]">

          {/* LEFT PANEL */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col">

            {/* Filters */}
            <div className="flex gap-2 flex-wrap mb-4">
              {filters.map((f) => (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border cursor-pointer transition-all duration-150
                    ${activeFilter === f
                      ? "bg-indigo-600 text-white border-indigo-600"
                      : "bg-white text-gray-500 border-gray-200 hover:border-indigo-300 hover:text-indigo-600"
                    }`}
                >
                  {f}
                </button>
              ))}
            </div>

            {/* Mobile toggle */}
            <div className="lg:hidden mb-3">
              <button
                onClick={() => setShowList(true)}
                className="w-full bg-gray-900 text-white py-3 px-4 rounded-xl flex justify-between items-center cursor-pointer text-sm font-medium"
              >
                <span>Submissions</span>
                <span className="bg-white text-gray-900 px-2 py-0.5 rounded-full text-xs font-bold">
                  {filteredTypes.length}
                </span>
              </button>

              <div className={`${showList ? "block" : "hidden"} mt-3 space-y-2`}>
                {filteredTypes.map((cs, i) => (
                  <div
                    key={i}
                    onClick={() => { setSelected(cs); setShowList(false); }}
                    className="p-3 rounded-xl border border-gray-100 bg-white shadow-sm cursor-pointer hover:border-indigo-200 hover:bg-indigo-50/40 transition-all"
                  >
                    <p className="font-semibold text-gray-800 text-sm">{cs.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{cs.user}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Desktop list */}
            <div className="hidden lg:flex flex-col flex-1 overflow-y-auto gap-2 pr-1">
              {filteredTypes.map((item, i) => (
                <div
                  key={i}
                  onClick={() => setSelected(item)}
                  className={`flex justify-between items-center p-3 rounded-xl border cursor-pointer transition-all duration-150
                    ${selected === item
                      ? "border-indigo-300 bg-indigo-50"
                      : "border-gray-100 hover:border-indigo-200 hover:bg-gray-50"
                    }`}
                >
                  <div>
                    <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-600 mb-1 tracking-wide uppercase">
                      {item.type}
                    </span>
                    <p className="text-sm font-semibold text-gray-800">{item.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">Submitted by {item.user}</p>
                  </div>
                  <span className={`text-xs font-semibold whitespace-nowrap ${statusColor(item.status)}`}>
                    ● {item.status}
                  </span>
                </div>
              ))}
            </div>

          </div>

          {/* RIGHT PANEL */}
          <div className={`bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col overflow-hidden ${!showList ? "flex" : "hidden"} lg:flex`}>
            {selected ? (
              <>
                <div className="flex-1 overflow-y-auto p-5 space-y-5">

                  {/* Header row */}
                  <div className="flex justify-between items-start gap-3 flex-wrap">
                    <div className="flex gap-3 items-center">
                      <img
                        src="https://via.placeholder.com/50"
                        className="w-12 h-12 rounded-xl object-cover border border-gray-100"
                        alt=""
                      />
                      <div>
                        <h2 className="text-base font-bold text-gray-800">{selected.title}</h2>
                        <p className="text-xs text-gray-400 mt-0.5 font-mono">V-001 · {selected.user}</p>
                      </div>
                    </div>
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full shrink-0 ${pillClass(selected.status)}`}>
                      {pillIcon(selected.status)} {selected.status}
                    </span>
                  </div>

                  {/* Info grid */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Category</p>
                      <p className="text-sm font-semibold text-gray-700">📦 {selected.type}</p>
                    </div>
                    <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Submitted</p>
                      <p className="text-xs font-semibold text-gray-700 font-mono">2023-10-25 09:00 AM</p>
                    </div>
                  </div>

                  {/* Submission details */}
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                      Submission Details
                    </p>
                    <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 text-sm text-gray-600 leading-relaxed">
                      New bookshelf listing with 6 color variants, dimensions and material specs included.
                    </div>
                  </div>

                  {/* Rejection note */}
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                      Rejection Note{" "}
                      <span className="text-gray-300 normal-case font-normal">(shown to submitter)</span>
                    </p>
                    <textarea
                      placeholder="Describe why this was rejected or what needs to be corrected..."
                      className="w-full p-3 text-sm border border-gray-200 rounded-xl outline-none min-h-[110px] resize-none text-gray-700 placeholder-gray-300 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50 transition-all"
                    />
                  </div>
                </div>

                {/* Action buttons */}
                <div className="border-t border-gray-100 p-4 flex flex-col sm:flex-row gap-3">
                  <button className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-xl text-sm font-semibold cursor-pointer transition-colors">
                    ✓ Approve
                  </button>
                  <button className="flex-1 bg-white hover:bg-red-50 text-red-500 border border-red-200 hover:border-red-300 py-3 rounded-xl text-sm font-semibold cursor-pointer transition-colors">
                    ✕ Reject
                  </button>
                </div>

                {/* Mobile back */}
                <div className="lg:hidden px-4 pb-3">
                  <button
                    onClick={() => setShowList(true)}
                    className="text-xs text-indigo-500 font-medium cursor-pointer hover:text-indigo-700"
                  >
                    ← Back
                  </button>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full p-16 text-center">
                <div className="w-16 h-16 bg-gray-50 border border-gray-100 rounded-2xl flex items-center justify-center text-3xl mb-4">
                  📄
                </div>
                <h3 className="font-bold text-gray-700 text-base">Select an item to review</h3>
                <p className="text-gray-400 text-sm mt-2 leading-relaxed">
                  Choose a submission from the queue to view details, approve or reject it.
                </p>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}
