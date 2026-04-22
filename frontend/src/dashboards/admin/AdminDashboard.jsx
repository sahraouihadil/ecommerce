/**
 * AdminDashboard.jsx - Main Admin Dashboard (Redesigned)
 * All logic preserved, styling updated — Recent Activities removed.
 */

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Chart as ChartJS, LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend } from "chart.js";
import { Line } from "react-chartjs-2";
import Header from "../ui/Header";
import Sidebar from "../ui/Sidebar";
import api from "../../services/api";
import { StatCard } from "../ui/DashboardComp";
import {
  LayoutDashboard, Users, MessageSquare, CheckSquare,
  BarChart, Activity, Settings,
} from "lucide-react";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend);

export function AdminDashboard() {
  const navigate = useNavigate();
  const [openBar, setOpenBar]       = useState(window.innerWidth >= 768);
  const [users, setUsers]           = useState([]);
  const [orderItems, setOrderItems] = useState([]);
  const [orders, setOrders]         = useState([]);
  const [chartData, setChartData]   = useState({ labels: [], datasets: [] });

  useEffect(() => {
    const verify = async () => {
      if (!localStorage.getItem("token")) { navigate("/login", { replace: true }); return; }
      try { await api.get("/admin-dash"); }
      catch { localStorage.removeItem("token"); navigate("/"); }
    };
    verify();
    const id = setInterval(verify, 10000);
    return () => clearInterval(id);
  }, [navigate]);

  useEffect(() => { api.get("/api/users").then(r => setUsers(r.data)).catch(console.error); }, []);
  useEffect(() => { api.get("/api/order-items").then(r => setOrderItems(r.data)).catch(console.error); }, []);
  useEffect(() => { api.get("/api/orders/all").then(r => setOrders(r.data)).catch(console.error); }, []);

  useEffect(() => {
    const refresh = async () => {
      try {
        const [uRes, oRes, oiRes] = await Promise.all([
          api.get("/api/users"),
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
        const { orders: o, users: u } = res.data;
        const allDays = [...new Set([...o.map(x => x.day), ...u.map(x => x.day)])].sort((a, b) => new Date(a) - new Date(b));
        setChartData({
          labels: allDays.map(day => new Date(day).toLocaleDateString("en-US", { weekday: "short" })),
          datasets: [
            {
              label: "Users",
              data: allDays.map(day => { const item = u.find(x => x.day === day); return item ? item.users_count : 0; }),
              borderColor: "#6366f1",
              backgroundColor: "rgba(99,102,241,0.08)",
              borderWidth: 2.5,
              tension: 0.4,
              pointBackgroundColor: "#6366f1",
              pointRadius: 4,
              pointHoverRadius: 6,
            },
            {
              label: "Orders",
              data: allDays.map(day => { const item = o.find(x => x.day === day); return item ? item.orders_count : 0; }),
              borderColor: "#10b981",
              backgroundColor: "rgba(16,185,129,0.08)",
              borderWidth: 2.5,
              tension: 0.4,
              pointBackgroundColor: "#10b981",
              pointRadius: 4,
              pointHoverRadius: 6,
            }
          ]
        });
      } catch (err) { console.error(err); }
    };
    fetchStats();
    const id = setInterval(fetchStats, 5000);
    return () => clearInterval(id);
  }, []);

  const activeUsers = users.filter(u => u.active === true).length;
  const totalRev    = orderItems.reduce((s, o) => s + o.price * o.quantity, 0);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          font: { size: 12, family: "inherit" },
          padding: 20,
          usePointStyle: true,
          pointStyleWidth: 8,
        }
      },
      tooltip: {
        backgroundColor: "#1e1e2e",
        titleColor: "#e2e8f0",
        bodyColor: "#94a3b8",
        borderColor: "#334155",
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: "#94a3b8", font: { size: 11 } },
        border: { display: false },
      },
      y: {
        grid: { color: "#f1f5f9", lineWidth: 1 },
        ticks: { color: "#94a3b8", font: { size: 11 } },
        border: { display: false },
      }
    },
  };

  const quickStats = [
    { label: "Total Users",   value: users.length,        color: "#6366f1", bg: "#eef2ff" },
    { label: "Total Orders",  value: orders.length,       color: "#10b981", bg: "#ecfdf5" },
    { label: "Revenue (DA)",  value: totalRev.toFixed(0), color: "#f59e0b", bg: "#fffbeb" },
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
        .dash-page { display: flex; min-height: 100vh; background: #f8fafc; font-family: 'Inter', 'Segoe UI', sans-serif; }
        .dash-main { flex: 1; overflow-y: auto; min-width: 0; }
        .dash-inner { padding: 24px 28px 40px; display: flex; flex-direction: column; gap: 24px; }
        .dash-stat-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
        .dash-quick-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
        .dash-card { background: #fff; border-radius: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04); border: 1px solid #f1f5f9; }
        .dash-quick-card { background: #fff; border-radius: 16px; border: 1px solid #f1f5f9; box-shadow: 0 1px 3px rgba(0,0,0,0.06); padding: 20px 24px; display: flex; justify-content: space-between; align-items: center; transition: box-shadow .2s, transform .2s; }
        .dash-quick-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.08); transform: translateY(-1px); }
        @media (max-width: 1100px) { .dash-stat-grid { grid-template-columns: repeat(2, 1fr); } .dash-quick-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 640px) { .dash-inner { padding: 16px 16px 32px; gap: 16px; } .dash-stat-grid { grid-template-columns: 1fr 1fr; gap: 12px; } .dash-quick-grid { grid-template-columns: 1fr; } }
      `}</style>
      <div className="dash-page">
        <Sidebar
          openBar={openBar}
          setOpenBar={setOpenBar}
          links={adminLinks}
          title="AdminCore"
          subtitle="Enterprise Suite"
          role="Super Admin"
        />
        <main className="dash-main">
          <Header concept="Dashboard" setOpenBar={setOpenBar} openBar={openBar} />
          <div className="dash-inner">
            <div>
              <p style={{ margin: 0, fontSize: 14, color: "#64748b" }}>Welcome back, Admin. Here's what's happening.</p>
            </div>

            {/* Stat Cards */}
            <div className="dash-stat-grid">
              <StatCard title="Total Revenue"    value={`${totalRev.toFixed(0)} DA`} change="+12.5%" color="#6366f1" icon="💰" />
              <StatCard title="Active Users"     value={activeUsers}                  change="+18.2%" color="#10b981" icon="👥" />
              <StatCard title="AR Sessions"      value="5,324"                        change="-2.4%"  color="#f59e0b" icon="🥽" />
              <StatCard title="Bot Interactions" value="14,234"                       change="+5.7%"  color="#8b5cf6" icon="🤖" />
            </div>

            {/* Chart */}
            <div className="dash-card" style={{ padding: "24px 28px" }}>
              <div style={{ marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8 }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#0f172a", letterSpacing: "-0.01em" }}>Platform Growth</h2>
                  <p style={{ margin: "4px 0 0", fontSize: 13, color: "#94a3b8" }}>Users and orders over the past 4 months</p>
                </div>
              </div>
              <div style={{ height: 300 }}>
                <Line data={chartData} options={chartOptions} />
              </div>
            </div>

            {/* Quick Stats */}
            <div className="dash-quick-grid">
              {quickStats.map(s => (
                <div key={s.label} className="dash-quick-card">
                  <div>
                    <p style={{ margin: 0, fontSize: 11, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600 }}>{s.label}</p>
                    <p style={{ margin: "6px 0 0", fontSize: 28, fontWeight: 800, color: "#0f172a", letterSpacing: "-0.02em" }}>{s.value}</p>
                  </div>
                  <div style={{ width: 48, height: 48, borderRadius: 14, backgroundColor: s.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <div style={{ width: 20, height: 20, borderRadius: "50%", backgroundColor: s.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </>
  );
}