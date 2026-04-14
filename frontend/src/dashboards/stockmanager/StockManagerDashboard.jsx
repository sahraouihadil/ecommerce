/**
 * StockManagerDashboard.jsx
 * Shows all orders, lets stock manager update status and assign to deliveryman.
 */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

const STATUS_COLORS = {
  pending:    { bg: "#FFF3CD", color: "#856404" },
  processing: { bg: "#CCE5FF", color: "#004085" },
  shipped:    { bg: "#D4EDDA", color: "#155724" },
  delivered:  { bg: "#D1ECF1", color: "#0C5460" },
};

const STATUSES = ["pending", "processing", "shipped", "delivered"];

export function StockMngrDashboard() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [deliverymen, setDeliverymen] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem("token");
      if (!token) { navigate("/login", { replace: true }); return; }
      try {
        await api.get("/stock-manager-dash");
        const ordersRes = await api.get("/api/orders/all");
        setOrders(ordersRes.data);
        setDeliverymen([]);
      } catch {
        localStorage.removeItem("token");
        navigate("/");
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [navigate]);

  const updateStatus = async (orderId, newStatus) => {
    setUpdating(orderId);
    try {
      await api.put(`/api/orders/${orderId}/status?status=${newStatus}`);
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    } catch {
      alert("Failed to update status");
    } finally {
      setUpdating(null);
    }
  };

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === "pending").length,
    processing: orders.filter(o => o.status === "processing").length,
    shipped: orders.filter(o => o.status === "shipped").length,
  };

  if (loading) return <div style={{ padding: 40, fontFamily: "sans-serif" }}>Loading...</div>;

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#F8F9FA", fontFamily: "'Segoe UI', sans-serif" }}>
      {/* Header */}
      <div style={{ backgroundColor: "#1a1a2e", color: "white", padding: "16px 32px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>📦 Stock Manager</h1>
          <p style={{ margin: 0, fontSize: 13, opacity: 0.7 }}>Order Management & Dispatch</p>
        </div>
        <button onClick={() => { localStorage.removeItem("token"); navigate("/login"); }}
          style={{ background: "none", border: "1px solid rgba(255,255,255,0.3)", color: "white", padding: "8px 16px", borderRadius: 6, cursor: "pointer", fontSize: 13 }}>
          Sign Out
        </button>
      </div>

      <div style={{ padding: "24px 32px" }}>
        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 32 }}>
          {[
            { label: "Total Orders", value: stats.total, color: "#6c757d" },
            { label: "Pending", value: stats.pending, color: "#ffc107" },
            { label: "Processing", value: stats.processing, color: "#007bff" },
            { label: "Shipped", value: stats.shipped, color: "#28a745" },
          ].map(s => (
            <div key={s.label} style={{ backgroundColor: "white", borderRadius: 12, padding: "20px 24px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", borderLeft: `4px solid ${s.color}` }}>
              <p style={{ margin: 0, fontSize: 13, color: "#6c757d" }}>{s.label}</p>
              <p style={{ margin: "8px 0 0", fontSize: 28, fontWeight: 700, color: s.color }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Orders Table */}
        <div style={{ backgroundColor: "white", borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.06)", overflow: "hidden" }}>
          <div style={{ padding: "20px 24px", borderBottom: "1px solid #f0f0f0" }}>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>All Orders</h2>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
              <thead>
                <tr style={{ backgroundColor: "#f8f9fa" }}>
                  {["Order ID", "Customer ID", "Items", "Total", "Date", "Status", "Action"].map(h => (
                    <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontWeight: 600, color: "#495057", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr><td colSpan={7} style={{ padding: 32, textAlign: "center", color: "#adb5bd" }}>No orders yet</td></tr>
                ) : orders.map(order => {
                  const sc = STATUS_COLORS[order.status] || { bg: "#f8f9fa", color: "#495057" };
                  return (
                    <tr key={order.id} style={{ borderBottom: "1px solid #f0f0f0" }}>
                      <td style={{ padding: "14px 16px", fontWeight: 600, color: "#1a1a2e" }}>#{order.id}</td>
                      <td style={{ padding: "14px 16px", color: "#6c757d" }}>User #{order.user_id}</td>
                      <td style={{ padding: "14px 16px" }}>
                        <div style={{ fontSize: 12, color: "#495057" }}>
                          {order.items?.map(i => <div key={i.id}>{i.product_name} x{i.quantity}</div>)}
                        </div>
                      </td>
                      <td style={{ padding: "14px 16px", fontWeight: 600 }}>{order.totalamount?.toFixed(2)} DA</td>
                      <td style={{ padding: "14px 16px", color: "#6c757d", fontSize: 12 }}>
                        {order.orderdate ? new Date(order.orderdate).toLocaleDateString() : "—"}
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        <span style={{ backgroundColor: sc.bg, color: sc.color, padding: "4px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
                          {order.status}
                        </span>
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        <select
                          value={order.status}
                          disabled={updating === order.id}
                          onChange={e => updateStatus(order.id, e.target.value)}
                          style={{ padding: "6px 10px", borderRadius: 6, border: "1px solid #dee2e6", fontSize: 13, cursor: "pointer", backgroundColor: "white" }}
                        >
                          {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}