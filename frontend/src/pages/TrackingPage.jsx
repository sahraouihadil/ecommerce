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

/* ── Stagger hook ── */
function useStaggerVisible(count, delayBase = 100) {
  const [visible, setVisible] = useState([]);
  useEffect(() => {
    let timers = [];
    for (let i = 0; i < count; i++) {
      timers.push(
        setTimeout(() => setVisible(v => [...v, i]), 80 + i * delayBase)
      );
    }
    return () => timers.forEach(clearTimeout);
  }, [count, delayBase]);
  return visible;
}

function AnimBlock({ children, index, visible, style = {} }) {
  const isVisible = visible.includes(index);
  return (
    <div
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0)" : "translateY(20px)",
        transition: "opacity 0.55s ease, transform 0.55s ease",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function TrackingPage() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  // 0: back link, 1: eyebrow+title, 2: badge, 3: progress, 4: rule, 5: card, 6: rule2, 7: footer
  const visible = useStaggerVisible(8, 110);

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

  const isCanceled = order.status === "canceled";
  const isProblem = order.status === "problem";
  const isPartial = order.status === "partial";

  const steps = isCanceled
    ? ["pending", "processing", "shipped", "canceled"]
    : ["pending", "processing", "shipped", "delivered"];

  const stepLabels = {
    pending: "Pending",
    processing: "Processing",
    shipped: isProblem ? "In Transit" : "Shipped",
    delivered: isPartial ? "Partial" : "Delivered",
    canceled: "Canceled",
  };

  const effectiveStatus = isProblem ? "shipped" : isPartial ? "delivered" : order.status;
  const currentStep = steps.indexOf(effectiveStatus) >= 0 ? steps.indexOf(effectiveStatus) : 0;
  const progressPct = (currentStep / (steps.length - 1)) * 100;

  const PARTIAL_GREEN = "#7DBF9E";
  const PARTIAL_GREEN_DARK = "#5A9E7C";
  const PARTIAL_GREEN_ALPHA = "rgba(125,191,158,0.42)";
  const PARTIAL_GREEN_BG = "rgba(125,191,158,0.1)";

  const isCanceledStep = (step) => step === "canceled";
  const isPartialStep = (step) => step === "delivered" && isPartial;

  const dotBorder = (step, i) => {
    if (isCanceledStep(step) && i === currentStep) return "1.5px solid #C06060";
    if (isPartialStep(step) && i === currentStep) return `1.5px solid ${PARTIAL_GREEN}`;
    if (i < currentStep || i === currentStep) return "1.5px solid #C8A96A";
    return "1.5px solid rgba(200,169,106,0.25)";
  };

  const dotBg = (step, i) => {
    if (isCanceledStep(step) && i === currentStep) return "#1C1916";
    if (isPartialStep(step) && i === currentStep) return "#1C1916";
    if (i === currentStep) return "#1C1916";
    if (i < currentStep) {
      if (isCanceled && i === steps.length - 1) return "#C06060";
      return "#C8A96A";
    }
    return "#F5F0E8";
  };

  const labelColor = (step, i) => {
    if (isCanceledStep(step) && i <= currentStep) return "#B05555";
    if (isPartialStep(step) && i <= currentStep) return PARTIAL_GREEN_DARK;
    if (i <= currentStep) return "#9A7D4A";
    return "rgba(158,142,122,0.4)";
  };

  const dotInner = (step, i) => {
    const done = i < currentStep;
    const active = i === currentStep;

    if (done && !isCanceledStep(step) && !isPartialStep(step)) {
      return (
        <div
          style={{
            width: "8px",
            height: "8px",
            borderRight: "1.5px solid #F5F0E8",
            borderBottom: "1.5px solid #F5F0E8",
            transform: "rotate(45deg) translate(-1px,-1px)",
          }}
        />
      );
    }
    if (active && isCanceledStep(step)) {
      return (
        <span style={{ color: "#C06060", fontSize: "11px", lineHeight: 1, fontWeight: 700, fontFamily: "sans-serif" }}>
          ✕
        </span>
      );
    }
    if (active && isPartialStep(step)) {
      return (
        <div
          style={{
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            background: `linear-gradient(to right, ${PARTIAL_GREEN} 50%, transparent 50%)`,
            border: `1px solid ${PARTIAL_GREEN}`,
          }}
        />
      );
    }
    return null;
  };

  const trackFill = isCanceled ? "#C06060" : isPartial ? PARTIAL_GREEN : "#C8A96A";

  const badgeBorder = isCanceled ? "1px solid rgba(192,96,96,0.42)"
    : isPartial ? `1px solid ${PARTIAL_GREEN_ALPHA}`
      : "1px solid rgba(200,169,106,0.42)";
  const badgeBg = isCanceled ? "rgba(192,96,96,0.1)"
    : isPartial ? PARTIAL_GREEN_BG
      : "rgba(200,169,106,0.1)";
  const badgeDotColor = isCanceled ? "#C06060"
    : isPartial ? PARTIAL_GREEN
      : "#C8A96A";
  const badgeTextColor = isCanceled ? "#B05555"
    : isPartial ? PARTIAL_GREEN_DARK
      : "#9A7D4A";
  const badgeLabel = isProblem ? "In Transit"
    : isPartial ? "Partial"
      : order.status;

  return (
    <div
      className="min-h-screen"
      style={{ background: "#F5F0E8", fontFamily: "'Cormorant Garamond', Georgia, serif", color: "#1C1916" }}
    >
      <div className="max-w-3xl mx-auto px-6 md:px-10 pt-36 pb-32">

        {/* 0 — Back link */}
        <AnimBlock index={0} visible={visible}>
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
        </AnimBlock>

        {/* 1 — Eyebrow + title */}
        <AnimBlock index={1} visible={visible}>
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
        </AnimBlock>

        {/* 2 — Status badge */}
        <AnimBlock index={2} visible={visible}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "7px",
              padding: "0.35rem 1.1rem",
              border: badgeBorder,
              borderRadius: "2rem",
              background: badgeBg,
              marginBottom: "2.5rem",
            }}
          >
            <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: badgeDotColor }} />
            <span
              style={{
                fontFamily: "sans-serif",
                fontSize: "0.575rem",
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: badgeTextColor,
              }}
            >
              {badgeLabel}
            </span>
          </div>
        </AnimBlock>

        {/* 3 — Progress tracker */}
        <AnimBlock index={3} visible={visible}>
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
              <div
                style={{
                  position: "absolute", top: 11, left: 0, right: 0,
                  height: "1px", background: "rgba(200,169,106,0.2)", zIndex: 0,
                }}
              />
              <div
                style={{
                  position: "absolute", top: 11, left: 0,
                  height: "1px", background: trackFill,
                  width: `${progressPct}%`, zIndex: 1,
                  transition: "width 0.6s ease",
                }}
              />

              {steps.map((step, i) => (
                <div
                  key={step}
                  style={{
                    position: "relative", zIndex: 2,
                    display: "flex", flexDirection: "column", alignItems: "center",
                    gap: "8px", flex: 1,
                  }}
                >
                  <div
                    style={{
                      width: "22px", height: "22px", borderRadius: "50%",
                      border: dotBorder(step, i), background: dotBg(step, i),
                      display: "flex", alignItems: "center", justifyContent: "center",
                      transition: "all 0.3s",
                    }}
                  >
                    {dotInner(step, i)}
                  </div>
                  <span
                    style={{
                      fontFamily: "sans-serif",
                      fontSize: "0.55rem",
                      letterSpacing: "0.18em",
                      textTransform: "uppercase",
                      color: labelColor(step, i),
                      textAlign: "center",
                    }}
                  >
                    {stepLabels[step] ?? step}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </AnimBlock>

        {/* 4 — Rule */}
        <AnimBlock index={4} visible={visible}>
          <GoldRule />
        </AnimBlock>

        {/* 5 — Order details card */}
        <AnimBlock index={5} visible={visible}>
          <div
            style={{
              background: "#EDE7D9",
              border: "1px solid rgba(200,169,106,0.22)",
              borderRadius: "4px",
              padding: "1.75rem 2rem",
            }}
          >
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
        </AnimBlock>

        {/* 6 — Rule */}
        <AnimBlock index={6} visible={visible}>
          <GoldRule />
        </AnimBlock>

        {/* 7 — Footer signature */}
        <AnimBlock index={7} visible={visible}>
          <div style={{ display: "flex", justifyContent: "center", marginTop: "0.5rem" }}>
            <span
              style={{
                fontFamily: "'Cinzel Decorative', serif",
                fontSize: "0.55rem",
                letterSpacing: "0.45em",
                textTransform: "uppercase",
                color: "rgba(181, 152, 94, 0.35)",
              }}
            >
              Thank You For Choosing Us🤎
            </span>
          </div>
        </AnimBlock>

      </div>
    </div>
  );
}