/**
 * ComplaintsPage.jsx - Customer Complaints Management (Admin) — Redesigned
 * Logic unchanged, styling updated to match AdminDashboard.
 */

import { useState, useEffect } from "react";
import Header from "../ui/Header";
import Sidebar from "../ui/Sidebar";
import api from "../../services/api";

const S = {
  page:      { display: "flex", minHeight: "100vh", backgroundColor: "#F4F6FB", fontFamily: "'Segoe UI', sans-serif" },
  main:      { flex: 1, padding: "0 0 32px 0", overflowY: "auto" },
  inner:     { padding: "28px 32px", display: "flex", flexDirection: "column", gap: 28 },
  card:      { backgroundColor: "#fff", borderRadius: 14, boxShadow: "0 2px 12px rgba(0,0,0,0.07)" },
  row:       { display: "flex", gap: 24 },
  label:     { margin: 0, fontSize: 11, color: "#8a8a9a", textTransform: "uppercase", letterSpacing: "0.08em" },
};

const priorityStyle = {
  HIGH:   { background: "#fde8e8", color: "#c0392b" },
  MEDIUM: { background: "#fff3cd", color: "#856404" },
  LOW:    { background: "#e8f4fd", color: "#1a6fa8" },
};

// ── Avatar initials ────────────────────────────────────────────────────
function Avatar({ name = "??" }) {
  const initials = name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  const colors = ["#4f8ef7", "#28a745", "#ffc107", "#6f42c1", "#e83e8c", "#fd7e14"];
  const color  = colors[name.charCodeAt(0) % colors.length];
  return (
    <div style={{
      width: 38, height: 38, borderRadius: "50%",
      backgroundColor: `${color}22`,
      border: `2px solid ${color}44`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontWeight: 700, fontSize: 13, color, flexShrink: 0,
    }}>
      {initials}
    </div>
  );
}

export default function ComplaintsPage() {
  const [openBar, setOpenBar]   = useState(window.innerWidth >= 600);
  const [selected, setSelected] = useState(null);
  const [showList, setShowList] = useState(false);
  const [complaints, setComplaints] = useState([]);

  useEffect(() => {
    api.get("/api/complaints")
      .then(res => setComplaints(res.data))
      .catch(err => console.error("Error:", err));
  }, []);

  return (
    <div style={S.page}>
      <Sidebar openBar={openBar} setOpenBar={setOpenBar} />

      <main style={S.main}>
        <Header concept="Complaints" setOpenBar={setOpenBar} openBar={openBar} />

        <div style={S.inner}>

          {/* Title */}
          <div>
            <p style={{ margin: "4px 0 0", fontSize: 14, color: "#8a8a9a" }}>Manage and resolve customer complaints.</p>
          </div>

          {/* Mobile toggle */}
          <div style={{ display: "none" }} className="mobile-toggle">
            <button
              onClick={() => setShowList(true)}
              style={{ width: "100%", background: "#1a1a2e", color: "#fff", padding: "12px 16px", borderRadius: 10, border: "none", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 14 }}
            >
              <span>Complaints</span>
              <span style={{ background: "#fff", color: "#1a1a2e", borderRadius: 99, padding: "2px 10px", fontSize: 12, fontWeight: 600 }}>{complaints.length}</span>
            </button>
          </div>

          {/* Two-panel layout */}
          <div style={{ ...S.row, alignItems: "flex-start" }}>

            {/* LEFT — List */}
            <div style={{ ...S.card, width: 320, minWidth: 280, flexShrink: 0, padding: "20px 0", display: "flex", flexDirection: "column", gap: 0, maxHeight: "70vh", overflowY: "auto" }}>
              <div style={{ padding: "0 20px 14px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #f0f0f5" }}>
                <span style={{ fontWeight: 600, fontSize: 15, color: "#1a1a2e" }}>Inbox</span>
                <span style={{ background: "#F4F6FB", color: "#8a8a9a", borderRadius: 99, padding: "2px 10px", fontSize: 12 }}>{complaints.length} Total</span>
              </div>
 
              {complaints.map(c => (
                <div
                  key={c.id}
                  onClick={() => setSelected(c)}
                  style={{
                    padding: "14px 20px",
                    cursor: "pointer",
                    borderLeft: selected?.id === c.id ? "3px solid #4f8ef7" : "3px solid transparent",
                    background: selected?.id === c.id ? "#f8faff" : "transparent",
                    transition: "background 0.15s",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                    <span style={{ fontSize: 11, color: "#8a8a9a" }}>{c.id}</span>
                    <span style={{ ...priorityStyle[c.priority?.toUpperCase()], fontSize: 11, padding: "2px 8px", borderRadius: 99, fontWeight: 500 }}>{c.priority}</span>
                  </div>
                  <p style={{ margin: 0, fontWeight: 600, fontSize: 13, color: "#1a1a2e" }}>{c.title}</p>
                  <p style={{ margin: "2px 0 0", fontSize: 12, color: "#8a8a9a" }}>{c.user}</p>
                  <p style={{ margin: "4px 0 0", fontSize: 12, color: c.status === "Resolved" ? "#28a745" : "#e67e22" }}>{c.status}</p>
                </div>
              ))}
            </div>

            {/* RIGHT — Detail */}
            <div style={{ ...S.card, flex: 1, padding: "28px", minHeight: 400 }}>
              {selected ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

                  {/* Header */}
                  <div>
                    <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#1a1a2e" }}>{selected.title}</h2>
                    <p style={{ margin: "4px 0 0", fontSize: 13, color: "#8a8a9a" }}>ID: {selected.id} · Received on {selected.date}</p>
                  </div>

                  {/* User info */}
                  <div style={{ background: "#F4F6FB", borderRadius: 12, padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                      <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#e0e7ff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14, color: "#4f8ef7" }}>
                          <Avatar name={selected.username || "??"} />
                      </div>
                      <div>
                        <p style={{ margin: 0, fontWeight: 600, fontSize: 14, color: "#1a1a2e" }}>{selected.user}</p>
                        <p style={{ margin: 0, fontSize: 12, color: "#8a8a9a" }}>email@example.com</p>
                      </div>
                    </div>
                    <div>
                      <p style={{ ...S.label, marginBottom: 4 }}>Priority</p>
                      <span style={{ ...priorityStyle[selected.priority], fontSize: 12, padding: "3px 10px", borderRadius: 99, fontWeight: 600 }}>{selected.priority}</span>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <p style={{ ...S.label, marginBottom: 8 }}>Complaint Description</p>
                    <div style={{ background: "#F4F6FB", borderRadius: 10, padding: "14px 16px", fontSize: 14, color: "#3a3a4a", lineHeight: 1.6 }}>
                      {selected.description}
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <p style={{ ...S.label, marginBottom: 8 }}>Internal Notes</p>
                    <textarea
                      placeholder="Type internal notes..."
                      style={{ width: "100%", minHeight: 110, padding: "12px 14px", borderRadius: 10, border: "1.5px solid #e8e8f0", fontSize: 13, fontFamily: "'Segoe UI', sans-serif", resize: "vertical", outline: "none", color: "#1a1a2e", boxSizing: "border-box" }}
                    />
                  </div>

                  {/* Buttons */}
                  <div style={{ display: "flex", gap: 12 }}>
                    <button style={{ flex: 1, background: "#28a745", color: "#fff", border: "none", borderRadius: 10, padding: "12px", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
                      Mark as Resolved
                    </button>
                    <button style={{ flex: 1, background: "#fff", color: "#1a1a2e", border: "1.5px solid #e8e8f0", borderRadius: 10, padding: "12px", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
                      Dismiss
                    </button>
                  </div>

                </div>
              ) : (
                <div style={{ textAlign: "center", padding: "80px 0", color: "#8a8a9a" }}>
                  <p style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>No Complaint Selected</p>
                  <p style={{ fontSize: 13 }}>Select a complaint from the list to view details.</p>
                </div>
              )}
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
