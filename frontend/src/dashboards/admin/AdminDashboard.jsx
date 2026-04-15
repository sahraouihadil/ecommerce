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

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend);

const S = {
  page:    { display: "flex", minHeight: "100vh", backgroundColor: "#F4F6FB", fontFamily: "'Segoe UI', sans-serif" },
  main:    { flex: 1, padding: "0 0 32px 0", overflowY: "auto" },
  inner:   { padding: "28px 32px", display: "flex", flexDirection: "column", gap: 28 },
  card:    { backgroundColor: "#fff", borderRadius: 14, boxShadow: "0 2px 12px rgba(0,0,0,0.07)" },
  grid4:   { display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 20 },
  grid3:   { display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20 },
};

export function AdminDashboard() {
  const navigate = useNavigate();
  const [openBar, setOpenBar]       = useState(window.innerWidth >= 600);
  const [users, setUsers]           = useState([]);
  const [orderItems, setOrderItems] = useState([]);
  const [orders, setOrders]         = useState([]);
  const [chartData, setChartData]   = useState({ labels: [], datasets: [] });

  // ── Auth ──────────────────────────────────────────────────────────────
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

  // ── Initial fetches ───────────────────────────────────────────────────
  useEffect(() => { api.get("/api/users").then(r => setUsers(r.data)).catch(console.error); }, []);
  useEffect(() => { api.get("/api/order-items").then(r => setOrderItems(r.data)).catch(console.error); }, []);
  useEffect(() => { api.get("/api/orders/all").then(r => setOrders(r.data)).catch(console.error); }, []);

  // ── Polling refresh (replaces WebSocket) ─────────────────────────────
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

  // ── Chart stats ───────────────────────────────────────────────────────
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get("/stats");
        const { orders: o, users: u } = res.data;
        setChartData({
          labels: o.map(x => x.day),
          datasets: [
            { label: "Users",  data: u.map(x => x.users_count),  borderColor: "#1a1a2e", backgroundColor: "rgba(26,26,46,0.08)" },
            { label: "Orders", data: o.map(x => x.orders_count), borderColor: "#4f8ef7", backgroundColor: "rgba(79,142,247,0.08)" },
          ],
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
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { position: "top", labels: { font: { size: 12 }, padding: 20 } } },
    scales: { x: { grid: { display: false } }, y: { grid: { color: "#f0f0f5" } } },
  };

  // ── Quick-stat items ──────────────────────────────────────────────────
  const quickStats = [
    { label: "Total Users",   value: users.length,       color: "#4f8ef7" },
    { label: "Total Orders",  value: orders.length,      color: "#28a745" },
    { label: "Revenue (DA)",  value: totalRev.toFixed(0), color: "#6f42c1" },
  ];

  return (
    <div style={S.page}>
      <Sidebar openBar={openBar} setOpenBar={setOpenBar} />

      <main style={S.main}>
        <Header concept="Dashboard" setOpenBar={setOpenBar} openBar={openBar} />

        <div style={S.inner}>

          {/* Title */}
          <div>
            <p style={{ margin: "4px 0 0", fontSize: 14, color: "#8a8a9a" }}>Welcome back, Admin. Here's what's happening.</p>
          </div>

          {/* Stat Cards */}
          <div style={S.grid4}>
            <StatCard title="Total Revenue"    value={`${totalRev.toFixed(0)} DA`} change="+12.5%" color="#4f8ef7" icon="💰" />
            <StatCard title="Active Users"     value={activeUsers}                  change="+18.2%" color="#28a745" icon="👥" />
            <StatCard title="AR Sessions"      value="5,324"                        change="-2.4%"  color="#ffc107" icon="🥽" />
            <StatCard title="Bot Interactions" value="14,234"                       change="+5.7%"  color="#6f42c1" icon="🤖" />
          </div>

          {/* Chart */}
          <div style={{ ...S.card, padding: "24px 28px" }}>
            <div style={{ marginBottom: 20 }}>
              <h2 style={{ margin: 0, fontSize: 17, fontWeight: 600, color: "#1a1a2e" }}>Platform Growth</h2>
              <p style={{ margin: "4px 0 0", fontSize: 13, color: "#8a8a9a" }}>Users and orders over the past 4 months</p>
            </div>
            <div style={{ height: 300 }}>
              <Line data={chartData} options={chartOptions} />
            </div>
          </div>

          {/* Quick Stats */}
          <div style={S.grid3}>
            {quickStats.map(s => (
              <div key={s.label} style={{ ...S.card, padding: "20px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <p style={{ margin: 0, fontSize: 12, color: "#8a8a9a", textTransform: "uppercase", letterSpacing: "0.08em" }}>{s.label}</p>
                  <p style={{ margin: "6px 0 0", fontSize: 26, fontWeight: 700, color: "#1a1a2e" }}>{s.value}</p>
                </div>
                <div style={{ width: 48, height: 48, borderRadius: "50%", backgroundColor: `${s.color}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <div style={{ width: 20, height: 20, borderRadius: "50%", backgroundColor: s.color }} />
                </div>
              </div>
            ))}
          </div>

        </div>
      </main>
    </div>
  );
}
