/**
 * ConfigurationPage.jsx - System Configuration (Admin)
 * All logic preserved, design improved + responsive.
 */

import Header from "../ui/Header";
import Sidebar from "../ui/Sidebar";
import { useState } from "react";
import {
  LayoutDashboard, Users, MessageSquare, CheckSquare,
  BarChart, Activity, Settings,
} from "lucide-react";

function Toggle({ on, onToggle }) {
  return (
    <button
      onClick={onToggle}
      aria-checked={on}
      role="switch"
      style={{
        width: 46, height: 26, borderRadius: 99, cursor: "pointer", border: "none",
        background: on ? "#6366f1" : "#e2e8f0",
        position: "relative", transition: "background .2s", flexShrink: 0, padding: 0,
        boxShadow: on ? "0 0 0 3px rgba(99,102,241,.2)" : "none",
      }}
    >
      <span style={{
        position: "absolute", top: 3,
        left: on ? 22 : 3,
        width: 20, height: 20, borderRadius: "50%",
        background: "#fff", transition: "left .2s",
        boxShadow: "0 1px 4px rgba(0,0,0,0.18)",
        display: "block",
      }} />
    </button>
  );
}

const initialProducts = [
  { name: "Product 1", type: "Table",  active: true  },
  { name: "Product 2", type: "Table",  active: true  },
  { name: "Product 3", type: "Chair",  active: true  },
  { name: "Product 4", type: "Shelf",  active: true  },
  { name: "Product 5", type: "Desk",   active: true  },
];

export default function ConfigurationPage() {
  const [openBar, setOpenBar]   = useState(window.innerWidth >= 768);
  const [arOn, setArOn]         = useState(true);
  const [botOn, setBotOn]       = useState(true);
  const [products, setProducts] = useState(initialProducts);

  const toggleProduct = i =>
    setProducts(prev => prev.map((p, idx) => idx === i ? { ...p, active: !p.active } : p));

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
        .cfg-page { display: flex; min-height: 100vh; background: #f8fafc; font-family: 'Inter', 'Segoe UI', sans-serif; }
        .cfg-main { flex: 1; overflow-y: auto; min-width: 0; }
        .cfg-inner { padding: 24px 28px 40px; }
        .cfg-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 20px; }
        .cfg-card { background: #fff; border-radius: 16px; border: 1px solid #f1f5f9; box-shadow: 0 1px 3px rgba(0,0,0,0.06); padding: 24px; }
        .cfg-card h2 { margin: 0 0 20px; font-size: 16px; font-weight: 800; color: #0f172a; letter-spacing: -0.01em; }
        .cfg-toggle-row { background: #f8fafc; border-radius: 12px; padding: 16px; display: flex; justify-content: space-between; align-items: center; gap: 16px; border: 1px solid #f1f5f9; }
        .cfg-toggle-row + .cfg-toggle-row { margin-top: 12px; }
        .cfg-product-row { display: flex; justify-content: space-between; align-items: center; padding: 14px 0; border-bottom: 1px solid #f8fafc; }
        .cfg-product-row:last-of-type { border-bottom: none; }
        .cfg-ar-badge { font-size: 11px; padding: 3px 10px; border-radius: 99px; font-weight: 700; }
        .cfg-manage-btn { margin-top: 16px; width: 100%; background: none; border: 2px dashed #e2e8f0; border-radius: 12px; padding: 10px; font-size: 13px; color: #94a3b8; cursor: pointer; font-family: inherit; font-weight: 600; transition: all .15s; }
        .cfg-manage-btn:hover { border-color: #6366f1; color: #6366f1; background: #f5f3ff; }
        @media (max-width: 900px) { .cfg-grid { grid-template-columns: 1fr; } .cfg-inner { padding: 16px 12px 32px; } }
      `}</style>
      <div className="cfg-page">
        <Sidebar openBar={openBar} setOpenBar={setOpenBar} links={adminLinks} title="AdminCore" subtitle="Enterprise Suite" role="Super Admin" profilePath="/admin-dash/profile" />
        <main className="cfg-main">
          <Header concept="Configuration" setOpenBar={setOpenBar} openBar={openBar} />
          <div className="cfg-inner">
            <p style={{ margin: 0, fontSize: 14, color: "#64748b" }}>Manage global features and product AR settings.</p>
            <div className="cfg-grid">

              {/* LEFT — Global Feature Control */}
              <div className="cfg-card">
                <h2>Global Feature Control</h2>
                <div className="cfg-toggle-row">
                  <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                    <div style={{ width: 38, height: 38, borderRadius: 10, background: "#eef2ff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>🥽</div>
                    <div>
                      <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: "#0f172a" }}>Global AR Support</p>
                      <p style={{ margin: "2px 0 0", fontSize: 12, color: "#94a3b8" }}>Master switch for all AR features</p>
                    </div>
                  </div>
                  <Toggle on={arOn} onToggle={() => setArOn(v => !v)} />
                </div>
                <div className="cfg-toggle-row">
                  <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                    <div style={{ width: 38, height: 38, borderRadius: 10, background: "#f0fdf4", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>🤖</div>
                    <div>
                      <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: "#0f172a" }}>AI Support Chatbot</p>
                      <p style={{ margin: "2px 0 0", fontSize: 12, color: "#94a3b8" }}>Automated customer assistance</p>
                    </div>
                  </div>
                  <Toggle on={botOn} onToggle={() => setBotOn(v => !v)} />
                </div>
              </div>

              {/* RIGHT — Product AR Management */}
              <div className="cfg-card">
                <h2>Product AR Management</h2>
                {products.map((p, i) => (
                  <div key={i} className="cfg-product-row">
                    <div>
                      <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: "#0f172a" }}>{p.name}</p>
                      <p style={{ margin: "2px 0 0", fontSize: 12, color: "#94a3b8" }}>{p.type}</p>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <span className="cfg-ar-badge" style={{
                        background: p.active ? "#eef2ff" : "#f8fafc",
                        color:      p.active ? "#6366f1" : "#94a3b8",
                      }}>
                        {p.active ? "AR ACTIVE" : "AR HIDDEN"}
                      </span>
                      <Toggle on={p.active} onToggle={() => toggleProduct(i)} />
                    </div>
                  </div>
                ))}
                <button className="cfg-manage-btn">+ Manage All</button>
              </div>

            </div>
          </div>
        </main>
      </div>
    </>
  );
}