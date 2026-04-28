import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../services/api";

const GoldRule = () => (
  <div className="flex items-center gap-3 my-10">
    <div style={{ height: "1px", flex: 1, background: "linear-gradient(to right, transparent, rgba(200,169,106,0.5))" }} />
    <div style={{ width: "5px", height: "5px", background: "#C8A96A", transform: "rotate(45deg)", flexShrink: 0 }} />
    <div style={{ height: "1px", flex: 1, background: "linear-gradient(to left, transparent, rgba(200,169,106,0.5))" }} />
  </div>
);

export function TrackingPage() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@400;700;900&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&display=swap";
    document.head.appendChild(link);
    return () => document.head.removeChild(link);
  }, []);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await api.get(`/api/orders/${orderId}`);
        setOrder(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  if (loading)
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "#F5F0E8", fontFamily: "'Cormorant Garamond', Georgia, serif" }}
      >
        <div className="flex flex-col items-center gap-6">
          <div className="relative w-12 h-12">
            <div
              className="absolute inset-0 rounded-full animate-spin"
              style={{ border: "1px solid #C8A96A", borderTopColor: "transparent" }}
            />
            <div
              className="absolute inset-[5px] rounded-full"
              style={{ border: "1px solid rgba(200,169,106,0.25)" }}
            />
          </div>
          <p
            style={{
              fontFamily: "sans-serif",
              fontSize: "0.575rem",
              letterSpacing: "0.42em",
              textTransform: "uppercase",
              color: "#9E8E7A",
            }}
          >
            Locating your order
          </p>
        </div>
      </div>
    );

  if (!order)
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "#F5F0E8", fontFamily: "'Cormorant Garamond', Georgia, serif" }}
      >
        <div className="flex flex-col items-center gap-6 text-center">
          <div style={{ width: "1px", height: "3.5rem", background: "linear-gradient(to bottom, transparent, #C8A96A)" }} />
          <p
            style={{
              fontFamily: "sans-serif",
              fontSize: "0.6rem",
              letterSpacing: "0.35em",
              textTransform: "uppercase",
              color: "#9E8E7A",
            }}
          >
            Order not found
          </p>
          <div style={{ width: "1px", height: "3.5rem", background: "linear-gradient(to bottom, #C8A96A, transparent)" }} />
          <Link
            to="/order"
            style={{
              fontFamily: "sans-serif",
              fontSize: "0.575rem",
              letterSpacing: "0.28em",
              textTransform: "uppercase",
              color: "#9A7D4A",
              padding: "0.5rem 1.5rem",
              border: "1px solid rgba(200,169,106,0.45)",
              borderRadius: "2rem",
              textDecoration: "none",
              background: "rgba(200,169,106,0.1)",
              transition: "all 0.2s ease",
            }}
          >
            Back to orders
          </Link>
        </div>
      </div>
    );

  const steps = ["pending", "confirmed", "shipped", "delivered"];
  const currentStep = steps.indexOf(order.status) >= 0 ? steps.indexOf(order.status) : 0;
  const progressPct = (currentStep / (steps.length - 1)) * 100;

  return (
    <div
      className="min-h-screen"
      style={{ background: "#F5F0E8", fontFamily: "'Cormorant Garamond', Georgia, serif", color: "#1C1916" }}
    >
      <div className="max-w-3xl mx-auto px-6 md:px-10 pt-36 pb-32">

        {/* Back link */}
        <Link
          to="/order"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            fontFamily: "sans-serif",
            fontSize: "0.575rem",
            letterSpacing: "0.28em",
            textTransform: "uppercase",
            color: "#9E8E7A",
            textDecoration: "none",
            marginBottom: "2.5rem",
            transition: "color 0.2s",
          }}
        >
          <span style={{ color: "#C8A96A", fontSize: "12px" }}>←</span>
          Back to orders
        </Link>

        {/* Eyebrow + title */}
        <p
          style={{
            fontFamily: "sans-serif",
            fontSize: "0.575rem",
            letterSpacing: "0.38em",
            textTransform: "uppercase",
            color: "#9E8E7A",
            marginBottom: "0.85rem",
          }}
        >
          Order tracking
        </p>
        <h1
          style={{
            fontFamily: "'Cinzel Decorative', serif",
            fontSize: "clamp(1.4rem, 4vw, 2.4rem)",
            fontWeight: 700,
            letterSpacing: "0.04em",
            lineHeight: 1.1,
            color: "#1C1916",
            marginBottom: "1.5rem",
          }}
        >
          Order #{order.id}
        </h1>

        {/* Status badge */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "7px",
            padding: "0.35rem 1.1rem",
            border: "1px solid rgba(200,169,106,0.42)",
            borderRadius: "2rem",
            background: "rgba(200,169,106,0.1)",
            marginBottom: "2.5rem",
          }}
        >
          <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#C8A96A" }} />
          <span
            style={{
              fontFamily: "sans-serif",
              fontSize: "0.575rem",
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "#9A7D4A",
            }}
          >
            {order.status}
          </span>
        </div>

        {/* Progress tracker */}
        <div style={{ marginBottom: "2.5rem" }}>
          <p
            style={{
              fontFamily: "sans-serif",
              fontSize: "0.575rem",
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              color: "#9E8E7A",
              marginBottom: "1.35rem",
            }}
          >
            Delivery progress
          </p>

          <div style={{ position: "relative", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            {/* Track base */}
            <div
              style={{
                position: "absolute",
                top: 11,
                left: 0,
                right: 0,
                height: "1px",
                background: "rgba(200,169,106,0.2)",
                zIndex: 0,
              }}
            />
            {/* Track fill */}
            <div
              style={{
                position: "absolute",
                top: 11,
                left: 0,
                height: "1px",
                background: "#C8A96A",
                width: `${progressPct}%`,
                zIndex: 1,
                transition: "width 0.6s ease",
              }}
            />

            {steps.map((step, i) => {
              const done = i < currentStep;
              const active = i === currentStep;
              return (
                <div
                  key={step}
                  style={{ position: "relative", zIndex: 2, display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", flex: 1 }}
                >
                  <div
                    style={{
                      width: "22px",
                      height: "22px",
                      borderRadius: "50%",
                      border: done || active ? "1.5px solid #C8A96A" : "1.5px solid rgba(200,169,106,0.25)",
                      background: active ? "#1C1916" : done ? "#C8A96A" : "#F5F0E8",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "all 0.3s",
                    }}
                  >
                    {done && (
                      <div
                        style={{
                          width: "8px",
                          height: "8px",
                          borderRight: "1.5px solid #F5F0E8",
                          borderBottom: "1.5px solid #F5F0E8",
                          transform: "rotate(45deg) translate(-1px,-1px)",
                        }}
                      />
                    )}
                  </div>
                  <span
                    style={{
                      fontFamily: "sans-serif",
                      fontSize: "0.55rem",
                      letterSpacing: "0.18em",
                      textTransform: "uppercase",
                      color: done || active ? "#9A7D4A" : "rgba(158,142,122,0.4)",
                      textAlign: "center",
                    }}
                  >
                    {step}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <GoldRule />

        {/* Order details card */}
        <div
          style={{
            background: "#EDE7D9",
            border: "1px solid rgba(200,169,106,0.22)",
            borderRadius: "4px",
            padding: "1.75rem 2rem",
          }}
        >
          {/* Header row */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              paddingBottom: "1.35rem",
              marginBottom: "1.35rem",
              borderBottom: "1px solid rgba(200,169,106,0.2)",
            }}
          >
            <div>
              <p style={{ fontFamily: "sans-serif", fontSize: "0.55rem", letterSpacing: "0.28em", textTransform: "uppercase", color: "#9E8E7A", marginBottom: "0.3rem" }}>
                Order date
              </p>
              <p style={{ fontSize: "1rem", color: "#3D2F1F" }}>
                {order.orderdate
                  ? new Date(order.orderdate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
                  : "N/A"}
              </p>
            </div>
            <div style={{ textAlign: "right" }}>
              <p style={{ fontFamily: "sans-serif", fontSize: "0.55rem", letterSpacing: "0.28em", textTransform: "uppercase", color: "#9E8E7A", marginBottom: "0.3rem" }}>
                Order total
              </p>
              <p style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: "1.4rem", fontWeight: 700, color: "#9A7D4A", letterSpacing: "0.04em" }}>
                {Number(order.totalamount).toLocaleString()} DA
              </p>
            </div>
          </div>

          {/* Items */}
          <p style={{ fontFamily: "sans-serif", fontSize: "0.55rem", letterSpacing: "0.28em", textTransform: "uppercase", color: "#9E8E7A", marginBottom: "0.85rem" }}>
            Items ordered
          </p>

          {order.items?.map((item) => (
            <div
              key={item.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "0.9rem 0",
                borderBottom: "1px solid rgba(200,169,106,0.15)",
              }}
            >
              <div>
                <span style={{ fontSize: "1rem", color: "#3D2F1F" }}>
                  {item.product_name || `Product #${item.product_id}`}
                </span>
                <span style={{ fontFamily: "sans-serif", fontSize: "0.6rem", letterSpacing: "0.2em", color: "#9E8E7A", marginLeft: "8px" }}>
                  ×{item.quantity}
                </span>
              </div>
              <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.05rem", fontWeight: 500, fontStyle: "italic", color: "#9A7D4A" }}>
                {(item.price * item.quantity).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} DA
              </span>
            </div>
          ))}
        </div>

        <GoldRule />

        {/* Footer signature */}
        <div style={{ display: "flex", justifyContent: "center", marginTop: "0.5rem" }}>
          <span
            style={{
              fontFamily: "'Cinzel Decorative', serif",
              fontSize: "0.55rem",
              letterSpacing: "0.45em",
              textTransform: "uppercase",
              color: "rgba(200,169,106,0.35)",
            }}
          >
            enter your sanctuary
          </span>
        </div>

      </div>
    </div>
  );
}