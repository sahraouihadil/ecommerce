/**
 * ReportPage.jsx - Sales & Analytics Reports (Admin) — Redesigned
 * Logic unchanged, styling updated to match AdminDashboard.
 */

import Header from "../ui/Header";
import Sidebar from "../ui/Sidebar";
import { useState , useEffect } from "react";
import { Chart as ChartJS, BarElement, LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend } from "chart.js";
import { Bar, Line } from "react-chartjs-2";
import api from "../../services/api";
import {
  LayoutDashboard, Users, MessageSquare, CheckSquare,
  BarChart, Activity, Settings, X,
} from "lucide-react";

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

const arData = {
  labels: ["Sat", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri"],
  datasets: [{ label: "AR Activity", data: [150, 170, 40, 120, 100, 130, 110], borderColor: "#28a745", backgroundColor: "rgba(40,167,69,0.08)", tension: 0.4, fill: true }],
};

const chartOpts = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } };

export default function ReportPage() {
  const [openBar, setOpenBar] = useState(window.innerWidth >= 600);

  //AVG order value _________________________________________
   const [orderItems,setOrderItems] = useState([]);
   const [orders, setOrders] = useState([]);
   const [users, setUsers] = useState([]);

  useEffect(() => { api.get("/api/orders/all").then(r => setOrders(r.data)).catch(console.error); }, []);
  useEffect(() => { api.get("/api/order-items").then(r => setOrderItems(r.data)).catch(console.error); }, []);
  useEffect(() => { api.get("/api/users").then(r => setUsers(r.data)).catch(console.error); }, []);

    // ── Polling refresh  ─────────────────────────────
  useEffect(() => {
    const refresh = async () => {
      try {
        const [uRes,oRes, oiRes] = await Promise.all([
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

  const totalRev = orderItems.reduce((s, o) => s + o.price * o.quantity, 0);
  const avgOrderValue= totalRev/orders.length;

  // Conversion Rate ________________________________________________
  const convRate = `${((orders.length / (users?.length || 1)) * 100).toFixed(2)} %`;

  // Return Rate ____________________________________________________
  const returnedOrders = orders.filter((o)=>{ return o.status == "canceled"});
  const returnRate= `${((returnedOrders.length / orders.length)*100).toFixed(2)} %`

  //Gross Margin ____________________________________________________
  const revenue = orders.reduce((sum, o) => sum + (o.totalamount || 0), 0);
  const cost = revenue/2;
  const grossMargin= `${(((revenue-cost)/revenue)*100).toFixed(2)} %`

    // ── Chart stats ───────────────────────────────────────────────────────
const [revenueData, setRevenueData] = useState({labels:[],datasets: []});

useEffect(() => {
  const fetchStats = async () => {
    try {
      const res = await api.get("/stats");

      const { orders: o } = res.data;

      //  days
      const allDays = [...new Set(
        o.map(x => x.day)
      )].sort((a, b) => new Date(a) - new Date(b));

      //  revenue per day
          const revenuePerDay = allDays.map(day => {
          const item = o.find(x => x.day === day);
           return item ? item.orders_totalamount : 0;
              });

      setRevenueData({
        labels: allDays.map(day =>
          new Date(day).toLocaleDateString("en-US", { weekday: "short" })
        ),
        datasets: [
          {
            label: "Revenue",
            data: revenuePerDay,
            borderColor: "#4f8ef7",
            backgroundColor: "rgba(79,142,247,0.08)",
            fill: true
          }
        ]
      });

    } catch (err) {
      console.error(err);
    }
  };

  fetchStats();
  const id = setInterval(fetchStats, 5000);
  return () => clearInterval(id);
}, []);

  const statCards = [
  { label: "Avg Order Value",  value: avgOrderValue, color: "#4f8ef7" },
  { label: "Conversion Rate",  value: convRate ,      color: "#28a745" },
  { label: "Return Rate",      value: returnRate ,      color: "#ffc107" },
  { label: "Gross Margin",     value: grossMargin,         color: "#6f42c1" },
];

    const adminLinks = [
     { to: "/admin-dash", label: "Dashboard", icon: <LayoutDashboard size={18} />, end: true },
    { to: "/admin-dash/accounts", label: "Accounts", icon: <Users size={18} /> },
    { to: "/admin-dash/complaints", label: "Complaints", icon: <MessageSquare size={18} /> },
    { to: "/admin-dash/reports", label: "Reports", icon: <BarChart size={18} /> },
    { to: "/admin-dash/engagement", label: "Engagement", icon: <Activity size={18} /> },
    { to: "/admin-dash/configuration", label: "Configuration", icon: <Settings size={18} /> },
    { to: "/admin-dash/validation", label: "Validation", icon: <CheckSquare size={18} /> },
     ];
  return (
    <div style={S.page}>
          <Sidebar
                     openBar={openBar}
                     setOpenBar={setOpenBar}
                     links={adminLinks}
                     title="AdminCore"
                     subtitle="Enterprise Suite"
                     role="Super Admin"
                     />

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
                <p style={{ margin: "4px 0 0", fontSize: 13, color: "#8a8a9a" }}>Daily revenue this week (DA)</p>
              </div>
          <div style={{ height: 240 }}>
                {revenueData ? (
              <Bar data={revenueData} options={chartOpts} />
                      ) : (
                 <p>Loading...</p>
                   )}
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
