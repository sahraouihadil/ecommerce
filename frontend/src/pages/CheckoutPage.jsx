import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const WILAYAS = [
  "Constantine","Mila", "Guelma", "Oum El Bouaghi", "Skikda", "Batna", "Sétif",
  "Jijel", "Annaba", "Bordj Bou Arréridj", "Khenchela", "Souk Ahras",
  "Béjaïa", "Tébessa",
];

const PAYMENT_METHODS = {
  local: [
    { id: "cod", icon: "local_shipping", label: "Cash on Delivery", sub: "Local Only", hasForm: false },
    { id: "cib", icon: "credit_card", label: "CIB / Card", sub: "Visa/Mastercard", hasForm: true },
    { id: "pickup", icon: "storefront", label: "Self Pickup", sub: "Algiers Showroom", hasForm: false },
  ]
};

const CSS = `
  /* ── Tokens ── */
  .checkout-root {
    --co-bg:        var(--color-cream,   #F5F0E8);
    --co-surface:   var(--color-surface, #EDE8DF);
    --co-card:      #2C2016;
    --co-text:      #1A1208;
    --co-muted:     #7A7060;
    --co-primary:   #1A1208;
    --co-accent:    #C4A96B;
    --co-success:   #3D8B5E;
    --co-border:    rgba(0,0,0,0.08);
    --co-input-bg:  rgba(255,255,255,0.7);
    --co-radius-sm: 8px;
    --co-radius-md: 12px;
    --co-radius-lg: 16px;
    --co-shadow-sm:         0 1px 4px rgba(0,0,0,0.06);
    --co-shadow-md:         0 4px 24px rgba(0,0,0,0.08);
    --co-shadow-lg:         0 8px 40px rgba(0,0,0,0.14);
    --co-shadow-xl:         0 16px 56px rgba(0,0,0,0.18);
    --co-shadow-card-hover: 0 8px 32px rgba(0,0,0,0.13);
    --co-shadow-accent:     0 0 0 3px rgba(196,169,107,0.20);
    --co-dur-fast:    150ms;
    --co-dur-base:    220ms;
    --co-dur-slow:    380ms;
    --co-ease-out:    cubic-bezier(0.22,1,0.36,1);
    --co-ease-spring: cubic-bezier(0.34,1.56,0.64,1);
    --space-1:4px;  --space-2:8px;   --space-3:12px; --space-4:16px;
    --space-5:20px; --space-6:24px;  --space-8:32px; --space-10:40px;
    --space-12:48px;--space-16:64px;
    --font-serif: Georgia, serif;
    --font-sans:  system-ui, sans-serif;
    min-height: 100vh;
    background: var(--co-bg);
    color: var(--co-text);
    font-family: var(--font-sans);
  }

  /* ── Keyframes ── */
  @keyframes co-fade-up {
    from { opacity: 0; transform: translateY(18px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes co-fade-in-right {
    from { opacity: 0; transform: translateX(24px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes co-spin   { to { transform: rotate(360deg); } }
  @keyframes co-fadeIn {
    from { opacity: 0; transform: translateY(6px); }
    to   { opacity: 1; transform: none; }
  }

  .co-anim-section {
    animation: co-fade-up var(--co-dur-slow) var(--co-ease-out) both;
    animation-delay: var(--_delay, 0ms);
  }
  .co-anim-aside {
    animation: co-fade-in-right var(--co-dur-slow) var(--co-ease-out) both;
    animation-delay: 60ms;
  }

  /* ── Loading ── */
  .checkout-loading {
    min-height: 100vh; background: var(--co-bg);
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    gap: var(--space-4); color: var(--co-muted);
  }
  .checkout-spinner {
    width: 2rem; height: 2rem;
    border: 2px solid var(--co-accent); border-top-color: transparent;
    border-radius: 50%;
    animation: co-spin 0.7s linear infinite;
  }

  /* ── Layout ── */
  .checkout-main { max-width: 1200px; margin: 0 auto; padding: 9rem var(--space-6) var(--space-16); }
  .checkout-header { margin-bottom: var(--space-12); }
  .checkout-eyebrow {
    font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.2em;
    font-weight: 600; color: var(--co-muted); margin-bottom: var(--space-2);
  }
  .checkout-title {
    font-family: var(--font-serif);
    font-size: clamp(2rem, 5vw, 3.5rem);
    font-weight: 700; letter-spacing: -0.02em; line-height: 1;
  }
  .checkout-layout { display: grid; grid-template-columns: 1fr; gap: var(--space-8); }
  @media (min-width: 1024px) {
    .checkout-layout { grid-template-columns: 1fr 380px; align-items: start; }
  }
  .checkout-left { display: flex; flex-direction: column; gap: var(--space-6); }

  /* ── Sections ── */
  .checkout-section {
    background: white;
    border-radius: var(--co-radius-lg);
    padding: var(--space-8);
    box-shadow: var(--co-shadow-md);
    transition:
      box-shadow var(--co-dur-base) var(--co-ease-out),
      transform  var(--co-dur-base) var(--co-ease-out);
  }
  .checkout-section:hover {
    box-shadow: var(--co-shadow-card-hover);
    transform: translateY(-2px);
  }
  .section-heading-row {
    display: flex; align-items: center;
    gap: var(--space-3); margin-bottom: var(--space-6); flex-wrap: wrap;
  }
  .section-number {
    width: 2rem; height: 2rem; background: var(--co-primary); color: white;
    border-radius: 50%; display: flex; align-items: center; justify-content: center;
    font-size: 0.875rem; font-weight: 700; flex-shrink: 0;
  }
  .section-title { font-family: var(--font-serif); font-size: 1.125rem; font-weight: 700; flex: 1; }

  /* ── Form ── */
  .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-4); }
  @media (max-width: 600px) { .form-grid { grid-template-columns: 1fr; } }
  .form-input {
    width: 100%; height: 52px; padding: 0 var(--space-4);
    background: var(--co-input-bg); border: 1.5px solid var(--co-border);
    border-radius: var(--co-radius-sm); font-size: 0.875rem;
    font-family: var(--font-sans); color: var(--co-text);
    box-sizing: border-box; outline: none;
    transition:
      border-color var(--co-dur-fast) var(--co-ease-out),
      box-shadow   var(--co-dur-fast) var(--co-ease-out),
      transform    var(--co-dur-fast) var(--co-ease-out);
  }
  .form-input::placeholder { color: var(--co-muted); }
  .form-input:focus {
    border-color: var(--co-accent);
    box-shadow: var(--co-shadow-accent);
    transform: translateY(-1px);
  }
  .form-input-full { grid-column: 1 / -1; }
  .form-select-wrapper { position: relative; }
  .form-select { appearance: none; -webkit-appearance: none; padding-right: 2.5rem; cursor: pointer; }
  .select-chevron {
    position: absolute; right: var(--space-3); top: 50%; transform: translateY(-50%);
    font-size: 1.25rem; color: var(--co-muted); pointer-events: none;
  }

  /* ── Payment cards ── */
  .payment-methods-grid {
    display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: var(--space-3); margin-bottom: var(--space-5);
  }
  .payment-card {
    position: relative;
    display: flex; flex-direction: column; align-items: center; gap: var(--space-2);
    padding: var(--space-5) var(--space-3);
    background: var(--co-surface); border: 1.5px solid var(--co-border);
    border-radius: var(--co-radius-md); cursor: pointer;
    box-shadow: var(--co-shadow-sm); font-family: var(--font-sans);
    transition:
      border-color var(--co-dur-base) var(--co-ease-out),
      box-shadow   var(--co-dur-base) var(--co-ease-out),
      background   var(--co-dur-base) var(--co-ease-out),
      transform    var(--co-dur-base) var(--co-ease-spring);
  }
  .payment-card:hover {
    border-color: var(--co-accent); background: rgba(196,169,107,0.05);
    box-shadow: var(--co-shadow-md); transform: translateY(-3px);
  }
  .payment-card-active {
    border-color: var(--co-accent); background: rgba(196,169,107,0.08);
    box-shadow: var(--co-shadow-md), var(--co-shadow-accent); transform: translateY(-2px);
  }
  .payment-icon { font-size: 1.5rem; color: var(--co-muted); }
  .payment-card-active .payment-icon { color: var(--co-accent); }
  .payment-label { font-size: 0.8125rem; font-weight: 600; color: var(--co-text); text-align: center; }
  .payment-sub   { font-size: 0.6875rem; color: var(--co-muted); text-align: center; }
  .payment-check { font-size: 1rem; color: var(--co-accent); }

  .cib-form {
    border-top: 1px solid var(--co-border); padding-top: var(--space-5);
    display: flex; flex-direction: column; gap: var(--space-4);
    animation: co-fadeIn var(--co-dur-base) var(--co-ease-out);
  }
  .cib-form-row { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-4); }

  /* ── Delivery schedule ── */
  .sched-tabs {
    display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: var(--space-3); margin-bottom: var(--space-5);
  }
  .sched-tab {
    position: relative;
    display: flex; flex-direction: column; align-items: center; gap: var(--space-1);
    padding: var(--space-5) var(--space-3);
    background: var(--co-surface); border: 1.5px solid var(--co-border);
    border-radius: var(--co-radius-md); cursor: pointer;
    box-shadow: var(--co-shadow-sm); font-family: var(--font-sans);
    transition:
      border-color var(--co-dur-base) var(--co-ease-out),
      box-shadow   var(--co-dur-base) var(--co-ease-out),
      background   var(--co-dur-base) var(--co-ease-out),
      transform    var(--co-dur-base) var(--co-ease-spring);
  }
  .sched-tab:hover {
    border-color: var(--co-accent); background: rgba(196,169,107,0.05);
    box-shadow: var(--co-shadow-md); transform: translateY(-3px);
  }
  .sched-tab-active {
    border-color: var(--co-accent); background: rgba(196,169,107,0.08);
    box-shadow: var(--co-shadow-md), var(--co-shadow-accent); transform: translateY(-2px);
  }
  .sched-tab-icon { font-size: 1.5rem; color: var(--co-muted); }
  .sched-tab-active .sched-tab-icon { color: var(--co-accent); }
  .sched-tab-label { font-size: 0.8125rem; font-weight: 600; color: var(--co-text); }
  .sched-tab-sub   { font-size: 0.6875rem; color: var(--co-muted); }
  .sched-check     { font-size: 1rem; color: var(--co-accent); }

  .sched-detail-panel {
    margin-top: var(--space-5); padding-top: var(--space-5);
    border-top: 1px solid var(--co-border);
    display: flex; flex-direction: column; gap: var(--space-3);
    animation: co-fadeIn var(--co-dur-base) var(--co-ease-out);
  }
  .sched-label {
    font-size: 0.75rem; font-weight: 600;
    text-transform: uppercase; letter-spacing: 0.1em; color: var(--co-muted);
  }
  .dow-grid { display: flex; flex-wrap: wrap; gap: var(--space-2); }
  .dow-btn {
    padding: 8px 16px; border-radius: 999px;
    border: 1.5px solid var(--co-border); background: var(--co-surface);
    font-size: 0.8125rem; font-weight: 600; color: var(--co-muted);
    cursor: pointer; font-family: var(--font-sans);
    box-shadow: var(--co-shadow-sm);
    transition:
      border-color var(--co-dur-fast) var(--co-ease-out),
      box-shadow   var(--co-dur-fast) var(--co-ease-out),
      background   var(--co-dur-fast) var(--co-ease-out),
      color        var(--co-dur-fast) var(--co-ease-out),
      transform    var(--co-dur-fast) var(--co-ease-spring);
  }
  .dow-btn:hover {
    border-color: var(--co-accent); color: var(--co-text);
    box-shadow: var(--co-shadow-md); transform: translateY(-2px);
  }
  .dow-btn-active {
    background: var(--co-primary); border-color: var(--co-primary); color: white;
    box-shadow: var(--co-shadow-md); transform: translateY(-1px);
  }
  .time-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-3); }
  @media (max-width: 480px) { .time-grid { grid-template-columns: 1fr; } }
  .time-btn {
    display: flex; flex-direction: column; align-items: center; gap: 4px;
    padding: var(--space-4) var(--space-2);
    border-radius: var(--co-radius-md); border: 1.5px solid var(--co-border);
    background: var(--co-surface); cursor: pointer; font-family: var(--font-sans);
    box-shadow: var(--co-shadow-sm);
    transition:
      border-color var(--co-dur-base) var(--co-ease-out),
      box-shadow   var(--co-dur-base) var(--co-ease-out),
      background   var(--co-dur-base) var(--co-ease-out),
      transform    var(--co-dur-base) var(--co-ease-spring);
  }
  .time-btn:hover {
    border-color: var(--co-accent);
    box-shadow: var(--co-shadow-md); transform: translateY(-3px);
  }
  .time-btn-active {
    border-color: var(--co-accent); background: rgba(196,169,107,0.08);
    box-shadow: var(--co-shadow-md), var(--co-shadow-accent); transform: translateY(-2px);
  }
  .time-icon { font-size: 1.25rem; color: var(--co-muted); }
  .time-btn-active .time-icon { color: var(--co-accent); }
  .time-label { font-size: 0.8125rem; font-weight: 600; color: var(--co-text); }
  .time-sub   { font-size: 0.6875rem; color: var(--co-muted); }

  /* ── Items (mobile) ── */
  .checkout-items-section { display: block; }
  @media (min-width: 1024px) { .checkout-items-section { display: none; } }
  .items-list { display: flex; flex-direction: column; }
  .item-row {
    display: flex; align-items: center; gap: var(--space-4);
    padding: var(--space-4) 0; border-bottom: 1px solid var(--co-border);
    transition: transform var(--co-dur-fast) var(--co-ease-out);
  }
  .item-row:last-child { border-bottom: none; }
  .item-row:hover { transform: translateX(4px); }
  .item-image {
    width: 56px; height: 56px; border-radius: var(--co-radius-sm);
    background: var(--co-surface); overflow: hidden; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    box-shadow: var(--co-shadow-sm);
  }
  .item-image img { width: 100%; height: 100%; object-fit: cover; }
  .item-info { flex: 1; }
  .item-name  { font-size: 0.875rem; font-weight: 600; font-family: var(--font-serif); }
  .item-qty   { font-size: 0.75rem; color: var(--co-muted); margin-top: 2px; }
  .item-price { font-size: 0.875rem; font-weight: 700; font-family: var(--font-serif); white-space: nowrap; }

  /* ── Aside / summary card ── */
  .checkout-aside { width: 100%; }
  .summary-card {
    position: sticky; top: 7rem;
    background: var(--co-card); color: #E8DCC8;
    border-radius: var(--co-radius-lg); padding: var(--space-8);
    box-shadow: var(--co-shadow-lg);
    transition: box-shadow var(--co-dur-base) var(--co-ease-out);
  }
  .summary-card:hover { box-shadow: var(--co-shadow-xl); }
  .summary-title {
    font-family: var(--font-serif); font-size: 1.125rem; font-weight: 700;
    color: var(--co-accent); text-transform: uppercase; letter-spacing: 0.1em;
    margin-bottom: var(--space-6);
  }
  .summary-items { display: flex; flex-direction: column; gap: var(--space-3); margin-bottom: var(--space-5); }
  .summary-item-row { display: flex; align-items: center; gap: var(--space-3); }
  .summary-item-img {
    width: 36px; height: 36px; border-radius: var(--co-radius-sm);
    background: rgba(255,255,255,0.08); overflow: hidden; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    box-shadow: var(--co-shadow-sm);
  }
  .summary-item-img img { width: 100%; height: 100%; object-fit: cover; }
  .summary-item-name {
    flex: 1; font-size: 0.8125rem; color: rgba(232,220,200,0.85);
    overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  }
  .summary-item-price { font-size: 0.875rem; font-weight: 700; white-space: nowrap; }
  .summary-meta {
    border-top: 1px solid rgba(196,169,107,0.25); padding-top: var(--space-5);
    display: flex; flex-direction: column; gap: var(--space-3); margin-bottom: var(--space-5);
  }
  .summary-meta-row {
    display: flex; justify-content: space-between;
    font-size: 0.875rem; color: rgba(232,220,200,0.7);
  }
  .summary-free { color: #5DC88A; font-weight: 600; font-size: 0.75rem; text-transform: uppercase; }
  .summary-payment-label { color: var(--co-accent); font-size: 0.75rem; }
  .summary-total {
    display: flex; justify-content: space-between; align-items: baseline;
    font-family: var(--font-serif); font-weight: 700; font-size: 1.1rem;
    border-top: 1px solid rgba(196,169,107,0.25);
    padding-top: var(--space-5); margin-bottom: var(--space-6); color: white;
  }
  .summary-total span:last-child { font-size: 1.4rem; color: var(--co-accent); }

  .btn-checkout {
    width: 100%; height: 52px;
    background: var(--co-accent); color: var(--co-primary);
    border: none; border-radius: 999px;
    font-size: 0.875rem; font-weight: 700;
    text-transform: uppercase; letter-spacing: 0.1em;
    cursor: pointer; box-shadow: var(--co-shadow-md);
    transition:
      opacity    var(--co-dur-fast)   var(--co-ease-out),
      transform  var(--co-dur-base)   var(--co-ease-spring),
      box-shadow var(--co-dur-base)   var(--co-ease-out);
  }
  .btn-checkout:hover:not(:disabled) {
    opacity: 0.90; transform: translateY(-2px) scale(1.02);
    box-shadow: var(--co-shadow-lg);
  }
  .btn-checkout:active:not(:disabled) {
    transform: translateY(0) scale(0.98);
    box-shadow: var(--co-shadow-sm);
  }
  .btn-checkout:disabled { opacity: 0.4; cursor: not-allowed; }

  .summary-terms {
    text-align: center; font-size: 0.6875rem;
    color: rgba(232,220,200,0.45); margin-top: var(--space-5); line-height: 1.6;
  }
  .summary-terms a { color: rgba(232,220,200,0.7); text-decoration: underline; }
  .summary-terms a:hover { color: var(--co-accent); }
`;

export function CheckoutPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const navigate = useNavigate();

  const [shippingMode, setShippingMode] = useState("local");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [wilaya, setWilaya] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [streetAddress, setStreetAddress] = useState("");
  const [notes, setNotes] = useState("");

  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");

  const [deliveryType, setDeliveryType] = useState("anytime");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [deliveryDow, setDeliveryDow] = useState("");
  const [deliveryTime, setDeliveryTime] = useState("");

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const res = await api.get("/api/cart");
        setItems(res.data);
        if (res.data.length === 0) navigate("/cart");
      } catch {
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };
    fetchCart();
  }, [navigate]);

  useEffect(() => {
    const methods = PAYMENT_METHODS[shippingMode];
    if (!methods.find((m) => m.id === paymentMethod)) {
      setPaymentMethod(methods[0].id);
    }
  }, [shippingMode]);

  const total = items.reduce((sum, i) => sum + (i.product?.price || 0) * i.quantity, 0);
  const activePayment = PAYMENT_METHODS[shippingMode].find((m) => m.id === paymentMethod);
  const isLocalValid = fullName && phone && wilaya && city && streetAddress;
  const isIntlValid = fullName && phone && country && city && streetAddress;
  const addressValid = shippingMode === "local" ? isLocalValid : isIntlValid;
  const cibValid = paymentMethod !== "cib" || (cardNumber.replace(/\s/g, "").length === 16 && cardExpiry && cardCvv);
  const canSubmit = addressValid && cibValid && !placing;

  const handlePlaceOrder = async () => {
    if (!canSubmit) return;
    setPlacing(true);
    try {
      const res = await api.post("/api/orders", {
        fullName, phone, wilaya, city, country, streetAddress, notes,
        paymentMethod, shippingMode,
        ...(paymentMethod === "cib" ? { cardNumber, cardExpiry, cardCvv } : {}),
        deliveryType,
        ...(deliveryType === "specific_date" ? { deliveryDate } : {}),
        ...(deliveryType === "day_of_week" ? { deliveryDow } : {}),
        ...(deliveryType !== "anytime" ? { deliveryTime } : {}),
      });
      navigate("/order", { state: { orderId: res.data.order_id, total: res.data.total } });
    } catch (err) {
      alert(err?.response?.data?.detail || "Failed to place order");
    } finally {
      setPlacing(false);
    }
  };

  if (loading) return (
    <div className="checkout-root">
      <style>{CSS}</style>
      <div className="checkout-loading">
        <div className="checkout-spinner" />
        <p>Loading checkout...</p>
      </div>
    </div>
  );

  return (
    <div className="checkout-root">
      <style>{CSS}</style>

      <main className="checkout-main">

        <div className="checkout-header">
          <p className="checkout-eyebrow">Complete your order</p>
          <h1 className="checkout-title">Checkout</h1>
        </div>

        <div className="checkout-layout">

          {/* ─── LEFT COLUMN ─── */}
          <div className="checkout-left">

            {/* SECTION 1 — Delivery Address */}
            <section className="checkout-section co-anim-section" style={{ "--_delay": "0ms" }}>
              <div className="section-heading-row">
                <div className="section-number">1</div>
                <h2 className="section-title">Delivery Address</h2>
              </div>
              <div className="form-grid">
                <input className="form-input" type="text" placeholder="Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
                <input className="form-input" type="tel" placeholder={shippingMode === "local" ? "Phone (e.g. 0550 123 456)" : "Phone (e.g. +213 550 123 456)"} value={phone} onChange={(e) => setPhone(e.target.value)} />
                {shippingMode === "local" ? (
                  <div className="form-select-wrapper">
                    <select className="form-input form-select" value={wilaya} onChange={(e) => setWilaya(e.target.value)}>
                      <option value="">Select Wilaya</option>
                      {WILAYAS.map((w) => <option key={w} value={w}>{w}</option>)}
                    </select>
                    <span className="select-chevron material-symbols-outlined">expand_more</span>
                  </div>
                ) : (
                  <input className="form-input" type="text" placeholder="Country" value={country} onChange={(e) => setCountry(e.target.value)} />
                )}
                <input className="form-input" type="text" placeholder={shippingMode === "local" ? "City / Municipality (Commune)" : "City / Municipality"} value={city} onChange={(e) => setCity(e.target.value)} />
                <input className="form-input form-input-full" type="text" placeholder="Street Address" value={streetAddress} onChange={(e) => setStreetAddress(e.target.value)} />
                <input className="form-input form-input-full" type="text" placeholder="Additional Notes (optional)" value={notes} onChange={(e) => setNotes(e.target.value)} />
              </div>
            </section>

            {/* SECTION 2 — Payment */}
            <section className="checkout-section co-anim-section" style={{ "--_delay": "80ms" }}>
              <div className="section-heading-row">
                <div className="section-number">2</div>
                <h2 className="section-title">Payment Method</h2>
              </div>
              <div className="payment-methods-grid">
                {PAYMENT_METHODS[shippingMode].map((method) => (
                  <button
                    key={method.id}
                    className={`payment-card ${paymentMethod === method.id ? "payment-card-active" : ""}`}
                    onClick={() => setPaymentMethod(method.id)}
                  >
                    <span className="material-symbols-outlined payment-icon">{method.icon}</span>
                    <span className="payment-label">{method.label}</span>
                    <span className="payment-sub">{method.sub}</span>
                    {paymentMethod === method.id && (
                      <span className="material-symbols-outlined payment-check">check_circle</span>
                    )}
                  </button>
                ))}
              </div>
              {activePayment?.hasForm && (
                <div className="cib-form">
                  <input
                    className="form-input form-input-full" type="text" placeholder="Card Number (16 digits)" maxLength={19} value={cardNumber}
                    onChange={(e) => { const v = e.target.value.replace(/\D/g, "").slice(0, 16); setCardNumber(v.replace(/(.{4})/g, "$1 ").trim()); }}
                  />
                  <div className="cib-form-row">
                    <input className="form-input" type="text" placeholder="MM/YY" maxLength={5} value={cardExpiry}
                      onChange={(e) => { let v = e.target.value.replace(/\D/g, "").slice(0, 4); if (v.length > 2) v = v.slice(0, 2) + "/" + v.slice(2); setCardExpiry(v); }}
                    />
                    <input className="form-input" type="text" placeholder="CVV" maxLength={3} value={cardCvv} onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, "").slice(0, 3))} />
                  </div>
                </div>
              )}
            </section>

            {/* SECTION 3 — Delivery Schedule */}
            <section className="checkout-section co-anim-section" style={{ "--_delay": "160ms" }}>
              <div className="section-heading-row">
                <div className="section-number">3</div>
                <h2 className="section-title">Delivery Schedule</h2>
              </div>
              <div className="sched-tabs">
                {[
                  { id: "anytime", icon: "bolt", label: "Any Time", sub: "We'll deliver ASAP" },
                  { id: "specific_date", icon: "calendar_month", label: "Specific Date", sub: "Pick a date" },
                  { id: "day_of_week", icon: "date_range", label: "Day of Week", sub: "Pick a weekday" },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    className={`sched-tab ${deliveryType === opt.id ? "sched-tab-active" : ""}`}
                    onClick={() => setDeliveryType(opt.id)}
                  >
                    <span className="material-symbols-outlined sched-tab-icon">{opt.icon}</span>
                    <span className="sched-tab-label">{opt.label}</span>
                    <span className="sched-tab-sub">{opt.sub}</span>
                    {deliveryType === opt.id && (
                      <span className="material-symbols-outlined sched-check">check_circle</span>
                    )}
                  </button>
                ))}
              </div>
              {deliveryType === "specific_date" && (
                <div className="sched-detail-panel" key="specific_date">
                  <label className="sched-label">Choose a date</label>
                  <input
                    className="form-input" type="date"
                    min={new Date(Date.now() + 86400000).toISOString().split("T")[0]}
                    value={deliveryDate} onChange={(e) => setDeliveryDate(e.target.value)}
                    style={{ maxWidth: 220 }}
                  />
                </div>
              )}
              {deliveryType === "day_of_week" && (
                <div className="sched-detail-panel" key="day_of_week">
                  <label className="sched-label">Choose a weekday</label>
                  <div className="dow-grid">
                    {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((d) => (
                      <button key={d} className={`dow-btn ${deliveryDow === d ? "dow-btn-active" : ""}`} onClick={() => setDeliveryDow(d)}>
                        {d.slice(0, 3)}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {deliveryType !== "anytime" && (
                <div className="sched-detail-panel" key="time">
                  <label className="sched-label">Preferred time</label>
                  <div className="time-grid">
                    {[
                      { id: "morning", icon: "wb_sunny", label: "Morning", sub: "8 AM – 12 PM" },
                      { id: "afternoon", icon: "partly_cloudy_day", label: "Afternoon", sub: "12 PM – 5 PM" },
                      { id: "evening", icon: "nights_stay", label: "Evening", sub: "5 PM – 9 PM" },
                    ].map((t) => (
                      <button key={t.id} className={`time-btn ${deliveryTime === t.id ? "time-btn-active" : ""}`} onClick={() => setDeliveryTime(t.id)}>
                        <span className="material-symbols-outlined time-icon">{t.icon}</span>
                        <span className="time-label">{t.label}</span>
                        <span className="time-sub">{t.sub}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </section>

            {/* Items (mobile only) */}
            <section className="checkout-section checkout-items-section co-anim-section" style={{ "--_delay": "240ms" }}>
              <h2 className="section-title" style={{ marginBottom: "var(--space-4)" }}>Your Items</h2>
              <div className="items-list">
                {items.map((item) => (
                  <div key={item.id} className="item-row">
                    <div className="item-image">
                      {item.product?.image ? <img src={item.product.image} alt={item.product.name} /> : <span className="material-symbols-outlined">image</span>}
                    </div>
                    <div className="item-info">
                      <p className="item-name">{item.product?.name ?? "Product"}</p>
                      <p className="item-qty">Qty: {item.quantity}</p>
                    </div>
                    <p className="item-price">{((item.product?.price || 0) * item.quantity).toLocaleString()} DA</p>
                  </div>
                ))}
              </div>
            </section>

          </div>

          {/* ─── RIGHT COLUMN — Summary ─── */}
          <aside className="checkout-aside co-anim-aside">
            <div className="summary-card">
              <h3 className="summary-title">Order Summary</h3>
              <div className="summary-items">
                {items.map((item) => (
                  <div key={item.id} className="summary-item-row">
                    <div className="summary-item-img">
                      {item.product?.image ? <img src={item.product.image} alt={item.product.name} /> : <span className="material-symbols-outlined" style={{ fontSize: "1rem" }}>image</span>}
                    </div>
                    <span className="summary-item-name">{item.quantity}× {item.product?.name ?? "Item"}</span>
                    <span className="summary-item-price">{((item.product?.price || 0) * item.quantity).toLocaleString()} DZD</span>
                  </div>
                ))}
              </div>
              <div className="summary-meta">
                <div className="summary-meta-row"><span>Subtotal</span><span>{total.toLocaleString()} DZD</span></div>
                <div className="summary-meta-row"><span>Delivery</span><span className="summary-free">FREE</span></div>
                {paymentMethod && (
                  <div className="summary-meta-row">
                    <span>Payment</span>
                    <span className="summary-payment-label">{PAYMENT_METHODS[shippingMode].find(m => m.id === paymentMethod)?.label}</span>
                  </div>
                )}
                <div className="summary-meta-row">
                  <span>Schedule</span>
                  <span className="summary-payment-label">
                    {deliveryType === "anytime" ? "ASAP" : deliveryType === "specific_date" ? deliveryDate || "—" : deliveryDow || "—"}
                    {deliveryType !== "anytime" && deliveryTime ? `, ${deliveryTime}` : ""}
                  </span>
                </div>
              </div>
              <div className="summary-total">
                <span>Total</span>
                <span>{total.toLocaleString()} DZD</span>
              </div>
              <button className="btn-checkout" onClick={handlePlaceOrder} disabled={!canSubmit}>
                {placing ? "Placing Order..." : paymentMethod === "cod" ? "Confirm Order" : "Pay Now"}
              </button>
              <p className="summary-terms">
                By completing your purchase you agree to our <a href="#">Terms</a> and <a href="#">Privacy Policy</a>.
              </p>
            </div>
          </aside>

        </div>
      </main>
    </div>
  );
}