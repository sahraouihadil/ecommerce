import { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import api from "../services/api";

const C = {
    bg: "#F5F0E8",
    card: "#EDE7D9",
    dark: "#1C1916",
    darkCard: "#2C1F10",
    gold: "#C8A96A",
    goldDeep: "#9A7D4A",
    muted: "#9E8E7A",
    text: "#3D2F1F",
    green: "#4A7C59",
};

const GoldRule = () => (
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <div style={{ height: "1px", flex: 1, background: `linear-gradient(to right, transparent, rgba(200,169,106,0.5))` }} />
        <div style={{ width: "5px", height: "5px", background: C.gold, transform: "rotate(45deg)", flexShrink: 0 }} />
        <div style={{ height: "1px", flex: 1, background: `linear-gradient(to left, transparent, rgba(200,169,106,0.5))` }} />
    </div>
);

const SmallLabel = ({ children, style = {} }) => (
    <p style={{ fontFamily: "sans-serif", fontSize: "0.52rem", letterSpacing: "0.32em", textTransform: "uppercase", color: C.muted, margin: 0, ...style }}>
        {children}
    </p>
);

const Row = ({ label, value, bold, gold, lineThrough }) => (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "0.55rem 0" }}>
        <SmallLabel style={{ color: bold ? "rgba(200,169,106,0.7)" : undefined }}>{label}</SmallLabel>
        <span style={{
            fontFamily: bold ? "'Cinzel Decorative', serif" : "'Cormorant Garamond', Georgia, serif",
            fontSize: bold ? "1.15rem" : "0.95rem",
            fontWeight: bold ? 700 : 400,
            color: gold ? C.gold : bold ? C.gold : "rgba(232,220,200,0.75)",
            textDecoration: lineThrough ? "line-through" : "none",
            letterSpacing: bold ? "0.03em" : undefined,
        }}>{value}</span>
    </div>
);

const CheckMark = () => (
    <div style={{ position: "relative", width: "72px", height: "72px", margin: "0 auto" }}>
        <style>{`
      @keyframes ringGrow {
        0%   { transform: scale(0.4); opacity: 0; }
        60%  { transform: scale(1.1); opacity: 1; }
        100% { transform: scale(1);   opacity: 1; }
      }
      @keyframes checkDraw {
        from { stroke-dashoffset: 40; opacity: 0; }
        to   { stroke-dashoffset: 0;  opacity: 1; }
      }
      @keyframes pulse {
        0%, 100% { box-shadow: 0 0 0 0 rgba(200,169,106,0.4); }
        50%       { box-shadow: 0 0 0 14px rgba(200,169,106,0); }
      }
    `}</style>
        <div style={{
            width: "72px", height: "72px", borderRadius: "50%",
            border: `2px solid ${C.gold}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            animation: "ringGrow 0.55s cubic-bezier(.34,1.56,.64,1) both, pulse 2.4s 0.6s infinite",
        }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none"
                stroke={C.gold} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                style={{ animation: "checkDraw 0.4s 0.45s ease both" }}>
                <polyline points="20 6 9 17 4 12" strokeDasharray="40" strokeDashoffset="40" />
            </svg>
        </div>
    </div>
);

export function InvoicePage() {
    const navigate = useNavigate();
    const location = useLocation();
    const printRef = useRef(null);

    // 1. Try to get data from navigation state (sent by CheckoutPage)
    const state = location.state || {};
    const orderId = state.orderId;
    const stateTotal = state.total;
    const fullName = state.fullName || "—";
    const wilaya = state.wilaya || "—";
    const paymentMethod = state.paymentMethod || "cod";
    const deliveryType = state.delivery_type || "any time";
    const deliveryDate = state.deliverydate || "ASAP";
    const snapshotItems = state.items || [];

    const [order, setOrder] = useState(null);
    const [items, setItems] = useState(snapshotItems); // use snapshot first
    const [loading, setLoading] = useState(!orderId);
    const [visible, setVisible] = useState(false);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = "https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@400;700;900&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&display=swap";
        document.head.appendChild(link);
        return () => document.head.removeChild(link);
    }, []);

    useEffect(() => {
        if (!orderId) {
            // No orderId – go back to order listing
            navigate("/order");
            return;
        }
        // If we already have snapshot items, we can stop loading immediately
        if (snapshotItems.length > 0) {
            setLoading(false);
            setVisible(true);
            // still try to fetch order details (status, etc.) in background
            const fetchOrder = async () => {
                try {
                    const res = await api.get("/api/orders");
                    const found = res.data.find(o => o.id === orderId || String(o.id) === String(orderId));
                    setOrder(found);
                } catch (err) {
                    console.warn("Could not fetch order status");
                }
            };
            fetchOrder();
            return;
        }

        // Fallback: fetch order and items from API (if snapshot not available)
        const fetchOrder = async () => {
            try {
                const ordersRes = await api.get("/api/orders");
                const found = ordersRes.data.find(o => o.id === orderId || String(o.id) === String(orderId));
                setOrder(found || null);
                try {
                    const itemsRes = await api.get(`/api/orders/${orderId}/items`);
                    setItems(itemsRes.data);
                } catch {
                    setItems([]);
                }
            } catch (err) {
                if (err.response?.status === 401) navigate("/login");
            } finally {
                setLoading(false);
                setTimeout(() => setVisible(true), 120);
            }
        };
        fetchOrder();
    }, [orderId, navigate, snapshotItems]);

    // Determine total price (from snapshot, stateTotal, or order)
    let total = 0;
    if (snapshotItems.length > 0) {
        total = snapshotItems.reduce((sum, it) => sum + (it.product?.price || 0) * it.quantity, 0);
    } else if (stateTotal) {
        total = stateTotal;
    } else if (order?.totalamount) {
        total = Number(order.totalamount);
    }

    const orderDate = order?.orderdate
        ? new Date(order.orderdate).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })
        : new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

    const handleCopy = () => {
        navigator.clipboard.writeText(`#${orderId}`).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    const handlePrint = () => window.print();

    const payLabel = (() => {
        const m = paymentMethod || order?.paymentmethod;
        if (m === "cib") return "CIB / Card";
        if (m === "pickup") return "Self Pickup";
        return "Cash on Delivery";
    })();

    const scheduleLabel = (() => {
        if (deliveryType === "any time") return "ASAP";
        if (deliveryType === "specific date") return deliveryDate;
        if (deliveryType === "day of week") return deliveryDate;
        return "ASAP";
    })();

    if (loading) return (
        <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1.5rem" }}>
                <div style={{ position: "relative", width: "48px", height: "48px" }}>
                    <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: `1px solid ${C.gold}`, borderTopColor: "transparent", animation: "spin 1s linear infinite" }} />
                    <div style={{ position: "absolute", inset: "5px", borderRadius: "50%", border: `1px solid rgba(200,169,106,0.25)` }} />
                </div>
                <SmallLabel>Preparing your invoice</SmallLabel>
            </div>
        </div>
    );

    return (
        <div style={{ minHeight: "100vh", background: C.bg, color: C.dark, fontFamily: "'Cormorant Garamond', Georgia, serif", overflowX: "hidden", position: "relative" }}>
            <style>{`
        @keyframes fadeUp  { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:none; } }
        @keyframes fadeIn  { from { opacity:0; } to { opacity:1; } }
        @keyframes shimmer { 0%,100% { opacity:.6; } 50% { opacity:1; } }
        @keyframes spin    { to { transform:rotate(360deg); } }

        @media print {
          body * { visibility: hidden !important; }
          .invoice-print-area,
          .invoice-print-area * { visibility: visible !important; }
          .invoice-print-area {
            position: fixed !important;
            inset: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            border-radius: 0 !important;
            box-shadow: none !important;
            border: none !important;
          }
        }
      `}</style>

            <div aria-hidden="true" style={{ position: "fixed", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none", userSelect: "none", zIndex: 0 }}>
                <span style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: "clamp(4rem, 20vw, 14rem)", fontWeight: 900, color: "transparent", WebkitTextStroke: "1px rgba(180,148,90,0.035)", letterSpacing: "0.1em", whiteSpace: "nowrap" }}>
                    INVOICE
                </span>
            </div>

            <div style={{ maxWidth: "820px", margin: "0 auto", padding: "clamp(5rem,10vw,8rem) 1.25rem 6rem", position: "relative", zIndex: 1 }}>
                <div style={{ textAlign: "center", marginBottom: "3.5rem", opacity: visible ? 1 : 0, transition: "opacity 0.6s ease" }}>
                    <CheckMark />
                    <div style={{ marginTop: "1.75rem" }}>
                        <SmallLabel style={{ textAlign: "center", marginBottom: "0.75rem" }}>Order Confirmed</SmallLabel>
                        <h1 style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: "clamp(1.4rem, 5vw, 2.8rem)", fontWeight: 700, letterSpacing: "0.035em", lineHeight: 1.1, color: C.dark, marginBottom: "1.25rem" }}>
                            Thank You
                        </h1>
                        <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: "clamp(0.95rem, 2vw, 1.15rem)", color: "#6B5F52", maxWidth: "30rem", margin: "0 auto 1.75rem" }}>
                            Your sanctuary awaits. We'll send tracking updates as your order makes its way to you.
                        </p>
                        <button onClick={handleCopy} style={{
                            display: "inline-flex", alignItems: "center", gap: "8px",
                            padding: "0.45rem 1.25rem",
                            background: "rgba(200,169,106,0.1)", border: `1px solid rgba(200,169,106,0.3)`,
                            borderRadius: "2rem", cursor: "pointer", transition: "all 0.2s",
                        }}
                            onMouseEnter={e => e.currentTarget.style.background = "rgba(200,169,106,0.18)"}
                            onMouseLeave={e => e.currentTarget.style.background = "rgba(200,169,106,0.1)"}
                        >
                            <span style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: "0.72rem", color: C.goldDeep, letterSpacing: "0.05em" }}>
                                Order #{orderId}
                            </span>
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={C.goldDeep} strokeWidth="2">
                                {copied
                                    ? <polyline points="20 6 9 17 4 12" />
                                    : <><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></>}
                            </svg>
                        </button>
                    </div>
                </div>

                <div ref={printRef} className="invoice-print-area" style={{
                    background: C.darkCard, borderRadius: "20px",
                    border: `1px solid rgba(200,169,106,0.18)`,
                    overflow: "hidden",
                    opacity: visible ? 1 : 0,
                    transform: visible ? "none" : "translateY(24px)",
                    transition: "opacity 0.6s ease 0.2s, transform 0.6s ease 0.2s",
                }}>
                    <div style={{ padding: "1.5rem 2rem", borderBottom: `1px solid rgba(200,169,106,0.15)`, display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
                        <div>
                            <p style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: "0.55rem", letterSpacing: "0.5em", textTransform: "uppercase", color: "rgba(200,169,106,0.5)", marginBottom: "0.4rem" }}>
                                Invoice
                            </p>
                            <h2 style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: "1.3rem", fontWeight: 700, letterSpacing: "0.05em", color: C.gold }}>
                                #{orderId}
                            </h2>
                        </div>
                        <div style={{ textAlign: "right" }}>
                            <p style={{ fontFamily: "sans-serif", fontSize: "0.5rem", letterSpacing: "0.28em", textTransform: "uppercase", color: "rgba(200,169,106,0.45)", marginBottom: "0.35rem" }}>
                                Date
                            </p>
                            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "0.95rem", color: "rgba(232,220,200,0.65)", fontStyle: "italic" }}>
                                {orderDate}
                            </p>
                        </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", borderBottom: `1px solid rgba(200,169,106,0.12)` }}>
                        <div style={{ padding: "1rem 1.5rem", borderRight: `1px solid rgba(200,169,106,0.1)` }}>
                            <p style={{ fontFamily: "sans-serif", fontSize: "0.48rem", letterSpacing: "0.28em", textTransform: "uppercase", color: "rgba(200,169,106,0.45)", marginBottom: "0.4rem" }}>
                                Ship To
                            </p>
                            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "0.95rem", color: "rgba(232,220,200,0.75)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                {fullName}
                            </p>
                        </div>
                        <div style={{ padding: "1rem 1.5rem", borderRight: `1px solid rgba(200,169,106,0.1)` }}>
                            <p style={{ fontFamily: "sans-serif", fontSize: "0.48rem", letterSpacing: "0.28em", textTransform: "uppercase", color: "rgba(200,169,106,0.45)", marginBottom: "0.4rem" }}>
                                Wilaya
                            </p>
                            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "0.95rem", color: "rgba(232,220,200,0.75)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                {wilaya}
                            </p>
                        </div>
                        <div style={{ padding: "1rem 1.5rem", borderRight: `1px solid rgba(200,169,106,0.1)` }}>
                            <p style={{ fontFamily: "sans-serif", fontSize: "0.48rem", letterSpacing: "0.28em", textTransform: "uppercase", color: "rgba(200,169,106,0.45)", marginBottom: "0.4rem" }}>
                                Payment
                            </p>
                            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "0.95rem", color: "rgba(232,220,200,0.75)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                {payLabel}
                            </p>
                        </div>
                        <div style={{ padding: "1rem 1.5rem" }}>
                            <p style={{ fontFamily: "sans-serif", fontSize: "0.48rem", letterSpacing: "0.28em", textTransform: "uppercase", color: "rgba(200,169,106,0.45)", marginBottom: "0.4rem" }}>
                                Schedule
                            </p>
                            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "0.95rem", color: "rgba(232,220,200,0.75)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                {scheduleLabel}
                            </p>
                        </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr auto auto", gap: "1rem", padding: "0.75rem 2rem", borderBottom: `1px solid rgba(200,169,106,0.12)` }}>
                        {["Item", "Qty", "Amount"].map(h => (
                            <span key={h} style={{ fontFamily: "sans-serif", fontSize: "0.46rem", letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(200,169,106,0.4)", textAlign: h === "Amount" ? "right" : undefined }}>
                                {h}
                            </span>
                        ))}
                    </div>

                    <div style={{ padding: "0.5rem 0" }}>
                        {items.length > 0 ? items.map((item, i) => {
                            const price = item.product?.price || item.unit_price || 0;
                            const quantity = item.quantity;
                            const name = item.product?.name || item.product_name || "Item";
                            const img = item.product?.image;
                            const sku = item.product?.sku;
                            return (
                                <div key={i} style={{
                                    display: "grid", gridTemplateColumns: "1fr auto auto", gap: "1rem",
                                    padding: "0.9rem 2rem", alignItems: "center",
                                    borderBottom: i < items.length - 1 ? `1px solid rgba(200,169,106,0.07)` : "none",
                                }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: 0 }}>
                                        <div style={{ width: "38px", height: "38px", borderRadius: "8px", background: "rgba(255,255,255,0.07)", overflow: "hidden", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                            {img ? <img src={img} alt={name} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span style={{ fontSize: "9px", color: "rgba(200,169,106,0.35)" }}>img</span>}
                                        </div>
                                        <div style={{ minWidth: 0 }}>
                                            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1rem", color: "rgba(232,220,200,0.85)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                                {name}
                                            </p>
                                            {sku && (
                                                <p style={{ fontFamily: "sans-serif", fontSize: "0.45rem", letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(200,169,106,0.35)", marginTop: "2px" }}>
                                                    SKU {sku}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "0.95rem", color: "rgba(200,169,106,0.55)", textAlign: "center" }}>
                                        ×{quantity}
                                    </span>
                                    <span style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: "0.85rem", color: C.gold, textAlign: "right", whiteSpace: "nowrap" }}>
                                        {(price * quantity).toLocaleString()} DA
                                    </span>
                                </div>
                            );
                        }) : (
                            <div style={{ padding: "1.5rem 2rem", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid rgba(200,169,106,0.07)` }}>
                                <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1rem", color: "rgba(232,220,200,0.65)", fontStyle: "italic" }}>
                                    Items from your cart
                                </span>
                                <span style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: "0.85rem", color: C.gold }}>
                                    {total.toLocaleString()} DA
                                </span>
                            </div>
                        )}
                    </div>

                    <div style={{ padding: "1.25rem 2rem 2rem", borderTop: `1px solid rgba(200,169,106,0.15)` }}>
                        <div style={{ maxWidth: "300px", marginLeft: "auto" }}>
                            <Row label="Subtotal" value={`${total.toLocaleString()} DA`} />
                            <Row label="Delivery" value="Free" />
                            <Row label="Discount" value="—" />
                            <div style={{ height: "1px", background: "rgba(200,169,106,0.2)", margin: "0.5rem 0 0.75rem" }} />
                            <Row label="Total" value={`${total.toLocaleString()} DA`} bold gold />
                        </div>
                    </div>

                    <div style={{ padding: "1.25rem 2rem", borderTop: `1px solid rgba(200,169,106,0.12)`, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
                        <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: "0.88rem", color: "rgba(200,169,106,0.35)" }}>
                            Thank you for your trust.
                        </p>
                        <span style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: "0.45rem", letterSpacing: "0.5em", textTransform: "uppercase", color: "rgba(200,169,106,0.2)" }}>
                            enter your sanctuary
                        </span>
                    </div>
                </div>

                <div style={{
                    marginTop: "2.5rem", padding: "1.5rem 1.75rem", background: C.card, borderRadius: "16px",
                    border: `1px solid rgba(200,169,106,0.18)`, opacity: visible ? 1 : 0, transform: visible ? "none" : "translateY(16px)",
                    transition: "opacity 0.5s ease 0.4s, transform 0.5s ease 0.4s",
                }}>
                    <SmallLabel style={{ marginBottom: "1.5rem" }}>Order Status</SmallLabel>
                    <div style={{ display: "flex", alignItems: "center" }}>
                        {[
                            { id: "confirmed", label: "Confirmed" },
                            { id: "processing", label: "Processing" },
                            { id: "shipped", label: "Shipped" },
                            { id: "delivered", label: "Delivered" },
                        ].map((step, i) => {
                            const statusMap = { confirmed: 0, processing: 1, shipped: 2, delivered: 3, pending: 0 };
                            const current = statusMap[order?.status?.toLowerCase()] ?? 0;
                            const done = i <= current;
                            const active = i === current;
                            return (
                                <div key={step.id} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", position: "relative" }}>
                                    {i > 0 && (
                                        <div style={{
                                            position: "absolute", top: "11px", right: "50%", left: "-50%", height: "1px",
                                            background: done ? C.gold : "rgba(200,169,106,0.2)",
                                            transition: "background 0.5s",
                                        }} />
                                    )}
                                    <div style={{
                                        width: "22px", height: "22px", borderRadius: "50%", position: "relative", zIndex: 1,
                                        background: done ? C.gold : C.card,
                                        border: `1.5px solid ${done ? C.gold : "rgba(200,169,106,0.3)"}`,
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        boxShadow: active ? `0 0 0 4px rgba(200,169,106,0.15)` : "none",
                                        transition: "all 0.4s",
                                    }}>
                                        {done && (
                                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={C.dark} strokeWidth="3">
                                                <polyline points="20 6 9 17 4 12" />
                                            </svg>
                                        )}
                                    </div>
                                    <p style={{ fontFamily: "sans-serif", fontSize: "0.44rem", letterSpacing: "0.15em", textTransform: "uppercase", color: done ? C.goldDeep : "rgba(158,142,122,0.5)", marginTop: "0.5rem", textAlign: "center" }}>
                                        {step.label}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div style={{
                    display: "flex", gap: "0.75rem", marginTop: "2rem", flexWrap: "wrap",
                    opacity: visible ? 1 : 0, transform: visible ? "none" : "translateY(16px)",
                    transition: "opacity 0.5s ease 0.5s, transform 0.5s ease 0.5s",
                }}>
                    <button onClick={handlePrint} style={{
                        display: "flex", alignItems: "center", gap: "8px", padding: "0.75rem 1.4rem",
                        background: C.dark, border: `1px solid rgba(200,169,106,0.25)`, borderRadius: "2rem",
                        fontFamily: "sans-serif", fontSize: "0.55rem", letterSpacing: "0.25em", textTransform: "uppercase",
                        color: C.gold, cursor: "pointer", transition: "all 0.2s",
                    }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(200,169,106,0.55)"; e.currentTarget.style.background = "#2C1F10"; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(200,169,106,0.25)"; e.currentTarget.style.background = C.dark; }}
                    >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                            <polyline points="6 9 6 2 18 2 18 9" />
                            <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                            <rect x="6" y="14" width="12" height="8" />
                        </svg>
                        Print Invoice
                    </button>
                    <Link to={`/order/tracking/${orderId}/0`} style={{
                        display: "flex", alignItems: "center", gap: "8px", padding: "0.75rem 1.4rem",
                        background: "transparent", border: `1px solid rgba(200,169,106,0.3)`, borderRadius: "2rem",
                        fontFamily: "sans-serif", fontSize: "0.55rem", letterSpacing: "0.25em", textTransform: "uppercase",
                        color: C.muted, textDecoration: "none", cursor: "pointer", transition: "all 0.2s",
                    }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(200,169,106,0.55)"; e.currentTarget.style.color = C.goldDeep; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(200,169,106,0.3)"; e.currentTarget.style.color = C.muted; }}
                    >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                            <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                        </svg>
                        Track Order
                    </Link>
                    <Link to="/furniture" style={{
                        display: "flex", alignItems: "center", gap: "8px", padding: "0.75rem 1.4rem",
                        background: "transparent", border: `1px solid rgba(200,169,106,0.3)`, borderRadius: "2rem",
                        fontFamily: "sans-serif", fontSize: "0.55rem", letterSpacing: "0.25em", textTransform: "uppercase",
                        color: C.muted, textDecoration: "none", cursor: "pointer", transition: "all 0.2s",
                        marginLeft: "auto",
                    }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(200,169,106,0.55)"; e.currentTarget.style.color = C.goldDeep; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(200,169,106,0.3)"; e.currentTarget.style.color = C.muted; }}
                    >
                        Continue Shopping
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                            <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                    </Link>
                </div>
            </div>

            <div style={{ padding: "0 1.5rem 4rem", position: "relative", zIndex: 1 }}>
                <GoldRule />
                <div style={{ display: "flex", justifyContent: "center", marginTop: "2rem" }}>
                    <span style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: "0.52rem", letterSpacing: "0.5em", textTransform: "uppercase", color: "rgba(200,169,106,0.25)" }}>
                        enter your sanctuary
                    </span>
                </div>
            </div>
        </div>
    );
}