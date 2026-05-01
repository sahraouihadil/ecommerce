/**
 * pages/TodayOrdersPage.jsx
 *
 * GET /api/deliveryman/orders/today  →  TodayOrdersOut
 */

import { useState, useEffect, useCallback } from "react";
import api from "../../services/api";
import { StatCard, Spinner, ErrorBanner, OrderModal, OrderRow } from "../ui/Shared";
import Sidebar from "../ui/Sidebar";
import Header from "../ui/Header";

// ── Sidebar config ─────────────────────────────────────────────────────────────

const LINKS = [
  {
    to: "/deliveryman-dash",
    end: true,
    label: "Today's Orders",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" />
      </svg>
    ),
  },
  {
    to: "/deliveryman-dash/schedule",
    label: "Schedule",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" />
        <path strokeLinecap="round" d="M12 6v6l4 2" />
      </svg>
    ),
  },
  {
    to: "/deliveryman-dash/history",
    label: "History",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
  },
];

// ── Icons ──────────────────────────────────────────────────────────────────────

const IconBox     = () => <svg className="w-5 h-5 text-violet-600"  fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10"/></svg>;
const IconCheck   = () => <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>;
const IconArrows  = () => <svg className="w-5 h-5 text-blue-600"    fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/></svg>;
const IconX       = () => <svg className="w-5 h-5 text-red-500"     fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>;
const IconPartial = () => <svg className="w-5 h-5 text-orange-500"  fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-3-3v6m9-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>;

// ── Derived stats ──────────────────────────────────────────────────────────────

function buildStats(orders = []) {
  return {
    total:      orders.length,
    delivered:  orders.filter((o) => o.status?.toLowerCase() === "delivered").length,
    in_transit: orders.filter((o) => ["processing", "shipped"].includes(o.status?.toLowerCase())).length,
    canceled:   orders.filter((o) => o.status?.toLowerCase() === "canceled").length,
    partial:    orders.filter((o) => o.status?.toLowerCase() === "partial").length,
  };
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function TodayOrdersPage() {
  const [openBar,  setOpenBar]  = useState(true);
  const [data,     setData]     = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);
  const [selected, setSelected] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/api/deliveryman/orders/today");
      setData({
        ...res.data,
        stats: buildStats(res.data.orders),
      });
    } catch (e) {
      setError(e.response?.data?.detail || e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  function handleMutated(updated) {
    setData((prev) => {
      if (!prev) return prev;
      const orders = prev.orders.map((o) =>
        o.id_raw === updated.id_raw ? updated : o
      );
      return { ...prev, orders, stats: buildStats(orders) };
    });
  }

  const openOrder = data?.orders?.find((o) => o.id_raw === selected);

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar
        openBar={openBar}
        setOpenBar={setOpenBar}
        links={LINKS}
        title="DeliveryApp"
        subtitle="Driver Panel"
        role="Deliveryman"
        profilePath="/deliveryman-dash/profile"
      />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <Header concept="Today's Orders" setOpenBar={setOpenBar} openBar={openBar} />
        <button
          onClick={() => setOpenBar((v) => !v)}
          className="min-[600px]:hidden w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Content */}
        <main className="flex-1 p-5 space-y-5">
          {loading && <Spinner />}
          {error   && <ErrorBanner message={error} onRetry={load} />}

          {data && (
            <>
              {/* ── Stat cards ── */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                <StatCard
                  icon={<IconBox />}
                  value={data.stats.total}
                  label="Total Today"
                  accent="#7c3aed"
                />
                <StatCard
                  icon={<IconArrows />}
                  value={data.stats.in_transit}
                  label="In Transit"
                  accent="#2563eb"
                />
                <StatCard
                  icon={<IconCheck />}
                  value={data.stats.delivered}
                  label="Delivered"
                  accent="#059669"
                />
                <StatCard
                  icon={<IconX />}
                  value={data.stats.canceled}
                  label="Canceled"
                  accent="#ef4444"
                />
                <StatCard
                  icon={<IconPartial />}
                  value={data.stats.partial}
                  label="Partial"
                  accent="#f97316"
                />
              </div>

              {/* ── Orders table ── */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-700">
                    {data.orders.length} orders assigned today
                  </span>
                  <span className="text-xs text-slate-400">📅 {data.date}</span>
                </div>

                {data.orders.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                    <svg className="w-10 h-10 mb-2 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <p className="text-sm">No orders for today</p>
                  </div>
                ) : (
                  data.orders.map((o) => (
                    <OrderRow key={o.id} order={o} onClick={() => setSelected(o.id_raw)} />
                  ))
                )}
              </div>
            </>
          )}
        </main>
      </div>

      {openOrder && (
        <OrderModal
          order={openOrder}
          onClose={() => setSelected(null)}
          onMutated={handleMutated}
        />
      )}
    </div>
  );
}