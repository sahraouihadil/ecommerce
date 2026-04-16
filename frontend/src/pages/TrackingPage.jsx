/**
 * TrackingPage.jsx - Order Tracking Page
 * =========================================
 * ROUTE: /order/tracking/:orderId/:productId
 * API:   GET /api/orders/:orderId
 */

import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../services/api";

/* ─── Tailwind config (add to tailwind.config.js in your project) ───────────
   colors: { primary:"#6448b2", "primary-container":"#ab8ffe",
             "on-primary":"#f7f0ff", secondary:"#6f5900",
             "secondary-container":"#fed01b", "on-secondary-fixed":"#433500",
             "on-secondary-fixed-variant":"#645000",
             surface:"#f7f6f8", "surface-container-low":"#f1f0f3",
             "surface-container-lowest":"#ffffff",
             "surface-container":"#e8e8ea",
             "surface-container-high":"#e2e2e5",
             "surface-container-highest":"#dcdddf",
             "on-surface":"#2d2f30", "on-surface-variant":"#5b5b5d",
             "outline-variant":"#adadaf", outline:"#767779",
             error:"#b41340" }
   fontFamily: { headline:["Plus Jakarta Sans"], body:["Be Vietnam Pro"] }
   borderRadius: { DEFAULT:"1rem", lg:"2rem", xl:"3rem", full:"9999px" }
   ────────────────────────────────────────────────────────────────────────── */

const STEP_META = [
  {
    key: "pending",
    label: "Order Summoned",
    icon: "auto_awesome",
    desc: "We received your request and the makers started their creative process.",
  },
  {
    key: "confirmed",
    label: "Quality Enchantment",
    icon: "verified",
    desc: "Our wizards checked every stitch and spring for maximum comfort and style.",
  },
  {
    key: "shipped",
    label: "In Transit",
    icon: "local_shipping",
    desc: "Your piece has been enchanted, packed, and is currently floating towards the main sorting hub.",
  },
  {
    key: "delivered",
    label: "Home Arrival",
    icon: "home_pin",
    desc: "Your magical furniture has arrived at its new kingdom.",
  },
];

/* ── tiny utility ── */
function fmtDate(d) {
  if (!d) return "N/A";
  return new Date(d).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
function cap(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/* ─────────────────────────────────────────────────────────────────────────── */
export function TrackingPage() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

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

  /* ── states ── */
  if (loading)
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <span className="material-symbols-outlined text-primary text-5xl animate-spin" style={{ animationDuration: "1.2s" }}>
            autorenew
          </span>
          <p className="font-headline font-bold text-primary text-lg">Loading your magic order…</p>
        </div>
      </div>
    );

  if (!order)
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="text-center space-y-4">
          <span className="material-symbols-outlined text-error text-6xl">error</span>
          <p className="font-headline font-bold text-2xl text-on-surface">Order not found</p>
          <Link
            to="/order"
            className="inline-block mt-2 px-6 py-3 bg-primary text-on-primary rounded-full font-headline font-bold text-sm hover:opacity-90 transition-all"
          >
            ← Back to Orders
          </Link>
        </div>
      </div>
    );

  const steps = STEP_META.map((s) => s.key);
  const currentStep = steps.indexOf(order.status) >= 0 ? steps.indexOf(order.status) : 0;
  const progressPct = (currentStep / (steps.length - 1)) * 100;

  return (
    <>
      {/* Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&family=Be+Vietnam+Pro:wght@400;500;600&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');
        .material-symbols-outlined { font-variation-settings:'FILL' 0,'wght' 400,'GRAD' 0,'opsz' 24; font-family:'Material Symbols Outlined'; }
        .material-symbols-outlined.filled { font-variation-settings:'FILL' 1,'wght' 400,'GRAD' 0,'opsz' 24; }
        body { font-family: 'Be Vietnam Pro', sans-serif; }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        @keyframes pulse-ring { 0%{box-shadow:0 0 0 0 rgba(100,72,178,0.4)} 70%{box-shadow:0 0 0 14px rgba(100,72,178,0)} 100%{box-shadow:0 0 0 0 rgba(100,72,178,0)} }
        @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
        .float-anim { animation: float 3s ease-in-out infinite; }
        .pulse-ring { animation: pulse-ring 2s ease-out infinite; }
        .timeline-line::before {
          content:'';position:absolute;left:15px;top:8px;bottom:8px;width:2px;
          background:linear-gradient(to bottom, #ab8ffe 0%, #dcdddf 60%);
          border-radius:2px;
        }
      `}</style>

      <div className="min-h-screen bg-surface font-body text-on-surface">
        <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-8 pb-32">
          {/* ── Hero Title ── */}
          <div className="mb-10">
            <h2
              className="font-headline font-extrabold text-4xl md:text-6xl tracking-tight mb-3"
              style={{ color: "#6448b2", fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              Track Your Magic
            </h2>
            <div className="flex flex-wrap items-center gap-3">
              <span
                className="px-4 py-1 rounded-full font-label text-xs font-bold tracking-widest uppercase"
                style={{ background: "#fed01b", color: "#433500" }}
              >
                Order #{order.id}
              </span>
              <span
                className="px-4 py-1 rounded-full font-label text-xs font-bold tracking-widest uppercase italic"
                style={{ background: "#ab8ffe33", color: "#6448b2" }}
              >
                {order.orderdate ? `Ordered ${fmtDate(order.orderdate)}` : ""}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* ── LEFT COLUMN ── */}
            <div className="lg:col-span-8 space-y-8">

              {/* ── Visual Progress Map ── */}
              <div
                className="relative h-56 sm:h-72 rounded-xl overflow-hidden shadow-xl flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, #f1f0f3 0%, #e8e8ea 50%, #f7f0ff 100%)" }}
              >
                {/* Decorative blobs */}
                <div
                  className="absolute -top-8 -left-8 w-40 h-40 rounded-full opacity-20"
                  style={{ background: "#ab8ffe" }}
                />
                <div
                  className="absolute -bottom-10 -right-10 w-52 h-52 rounded-full opacity-15"
                  style={{ background: "#fed01b" }}
                />

                {/* Steps visual path */}
                <div className="relative z-10 w-full max-w-lg px-8">
                  <div className="flex items-center justify-between mb-4">
                    {STEP_META.map((step, i) => (
                      <div key={step.key} className="flex flex-col items-center gap-1 flex-1">
                        <div
                          className={`w-12 h-12 rounded-full flex items-center justify-center shadow-md transition-all duration-500 ${i < currentStep
                            ? "bg-primary"
                            : i === currentStep
                              ? "pulse-ring float-anim bg-primary"
                              : "bg-surface-container-high border-2 border-dashed border-outline-variant"
                            }`}
                        >
                          <span
                            className={`material-symbols-outlined text-xl ${i <= currentStep ? "text-white filled" : "text-outline-variant"
                              }`}
                          >
                            {step.icon}
                          </span>
                        </div>
                        <p
                          className={`text-[10px] font-bold text-center leading-tight max-w-[60px] ${i <= currentStep ? "text-primary" : "text-outline-variant"
                            }`}
                          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                        >
                          {step.label}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Progress bar */}
                  <div className="relative h-2 rounded-full mx-6" style={{ background: "#dcdddf" }}>
                    <div
                      className="absolute top-0 left-0 h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${progressPct}%`,
                        background: "linear-gradient(90deg, #6448b2, #ab8ffe)",
                      }}
                    />
                    {/* Truck icon on bar */}
                    <div
                      className="absolute -top-4 transition-all duration-700"
                      style={{ left: `calc(${progressPct}% - 12px)` }}
                    >
                      <span className="material-symbols-outlined text-primary text-2xl filled">
                        local_shipping
                      </span>
                    </div>
                  </div>

                  {/* Status badge */}
                  <div className="flex justify-center mt-6">
                    <span
                      className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-bold shadow"
                      style={{
                        background: "#6448b2",
                        color: "#f7f0ff",
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                      }}
                    >
                      <span className="material-symbols-outlined text-base filled">
                        {STEP_META[currentStep]?.icon}
                      </span>
                      {cap(order.status)}
                    </span>
                  </div>
                </div>
              </div>

              {/* ── Order Details Card ── */}
              <div
                className="rounded-xl shadow-lg overflow-hidden"
                style={{ background: "#ffffff" }}
              >
                <div
                  className="px-8 py-5 border-b"
                  style={{ borderColor: "#e8e8ea" }}
                >
                  <h2
                    className="font-headline font-bold text-xl flex items-center gap-2"
                    style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "#2d2f30" }}
                  >
                    <span className="material-symbols-outlined text-primary">receipt_long</span>
                    Order Details
                  </h2>
                </div>

                <div className="px-8 py-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-on-surface-variant flex items-center gap-1">
                      <span className="material-symbols-outlined text-base">calendar_today</span>
                      Date
                    </p>
                    <p className="text-sm font-semibold">{fmtDate(order.orderdate)}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-on-surface-variant flex items-center gap-1">
                      <span className="material-symbols-outlined text-base">payments</span>
                      Total
                    </p>
                    <p
                      className="font-headline font-bold text-lg"
                      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "#6448b2" }}
                    >
                      {order.totalamount} DA
                    </p>
                  </div>

                  {/* Items list */}
                  <div
                    className="pt-4 border-t"
                    style={{ borderColor: "#e8e8ea" }}
                  >
                    <p
                      className="font-headline font-semibold text-sm mb-3 uppercase tracking-widest"
                      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "#5b5b5d" }}
                    >
                      Items
                    </p>
                    <div className="space-y-3">
                      {order.items?.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between py-3 px-4 rounded-lg"
                          style={{ background: "#f1f0f3" }}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                              style={{ background: "#ab8ffe33" }}
                            >
                              <span className="material-symbols-outlined text-primary text-base">
                                chair
                              </span>
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-on-surface leading-tight">
                                {item.product_name || `Product #${item.product_id}`}
                              </p>
                              <p className="text-xs text-on-surface-variant">
                                Qty: {item.quantity}
                              </p>
                            </div>
                          </div>
                          <p
                            className="font-headline font-bold text-sm"
                            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                          >
                            {(item.price * item.quantity).toFixed(2)} DA
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* CTA */}
                <div
                  className="px-8 py-5 flex flex-wrap gap-3 border-t"
                  style={{ borderColor: "#e8e8ea", background: "#f7f6f8" }}
                >
                  <button
                    className="flex-1 sm:flex-none px-6 py-3 rounded-full font-headline font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-all active:scale-95"
                    style={{
                      background: "#6448b2",
                      color: "#f7f0ff",
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                    }}
                  >
                    <span className="material-symbols-outlined text-lg">support_agent</span>
                    Talk to a Roomie
                  </button>
                  <button
                    className="flex-1 sm:flex-none px-6 py-3 rounded-full font-headline font-bold text-sm hover:opacity-90 transition-all active:scale-95"
                    style={{
                      background: "#e8e8ea",
                      color: "#2d2f30",
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                    }}
                  >
                    View Invoice
                  </button>
                </div>
              </div>
            </div>

            {/* ── RIGHT: Journey Log Timeline ── */}
            <div className="lg:col-span-4">
              <div
                className="rounded-xl p-8 h-full border"
                style={{
                  background: "#f1f0f3",
                  borderColor: "#adadaf33",
                }}
              >
                <h4
                  className="font-headline font-bold text-xl mb-8 flex items-center gap-2"
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                >
                  <span className="material-symbols-outlined text-primary">history</span>
                  Journey Log
                </h4>

                {/* Timeline */}
                <div className="space-y-8 relative timeline-line">
                  {STEP_META.map((step, i) => {
                    const isDone = i < currentStep;
                    const isCurrent = i === currentStep;
                    const isFuture = i > currentStep;

                    return (
                      <div key={step.key} className={`relative pl-12 ${isFuture ? "opacity-45" : ""}`}>
                        {/* Dot */}
                        <div
                          className={`absolute left-0 top-1 w-8 h-8 rounded-full flex items-center justify-center z-10 ${isCurrent
                            ? "pulse-ring"
                            : isFuture
                              ? "border-2 border-dashed border-outline-variant"
                              : ""
                            }`}
                          style={{
                            background: isCurrent
                              ? "#6448b2"
                              : isDone
                                ? "#6448b2"
                                : "transparent",
                          }}
                        >
                          <span
                            className={`material-symbols-outlined text-sm ${isCurrent || isDone
                              ? "text-white filled"
                              : "text-outline-variant"
                              }`}
                          >
                            {isDone ? "check_circle" : isCurrent ? "auto_awesome" : step.icon}
                          </span>
                        </div>

                        {/* Content */}
                        <div>
                          <p
                            className={`font-headline font-bold text-base ${isFuture ? "text-outline-variant" : "text-on-surface"
                              }`}
                            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                          >
                            {step.label}
                          </p>
                          {isCurrent && (
                            <p
                              className="text-sm font-semibold mb-1"
                              style={{ color: "#6448b2" }}
                            >
                              {cap(order.status)}
                            </p>
                          )}
                          <p className="text-xs text-on-surface-variant leading-relaxed">
                            {isFuture ? "Coming up next…" : step.desc}
                          </p>
                          {!isFuture && (
                            <p className="text-[10px] text-on-surface-variant font-bold mt-1 uppercase tracking-tighter">
                              {isCurrent
                                ? "Now"
                                : isDone
                                  ? fmtDate(order.orderdate)
                                  : ""}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Pro tip */}
                <div
                  className="mt-10 p-4 rounded-lg border"
                  style={{
                    background: "#fed01b22",
                    borderColor: "#fed01b44",
                  }}
                >
                  <p
                    className="text-xs font-bold mb-1"
                    style={{ color: "#6f5900" }}
                  >
                    PRO TIP
                  </p>
                  <p className="text-xs italic leading-tight" style={{ color: "#645000" }}>
                    "Your furniture prefers a sunny spot and positive vibes."
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* ── Mobile Bottom Nav ── */}
        <nav
          className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 py-3 pb-8 md:hidden"
          style={{
            background: "rgba(255,255,255,0.85)",
            backdropFilter: "blur(20px)",
            boxShadow: "0px -10px 40px rgba(45,47,48,0.06)",
          }}
        >
          {[
            { icon: "storefront", label: "Shop", active: false },
            { icon: "auto_stories", label: "Journal", active: false },
            { icon: "package_2", label: "Orders", active: true },
            { icon: "person", label: "Profile", active: false },
          ].map((nav) => (
            <div
              key={nav.label}
              className={`flex flex-col items-center justify-center px-4 py-2 transition-colors ${nav.active
                ? "rounded-full"
                : "text-outline"
                }`}
              style={
                nav.active
                  ? { background: "#6448b2", color: "#f7f0ff" }
                  : {}
              }
            >
              <span className={`material-symbols-outlined ${nav.active ? "filled" : ""}`}>
                {nav.icon}
              </span>
              <span
                className="font-medium text-[10px] tracking-wide"
                style={{ fontFamily: "'Be Vietnam Pro', sans-serif" }}
              >
                {nav.label}
              </span>
            </div>
          ))}
        </nav>
      </div>
    </>
  );
}