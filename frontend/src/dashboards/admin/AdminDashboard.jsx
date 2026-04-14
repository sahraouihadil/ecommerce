/**
 * AdminDashboard.jsx - Main Admin Dashboard
 * =============================================
 * The landing page for admin users after login. Shows key business metrics:
 *   - Stat cards: Total Revenue, Active Users, AR Sessions, Bot Interactions
 *   - Line chart: Platform Growth (Users & Orders over time)
 *
 * AUTHENTICATION:
 *   On mount, verifies the admin token by calling GET /admin-dash.
 *   If invalid, redirects to homepage.
 *
 * DATA SOURCES:
 *   - GET /api/users       -> counts active users
 *   - GET /api/order-items  -> calculates total revenue (price * quantity)
 */
/**
 * AdminDashboard.jsx - Main Admin Dashboard (Redesigned)
 * All logic preserved, styling updated to match other dashboards.
 */

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Chart as ChartJS, LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend } from "chart.js";
import { Line } from "react-chartjs-2";
import Header from "../ui/Header";
import Sidebar from "../ui/Sidebar";
import api from "../../services/api";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend);

// ── Stat Card ──────────────────────────────────────────────────────────
function StatCard({ title, value, change, color, icon }) {
  const isPositive = change && change.startsWith("+");
  return (
    <div style={{
      backgroundColor: "white",
      borderRadius: 14,
      padding: "22px 24px",
      boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
      borderLeft: `4px solid ${color}`,
      display: "flex",
      flexDirection: "column",
      gap: 8,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: "#8a8a9a", textTransform: "uppercase", letterSpacing: "0.08em" }}>{title}</p>
        <span style={{ fontSize: 20 }}>{icon}</span>
      </div>
      <p style={{ margin: 0, fontSize: 30, fontWeight: 700, color: "#1a1a2e" }}>{value}</p>
      {change && (
        <span style={{
          display: "inline-block",
          fontSize: 12,
          fontWeight: 600,
          padding: "3px 10px",
          borderRadius: 20,
          backgroundColor: isPositive ? "#D4EDDA" : "#F8D7DA",
          color: isPositive ? "#155724" : "#721c24",
          alignSelf: "flex-start",
        }}>{change}</span>
      )}
    </div>
  );
}

// ── Main Dashboard ─────────────────────────────────────────────────────
export function AdminDashboard() {
  const navigate = useNavigate();
  const [openBar, setOpenBar] = useState(window.innerWidth >= 600);
  const [users, setUsers] = useState([]);
  const [orderItems, setOrderItems] = useState([]);

  // Verify admin token
  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem("token");
      if (!token) { navigate("/login", { replace: true }); return; }
      try {
        await api.get("/admin-dash");
      } catch {
        localStorage.removeItem("token");
        navigate("/");
      }
    };
    verifyToken();
  }, [navigate]);

  // Fetch users
  useEffect(() => {
    api.get("/api/users")
      .then(res => setUsers(res.data))
      .catch(err => console.log("Error:", err));
  }, []);

  // Fetch order items
  useEffect(() => {
    api.get("/api/order-items")
      .then(res => setOrderItems(res.data))
      .catch(err => console.log("Error:", err));
  }, []);

  const activeUsers = users.filter(u => u.active === true).length;
  const totalRev = orderItems.reduce((sum, o) => sum + o.price * o.quantity, 0);

  const chartData = {
    labels: ["Jan", "Feb", "Mar", "Apr"],
    datasets: [
      {
        label: "Users",
        data: [400, 800, 1200, 900],
        borderColor: "#1a1a2e",
        backgroundColor: "rgba(26,26,46,0.08)",
        tension: 0.4,
        pointBackgroundColor: "#1a1a2e",
        pointRadius: 4,
      },
      {
        label: "Orders",
        data: [200, 600, 900, 700],
        borderColor: "#4f8ef7",
        backgroundColor: "rgba(79,142,247,0.08)",
        tension: 0.4,
        pointBackgroundColor: "#4f8ef7",
        pointRadius: 4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: { font: { size: 12 }, padding: 20 },
      },
    },
    scales: {
      x: { grid: { display: false } },
      y: { grid: { color: "#f0f0f5" } },
    },
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#F4F6FB", fontFamily: "'Segoe UI', sans-serif" }}>
      {/* Sidebar (unchanged) */}
      <Sidebar openBar={openBar} setOpenBar={setOpenBar} />

      {/* Main content */}
      <main style={{ flex: 1, padding: "0 0 32px 0", overflowY: "auto" }}>
        {/* Header (unchanged) */}
        <Header concept="Dashboard" setOpenBar={setOpenBar} openBar={openBar} />

        <div style={{ padding: "28px 32px", display: "flex", flexDirection: "column", gap: 28 }}>

          {/* Page title */}
          <div>
            <h1 style={{ margin: 0, fontSize: 26, fontWeight: 700, color: "#1a1a2e" }}>Dashboard</h1>
            <p style={{ margin: "4px 0 0", fontSize: 14, color: "#8a8a9a" }}>Welcome back, Admin. Here's what's happening.</p>
          </div>

          {/* Stat Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20 }}>
            <StatCard title="Total Revenue" value={`${totalRev.toFixed(0)} DA`} change="+12.5%" color="#4f8ef7" icon="💰" />
            <StatCard title="Active Users" value={activeUsers} change="+18.2%" color="#28a745" icon="👥" />
            <StatCard title="AR Sessions" value="5,324" change="-2.4%" color="#ffc107" icon="🥽" />
            <StatCard title="Bot Interactions" value="14,234" change="+5.7%" color="#6f42c1" icon="🤖" />
          </div>

          {/* Chart */}
          <div style={{
            backgroundColor: "white",
            borderRadius: 14,
            padding: "24px 28px",
            boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
          }}>
            <div style={{ marginBottom: 20 }}>
              <h2 style={{ margin: 0, fontSize: 17, fontWeight: 600, color: "#1a1a2e" }}>Platform Growth</h2>
              <p style={{ margin: "4px 0 0", fontSize: 13, color: "#8a8a9a" }}>Users and orders over the past 4 months</p>
            </div>
            <div style={{ height: 300 }}>
              <Line data={chartData} options={chartOptions} />
            </div>
          </div>

          {/* Quick Stats Row */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
            {[
              { label: "Total Users", value: users.length, color: "#4f8ef7" },
              { label: "Total Orders", value: orderItems.length, color: "#28a745" },
              { label: "Revenue (DA)", value: totalRev.toFixed(0), color: "#6f42c1" },
            ].map(s => (
              <div key={s.label} style={{
                backgroundColor: "white",
                borderRadius: 14,
                padding: "20px 24px",
                boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}>
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