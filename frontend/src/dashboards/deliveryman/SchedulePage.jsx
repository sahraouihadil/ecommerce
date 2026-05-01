/**
 * pages/SchedulePage.jsx
 *
 * GET /api/deliveryman/schedule?year=&month=  →  ScheduleOut
 */

import { useState, useEffect, useCallback } from "react";
import api from "../../services/api";
import { Spinner, ErrorBanner, OrderModal, StatusBadge } from "../ui/Shared";
import Sidebar from "../ui/Sidebar";
import Header from "../ui/Header";

// ── Constants ─────────────────────────────────────────────────────────────────

const MONTH_NAMES = [
  "", "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

const DOT_COLORS = {
  delivered: "#10b981",
  problem:   "#ef4444",
};

// ── Sidebar links (shared route config) ──────────────────────────────────────

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

// ── Page ──────────────────────────────────────────────────────────────────────

export default function SchedulePage() {
  const now = new Date();

  const [openBar,       setOpenBar]       = useState(window.innerWidth >= 600);
  const [current,       setCurrent]       = useState({ year: now.getFullYear(), month: now.getMonth() + 1 });
  const [data,          setData]          = useState(null);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState(null);
  const [selectedDate,  setSelectedDate]  = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/api/deliveryman/schedule", {
        params: { year: current.year, month: current.month },
      });
      setData(res.data);
    } catch (e) {
      setError(e.response?.data?.detail || e.message);
    } finally {
      setLoading(false);
    }
  }, [current]);

  useEffect(() => { load(); }, [load]);

  function goMonth(dir) {
    setCurrent((c) => {
      let { year, month } = c;
      month += dir;
      if (month < 1)  { month = 12; year -= 1; }
      if (month > 12) { month = 1;  year += 1; }
      return { year, month };
    });
    setSelectedDate(null);
    setSelectedOrder(null);
  }

  const dayMap      = data?.schedule ?? {};
  const daysInMonth = new Date(current.year, current.month, 0).getDate();
  const firstDay    = new Date(current.year, current.month - 1, 1).getDay();

  const selectedDayData = selectedDate ? dayMap[selectedDate] : null;
  const openOrder = selectedOrder && selectedDayData
    ? selectedDayData.orders.find((o) => o.id_raw === selectedOrder)
    : null;

  function handleMutated(updated) {
    setData((prev) => {
      if (!prev || !selectedDate) return prev;
      const dayOrders = (prev.schedule[selectedDate]?.orders ?? []).map((o) =>
        o.id_raw === updated.id_raw ? updated : o
      );
      return {
        ...prev,
        schedule: {
          ...prev.schedule,
          [selectedDate]: { ...prev.schedule[selectedDate], orders: dayOrders },
        },
      };
    });
  }

  // ── Render ────────────────────────────────────────────────────────────────
  // IMPORTANT: the outermost div must be `flex min-h-screen`.
  // Sidebar sits as a flex sibling to the main column — never inside
  // a space-y or stacking container, otherwise it collapses / overlays content.

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* ── Sidebar ── */}
      <Sidebar
        openBar={openBar}
        setOpenBar={setOpenBar}
        links={LINKS}
        title="DeliveryApp"
        subtitle="Driver Panel"
        role="Deliveryman"
        profilePath="/deliveryman-dash/profile"
      />

      {/* ── Main column ── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Top bar */}
         <Header concept="Schedule" setOpenBar={setOpenBar} openBar={openBar} />
          {/* Hamburger — shown only on mobile (< 600 px) */}
          <button
            onClick={() => setOpenBar((v) => !v)}
            className="min-[600px]:hidden w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          
        {/* Scrollable content area */}
        <main className="flex-1 p-5 space-y-5">
          {loading && <Spinner />}
          {error   && <ErrorBanner message={error} onRetry={load} />}

          {!loading && !error && (
            <div className="flex flex-col lg:flex-row gap-5">

              {/* ── Calendar ── */}
              <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
                {/* Month navigation */}
                <div className="flex items-center justify-between mb-5">
                  <button
                    onClick={() => goMonth(-1)}
                    className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors"
                  >
                    <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
                    </svg>
                  </button>
                  <span className="font-bold text-slate-800">
                    {MONTH_NAMES[current.month]} {current.year}
                  </span>
                  <button
                    onClick={() => goMonth(1)}
                    className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors"
                  >
                    <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
                    </svg>
                  </button>
                </div>

                {/* Day-of-week headers */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {["SUN","MON","TUE","WED","THU","FRI","SAT"].map((d) => (
                    <div key={d} className="text-center text-xs font-semibold text-slate-400 py-1">{d}</div>
                  ))}
                </div>

                {/* Day cells */}
                <div className="grid grid-cols-7 gap-1">
                  {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} />)}
                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day     = i + 1;
                    const dateStr = `${current.year}-${String(current.month).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
                    const cell    = dayMap[dateStr];
                    const isSel   = dateStr === selectedDate;
                    const isToday =
                      current.year  === now.getFullYear()  &&
                      current.month === now.getMonth() + 1 &&
                      day           === now.getDate();

                    return (
                      <button
                        key={day}
                        onClick={() => { setSelectedDate(dateStr); setSelectedOrder(null); }}
                        className={`relative aspect-square rounded-xl flex flex-col items-center justify-center text-sm transition-all
                          ${isSel
                            ? "text-white font-bold shadow-md"
                            : isToday
                              ? "text-violet-700 font-bold bg-violet-50"
                              : "text-slate-700 hover:bg-slate-50"
                          }`}
                        style={isSel ? { background: "linear-gradient(135deg,#7c3aed,#6d28d9)" } : {}}
                      >
                        {day}
                        {cell && (
                          <span
                            className="absolute bottom-1 w-1.5 h-1.5 rounded-full"
                            style={{ background: DOT_COLORS[cell.dot] ?? "#94a3b8" }}
                          />
                        )}
                        {cell && !isSel && (
                          <span className="absolute top-0.5 right-1 text-[9px] font-bold text-slate-400">
                            {cell.count}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Legend */}
                <div className="flex items-center gap-4 mt-4 pt-4 border-t border-slate-100">
                  {[["#2563eb","In-Transit"],["#10b981","Delivered"],["#e2e8f0","Canceled"],["#f97316","Partial"],["#ef4444","Problem"]].map(([c, l]) => (
                    <div key={l} className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full" style={{ background: c }} />
                      <span className="text-xs text-slate-500">{l}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── Day detail panel ── */}
              <div className="lg:w-80 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                {selectedDayData ? (
                  <>
                    <div className="px-5 py-4 border-b border-slate-100">
                      <p className="font-bold text-slate-800">
                        {new Date(selectedDate + "T00:00").toLocaleDateString("en-US", {
                          weekday: "long", month: "long", day: "numeric", year: "numeric",
                        })}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {selectedDayData.count}{" "}
                        {selectedDayData.count === 1 ? "delivery" : "deliveries"} scheduled
                      </p>
                    </div>

                    <div className="divide-y divide-slate-100">
                      {selectedDayData.orders.map((o) => (
                        <div
                          key={o.id}
                          onClick={() => setSelectedOrder(o.id_raw)}
                          className="flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50 cursor-pointer transition-colors"
                        >
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                            style={{ background: "rgba(124,58,237,0.08)" }}
                          >
                            <svg className="w-4 h-4 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10"/>
                            </svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-sm font-bold text-slate-800 truncate">{o.id}</span>
                              <StatusBadge status={o.status} />
                            </div>
                            <p className="text-xs text-slate-500 truncate">{o.customer}</p>
                            <div className="flex items-center justify-between mt-0.5">
                              <span className="text-xs font-semibold text-violet-700">
                                 {Number(o.amount).toFixed(2)}DA
                              </span>
                              {o.eta > 0 && (
                                <span className="text-xs text-slate-400">⏱ {o.eta} min</span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center h-48 text-slate-400">
                    <svg className="w-10 h-10 mb-2 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <rect x="3" y="4" width="18" height="18" rx="2"/>
                      <path d="M16 2v4M8 2v4M3 10h18"/>
                    </svg>
                    <p className="text-sm">Select a date to view orders</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ── Order detail modal ── */}
      {openOrder && (
        <OrderModal
          order={openOrder}
          onClose={() => setSelectedOrder(null)}
          onMutated={handleMutated}
        />
      )}
    </div>
  );
}