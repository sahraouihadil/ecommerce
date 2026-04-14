/**
 * MarketingManagerDashboard.jsx
 * Shows product catalog performance, top products by orders, engagement stats.
 */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

export function MarketingMngrDashboard() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem("token");
      if (!token) { navigate("/login", { replace: true }); return; }
      try {
        await api.get("/marketing-manager-dash");
        const [pRes, oRes] = await Promise.all([
        api.get("/api/products"),
        api.get("/api/orders/all"),
      ]);
        setProducts(pRes.data);
        setOrders(oRes.data);
      } catch {
        localStorage.removeItem("token");
        navigate("/");
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [navigate]);

  // Count how many times each product was ordered
  const productSales = {};
  orders.forEach(order => {
    order.items?.forEach(item => {
      productSales[item.product_id] = (productSales[item.product_id] || 0) + item.quantity;
    });
  });

  const topProducts = products
    .map(p => ({ ...p, sold: productSales[p.id] || 0 }))
    .sort((a, b) => b.sold - a.sold);

  if (loading) return <div style={{ padding: 40 }}>Loading...</div>;

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#fff8f0", fontFamily: "'Segoe UI', sans-serif" }}>
      <div style={{ backgroundColor: "#c0390b", color: "white", padding: "16px 32px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>📣 Marketing Manager</h1>
          <p style={{ margin: 0, fontSize: 13, opacity: 0.8 }}>Product Performance & Engagement</p>
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
  { label: "Total Products", value: products.length, color: "#c0390b" },
  { label: "Total Orders", value: orders.length, color: "#004085" },
  { label: "Total Revenue", value: `${orders.reduce((s,o) => s + (o.totalamount||0), 0).toFixed(0)} DA`, color: "#155724" },
  { label: "Delivered Orders", value: orders.filter(o => o.status === "delivered").length, color: "#856404" },

          ].map(s => (
            <div key={s.label} style={{ backgroundColor: "white", borderRadius: 12, padding: "20px 24px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", borderLeft: `4px solid ${s.color}` }}>
              <p style={{ margin: 0, fontSize: 13, color: "#6c757d" }}>{s.label}</p>
              <p style={{ margin: "8px 0 0", fontSize: 32, fontWeight: 700, color: s.color }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Product Performance */}
        <div style={{ backgroundColor: "white", borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.06)", overflow: "hidden" }}>
          <div style={{ padding: "20px 24px", borderBottom: "1px solid #f0f0f0" }}>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>Product Performance</h2>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
              <thead>
                <tr style={{ backgroundColor: "#f8f9fa" }}>
                  {["Product", "Category", "Price", "Units Sold", "Performance"].map(h => (
                    <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontWeight: 600, color: "#495057", fontSize: 12, textTransform: "uppercase" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {topProducts.length === 0 ? (
                  <tr><td colSpan={5} style={{ padding: 32, textAlign: "center", color: "#adb5bd" }}>No products</td></tr>
                ) : topProducts.map((product, idx) => {
                  const maxSold = topProducts[0]?.sold || 1;
                  const pct = maxSold > 0 ? Math.round((product.sold / maxSold) * 100) : 0;
                  return (
                    <tr key={product.id} style={{ borderBottom: "1px solid #f0f0f0" }}>
                      <td style={{ padding: "14px 16px", fontWeight: 600 }}>
                        {idx === 0 && <span style={{ marginRight: 6 }}>🏆</span>}
                        {product.name}
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        <span style={{ backgroundColor: "#f0f0f0", padding: "3px 10px", borderRadius: 20, fontSize: 12 }}>
                          {product.category}
                        </span>
                      </td>
                      <td style={{ padding: "14px 16px", color: "#c0390b", fontWeight: 600 }}>{product.price} DA</td>
                      <td style={{ padding: "14px 16px", fontWeight: 700 }}>{product.sold}</td>
                      <td style={{ padding: "14px 16px", minWidth: 150 }}>
                        <div style={{ backgroundColor: "#f0f0f0", borderRadius: 4, height: 8 }}>
                          <div style={{ backgroundColor: "#c0390b", borderRadius: 4, height: 8, width: `${pct}%`, transition: "width 0.5s" }} />
                        </div>
                        <span style={{ fontSize: 11, color: "#6c757d" }}>{pct}%</span>
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