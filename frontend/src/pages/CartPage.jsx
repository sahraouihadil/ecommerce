import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";

/* ─── Design tokens ─────────────────────────────── */
const GOLD = "#C8A96A";
const CHARCOAL = "#1C1916";
const MUTED = "#9E8E7A";
const CREAM = "#FAF8F4";
const SURFACE = "#F0EDE6";
const BASE = "http://127.0.0.1:8000";

/* ─── Animated entrance wrapper ─────────────────── */
function AnimatedItem({ children, delay = 0, style = {} }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);
  return (
    <div style={{
      transition: "opacity 0.7s cubic-bezier(0.16,1,0.3,1), transform 0.7s cubic-bezier(0.16,1,0.3,1)",
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(24px)",
      ...style,
    }}>
      {children}
    </div>
  );
}

/* ─── Gold ornament divider ─────────────────────── */
function Ornament() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", maxWidth: "10rem", margin: "1.5rem 0" }}>
      <div style={{ height: "1px", flex: 1, background: GOLD, opacity: 0.45 }} />
      <div style={{ width: "4px", height: "4px", background: GOLD, transform: "rotate(45deg)", opacity: 0.6 }} />
      <div style={{ height: "1px", flex: 1, background: GOLD, opacity: 0.45 }} />
    </div>
  );
}

/* ─── Quantity stepper (with disabled state) ───── */
function QtyStepper({ value, onDecrement, onIncrement, disabled = false }) {
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      border: `1px solid rgba(200,169,106,0.3)`,
      height: "36px",
      opacity: disabled ? 0.5 : 1,
    }}>
      <button
        onClick={onDecrement}
        disabled={disabled}
        style={{
          width: "36px", height: "36px",
          background: "transparent", border: "none",
          color: MUTED, fontSize: "1.1rem",
          cursor: disabled ? "not-allowed" : "pointer",
          display: "flex",
          alignItems: "center", justifyContent: "center",
          transition: "color 0.2s",
        }}
        onMouseEnter={e => !disabled && (e.currentTarget.style.color = CHARCOAL)}
        onMouseLeave={e => !disabled && (e.currentTarget.style.color = MUTED)}
      >−</button>
      <span style={{
        width: "32px", textAlign: "center",
        fontFamily: "'Cormorant Garamond', Georgia, serif",
        fontSize: "0.9375rem", fontWeight: 500,
        color: CHARCOAL,
      }}>{value}</span>
      <button
        onClick={onIncrement}
        disabled={disabled}
        style={{
          width: "36px", height: "36px",
          background: "transparent", border: "none",
          color: MUTED, fontSize: "1.1rem",
          cursor: disabled ? "not-allowed" : "pointer",
          display: "flex",
          alignItems: "center", justifyContent: "center",
          transition: "color 0.2s",
        }}
        onMouseEnter={e => !disabled && (e.currentTarget.style.color = CHARCOAL)}
        onMouseLeave={e => !disabled && (e.currentTarget.style.color = MUTED)}
      >+</button>
    </div>
  );
}

/* ─── Ghost / pill button ── */
function GhostButton({ children, onClick, as: Tag = "button", to, disabled, fullWidth }) {
  const [hovered, setHovered] = useState(false);
  const style = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.6rem",
    padding: "0 2rem",
    height: "52px",
    width: fullWidth ? "100%" : "auto",
    background: hovered && !disabled ? CHARCOAL : "transparent",
    color: disabled ? "rgba(200,169,106,0.35)" : hovered ? CREAM : GOLD,
    border: `1px solid ${disabled ? "rgba(200,169,106,0.2)" : hovered ? CHARCOAL : "rgba(200,169,106,0.55)"}`,
    borderRadius: 0,
    fontFamily: "sans-serif",
    fontSize: "0.6rem",
    fontWeight: 600,
    letterSpacing: "0.3em",
    textTransform: "uppercase",
    cursor: disabled ? "not-allowed" : "pointer",
    transition: "all 0.25s ease",
    outline: "none",
    textDecoration: "none",
  };
  if (Tag === "a" || Tag === Link) {
    return (
      <Link
        to={to}
        style={style}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {children}
        <span style={{ display: "inline-block", transition: "transform 0.3s", transform: hovered ? "translateX(4px)" : "none", fontSize: "0.875rem" }}>→</span>
      </Link>
    );
  }
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={style}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {children}
    </button>
  );
}

/* ─── Main page ──────────────────────────────────── */
export function CartPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pendingItems, setPendingItems] = useState(new Set()); // IDs being updated/removed
  const navigate = useNavigate();

  const img = (path) => (path ? `${BASE}/${path}` : null);

  const fetchCart = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const res = await api.get("/api/cart");
      setItems(res.data);
      setError(null);
      window.dispatchEvent(new CustomEvent('aroom:counts', { detail: { cart: res.data.length } }));
    } catch (err) {
      if (err.response?.status === 401) navigate("/login");
      else setError("Could not load your cart. Please refresh.");
      console.error(err);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => { fetchCart(); }, []);

  const removeItem = async (itemId) => {
    setPendingItems(prev => new Set(prev).add(itemId));
    try {
      await api.delete(`/api/cart/${itemId}`);
      await fetchCart(false);
    } catch (err) {
      console.error(err);
      setError("Failed to remove item. Please try again.");
      await fetchCart(false);
    } finally {
      setPendingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }
  };

  const updateQty = async (itemId, newQty) => {
    if (newQty <= 0) {
      await removeItem(itemId);
      return;
    }

    setPendingItems(prev => new Set(prev).add(itemId));
    try {
      await api.put(`/api/cart/${itemId}`, null, { params: { quantity: newQty } });
      await fetchCart(false);
    } catch (err) {
      console.error(err);
      setError("Failed to update quantity. Please try again.");
      await fetchCart(false);
    } finally {
      setPendingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }
  };

  const subtotal = items.reduce((sum, i) => sum + (i.product?.price || 0) * i.quantity, 0);

  const total = subtotal;

  const fonts = `
    @import url('https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@400;700&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&display=swap');
    @keyframes spin { to { transform: rotate(360deg); } }
    .cart-row-img { transition: transform 0.4s cubic-bezier(0.16,1,0.3,1); }
    .cart-row:hover .cart-row-img { transform: scale(1.04); }
    @media (max-width: 900px) {
      .cart-grid { grid-template-columns: 1fr !important; }
    }
    @media (max-width: 580px) {
      .cart-row-inner { flex-wrap: wrap; gap: 1rem !important; }
      .cart-row-price { width: 100% !important; text-align: left !important; }
    }
  `;

  if (loading) return (
    <div style={{ minHeight: "100vh", background: CREAM, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "1.25rem" }}>
      <style>{fonts}</style>
      <div style={{ width: "28px", height: "28px", borderRadius: "50%", border: `1px solid ${GOLD}`, borderTopColor: "transparent", animation: "spin 0.9s linear infinite" }} />
      <p style={{ fontFamily: "sans-serif", fontSize: "0.575rem", letterSpacing: "0.3em", textTransform: "uppercase", color: MUTED }}>Loading cart…</p>
    </div>
  );

  return (
    <div style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", minHeight: "100vh", background: CREAM, color: CHARCOAL }}>
      <style>{fonts}</style>

      <main style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 2rem 8rem" }}>

        <div style={{ paddingTop: "9rem", marginBottom: "5rem" }}>
          <AnimatedItem delay={0}>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem" }}>
              <div style={{ height: "1px", width: "2rem", background: GOLD, opacity: 0.6 }} />
              <span style={{ fontFamily: "sans-serif", fontSize: "0.575rem", letterSpacing: "0.45em", textTransform: "uppercase", color: GOLD }}>
                Shopping
              </span>
            </div>
          </AnimatedItem>

          <AnimatedItem delay={80}>
            <h1 style={{
              fontFamily: "'Cinzel Decorative', serif",
              fontSize: "clamp(2.75rem, 6vw, 5rem)",
              fontWeight: 700,
              lineHeight: 1.0,
              letterSpacing: "0.02em",
              color: CHARCOAL,
              margin: 0,
            }}>
              Your Cart
            </h1>
          </AnimatedItem>

          <AnimatedItem delay={140}><Ornament /></AnimatedItem>

          {items.length > 0 && (
            <AnimatedItem delay={180}>
              <p style={{ fontFamily: "sans-serif", fontSize: "0.575rem", letterSpacing: "0.25em", textTransform: "uppercase", color: MUTED }}>
                {items.length} item{items.length !== 1 ? "s" : ""}
              </p>
            </AnimatedItem>
          )}
        </div>

        {error && (
          <div style={{
            background: "#fff1f0",
            borderLeft: `4px solid #d9534f`,
            padding: "1rem 1.5rem",
            marginBottom: "2rem",
            fontFamily: "sans-serif",
            fontSize: "0.8rem",
            color: "#b33",
          }}>
            ⚠️ {error}
          </div>
        )}

        {items.length === 0 ? (
          <AnimatedItem delay={200}>
            <div style={{ textAlign: "center", padding: "6rem 2rem", borderTop: `1px solid rgba(200,169,106,0.15)` }}>
              <div style={{ marginBottom: "2rem" }}>
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none" style={{ opacity: 0.25 }}>
                  <rect x="20" y="4" width="22" height="22" rx="1" transform="rotate(45 20 4)" stroke={GOLD} strokeWidth="1" />
                </svg>
              </div>
              <p style={{ fontSize: "1.25rem", fontStyle: "italic", fontWeight: 300, color: MUTED, marginBottom: "2.5rem", lineHeight: 1.8 }}>
                Your cart is empty.
              </p>
              <GhostButton as={Link} to="/furniture">Browse the Collection</GhostButton>
            </div>
          </AnimatedItem>
        ) : (
          <div className="cart-grid" style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: "5rem", alignItems: "start" }}>

            <div>
              <div style={{ borderTop: `1px solid rgba(200,169,106,0.2)` }}>
                {items.map((item, i) => {
                  const isPending = pendingItems.has(item.id);
                  return (
                    <AnimatedItem key={item.id} delay={100 + i * 60}>
                      <div className="cart-row" style={{ borderBottom: `1px solid rgba(200,169,106,0.12)`, padding: "2rem 0" }}>
                        <div className="cart-row-inner" style={{ display: "flex", alignItems: "center", gap: "2rem" }}>
                          <div style={{ width: "88px", height: "88px", background: SURFACE, flexShrink: 0, overflow: "hidden" }}>
                            {item.product?.image_url ? (
                              <img className="cart-row-img" src={img(item.product.image_url)} alt={item.product.name}
                                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                            ) : (
                              <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                  <rect x="2" y="2" width="16" height="16" rx="1" stroke={GOLD} strokeWidth="0.75" opacity="0.3" />
                                  <line x1="2" y1="14" x2="8" y2="9" stroke={GOLD} strokeWidth="0.75" opacity="0.3" />
                                  <line x1="8" y1="9" x2="13" y2="13" stroke={GOLD} strokeWidth="0.75" opacity="0.3" />
                                  <line x1="13" y1="13" x2="18" y2="8" stroke={GOLD} strokeWidth="0.75" opacity="0.3" />
                                </svg>
                              </div>
                            )}
                          </div>

                          <div style={{ flex: 1, minWidth: 0 }}>
                            <h3 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "1.0625rem", fontWeight: 500, color: CHARCOAL, margin: "0 0 0.3rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                              {item.product?.name || "Product"}
                            </h3>
                            {item.product?.category && (
                              <p style={{ fontFamily: "sans-serif", fontSize: "0.55rem", letterSpacing: "0.25em", textTransform: "uppercase", color: MUTED, margin: 0 }}>
                                {item.product.category}
                              </p>
                            )}
                          </div>

                          <QtyStepper
                            value={item.quantity}
                            onDecrement={() => updateQty(item.id, item.quantity - 1)}
                            onIncrement={() => updateQty(item.id, item.quantity + 1)}
                            disabled={isPending}
                          />

                          <p className="cart-row-price" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "1.0625rem", fontWeight: 500, color: CHARCOAL, width: "110px", textAlign: "right", margin: 0, whiteSpace: "nowrap" }}>
                            {(item.product?.price * item.quantity).toLocaleString()} DA
                          </p>

                          <button
                            onClick={() => removeItem(item.id)}
                            disabled={isPending}
                            aria-label="Remove item"
                            style={{
                              background: "none",
                              border: "none",
                              cursor: isPending ? "wait" : "pointer",
                              padding: "12px 16px",
                              fontSize: "4.6rem",
                              lineHeight: 1,
                              fontWeight: 300,
                              color: "rgba(158,142,122,0.6)",
                              transition: "color 0.2s, opacity 0.2s",
                              opacity: isPending ? 0.5 : 1,
                              borderRadius: 0,
                              minWidth: "56px",
                            }}
                            onMouseEnter={e => !isPending && (e.currentTarget.style.color = "#8B2020")}
                            onMouseLeave={e => !isPending && (e.currentTarget.style.color = "rgba(158,142,122,0.6)")}
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    </AnimatedItem>
                  );
                })}
              </div>

              <AnimatedItem delay={100 + items.length * 60 + 80}>
                <div style={{ marginTop: "2.5rem" }}>
                  <Link to="/furniture"
                    style={{ fontFamily: "sans-serif", fontSize: "0.55rem", letterSpacing: "0.3em", textTransform: "uppercase", color: MUTED, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "0.5rem", transition: "color 0.2s" }}
                    onMouseEnter={e => e.currentTarget.style.color = GOLD}
                    onMouseLeave={e => e.currentTarget.style.color = MUTED}
                  >
                    ← Continue Shopping
                  </Link>
                </div>
              </AnimatedItem>
            </div>

            <AnimatedItem delay={200} style={{ position: "sticky", top: "7rem" }}>
              <div style={{ background: SURFACE, padding: "2.5rem 2rem", border: `1px solid rgba(200,169,106,0.15)` }}>
                <div style={{ marginBottom: "0.5rem" }}>
                  <span style={{ fontFamily: "sans-serif", fontSize: "0.55rem", letterSpacing: "0.35em", textTransform: "uppercase", color: GOLD }}>Overview</span>
                </div>
                <h3 style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: "1.1rem", fontWeight: 700, color: CHARCOAL, margin: "0 0 0.25rem" }}>
                  Order Summary
                </h3>
                <Ornament />

                <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "1.75rem" }}>
                  {[
                    { label: "Subtotal", value: `${subtotal.toLocaleString("fr-DZ", { minimumFractionDigits: 2 })} DA` },
                    { label: "Shipping", value: "Free", valueStyle: { fontFamily: "sans-serif", fontSize: "0.55rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "#5A7A5A" } },
                  ].map(({ label, value, valueStyle }) => (
                    <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                      <span style={{ fontFamily: "sans-serif", fontSize: "0.575rem", letterSpacing: "0.2em", textTransform: "uppercase", color: MUTED }}>{label}</span>
                      <span style={{ fontSize: "0.9375rem", color: CHARCOAL, fontWeight: 400, ...valueStyle }}>{value}</span>
                    </div>
                  ))}
                </div>

                <div style={{ borderTop: `1px solid rgba(200,169,106,0.25)`, paddingTop: "1.5rem", marginBottom: "2rem", display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <span style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: "0.85rem", fontWeight: 700, color: CHARCOAL, letterSpacing: "0.05em" }}>Total</span>
                  <span style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "1.5rem", fontWeight: 500, color: CHARCOAL }}>
                    {total.toLocaleString("fr-DZ", { minimumFractionDigits: 2 })} DA
                  </span>
                </div>

                <GhostButton as={Link} to="/checkout" fullWidth>Proceed to Checkout</GhostButton>

                <p style={{ fontFamily: "sans-serif", fontSize: "0.525rem", letterSpacing: "0.2em", textTransform: "uppercase", color: MUTED, textAlign: "center", marginTop: "1.5rem", opacity: 0.7 }}>
                  Secure · Free Returns · 24h Support
                </p>
              </div>
            </AnimatedItem>

          </div>
        )}
      </main>
    </div>
  );
}

export default CartPage;