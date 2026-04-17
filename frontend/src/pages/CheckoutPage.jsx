import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const WILAYAS = [
  "Adrar", "Chlef", "Laghouat", "Oum El Bouaghi", "Batna", "Béjaïa", "Biskra", "Béchar",
  "Blida", "Bouira", "Tamanrasset", "Tébessa", "Tlemcen", "Tiaret", "Tizi Ouzou", "Alger",
  "Djelfa", "Jijel", "Sétif", "Saïda", "Skikda", "Sidi Bel Abbès", "Annaba", "Guelma",
  "Constantine", "Médéa", "Mostaganem", "M'Sila", "Mascara", "Ouargla", "Oran", "El Bayadh",
  "Illizi", "Bordj Bou Arréridj", "Boumerdès", "El Tarf", "Tindouf", "Tissemsilt", "El Oued",
  "Khenchela", "Souk Ahras", "Tipaza", "Mila", "Aïn Defla", "Naâma", "Aïn Témouchent",
  "Ghardaïa", "Relizane", "Timimoun", "Bordj Badji Mokhtar", "Ouled Djellal", "Béni Abbès",
  "In Salah", "In Guezzam", "Touggourt", "Djanet", "El M'Ghair", "El Meniaa",
];

const PAYMENT_METHODS = {
  local: [
    { id: "cod", icon: "local_shipping", label: "Cash on Delivery", sub: "Local Only", hasForm: false },
    { id: "cib", icon: "credit_card", label: "CIB / Card", sub: "Visa/Mastercard", hasForm: true },
    { id: "paypal", icon: "account_balance_wallet", label: "PayPal", sub: "Secure Checkout", hasForm: false },
    { id: "pickup", icon: "storefront", label: "Self Pickup", sub: "Algiers Showroom", hasForm: false },
  ],
  international: [
    { id: "cib", icon: "credit_card", label: "CIB / Card", sub: "Visa/Mastercard", hasForm: true },
    { id: "paypal", icon: "account_balance_wallet", label: "PayPal", sub: "Secure Checkout", hasForm: false },
  ],
};

export function CheckoutPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const navigate = useNavigate();

  // Shipping mode
  const [shippingMode, setShippingMode] = useState("local"); // "local" | "international"

  // Shipping fields
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [wilaya, setWilaya] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [streetAddress, setStreetAddress] = useState("");
  const [notes, setNotes] = useState("");

  // Payment
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");

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

  // When shipping mode changes, reset payment to first available
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
      });
      navigate("/order", {
        state: { orderId: res.data.order_id, total: res.data.total },
      });
    } catch (err) {
      alert(err?.response?.data?.detail || "Failed to place order");
    } finally {
      setPlacing(false);
    }
  };

  if (loading) return (
    <div className="checkout-loading">
      <div className="checkout-spinner" />
      <p>Loading checkout...</p>
    </div>
  );

  return (
    <div className="checkout-root">
      <main className="checkout-main">

        {/* Header */}
        <div className="checkout-header">
          <p className="checkout-eyebrow">Complete your order</p>
          <h1 className="checkout-title">Checkout</h1>
        </div>

        <div className="checkout-layout">

          {/* ─── LEFT COLUMN ─── */}
          <div className="checkout-left">

            {/* ── SECTION 1: Delivery Address ── */}
            <section className="checkout-section">
              <div className="section-heading-row">
                <div className="section-number">1</div>
                <h2 className="section-title">Delivery Address</h2>

                {/* Local / International toggle */}
                <div className="shipping-toggle">
                  <button
                    className={`toggle-btn ${shippingMode === "local" ? "toggle-active" : ""}`}
                    onClick={() => setShippingMode("local")}
                  >
                    🇩🇿 Local Shipping
                  </button>
                  <button
                    className={`toggle-btn ${shippingMode === "international" ? "toggle-active toggle-intl" : ""}`}
                    onClick={() => setShippingMode("international")}
                  >
                    🌍 International
                  </button>
                </div>
              </div>

              <div className="form-grid">
                {/* Row 1: Full Name + Phone */}
                <input
                  className="form-input"
                  type="text"
                  placeholder="Full Name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
                <input
                  className="form-input"
                  type="tel"
                  placeholder={shippingMode === "local" ? "Phone (e.g. 0550 123 456)" : "Phone (e.g. +213 550 123 456)"}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />

                {/* Row 2: Wilaya (local) or Country (intl) + City */}
                {shippingMode === "local" ? (
                  <div className="form-select-wrapper">
                    <select
                      className="form-input form-select"
                      value={wilaya}
                      onChange={(e) => setWilaya(e.target.value)}
                    >
                      <option value="">Select Wilaya</option>
                      {WILAYAS.map((w) => (
                        <option key={w} value={w}>{w}</option>
                      ))}
                    </select>
                    <span className="select-chevron material-symbols-outlined">expand_more</span>
                  </div>
                ) : (
                  <input
                    className="form-input"
                    type="text"
                    placeholder="Country"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                  />
                )}
                <input
                  className="form-input"
                  type="text"
                  placeholder={shippingMode === "local" ? "City / Municipality (Commune)" : "City / Municipality"}
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />

                {/* Row 3: Street Address (full width) */}
                <input
                  className="form-input form-input-full"
                  type="text"
                  placeholder="Street Address"
                  value={streetAddress}
                  onChange={(e) => setStreetAddress(e.target.value)}
                />

                {/* Row 4: Notes (full width) */}
                <input
                  className="form-input form-input-full"
                  type="text"
                  placeholder="Additional Notes (optional)"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </section>

            {/* ── SECTION 2: Payment Method ── */}
            <section className="checkout-section">
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

              {/* CIB Card Form */}
              {activePayment?.hasForm && (
                <div className="cib-form">
                  <input
                    className="form-input form-input-full"
                    type="text"
                    placeholder="Card Number (16 digits)"
                    maxLength={19}
                    value={cardNumber}
                    onChange={(e) => {
                      const v = e.target.value.replace(/\D/g, "").slice(0, 16);
                      setCardNumber(v.replace(/(.{4})/g, "$1 ").trim());
                    }}
                  />
                  <div className="cib-form-row">
                    <input
                      className="form-input"
                      type="text"
                      placeholder="MM/YY"
                      maxLength={5}
                      value={cardExpiry}
                      onChange={(e) => {
                        let v = e.target.value.replace(/\D/g, "").slice(0, 4);
                        if (v.length > 2) v = v.slice(0, 2) + "/" + v.slice(2);
                        setCardExpiry(v);
                      }}
                    />
                    <input
                      className="form-input"
                      type="text"
                      placeholder="CVV"
                      maxLength={3}
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, "").slice(0, 3))}
                    />
                  </div>
                </div>
              )}
            </section>

            {/* Items list (mobile order summary alternative) */}
            <section className="checkout-section checkout-items-section">
              <h2 className="section-title" style={{ marginBottom: "var(--space-4)" }}>Your Items</h2>
              <div className="items-list">
                {items.map((item) => (
                  <div key={item.id} className="item-row">
                    <div className="item-image">
                      {item.product?.image
                        ? <img src={item.product.image} alt={item.product.name} />
                        : <span className="material-symbols-outlined">image</span>}
                    </div>
                    <div className="item-info">
                      <p className="item-name">{item.product?.name ?? "Product"}</p>
                      <p className="item-qty">Qty: {item.quantity}</p>
                    </div>
                    <p className="item-price">
                      {((item.product?.price || 0) * item.quantity).toLocaleString()} DA
                    </p>
                  </div>
                ))}
              </div>
            </section>

          </div>

          {/* ─── RIGHT COLUMN: Sticky Order Summary ─── */}
          <aside className="checkout-aside">
            <div className="summary-card">
              <h3 className="summary-title">Order Summary</h3>

              <div className="summary-items">
                {items.map((item) => (
                  <div key={item.id} className="summary-item-row">
                    <div className="summary-item-img">
                      {item.product?.image
                        ? <img src={item.product.image} alt={item.product.name} />
                        : <span className="material-symbols-outlined" style={{ fontSize: "1rem" }}>image</span>}
                    </div>
                    <span className="summary-item-name">
                      {item.quantity}× {item.product?.name ?? "Item"}
                    </span>
                    <span className="summary-item-price">
                      {((item.product?.price || 0) * item.quantity).toLocaleString()} DZD
                    </span>
                  </div>
                ))}
              </div>

              <div className="summary-meta">
                <div className="summary-meta-row">
                  <span>Subtotal</span>
                  <span>{total.toLocaleString()} DZD</span>
                </div>
                <div className="summary-meta-row">
                  <span>Delivery</span>
                  <span className="summary-free">FREE</span>
                </div>
                {paymentMethod && (
                  <div className="summary-meta-row">
                    <span>Payment</span>
                    <span className="summary-payment-label">
                      {PAYMENT_METHODS[shippingMode].find(m => m.id === paymentMethod)?.label}
                    </span>
                  </div>
                )}
              </div>

              <div className="summary-total">
                <span>Total</span>
                <span>{total.toLocaleString()} DZD</span>
              </div>

              <button
                className="btn-checkout"
                onClick={handlePlaceOrder}
                disabled={!canSubmit}
              >
                {placing ? "Placing Order..." : paymentMethod === "cod" ? "Confirm Order" : "Pay Now"}
              </button>

              <p className="summary-terms">
                By completing your purchase you agree to our{" "}
                <a href="#">Terms</a> and <a href="#">Privacy Policy</a>.
              </p>
            </div>
          </aside>

        </div>
      </main>

      <style>{`
        /* ── CSS Variables (inherit from global theme, fallback provided) ── */
        .checkout-root {
          --co-bg:         var(--color-cream,        #F5F0E8);
          --co-surface:    var(--color-surface,       #EDE8DF);
          --co-card:       var(--color-card,          #2C2016);
          --co-text:       var(--color-text,          #1A1208);
          --co-muted:      var(--color-muted,         #7A7060);
          --co-primary:    var(--color-primary,       #1A1208);
          --co-accent:     var(--color-accent,        #C4A96B);
          --co-success:    var(--color-success,       #3D8B5E);
          --co-border:     var(--color-border,        rgba(0,0,0,0.08));
          --co-input-bg:   var(--color-input-bg,      rgba(255,255,255,0.7));
          --co-radius-sm:  var(--radius-sm,           8px);
          --co-radius-md:  var(--radius-md,           12px);
          --co-radius-lg:  var(--radius-lg,           16px);
          --co-shadow:     var(--shadow-card,         0 4px 24px rgba(0,0,0,0.08));
          --space-1:  4px;
          --space-2:  8px;
          --space-3:  12px;
          --space-4:  16px;
          --space-5:  20px;
          --space-6:  24px;
          --space-8:  32px;
          --space-10: 40px;
          --space-12: 48px;
          --space-16: 64px;
          --font-serif: var(--font-serif, Georgia, serif);
          --font-sans:  var(--font-sans,  system-ui, sans-serif);
          min-height: 100vh;
          background: var(--co-bg);
          color: var(--co-text);
          font-family: var(--font-sans);
        }

        /* Loading */
        .checkout-loading {
          min-height: 100vh;
          background: var(--co-bg);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: var(--space-4);
          color: var(--co-muted);
        }
        .checkout-spinner {
          width: 2rem; height: 2rem;
          border: 2px solid var(--co-accent);
          border-top-color: transparent;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* Layout */
        .checkout-main {
          max-width: 1200px;
          margin: 0 auto;
          padding: 9rem var(--space-6) var(--space-16);
        }
        .checkout-header { margin-bottom: var(--space-12); }
        .checkout-eyebrow {
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.2em;
          font-weight: 600;
          color: var(--co-muted);
          margin-bottom: var(--space-2);
        }
        .checkout-title {
          font-family: var(--font-serif);
          font-size: clamp(2rem, 5vw, 3.5rem);
          font-weight: 700;
          letter-spacing: -0.02em;
          line-height: 1;
        }

        /* Two-column layout */
        .checkout-layout {
          display: grid;
          grid-template-columns: 1fr;
          gap: var(--space-8);
        }
        @media (min-width: 1024px) {
          .checkout-layout {
            grid-template-columns: 1fr 380px;
            align-items: start;
          }
        }

        /* Left column */
        .checkout-left { display: flex; flex-direction: column; gap: var(--space-6); }

        /* Sections */
        .checkout-section {
          background: white;
          border-radius: var(--co-radius-lg);
          padding: var(--space-8);
          box-shadow: var(--co-shadow);
        }
        .section-heading-row {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          margin-bottom: var(--space-6);
          flex-wrap: wrap;
        }
        .section-number {
          width: 2rem; height: 2rem;
          background: var(--co-primary);
          color: white;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 0.875rem;
          font-weight: 700;
          flex-shrink: 0;
        }
        .section-title {
          font-family: var(--font-serif);
          font-size: 1.125rem;
          font-weight: 700;
          flex: 1;
        }

        /* Shipping toggle */
        .shipping-toggle {
          display: flex;
          gap: var(--space-2);
          background: var(--co-surface);
          border-radius: 999px;
          padding: 3px;
        }
        .toggle-btn {
          padding: 6px 14px;
          border-radius: 999px;
          font-size: 0.75rem;
          font-weight: 600;
          border: none;
          background: transparent;
          color: var(--co-muted);
          cursor: pointer;
          transition: background 0.2s, color 0.2s;
          white-space: nowrap;
        }
        .toggle-active {
          background: var(--co-primary);
          color: white;
        }
        .toggle-intl.toggle-active {
          background: #2E7D6B;
        }

        /* Form grid */
        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--space-4);
        }
        @media (max-width: 600px) {
          .form-grid { grid-template-columns: 1fr; }
        }
        .form-input {
          width: 100%;
          height: 52px;
          padding: 0 var(--space-4);
          background: var(--co-input-bg);
          border: 1.5px solid var(--co-border);
          border-radius: var(--co-radius-sm);
          font-size: 0.875rem;
          font-family: var(--font-sans);
          color: var(--co-text);
          transition: border-color 0.2s, box-shadow 0.2s;
          box-sizing: border-box;
          outline: none;
        }
        .form-input::placeholder { color: var(--co-muted); }
        .form-input:focus {
          border-color: var(--co-accent);
          box-shadow: 0 0 0 3px rgba(196,169,107,0.15);
        }
        .form-input-full { grid-column: 1 / -1; }

        /* Select */
        .form-select-wrapper { position: relative; }
        .form-select {
          appearance: none;
          -webkit-appearance: none;
          padding-right: 2.5rem;
          cursor: pointer;
        }
        .select-chevron {
          position: absolute;
          right: var(--space-3);
          top: 50%;
          transform: translateY(-50%);
          font-size: 1.25rem;
          color: var(--co-muted);
          pointer-events: none;
        }

        /* Payment methods */
        .payment-methods-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
          gap: var(--space-3);
          margin-bottom: var(--space-5);
        }
        .payment-card {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--space-2);
          padding: var(--space-5) var(--space-3);
          background: var(--co-surface);
          border: 1.5px solid var(--co-border);
          border-radius: var(--co-radius-md);
          cursor: pointer;
          transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
          font-family: var(--font-sans);
        }
        .payment-card:hover {
          border-color: var(--co-accent);
          background: rgba(196,169,107,0.05);
        }
        .payment-card-active {
          border-color: var(--co-accent);
          background: rgba(196,169,107,0.08);
          box-shadow: 0 0 0 3px rgba(196,169,107,0.15);
        }
        .payment-icon {
          font-size: 1.5rem;
          color: var(--co-muted);
        }
        .payment-card-active .payment-icon { color: var(--co-accent); }
        .payment-label {
          font-size: 0.8125rem;
          font-weight: 600;
          color: var(--co-text);
          text-align: center;
        }
        .payment-sub {
          font-size: 0.6875rem;
          color: var(--co-muted);
          text-align: center;
        }
        .payment-check {
          font-size: 1rem;
          color: var(--co-accent);
        }

        /* CIB form */
        .cib-form {
          border-top: 1px solid var(--co-border);
          padding-top: var(--space-5);
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
          animation: fadeIn 0.25s ease;
        }
        .cib-form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--space-4);
        }
        @keyframes fadeIn { from { opacity:0; transform: translateY(6px); } to { opacity:1; transform: none; } }

        /* Items section */
        .checkout-items-section { display: block; }
        @media (min-width: 1024px) { .checkout-items-section { display: none; } }
        .items-list { display: flex; flex-direction: column; }
        .item-row {
          display: flex;
          align-items: center;
          gap: var(--space-4);
          padding: var(--space-4) 0;
          border-bottom: 1px solid var(--co-border);
        }
        .item-row:last-child { border-bottom: none; }
        .item-image {
          width: 56px; height: 56px;
          border-radius: var(--co-radius-sm);
          background: var(--co-surface);
          overflow: hidden;
          flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
        }
        .item-image img { width: 100%; height: 100%; object-fit: cover; }
        .item-info { flex: 1; }
        .item-name { font-size: 0.875rem; font-weight: 600; font-family: var(--font-serif); }
        .item-qty  { font-size: 0.75rem; color: var(--co-muted); margin-top: 2px; }
        .item-price{ font-size: 0.875rem; font-weight: 700; font-family: var(--font-serif); white-space: nowrap; }

        /* ── Sticky Summary ── */
        .checkout-aside { width: 100%; }
        .summary-card {
          position: sticky;
          top: 7rem;   /* below navbar */
          background: var(--co-card);
          color: #E8DCC8;
          border-radius: var(--co-radius-lg);
          padding: var(--space-8);
          box-shadow: var(--co-shadow);
        }
        .summary-title {
          font-family: var(--font-serif);
          font-size: 1.125rem;
          font-weight: 700;
          color: var(--co-accent);
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin-bottom: var(--space-6);
        }
        .summary-items {
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
          margin-bottom: var(--space-5);
        }
        .summary-item-row {
          display: flex;
          align-items: center;
          gap: var(--space-3);
        }
        .summary-item-img {
          width: 36px; height: 36px;
          border-radius: var(--co-radius-sm);
          background: rgba(255,255,255,0.08);
          overflow: hidden;
          flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
        }
        .summary-item-img img { width: 100%; height: 100%; object-fit: cover; }
        .summary-item-name {
          flex: 1;
          font-size: 0.8125rem;
          color: rgba(232,220,200,0.85);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .summary-item-price {
          font-size: 0.875rem;
          font-weight: 700;
          white-space: nowrap;
        }
        .summary-meta {
          border-top: 1px solid rgba(196,169,107,0.25);
          padding-top: var(--space-5);
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
          margin-bottom: var(--space-5);
        }
        .summary-meta-row {
          display: flex;
          justify-content: space-between;
          font-size: 0.875rem;
          color: rgba(232,220,200,0.7);
        }
        .summary-free { color: #5DC88A; font-weight: 600; font-size: 0.75rem; text-transform: uppercase; }
        .summary-payment-label { color: var(--co-accent); font-size: 0.75rem; }
        .summary-total {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          font-family: var(--font-serif);
          font-weight: 700;
          font-size: 1.1rem;
          border-top: 1px solid rgba(196,169,107,0.25);
          padding-top: var(--space-5);
          margin-bottom: var(--space-6);
          color: white;
        }
        .summary-total span:last-child { font-size: 1.4rem; color: var(--co-accent); }
        .btn-checkout {
          width: 100%;
          height: 52px;
          background: var(--co-accent);
          color: var(--co-primary);
          border: none;
          border-radius: 999px;
          font-size: 0.875rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          cursor: pointer;
          transition: opacity 0.2s, transform 0.15s;
        }
        .btn-checkout:hover:not(:disabled) { opacity: 0.88; transform: translateY(-1px); }
        .btn-checkout:disabled { opacity: 0.4; cursor: not-allowed; }
        .summary-terms {
          text-align: center;
          font-size: 0.6875rem;
          color: rgba(232,220,200,0.45);
          margin-top: var(--space-5);
          line-height: 1.6;
        }
        .summary-terms a { color: rgba(232,220,200,0.7); text-decoration: underline; }
        .summary-terms a:hover { color: var(--co-accent); }
      `}</style>
    </div>
  );
}