/**
 * CartPage.jsx - Shopping Cart Page
 * ====================================
 * Displays cart items fetched from the backend with quantity
 * controls, removal, order summary, and ARoomX design system.
 *
 * API:
 *   GET    /api/cart
 *   PUT    /api/cart/:id?quantity=N
 *   DELETE /api/cart/:id
 */

import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";

/* ─── BottomNav items ────────────────────────────────────────────────────── */
const NAV_ITEMS = [
  { icon: "home", label: "Home", to: "/" },
  { icon: "explore", label: "Browse", to: "/furniture" },
  { icon: "smart_toy", label: "Roomie", to: "/roomie" },
  { icon: "shopping_cart", label: "Cart", to: "/cart", active: true },
];

/* ─── CartItem card ──────────────────────────────────────────────────────── */
function CartItemCard({ item, onUpdateQty, onRemove }) {
  const product = item.product ?? {};
  const price = product.price ?? 0;
  const image = product.image_url ?? product.image ?? null;
  const name = product.name ?? "Product";
  const variant = product.variant ?? product.material ?? "";

  return (
    <div
      className="bg-white rounded-[1rem] p-6 flex flex-col md:flex-row gap-6 items-center relative overflow-hidden group transition-all"
      style={{ boxShadow: "0px 20px 40px rgba(45,47,48,0.06)" }}
    >
      {/* Image */}
      <div
        className="w-full md:w-48 h-48 rounded-[0.75rem] overflow-hidden flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: "#f1f0f3" }}
      >
        {image ? (
          <img
            src={image}
            alt={name}
            className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <span
            className="material-symbols-outlined text-5xl"
            style={{ color: "#adadaf" }}
          >
            chair
          </span>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 flex flex-col justify-between h-full w-full">
        <div className="flex justify-between items-start">
          <div>
            <h3
              className="font-bold text-2xl tracking-tight"
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                color: "#2d2f30",
              }}
            >
              {name}
            </h3>
            {variant && (
              <p className="text-sm mt-1" style={{ color: "#5b5b5d" }}>
                {variant}
              </p>
            )}
          </div>
          <p
            className="font-bold text-2xl tracking-tight"
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              color: "#6448b2",
            }}
          >
            ${(price * item.quantity).toLocaleString()}
          </p>
        </div>

        {/* Controls */}
        <div className="mt-8 flex justify-between items-center">
          {/* Qty stepper */}
          <div
            className="flex items-center rounded-full px-4 py-2 gap-4"
            style={{ backgroundColor: "#e2e2e5" }}
          >
            <button
              onClick={() => item.quantity > 1 && onUpdateQty(item.id, item.quantity - 1)}
              className="transition-transform hover:scale-125"
              style={{ color: "#6448b2" }}
            >
              <span className="material-symbols-outlined text-lg">remove</span>
            </button>
            <span
              className="font-bold w-6 text-center"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              {String(item.quantity).padStart(2, "0")}
            </span>
            <button
              onClick={() => onUpdateQty(item.id, item.quantity + 1)}
              className="transition-transform hover:scale-125"
              style={{ color: "#6448b2" }}
            >
              <span className="material-symbols-outlined text-lg">add</span>
            </button>
          </div>

          {/* Remove */}
          <button
            onClick={() => onRemove(item.id)}
            className="flex items-center gap-1 transition-colors"
            style={{ color: "#5b5b5d" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#b41340")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#5b5b5d")}
          >
            <span className="material-symbols-outlined">delete</span>
            <span
              className="text-xs font-bold uppercase tracking-wider"
              style={{ fontFamily: "'Be Vietnam Pro', sans-serif" }}
            >
              Remove
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── CartPage ───────────────────────────────────────────────────────────── */
export function CartPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchCart = async () => {
    try {
      const res = await api.get("/api/cart");
      setItems(res.data);
    } catch (err) {
      if (err.response?.status === 401) navigate("/login");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCart(); }, []);

  const updateQty = async (itemId, qty) => {
    if (qty < 1) return;
    try {
      await api.put(`/api/cart/${itemId}`, null, { params: { quantity: qty } });
      fetchCart();
    } catch (err) { console.error(err); }
  };

  const removeItem = async (itemId) => {
    try {
      await api.delete(`/api/cart/${itemId}`);
      fetchCart();
    } catch (err) { console.error(err); }
  };

  const subtotal = items.reduce(
    (sum, i) => sum + (i.product?.price ?? 0) * i.quantity,
    0
  );
  const TAX_RATE = 0.08;
  const taxes = subtotal * TAX_RATE;
  const total = subtotal + taxes;

  /* ── Loading ── */
  if (loading) {
    return (
      <>
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&family=Be+Vietnam+Pro:wght@400;500;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
        <div
          className="min-h-screen flex items-center justify-center"
          style={{ backgroundColor: "#f7f6f8", fontFamily: "'Be Vietnam Pro', sans-serif" }}
        >
          <div className="flex flex-col items-center gap-4">
            <div
              className="w-10 h-10 rounded-full border-2 animate-spin"
              style={{ borderColor: "#6448b2", borderTopColor: "transparent" }}
            />
            <p className="text-xs uppercase tracking-widest" style={{ color: "#5b5b5d" }}>
              Loading your cart…
            </p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&family=Be+Vietnam+Pro:wght@400;500;700&display=swap" rel="stylesheet" />
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />

      <style>{`
        .material-symbols-outlined {
          font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
        @keyframes bounce-short {
          0%, 100% { transform: translateY(-5%); animation-timing-function: cubic-bezier(0.8,0,1,1); }
          50%       { transform: translateY(0);   animation-timing-function: cubic-bezier(0,0,0.2,1); }
        }
        .animate-bounce-short { animation: bounce-short 1s infinite; }
      `}</style>

      <div
        className="min-h-screen pb-28"
        style={{
          backgroundColor: "#f7f6f8",
          color: "#2d2f30",
          fontFamily: "'Be Vietnam Pro', sans-serif",
          minHeight: "max(884px, 100dvh)",
        }}
      >

        {/* ── Main ──────────────────────────────────────────────────────── */}
        <main className="max-w-5xl mx-auto px-6 pt-8 pb-32">

          {/* Editorial header */}
          <div className="mb-12">
            <p
              className="text-xs font-bold uppercase tracking-widest mb-2"
              style={{
                fontFamily: "'Be Vietnam Pro', sans-serif",
                color: "#6f5900",
              }}
            >
              Review Your Finds
            </p><br />
            <h2
              className="font-bold text-5xl tracking-tight"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "#2d2f30" }}
            >
              Your Cart{" "}
              <span
                className="italic font-black"
                style={{ color: "#ab8ffe" }}
              >
                Ready for Magic?
              </span>
            </h2>
          </div>

          {/* ── Empty state ── */}
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 gap-8">
              <div
                className="w-24 h-24 rounded-full flex items-center justify-center"
                style={{ backgroundColor: "#e8e8ea" }}
              >
                <span
                  className="material-symbols-outlined text-5xl"
                  style={{ color: "#adadaf", fontVariationSettings: "'FILL' 0" }}
                >
                  shopping_cart
                </span>
              </div>
              <div className="text-center space-y-2">
                <p
                  className="text-xl font-bold"
                  style={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    color: "#2d2f30",
                  }}
                >
                  Your cart is empty
                </p>
                <p className="text-sm" style={{ color: "#5b5b5d" }}>
                  Find something extraordinary to fill it with.
                </p>
              </div>
              <Link
                to="/furniture"
                className="flex items-center gap-2 px-8 py-4 rounded-full font-bold text-sm uppercase tracking-widest transition-all hover:scale-105 active:scale-95"
                style={{
                  backgroundColor: "#6448b2",
                  color: "#f7f0ff",
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  boxShadow: "0 8px 24px rgba(100,72,178,0.25)",
                }}
              >
                <span className="material-symbols-outlined text-sm">explore</span>
                Browse Furniture
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

              {/* ── Items column ────────────────────────────────────────── */}
              <div className="lg:col-span-8 space-y-6">
                {items.map((item) => (
                  <CartItemCard
                    key={item.id}
                    item={item}
                    onUpdateQty={updateQty}
                    onRemove={removeItem}
                  />
                ))}

                {/* ── Roomie recommendation ── */}
                <div
                  className="relative mt-12 rounded-[1rem] p-8 flex flex-col md:flex-row items-center gap-8"
                  style={{
                    background: "rgba(255,255,255,0.4)",
                    backdropFilter: "blur(24px)",
                    WebkitBackdropFilter: "blur(24px)",
                    border: "2px solid rgba(171,143,254,0.2)",
                    boxShadow: "0 20px 40px rgba(45,47,48,0.1)",
                  }}
                >
                  {/* Roomie icon */}
                  <div
                    className="absolute -top-6 -left-6 p-4 rounded-full"
                    style={{
                      backgroundColor: "#6448b2",
                      boxShadow: "0 8px 24px rgba(100,72,178,0.3)",
                    }}
                  >
                    <span
                      className="material-symbols-outlined text-white text-3xl"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      smart_toy
                    </span>
                  </div>
                  <div className="flex-1 mt-4 md:mt-0">
                    <h4
                      className="font-bold text-xl italic mb-2"
                      style={{
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                        color: "#6448b2",
                      }}
                    >
                      Roomie says: "This fits perfectly!"
                    </h4>
                    <p className="text-sm leading-relaxed mb-4" style={{ color: "#5b5b5d" }}>
                      I noticed your items have a soft profile. The{" "}
                      <span className="font-bold" style={{ color: "#2d2f30" }}>
                        Glow Arc Lamp
                      </span>{" "}
                      would highlight those textures beautifully in the evening.
                    </p>
                  </div>
                  {/* Recommendation image */}
                  <div
                    className="w-32 h-32 rounded-[0.75rem] overflow-hidden flex-shrink-0 border-4 border-white shadow-md"
                    style={{ transform: "rotate(3deg)", backgroundColor: "#f1f0f3" }}
                  >
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="material-symbols-outlined text-4xl" style={{ color: "#adadaf" }}>
                        lightbulb
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Summary panel ───────────────────────────────────────── */}
              <div className="lg:col-span-4 sticky top-32">
                <div
                  className="rounded-[1rem] p-8"
                  style={{
                    backgroundColor: "#f1f0f3",
                    boxShadow: "inset 0 2px 8px rgba(45,47,48,0.06)",
                  }}
                >
                  <h3
                    className="font-bold text-2xl mb-8"
                    style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                  >
                    Summary
                  </h3>

                  <div className="space-y-4 mb-8">
                    {/* Subtotal */}
                    <div className="flex justify-between" style={{ color: "#5b5b5d" }}>
                      <span>Subtotal</span>
                      <span
                        className="font-bold"
                        style={{
                          fontFamily: "'Plus Jakarta Sans', sans-serif",
                          color: "#2d2f30",
                        }}
                      >
                        ${subtotal.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>

                    {/* Shipping */}
                    <div className="flex justify-between" style={{ color: "#5b5b5d" }}>
                      <span>Magic Shipping</span>
                      <span
                        className="font-bold"
                        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "#00675c" }}
                      >
                        FREE
                      </span>
                    </div>

                    {/* Taxes */}
                    <div className="flex justify-between" style={{ color: "#5b5b5d" }}>
                      <span>Taxes</span>
                      <span
                        className="font-bold"
                        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "#2d2f30" }}
                      >
                        ${taxes.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>

                    {/* Total */}
                    <div
                      className="pt-4 flex justify-between"
                      style={{ borderTop: "1px solid rgba(173,173,175,0.15)" }}
                    >
                      <span
                        className="font-bold text-xl"
                        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                      >
                        Total
                      </span>
                      <span
                        className="font-bold text-3xl"
                        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "#6448b2" }}
                      >
                        ${total.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>

                  {/* Checkout CTA */}
                  <Link
                    to="/checkout"
                    className="w-full rounded-full py-6 font-extrabold text-lg flex items-center justify-center gap-3 transition-all group"
                    style={{
                      backgroundColor: "#6448b2",
                      color: "#f7f0ff",
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      boxShadow: "0 20px 40px rgba(100,72,178,0.2)",
                      display: "flex",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#583ba5";
                      e.currentTarget.style.transform = "scale(1.02)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "#6448b2";
                      e.currentTarget.style.transform = "scale(1)";
                    }}
                    onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.98)")}
                    onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1.02)")}
                  >
                    Continue to Checkout
                    <span className="material-symbols-outlined transition-transform group-hover:translate-x-2">
                      magic_button
                    </span>
                  </Link>

                  {/* Trust badges */}
                  <div className="mt-6 flex flex-col gap-3">
                    {[
                      { icon: "verified_user", color: "#00675c", label: "30-Day Bliss Guarantee" },
                      { icon: "local_shipping", color: "#6f5900", label: "Eco-Neutral Delivery" },
                    ].map(({ icon, color, label }) => (
                      <div
                        key={label}
                        className="flex items-center gap-3 p-3 rounded-[0.75rem]"
                        style={{ backgroundColor: "#ffffff" }}
                      >
                        <span className="material-symbols-outlined" style={{ color }}>
                          {icon}
                        </span>
                        <span
                          className="text-xs font-bold uppercase tracking-widest"
                          style={{
                            color: "#5b5b5d",
                            fontFamily: "'Be Vietnam Pro', sans-serif",
                          }}
                        >
                          {label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  );
}