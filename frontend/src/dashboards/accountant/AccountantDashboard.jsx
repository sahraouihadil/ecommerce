/**
 * AccountantDashboard.jsx
 * Shows financial overview: total revenue, orders, avg order value, per-order breakdown.
 */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

export function AccountantDashboard() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem("token");
      if (!token) { navigate("/login", { replace: true }); return; }
      try {
        await api.get("/accountant-dash");
        const res = await api.get("/api/orders/all");
        setOrders(res.data);
      } catch {
        localStorage.removeItem("token");
        navigate("/");
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [navigate]);

  const totalRevenue = orders.reduce((sum, o) => sum + (o.totalamount || 0), 0);
  const avgOrder = orders.length ? totalRevenue / orders.length : 0;
  const delivered = orders.filter(o => o.status === "delivered");
  const deliveredRevenue = delivered.reduce((sum, o) => sum + (o.totalamount || 0), 0);

  if (loading) return <div style={{ padding: 40 }}>Loading...</div>;

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f8f5ff", fontFamily: "'Segoe UI', sans-serif" }}>
      <div style={{ backgroundColor: "#3d1a78", color: "white", padding: "16px 32px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>💰 Accountant Dashboard</h1>
          <p style={{ margin: 0, fontSize: 13, opacity: 0.8 }}>Financial Overview</p>
        </div>
        <button onClick={() => { localStorage.removeItem("token"); navigate("/login"); }}
          style={{ background: "none", border: "1px solid rgba(255,255,255,0.4)", color: "white", padding: "8px 16px", borderRadius: 6, cursor: "pointer", fontSize: 13 }}>
          Sign Out
        </button>
      </div>

      <div style={{ padding: "24px 32px" }}>
        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 32 }}>
          {[
            { label: "Total Revenue", value: `${totalRevenue.toFixed(2)} DA`, color: "#3d1a78" },
            { label: "Confirmed Revenue", value: `${deliveredRevenue.toFixed(2)} DA`, color: "#155724" },
            { label: "Total Orders", value: orders.length, color: "#004085" },
            { label: "Avg Order Value", value: `${avgOrder.toFixed(2)} DA`, color: "#856404" },
          ].map(s => (
            <div key={s.label} style={{ backgroundColor: "white", borderRadius: 12, padding: "20px 24px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", borderLeft: `4px solid ${s.color}` }}>
              <p style={{ margin: 0, fontSize: 13, color: "#6c757d" }}>{s.label}</p>
              <p style={{ margin: "8px 0 0", fontSize: 22, fontWeight: 700, color: s.color }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Orders Financial Table */}
        <div style={{ backgroundColor: "white", borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.06)", overflow: "hidden" }}>
          <div style={{ padding: "20px 24px", borderBottom: "1px solid #f0f0f0" }}>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>Order Financial Records</h2>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
              <thead>
                <tr style={{ backgroundColor: "#f8f9fa" }}>
                  {["Order ID", "Date", "Items", "Amount", "Status"].map(h => (
                    <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontWeight: 600, color: "#495057", fontSize: 12, textTransform: "uppercase" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr><td colSpan={5} style={{ padding: 32, textAlign: "center", color: "#adb5bd" }}>No orders yet</td></tr>
                ) : orders.map(order => (
                  <tr key={order.id} style={{ borderBottom: "1px solid #f0f0f0" }}>
                    <td style={{ padding: "14px 16px", fontWeight: 600 }}>#{order.id}</td>
                    <td style={{ padding: "14px 16px", color: "#6c757d", fontSize: 13 }}>
                      {order.orderdate ? new Date(order.orderdate).toLocaleDateString() : "—"}
                    </td>
                    <td style={{ padding: "14px 16px", fontSize: 13, color: "#495057" }}>
                      {order.items?.map(i => `${i.product_name} x${i.quantity}`).join(", ")}
                    </td>
                    <td style={{ padding: "14px 16px", fontWeight: 700, color: "#3d1a78" }}>
                      {order.totalamount?.toFixed(2)} DA
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <span style={{
                        padding: "4px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600,
                        backgroundColor: order.status === "delivered" ? "#D4EDDA" : order.status === "pending" ? "#FFF3CD" : "#CCE5FF",
                        color: order.status === "delivered" ? "#155724" : order.status === "pending" ? "#856404" : "#004085",
                      }}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}