/**
 * ReportPage.jsx - Sales & Analytics Reports (Admin) — Redesigned
 * Logic unchanged, styling updated to match AdminDashboard.
 */

import Header from "../ui/Header";
import Sidebar from "../ui/Sidebar";
import { useState } from "react";
import { Chart as ChartJS, BarElement, LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend } from "chart.js";
import { Bar, Line } from "react-chartjs-2";

ChartJS.register(BarElement, LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend);

const S = {
  page:  { display: "flex", minHeight: "100vh", backgroundColor: "#F4F6FB", fontFamily: "'Segoe UI', sans-serif" },
  main:  { flex: 1, padding: "0 0 32px 0", overflowY: "auto" },
  inner: { padding: "28px 32px", display: "flex", flexDirection: "column", gap: 28 },
  card:  { backgroundColor: "#fff", borderRadius: 14, boxShadow: "0 2px 12px rgba(0,0,0,0.07)", padding: "24px 28px" },
  grid2: { display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 20 },
  grid4: { display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16 },
  label: { margin: 0, fontSize: 11, color: "#8a8a9a", textTransform: "uppercase", letterSpacing: "0.08em" },
  value: { margin: "6px 0 0", fontSize: 22, fontWeight: 700, color: "#1a1a2e" },
};

const revenueData = {
  labels: ["Sat", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri"],
  datasets: [{ label: "Revenue", data: [4000, 3000, 2000, 2800, 1900, 2400, 3500], backgroundColor: "#4f8ef7", borderRadius: 8 }],
};

const arData = {
  labels: ["Sat", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri"],
  datasets: [{ label: "AR Activity", data: [150, 170, 40, 120, 100, 130, 110], borderColor: "#28a745", backgroundColor: "rgba(40,167,69,0.08)", tension: 0.4, fill: true }],
};

const chartOpts = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } };

const statCards = [
  { label: "Avg Order Value",  value: "10 000 DA", color: "#4f8ef7" },
  { label: "Conversion Rate",  value: "3.2%",      color: "#28a745" },
  { label: "Return Rate",      value: "1.4%",      color: "#ffc107" },
  { label: "Gross Margin",     value: "—",         color: "#6f42c1" },
];

export default function ReportPage() {
  const [openBar, setOpenBar] = useState(window.innerWidth >= 600);

  return (
    <div style={S.page}>
      <Sidebar openBar={openBar} setOpenBar={setOpenBar} />

      <main style={S.main}>
        <Header concept="Reports" setOpenBar={setOpenBar} openBar={openBar} />

        <div style={S.inner}>

          {/* Title */}
          <div>
            <p style={{ margin: "4px 0 0", fontSize: 14, color: "#8a8a9a" }}>Sales analytics and platform performance.</p>
          </div>

          {/* Charts Row */}
          <div style={S.grid2}>

            {/* Revenue */}
            <div style={S.card}>
              <div style={{ marginBottom: 20 }}>
                <h2 style={{ margin: 0, fontSize: 17, fontWeight: 600, color: "#1a1a2e" }}>Revenue Overview</h2>
                <p style={{ margin: "4px 0 0", fontSize: 13, color: "#8a8a9a" }}>Daily revenue this week</p>
              </div>
              <div style={{ height: 240 }}>
                <Bar data={revenueData} options={chartOpts} />
              </div>
            </div>

            {/* AR Activity */}
            <div style={S.card}>
              <div style={{ marginBottom: 20 }}>
                <h2 style={{ margin: 0, fontSize: 17, fontWeight: 600, color: "#1a1a2e" }}>AR Model Activity</h2>
                <p style={{ margin: "4px 0 0", fontSize: 13, color: "#8a8a9a" }}>AR feature usage this week</p>
              </div>
              <div style={{ height: 240 }}>
                <Line data={arData} options={chartOpts} />
              </div>
            </div>

          </div>

          {/* Stat Cards */}
          <div style={S.card}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 style={{ margin: 0, fontSize: 17, fontWeight: 600, color: "#1a1a2e" }}>Detailed Sales Statistics</h2>
              <button style={{ fontSize: 13, color: "#8a8a9a", background: "none", border: "none", cursor: "pointer" }}>Export CSV</button>
            </div>
            <div style={S.grid4}>
              {statCards.map(s => (
                <div key={s.label} style={{ backgroundColor: "#F4F6FB", borderRadius: 12, padding: "18px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <p style={S.label}>{s.label}</p>
                    <p style={S.value}>{s.value}</p>
                  </div>
                  <div style={{ width: 40, height: 40, borderRadius: "50%", backgroundColor: `${s.color}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <div style={{ width: 16, height: 16, borderRadius: "50%", backgroundColor: s.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
