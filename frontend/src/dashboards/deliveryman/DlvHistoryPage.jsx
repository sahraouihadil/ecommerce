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

const IconTrend = () => <svg className="w-5 h-5 text-violet-600"  fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg>;
const IconCheck = () => <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>;
const IconWarn  = () => <svg className="w-5 h-5 text-rose-500"    fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>;

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
        {order.date && <p className="text-xs text-slate-400">{order.date}</p>}
      </div>
      <svg className="w-4 h-4 text-slate-300 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
      </svg>
    </div>
  );
}

export default function DlvHistoryPage() {
  const [openBar,    setOpenBar]    = useState(window.innerWidth >= 600);
  const [data,       setData]       = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);
  const [dateFilter, setDateFilter] = useState("");
  const [selected,   setSelected]   = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/api/deliveryman/orders/history", {
        params: dateFilter ? { date_filter: dateFilter } : {},
      });
      setData(res.data);
    } catch (e) {
      setError(e.response?.data?.detail || e.message);
    } finally {
      setLoading(false);
    }
  }, [dateFilter]);

  useEffect(() => { load(); }, [load]);

  const openOrder = data?.orders?.find((o) => o.id_raw === selected);

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar
        openBar={openBar} setOpenBar={setOpenBar} links={LINKS}
        title="DeliveryApp" subtitle="Driver Panel" role="Deliveryman"
        profilePath="/deliveryman-dash/profile"
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header concept="Deliveries History" setOpenBar={setOpenBar} openBar={openBar} />

        <main className="flex-1 p-3 sm:p-5 space-y-3 sm:space-y-5 overflow-y-auto">

          {/* Date filter */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 px-4 sm:px-5 py-3 sm:py-4 flex flex-wrap items-center gap-3">
            <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m21 21-4.35-4.35"/>
            </svg>
            <div className="flex-1 min-w-[80px]">
              <p className="text-xs font-semibold text-slate-500">Filter by Date</p>
              <p className="text-xs text-slate-400 hidden sm:block">Enter a date to see its orders</p>
            </div>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => { setDateFilter(e.target.value); setSelected(null); }}
              className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-300 w-full sm:w-auto"
            />
            {dateFilter && (
              <button
                onClick={() => { setDateFilter(""); setSelected(null); }}
                className="text-xs font-semibold text-violet-600 hover:underline whitespace-nowrap"
              >
                Clear
              </button>
            )}
          </div>

          {loading && <Spinner />}
          {error   && <ErrorBanner message={error} onRetry={load} />}

          {data && (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                <StatCard icon={<IconTrend />} value={data.stats.total}                  label="Total History" accent="#7c3aed" />
                <StatCard icon={<IconCheck />} value={data.stats.delivered}              label="Delivered"     accent="#059669" />
                <StatCard icon={<IconWarn  />} value={data.stats.canceled}               label="Canceled"      accent="#f43f5e" />
                <StatCard icon={<span className="text-xs font-bold text-violet-600">DZD</span>} value={`${data.stats.total_earned}DA`} label="Total Earned" accent="#7c3aed" />
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                {data.orders.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                    <svg className="w-10 h-10 mb-2 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                    </svg>
                    <p className="text-sm">{dateFilter ? "No orders found for this date" : "No history yet"}</p>
                  </div>
                ) : (
                  data.orders.map((o) => (
                    <>
                      <div key={`m-${o.id}`} className="sm:hidden">
                        <MobileOrderRow order={o} onClick={() => setSelected(o.id_raw)} />
                      </div>
                      <div key={`d-${o.id}`} className="hidden sm:block">
                        <OrderRow order={o} onClick={() => setSelected(o.id_raw)} showDate showRating />
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
        <OrderModal order={openOrder} onClose={() => setSelected(null)} onMutated={() => {}} />
      )}
    </div>
  );
}