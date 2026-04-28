import { useEffect, useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import api from "../services/api";

const GoldRule = () => (
  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
    <div style={{ height: "1px", flex: 1, background: "linear-gradient(to right, transparent, rgba(200,169,106,0.5))" }} />
    <div style={{ width: "5px", height: "5px", background: "#C8A96A", transform: "rotate(45deg)", flexShrink: 0 }} />
    <div style={{ height: "1px", flex: 1, background: "linear-gradient(to left, transparent, rgba(200,169,106,0.5))" }} />
  </div>
);

const statusColor = (status) => {
  switch (status?.toLowerCase()) {
    case "delivered": return "#4A7C59";
    case "shipped": return "#9A7D4A";
    case "confirmed": return "#6B7A9A";
    default: return "#9E8E7A";
  }
};

export function OrderPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const justPlaced = location.state?.orderId;

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@400;700;900&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&display=swap";
    document.head.appendChild(link);
    return () => document.head.removeChild(link);
  }, []);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get("/api/orders");
        setOrders(res.data);
      } catch (err) {
        if (err.response?.status === 401) navigate("/login");
      } finally {
        setLoading(false);
        setTimeout(() => setMounted(true), 50);
      }
    };
    fetchOrders();
  }, [navigate]);

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#F5F0E8", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1.5rem" }}>
        <div style={{ position: "relative", width: "48px", height: "48px" }}>
          <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "1px solid #C8A96A", borderTopColor: "transparent", animation: "spin 1s linear infinite" }} />
          <div style={{ position: "absolute", inset: "5px", borderRadius: "50%", border: "1px solid rgba(200,169,106,0.25)" }} />
        </div>
        <p style={{ fontFamily: "sans-serif", fontSize: "0.575rem", letterSpacing: "0.42em", textTransform: "uppercase", color: "#9E8E7A" }}>
          Retrieving your orders
        </p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#F5F0E8", color: "#1C1916", fontFamily: "'Cormorant Garamond', Georgia, serif", overflowX: "hidden", position: "relative" }}>

      {/* Ghost watermark */}
      <div aria-hidden="true" style={{ position: "fixed", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none", userSelect: "none", zIndex: 0 }}>
        <span style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: "clamp(5rem, 22vw, 18rem)", fontWeight: 900, color: "transparent", WebkitTextStroke: "1px rgba(180,148,90,0.04)", letterSpacing: "0.12em", whiteSpace: "nowrap" }}>
          ORDERS
        </span>
      </div>

      <div style={{ maxWidth: "760px", margin: "0 auto", padding: "clamp(7rem, 12vw, 9rem) 1.5rem 6rem", position: "relative", zIndex: 1 }}>

        {/* ── Success banner ── */}
        {justPlaced && (
          <div style={{
            display: "flex", alignItems: "center", gap: "14px",
            background: "rgba(74,124,89,0.08)", border: "1px solid rgba(74,124,89,0.25)",
            borderRadius: "12px", padding: "1rem 1.25rem", marginBottom: "2.5rem",
          }}>
            <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#4A7C59", flexShrink: 0 }} />
            <div>
              <p style={{ fontFamily: "sans-serif", fontSize: "0.575rem", letterSpacing: "0.22em", textTransform: "uppercase", color: "#4A7C59", marginBottom: "0.2rem" }}>
                Order #{justPlaced} placed successfully
              </p>
              <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "0.95rem", fontStyle: "italic", color: "#6B5F52" }}>
                We'll send you tracking updates via email.
              </p>
            </div>
          </div>
        )}

        {/* ── Header ── */}
        <p style={{ fontFamily: "sans-serif", fontSize: "0.575rem", letterSpacing: "0.38em", textTransform: "uppercase", color: "#9E8E7A", marginBottom: "1rem" }}>
          Account
        </p>
        <h1 style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: "clamp(1.8rem, 5vw, 3rem)", fontWeight: 700, letterSpacing: "0.035em", lineHeight: 1.08, color: "#1C1916", marginBottom: "1.5rem" }}>
          Your Orders
        </h1>

        {/* Short gold rule */}
        <div style={{ display: "flex", alignItems: "center", gap: "6px", maxWidth: "12rem", marginBottom: "3rem" }}>
          <div style={{ height: "1px", flex: 1, background: "#C8A96A", opacity: 0.55 }} />
          <div style={{ width: "4px", height: "4px", background: "#C8A96A", transform: "rotate(45deg)", opacity: 0.7 }} />
          <div style={{ height: "1px", flex: 1, background: "#C8A96A", opacity: 0.55 }} />
        </div>

        {/* ── Empty state ── */}
        {orders.length === 0 ? (
          <div style={{ textAlign: "center", padding: "5rem 0" }}>
            <div style={{ width: "1px", height: "3.5rem", background: "linear-gradient(to bottom, transparent, #C8A96A)", margin: "0 auto 2rem" }} />
            <p style={{ fontFamily: "sans-serif", fontSize: "0.575rem", letterSpacing: "0.35em", textTransform: "uppercase", color: "#9E8E7A", marginBottom: "2rem" }}>
              No orders yet
            </p>
            <div style={{ width: "1px", height: "3.5rem", background: "linear-gradient(to bottom, #C8A96A, transparent)", margin: "0 auto 2.5rem" }} />
            <Link
              to="/furniture"
              style={{
                display: "inline-block",
                padding: "0.8rem 2rem",
                background: "#1C1916",
                border: "1px solid #1C1916",
                borderRadius: "2rem",
                fontFamily: "sans-serif",
                fontSize: "0.575rem",
                letterSpacing: "0.28em",
                textTransform: "uppercase",
                color: "#F5F0E8",
                textDecoration: "none",
                transition: "background 0.2s",
              }}
            >
              Browse the Collection
            </Link>
          </div>
        ) : (
          <>
            {/* ── Top rule ── */}
            <GoldRule />

            {/* ── Order rows ── */}
            <div>
              {orders.map((order, i) => (
                <div key={order.id}>
                  <Link
                    to={`/order/tracking/${order.id}/0`}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "1.6rem 0.5rem",
                      textDecoration: "none",
                      opacity: mounted ? 1 : 0,
                      transform: mounted ? "translateY(0)" : "translateY(14px)",
                      transition: `opacity 0.5s ease ${i * 0.07}s, transform 0.5s ease ${i * 0.07}s`,
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(200,169,106,0.06)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    {/* Left */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <span style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: "0.95rem", fontWeight: 700, letterSpacing: "0.04em", color: "#1C1916" }}>
                        Order #{order.id}
                      </span>
                      <span style={{ fontFamily: "sans-serif", fontSize: "0.55rem", letterSpacing: "0.22em", textTransform: "uppercase", color: "#9E8E7A" }}>
                        {order.orderdate
                          ? new Date(order.orderdate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
                          : "N/A"}
                      </span>
                    </div>

                    {/* Right */}
                    <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
                      <div style={{ textAlign: "right", display: "flex", flexDirection: "column", gap: "6px" }}>
                        {/* Status pill */}
                        <span style={{
                          display: "inline-flex", alignItems: "center", gap: "5px",
                          padding: "0.2rem 0.75rem",
                          border: `1px solid ${statusColor(order.status)}44`,
                          borderRadius: "2rem",
                          background: `${statusColor(order.status)}11`,
                          fontFamily: "sans-serif", fontSize: "0.5rem", letterSpacing: "0.2em",
                          textTransform: "uppercase", color: statusColor(order.status),
                          alignSelf: "flex-end",
                        }}>
                          <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: statusColor(order.status), flexShrink: 0 }} />
                          {order.status}
                        </span>
                        <span style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: "1rem", fontWeight: 700, color: "#9A7D4A", letterSpacing: "0.03em" }}>
                          {Number(order.totalamount).toLocaleString()} DA
                        </span>
                      </div>

                      {/* Arrow */}
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C8A96A" strokeWidth="1.5">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </div>
                  </Link>

                  <GoldRule />
                </div>
              ))}
            </div>

            {/* Order count */}
            <p style={{ fontFamily: "sans-serif", fontSize: "0.52rem", letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(158,142,122,0.5)", textAlign: "right", marginTop: "1.5rem" }}>
              {orders.length} order{orders.length !== 1 ? "s" : ""}
            </p>
          </>
        )}
      </div>

      {/* Footer ornament */}
      <div style={{ padding: "0 1.5rem 4rem", position: "relative", zIndex: 1 }}>
        <GoldRule />
        <div style={{ display: "flex", justifyContent: "center", marginTop: "2rem" }}>
          <span style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: "0.55rem", letterSpacing: "0.5em", textTransform: "uppercase", color: "rgba(200,169,106,0.3)" }}>
            enter your sanctuary
          </span>
        </div>
      </div>

    </div>
  );
}