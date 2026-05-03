/**
 * ComplaintsPage.jsx - Customer Complaints Management (Admin)
 * Redesigned: centered list, modal detail, status filter, locked statuses.
 */

import { useState, useEffect, useCallback } from "react";
import Header from "../ui/Header";
import Sidebar from "../ui/Sidebar";
import api from "../../services/api";
import {
  LayoutDashboard, Users, MessageSquare, CheckSquare,
  BarChart, Activity, Settings, X,
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
  delivery:          { bg: "#fff1f2", color: "#dc2626" },
  product:           { bg: "#eff6ff", color: "#2563eb" },
  "website content": { bg: "#f0fdf4", color: "#16a34a" },
};

function TypeBadge({ type }) {
  const t = TYPE[type?.toLowerCase()] || { bg: "#f1f5f9", color: "#64748b" };
  return (
    <span style={{ background: t.bg, color: t.color, padding: "3px 10px", borderRadius: 99, fontSize: 11, fontWeight: 700 }}>
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

const STATUS_FILTERS = ["All", "Pending", "Resolved", "Dismissed"];

export default function ComplaintsPage() {
  const [openBar, setOpenBar]         = useState(window.innerWidth >= 768);
  const [selected, setSelected]       = useState(null);
  const [complaints, setComplaints]   = useState([]);
  const [note, setNote]               = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  useEffect(() => {
    api.get("/api/complaints")
      .then(res => {
        const enriched = res.data.map(c => ({ ...c, priority: detectPriority(c) }));
        setComplaints(enriched);
      })
      .catch(err => console.error("Error:", err));
  }, []);

  const filteredComplaints = statusFilter === "All"
    ? complaints
    : complaints.filter(c => (c.status || "Pending") === statusFilter);

  const updateStatus = async (id, newStatus) => {
    try {
      await api.put(`/api/complaints/${id}/status`, null, { params: { status: newStatus } });
      setComplaints(prev => prev.map(c => c.id === id ? { ...c, status: newStatus } : c));
      setSelected(prev => prev?.id === id ? { ...prev, status: newStatus } : prev);
    } catch (err) {
      console.error("Update failed", err);
    }
  };

  useEffect(() => {
    if (selected) setNote(selected.internal_note || "");
  }, [selected?.id]);

  const saveNote = async () => {
    try {
      await api.put(`/api/complaints/${selected.id}/note`, null, { params: { note } });
      setSelected(prev => ({ ...prev, internal_note: note }));
      setComplaints(prev => prev.map(c => c.id === selected.id ? { ...c, internal_note: note } : c));
    } catch (err) {
      console.error(err);
    }
  };

  // Close modal on Escape key
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") setSelected(null); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const isFinal = (status) => status === "Resolved" || status === "Dismissed";

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
        .cmp-inner { padding: 24px 28px 40px; max-width: 860px; margin: 0 auto; }

        /* Filter bar */
        .cmp-filter-bar { display: flex; gap: 8px; margin: 18px 0 16px; flex-wrap: wrap; }
        .cmp-filter-btn { padding: 7px 18px; border-radius: 99px; border: 1.5px solid #e2e8f0; background: #fff; font-size: 13px; font-weight: 600; color: #64748b; cursor: pointer; transition: all .15s; }
        .cmp-filter-btn:hover { border-color: #6366f1; color: #6366f1; }
        .cmp-filter-btn.active { background: #6366f1; border-color: #6366f1; color: #fff; }

        /* Centered list */
        .cmp-list { background: #fff; border-radius: 16px; border: 1px solid #f1f5f9; box-shadow: 0 1px 3px rgba(0,0,0,0.06); overflow: hidden; }
        .cmp-list-header { display: flex; justify-content: space-between; align-items: center; padding: 16px 20px; border-bottom: 1px solid #f1f5f9; }
        .cmp-row { padding: 16px 20px; cursor: pointer; transition: background .12s; border-left: 3px solid transparent; border-bottom: 1px solid #f8fafc; display: flex; align-items: center; gap: 14px; }
        .cmp-row:last-child { border-bottom: none; }
        .cmp-row:hover { background: #fafbff; border-left-color: #c7d2fe; }
        .cmp-row-body { flex: 1; min-width: 0; }
        .cmp-row-top { display: flex; justify-content: space-between; align-items: center; gap: 8px; margin-bottom: 4px; }
        .cmp-row-meta { display: flex; gap: 6px; align-items: center; flex-wrap: wrap; margin-top: 6px; }

        /* Modal overlay */
        .cmp-overlay { position: fixed; inset: 0; background: rgba(15,23,42,0.45); backdrop-filter: blur(3px); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 20px; animation: fadeIn .18s ease; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

        /* Modal box */
        .cmp-modal { background: #fff; border-radius: 20px; box-shadow: 0 20px 60px rgba(0,0,0,0.18); width: 100%; max-width: 620px; max-height: 90vh; overflow-y: auto; padding: 28px; animation: slideUp .2s ease; position: relative; }
        @keyframes slideUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        .cmp-modal-close { position: absolute; top: 18px; right: 18px; background: #f1f5f9; border: none; border-radius: 50%; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: #64748b; transition: background .15s; }
        .cmp-modal-close:hover { background: #e2e8f0; color: #0f172a; }

        /* Modal sections */
        .cmp-section-label { font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: .07em; margin: 0 0 8px; }
        .cmp-note-area { width: 100%; min-height: 90px; padding: 12px 14px; border: 1.5px solid #e2e8f0; border-radius: 12px; font-size: 13px; font-family: inherit; color: #0f172a; resize: vertical; outline: none; background: #f8fafc; box-sizing: border-box; transition: border-color .2s; }
        .cmp-note-area:focus { border-color: #6366f1; background: #fff; }

        /* Action buttons */
        .cmp-btn-resolve { flex: 1; padding: 13px; border-radius: 12px; border: none; font-size: 14px; font-weight: 700; cursor: pointer; transition: all .15s; }
        .cmp-btn-dismiss { flex: 1; padding: 13px; border-radius: 12px; font-size: 14px; font-weight: 700; cursor: pointer; transition: all .15s; }
        .cmp-btn-resolve:disabled, .cmp-btn-dismiss:disabled { cursor: not-allowed; opacity: 0.75; }

        /* Empty state */
        .cmp-empty { text-align: center; padding: 48px 20px; color: #94a3b8; }

        @media (max-width: 600px) {
          .cmp-inner { padding: 14px 10px 32px; }
          .cmp-modal { padding: 20px 16px; border-radius: 16px; }
          .cmp-row { padding: 12px 14px; }
        }
      `}</style>

      <div className="cmp-page">
        <Sidebar openBar={openBar} setOpenBar={setOpenBar} links={adminLinks} title="AdminCore" subtitle="Enterprise Suite" role="Super Admin" profilePath="/admin-dash/profile" />
        <main className="cmp-main">
          <Header concept="Complaints" setOpenBar={setOpenBar} openBar={openBar} />

          <div className="cmp-inner">
            <p style={{ margin: 0, fontSize: 14, color: "#64748b" }}>Manage and resolve customer complaints.</p>

            {/* ── Status Filter ── */}
            <div className="cmp-filter-bar">
              {STATUS_FILTERS.map(f => (
                <button
                  key={f}
                  className={`cmp-filter-btn${statusFilter === f ? " active" : ""}`}
                  onClick={() => setStatusFilter(f)}
                >
                  {f}
                  {f !== "All" && (
                    <span style={{ marginLeft: 6, opacity: 0.75 }}>
                      ({complaints.filter(c => (c.status || "Pending") === f).length})
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* ── Centered List ── */}
            <div className="cmp-list">
              <div className="cmp-list-header">
                <span style={{ fontWeight: 700, fontSize: 14, color: "#0f172a" }}>Inbox</span>
                <span style={{ background: "#f1f5f9", color: "#64748b", fontSize: 12, fontWeight: 600, borderRadius: 99, padding: "3px 10px" }}>
                  {filteredComplaints.length} {statusFilter === "All" ? "Total" : statusFilter}
                </span>
              </div>

              {filteredComplaints.length === 0 ? (
                <div className="cmp-empty">
                  <div style={{ fontSize: 28, marginBottom: 10 }}>📭</div>
                  <p style={{ fontWeight: 700, fontSize: 14, color: "#475569", margin: "0 0 4px" }}>No complaints found</p>
                  <p style={{ fontSize: 13, margin: 0 }}>No complaints match the current filter.</p>
                </div>
              ) : (
                filteredComplaints.map(c => (
                  <div
                    key={c.id}
                    onClick={() => setSelected({ ...c, priority: detectPriority(c) })}
                    className="cmp-row"
                  >
                    {/* Left color dot by priority */}
                    <div style={{
                      width: 10, height: 10, borderRadius: "50%", flexShrink: 0,
                      background: (PRIORITY[detectPriority(c)] || PRIORITY.LOW).dot,
                    }} />

                    <div className="cmp-row-body">
                      <div className="cmp-row-top">
                        <span style={{ fontWeight: 700, fontSize: 14, color: "#0f172a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {c.title}
                        </span>
                        <PriorityBadge priority={detectPriority(c)} />
                      </div>
                      <p style={{ margin: 0, fontSize: 12, color: "#94a3b8" }}>
                        {c.user || "Anonymous"} · #{c.id}
                      </p>
                      <div className="cmp-row-meta">
                        <TypeBadge type={c.type} />
                        <StatusBadge status={c.status || "Pending"} />
                      </div>
                    </div>

                    {/* Arrow hint */}
                    <span style={{ color: "#cbd5e1", fontSize: 18, flexShrink: 0 }}>›</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </main>
      </div>

      {/* ── Modal ── */}
      {selected && (
        <div className="cmp-overlay" onClick={(e) => { if (e.target === e.currentTarget) setSelected(null); }}>
          <div className="cmp-modal">
            <button className="cmp-modal-close" onClick={() => setSelected(null)}>
              <X size={16} />
            </button>

            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

              {/* Header */}
              <div style={{ paddingRight: 40 }}>
                <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "#0f172a", letterSpacing: "-0.01em" }}>
                  {selected.title}
                </h2>
                <p style={{ margin: "4px 0 8px", fontSize: 13, color: "#94a3b8" }}>
                  ID: {selected.id} · Received on {selected.date}
                </p>
                <StatusBadge status={selected.status || "Pending"} />
              </div>

              {/* User info + Priority */}
              <div style={{ background: "#f8fafc", borderRadius: 14, padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
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

              {/* Description */}
              <div>
                <p className="cmp-section-label">Complaint Description</p>
                <div style={{ background: "#f8fafc", borderRadius: 12, padding: "14px 16px", fontSize: 14, color: "#334155", lineHeight: 1.6, border: "1px solid #f1f5f9" }}>
                  {selected.description}
                </div>
              </div>

              {/* Internal Notes */}
              <div>
                <p className="cmp-section-label">Internal Notes</p>
                <textarea
                  className="cmp-note-area"
                  placeholder="Type internal notes..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  onBlur={saveNote}
                  disabled={isFinal(selected.status)}
                  style={{ opacity: isFinal(selected.status) ? 0.6 : 1 }}
                />
              </div>

              {/* Action Buttons — locked once final */}
              <div style={{ display: "flex", gap: 12 }}>
                <button
                  className="cmp-btn-resolve"
                  onClick={() => updateStatus(selected.id, "Resolved")}
                  disabled={isFinal(selected.status)}
                  style={{
                    background: selected.status === "Resolved" ? "#f0fdf4" : isFinal(selected.status) ? "#f1f5f9" : "#10b981",
                    color: selected.status === "Resolved" ? "#16a34a" : isFinal(selected.status) ? "#94a3b8" : "#fff",
                  }}
                >
                  {selected.status === "Resolved" ? "✓ Resolved" : "Mark as Resolved"}
                </button>

                <button
                  className="cmp-btn-dismiss"
                  onClick={() => updateStatus(selected.id, "Dismissed")}
                  disabled={isFinal(selected.status)}
                  style={{
                    background: selected.status === "Dismissed" ? "#fff1f2" : "#fff",
                    color: selected.status === "Dismissed" ? "#dc2626" : isFinal(selected.status) ? "#94a3b8" : "#475569",
                    border: selected.status === "Dismissed" ? "1.5px solid #fecaca" : "1.5px solid #e2e8f0",
                  }}
                >
                  {selected.status === "Dismissed" ? "✓ Dismissed" : "Dismiss"}
                </button>
              </div>

              {/* Lock notice */}
              {isFinal(selected.status) && (
                <p style={{ margin: 0, fontSize: 12, color: "#94a3b8", textAlign: "center", background: "#f8fafc", borderRadius: 10, padding: "8px 12px" }}>
                  🔒 This complaint is <strong>{selected.status}</strong> and can no longer be modified.
                </p>
              )}

            </div>
          </div>
        </div>
      )}
    </>
  );
}