/**
 * ValidationPage.jsx - Content Validation Queue (Admin)
 * All logic preserved, design improved + responsive.
 */

import Header from "../ui/Header";
import Sidebar from "../ui/Sidebar";
import { useState } from "react";
import {
  LayoutDashboard, Users, MessageSquare, CheckSquare,
  BarChart, Activity, Settings,
} from "lucide-react";

export default function ValidationPage() {
  const [openBar, setOpenBar] = useState(window.innerWidth >= 768);
  const [selected, setSelected] = useState(null);
  //const [showList, setShowList] = useState(false);
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
  const filteredTypes = activeFilter === "All" ? items : items.filter(u => u.type === activeFilter);

  const STATUS_STYLE = {
    Pending:  { bg: "#fffbeb", color: "#d97706", icon: "⏳", dot: "#f59e0b" },
    Approved: { bg: "#f0fdf4", color: "#16a34a", icon: "✓",  dot: "#10b981" },
    Rejected: { bg: "#fff1f2", color: "#dc2626", icon: "✕",  dot: "#ef4444" },
  };

  const TYPE_STYLE = {
    Products:   { bg: "#eff6ff", color: "#2563eb" },
    AR:         { bg: "#f5f3ff", color: "#7c3aed" },
    Campaigns:  { bg: "#fef3c7", color: "#92400e" },
    Promotions: { bg: "#fce7f3", color: "#9d174d" },
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

  const pendingCount  = items.filter(i => i.status === "Pending").length;
  const approvedCount = items.filter(i => i.status === "Approved").length;
  const rejectedCount = items.filter(i => i.status === "Rejected").length;

  return (
    <>
      <style>{`
        .val-page { display: flex; min-height: 100vh; background: #f8fafc; font-family: 'Inter', 'Segoe UI', sans-serif; }
        .val-main { flex: 1; overflow-y: auto; min-width: 0; }
        .val-inner { padding: 24px 28px 40px; display: flex; flex-direction: column; gap: 20px; }
        .val-stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
        .val-stat-card { background: #fff; border-radius: 16px; border: 1px solid #f1f5f9; box-shadow: 0 1px 3px rgba(0,0,0,0.06); padding: 16px 20px; display: flex; align-items: center; gap: 14px; }
        .val-layout { display: grid; grid-template-columns: 320px 1fr; gap: 20px; min-height: 540px; }
        .val-panel { background: #fff; border-radius: 16px; border: 1px solid #f1f5f9; box-shadow: 0 1px 3px rgba(0,0,0,0.06); display: flex; flex-direction: column; overflow: hidden; }
        .val-filters { display: flex; gap: 8px; flex-wrap: wrap; padding: 16px; border-bottom: 1px solid #f8fafc; }
        .val-filter-btn { padding: 5px 14px; border-radius: 99px; font-size: 12px; font-weight: 600; border: 1.5px solid #e2e8f0; cursor: pointer; transition: all .15s; background: #fff; color: #64748b; font-family: inherit; }
        .val-filter-btn.active { background: #0f172a; color: #fff; border-color: #0f172a; }
        .val-filter-btn:not(.active):hover { border-color: #6366f1; color: #6366f1; background: #eef2ff; }
        .val-list-scroll { flex: 1; overflow-y: auto; }
        .val-item { display: flex; justify-content: space-between; align-items: center; padding: 14px 16px; cursor: pointer; border-bottom: 1px solid #f8fafc; border-left: 3px solid transparent; transition: all .12s; gap: 8px; }
        .val-item:last-child { border-bottom: none; }
        .val-item:hover { background: #fafbff; }
        .val-item.active { background: #f0f4ff; border-left-color: #6366f1; }
        .val-type-tag { font-size: 10px; font-weight: 800; padding: 3px 8px; border-radius: 6px; text-transform: uppercase; letter-spacing: .05em; display: inline-block; margin-bottom: 4px; }
        .val-detail-content { flex: 1; overflow-y: auto; padding: 24px; display: flex; flex-direction: column; gap: 18px; }
        .val-detail-actions { border-top: 1px solid #f1f5f9; padding: 16px; display: flex; gap: 12px; }
        .val-info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .val-info-cell { background: #f8fafc; border: 1px solid #f1f5f9; border-radius: 12px; padding: 14px; }
        .val-section-label { font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: .07em; margin: 0 0 8px; }
        .val-textarea { width: 100%; padding: 12px 14px; border: 1.5px solid #e2e8f0; border-radius: 12px; font-size: 13px; font-family: inherit; resize: vertical; outline: none; min-height: 100px; background: #f8fafc; color: #0f172a; box-sizing: border-box; transition: border-color .2s; }
        .val-textarea:focus { border-color: #6366f1; background: #fff; }
        .val-btn-approve { flex: 1; background: #10b981; color: #fff; border: none; border-radius: 12px; padding: 13px; font-size: 14px; font-weight: 700; cursor: pointer; font-family: inherit; transition: background .15s; }
        .val-btn-approve:hover { background: #059669; }
        .val-btn-reject { flex: 1; background: #fff; color: #dc2626; border: 1.5px solid #fecaca; border-radius: 12px; padding: 13px; font-size: 14px; font-weight: 700; cursor: pointer; font-family: inherit; transition: all .15s; }
        .val-btn-reject:hover { background: #fff1f2; border-color: #fca5a5; }
        @media (max-width: 1024px) { .val-layout { grid-template-columns: 260px 1fr; } }
        @media (max-width: 768px) {
          .val-inner { padding: 16px 12px 32px; gap: 14px; }
          .val-stats-grid { grid-template-columns: 1fr 1fr 1fr; gap: 10px; }
          .val-layout { grid-template-columns: 1fr; }
          .val-info-grid { grid-template-columns: 1fr; }
        }
        @media (max-width: 480px) { .val-stats-grid { grid-template-columns: 1fr; } }
      `}</style>
      <div className="val-page">
        <Sidebar openBar={openBar} setOpenBar={setOpenBar} links={adminLinks} title="AdminCore" subtitle="Enterprise Suite" role="Super Admin" />
        <main className="val-main">
          <Header concept="Validation" setOpenBar={setOpenBar} openBar={openBar} />
          <div className="val-inner">

            {/* Stats */}
            <div className="val-stats-grid">
              {[
                { label: "Pending Review", count: pendingCount, icon: "⏳", iconBg: "#fffbeb", color: "#d97706" },
                { label: "Approved",       count: approvedCount, icon: "✅", iconBg: "#ecfdf5", color: "#16a34a" },
                { label: "Rejected",       count: rejectedCount, icon: "❌", iconBg: "#fff1f2", color: "#dc2626" },
              ].map(s => (
                <div key={s.label} className="val-stat-card">
                  <div style={{ width: 42, height: 42, borderRadius: 12, background: s.iconBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>{s.icon}</div>
                  <div>
                    <p style={{ margin: "0 0 2px", fontSize: 11, color: "#94a3b8", textTransform: "uppercase", letterSpacing: ".07em", fontWeight: 700 }}>{s.label}</p>
                    <p style={{ margin: 0, fontSize: 24, fontWeight: 800, color: "#0f172a", letterSpacing: "-0.02em" }}>{s.count}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Main layout */}
            <div className="val-layout">

              {/* LEFT PANEL */}
              <div className="val-panel">
                <div className="val-filters">
                  {filters.map(f => (
                    <button key={f} className={`val-filter-btn${activeFilter === f ? " active" : ""}`} onClick={() => setActiveFilter(f)}>{f}</button>
                  ))}
                </div>
                <div className="val-list-scroll">
                  {filteredTypes.map((item, i) => {
                    const ss = STATUS_STYLE[item.status] || STATUS_STYLE.Pending;
                    const ts = TYPE_STYLE[item.type] || { bg: "#f8fafc", color: "#64748b" };
                    return (
                      <div key={i} className={`val-item${selected === item ? " active" : ""}`} onClick={() => setSelected(item)}>
                        <div style={{ minWidth: 0 }}>
                          <span className="val-type-tag" style={{ background: ts.bg, color: ts.color }}>{item.type}</span>
                          <p style={{ margin: 0, fontWeight: 700, fontSize: 13, color: "#0f172a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.title}</p>
                          <p style={{ margin: "2px 0 0", fontSize: 12, color: "#94a3b8" }}>By {item.user}</p>
                        </div>
                        <span style={{ ...ss, background: "transparent", fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", gap: 4, whiteSpace: "nowrap", flexShrink: 0 }}>
                          <span style={{ width: 6, height: 6, borderRadius: "50%", background: ss.dot, display: "inline-block" }} />
                          {item.status}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* RIGHT PANEL */}
              <div className="val-panel">
                {selected ? (
                  <>
                    <div className="val-detail-content">
                      {/* Header */}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
                        <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                          <img
                            src="https://via.placeholder.com/50"
                            style={{ width: 52, height: 52, borderRadius: 14, objectFit: "cover", border: "2px solid #f1f5f9", flexShrink: 0 }}
                            alt=""
                          />
                          <div>
                            <h2 style={{ margin: "0 0 4px", fontSize: 17, fontWeight: 800, color: "#0f172a", letterSpacing: "-0.01em" }}>{selected.title}</h2>
                            <p style={{ margin: 0, fontSize: 12, color: "#94a3b8", fontFamily: "monospace" }}>V-001 · {selected.user}</p>
                          </div>
                        </div>
                        {(() => {
                          const ss = STATUS_STYLE[selected.status] || STATUS_STYLE.Pending;
                          return (
                            <span style={{ background: ss.bg, color: ss.color, padding: "5px 12px", borderRadius: 99, fontSize: 12, fontWeight: 700, flexShrink: 0, display: "inline-flex", alignItems: "center", gap: 5 }}>
                              {ss.icon} {selected.status}
                            </span>
                          );
                        })()}
                      </div>

                      {/* Info grid */}
                      <div className="val-info-grid">
                        <div className="val-info-cell">
                          <p className="val-section-label">Category</p>
                          <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#334155" }}>📦 {selected.type}</p>
                        </div>
                        <div className="val-info-cell">
                          <p className="val-section-label">Submitted</p>
                          <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#334155", fontFamily: "monospace" }}>2023-10-25 09:00 AM</p>
                        </div>
                      </div>

                      {/* Submission details */}
                      <div>
                        <p className="val-section-label">Submission Details</p>
                        <div style={{ background: "#f8fafc", border: "1px solid #f1f5f9", borderRadius: 12, padding: "14px 16px", fontSize: 14, color: "#475569", lineHeight: 1.6 }}>
                          New bookshelf listing with 6 color variants, dimensions and material specs included.
                        </div>
                      </div>

                      {/* Rejection note */}
                      <div>
                        <p className="val-section-label">Rejection Note <span style={{ color: "#cbd5e1", fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(shown to submitter)</span></p>
                        <textarea className="val-textarea" placeholder="Describe why this was rejected or what needs to be corrected..." />
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="val-detail-actions">
                      <button className="val-btn-approve">✓ Approve</button>
                      <button className="val-btn-reject">✕ Reject</button>
                    </div>
                  </>
                ) : (
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 40, textAlign: "center" }}>
                    <div style={{ width: 64, height: 64, background: "#f8fafc", borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, marginBottom: 16, border: "1px solid #f1f5f9" }}>📄</div>
                    <h3 style={{ margin: "0 0 8px", fontWeight: 800, fontSize: 16, color: "#334155" }}>Select an item to review</h3>
                    <p style={{ margin: 0, fontSize: 13, color: "#94a3b8", lineHeight: 1.5 }}>Choose a submission from the queue to view details and approve or reject it.</p>
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