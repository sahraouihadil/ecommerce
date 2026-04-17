/**
 * AccountsPage.jsx - User Account Management (Admin)
 * =====================================================
 * Admin page for managing all user accounts in the system.
 *
 * FEATURES:
 *   - View all users in a table (name, email, role, status, last active)
 *   - Filter by role (Admin, Customer, Accountant, etc.)
 *   - Search users by name or email (real-time search via API)
 *   - Add new user (modal form -> POST /api/users)
 *   - Edit user (modal form -> PUT /api/users/:id)
 *   - Delete user (DELETE /api/users/:id)
 *
 * API ENDPOINTS:
 *   GET    /api/users          - Fetch all users
 *   GET    /api/users/:id      - Fetch single user for editing
 *   POST   /api/users          - Create new user
 *   PUT    /api/users/:id      - Update user
 *   DELETE /api/users/:id      - Delete user
 *   GET    /search-users       - Search by keyword
 */

import { useState, useEffect } from "react";
import Header from "../ui/Header";
import Sidebar from "../ui/Sidebar";
import api from "../../services/api";
import {
  LayoutDashboard, Users, MessageSquare, CheckSquare,
  BarChart, Activity, Settings, X,
} from "lucide-react";

// ── Role color map ─────────────────────────────────────────────────────
const roleColors = {
  admin:              { bg: "#e8eaff", color: "#3730a3" },
  customer:           { bg: "#dbeafe", color: "#1e40af" },
  accountant:         { bg: "#fef3c7", color: "#92400e" },
  marketing_manager:  { bg: "#ede9fe", color: "#5b21b6" },
  stock_manager:      { bg: "#d1fae5", color: "#065f46" },
  deliveryman:        { bg: "#fee2e2", color: "#991b1b" },
};

function getRoleStyle(role = "") {
  return roleColors[role.toLowerCase()] || { bg: "#f3f4f6", color: "#374151" };
}

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

// ── Shared input style ─────────────────────────────────────────────────
const inputStyle = {
  width: "100%", padding: "10px 12px", border: "1.5px solid #e5e7eb",
  borderRadius: 10, fontSize: 14, outline: "none", boxSizing: "border-box",
  fontFamily: "'Segoe UI', sans-serif", color: "#1a1a2e",
  transition: "border-color .2s",
};

const labelStyle = {
  fontSize: 12, fontWeight: 600, color: "#8a8a9a",
  textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: 6,
};

// ── Main Component ─────────────────────────────────────────────────────
export default function AccountsPage() {

  /* ── sidebar (Mobile) ── */
  const [openBar, setOpenBar] = useState(window.innerWidth >= 600);
  const [activeFilter, setActiveFilter] = useState("All");

  const [users, setUsers] = useState([]);

  useEffect(() => {
    api.get("/api/users").then((res) => {
      setUsers(res.data);
    }).catch((err) => {
      console.log("Error:", err);
    });
  }, []);
   // message 
  const [message, setMessage] = useState(null);

  useEffect(() => {
  if (!message) return;

  const timer = setTimeout(() => {
    setMessage(null);
  }, 3000);

  return () => clearTimeout(timer);
}, [message]);

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ username: "", email: "", role: "Admin" });

const handleCreate = async () => {
  if (!form.username || !form.email) {
    setMessage({ type: "error", text: "Username and email required" });
    return;
  }

  try {
    const res = await api.post("/api/users", {
      username: form.username,
      email: form.email,
      role: form.role.toLowerCase(),
    });
    console.log(res.data);
    setUsers((prev) => [...prev, res.data]);
    setForm({ username: "", email: "", role: "Customer" });
    setOpen(false);

    setMessage({ type: "success", text: "User created successfully ✅" });

  } catch (err) {
    setMessage({
      type: "error",
      text: err.response?.data?.detail || "Error creating user ❌",
    });
  }
};

  /* ── Edit user ── */
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModel, setShowModel]       = useState(false);
  const [editForm, setEditForm]         = useState({ username: "", email: "", role: "Customer" });

  const handleEdit = async (user) => {
    try {
      const res = await api.get(`/api/users/${user.id}`);
      setSelectedUser(res.data);
      setEditForm(res.data);
      setShowModel(true);
    } catch (err) { console.log(err); }
  };

  const handleSaveEdit = async () => {
  try {
    const res = await api.put(`/api/users/${selectedUser.id}`, {
      username: editForm.username,
      email: editForm.email,
      role: editForm.role.toLowerCase(),
    });

    setUsers((prev) =>
      prev.map((u) => (u.id === selectedUser.id ? res.data : u))
    );

    setShowModel(false);

    setMessage({ type: "success", text: "User updated successfully ✏️" });

  } catch (err) {
    setMessage({
      type: "error",
      text: err.response?.data?.detail || "Error updating user ❌",
    });
  }
};

  /* ── Remove user ── */
 const handleRemoveUser = async (user) => {
  try {
    await api.delete(`/api/users/${user.id}`);

    setUsers((prev) => prev.filter((u) => u.id !== user.id));

    setMessage({ type: "success", text: "User deleted successfully 🗑️" });

  } catch (err) {
    setMessage({
      type: "error",
      text: err.response?.data?.detail || "Error deleting user ❌",
    });
  }
};

  /* ── Filters ── */
  const filters = ["All", "Admin", "Customer", "Accountant", "Marketing Manager", "Stock Manager", "Deliveryman"];
  const normalize = (str) =>
  str.toLowerCase().replace(/_/g, " ");

  const filteredUsers = activeFilter === "All"
    ? users
    : users.filter((u) => normalize(u.role) === normalize(activeFilter));

  /* ── Search ── */
  const [keyword, setKeyword] = useState("");
  const [results, setResults] = useState([]);

  const handleSearch = async (event) => {
    if (event) event.preventDefault();
    try {
      const response = await api.get(`/search-users?keyword=${keyword}`);
      setResults(response.data);
    } catch (error) { console.error("Error during search:", error); }
  };

  useEffect(() => {
    if (keyword.trim() === "") return;
    handleSearch();
  }, [keyword]);

  const displayedUsers = keyword ? results : filteredUsers;

  /* ── Modal shared style ── */
  const modalOverlay = {
    position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.45)",
    display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50,
    backdropFilter: "blur(2px)",
  };
  const modalBox = {
    backgroundColor: "white", borderRadius: 18, width: "100%", maxWidth: 460,
    padding: "32px 32px 28px", position: "relative",
    boxShadow: "0 20px 60px rgba(0,0,0,0.18)",
  };

    const adminLinks = [
     { to: "/admin-dash", label: "Dashboard", icon: <LayoutDashboard size={18} />, end: true },
    { to: "/admin-dash/accounts", label: "Accounts", icon: <Users size={18} /> },
    { to: "/admin-dash/complaints", label: "Complaints", icon: <MessageSquare size={18} /> },
    { to: "/admin-dash/reports", label: "Reports", icon: <BarChart size={18} /> },
    { to: "/admin-dash/engagement", label: "Engagement", icon: <Activity size={18} /> },
    { to: "/admin-dash/configuration", label: "Configuration", icon: <Settings size={18} /> },
    { to: "/admin-dash/validation", label: "Validation", icon: <CheckSquare size={18} /> },
];
  /* ══════════════════════════════════════════════════════════════════ */
  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#F4F6FB", fontFamily: "'Segoe UI', sans-serif" }}>

      {/* Sidebar */}
          <Sidebar
                     openBar={openBar}
                     setOpenBar={setOpenBar}
                     links={adminLinks}
                     title="AdminCore"
                     subtitle="Enterprise Suite"
                     role="Super Admin"
                     />

      {/* Main */}
      <main style={{ flex: 1, overflowY: "auto", padding: "0 0 40px 0" }}>

        {/* Header */}
        <Header concept="Accounts" setOpenBar={setOpenBar} openBar={openBar} />

        <div style={{ padding: "28px 32px", display: "flex", flexDirection: "column", gap: 24 }}>

          {/* Page title */}
          <div>
            <p style={{ margin: "4px 0 0", fontSize: 14, color: "#8a8a9a" }}>Manage all user accounts, roles, and access.</p>
          </div>

          {/* Filters + Add Button row */}
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 12 }}>

            {/* Filter pills */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {filters.map((f) => (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  style={{
                    padding: "6px 16px", borderRadius: 30, fontSize: 13, fontWeight: 600,
                    border: "none", cursor: "pointer", transition: "all .18s",
                    backgroundColor: activeFilter === f ? "#1a1a2e" : "white",
                    color:           activeFilter === f ? "white"    : "#5a5a7a",
                    boxShadow:       activeFilter === f
                      ? "0 4px 12px rgba(26,26,46,.25)"
                      : "0 1px 4px rgba(0,0,0,.08)",
                  }}
                >
                  {f}
                </button>
              ))}
            </div>

            {/* Add user button */}
            <button
              onClick={() => setOpen(true)}
              style={{
                backgroundColor: "#4f8ef7", color: "white",
                border: "none", borderRadius: 12, padding: "10px 22px",
                fontSize: 14, fontWeight: 600, cursor: "pointer",
                boxShadow: "0 4px 14px rgba(79,142,247,.35)",
                display: "flex", alignItems: "center", gap: 6, transition: "opacity .18s",
              }}
            >
              <span style={{ fontSize: 18, lineHeight: 1 }}>+</span> Add User
            </button>
          </div>

          {/* Search bar */}
          <div style={{
            backgroundColor: "white", borderRadius: 12,
            boxShadow: "0 2px 10px rgba(0,0,0,.07)",
            display: "flex", alignItems: "center", gap: 10,
            padding: "10px 16px", width: "fit-content", minWidth: 300,
          }}>
            <span style={{ color: "#8a8a9a", fontSize: 15 }}>🔍</span>
            <input
              type="text"
              placeholder="Search users by name or email…"
              onChange={(u) => setKeyword(u.target.value)}
              style={{
                border: "none", outline: "none", fontSize: 14,
                color: "#1a1a2e", background: "transparent", width: 280,
                fontFamily: "'Segoe UI', sans-serif",
              }}
            />
          </div>
         {message && (
                <div
               style={{
              padding: "12px 16px",
              borderRadius: 10,
              fontSize: 14,
              fontWeight: 600,
              backgroundColor:
                  message.type === "success" ? "#d4edda" : "#fee2e2",
              color:
                 message.type === "success" ? "#155724" : "#991b1b",
                       }}
                        >
                    {message.text}
                      </div>
                       )}
          {/* Table card */}
          <div style={{
            backgroundColor: "white", borderRadius: 16,
            boxShadow: "0 2px 12px rgba(0,0,0,.07)", overflowX: "auto",
          }}>
            <table style={{ width: "100%", minWidth: 780, borderCollapse: "collapse", fontSize: 14 }}>

              <thead>
                <tr style={{ backgroundColor: "#f8f9fc" }}>
                  {["User", "Role", "Status", "Last Active", "Actions"].map((h, i) => (
                    <th
                      key={h}
                      style={{
                        padding: "14px 20px", textAlign: i === 3 ? "center" : i === 4 ? "right" : "left",
                        fontSize: 11, fontWeight: 700, color: "#8a8a9a",
                        textTransform: "uppercase", letterSpacing: "0.08em",
                        borderBottom: "1.5px solid #f0f0f5",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {displayedUsers?.map((u, i) => (
                  <tr
                    key={i}
                    style={{
                      borderBottom: "1px solid #f4f4f8",
                      transition: "background .15s",
                    }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = "#fafbff"}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}
                  >
                    {/* User */}
                    <td style={{ padding: "14px 20px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <Avatar name={u.username || "??"} />
                        <div>
                          <p style={{ margin: 0, fontWeight: 600, color: "#1a1a2e", fontSize: 14 }}>{u.username}</p>
                          <p style={{ margin: 0, fontSize: 12, color: "#8a8a9a" }}>{u.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td style={{ padding: "14px 20px" }}>
                      <span style={{
                        ...getRoleStyle(u.role),
                        padding: "4px 12px", borderRadius: 20,
                        fontSize: 12, fontWeight: 600, display: "inline-block",
                        textTransform: "capitalize",
                      }}>
                        {u.role}
                      </span>
                    </td>

                    {/* Status */}
                    <td style={{ padding: "14px 20px" }}>
                      <span style={{
                        padding: "4px 12px", borderRadius: 20,
                        fontSize: 12, fontWeight: 600, display: "inline-block",
                        backgroundColor: u.active ? "#D4EDDA" : "#e5e7eb",
                        color:           u.active ? "#155724" : "#6b7280",
                      }}>
                        {u.active ? "Active" : "Inactive"}
                      </span>
                    </td>

                    {/* Last Active */}
                    <td style={{ padding: "14px 20px", color: "#8a8a9a", fontSize: 12, textAlign: "center" }}>
                      {u.last || "—"}
                    </td>

                    {/* Actions */}
                    <td style={{ padding: "14px 20px", textAlign: "right" }}>
                      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                        <button
                          onClick={() => handleEdit(u)}
                          style={{
                            backgroundColor: "#eff6ff", border: "none", borderRadius: 8,
                            width: 34, height: 34, cursor: "pointer", fontSize: 15,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            transition: "background .15s",
                          }}
                          title="Edit"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleRemoveUser(u)}
                          style={{
                            backgroundColor: "#fff1f2", border: "none", borderRadius: 8,
                            width: 34, height: 34, cursor: "pointer", fontSize: 15,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            transition: "background .15s",
                          }}
                          title="Delete"
                        >
                          🗑
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {displayedUsers?.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ padding: "48px 20px", textAlign: "center", color: "#8a8a9a", fontSize: 14 }}>
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

          </div>

        </div>
      </main>

      {/* ── Add User Modal ── */}
      {open && (
        <div style={modalOverlay}>
          <div style={modalBox}>
            <button
              onClick={() => setOpen(false)}
              style={{
                position: "absolute", top: 18, right: 18, background: "#f3f4f6",
                border: "none", borderRadius: 8, width: 32, height: 32,
                cursor: "pointer", fontSize: 16, color: "#6b7280",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >✕</button>

            <h2 style={{ margin: "0 0 6px", fontSize: 18, fontWeight: 700, color: "#1a1a2e" }}>Add New Account</h2>
            <p style={{ margin: "0 0 24px", fontSize: 13, color: "#8a8a9a" }}>Fill in the details to create a new user.</p>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={labelStyle}>Full Name</label>
                <input
                  type="text" placeholder="e.g. Ahmed Benali"
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Email</label>
                <input
                  type="email" placeholder="e.g. ahmed@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Role</label>
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  style={{ ...inputStyle, appearance: "none", backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' fill='%238a8a9a'%3E%3Cpath d='M6 8L0 0h12z'/%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 14px center", paddingRight: 36 }}
                >
                  <option value="admin">Admin</option>
                  <option value="customer">Customer</option>
                  <option value="marketing_manager">Marketing Manager</option>
                  <option value="stock_manager">Stock Manager</option>
                  <option value="deliveryman">Deliveryman</option>
                </select>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 28 }}>
              <button
                onClick={() => setOpen(false)}
                style={{
                  padding: "10px 20px", borderRadius: 10, border: "none",
                  backgroundColor: "#f3f4f6", color: "#374151", fontWeight: 600,
                  fontSize: 14, cursor: "pointer",
                }}
              >Cancel</button>
              <button
                onClick={handleCreate}
                style={{
                  padding: "10px 24px", borderRadius: 10, border: "none",
                  backgroundColor: "#1a1a2e", color: "white", fontWeight: 600,
                  fontSize: 14, cursor: "pointer",
                  boxShadow: "0 4px 14px rgba(26,26,46,.3)",
                }}
              >Create Account</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Edit User Modal ── */}
      {showModel && (
        <div style={modalOverlay}>
          <div style={modalBox}>
            <button
              onClick={() => setShowModel(false)}
              style={{
                position: "absolute", top: 18, right: 18, background: "#f3f4f6",
                border: "none", borderRadius: 8, width: 32, height: 32,
                cursor: "pointer", fontSize: 16, color: "#6b7280",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >✕</button>

            <h2 style={{ margin: "0 0 6px", fontSize: 18, fontWeight: 700, color: "#1a1a2e" }}>Edit Account</h2>
            <p style={{ margin: "0 0 24px", fontSize: 13, color: "#8a8a9a" }}>Update the user's information below.</p>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={labelStyle}>Full Name</label>
                <input
                  type="text"
                  value={editForm.username}
                  onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Email</label>
                <input
                  type="text"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Role</label>
                <select
                  value={editForm.role}
                  onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                  style={{ ...inputStyle, appearance: "none", backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' fill='%238a8a9a'%3E%3Cpath d='M6 8L0 0h12z'/%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 14px center", paddingRight: 36 }}
                >
                  <option value="admin">Admin</option>
                  <option value="customer">Customer</option>
                  <option value="marketing_manager">Marketing Manager</option>
                  <option value="stock_manager">Stock Manager</option>
                  <option value="deliveryman">Deliveryman</option>
                </select>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 28 }}>
              <button
                onClick={() => setShowModel(false)}
                style={{
                  padding: "10px 20px", borderRadius: 10, border: "none",
                  backgroundColor: "#f3f4f6", color: "#374151", fontWeight: 600,
                  fontSize: 14, cursor: "pointer",
                }}
              >Cancel</button>
              <button
                onClick={handleSaveEdit}
                style={{
                  padding: "10px 24px", borderRadius: 10, border: "none",
                  backgroundColor: "#1a1a2e", color: "white", fontWeight: 600,
                  fontSize: 14, cursor: "pointer",
                  boxShadow: "0 4px 14px rgba(26,26,46,.3)",
                }}
              >Save Changes</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
