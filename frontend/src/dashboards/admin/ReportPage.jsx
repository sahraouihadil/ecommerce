/**
 * ReportPage.jsx - Sales & Analytics Reports (Admin)
 * All logic preserved, design improved + responsive.
 */

import Header from "../ui/Header";
import Sidebar from "../ui/Sidebar";
import { useState, useEffect } from "react";
import { Chart as ChartJS, BarElement, LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend, Filler } from "chart.js";
import { Bar, Line } from "react-chartjs-2";
import api from "../../services/api";
import {
  LayoutDashboard, Users, MessageSquare, CheckSquare,
  BarChart, Activity, Settings,
} from "lucide-react";

ChartJS.register(BarElement, LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend, Filler);

const arData = {
  labels: ["Sat", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri"],
  datasets: [{
    label: "AR Activity",
    data: [150, 170, 40, 120, 100, 130, 110],
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

export default function ReportPage() {
  const [openBar, setOpenBar]   = useState(window.innerWidth >= 768);
  const [orderItems, setOrderItems] = useState([]);
  const [orders, setOrders]     = useState([]);
  const [users, setUsers]       = useState([]);
  const [revenueData, setRevenueData] = useState({ labels: [], datasets: [] });

  useEffect(() => { api.get("/api/orders/all").then(r => setOrders(r.data)).catch(console.error); }, []);
  useEffect(() => { api.get("/api/order-items").then(r => setOrderItems(r.data)).catch(console.error); }, []);
  useEffect(() => { api.get("/api/users").then(r => setUsers(r.data)).catch(console.error); }, []);

  useEffect(() => {
    const refresh = async () => {
      try {
        const [uRes, oRes, oiRes] = await Promise.all([
          api.get("api/users"),
          api.get("/api/orders/all"),
          api.get("/api/order-items"),
        ]);
        setUsers(uRes.data);
        setOrders(oRes.data);
        setOrderItems(oiRes.data);
      } catch (err) { console.error("Refresh error:", err); }
    };
    const id = setInterval(refresh, 3000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get("/stats");
        const { orders: o } = res.data;
        const allDays = [...new Set(o.map(x => x.day))].sort((a, b) => new Date(a) - new Date(b));
        const revenuePerDay = allDays.map(day => {
          const item = o.find(x => x.day === day);
          return item ? item.orders_totalamount : 0;
        });
        setRevenueData({
          labels: allDays.map(day => new Date(day).toLocaleDateString("en-US", { weekday: "short" })),
          datasets: [{
            label: "Revenue",
            data: revenuePerDay,
            backgroundColor: "rgba(99,102,241,0.85)",
            borderRadius: 6,
            borderSkipped: false,
          }]
        });
      } catch (err) { console.error(err); }
    };
    fetchStats();
    const id = setInterval(fetchStats, 5000);
    return () => clearInterval(id);
  }, []);

const totalRev = orderItems.reduce(
  (s, o) => s + (o.price || 0) * (o.quantity || 0),
  0
);

// 🛡️ avoid division by 0
const ordersCount = orders.length;
const usersCount  = users?.length || 0;

const avgOrderValue = `${(
  ordersCount ? totalRev / ordersCount : 0
).toFixed(0)} DA`;

const convRate = `${(
  usersCount ? (ordersCount / usersCount) * 100 : 0
).toFixed(2)}%`;

const returnedOrders = orders.filter(o => o.status === "canceled");

const returnRate = `${(
  ordersCount ? (returnedOrders.length / ordersCount) * 100 : 0
).toFixed(2)}%`;

const revenue = orders.reduce(
  (sum, o) => sum + (o.totalamount || 0),
  0
);

const cost = revenue / 2;

const grossMargin = `${(
  revenue ? ((revenue - cost) / revenue) * 100 : 0
).toFixed(2)}%`;

  const statCards = [
    { label: "Avg Order Value",  value: avgOrderValue, color: "#6366f1", bg: "#eef2ff", icon: "🛒" },
    { label: "Conversion Rate",  value: convRate,       color: "#10b981", bg: "#ecfdf5", icon: "📈" },
    { label: "Return Rate",      value: returnRate,     color: "#f59e0b", bg: "#fffbeb", icon: "↩️" },
    { label: "Gross Margin",     value: grossMargin,    color: "#8b5cf6", bg: "#faf5ff", icon: "💹" },
  ];

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
        .rpt-page { display: flex; min-height: 100vh; background: #f8fafc; font-family: 'Inter', 'Segoe UI', sans-serif; }
        .rpt-main { flex: 1; overflow-y: auto; min-width: 0; }
        .rpt-inner { padding: 24px 28px 40px; display: flex; flex-direction: column; gap: 20px; }
        .rpt-card { background: #fff; border-radius: 16px; border: 1px solid #f1f5f9; box-shadow: 0 1px 3px rgba(0,0,0,0.06); padding: 24px; }
        .rpt-card h2 { margin: 0 0 4px; font-size: 16px; font-weight: 800; color: #0f172a; letter-spacing: -0.01em; }
        .rpt-charts-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .rpt-stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; }
        .rpt-stat-item { background: #f8fafc; border-radius: 12px; padding: 18px 20px; display: flex; justify-content: space-between; align-items: center; border: 1px solid #f1f5f9; }
        .rpt-export-btn { font-size: 13px; color: "#64748b"; background: none; border: "1.5px solid #e2e8f0"; border-radius: 8px; padding: 6px 14px; cursor: pointer; font-family: inherit; font-weight: 600; transition: all .15s; }
        @media (max-width: 1100px) { .rpt-stats-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 900px) { .rpt-charts-grid { grid-template-columns: 1fr; } .rpt-inner { padding: 16px 12px 32px; } }
        @media (max-width: 480px) { .rpt-stats-grid { grid-template-columns: 1fr; } }
      `}</style>
      <div className="rpt-page">
        <Sidebar openBar={openBar} setOpenBar={setOpenBar} links={adminLinks} title="AdminCore" subtitle="Enterprise Suite" role="Super Admin" profilePath="/admin-dash/profile" />
        <main className="rpt-main">
          <Header concept="Reports" setOpenBar={setOpenBar} openBar={openBar} />
          <div className="rpt-inner">
            <p style={{ margin: 0, fontSize: 14, color: "#64748b" }}>Sales analytics and platform performance.</p>

            {/* Charts Row */}
            <div className="rpt-charts-grid">
              <div className="rpt-card">
                <div style={{ marginBottom: 20 }}>
                  <h2>Revenue Overview</h2>
                  <p style={{ margin: "4px 0 0", fontSize: 13, color: "#94a3b8" }}>Daily revenue this week (DA)</p>
                </div>
                <div style={{ height: 240 }}>
                  {revenueData.labels.length > 0 ? <Bar data={revenueData} options={chartOpts} /> : <p style={{ color: "#94a3b8", fontSize: 13 }}>Loading...</p>}
                </div>
              </div>

              <div className="rpt-card">
                <div style={{ marginBottom: 20 }}>
                  <h2>AR Model Activity</h2>
                  <p style={{ margin: "4px 0 0", fontSize: 13, color: "#94a3b8" }}>AR feature usage this week</p>
                </div>
                <div style={{ height: 240 }}>
                  <Line data={arData} options={chartOpts} />
                </div>
              </div>
            </div>

            {/* Stat Cards */}
            <div className="rpt-card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 8 }}>
                <div>
                  <h2>Detailed Sales Statistics</h2>
                  <p style={{ margin: "4px 0 0", fontSize: 13, color: "#94a3b8" }}>Key performance indicators</p>
                </div>
                <button style={{ fontSize: 13, color: "#64748b", background: "none", border: "1.5px solid #e2e8f0", borderRadius: 8, padding: "6px 14px", cursor: "pointer", fontFamily: "inherit", fontWeight: 600 }}>Export CSV</button>
              </div>
              <div className="rpt-stats-grid">
                {statCards.map(s => (
                  <div key={s.label} className="rpt-stat-item">
                    <div>
                      <p style={{ margin: "0 0 4px", fontSize: 11, color: "#94a3b8", textTransform: "uppercase", letterSpacing: ".07em", fontWeight: 700 }}>{s.label}</p>
                      <p style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "#0f172a", letterSpacing: "-0.02em" }}>{s.value}</p>
                    </div>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: s.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>
                      {s.icon}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}