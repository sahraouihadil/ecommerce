/**
 * CheckoutPage.jsx - Order Checkout Page
 * =========================================
 * Final step before placing an order. Shows:
 *   - Order summary (items from cart + total)
 *   - Shipping information form (name, address, city)
 *   - "Place Order" button
 *
 * FLOW:
 *   1. Loads cart items from GET /api/cart
 *   2. If cart is empty -> redirects to /cart
 *   3. User fills shipping info and clicks "Place Order"
 *   4. Sends POST /api/orders (backend converts cart into an order)
 *   5. On success -> redirects to /order with the new order ID
 */

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export function CheckoutPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const navigate = useNavigate();

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

  const total = items.reduce(
    (sum, i) => sum + (i.product?.price || 0) * i.quantity,
    0
  );

  const handlePlaceOrder = async () => {
    if (!name || !address || !city) return;
    setPlacing(true);
    try {
      const res = await api.post("/api/orders");
      navigate("/order", {
        state: { orderId: res.data.order_id, total: res.data.total },
      });
    } catch (err) {
      alert(err?.response?.data?.detail || "Failed to place order");
    } finally {
      setPlacing(false);
    }
  };

  const canSubmit = name && address && city && !placing;

  /* ─── Loading state ─────────────────────────────────────────────── */
  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f6f8] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-violet-200 border-t-violet-600 animate-spin" />
          <p className="font-medium text-gray-500 tracking-wide text-sm">
            Loading your bag…
          </p>
        </div>
      </div>
    );
  }

  /* ─── Main render ───────────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-[#f7f6f8] font-sans text-[#2d2f30]">

      {/* ── Page body ───────────────────────────────────────────────── */}
      <main className="max-w-screen-xl mx-auto px-6 py-12 md:py-20 lg:flex lg:gap-16">

        {/* ────────────────── LEFT COLUMN ────────────────────────────── */}
        <div className="flex-1 space-y-12">

          {/* Page heading */}
          <header>
            <span className="text-xs font-bold tracking-[0.2em] uppercase text-amber-600 mb-4 block">
              Securing your magic
            </span>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-tight">
              Review{" "}
              <span className="text-violet-600 italic">Bag</span>
            </h1>
          </header>

          {/* ── Cart Items ─────────────────────────────────────────── */}
          <div className="space-y-6">
            {items.map((item) => (
              <div key={item.id} className="relative group">
                {/* Glow halo */}
                <div className="absolute -inset-4 bg-violet-200/10 rounded-2xl blur-2xl
                                group-hover:bg-violet-200/20 transition-all duration-500 pointer-events-none" />

                {/* Card */}
                <div
                  className="relative bg-white rounded-2xl p-6 md:p-10
                             flex flex-col md:flex-row gap-8 items-center
                             shadow-[0_20px_40px_rgba(45,47,48,0.06)]"
                >
                  {/* Product image */}
                  <div
                    className="w-full md:w-48 h-48 rounded-xl overflow-hidden
                               bg-gray-100 flex items-center justify-center shrink-0"
                  >
                    {item.product?.image ? (
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-full h-full object-cover mix-blend-multiply opacity-90"
                      />
                    ) : (
                      /* Placeholder illustration */
                      <svg viewBox="0 0 96 96" className="w-20 h-20 text-violet-200">
                        <rect
                          x="16" y="32" width="64" height="44"
                          rx="8" fill="currentColor"
                        />
                        <rect
                          x="28" y="20" width="40" height="18"
                          rx="6" fill="currentColor" opacity="0.6"
                        />
                      </svg>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 text-center md:text-left w-full">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-5">
                      <div>
                        <h2 className="text-2xl font-bold mb-1">
                          {item.product?.name ?? "Product"}
                        </h2>
                        <p className="text-gray-500 font-medium text-sm">
                          Qty: {item.quantity}
                        </p>
                      </div>
                      <p className="text-2xl font-bold text-violet-600 mt-3 md:mt-0">
                        {((item.product?.price || 0) * item.quantity).toFixed(2)}{" "}
                        <span className="text-base font-semibold">DA</span>
                      </p>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                      <span
                        className="bg-gray-100 px-4 py-1.5 rounded-full text-sm
                                   font-medium flex items-center gap-2 text-gray-700"
                      >
                        <CheckIcon className="w-4 h-4 text-teal-500" />
                        In Stock
                      </span>
                      {item.product?.category && (
                        <span
                          className="bg-gray-100 px-4 py-1.5 rounded-full text-sm
                                     font-medium text-gray-700"
                        >
                          {item.product.category}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ── Delivery & Shipping grid ────────────────────────────── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

            {/* Delivery Method */}
            <div className="bg-gray-50 rounded-2xl p-8 space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-yellow-300 rounded-full flex items-center justify-center shrink-0">
                  <SparkleIcon className="w-5 h-5 text-yellow-800" />
                </div>
                <h3 className="text-xl font-bold">Delivery Method</h3>
              </div>
              <div
                className="bg-white p-5 rounded-xl shadow-sm
                           border-2 border-violet-200"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-bold text-base mb-0.5 italic">
                      Via Magical Floating Van
                    </p>
                    <p className="text-sm text-gray-500">
                      Arriving in 3–5 business sighs
                    </p>
                  </div>
                  <div className="w-5 h-5 rounded-full border-2 border-violet-600 flex items-center justify-center">
                    <div className="w-2.5 h-2.5 rounded-full bg-violet-600" />
                  </div>
                </div>

              </div>
            </div>

            {/* Shipping Address Form */}
            <div className="bg-gray-50 rounded-2xl p-8 space-y-6">
              <div className="flex items-center gap-4">
                <div
                  className="w-12 h-12 bg-violet-100 rounded-full
                             flex items-center justify-center shrink-0"
                >
                  <PinIcon className="w-5 h-5 text-violet-600" />
                </div>
                <h3 className="text-xl font-bold">Shipping To</h3>
              </div>

              <div className="space-y-3">
                {/* Full Name */}
                <input
                  type="text"
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-5 py-3 rounded-xl bg-white border border-gray-200
                             text-sm font-medium placeholder:text-gray-400
                             focus:outline-none focus:ring-2 focus:ring-violet-400
                             transition"
                />
                <input
                  type="tel"
                  placeholder="Phone Number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-5 py-3 rounded-xl bg-white border border-gray-200
                             text-sm font-medium placeholder:text-gray-400
                             focus:outline-none focus:ring-2 focus:ring-violet-400
                             transition"
                />
                {/* Address */}
                <input
                  type="text"
                  placeholder="Street Address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-5 py-3 rounded-xl bg-white border border-gray-200
                             text-sm font-medium placeholder:text-gray-400
                             focus:outline-none focus:ring-2 focus:ring-violet-400
                             transition"
                />
                {/* City */}
                <input
                  type="text"
                  placeholder="City"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-5 py-3 rounded-xl bg-white border border-gray-200
                             text-sm font-medium placeholder:text-gray-400
                             focus:outline-none focus:ring-2 focus:ring-violet-400
                             transition"
                />
                <textarea
                  placeholder="Additional Notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-5 py-3 rounded-xl bg-white border border-gray-200
                             text-sm font-medium placeholder:text-gray-400
                             focus:outline-none focus:ring-2 focus:ring-violet-400
                             transition"
                />
              </div>
            </div>

          </div>
        </div>

        {/* ────────────────── RIGHT COLUMN (Sticky panel) ───────────── */}
        <div className="w-full lg:w-[400px] mt-12 lg:mt-0">
          <div
            className="sticky top-28 bg-white rounded-2xl p-8 overflow-hidden relative
                       shadow-[0_20px_40px_rgba(45,47,48,0.06)]"
          >
            {/* Decorative blobs */}
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-violet-200/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-yellow-200/20 rounded-full blur-3xl pointer-events-none" />

            <h3 className="text-2xl font-bold mb-8 relative">Order Summary</h3>

            {/* Line items */}
            <div className="space-y-4 mb-8 relative">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between text-gray-500 text-sm"
                >
                  <span>
                    {item.product?.name ?? "Item"}{" "}
                    <span className="text-gray-400">×{item.quantity}</span>
                  </span>
                  <span className="font-bold text-[#2d2f30]">
                    {((item.product?.price || 0) * item.quantity).toFixed(2)} DA
                  </span>
                </div>
              ))}

              <div className="flex justify-between text-gray-500">
                <span>Delivery (Magic)</span>
                <span className="font-bold text-teal-600">FREE</span>
              </div>

              {/* Total */}
              <div
                className="pt-6 mt-2 border-t border-gray-100
                           flex justify-between items-end"
              >
                <span className="text-lg font-bold">Total</span>
                <div className="text-right">
                  <p className="text-4xl font-bold text-violet-600 leading-none">
                    {total.toFixed(2)}
                  </p>
                  <p className="text-[10px] uppercase tracking-widest text-gray-400 mt-1">
                    DA • including magic
                  </p>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="space-y-4 relative">
              <button
                onClick={handlePlaceOrder}
                disabled={!canSubmit}
                className="w-full py-5 px-8 bg-violet-600 text-white rounded-full
                           font-bold text-lg
                           flex items-center justify-center gap-3
                           hover:scale-[1.02] active:scale-95
                           shadow-lg shadow-violet-200
                           disabled:opacity-40 disabled:cursor-not-allowed
                           disabled:hover:scale-100
                           transition-all duration-200"
              >
                {placing ? (
                  <>
                    <span
                      className="w-5 h-5 rounded-full border-2 border-white/40 border-t-white animate-spin"
                    />
                    Placing Order…
                  </>
                ) : (
                  <>
                    Complete Purchase
                    <ArrowRightIcon className="w-5 h-5" />
                  </>
                )}
              </button>

              <p className="text-center text-xs text-gray-400 px-4">
                By completing your purchase, you agree to our{" "}
                <a href="#" className="underline font-medium">
                  Terms of Magic
                </a>{" "}
                and{" "}
                <a href="#" className="underline font-medium">
                  Privacy Spells
                </a>
                .
              </p>
            </div>

            {/* Trust badges */}
            <div className="mt-10 flex items-center justify-center gap-6 opacity-40">
              <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-tighter">
                <LockIcon className="w-3 h-3" /> 128-Bit Encrypted
              </div>
              <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-tighter">
                <ShieldIcon className="w-3 h-3" /> Certified Safe
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ── Roomie Chat FAB ─────────────────────────────────────────── */}
      <button
        className="fixed bottom-10 right-10 w-16 h-16
                   bg-white/70 backdrop-blur-md
                   border border-white/40 shadow-2xl rounded-full
                   flex items-center justify-center
                   text-violet-600 z-50 group"
        aria-label="Open chat"
      >
        <BotIcon className="w-7 h-7 group-hover:scale-110 transition-transform" />
        {/* Pulse dot */}
        <span
          className="absolute -top-1 -right-1 w-4 h-4
                     bg-yellow-300 rounded-full border-2 border-white animate-pulse"
        />
      </button>

      <div className="h-20" />
    </div>
  );
}

/* ─── Inline SVG icon helpers ──────────────────────────────────────── */

function CheckIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"
      className={className}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function SparkleIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 2l2.4 7.2H22l-6.2 4.5 2.4 7.3L12 17l-6.2 4-2.4-7.3L3 6h7.6L12 2z" />
    </svg>
  );
}

function PinIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
      className={className}>
      <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function ArrowRightIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"
      className={className}>
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

function LockIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
      className={className}>
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function ShieldIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
      className={className}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function BotIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
      className={className}>
      <rect x="3" y="11" width="18" height="10" rx="2" />
      <circle cx="12" cy="5" r="2" />
      <line x1="12" y1="7" x2="12" y2="11" />
      <line x1="8" y1="16" x2="8" y2="16" />
      <line x1="16" y1="16" x2="16" y2="16" />
    </svg>
  );
}