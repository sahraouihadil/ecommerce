import { useEffect, useState } from "react";
import { RotateCcw, LayoutDashboard, Boxes, Truck, Bot, DollarSign } from "lucide-react";

import Header from "../ui/Header";
import Sidebar from "../ui/Sidebar";
import api from "../../services/api";

const BASE = "http://127.0.0.1:8000";
const img  = (path) => (path ? `${BASE}/${path}` : null);

// STAT CARD
const Stat = ({ title, value, subtitle, icon, accent }) => (
  <div
    className="relative overflow-hidden rounded-2xl p-6 border"
    style={{
      background: "white",
      borderColor: "#EAECF4",
      boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
    }}
  >
    <div
      className="absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-10"
      style={{ background: accent }}
    />
    <div className="flex items-start justify-between">
      <div>
        <p className="text-xs font-medium tracking-widest uppercase text-gray-400 mb-3">
          {title}
        </p>
        <h2
          className="text-3xl font-bold tracking-tight"
          style={{ color: "#1a1d2e", fontFamily: "'DM Sans', sans-serif" }}
        >
          {value}
        </h2>
        <span className="text-xs mt-1 block" style={{ color: accent }}>
          {subtitle}
        </span>
      </div>
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: `${accent}18` }}
      >
        <span style={{ color: accent }}>{icon}</span>
      </div>
    </div>
  </div>
);

// STATUS BADGE
const StatusBadge = ({ status }) => {
  const config = {
    canceled:   { bg: "#FFF1F2", color: "#BE123C", label: "Canceled" },
    cancelled:  { bg: "#FFF1F2", color: "#BE123C", label: "Cancelled" },
    pending:    { bg: "#FFF7ED", color: "#C2610C", label: "Pending" },
    approved:   { bg: "#ECFDF5", color: "#059669", label: "Approved" },
    refunded:   { bg: "#F0FDF4", color: "#16A34A", label: "Refunded" },
    rejected:   { bg: "#FFF1F2", color: "#BE123C", label: "Rejected" },
    inspecting: { bg: "#EFF6FF", color: "#2563EB", label: "Inspecting" },
    restocked:  { bg: "#F0FDF4", color: "#16A34A", label: "Restocked" },
  };

  const s = config[status?.toLowerCase()] || {
    bg: "#F3F4F6",
    color: "#6B7280",
    label: status || "—",
  };

  return (
    <span
      className="px-3 py-1 text-xs font-semibold rounded-full"
      style={{ background: s.bg, color: s.color, letterSpacing: "0.02em" }}
    >
      {s.label}
    </span>
  );
};

// AVATAR
const Avatar = ({ name }) => {
  const colors = [
    "#6366F1","#8B5CF6","#EC4899","#F59E0B","#10B981","#3B82F6","#EF4444",
  ];
  const initials = name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const color = colors[name?.charCodeAt(0) % colors.length];

  return (
    <div
      className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
      style={{ background: color }}
    >
      {initials}
    </div>
  );
};

export function ReturnsPage() {
  const [returns, setReturns] = useState([]);
  const [openBar, setOpenBar] = useState(window.innerWidth >= 600);

  // FETCH
  useEffect(() => {
    const fetchReturns = async () => {
      try {
        const res = await api.get("/api/returns");
        setReturns(res.data || []);
        console.log(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchReturns();
  }, []);

  const total  = returns.length;
  const refund = returns.reduce((s, r) => s + (r.amount || 0), 0);

  const stockManagerLinks = [
    { to: "/stock-manager-dash",             label: "Dashboard",        icon: <LayoutDashboard />, end: true },
    { to: "/stock-manager-dash/inventories", label: "Product's Catalog", icon: <Boxes /> },
    { to: "/stock-manager-dash/ar",          label: "AR/3D Management", icon: <Bot size={18} /> },
    { to: "/stock-manager-dash/deliveries",  label: "Delivery",         icon: <Truck /> },
    { to: "/stock-manager-dash/returns",     label: "Returns",          icon: <RotateCcw /> },
  ];

  const cols = ["Return ID", "Order", "Customer", "Product", "Reason", "Amount", "Date", "Status"];

  return (
    <div className="flex min-h-screen" style={{ background: "#F5F6FA" }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap');

        .returns-table th {
          font-family: 'DM Mono', monospace;
          font-size: 10px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #9CA3AF;
          font-weight: 500;
          padding: 14px 20px;
          text-align: left;
          border-bottom: 1px solid #F0F1F7;
        }
        .returns-table td {
          padding: 16px 20px;
          border-bottom: 1px solid #F7F8FC;
          vertical-align: middle;
        }
        .returns-table tbody tr:last-child td { border-bottom: none; }
        .returns-table tbody tr { transition: background 0.15s ease; }
        .returns-table tbody tr:hover { background: #FAFBFF; }

        .ret-id {
          font-family: 'DM Mono', monospace;
          font-size: 12px;
          font-weight: 500;
          color: #6366F1;
          background: #EEF2FF;
          padding: 4px 10px;
          border-radius: 6px;
          display: inline-block;
        }
        .ord-id {
          font-family: 'DM Mono', monospace;
          font-size: 12px;
          color: #8B5CF6;
          background: #F5F3FF;
          padding: 4px 10px;
          border-radius: 6px;
          display: inline-block;
        }
      `}</style>

      {/* SIDEBAR */}
      <Sidebar
        openBar={openBar}
        setOpenBar={setOpenBar}
        links={stockManagerLinks}
        title="StockManagerCore"
        subtitle="Returns System"
        role="Manager"
        profilePath="/stock-manager-dash/profile"
      />

      {/* MAIN */}
      <main className="flex-1 flex flex-col" style={{ fontFamily: "'DM Sans', sans-serif" }}>
        <Header concept="Returns Dashboard" />

        <div className="p-8 flex flex-col gap-8">

          {/* PAGE TITLE */}
          <div>
            <p className="text-sm mt-1" style={{ color: "#9CA3AF" }}>
              Manage customer return requests
            </p>
          </div>

          {/* STATS */}
          <div className="grid grid-cols-2 gap-5" style={{ maxWidth: 560 }}>
            <Stat
              title="Total Returns"
              value={total}
              subtitle="All requests"
              icon={<RotateCcw size={18} />}
              accent="#6366F1"
            />
            <Stat
              title="Refund Value"
              value={`${refund.toLocaleString()} DA`}
              subtitle="Total exposure"
              icon={<span className="text-sm font-medium">DA</span>}
              accent="#8B5CF6"
            />
          </div>

          {/* TABLE CARD */}
          <div
            className="rounded-2xl overflow-hidden border"
            style={{
              background: "white",
              borderColor: "#EAECF4",
              boxShadow: "0 1px 6px rgba(0,0,0,0.05)",
            }}
          >
            <div className="px-6 py-5 border-b" style={{ borderColor: "#F0F1F7" }}>
              <h2 className="font-semibold text-sm" style={{ color: "#1A1D2E" }}>
                Return Requests
              </h2>
              <p className="text-xs mt-0.5" style={{ color: "#9CA3AF" }}>
                {total} total entries
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full returns-table">
                <thead>
                  <tr>
                    {cols.map((c) => (
                      <th key={c}>{c}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {returns.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-16">
                        <RotateCcw
                          size={28}
                          className="mx-auto mb-3"
                          style={{ color: "#D1D5DB" }}
                        />
                        <p className="text-sm" style={{ color: "#9CA3AF" }}>
                          No returns found
                        </p>
                      </td>
                    </tr>
                  ) : (
                    returns.map((r) => (
                      <tr key={r.id}>

                        {/* Return ID */}
                        <td>
                          <span className="ret-id">
                            {r.return_id || `RET-${String(r.id).padStart(3, "0")}`}
                          </span>
                        </td>

                        {/* Order */}
                        <td>
                          <span className="ord-id">
                            {r.order_id || `ORD-${String(r.id).padStart(3, "0")}`}
                          </span>
                        </td>

                        {/* Customer */}
                        <td>
                          <div className="flex items-center gap-3">
                            <Avatar name={r.customer_name || r.product_name} />
                            <span className="text-sm font-medium" style={{ color: "#374151" }}>
                              {r.customer_name || "—"}
                            </span>
                          </div>
                        </td>

                        {/* Product */}
                        <td>
                          <div className="flex items-center gap-3">
                            {r.image && (
                              <img
                                src={img(r.image)}
                                className="w-8 h-8 rounded-lg object-cover border"
                                style={{ borderColor: "#F0F1F7" }}
                              />
                            )}
                            <span className="text-sm font-medium" style={{ color: "#1A1D2E" }}>
                              {r.product_name}
                            </span>
                          </div>
                        </td>

                        {/* Reason */}
                        <td>
                          <span
                            className="text-sm max-w-[160px] block truncate"
                            style={{ color: "#6B7280" }}
                            title={r.reason}
                          >
                            {r.reason || "—"}
                          </span>
                        </td>

                        {/* Amount */}
                        <td>
                          <span className="text-sm font-bold" style={{ color: "#1A1D2E" }}>
                            {(r.amount || 0).toLocaleString()} DA
                          </span>
                        </td>

                        {/* Date */}
                        <td>
                          <span
                            className="text-sm"
                            style={{
                              color: "#9CA3AF",
                              fontFamily: "'DM Mono', monospace",
                              fontSize: 12,
                            }}
                          >
                            {r.date || "—"}
                          </span>
                        </td>

                        {/* Status */}
                        <td>
                          <StatusBadge status={r.status} />
                        </td>

                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}