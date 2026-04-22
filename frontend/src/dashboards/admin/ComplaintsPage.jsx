/**
 * ComplaintsPage.jsx - Customer Complaints Management (Admin)
 * All logic preserved, design improved + responsive.
 */

import { useState, useEffect } from "react";
import Header from "../ui/Header";
import Sidebar from "../ui/Sidebar";
import api from "../../services/api";
import {
  LayoutDashboard, Users, MessageSquare, CheckSquare,
  BarChart, Activity, Settings,
} from "lucide-react";

const detectPriority = (complaint) => {
  const text = `${complaint.title || ""} ${complaint.description || ""} ${complaint.type || ""}`.toLowerCase();
  if (text.includes("missing") || text.includes("delivery")) return "HIGH";
  if (text.includes("suggestion") || text.includes("product")) return "MEDIUM";
  if (text.includes("website content")) return "LOW";
  return complaint.priority?.toUpperCase() || "LOW";
};

const PRIORITY = {
  HIGH:   { bg: "#fff1f2", color: "#dc2626", dot: "#dc2626" },
  MEDIUM: { bg: "#fffbeb", color: "#d97706", dot: "#f59e0b" },
  LOW:    { bg: "#eff6ff", color: "#2563eb", dot: "#3b82f6" },
};

const STATUS = {
  Pending:   { bg: "#f8fafc", color: "#64748b" },
  Dismissed: { bg: "#fff1f2", color: "#dc2626" },
  Resolved:  { bg: "#f0fdf4", color: "#16a34a" },
};

const TYPE = {
  delivery: { bg: "#fff1f2", color: "#dc2626" },
  product: { bg: "#eff6ff", color: "#2563eb" },
  "website content": { bg: "#f0fdf4", color: "#16a34a" },
};

function TypeBadge({ type }) {
  const t = TYPE[type?.toLowerCase()] || { bg: "#f1f5f9", color: "#64748b" };

  return (
    <span
      style={{
        background: t.bg,
        color: t.color,
        padding: "3px 10px",
        borderRadius: 99,
        fontSize: 11,
        fontWeight: 700,
      }}
    >
      {type || "other"}
    </span>
  );
}

function Avatar({ name = "??" }) {
  const initials = name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  const palette  = ["#6366f1", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899", "#f97316"];
  const color    = palette[name.charCodeAt(0) % palette.length];
 
  return (
    <div style={{
      width: 42, height: 42, borderRadius: "50%",
      background: `${color}15`, border: `2px solid ${color}30`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontWeight: 700, fontSize: 14, color, flexShrink: 0,
    }}>{initials}</div>
  );
}

function StatusBadge({ status }) {
  const s = STATUS[status] || STATUS.Pending;
  return (
    <span style={{ ...s, padding: "4px 12px", borderRadius: 99, fontSize: 12, fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 5 }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: "currentColor", display: "inline-block" }} />
      {status}
    </span>
  );
}

function PriorityBadge({ priority }) {
  const p = PRIORITY[priority] || PRIORITY.LOW;
  return (
    <span style={{ ...p, padding: "3px 10px", borderRadius: 99, fontSize: 11, fontWeight: 700, display: "inline-block" }}>
      {priority}
    </span>
  );
}

export default function ComplaintsPage() {
  const [openBar, setOpenBar]       = useState(window.innerWidth >= 768);
  const [selected, setSelected]     = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [note, setNote] = useState("")

  useEffect(() => {
    api.get("/api/complaints")
      .then(res => {
        const enriched = res.data.map(c => ({ ...c, priority: detectPriority(c) }));
        setComplaints(enriched);
      })
      .catch(err => console.error("Error:", err));
  }, []);

const updateStatus = async (id, newStatus) => {
  try {
    await api.put(`/api/complaints/${id}/status`, null, {
      params: { status: newStatus }
    });

    setComplaints(prev =>
      prev.map(c => c.id === id ? { ...c, status: newStatus } : c)
    );

    setSelected(prev =>
      prev?.id === id ? { ...prev, status: newStatus } : prev
    );

  } catch (err) {
    console.error("Update failed", err);
  }
};

useEffect(() => {
  if (selected) {
    setNote(selected.internal_note || "")
  }
}, [selected])

const saveNote = async () => {
  try {
     await api.put(
      `/api/complaints/${selected.id}/note`,
      null,
      { params: { note } }
    );

    // update selected
    setSelected(prev => ({
      ...prev,
      internal_note: note
    }));

    // update list
    setComplaints(prev =>
      prev.map(c =>
        c.id === selected.id
          ? { ...c, internal_note: note }
          : c
      )
    );

  } catch (err) {
    console.error(err);
  }
};
  const adminLinks = [
    { to: "/admin-dash",               label: "Dashboard",     icon: <LayoutDashboard size={18} />, end: true },
    { to: "/admin-dash/accounts",      label: "Accounts",      icon: <Users size={18} /> },
    { to: "/admin-dash/complaints",    label: "Complaints",    icon: <MessageSquare size={18} /> },
    { to: "/admin-dash/reports",       label: "Reports",       icon: <BarChart size={18} /> },
    { to: "/admin-dash/engagement",    label: "Engagement",    icon: <Activity size={18} /> },
    { to: "/admin-dash/configuration", label: "Configuration", icon: <Settings size={18} /> },
    { to: "/admin-dash/validation",    label: "Validation",    icon: <CheckSquare size={18} /> },
  ];

  return (
    <>
      <style>{`
        .cmp-page { display: flex; min-height: 100vh; background: #f8fafc; font-family: 'Inter', 'Segoe UI', sans-serif; }
        .cmp-main { flex: 1; overflow-y: auto; min-width: 0; }
        .cmp-inner { padding: 24px 28px 40px; }
        .cmp-layout { display: flex; gap: 20px; align-items: flex-start; margin-top: 20px; }
        .cmp-list { background: #fff; border-radius: 16px; border: 1px solid #f1f5f9; box-shadow: 0 1px 3px rgba(0,0,0,0.06); width: 300px; min-width: 260px; flex-shrink: 0; display: flex; flex-direction: column; max-height: 75vh; overflow: hidden; }
        .cmp-list-scroll { overflow-y: auto; flex: 1; }
        .cmp-list-header { display: flex; justify-content: space-between; align-items: center; padding: 16px 18px; border-bottom: 1px solid #f1f5f9; }
        .cmp-row { padding: 14px 18px; cursor: pointer; transition: background .12s; border-left: 3px solid transparent; border-bottom: 1px solid #f8fafc; }
        .cmp-row:last-child { border-bottom: none; }
        .cmp-row:hover { background: #fafbff; }
        .cmp-row.active { background: #f0f4ff; border-left-color: #6366f1; }
        .cmp-detail { background: #fff; border-radius: 16px; border: 1px solid #f1f5f9; box-shadow: 0 1px 3px rgba(0,0,0,0.06); flex: 1; padding: 28px; }
        .cmp-section-label { font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: .07em; margin: 0 0 8px; }
        .cmp-note-area { width: 100%; min-height: 100px; padding: 12px 14px; border: 1.5px solid #e2e8f0; border-radius: 12px; font-size: 13px; font-family: inherit; color: #0f172a; resize: vertical; outline: none; background: #f8fafc; box-sizing: border-box; transition: border-color .2s; }
        .cmp-note-area:focus { border-color: #6366f1; background: #fff; }
        .cmp-btn-resolve { flex: 1; padding: 13px; border-radius: 12px; border: none; font-size: 14px; font-weight: 700; cursor: pointer; transition: all .15s; }
        .cmp-btn-dismiss { flex: 1; padding: 13px; border-radius: 12px; font-size: 14px; font-weight: 700; cursor: pointer; transition: all .15s; }
        @media (max-width: 900px) {
          .cmp-layout { flex-direction: column; }
          .cmp-list { width: 100%; max-height: 40vh; }
          .cmp-detail { width: 100%; }
          .cmp-inner { padding: 16px 12px 32px; }
        }
      `}</style>
      <div className="cmp-page">
        <Sidebar openBar={openBar} setOpenBar={setOpenBar} links={adminLinks} title="AdminCore" subtitle="Enterprise Suite" role="Super Admin" />
        <main className="cmp-main">
          <Header concept="Complaints" setOpenBar={setOpenBar} openBar={openBar} />
          <div className="cmp-inner">
            <p style={{ margin: 0, fontSize: 14, color: "#64748b" }}>Manage and resolve customer complaints.</p>
            <div className="cmp-layout">
              {/* LEFT: Inbox */}
              <div className="cmp-list">
                <div className="cmp-list-header">
                  <span style={{ fontWeight: 700, fontSize: 14, color: "#0f172a" }}>Inbox</span>
                  <span style={{ background: "#f1f5f9", color: "#64748b", fontSize: 12, fontWeight: 600, borderRadius: 99, padding: "3px 10px" }}>{complaints.length} Total</span>
                </div>
                <div className="cmp-list-scroll">
                  {complaints.map(c => (
                    <div
                      key={c.id}
                      onClick={() => setSelected({ ...c, priority: detectPriority(c) })}
                      className={`cmp-row${selected?.id === c.id ? " active" : ""}`}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                        <span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600 }}>{c.id}</span>
                        <PriorityBadge priority={detectPriority(c)} />
                      </div>
                      <p style={{ margin: 0, fontWeight: 700, fontSize: 13, color: "#0f172a" }}>{c.title}</p>
                      <p style={{ margin: "2px 0 6px", fontSize: 12, color: "#94a3b8" }}>{c.user}</p>
                      <TypeBadge type={c.type} />
                      <StatusBadge status={c.status || "Pending"} />
                    </div>
                  ))}
                </div>
              </div>

              {/* RIGHT: Detail */}
              <div className="cmp-detail">
                {selected ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
                      <div>
                        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "#0f172a", letterSpacing: "-0.01em" }}>{selected.title}</h2>
                        <p style={{ margin: "4px 0 0", fontSize: 13, color: "#94a3b8" }}>ID: {selected.id} · Received on {selected.date}</p>
                      </div>
                      <StatusBadge status={selected.status || "Pending"} />
                    </div>

                    <div style={{ background: "#f8fafc", borderRadius: 14, padding: "16px 18px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
                      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                        <Avatar name={selected.user || "??"} />
                        <div>
                          <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: "#0f172a" }}>{selected.user}</p>
                          <p style={{ margin: "2px 0 0", fontSize: 12, color: "#94a3b8" }}>{selected.email}</p>
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <p className="cmp-section-label" style={{ marginBottom: 4 }}>Priority</p>
                        <PriorityBadge priority={selected.priority} />
                      </div>
                    </div>

                    <div>
                      <p className="cmp-section-label">Complaint Description</p>
                      <div style={{ background: "#f8fafc", borderRadius: 12, padding: "14px 16px", fontSize: 14, color: "#334155", lineHeight: 1.6, border: "1px solid #f1f5f9" }}>
                        {selected.description}
                      </div>
                    </div>

                    <div>
                 <p className="cmp-section-label">Internal Notes</p>
                  <textarea
                     className="cmp-note-area"
                     placeholder="Type internal notes..."
                     value={selected.note}
                     onChange={(e) => setNote(e.target.value)}
                     onBlur={saveNote}   
                    />
                        </div>

                    <div style={{ display: "flex", gap: 12 }}>
                      <button
                        className="cmp-btn-resolve"
                        onClick={() => updateStatus(selected.id, "Resolved")}
                        disabled={selected.status === "Resolved"}
                        style={{
                          background: selected.status === "Resolved" ? "#f0fdf4" : "#10b981",
                          color: selected.status === "Resolved" ? "#16a34a" : "#fff",
                          opacity: selected.status === "Resolved" ? 1 : 1,
                        }}
                      >
                        {selected.status === "Resolved" ? "✓ Resolved" : "Mark as Resolved"}
                      </button>
                      <button
                        className="cmp-btn-dismiss"
                        onClick={() => updateStatus(selected.id, "Dismissed")}
                        disabled={selected.status === "Dismissed"}
                        style={{
                          background: selected.status === "Dismissed" ? "#fff1f2" : "#fff",
                          color: selected.status === "Dismissed" ? "#dc2626" : "#475569",
                          border: selected.status === "Dismissed" ? "1.5px solid #fecaca" : "1.5px solid #e2e8f0",
                        }}
                      >
                        {selected.status === "Dismissed" ? "✓ Dismissed" : "Dismiss"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{ textAlign: "center", padding: "60px 20px", color: "#94a3b8" }}>
                    <div style={{ width: 56, height: 56, background: "#f8fafc", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, margin: "0 auto 16px" }}>💬</div>
                    <p style={{ fontWeight: 700, fontSize: 15, color: "#475569", margin: "0 0 6px" }}>No Complaint Selected</p>
                    <p style={{ fontSize: 13, margin: 0 }}>Select a complaint from the list to view details.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}