import { useCallback, useEffect, useState } from "react";
import {
  LayoutDashboard, Boxes, Truck, RotateCcw, Bot, TriangleAlert,
  Search, X, MapPin, Calendar, Clock, CheckCircle2, Loader2,
  Phone, MessageSquare, Eye, RefreshCw,
  Package, ShieldCheck, ArrowUpRight,
  User, CreditCard, FileText, AlertCircle,
} from "lucide-react";

import Header  from "../ui/Header";
import Sidebar from "../ui/Sidebar";
import api     from "../../services/api";

// ── constants ────────────────────────────────────────────────────────────────
const REASON_PRIORITY = {
  "Customer not reachable": "high",
  "Wrong address":          "critical",
  "Product damaged":        "critical",
  "Traffic delay":          "medium",
  "Other":                  "low",
};

const PRIORITIES = [
  { key: "critical", label: "Critical", dot: "bg-red-500",    badge: "bg-red-100 text-red-700 border-red-200"          },
  { key: "high",     label: "High",     dot: "bg-orange-400", badge: "bg-orange-100 text-orange-700 border-orange-200" },
  { key: "medium",   label: "Medium",   dot: "bg-amber-400",  badge: "bg-amber-100 text-amber-700 border-amber-200"    },
  { key: "low",      label: "Low",      dot: "bg-blue-400",   badge: "bg-blue-100 text-blue-700 border-blue-200"       },
];
const PRI_MAP = Object.fromEntries(PRIORITIES.map(p => [p.key, p]));

// "all" shows only status=="problem" orders (open + in_review).
// "resolved" is a separate filter that queries by problem_notes=="resolved".
const STATUS_FILTERS = [
  { key: "all",       label: "All"       },
  { key: "open",      label: "Open"      },
  { key: "in_review", label: "In Review" },
  { key: "resolved",  label: "Resolved"  },
];

const stockManagerLinks = [
  { to: "/stock-manager-dash",             label: "Dashboard",         icon: <LayoutDashboard />, end: true },
  { to: "/stock-manager-dash/inventories", label: "Product's Catalog", icon: <Boxes />            },
  { to: "/stock-manager-dash/ar",          label: "AR/3D Management",  icon: <Bot size={18} />    },
  { to: "/stock-manager-dash/deliveries",  label: "Delivery",          icon: <Truck />            },
  { to: "/stock-manager-dash/problems",    label: "Problems",          icon: <TriangleAlert />    },
  { to: "/stock-manager-dash/returns",     label: "Returns",           icon: <RotateCcw />        },
];

// ── helpers ───────────────────────────────────────────────────────────────────
function fmtDate(s) {
  if (!s) return "—";
  const [y, m, d] = s.slice(0, 10).split("-");
  return d + "/" + m + "/" + y;
}
function fmtDateShort(s) {
  if (!s) return "—";
  const [y, m, d] = s.slice(0, 10).split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
  });
}
function getInitials(name) {
  if (!name) return "";
  return name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
}
const AVATAR_COLORS = [
  "bg-blue-500","bg-emerald-500","bg-orange-500",
  "bg-pink-500","bg-violet-500","bg-teal-500",
];
function avatarColor(name) {
  if (!name) return AVATAR_COLORS[0];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}
function Avatar({ name, size }) {
  const s = size || "w-9 h-9";
  const n = name || "";
  return (
    <div className={`${s} ${avatarColor(n)} rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0`}>
      {getInitials(n)}
    </div>
  );
}

// ── sub-components ────────────────────────────────────────────────────────────
function PriorityDot({ priority }) {
  const p = PRI_MAP[priority];
  if (!p) return null;
  return <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${p.dot}`} title={p.label} />;
}

function ReviewBadge({ status }) {
  if (status === "open")
    return (
      <span className="text-xs font-semibold text-gray-400 bg-gray-100 border border-gray-200 px-2 py-0.5 rounded-full">
        Open
      </span>
    );
  if (status === "in_review")
    return (
      <span className="text-xs font-semibold text-violet-600 bg-violet-50 border border-violet-200 px-2 py-0.5 rounded-full">
        In Review
      </span>
    );
  if (status === "resolved")
    return (
      <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
        <CheckCircle2 size={10} /> Resolved
      </span>
    );
  return null;
}

function ReasonBadge({ reason }) {
  if (!reason) return null;
  const pri = REASON_PRIORITY[reason] || "low";
  const p   = PRI_MAP[pri];
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${p.badge}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${p.dot}`} />
      {reason}
    </span>
  );
}

// ── detail modal ──────────────────────────────────────────────────────────────
function DetailModal({ order, onClose, onReview, onResolve, updating }) {
  if (!order) return null;

  const iconBg =
    order.priority === "critical" ? "bg-red-100"    :
    order.priority === "high"     ? "bg-orange-100" :
    order.priority === "medium"   ? "bg-amber-100"  : "bg-blue-100";

  const iconColor =
    order.priority === "critical" ? "text-red-600"    :
    order.priority === "high"     ? "text-orange-500" :
    order.priority === "medium"   ? "text-amber-500"  : "text-blue-500";

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full max-w-lg rounded-2xl shadow-2xl flex flex-col overflow-hidden max-h-[90vh]">

        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-start justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconBg}`}>
              <AlertCircle size={18} className={iconColor} />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">{order.problem_reason || "Problem"}</p>
              <p className="text-xs text-gray-400">Order #{order.order_id}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 cursor-pointer transition"
          >
            <X size={15} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

          {/* Status row */}
          <div className="flex items-center gap-2 flex-wrap">
            <ReasonBadge reason={order.problem_reason} />
            <ReviewBadge status={order.problem_notes} />
            <span className="text-xs text-gray-400 ml-auto">{fmtDateShort(order.orderdate)}</span>
          </div>

          {/* Deliveryman report */}
          {order.problem && (
            <div className="bg-red-50 border border-red-100 rounded-xl p-4">
              <p className="text-xs font-bold text-red-600 mb-1 flex items-center gap-1.5">
                <MessageSquare size={11} /> Deliveryman Report
              </p>
              <p className="text-sm text-gray-700 leading-relaxed">{order.problem}</p>
            </div>
          )}

          {/* Customer */}
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2.5">Customer</p>
            <div className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 bg-gray-50">
              <Avatar name={order.customer_name} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800">{order.customer_name}</p>
                {order.customer_email && (
                  <p className="text-xs text-gray-400 truncate">{order.customer_email}</p>
                )}
              </div>
              {order.customer_phone && (
                <a
                  href={`tel:${order.customer_phone}`}
                  className="w-8 h-8 flex items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition cursor-pointer"
                >
                  <Phone size={13} />
                </a>
              )}
            </div>
          </div>

          {/* Deliveryman */}
          {order.deliveryman && (
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2.5">Deliveryman</p>
              <div className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 bg-gray-50">
                <Avatar name={order.deliveryman} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800">{order.deliveryman}</p>
                  {order.deliveryman_phone && (
                    <p className="text-xs text-gray-400">{order.deliveryman_phone}</p>
                  )}
                </div>
                {order.deliveryman_phone && (
                  <a
                    href={`tel:${order.deliveryman_phone}`}
                    className="w-8 h-8 flex items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition cursor-pointer"
                  >
                    <Phone size={13} />
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Order details grid */}
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2.5">Order Details</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { icon: MapPin,     label: "Wilaya",        value: order.wilaya },
                { icon: Package,    label: "Items",         value: `${order.items_count} item${order.items_count !== 1 ? "s" : ""}` },
                { icon: CreditCard, label: "Amount",        value: `${Number(order.totalamount || 0).toLocaleString("fr-DZ")} DA` },
                { icon: Calendar,   label: "Order Date",    value: fmtDate(order.orderdate)    },
                { icon: Calendar,   label: "Delivery Date", value: fmtDate(order.deliverydate) },
                { icon: Clock,      label: "Delivery Type", value: order.delivery_type || "—"  },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-0.5 flex items-center gap-1">
                    <Icon size={9} /> {label}
                  </p>
                  <p className="text-sm font-semibold text-gray-800 truncate">{value || "—"}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Customer note */}
          {order.notes && (
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
              <p className="text-xs font-bold text-amber-600 mb-1 flex items-center gap-1.5">
                <FileText size={11} /> Customer Note
              </p>
              <p className="text-sm text-gray-700 leading-relaxed">{order.notes}</p>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="px-6 py-4 border-t border-gray-100 flex gap-2 shrink-0 flex-wrap">
          {order.deliveryman_phone && (
            <a
              href={`tel:${order.deliveryman_phone}`}
              className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-600 text-sm font-semibold cursor-pointer transition"
            >
              <Phone size={13} /> Call Driver
            </a>
          )}

          {order.problem_notes === "open" && (
            <button
              onClick={() => onReview(order.order_id, "in_review")}
              disabled={updating}
              className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold cursor-pointer transition disabled:opacity-50"
            >
              {updating ? <Loader2 size={13} className="animate-spin" /> : <Eye size={13} />}
              Take for Review
            </button>
          )}

          {order.problem_notes === "in_review" && (
            <button
              onClick={() => onReview(order.order_id, "open")}
              disabled={updating}
              className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm font-semibold cursor-pointer transition disabled:opacity-50"
            >
              <RefreshCw size={13} /> Back to Open
            </button>
          )}

          {order.problem_notes !== "resolved" && (
            <button
              onClick={() => onResolve(order.order_id)}
              disabled={updating}
              className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold cursor-pointer transition disabled:opacity-50"
            >
              {updating ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle2 size={13} />}
              Mark Resolved
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── problem card ──────────────────────────────────────────────────────────────
function ProblemCard({ order, onReview, onResolve, onSelect, updating }) {
  return (
    <div
      className="bg-white rounded-2xl border border-gray-200 shadow-sm px-6 py-5 hover:border-gray-300 hover:shadow-md transition-all cursor-pointer group"
      onClick={() => onSelect(order)}
    >
      {/* Title row */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <PriorityDot priority={order.priority} />
          <p className="text-base font-bold text-gray-900 truncate">
            {order.problem_reason || "Delivery Problem"}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <ReviewBadge status={order.problem_notes} />
          <span className="text-xs text-gray-300 group-hover:text-indigo-400 transition">
            <ArrowUpRight size={14} />
          </span>
        </div>
      </div>

      {/* Deliveryman report snippet */}
      {order.problem && (
        <div className="flex items-start gap-2 mb-4">
          <MessageSquare size={13} className="text-gray-300 mt-0.5 shrink-0" />
          <p className="text-sm text-gray-500 leading-relaxed line-clamp-2">{order.problem}</p>
        </div>
      )}

      {/* Meta row */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <div className="flex items-center gap-1.5">
          <Avatar name={order.customer_name} size="w-5 h-5" />
          <span className="text-xs font-medium text-gray-600">{order.customer_name}</span>
        </div>
        <span className="text-gray-200">·</span>
        <span className="text-xs text-gray-400 flex items-center gap-1">
          <MapPin size={10} className="text-gray-300" />{order.wilaya}
        </span>
        <span className="text-gray-200">·</span>
        <span className="text-xs text-gray-400">#{order.order_id}</span>
        <span className="text-gray-200">·</span>
        <span className="text-xs font-semibold text-gray-600">
          {Number(order.totalamount || 0).toLocaleString("fr-DZ")} DA
        </span>
        {order.deliveryman && (
          <>
            <span className="text-gray-200">·</span>
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <User size={10} className="text-gray-300" />{order.deliveryman}
            </span>
          </>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-2 flex-wrap" onClick={e => e.stopPropagation()}>

        {order.deliveryman_phone && (
          <a
            href={`tel:${order.deliveryman_phone}`}
            className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 active:scale-95 px-3.5 py-2 rounded-xl transition-all cursor-pointer"
          >
            <Phone size={11} /> Call Driver
          </a>
        )}

        {order.problem_notes === "open" && (
          <button
            onClick={() => onReview(order.order_id, "in_review")}
            disabled={updating === order.order_id}
            className="flex items-center gap-1.5 text-xs font-semibold text-white bg-violet-600 hover:bg-violet-700 active:scale-95 px-3.5 py-2 rounded-xl transition-all cursor-pointer shadow-sm disabled:opacity-50"
          >
            {updating === order.order_id
              ? <Loader2 size={11} className="animate-spin" />
              : <Eye size={11} />}
            Take for Review
          </button>
        )}

        {order.problem_notes === "in_review" && (
          <span className="text-xs font-semibold text-violet-600 bg-violet-50 border border-violet-200 px-3.5 py-2 rounded-xl flex items-center gap-1.5">
            <Eye size={11} /> In Review
          </span>
        )}

        {order.problem_notes !== "resolved" && (
          <button
            onClick={() => onResolve(order.order_id)}
            disabled={updating === order.order_id}
            className="flex items-center gap-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 px-3.5 py-2 rounded-xl transition-all cursor-pointer shadow-sm disabled:opacity-50"
          >
            {updating === order.order_id
              ? <Loader2 size={11} className="animate-spin" />
              : <CheckCircle2 size={11} />}
            Mark Resolved
          </button>
        )}
      </div>
    </div>
  );
}

// ── MAIN PAGE ─────────────────────────────────────────────────────────────────
export default function ProblemsPage() {
  const [orders,        setOrders]        = useState([]);
  const [stats,         setStats]         = useState({});
  const [loading,       setLoading]       = useState(true);
  const [openBar,       setOpenBar]       = useState(window.innerWidth >= 600);
  const [search,        setSearch]        = useState("");
  const [statusFilter,  setStatusFilter]  = useState("all");
  const [priFilter,     setPriFilter]     = useState("all");
  const [updating,      setUpdating]      = useState(null);
  const [message,       setMessage]       = useState("");
  const [messageType,   setMessageType]   = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);

  const showFlash = (msg, type = "success") => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => { setMessage(""); setMessageType(""); }, 3500);
  };

  // ── fetch ──────────────────────────────────────────────────────────────────
  const fetchProblems = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search)                 params.set("search",   search);
      if (priFilter    !== "all") params.set("priority", priFilter);
      if (statusFilter !== "all") params.set("status",   statusFilter);
      const res = await api.get(`/api/problems?${params}`);
      setOrders(res.data.orders || []);
      setStats(res.data.stats   || {});
    } catch (err) {
      console.error(err);
      showFlash("Failed to load problems", "error");
    } finally {
      setLoading(false);
    }
  }, [search, priFilter, statusFilter]);

  useEffect(() => {
    const t = setTimeout(fetchProblems, 350);
    return () => clearTimeout(t);
  }, [fetchProblems]);

  // ── patch local state after mutations ─────────────────────────────────────
  const patchLocal = (orderId, patch) => {
    setOrders(prev => prev.map(o => o.order_id === orderId ? { ...o, ...patch } : o));
    setSelectedOrder(prev => prev?.order_id === orderId ? { ...prev, ...patch } : prev);
  };

  // ── review toggle (open ↔ in_review) ──────────────────────────────────────
  const handleReview = async (orderId, reviewStatus) => {
    setUpdating(orderId);
    try {
      await api.patch(`/api/problems/${orderId}/review`, { review_status: reviewStatus });
      patchLocal(orderId, { problem_notes: reviewStatus });
      showFlash(reviewStatus === "in_review" ? "Taken for review" : "Moved back to open");
    } catch {
      showFlash("Failed to update status", "error");
    } finally {
      setUpdating(null);
    }
  };

  // ── resolve ────────────────────────────────────────────────────────────────
  const handleResolve = async (orderId) => {
    setUpdating(orderId);
    try {
      await api.patch(`/api/problems/${orderId}/resolve`);
      // Backend sets status="shipped" and problem_notes="resolved"
      patchLocal(orderId, { problem_notes: "resolved", status: "shipped" });
      showFlash("Order resolved and moved to shipped");
    } catch {
      showFlash("Failed to resolve order", "error");
    } finally {
      setUpdating(null);
    }
  };

  // ── stat tiles ─────────────────────────────────────────────────────────────
  // "total" = active problems only (status=="problem"), not counting resolved
  const statTiles = [
    {
      label: "Active Problems", value: stats.total     || 0,
      color: "text-gray-800",    bg: "bg-gray-50",    border: "border-gray-200",
      filterKey: "all",
    },
    {
      label: "Open",            value: stats.open      || 0,
      color: "text-red-600",     bg: "bg-red-50",     border: "border-red-100",
      filterKey: "open",
    },
    {
      label: "In Review",       value: stats.in_review || 0,
      color: "text-violet-600",  bg: "bg-violet-50",  border: "border-violet-100",
      filterKey: "in_review",
    },
    {
      label: "Resolved",        value: stats.resolved  || 0,
      color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100",
      filterKey: "resolved",
    },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar
        openBar={openBar} setOpenBar={setOpenBar}
        links={stockManagerLinks}
        title="StockManagerCore" subtitle="Enterprise Suite"
        role="Manager" profilePath="/stock-manager-dash/profile"
      />

      <main className="flex-1 min-w-0">
        <Header concept="Delivery Problems" />

        <div className="p-6 space-y-5">

          {/* Flash message */}
          {message && (
            <div className={`p-3 rounded-lg border-l-4 text-sm font-medium flex items-center gap-2 ${
              messageType === "success"
                ? "bg-green-50 text-green-800 border-green-500"
                : "bg-red-50 text-red-800 border-red-500"
            }`}>
              {messageType === "success"
                ? <CheckCircle2 size={15} className="shrink-0" />
                : <AlertCircle  size={15} className="shrink-0" />}
              {message}
            </div>
          )}

          {/* Top card */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <p className="text-sm text-gray-400 mb-5">Issues reported by delivery personnel</p>

            {/* Stat tiles — clicking sets the status filter */}
            <div className="grid grid-cols-4 gap-3 mb-5">
              {statTiles.map(({ label, value, color, bg, border, filterKey }) => (
                <button
                  key={label}
                  onClick={() => setStatusFilter(filterKey)}
                  className={`${bg} border ${border} rounded-xl p-4 text-center cursor-pointer transition-all hover:shadow-md ${
                    statusFilter === filterKey ? "ring-2 ring-offset-1 ring-gray-400" : ""
                  }`}
                >
                  <p className={`text-2xl font-bold ${color}`}>{value}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{label}</p>
                </button>
              ))}
            </div>

            {/* Priority filter pills */}
            <div className="flex items-center gap-2 flex-wrap">
              {[{ key: "all", label: "All Priority" }, ...PRIORITIES].map(p => (
                <button
                  key={p.key}
                  onClick={() => setPriFilter(p.key)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                    priFilter === p.key
                      ? "bg-gray-900 text-white border-gray-900"
                      : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  {p.dot && <span className={`w-2 h-2 rounded-full ${p.dot}`} />}
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Search bar */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-5 py-4">
            <div className="flex items-center gap-3 border border-gray-200 rounded-xl px-4 py-2.5 focus-within:ring-2 focus-within:ring-indigo-400 bg-gray-50">
              <Search size={16} className="text-gray-400 shrink-0" />
              <input
                className="flex-1 bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400"
                placeholder="Search by customer, wilaya, or reason…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="text-gray-300 hover:text-gray-500 cursor-pointer transition"
                >
                  <X size={14} />
                </button>
              )}
              <span className="text-xs text-gray-400 shrink-0">{orders.length} issues</span>
            </div>
          </div>

          {/* Status filter tabs */}
          <div className="flex items-center gap-2 flex-wrap">
            {STATUS_FILTERS.map(f => (
              <button
                key={f.key}
                onClick={() => setStatusFilter(f.key)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                  statusFilter === f.key
                    ? "bg-gray-900 text-white border-gray-900"
                    : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                }`}
              >
                {f.label}
                {f.key !== "all" && (stats[f.key] || 0) > 0 && (
                  <span className="ml-1.5 text-[10px] opacity-60">({stats[f.key]})</span>
                )}
              </button>
            ))}
          </div>

          {/* Cards list */}
          <div className="space-y-3">
            {loading ? (
              <div className="flex items-center justify-center gap-2 py-16 text-gray-400 text-sm">
                <Loader2 size={16} className="animate-spin" /> Loading problems…
              </div>
            ) : orders.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-200 p-16 text-center">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto mb-4">
                  <ShieldCheck size={24} className="text-emerald-500" />
                </div>
                <p className="text-base font-bold text-gray-700">All clear!</p>
                <p className="text-sm text-gray-400 mt-1">No problem orders match your current filters.</p>
              </div>
            ) : (
              orders.map(order => (
                <ProblemCard
                  key={order.order_id}
                  order={order}
                  onReview={handleReview}
                  onResolve={handleResolve}
                  onSelect={setSelectedOrder}
                  updating={updating}
                />
              ))
            )}
          </div>

        </div>
      </main>

      {/* Detail modal */}
      {selectedOrder && (
        <DetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onReview={handleReview}
          onResolve={handleResolve}
          updating={updating === selectedOrder.order_id}
        />
      )}
    </div>
  );
}