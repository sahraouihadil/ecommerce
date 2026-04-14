/**
 * DeliverymanDashboard.jsx
 * Shows orders that are shipped/out for delivery. Deliveryman can mark as delivered.
 */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

export function DeliverymanDashboard() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem("token");
      if (!token) { navigate("/login", { replace: true }); return; }
      try {
        await api.get("/deliveryman-dash");
        const res = await api.get("/api/orders/all");
        setOrders(res.data.filter(o => ["shipped", "processing", "pending"].includes(o.status)));
      } catch {
        localStorage.removeItem("token");
        navigate("/");
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [navigate]);

  const markDelivered = async (orderId) => {
    setUpdating(orderId);
    try {
      await api.put(`/api/orders/${orderId}/status?status=delivered`);
      setOrders(prev => prev.filter(o => o.id !== orderId));
    } catch {
      alert("Failed to update");
    } finally {
      setUpdating(null);
    }
  };

  if (loading) return <div style={{ padding: 40 }}>Loading...</div>;

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f0faf4", fontFamily: "'Segoe UI', sans-serif" }}>
      <div style={{ backgroundColor: "#155724", color: "white", padding: "16px 32px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>🚚 Deliveryman Dashboard</h1>
          <p style={{ margin: 0, fontSize: 13, opacity: 0.8 }}>Delivery Queue</p>
        </div>
        <button onClick={() => { localStorage.removeItem("token"); navigate("/login"); }}
          style={{ background: "none", border: "1px solid rgba(255,255,255,0.4)", color: "white", padding: "8px 16px", borderRadius: 6, cursor: "pointer", fontSize: 13 }}>
          Sign Out
        </button>
      </div>

      <div style={{ padding: "24px 32px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginBottom: 32 }}>
          {[
            { label: "Active Deliveries", value: orders.length, color: "#155724" },
            { label: "Pending Pickup", value: orders.filter(o => o.status === "pending").length, color: "#856404" },
            { label: "Out for Delivery", value: orders.filter(o => o.status === "shipped").length, color: "#004085" },
          ].map(s => (
            <div key={s.label} style={{ backgroundColor: "white", borderRadius: 12, padding: "20px 24px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", borderLeft: `4px solid ${s.color}` }}>
              <p style={{ margin: 0, fontSize: 13, color: "#6c757d" }}>{s.label}</p>
              <p style={{ margin: "8px 0 0", fontSize: 32, fontWeight: 700, color: s.color }}>{s.value}</p>
            </div>
          ))}
        </div>

        <div style={{ backgroundColor: "white", borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.06)", overflow: "hidden" }}>
          <div style={{ padding: "20px 24px", borderBottom: "1px solid #f0f0f0" }}>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>Delivery Queue</h2>
          </div>
          {orders.length === 0 ? (
            <div style={{ padding: 48, textAlign: "center", color: "#adb5bd" }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
              <p>All deliveries completed!</p>
            </div>
          ) : (
            <div style={{ padding: 16, display: "grid", gap: 12 }}>
              {orders.map(order => (
                <div key={order.id} style={{ border: "1px solid #e9ecef", borderRadius: 10, padding: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 16 }}>Order #{order.id}</div>
                    <div style={{ fontSize: 13, color: "#6c757d", marginTop: 4 }}>
                      {order.items?.map(i => `${i.product_name} x${i.quantity}`).join(", ")}
                    </div>
                    <div style={{ fontSize: 13, marginTop: 6, fontWeight: 600, color: "#155724" }}>{order.totalamount?.toFixed(2)} DA</div>
                  </div>
                  <button onClick={() => markDelivered(order.id)} disabled={updating === order.id}
                    style={{ backgroundColor: "#155724", color: "white", border: "none", padding: "10px 20px", borderRadius: 8, cursor: "pointer", fontWeight: 600, fontSize: 13 }}>
                    {updating === order.id ? "Updating..." : "Mark Delivered ✓"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}