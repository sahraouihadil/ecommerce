/**
 * AccountsPage.jsx - User Account Management (Admin)
 * All logic preserved, design improved + responsive.
 */

import { useState, useEffect } from "react";
import Header from "../ui/Header";
import Sidebar from "../ui/Sidebar";
import api from "../../services/api";
import {
  LayoutDashboard, Users, MessageSquare, CheckSquare,
  BarChart, Activity, Settings, X,
} from "lucide-react";

const roleColors = {
  admin:             { bg: "#eef2ff", color: "#4f46e5" },
  customer:          { bg: "#eff6ff", color: "#2563eb" },
  accountant:        { bg: "#fefce8", color: "#ca8a04" },
  marketing_manager: { bg: "#faf5ff", color: "#7c3aed" },
  stock_manager:     { bg: "#f0fdf4", color: "#16a34a" },
  deliveryman:       { bg: "#fff1f2", color: "#dc2626" },
  ar_developer:      { bg: "#f0fdfa", color: "#0d9488" },
};

function getRoleStyle(role = "") {
  return roleColors[role.toLowerCase()] || { bg: "#f8fafc", color: "#475569" };
}

function Avatar({ name = "??" }) {
  const initials = name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  const palette  = ["#6366f1", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899", "#f97316"];
  const color    = palette[name.charCodeAt(0) % palette.length];
  return (
    <div style={{
      width: 38, height: 38, borderRadius: "50%",
      background: `${color}18`, border: `2px solid ${color}33`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontWeight: 700, fontSize: 13, color, flexShrink: 0,
    }}>
      {initials}
    </div>
  );
}

const inputCls = {
  width: "100%", padding: "10px 14px", border: "1.5px solid #e2e8f0",
  borderRadius: 10, fontSize: 14, outline: "none", boxSizing: "border-box",
  fontFamily: "inherit", color: "#0f172a", background: "#f8fafc",
  transition: "border-color .2s, background .2s",
};

const labelCls = {
  fontSize: 11, fontWeight: 700, color: "#64748b",
  textTransform: "uppercase", letterSpacing: "0.07em", display: "block", marginBottom: 6,
};

export default function AccountsPage() {
  const [openBar, setOpenBar]     = useState(window.innerWidth >= 768);
  const [activeFilter, setActiveFilter] = useState("All");
  const [users, setUsers]         = useState([]);
  const [message, setMessage]     = useState(null);
  const [open, setOpen]           = useState(false);
  const [form, setForm]           = useState({ username: "", email: "", role: "Admin" });
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModel, setShowModel] = useState(false);
  const [editForm, setEditForm]   = useState({ username: "", email: "", role: "Customer" });
  const [keyword, setKeyword]     = useState("");
  const [results, setResults]     = useState([]);

  useEffect(() => {
    api.get("/api/users").then(res => setUsers(res.data)).catch(console.error);
  }, []);

  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => setMessage(null), 3000);
    return () => clearTimeout(t);
  }, [message]);

  const handleCreate = async () => {
    if (!form.username || !form.email) { setMessage({ type: "error", text: "Username and email required" }); return; }
    try {
      const res = await api.post("/api/users", { username: form.username, email: form.email, role: form.role.toLowerCase() });
      setUsers(prev => [...prev, res.data]);
      setForm({ username: "", email: "", role: "Customer" });
      setOpen(false);
      setMessage({ type: "success", text: "User created successfully ✅" });
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.detail || "Error creating user ❌" });
    }
  };

  const handleEdit = async (user) => {
    try {
      const res = await api.get(`/api/users/${user.id}`);
      setSelectedUser(res.data); setEditForm(res.data); setShowModel(true);
    } catch (err) { console.log(err); }
  };

  const handleSaveEdit = async () => {
    try {
      const res = await api.put(`/api/users/${selectedUser.id}`, { username: editForm.username, email: editForm.email, role: editForm.role.toLowerCase() });
      setUsers(prev => prev.map(u => u.id === selectedUser.id ? res.data : u));
      setShowModel(false);
      setMessage({ type: "success", text: "User updated successfully ✏️" });
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.detail || "Error updating user ❌" });
    }
  };

  const handleRemoveUser = async (user) => {
    try {
      await api.delete(`/api/users/${user.id}`);
      setUsers(prev => prev.filter(u => u.id !== user.id));
      setMessage({ type: "success", text: "User deleted successfully 🗑️" });
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.detail || "Error deleting user ❌" });
    }
  };

  const filters = ["All", "Admin", "Customer", "Accountant", "Marketing Manager", "Stock Manager", "Deliveryman"];
  const normalize = str => str.toLowerCase().replace(/_/g, " ");
  const filteredUsers = activeFilter === "All" ? users : users.filter(u => normalize(u.role) === normalize(activeFilter));

  const handleSearch = async (event) => {
    if (event) event.preventDefault();
    try {
      const response = await api.get(`/search-users?keyword=${keyword}`);
      setResults(response.data);
    } catch (err) { console.log(err); }
  };

  const displayedUsers = keyword && results.length > 0 ? results : filteredUsers;

  const adminLinks = [
    { to: "/admin-dash",               label: "Dashboard",     icon: <LayoutDashboard size={18} />, end: true },
    { to: "/admin-dash/accounts",      label: "Accounts",      icon: <Users size={18} /> },
    { to: "/admin-dash/complaints",    label: "Complaints",    icon: <MessageSquare size={18} /> },
    { to: "/admin-dash/reports",       label: "Reports",       icon: <BarChart size={18} /> },
    { to: "/admin-dash/engagement",    label: "Engagement",    icon: <Activity size={18} /> },
    { to: "/admin-dash/configuration", label: "Configuration", icon: <Settings size={18} /> },
    { to: "/admin-dash/validation",    label: "Validation",    icon: <CheckSquare size={18} /> },
  ];

  const modalOverlay = {
    position: "fixed", inset: 0, backgroundColor: "rgba(15,23,42,0.5)",
    display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999,
    padding: 16, backdropFilter: "blur(4px)",
  };

  const modalBox = {
    background: "#fff", borderRadius: 20, padding: "32px 28px",
    width: "100%", maxWidth: 440, position: "relative",
    boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
  };

  return (
    <>
      <style>{`
        .acct-page { display: flex; min-height: 100vh; background: #f8fafc; font-family: 'Inter', 'Segoe UI', sans-serif; }
        .acct-main { flex: 1; overflow-y: auto; min-width: 0; }
        .acct-inner { padding: 24px 28px 40px; }
        .acct-filters { display: flex; flex-wrap: wrap; gap: 8px; margin: 16px 0 20px; }
        .acct-filter-btn { padding: 6px 16px; border-radius: 99px; font-size: 12px; font-weight: 600; border: 1.5px solid #e2e8f0; cursor: pointer; transition: all .15s; background: #fff; color: #64748b; }
        .acct-filter-btn.active { background: #0f172a; color: #fff; border-color: #0f172a; }
        .acct-filter-btn:not(.active):hover { border-color: #6366f1; color: #6366f1; background: #eef2ff; }
        .acct-card { background: #fff; border-radius: 16px; border: 1px solid #f1f5f9; box-shadow: 0 1px 3px rgba(0,0,0,0.06); overflow: hidden; }
        .acct-toolbar { display: flex; justify-content: space-between; align-items: center; padding: 16px 20px; border-bottom: 1px solid #f1f5f9; flex-wrap: wrap; gap: 12px; }
        .acct-search { display: flex; gap: 0; }
        .acct-search input { padding: 9px 14px; border: 1.5px solid #e2e8f0; border-right: none; border-radius: 10px 0 0 10px; font-size: 13px; outline: none; min-width: 220px; background: #f8fafc; color: #0f172a; }
        .acct-search button { padding: 9px 16px; background: #0f172a; color: #fff; border: none; border-radius: 0 10px 10px 0; font-size: 13px; cursor: pointer; font-weight: 600; }
        .acct-add-btn { padding: 9px 20px; background: #6366f1; color: #fff; border: none; border-radius: 10px; font-size: 13px; font-weight: 700; cursor: pointer; transition: background .15s; white-space: nowrap; }
        .acct-add-btn:hover { background: #4f46e5; }
        .acct-table { width: 100%; border-collapse: collapse; }
        .acct-table th { padding: 12px 20px; text-align: left; font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: .06em; background: #f8fafc; border-bottom: 1px solid #f1f5f9; }
        .acct-table td { padding: 14px 20px; border-bottom: 1px solid #f8fafc; vertical-align: middle; }
        .acct-table tbody tr:last-child td { border-bottom: none; }
        .acct-table tbody tr { transition: background .12s; }
        .acct-table tbody tr:hover { background: #fafbff; }
        .acct-action-btn { border: none; border-radius: 8px; width: 32px; height: 32px; cursor: pointer; font-size: 14px; display: inline-flex; align-items: center; justify-content: center; transition: all .15s; }
        .acct-action-btn.edit { background: #eef2ff; color: #6366f1; }
        .acct-action-btn.edit:hover { background: #e0e7ff; }
        .acct-action-btn.del { background: #fff1f2; color: #dc2626; }
        .acct-action-btn.del:hover { background: #fee2e2; }
        .acct-status { display: inline-flex; align-items: center; gap: 5px; padding: 4px 10px; border-radius: 99px; font-size: 12px; font-weight: 600; }
        .acct-status.active { background: #f0fdf4; color: #16a34a; }
        .acct-status.inactive { background: #f8fafc; color: #94a3b8; }
        .toast { position: fixed; bottom: 24px; right: 24px; padding: 14px 20px; border-radius: 12px; font-size: 14px; font-weight: 600; z-index: 1000; box-shadow: 0 8px 24px rgba(0,0,0,0.12); animation: slideUp .25s ease; }
        .toast.success { background: #f0fdf4; color: #15803d; border: 1px solid #bbf7d0; }
        .toast.error { background: #fff1f2; color: #dc2626; border: 1px solid #fecaca; }
        @keyframes slideUp { from { transform: translateY(16px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @media (max-width: 768px) {
          .acct-inner { padding: 16px 12px 32px; }
          .acct-toolbar { flex-direction: column; align-items: stretch; }
          .acct-search input { min-width: 0; flex: 1; }
          .acct-table th:nth-child(3), .acct-table td:nth-child(3),
          .acct-table th:nth-child(4), .acct-table td:nth-child(4) { display: none; }
        }
        @media (max-width: 480px) {
          .acct-table th:nth-child(2), .acct-table td:nth-child(2) { display: none; }
        }
      `}</style>

      <div className="acct-page">
        <Sidebar openBar={openBar} setOpenBar={setOpenBar} links={adminLinks} title="AdminCore" subtitle="Enterprise Suite" role="Super Admin" profilePath="/admin-dash/profile" />

        <main className="acct-main">
          <Header concept="Accounts" setOpenBar={setOpenBar} openBar={openBar} />

          <div className="acct-inner">
            <p style={{ margin: "0 0 4px", fontSize: 14, color: "#64748b" }}>Manage and monitor all user accounts.</p>

            {/* Filters */}
            <div className="acct-filters">
              {filters.map(f => (
                <button key={f} className={`acct-filter-btn${activeFilter === f ? " active" : ""}`} onClick={() => setActiveFilter(f)}>{f}</button>
              ))}
            </div>

            <div className="acct-card">
              {/* Toolbar */}
              <div className="acct-toolbar">
                <form className="acct-search" onSubmit={handleSearch}>
                  <input
                    type="text"
                    placeholder="Search users by name or email..."
                    value={keyword}
                    onChange={e => setKeyword(e.target.value)}
                  />
                  <button type="submit">Search</button>
                </form>
                <button className="acct-add-btn" onClick={() => setOpen(true)}>+ Add User</button>
              </div>

              {/* Table */}
              <div style={{ overflowX: "auto" }}>
                <table className="acct-table">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Last Active</th>
                      <th style={{ textAlign: "right" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayedUsers?.map(u => (
                      <tr key={u.id}>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            <Avatar name={u.username || "??"} />
                            <div>
                              <p style={{ margin: 0, fontWeight: 600, fontSize: 14, color: "#0f172a" }}>{u.username}</p>
                              <p style={{ margin: "2px 0 0", fontSize: 12, color: "#94a3b8" }}>{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span style={{
                            ...getRoleStyle(u.role),
                            padding: "4px 12px", borderRadius: 99, fontSize: 12, fontWeight: 600, display: "inline-block",
                          }}>
                            {u.role?.replace(/_/g, " ")}
                          </span>
                        </td>
                        <td>
                          <span className={`acct-status ${u.active ? "active" : "inactive"}`}>
                            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "currentColor", display: "inline-block" }} />
                            {u.active ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td style={{ fontSize: 13, color: "#94a3b8" }}>{u.last || "—"}</td>
                        <td>
                          <div style={{ display: "flex", justifyContent: "flex-end", gap: 6 }}>
                            <button className="acct-action-btn edit" onClick={() => handleEdit(u)} title="Edit">✏️</button>
                            <button className="acct-action-btn del" onClick={() => handleRemoveUser(u)} title="Delete">🗑</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {displayedUsers?.length === 0 && (
                      <tr>
                        <td colSpan={5} style={{ padding: "48px 20px", textAlign: "center", color: "#94a3b8", fontSize: 14 }}>
                          No users found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>

        {/* Toast */}
        {message && <div className={`toast ${message.type}`}>{message.text}</div>}

        {/* Add User Modal */}
        {open && (
          <div style={modalOverlay}>
            <div style={modalBox}>
              <button onClick={() => setOpen(false)} style={{ position: "absolute", top: 18, right: 18, background: "#f1f5f9", border: "none", borderRadius: 8, width: 32, height: 32, cursor: "pointer", fontSize: 16, color: "#64748b", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
              <h2 style={{ margin: "0 0 4px", fontSize: 18, fontWeight: 800, color: "#0f172a" }}>Add New Account</h2>
              <p style={{ margin: "0 0 24px", fontSize: 13, color: "#94a3b8" }}>Fill in the details to create a new user.</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div><label style={labelCls}>Full Name</label><input type="text" placeholder="e.g. Ahmed Benali" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} style={inputCls} /></div>
                <div><label style={labelCls}>Email</label><input type="email" placeholder="e.g. ahmed@example.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} style={inputCls} /></div>
                <div>
                  <label style={labelCls}>Role</label>
                  <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} style={{ ...inputCls, appearance: "none" }}>
                    <option value="admin">Admin</option>
                    <option value="customer">Customer</option>
                    <option value="marketing_manager">Marketing Manager</option>
                    <option value="stock_manager">Stock Manager</option>
                    <option value="deliveryman">Deliveryman</option>
                  </select>
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 28 }}>
                <button onClick={() => setOpen(false)} style={{ padding: "10px 20px", borderRadius: 10, border: "none", background: "#f1f5f9", color: "#475569", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>Cancel</button>
                <button onClick={handleCreate} style={{ padding: "10px 24px", borderRadius: 10, border: "none", background: "#6366f1", color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer", boxShadow: "0 4px 14px rgba(99,102,241,.35)" }}>Create Account</button>
              </div>
            </div>
          </div>
        )}

        {/* Edit User Modal */}
        {showModel && (
          <div style={modalOverlay}>
            <div style={modalBox}>
              <button onClick={() => setShowModel(false)} style={{ position: "absolute", top: 18, right: 18, background: "#f1f5f9", border: "none", borderRadius: 8, width: 32, height: 32, cursor: "pointer", fontSize: 16, color: "#64748b", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
              <h2 style={{ margin: "0 0 4px", fontSize: 18, fontWeight: 800, color: "#0f172a" }}>Edit Account</h2>
              <p style={{ margin: "0 0 24px", fontSize: 13, color: "#94a3b8" }}>Update the user's information below.</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div><label style={labelCls}>Full Name</label><input type="text" value={editForm.username} onChange={e => setEditForm({ ...editForm, username: e.target.value })} style={inputCls} /></div>
                <div><label style={labelCls}>Email</label><input type="text" value={editForm.email} onChange={e => setEditForm({ ...editForm, email: e.target.value })} style={inputCls} /></div>
                <div>
                  <label style={labelCls}>Role</label>
                  <select value={editForm.role} onChange={e => setEditForm({ ...editForm, role: e.target.value })} style={{ ...inputCls, appearance: "none" }}>
                    <option value="admin">Admin</option>
                    <option value="customer">Customer</option>
                    <option value="marketing_manager">Marketing Manager</option>
                    <option value="stock_manager">Stock Manager</option>
                    <option value="deliveryman">Deliveryman</option>
                  </select>
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 28 }}>
                <button onClick={() => setShowModel(false)} style={{ padding: "10px 20px", borderRadius: 10, border: "none", background: "#f1f5f9", color: "#475569", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>Cancel</button>
                <button onClick={handleSaveEdit} style={{ padding: "10px 24px", borderRadius: 10, border: "none", background: "#6366f1", color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer", boxShadow: "0 4px 14px rgba(99,102,241,.35)" }}>Save Changes</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}