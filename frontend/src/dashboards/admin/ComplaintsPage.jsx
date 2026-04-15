/**
 * ComplaintsPage.jsx - Customer Complaints Management (Admin)
 * Tailwind CSS · Auto priority from complaint type · 3 statuses
 */

import { useState, useEffect } from "react";
import Header from "../ui/Header";
import Sidebar from "../ui/Sidebar";
import api from "../../services/api";

// ── Priority auto-detection from complaint type/content ────────────────
const detectPriority = (complaint) => {
  const text = `${complaint.title || ""} ${complaint.description || ""} ${complaint.type || ""}`.toLowerCase();
  if (text.includes("missing") || text.includes("delivery")) return "HIGH";
  if (text.includes("suggestion") || text.includes("product")) return "MEDIUM";
  if (text.includes("website content")) return "LOW";
  return complaint.priority?.toUpperCase() || "LOW";
};

// ── Priority styles ────────────────────────────────────────────────────
const PRIORITY_CLASS = {
  HIGH:   "bg-red-100 text-red-700",
  MEDIUM: "bg-yellow-100 text-yellow-700",
  LOW:    "bg-blue-100 text-blue-700",
};

// ── Status config (3 statuses only) ───────────────────────────────────
const STATUS_CLASS = {
  Pending:   "bg-gray-100 text-gray-500",
  Dismissed: "bg-red-100 text-red-600",
  Resolved:  "bg-green-100 text-green-700",
};

// ── Avatar ─────────────────────────────────────────────────────────────
function Avatar({ name = "??" }) {
  const initials = name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  const palettes = [
    "bg-blue-100 text-blue-600 border-blue-200",
    "bg-green-100 text-green-600 border-green-200",
    "bg-yellow-100 text-yellow-600 border-yellow-200",
    "bg-purple-100 text-purple-600 border-purple-200",
    "bg-pink-100 text-pink-600 border-pink-200",
    "bg-orange-100 text-orange-600 border-orange-200",
  ];
  const cls = palettes[name.charCodeAt(0) % palettes.length];
  return (
    <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center font-bold text-sm shrink-0 ${cls}`}>
      {initials}
    </div>
  );
}

// ── Status badge ────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  return (
    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${STATUS_CLASS[status] || STATUS_CLASS.Pending}`}>
      {status}
    </span>
  );
}

export default function ComplaintsPage() {
  const [openBar, setOpenBar]       = useState(window.innerWidth >= 600);
  const [selected, setSelected]     = useState(null);
  const [complaints, setComplaints] = useState([]);

  useEffect(() => {
    api.get("/api/complaints")
      .then(res => {
        const enriched = res.data.map(c => ({ ...c, priority: detectPriority(c) }));
        setComplaints(enriched);
      })
      .catch(err => console.error("Error:", err));
  }, []);

  // ── Update status ──────────────────────────────────────────────────
  const updateStatus = (id, newStatus) => {
    setComplaints(prev => prev.map(c => c.id === id ? { ...c, status: newStatus } : c));
    setSelected(prev => prev?.id === id ? { ...prev, status: newStatus } : prev);
    // api.patch(`/api/complaints/${id}`, { status: newStatus }).catch(console.error);
  };

  return (
    <div className="flex min-h-screen bg-[#F4F6FB] font-sans">
      <Sidebar openBar={openBar} setOpenBar={setOpenBar} />

      <main className="flex-1 overflow-y-auto pb-8">
        <Header concept="Complaints" setOpenBar={setOpenBar} openBar={openBar} />

        <div className="px-8 pt-7 flex flex-col gap-7">

          {/* Subtitle */}
          <p className="text-sm text-gray-400 mt-1">Manage and resolve customer complaints.</p>

          {/* Two-panel layout */}
          <div className="flex gap-6 items-start">

            {/* ── LEFT: Inbox list ── */}
            <div className="bg-white rounded-2xl shadow-sm w-80 min-w-[280px] shrink-0 flex flex-col max-h-[70vh] overflow-y-auto">

              {/* List header */}
              <div className="flex justify-between items-center px-5 py-4 border-b border-gray-100">
                <span className="font-semibold text-[15px] text-[#1a1a2e]">Inbox</span>
                <span className="bg-gray-100 text-gray-400 text-xs rounded-full px-3 py-0.5">
                  {complaints.length} Total
                </span>
              </div>

              {/* Complaint rows */}
              {complaints.map(c => (
                <div
                  key={c.id}
                  onClick={() => setSelected({ ...c, priority: detectPriority(c) })}
                  className={`px-5 py-3.5 cursor-pointer transition-colors duration-150 border-l-[3px] ${
                    selected?.id === c.id
                      ? "border-blue-400 bg-blue-50"
                      : "border-transparent hover:bg-gray-50"
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[11px] text-gray-400">{c.id}</span>
                    <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${PRIORITY_CLASS[detectPriority(c)]}`}>
                      {detectPriority(c)}
                    </span>
                  </div>
                  <p className="m-0 font-semibold text-[13px] text-[#1a1a2e] truncate">{c.title}</p>
                  <p className="mt-0.5 text-xs text-gray-400">{c.user}</p>
                  <div className="mt-1.5">
                    <StatusBadge status={c.status || "Pending"} />
                  </div>
                </div>
              ))}
            </div>

            {/* ── RIGHT: Detail panel ── */}
            <div className="bg-white rounded-2xl shadow-sm flex-1 p-7 min-h-[400px]">
              {selected ? (
                <div className="flex flex-col gap-6">

                  {/* Header row */}
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="m-0 text-xl font-bold text-[#1a1a2e]">{selected.title}</h2>
                      <p className="mt-1 text-[13px] text-gray-400">
                        ID: {selected.id} · Received on {selected.date}
                      </p>
                    </div>
                    <StatusBadge status={selected.status || "Pending"} />
                  </div>

                  {/* User card */}
                  <div className="bg-[#F4F6FB] rounded-xl px-5 py-4 flex justify-between items-center">
                    <div className="flex gap-3 items-center">
                      <Avatar name={selected.username || selected.user || "??"} />
                      <div>
                        <p className="m-0 font-semibold text-sm text-[#1a1a2e]">{selected.user}</p>
                        <p className="m-0 text-xs text-gray-400">email@example.com</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="mb-1 text-[11px] text-gray-400 uppercase tracking-wider">Priority</p>
                      <span className={`text-xs font-semibold px-3 py-1 rounded-full ${PRIORITY_CLASS[selected.priority]}`}>
                        {selected.priority}
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <p className="mb-2 text-[11px] text-gray-400 uppercase tracking-wider">Complaint Description</p>
                    <div className="bg-[#F4F6FB] rounded-xl px-4 py-3.5 text-sm text-[#3a3a4a] leading-relaxed">
                      {selected.description}
                    </div>
                  </div>

                  {/* Internal notes */}
                  <div>
                    <p className="mb-2 text-[11px] text-gray-400 uppercase tracking-wider">Internal Notes</p>
                    <textarea
                      placeholder="Type internal notes..."
                      className="w-full min-h-[110px] px-4 py-3 rounded-xl border border-gray-200 text-sm text-[#1a1a2e] resize-y outline-none focus:border-blue-300 transition-colors"
                    />
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => updateStatus(selected.id, "Resolved")}
                      disabled={selected.status === "Resolved"}
                      className={`flex-1 py-3 rounded-xl text-sm font-semibold border-0 transition-all duration-150
                        ${selected.status === "Resolved"
                          ? "bg-green-100 text-green-700 cursor-default"
                          : "bg-green-500 text-white cursor-pointer hover:bg-green-600"
                        }`}
                    >
                      {selected.status === "Resolved" ? "✓ Resolved" : "Mark as Resolved"}
                    </button>
                    <button
                      onClick={() => updateStatus(selected.id, "Dismissed")}
                      disabled={selected.status === "Dismissed"}
                      className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all duration-150
                        ${selected.status === "Dismissed"
                          ? "bg-red-100 text-red-600 border border-red-200 cursor-default"
                          : "bg-white text-[#1a1a2e] border border-gray-200 cursor-pointer hover:bg-gray-50"
                        }`}
                    >
                      {selected.status === "Dismissed" ? "✓ Dismissed" : "Dismiss"}
                    </button>
                  </div>

                </div>
              ) : (
                <div className="text-center py-20 text-gray-400">
                  <p className="text-base font-semibold mb-1">No Complaint Selected</p>
                  <p className="text-sm">Select a complaint from the list to view details.</p>
                </div>
              )}
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
