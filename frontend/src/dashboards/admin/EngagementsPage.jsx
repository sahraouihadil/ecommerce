/**
 * EngagementsPage.jsx - User Engagement Analytics (Admin)
 * All logic preserved, design improved + responsive.
 */

import Header from "../ui/Header";
import Sidebar from "../ui/Sidebar";
import { useState } from "react";
import { Chart as ChartJS, LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend, Filler } from "chart.js";
import { Line } from "react-chartjs-2";
import {
  LayoutDashboard, Users, MessageSquare, CheckSquare,
  BarChart, Activity, Settings,
} from "lucide-react";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend, Filler);

const trafficData = {
  labels: ["Sat", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri"],
  datasets: [{
    label: "Visitors",
    data: [160, 180, 40, 120, 100, 130, 110],
    borderColor: "#10b981",
    backgroundColor: "rgba(16,185,129,0.08)",
    tension: 0.4,
    fill: true,
    borderWidth: 2.5,
    pointBackgroundColor: "#10b981",
    pointRadius: 4,
    pointHoverRadius: 6,
  }],
};

const chartOpts = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: "#1e1e2e",
      titleColor: "#e2e8f0",
      bodyColor: "#94a3b8",
      borderColor: "#334155",
      borderWidth: 1,
      padding: 10,
      cornerRadius: 8,
    }
  },
  scales: {
    x: { grid: { display: false }, ticks: { color: "#94a3b8", font: { size: 11 } }, border: { display: false } },
    y: { grid: { color: "#f1f5f9" }, ticks: { color: "#94a3b8", font: { size: 11 } }, border: { display: false } },
  }
};

const topPages = [
  { name: "Home Page",    value: 80, color: "#6366f1" },
  { name: "Product Page", value: 65, color: "#10b981" },
  { name: "AR View",      value: 50, color: "#f59e0b" },
  { name: "Checkout",     value: 30, color: "#8b5cf6" },
];

const overviewCards = [
  { label: "Total Visitors",     value: "123,334", delta: "+12.5% vs last month", color: "#6366f1", bg: "#eef2ff", icon: "👥" },
  { label: "Avg. Session Time",  value: "4m 32s",  delta: "+0.8% vs last month",  color: "#10b981", bg: "#ecfdf5", icon: "⏱️" },
  { label: "AR Conversion Rate", value: "8.4%",    delta: "+2.1% vs last month",  color: "#8b5cf6", bg: "#faf5ff", icon: "🥽" },
];

export default function EngagementPage() {
  const [openBar, setOpenBar] = useState(window.innerWidth >= 768);

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
        .eng-page { display: flex; min-height: 100vh; background: #f8fafc; font-family: 'Inter', 'Segoe UI', sans-serif; }
        .eng-main { flex: 1; overflow-y: auto; min-width: 0; }
        .eng-inner { padding: 24px 28px 40px; display: flex; flex-direction: column; gap: 20px; }
        .eng-card { background: #fff; border-radius: 16px; border: 1px solid #f1f5f9; box-shadow: 0 1px 3px rgba(0,0,0,0.06); padding: 24px; }
        .eng-card h2 { margin: 0 0 4px; font-size: 16px; font-weight: 800; color: #0f172a; letter-spacing: -0.01em; }
        .eng-overview-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
        .eng-charts-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .eng-metric-card { background: #fff; border-radius: 16px; border: 1px solid #f1f5f9; box-shadow: 0 1px 3px rgba(0,0,0,0.06); padding: 20px 24px; display: flex; justify-content: space-between; align-items: center; gap: 12; transition: box-shadow .2s, transform .2s; }
        .eng-metric-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.08); transform: translateY(-1px); }
        .eng-bar-bg { width: 100%; height: 8px; background: #f1f5f9; border-radius: 99px; overflow: hidden; }
        @media (max-width: 1100px) { .eng-overview-grid { grid-template-columns: 1fr 1fr; } }
        @media (max-width: 900px) { .eng-charts-grid { grid-template-columns: 1fr; } .eng-inner { padding: 16px 12px 32px; gap: 16px; } }
        @media (max-width: 640px) { .eng-overview-grid { grid-template-columns: 1fr; } }
      `}</style>
      <div className="eng-page">
        <Sidebar openBar={openBar} setOpenBar={setOpenBar} links={adminLinks} title="AdminCore" subtitle="Enterprise Suite" role="Super Admin" profilePath="/admin-dash/profile"/>
        <main className="eng-main">
          <Header concept="Engagement" setOpenBar={setOpenBar} openBar={openBar} />
          <div className="eng-inner">
            <p style={{ margin: 0, fontSize: 14, color: "#64748b" }}>User engagement metrics and analytics.</p>

            {/* Overview cards */}
            <div className="eng-overview-grid">
              {overviewCards.map(c => (
                <div key={c.label} className="eng-metric-card">
                  <div>
                    <p style={{ margin: "0 0 6px", fontSize: 11, color: "#94a3b8", textTransform: "uppercase", letterSpacing: ".07em", fontWeight: 700 }}>{c.label}</p>
                    <p style={{ margin: "0 0 4px", fontSize: 26, fontWeight: 800, color: "#0f172a", letterSpacing: "-0.02em" }}>{c.value}</p>
                    <p style={{ margin: 0, fontSize: 12, color: "#10b981", fontWeight: 600 }}>{c.delta}</p>
                  </div>
                  <div style={{ width: 48, height: 48, borderRadius: 14, background: c.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>
                    {c.icon}
                  </div>
                </div>
              ))}
            </div>

            {/* Charts row */}
            <div className="eng-charts-grid">
              <div className="eng-card">
                <div style={{ marginBottom: 20 }}>
                  <h2>Website Traffic</h2>
                  <p style={{ margin: "4px 0 0", fontSize: 13, color: "#94a3b8" }}>Daily visitor sessions this week</p>
                </div>
                <div style={{ height: 220 }}>
                  <Line data={trafficData} options={chartOpts} />
                </div>
              </div>

              <div className="eng-card">
                <div style={{ marginBottom: 20 }}>
                  <h2>Top Pages</h2>
                  <p style={{ margin: "4px 0 0", fontSize: 13, color: "#94a3b8" }}>Most visited pages this week</p>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                  {topPages.map(p => (
                    <div key={p.name}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                        <span style={{ fontSize: 13, color: "#334155", fontWeight: 600 }}>{p.name}</span>
                        <span style={{ fontSize: 13, color: "#94a3b8", fontWeight: 600 }}>{p.value}%</span>
                      </div>
                      <div className="eng-bar-bg">
                        <div style={{ width: `${p.value}%`, height: 8, background: p.color, borderRadius: 99, transition: "width .6s ease" }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}