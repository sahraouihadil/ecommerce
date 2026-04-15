/**
 * EngagementsPage.jsx - User Engagement Analytics (Admin) — Redesigned
 * Logic unchanged, styling updated to match AdminDashboard.
 */

import Header from "../ui/Header";
import Sidebar from "../ui/Sidebar";
import { useState } from "react";
import { Chart as ChartJS, LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend } from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend);

const S = {
  page:  { display: "flex", minHeight: "100vh", backgroundColor: "#F4F6FB", fontFamily: "'Segoe UI', sans-serif" },
  main:  { flex: 1, padding: "0 0 32px 0", overflowY: "auto" },
  inner: { padding: "28px 32px", display: "flex", flexDirection: "column", gap: 28 },
  card:  { backgroundColor: "#fff", borderRadius: 14, boxShadow: "0 2px 12px rgba(0,0,0,0.07)", padding: "24px 28px" },
  grid2: { display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 20 },
  grid3: { display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 },
  label: { margin: 0, fontSize: 11, color: "#8a8a9a", textTransform: "uppercase", letterSpacing: "0.08em" },
};

const trafficData = {
  labels: ["Sat", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri"],
  datasets: [{ label: "Visitors", data: [160, 180, 40, 120, 100, 130, 110], borderColor: "#28a745", backgroundColor: "rgba(40,167,69,0.08)", tension: 0.4, fill: true }],
};
const chartOpts = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } };

const topPages = [
  { name: "Home Page",    value: 80 },
  { name: "Product Page", value: 65 },
  { name: "AR View",      value: 50 },
  { name: "Checkout",     value: 30 },
];

const overviewCards = [
  { label: "Total Visitors",    value: "123,334", delta: "+12.5% vs last month", color: "#4f8ef7" },
  { label: "Avg. Session Time", value: "4m 32s",  delta: "+0.8% vs last month",  color: "#28a745" },
  { label: "AR Conversion Rate",value: "8.4%",    delta: "+2.1% vs last month",  color: "#6f42c1" },
];

export default function EngagementPage() {
  const [openBar, setOpenBar] = useState(window.innerWidth >= 600);

  return (
    <div style={S.page}>
      <Sidebar openBar={openBar} setOpenBar={setOpenBar} />

      <main style={S.main}>
        <Header concept="Engagement" setOpenBar={setOpenBar} openBar={openBar} />

        <div style={S.inner}>

          {/* Title */}
          <div>
            <p style={{ margin: "4px 0 0", fontSize: 14, color: "#8a8a9a" }}>User engagement metrics and analytics.</p>
          </div>

          {/* Overview cards */}
          <div style={S.grid3}>
            {overviewCards.map(c => (
              <div key={c.label} style={{ ...S.card, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <p style={S.label}>{c.label}</p>
                  <p style={{ margin: "6px 0 2px", fontSize: 26, fontWeight: 700, color: "#1a1a2e" }}>{c.value}</p>
                  <p style={{ margin: 0, fontSize: 12, color: "#28a745" }}>{c.delta}</p>
                </div>
                <div style={{ width: 48, height: 48, borderRadius: "50%", backgroundColor: `${c.color}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <div style={{ width: 20, height: 20, borderRadius: "50%", backgroundColor: c.color }} />
                </div>
              </div>
            ))}
          </div>

          {/* Charts row */}
          <div style={S.grid2}>

            {/* Traffic */}
            <div style={S.card}>
              <div style={{ marginBottom: 20 }}>
                <h2 style={{ margin: 0, fontSize: 17, fontWeight: 600, color: "#1a1a2e" }}>Website Traffic</h2>
                <p style={{ margin: "4px 0 0", fontSize: 13, color: "#8a8a9a" }}>Daily visitor sessions this week</p>
              </div>
              <div style={{ height: 220 }}>
                <Line data={trafficData} options={chartOpts} />
              </div>
            </div>

            {/* Top Pages */}
            <div style={S.card}>
              <div style={{ marginBottom: 20 }}>
                <h2 style={{ margin: 0, fontSize: 17, fontWeight: 600, color: "#1a1a2e" }}>Top Pages</h2>
                <p style={{ margin: "4px 0 0", fontSize: 13, color: "#8a8a9a" }}>Most visited pages</p>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {topPages.map(p => (
                  <div key={p.name}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <span style={{ fontSize: 13, color: "#1a1a2e", fontWeight: 500 }}>{p.name}</span>
                      <span style={{ fontSize: 13, color: "#8a8a9a" }}>{p.value}%</span>
                    </div>
                    <div style={{ width: "100%", height: 6, background: "#F4F6FB", borderRadius: 99 }}>
                      <div style={{ width: `${p.value}%`, height: 6, background: "#4f8ef7", borderRadius: 99 }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      </main>
    </div>
  );
}
