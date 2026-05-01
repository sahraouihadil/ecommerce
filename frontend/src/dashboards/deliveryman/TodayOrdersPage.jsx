import { useState, useEffect, useCallback } from "react";
import api from "../../services/api";
import { StatCard, Spinner, ErrorBanner, OrderModal, OrderRow } from "../ui/Shared";
import Sidebar from "../ui/Sidebar";
import Header from "../ui/Header";

const LINKS = [
  {
    to: "/deliveryman-dash", end: true, label: "Today's Orders",
    icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" /></svg>,
  },
  {
    to: "/deliveryman-dash/schedule", label: "Schedule",
    icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path strokeLinecap="round" d="M12 6v6l4 2" /></svg>,
  },
  {
    to: "/deliveryman-dash/history", label: "History",
    icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>,
  },
];

const IconBox     = () => <svg className="w-5 h-5 text-violet-600"  fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10"/></svg>;
const IconCheck   = () => <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>;
const IconArrows  = () => <svg className="w-5 h-5 text-blue-600"    fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/></svg>;
const IconX       = () => <svg className="w-5 h-5 text-red-500"     fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>;
const IconPartial = () => <svg className="w-5 h-5 text-orange-500"  fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-3-3v6m9-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>;

function buildStats(orders = []) {
  return {
    total:      orders.length,
    delivered:  orders.filter((o) => o.status?.toLowerCase() === "delivered").length,
    in_transit: orders.filter((o) => ["processing", "shipped"].includes(o.status?.toLowerCase())).length,
    canceled:   orders.filter((o) => o.status?.toLowerCase() === "canceled").length,
    partial:    orders.filter((o) => o.status?.toLowerCase() === "partial").length,
  };
}

// ── Compact order row (mobile) ─────────────────────────────────────────────────
function MobileOrderRow({ order, onClick }) {
  const statusColors = {
    delivered:  "bg-emerald-100 text-emerald-700",
    canceled:   "bg-red-100 text-red-600",
    problem:    "bg-red-100 text-red-600",
    shipped:    "bg-blue-100 text-blue-700",
    processing: "bg-blue-100 text-blue-700",
    partial:    "bg-orange-100 text-orange-700",
    pending:    "bg-amber-100 text-amber-700",
  };
  const color = statusColors[order.status?.toLowerCase()] ?? "bg-slate-100 text-slate-600";

  return (
    <div
      onClick={onClick}
      className="flex items-center gap-3 px-4 py-3 border-b border-slate-100 last:border-0 hover:bg-slate-50 cursor-pointer transition-colors active:bg-slate-100"
    >
      <div className="w-9 h-9 rounded-xl bg-violet-50 flex items-center justify-center shrink-0">
        <svg className="w-4 h-4 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10"/>
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-bold text-slate-800 truncate">{order.id}</span>
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${color}`}>
            {order.status}
          </span>
        </div>
        <p className="text-xs text-slate-500 truncate">{order.customer}</p>
        <p className="text-xs text-slate-400 truncate">{order.address}</p>
      </div>
      {/* Arrow — tapping reveals amount inside the modal */}
      <svg className="w-4 h-4 text-slate-300 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
      </svg>
    </div>
  );
}

export default function TodayOrdersPage() {
  const [openBar,  setOpenBar]  = useState(window.innerWidth >= 600);
  const [data,     setData]     = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);
  const [selected, setSelected] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/api/deliveryman/orders/today");
      setData({ ...res.data, stats: buildStats(res.data.orders) });
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
      const orders = prev.orders.map((o) => o.id_raw === updated.id_raw ? updated : o);
      return { ...prev, orders, stats: buildStats(orders) };
    });
  }

  const openOrder = data?.orders?.find((o) => o.id_raw === selected);

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar
        openBar={openBar} setOpenBar={setOpenBar} links={LINKS}
        title="DeliveryApp" subtitle="Driver Panel" role="Deliveryman"
        profilePath="/deliveryman-dash/profile"
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header concept="Today's Orders" setOpenBar={setOpenBar} openBar={openBar} />

        <main className="flex-1 p-3 sm:p-5 space-y-3 sm:space-y-5 overflow-y-auto">
          {loading && <Spinner />}
          {error   && <ErrorBanner message={error} onRetry={load} />}

          {data && (
            <>
              {/* Stat cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3">
                <StatCard icon={<IconBox     />} value={data.stats.total}      label="Total Today" accent="#7c3aed" />
                <StatCard icon={<IconArrows  />} value={data.stats.in_transit} label="In Transit"  accent="#2563eb" />
                <StatCard icon={<IconCheck   />} value={data.stats.delivered}  label="Delivered"   accent="#059669" />
                <StatCard icon={<IconX       />} value={data.stats.canceled}   label="Canceled"    accent="#ef4444" />
                <StatCard icon={<IconPartial />} value={data.stats.partial}    label="Partial"     accent="#f97316" />
              </div>

              {/* Orders list */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="px-4 sm:px-5 py-3 sm:py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-slate-700">
                    {data.orders.length} orders assigned today
                  </span>
                  <span className="text-xs text-slate-400">📅 {data.date}</span>
                </div>

                {data.orders.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                    <svg className="w-10 h-10 mb-2 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <p className="text-sm">No orders for today</p>
                  </div>
                ) : (
                  data.orders.map((o) => (
                    <>
                      {/* Mobile: compact row without amount */}
                      <div key={`m-${o.id}`} className="sm:hidden">
                        <MobileOrderRow order={o} onClick={() => setSelected(o.id_raw)} />
                      </div>
                      {/* Desktop: full OrderRow with amount */}
                      <div key={`d-${o.id}`} className="hidden sm:block">
                        <OrderRow order={o} onClick={() => setSelected(o.id_raw)} />
                      </div>
                    </>
                  ))
                )}
              </div>
            </>
          )}
        </main>
      </div>

      {openOrder && (
        <OrderModal order={openOrder} onClose={() => setSelected(null)} onMutated={handleMutated} />
      )}
    </div>
  );
}