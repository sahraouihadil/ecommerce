import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import {
  LayoutDashboard, Boxes, Truck, RotateCcw, Search, X, MapPin, Calendar,
  Clock, CheckCircle2, Loader2, ChevronDown, ChevronUp, Users, Eye,
  RefreshCw, SendHorizonal, ChevronsUpDown, AlertTriangle, UserCheck,
  ArrowRight, Package, ChevronLeft, ChevronRight, Bot, Pencil, Save,
  SplitSquareHorizontal, AlertCircle,TriangleAlert
} from "lucide-react";

import Header from "../ui/Header";
import Sidebar from "../ui/Sidebar";
import api from "../../services/api";

const ALLOWED_WILAYAS = [
  "Constantine", "Mila", "Guelma", "Oum El Bouaghi", "Skikda", "Batna", "Sétif",
  "Jijel", "Annaba", "Bordj Bou Arréridj", "Khenchela", "Souk Ahras", "Béjaïa", "Tébessa",
];
function isAllowedWilaya(wilaya = "") {
  return ALLOWED_WILAYAS.some(w => w.toLowerCase() === wilaya.toLowerCase().trim());
}

const STATUSES = [
  { key:"Pending",    label:"Pending",    color:"bg-amber-100 text-amber-700 border-amber-200",          icon:Clock                  },
  { key:"Processing", label:"Processing", color:"bg-blue-100 text-blue-700 border-blue-200",             icon:RefreshCw              },
  { key:"Shipped",    label:"Shipped",    color:"bg-indigo-100 text-indigo-700 border-indigo-200",       icon:SendHorizonal          },
  { key:"Problem",    label:"Problem",    color:"bg-red-100 text-red-600 border-red-200",                icon:AlertCircle            },
  { key:"Partial",    label:"Partial",    color:"bg-green-100 text-green-600 border-green-200",          icon:SplitSquareHorizontal  },
  { key:"Canceled",   label:"Canceled",   color:"bg-gray-100 text-gray-500 border-gray-200",            icon:X                      },
  { key:"Delivered",  label:"Delivered",  color:"bg-emerald-100 text-emerald-700 border-emerald-200",   icon:CheckCircle2           },
];
const STATUS_MAP = Object.fromEntries(STATUSES.map(s => [s.key.toLowerCase(), s]));

const TYPE_COLORS = {
  "Any Time":     "bg-pink-100 text-pink-700 border-pink-200",
  "Day of Week":  "bg-violet-100 text-violet-700 border-violet-200",
  "Certain Date": "bg-teal-100 text-teal-700 border-teal-200",
};

function getInitials(name = "") {
  return name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
}
const AVATAR_COLORS = ["bg-blue-500","bg-green-500","bg-orange-500","bg-pink-500","bg-violet-500","bg-teal-500"];
function avatarColor(name = "") {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}
function Avatar({ name, size = "w-9 h-9" }) {
  return (
    <div className={`${size} ${avatarColor(name)} rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0`}>
      {getInitials(name)}
    </div>
  );
}
function SortHeader({ label, field, sortField, sortDir, onSort }) {
  const active = sortField === field;
  return (
    <button
      onClick={() => onSort(field)}
      className="flex items-center gap-1 text-xs font-semibold text-gray-400 tracking-wide uppercase hover:text-gray-600 transition cursor-pointer select-none"
    >
      {label}
      <span className={active ? "text-indigo-500" : "text-gray-300"}>
        {active ? (sortDir === "asc" ? <ChevronUp size={12}/> : <ChevronDown size={12}/>) : <ChevronsUpDown size={12}/>}
      </span>
    </button>
  );
}
function fmtDate(s) {
  if (!s) return null;
  const [year, month, day] = s.slice(0,10).split("-");
  return `${day}/${month}/${year}`;
}
function fmtDateShort(s) {
  if (!s) return null;
  const [year, month, day] = s.slice(0,10).split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-GB", { day:"2-digit", month:"short", year:"numeric" });
}
function fmtWeekday(s) {
  if (!s) return "";
  const [year, month, day] = s.slice(0,10).split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-GB", { weekday:"long" });
}

function toYMD(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function AssignButton({ deliverymanName, onClick, disabled }) {
  if (disabled) {
    // Static display only
    return deliverymanName ? (
      <div className="flex items-center gap-2">
        <Avatar name={deliverymanName} size="w-7 h-7"/>
        <div className="min-w-0">
          <p className="text-xs font-semibold text-gray-700 truncate max-w-[80px]">{deliverymanName}</p>
          <p className="text-[10px] text-gray-400">assigned</p>
        </div>
      </div>
    ) : (
      <span className="text-xs text-gray-300 italic">—</span>
    );
  }

  if (deliverymanName) {
    return (
      <button onClick={onClick} className="group flex items-center gap-2 hover:opacity-80 transition cursor-pointer">
        <Avatar name={deliverymanName} size="w-7 h-7"/>
        <div className="min-w-0">
          <p className="text-xs font-semibold text-gray-700 truncate max-w-[80px]">{deliverymanName}</p>
          <p className="text-[10px] text-indigo-400 group-hover:text-indigo-600 transition">change</p>
        </div>
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className="group flex items-center gap-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 px-3 py-1.5 rounded-xl transition-all cursor-pointer shadow-sm shadow-indigo-200"
    >
      <UserCheck size={12} className="group-hover:scale-110 transition-transform"/>
      Assign
    </button>
  );
}
// ─── DELIVERY DATE EDITOR ─────────────────────────────────────────────────────
function DeliveryDateCell({ orderId, deliverydate, status, onSave, saving }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue]     = useState(deliverydate ? deliverydate.slice(0,10) : "");
  const inputRef              = useRef(null);

  const isEditable = status === "pending";

  useEffect(() => {
    if (editing && inputRef.current) inputRef.current.focus();
  }, [editing]);

  const handleSave = async () => {
    if (!isEditable) return;

    if (value === (deliverydate ? deliverydate.slice(0,10) : "")) {
      setEditing(false);
      return;
    }

    await onSave(orderId, value);
    setEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSave();
    if (e.key === "Escape") {
      setValue(deliverydate ? deliverydate.slice(0,10) : "");
      setEditing(false);
    }
  };

  // 🔴 not pending → read-only view
  if (!isEditable) {
    return (
      <div className="flex items-center gap-1 opacity-60 cursor-not-allowed">
        <div className="w-6 h-6 rounded-lg bg-gray-100 flex items-center justify-center">
          <Calendar size={11} className="text-gray-400"/>
        </div>
        <div>
          <p className="text-xs font-semibold text-gray-600">
            {fmtDate(deliverydate) || <span className="text-gray-300 italic">—</span>}
          </p>
          {deliverydate && (
            <p className="text-xs text-gray-400">{fmtWeekday(deliverydate)}</p>
          )}
        </div>
      </div>
    );
  }

  // editing mode
  if (editing) {
    return (
      <div className="flex items-center gap-1">
        <input
          ref={inputRef}
          type="date"
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          className="text-xs border border-indigo-300 rounded-lg px-2 py-1 text-gray-700 bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-400 w-32"
        />
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-6 h-6 flex items-center justify-center rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition cursor-pointer disabled:opacity-50"
        >
          {saving ? <Loader2 size={10} className="animate-spin"/> : <Save size={10}/>}
        </button>
        <button
          onClick={() => {
            setValue(deliverydate ? deliverydate.slice(0,10) : "");
            setEditing(false);
          }}
          className="w-6 h-6 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-500 transition cursor-pointer"
        >
          <X size={10}/>
        </button>
      </div>
    );
  }

  // normal (clickable only if pending)
  return (
    <button
      onClick={() => setEditing(true)}
      className="group flex items-center gap-1.5 text-left hover:bg-indigo-50 rounded-lg px-1 py-0.5 -mx-1 transition"
    >
      <div className="w-6 h-6 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
        <Calendar size={11} className="text-blue-500"/>
      </div>
      <div>
        <p className="text-xs font-semibold text-gray-700 group-hover:text-indigo-600 transition">
          {fmtDate(deliverydate) || <span className="text-gray-300 italic">—</span>}
        </p>
        {deliverydate && (
          <p className="text-xs text-gray-400">{fmtWeekday(deliverydate)}</p>
        )}
      </div>
      <Pencil size={9} className="text-gray-300 group-hover:text-indigo-400 transition ml-0.5 shrink-0"/>
    </button>
  );
}

// ─── STATUS DROPDOWN — portal-based to escape overflow clipping ───────────────


function StatusDropdown({ orderId, currentStatus, onUpdate, updatingId }) {
  const [open, setOpen]       = useState(false);
  const [pos, setPos]         = useState({ top: 0, left: 0, width: 0 });
  const triggerRef            = useRef(null);
  const menuRef               = useRef(null);
  const st     = STATUS_MAP[currentStatus?.toLowerCase()];
  const StIcon = st?.icon || Clock;
  const busy   = updatingId === orderId;

  const openMenu = (e) => {
    e.stopPropagation();
    if (!triggerRef.current) return;
    const rect       = triggerRef.current.getBoundingClientRect();
    const menuH      = 280;
    const spaceBelow = window.innerHeight - rect.bottom;
    const up         = spaceBelow < menuH + 8;
    setPos({
      top:   up ? rect.top - menuH - 4 : rect.bottom + 4,
      left:  rect.left,
      width: rect.width,
    });
    setOpen(o => !o);
  };

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (
        triggerRef.current && !triggerRef.current.contains(e.target) &&
        menuRef.current    && !menuRef.current.contains(e.target)
      ) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const menu = open ? createPortal(
    <div
      ref={menuRef}
      style={{ position:"fixed", top: pos.top, left: pos.left, minWidth: 188, zIndex: 9999 }}
      className="bg-white border border-gray-200 rounded-xl shadow-xl py-1"
    >
      {STATUSES.map(s => {
        const SIcon     = s.icon;
        const isCurrent = currentStatus?.toLowerCase() === s.key.toLowerCase();
        return (
          <button
            key={s.key}
            onClick={(e) => { e.stopPropagation(); setOpen(false); onUpdate(orderId, s.key); }}
            className={`w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-gray-50 transition cursor-pointer text-left ${
              isCurrent ? "font-semibold text-indigo-600" : "text-gray-700"
            }`}
          >
            <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full border ${s.color}`}>
              <SIcon size={10}/>
            </span>
            <span className={
              s.key === "Partial" ? "text-green-600 font-medium" :
              s.key === "Problem" ? "text-red-600 font-medium"   :
              isCurrent           ? "text-indigo-600 font-semibold" :
              "text-gray-700"
            }>
              {s.label}
            </span>
            {isCurrent && <CheckCircle2 size={11} className="ml-auto text-indigo-400"/>}
          </button>
        );
      })}
    </div>,
    document.body
  ) : null;

  return (
    <>
      <button
        ref={triggerRef}
        disabled={busy}
        onClick={openMenu}
        className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1.5 m-2 rounded-full font-medium border cursor-pointer hover:opacity-80 transition ${
          st?.color || "bg-gray-100 text-gray-600 border-gray-200"
        } ${busy ? "opacity-60 cursor-not-allowed" : ""}`}
      >
        {busy ? <Loader2 size={11} className="animate-spin"/> : <StIcon size={11}/>}
        {currentStatus}
        {!busy && <ChevronDown size={10}/>}
      </button>
      {menu}
    </>
  );
}

// ─── CALENDAR TAB ─────────────────────────────────────────────────────────────
function DeliveryCalendar({ dmOrders }) {
  const today    = new Date();
  const todayYMD = toYMD(today);
  const [calYear,     setCalYear]     = useState(today.getFullYear());
  const [calMonth,    setCalMonth]    = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState(null);

  // Map date → array of orders (multiple orders per day supported)
  const orderByDate = useMemo(() => {
    const m = {};
    dmOrders.forEach(o => {
      if (o.deliverydate) {
        const key = o.deliverydate.slice(0, 10);
        if (!m[key]) m[key] = [];
        m[key].push(o);
      }
    });
    return m;
  }, [dmOrders]);

  const monthLabel = new Date(calYear, calMonth, 1)
    .toLocaleDateString("en-GB", { month:"long", year:"numeric" });
  const firstDayOfWeek = new Date(calYear, calMonth, 1).getDay();
  const daysInMonth    = new Date(calYear, calMonth + 1, 0).getDate();

  const deliveriesThisMonth = Object.keys(orderByDate).filter(k => {
    const [y, mo] = k.split("-").map(Number);
    return y === calYear && mo - 1 === calMonth;
  }).reduce((acc, k) => acc + orderByDate[k].length, 0);

  const freeDaysRemaining = useMemo(() => {
    if (calYear !== today.getFullYear() || calMonth !== today.getMonth()) return null;
    let count = 0;
    for (let d = today.getDate(); d <= daysInMonth; d++) {
      if (!orderByDate[toYMD(new Date(calYear, calMonth, d))]) count++;
    }
    return count;
  }, [calYear, calMonth, daysInMonth, orderByDate]);

  const prevMonth = () => {
    setSelectedDay(null);
    if (calMonth === 0) { setCalYear(y => y-1); setCalMonth(11); }
    else setCalMonth(m => m-1);
  };
  const nextMonth = () => {
    setSelectedDay(null);
    if (calMonth === 11) { setCalYear(y => y+1); setCalMonth(0); }
    else setCalMonth(m => m+1);
  };

  const cells = [];
  for (let i = 0; i < firstDayOfWeek; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const selectedYMD    = selectedDay ? toYMD(new Date(calYear, calMonth, selectedDay)) : null;
  const selectedOrders = selectedYMD ? (orderByDate[selectedYMD] || []) : [];

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-sm font-bold text-gray-900">{monthLabel}</p>
          <p className="text-xs text-gray-400 mt-0.5">
            <span className="font-semibold text-gray-600">{deliveriesThisMonth}</span>{" "}
            {deliveriesThisMonth === 1 ? "delivery" : "deliveries"}
            {freeDaysRemaining !== null && (
              <> · <span className="font-semibold text-gray-600">{freeDaysRemaining}</span> free days left</>
            )}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-indigo-500 inline-block"/>
              Order
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-gray-200 inline-block"/>
              Free
            </span>
          </div>
          <div className="flex items-center gap-0.5">
            <button onClick={prevMonth} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 transition cursor-pointer text-gray-400">
              <ChevronLeft size={14}/>
            </button>
            <button onClick={nextMonth} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 transition cursor-pointer text-gray-400">
              <ChevronRight size={14}/>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-7 mb-1">
        {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d => (
          <div key={d} className="text-center text-[10px] font-semibold text-gray-400 py-1">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          if (!day) return <div key={`e-${i}`} className="aspect-square"/>;
          const ymd      = toYMD(new Date(calYear, calMonth, day));
          const dayOrders = orderByDate[ymd] || [];
          const hasOrder  = dayOrders.length > 0;
          const isToday   = ymd === todayYMD;
          const isSel     = selectedDay === day;

          // Use first order's status for dot color
          const firstOrder = dayOrders[0];
          const st         = firstOrder ? STATUS_MAP[firstOrder.status?.toLowerCase()] : null;
          const dotColor   =
            st?.color?.includes("emerald") ? "bg-emerald-500" :
            st?.color?.includes("amber")   ? "bg-amber-500"   :
            st?.color?.includes("purple")  ? "bg-purple-500"  :
            st?.color?.includes("green")   ? "bg-green-500"   :
            st?.color?.includes("red")     ? "bg-red-500"     :
            st?.color?.includes("indigo")  ? "bg-indigo-400"  : "bg-blue-500";

          return (
            <button
              key={day}
              onClick={() => setSelectedDay(isSel ? null : day)}
              className={`relative aspect-square flex flex-col items-center justify-center rounded-xl text-xs font-medium transition-all cursor-pointer
                ${isSel
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-200 scale-[1.05]"
                  : isToday
                    ? "ring-2 ring-indigo-400 ring-offset-1 text-indigo-700 bg-indigo-50 font-bold"
                    : hasOrder
                      ? "bg-blue-50 text-blue-700 hover:bg-blue-100"
                      : "text-gray-500 hover:bg-gray-100"
                }`}
            >
              <span>{day}</span>
              {isToday && !isSel && (
                <span className="text-[7px] font-bold text-indigo-500 leading-none tracking-tight">TODAY</span>
              )}
              {hasOrder && !isSel && (
                <span className={`absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full ${dotColor}`}/>
              )}
              {/* Show count badge if multiple orders on same day */}
              {hasOrder && dayOrders.length > 1 && !isSel && (
                <span className="absolute top-0.5 right-0.5 text-[8px] font-bold text-blue-600 bg-blue-100 rounded-full w-3.5 h-3.5 flex items-center justify-center leading-none">
                  {dayOrders.length}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Selected day detail — shows ALL orders for that day */}
      {selectedDay && (
        <div className="mt-3 rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-white border-2 border-indigo-200 rounded-xl flex items-center justify-center text-sm font-bold text-indigo-700 shadow-sm">
                {selectedDay}
              </div>
              <div>
                <p className="text-sm font-bold text-gray-800">
                  {new Date(calYear, calMonth, selectedDay).toLocaleDateString("en-GB", { weekday: "long" })}
                </p>
                <p className="text-xs text-gray-400">
                  {new Date(calYear, calMonth, selectedDay).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {selectedOrders.length > 0 && (
                <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full">
                  {selectedOrders.length} order{selectedOrders.length !== 1 ? "s" : ""}
                </span>
              )}
              <button
                onClick={() => setSelectedDay(null)}
                className="w-6 h-6 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition cursor-pointer"
              >
                <X size={13}/>
              </button>
            </div>
          </div>

          {selectedOrders.length === 0 ? (
            <div className="px-4 py-7 flex flex-col items-center gap-2">
              <div className="w-11 h-11 rounded-2xl bg-gray-100 flex items-center justify-center">
                <Calendar size={18} className="text-gray-300"/>
              </div>
              <p className="text-sm font-semibold text-gray-400">Free day</p>
              <p className="text-xs text-gray-300">No delivery scheduled</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {selectedOrders.map((order, idx) => {
                const s     = STATUS_MAP[order.status?.toLowerCase()];
                const SIcon = s?.icon || Clock;
                return (
                  <div key={order.order_id} className="px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition">
                    <span className="w-5 h-5 rounded-md bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-500 shrink-0">
                      {idx + 1}
                    </span>
                    <Avatar name={order.customer_name} size="w-9 h-9"/>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-800 truncate">{order.customer_name}</p>
                      <p className="text-xs text-indigo-500 font-medium flex items-center gap-1 mt-0.5">
                        {order.order_id}
                        <span className="text-gray-300">·</span>
                        <MapPin size={10} className="text-gray-400"/>
                        <span className="text-gray-500">{order.wilaya}</span>
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium border ${s?.color || "bg-gray-100 text-gray-600 border-gray-200"}`}>
                        <SIcon size={10}/> {order.status}
                      </span>
                      <p className="text-xs font-bold text-gray-700 mt-1">
                        {Number(order.totalamount || 0).toLocaleString("fr-DZ")} DA
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── DM MODAL ─────────────────────────────────────────────────────────────────
function DmModal({ dm, deliveries, nextPendingOrder, onClose, onRequestNext }) {
  const [tab, setTab] = useState("overview");
  const todayYMD = toYMD(new Date());
  const dmOrders    = deliveries.filter(d => d.deliveryman === dm.username);
  const delivered   = dmOrders.filter(d => d.status?.toLowerCase() === "delivered").length;
  const canceled    = dmOrders.filter(d => d.status?.toLowerCase() === "canceled").length;
  const active      = dmOrders.filter(d => !["delivered","canceled","partial"].includes(d.status?.toLowerCase())).length;
  const successRate = dmOrders.length > 0 ? Math.round((delivered/dmOrders.length)*100) : 0;
  const todayOrders = dmOrders.filter(o => o.deliverydate && o.deliverydate.slice(0,10) === todayYMD);
  const canRequestNext = nextPendingOrder && !deliveries.some(
    d => d.deliveryman === dm.username &&
         d.deliverydate === nextPendingOrder.deliverydate &&
         !["delivered","canceled"].includes(d.status?.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-[1001] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose}/>
      <div className="relative bg-white w-full max-w-lg rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
        <div className="px-6 pt-6 pb-4 shrink-0">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <Avatar name={dm.username} size="w-14 h-14 text-base"/>
              <div>
                <h2 className="text-lg font-bold text-gray-900">{dm.username}</h2>
                {dm.phone_num && (
                  <p className="text-sm text-gray-400 flex items-center gap-1 mt-0.5">📞 {dm.phone_num}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center bg-gray-100 rounded-xl p-1 gap-1">
                <button
                  onClick={() => setTab("overview")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    tab==="overview" ? "bg-white text-gray-800 shadow-sm" : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setTab("month")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    tab==="month" ? "bg-white text-gray-800 shadow-sm" : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <Calendar size={12}/> Month
                </button>
              </div>
              <button
                onClick={onClose}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 transition cursor-pointer"
              >
                <X size={15}/>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {[
              { label:"Total",     value:dmOrders.length, cls:"bg-gray-50 text-gray-800"       },
              { label:"Active",    value:active,          cls:"bg-blue-50 text-blue-700"       },
              { label:"Delivered", value:delivered,       cls:"bg-emerald-50 text-emerald-700" },
              { label:"Canceled",  value:canceled,        cls:"bg-red-50 text-red-500"         },
            ].map(({ label, value, cls }) => (
              <div key={label} className={`${cls} rounded-xl p-3 text-center`}>
                <p className="text-xl font-bold">{value}</p>
                <p className="text-xs mt-0.5 opacity-70">{label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 pb-6">
          {tab === "overview" && (
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-xs font-medium text-gray-500">Delivery Success Rate</span>
                  <span className="text-sm font-bold text-emerald-600">{successRate}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-gray-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all duration-700"
                    style={{ width:`${successRate}%` }}
                  />
                </div>
              </div>

              {canRequestNext && nextPendingOrder && (
                <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-3.5">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center shrink-0">
                      <Package size={14} className="text-indigo-600"/>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-indigo-700 mb-0.5">Next Order Available (FIFO)</p>
                      <p className="text-xs text-indigo-500">
                        {nextPendingOrder.order_id} · {nextPendingOrder.customer_name} · {nextPendingOrder.wilaya}
                      </p>
                      <p className="text-xs text-indigo-400">
                        Delivery: {fmtDateShort(nextPendingOrder.deliverydate)||"TBD"} · {Number(nextPendingOrder.totalamount||0).toLocaleString("fr-DZ")} DA
                      </p>
                    </div>
                    <button
                      onClick={() => onRequestNext(dm)}
                      className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-3 py-2 rounded-lg transition cursor-pointer shrink-0"
                    >
                      Assign <ArrowRight size={12}/>
                    </button>
                  </div>
                </div>
              )}

              {active === 0 && !canRequestNext && !nextPendingOrder && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2.5 text-xs text-emerald-700 font-medium flex items-center gap-2">
                  <CheckCircle2 size={12}/> All caught up — no pending orders in the queue.
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Today's Deliveries</p>
                  <span className="text-[10px] font-semibold text-indigo-500 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full">
                    {new Date().toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"})}
                  </span>
                </div>
                {todayOrders.length === 0 ? (
                  <div className="flex flex-col items-center gap-2 py-6 text-center">
                    <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                      <Calendar size={16} className="text-gray-400"/>
                    </div>
                    <p className="text-sm text-gray-400 font-medium">No deliveries today</p>
                    <p className="text-xs text-gray-300">Nothing scheduled for today</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {todayOrders.map((order, idx) => {
                      const s     = STATUS_MAP[order.status?.toLowerCase()];
                      const OIcon = s?.icon || Clock;
                      return (
                        <div key={order.order_id} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition">
                          <div className="w-6 h-6 rounded-lg bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500 shrink-0">{idx+1}</div>
                          <Avatar name={order.customer_name} size="w-8 h-8"/>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-800 truncate">{order.customer_name}</p>
                            <p className="text-xs text-indigo-500 font-medium flex items-center gap-1">
                              {order.order_id}<span className="text-gray-300">·</span>
                              <MapPin size={10} className="text-gray-400"/><span className="text-gray-500 font-normal">{order.wilaya}</span>
                            </p>
                          </div>
                          <p className="text-xs font-bold text-gray-700 whitespace-nowrap shrink-0">
                            {Number(order.totalamount||0).toLocaleString("fr-DZ")} DA
                          </p>
                          <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium border ${s?.color||"bg-gray-100 text-gray-600 border-gray-200"}`}>
                            <OIcon size={10}/> {order.status}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
          {tab === "month" && <DeliveryCalendar dmOrders={dmOrders}/>}
        </div>
      </div>
    </div>
  );
}

// ─── MAIN PAGE ─────────────────────────────────────────────────────────────────
export function DeliveryPage() {
  const navigate = useNavigate();
  const [deliveries,          setDeliveries]          = useState([]);
  const [deliverymen,         setDeliverymen]         = useState([]);
  const [loading,             setLoading]             = useState(true);
  const [activeStatus,        setActiveStatus]        = useState("pending");
  const [searchQuery,         setSearchQuery]         = useState("");
  const [openBar,             setOpenBar]             = useState(window.innerWidth >= 600);
  const [sortField,           setSortField]           = useState("orderdate");
  const [sortDir,             setSortDir]             = useState("asc");
  const [showAssignModal,     setShowAssignModal]     = useState(false);
  const [assignOrder,         setAssignOrder]         = useState(null);
  const [assignDeliveryman,   setAssignDeliveryman]   = useState("");
  const [assigning,           setAssigning]           = useState(false);
  const [showDmModal,         setShowDmModal]         = useState(false);
  const [selectedDeliveryman, setSelectedDeliveryman] = useState(null);
  const [updatingStatusId,    setUpdatingStatusId]    = useState(null);
  const [updatingDateId,      setUpdatingDateId]      = useState(null);
  const [message,             setMessage]             = useState("");
  const [messageType,         setMessageType]         = useState("");

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [dRes, dmRes] = await Promise.all([
        api.get("/api/deliveries"),
        api.get("/api/deliverymen"),
      ]);
      setDeliveries(dRes.data || []);
      setDeliverymen(dmRes.data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const showFlash = (msg, type) => {
    setMessage(msg); setMessageType(type);
    setTimeout(() => { setMessage(""); setMessageType(""); }, 3500);
  };

  const statusCounts = useMemo(() => {
    const c = {};
    STATUSES.forEach(s => { c[s.key.toLowerCase()] = 0; });
    deliveries.forEach(d => {
      const st = d.status?.toLowerCase();
      if (c[st] !== undefined) c[st]++;
    });
    return c;
  }, [deliveries]);

  const deliverymenStats = useMemo(() => {
    const m = {};
    deliverymen.forEach(dm => { m[dm.username] = 0; });
    deliveries.forEach(d => {
      if (d.deliveryman && m[d.deliveryman] !== undefined) m[d.deliveryman]++;
    });
    return m;
  }, [deliveries, deliverymen]);

  const assignGroups = useMemo(() => {
    if (!assignOrder) return { available:[], busy:[] };
    const available=[], busy=[];
    deliverymen.forEach(dm => {
      const busyOnDay = deliveries.some(
        d => d.deliveryman===dm.username &&
             d.deliverydate===assignOrder.deliverydate &&
             d.order_id!==assignOrder.order_id &&
             !["delivered","canceled"].includes(d.status?.toLowerCase())
      );
      const activeCount = deliveries.filter(
        d => d.deliveryman===dm.username && !["delivered","canceled"].includes(d.status?.toLowerCase())
      ).length;
      (busyOnDay ? busy : available).push({ ...dm, activeCount });
    });
    return { available, busy };
  }, [assignOrder, deliveries, deliverymen]);

  const nextPendingOrder = useMemo(() => {
    return [...deliveries]
      .filter(d => !d.deliveryman && d.status?.toLowerCase()==="pending" && isAllowedWilaya(d.wilaya))
      .sort((a,b) => new Date(a.orderdate)-new Date(b.orderdate))[0] || null;
  }, [deliveries]);

  const handleSort = field => {
    if (sortField===field) setSortDir(d => d==="asc"?"desc":"asc");
    else { setSortField(field); setSortDir("asc"); }
  };

  const filtered = useMemo(() => {
    let list = deliveries.filter(d => {
      if (d.status?.toLowerCase() !== activeStatus) return false;
      const q = searchQuery.toLowerCase();
      if (q && !d.order_id?.toString().toLowerCase().includes(q) &&
               !d.customer_name?.toLowerCase().includes(q) &&
               !d.wilaya?.toLowerCase().includes(q)) return false;
      return true;
    });
    return [...list].sort((a,b) => {
      let va=a[sortField]??"", vb=b[sortField]??"";
      if (sortField==="totalamount") { va=Number(a.totalamount||0); vb=Number(b.totalamount||0); }
      if (sortField==="deliverydate"||sortField==="orderdate") { va=new Date(va||0); vb=new Date(vb||0); }
      if (va<vb) return sortDir==="asc"?-1:1;
      if (va>vb) return sortDir==="asc"?1:-1;
      return 0;
    });
  }, [deliveries, activeStatus, searchQuery, sortField, sortDir]);

  const openAssignModal = (order) => {
    setAssignOrder(order);
    setAssignDeliveryman(order.deliveryman || "");
    setShowAssignModal(true);
  };

  const handleAssign = async () => {
    if (!assignOrder || !assignDeliveryman) return;
    setAssigning(true);
    try {
      const isUnassign     = assignDeliveryman === "__unassign__";
      const newDeliveryman = isUnassign ? "" : assignDeliveryman;
      const isPending      = assignOrder.status?.toLowerCase() === "pending";
      const patch          = { deliveryman: newDeliveryman };
      if (!isUnassign && isPending) patch.status = "processing";
      await api.patch(`/api/deliveries/${assignOrder.order_id}`, patch);
      await fetchAll();
      showFlash(
        isUnassign
          ? "Deliveryman unassigned successfully"
          : `Order assigned to ${assignDeliveryman}${isPending?" · Status set to Processing":""}`,
        "success"
      );
      setShowAssignModal(false);
      setAssignOrder(null);
      setAssignDeliveryman("");
    } catch (err) {
      console.error("Assign error:", err);
      showFlash("Failed to assign deliveryman. Please try again.", "error");
    } finally { setAssigning(false); }
  };

  const handleRequestNext = async (dm) => {
    if (!nextPendingOrder) return;
    try {
      await api.patch(`/api/deliveries/${nextPendingOrder.order_id}`, {
        deliveryman: dm.username,
        status: "processing",
      });
      await fetchAll();
      showFlash(`Order ${nextPendingOrder.order_id} assigned to ${dm.username} · Status set to Processing`, "success");
      setShowDmModal(false);
    } catch { showFlash("Failed to assign next order", "error"); }
  };

  const handleUpdateStatus = async (orderId, status) => {
    setUpdatingStatusId(orderId);
    try {
      await api.patch(`/api/deliveries/${orderId}`, { status: status.toLowerCase() });
      await fetchAll();
      showFlash(`Status updated to ${status}`, "success");
    } catch (err) {
      console.error("Status update error:", err);
      showFlash("Failed to update status. Please try again.", "error");
    } finally { setUpdatingStatusId(null); }
  };

  const handleUpdateDeliveryDate = async (orderId, newDate) => {
    setUpdatingDateId(orderId);
    try {
      await api.patch(`/api/deliveries/${orderId}`, { deliverydate: newDate || null });
      await fetchAll();
      showFlash(
        newDate ? `Delivery date updated to ${fmtDate(newDate)}` : "Delivery date cleared",
        "success"
      );
    } catch (err) {
      console.error("Date update error:", err);
      showFlash("Failed to update delivery date. Please try again.", "error");
    } finally { setUpdatingDateId(null); }
  };

const stockManagerLinks = [
  { to: '/stock-manager-dash',              label: 'Dashboard',         icon: <LayoutDashboard />, end: true },
  { to: '/stock-manager-dash/inventories',  label: "Product's Catalog", icon: <Boxes />            },
  { to: '/stock-manager-dash/ar',           label: 'AR/3D Management',  icon: <Bot size={18} />    },
  { to: '/stock-manager-dash/deliveries',   label: 'Delivery',          icon: <Truck />            },
  { to: '/stock-manager-dash/problems',     label: 'Problems',          icon: <TriangleAlert />     },
  { to: '/stock-manager-dash/returns',      label: 'Returns',           icon: <RotateCcw />        },
]

  const TAB_STATUSES = STATUSES;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar openBar={openBar} setOpenBar={setOpenBar} links={stockManagerLinks}
        title="StockManagerCore" subtitle="Enterprise Suite" role="Manager" profilePath="/stock-manager-dash/profile"/>

      <main className="flex-1 min-w-0">
        <Header concept="Delivery Dashboard"/>

        <div className="p-6 space-y-5">
          {message && (
            <div className={`p-3 rounded-lg border-l-4 text-sm font-medium flex items-center gap-2 ${
              messageType==="success" ? "bg-green-50 text-green-800 border-green-500" : "bg-red-50 text-red-800 border-red-500"
            }`}>
              {messageType==="success"
                ? <CheckCircle2 size={15} className="shrink-0"/>
                : <AlertTriangle size={15} className="shrink-0"/>}
              {message}
            </div>
          )}

          {/* Top card */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-start justify-between mb-5">
              <div>
                <p className="text-sm text-gray-400">Manage orders and delivery assignments</p>
                <p className="text-xs text-gray-300 mt-0.5 flex items-center gap-1">
                  <MapPin size={10}/> Serving {ALLOWED_WILAYAS.length} wilayas · 1 order per deliveryman per day (8h shift)
                </p>
              </div>
              <button className="flex items-center gap-2 border border-gray-200 bg-gray-50 px-4 py-2 rounded-xl text-sm text-gray-600 hover:bg-gray-100 transition cursor-pointer">
                <Users size={15} className="text-gray-400"/>Deliverymen
                <span className="bg-indigo-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                  {deliverymen.length}
                </span>
              </button>
            </div>

            {deliverymen.length > 0 && (
              <div className="flex items-center gap-2.5 flex-wrap mb-5">
                {deliverymen.map(dm => {
                  const todayStr = toYMD(new Date());
                  const isBusy   = deliveries.some(
                    d => d.deliveryman===dm.username &&
                         d.deliverydate?.slice(0,10)===todayStr &&
                         !["delivered","canceled"].includes(d.status?.toLowerCase())
                  );
                  return (
                    <div
                      key={dm.id}
                      onClick={() => { setSelectedDeliveryman(dm); setShowDmModal(true); }}
                      className="flex items-center gap-2.5 border border-gray-200 rounded-full px-3 py-1.5 bg-gray-50 hover:border-indigo-300 hover:bg-indigo-50/40 transition cursor-pointer"
                    >
                      <div className="relative">
                        <Avatar name={dm.username} size="w-7 h-7"/>
                        <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white ${isBusy?"bg-orange-400":"bg-emerald-400"}`}/>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-800 leading-none">{dm.username}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{deliverymenStats[dm.username]||0} orders</p>
                      </div>
                      <Eye size={13} className="text-gray-300 ml-1"/>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Filter tabs */}
            <div className="flex items-center gap-2 flex-wrap">
              {TAB_STATUSES.map(s => {
                const Icon  = s.icon;
                const key   = s.key.toLowerCase();
                const isAct = activeStatus === key;
                const count = statusCounts[key] || 0;

                const activeBg =
                  s.key === "Pending"    ? "bg-amber-500 border-amber-500"    :
                  s.key === "Processing" ? "bg-blue-500 border-blue-500"      :
                  s.key === "Shipped"    ? "bg-indigo-500 border-indigo-500"  :
                  s.key === "Delivered"  ? "bg-emerald-500 border-emerald-500":
                  s.key === "Partial"    ? "bg-green-500 border-green-500"    :
                  s.key === "Problem"    ? "bg-red-500 border-red-500"        :
                                          "bg-gray-500 border-gray-500";

                return (
                  <button key={s.key} onClick={() => setActiveStatus(key)}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium border transition cursor-pointer ${
                      isAct ? `${activeBg} text-white` : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                    }`}>
                    <Icon size={13}/>{s.label}
                    {count > 0 && (
                      <span className={`text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center ${isAct ? "bg-white/25 text-white" : "bg-gray-100 text-gray-600"}`}>
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Search */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-5 py-4">
            <div className="flex items-center gap-3 border border-gray-200 rounded-xl px-4 py-2.5 focus-within:ring-2 focus-within:ring-indigo-400 bg-gray-50">
              <Search size={16} className="text-gray-400 shrink-0"/>
              <input
                className="flex-1 bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400"
                placeholder="Search by order ID, customer or wilaya…"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
              <span className="text-xs text-gray-400">{filtered.length} orders</span>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-visible">
            <div className="grid grid-cols-9 px-6 py-3.5 border-b border-gray-100 bg-gray-50/80 rounded-t-2xl">
              {[
                {label:"Order",         field:"order_id"     },
                {label:"Order Date",    field:"orderdate"    },
                {label:"Customer",      field:"customer_name"},
                {label:"Location",      field:"wilaya"       },
                {label:"Amount",        field:"totalamount"  },
                {label:"Delivery Type", field:"delivery_type"},
                {label:"Delivery Date", field:"deliverydate" },
                {label:"Status",        field:"status"       },
                {label:"Deliveryman",   field:"deliveryman"  },
              ].map(h => (
                <SortHeader key={h.field} label={h.label} field={h.field}
                  sortField={sortField} sortDir={sortDir} onSort={handleSort}/>
              ))}
            </div>

            {loading ? (
              <div className="p-12 flex items-center justify-center gap-2 text-gray-400 text-sm">
                <Loader2 size={16} className="animate-spin"/> Loading deliveries…
              </div>
            ) : filtered.length===0 ? (
              <div className="p-12 text-center">
                <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-3">
                  <Truck size={20} className="text-gray-300"/>
                </div>
                <p className="text-sm text-gray-400 font-medium">No deliveries found</p>
                <p className="text-xs text-gray-300 mt-1">Try adjusting your filters</p>
              </div>
            ) : filtered.map((d, idx) => {
              const allowed = isAllowedWilaya(d.wilaya);
              return (
                <div key={d.order_id}
                  className={`grid grid-cols-9 px-6 py-4 border-t border-gray-50 transition items-center ${
                    !allowed ? "bg-red-50/40 hover:bg-red-50/60" : "hover:bg-blue-50/20"
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg">{d.order_id}</span>
                    {idx===0 && activeStatus==="pending" && (
                      <span className="text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-md">NEXT</span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <div className="w-6 h-6 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                      <Package size={11} className="text-gray-500"/>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-700">{fmtDate(d.orderdate)||"—"}</p>
                      <p className="text-[10px] text-gray-400">{fmtWeekday(d.orderdate)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 min-w-0">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">{d.customer_name}</p>
                      <p className="text-xs text-gray-400">{d.customer_phone}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-1.5 min-w-0">
                    <MapPin size={13} className={`mt-0.5 shrink-0 ${allowed?"text-gray-300":"text-red-400"}`}/>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1">
                        <p className={`text-sm font-medium truncate ${allowed?"text-gray-700":"text-red-600"}`}>{d.wilaya}</p>
                        {!allowed && <AlertTriangle size={11} className="text-red-400 shrink-0" title="Outside delivery zone"/>}
                      </div>
                      <p className="text-xs text-gray-400 truncate">{d.commune}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-bold text-gray-900">{Number(d.totalamount||0).toLocaleString("fr-DZ")} DA</p>
                    <p className="text-xs text-gray-400">{d.items_count} items</p>
                  </div>

                  <div>
                    <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium border ${TYPE_COLORS[d.delivery_type]||"bg-gray-100 text-gray-600 border-gray-200"}`}>
                      <Calendar size={11}/> {d.delivery_type}
                    </span>
                  </div>

                  <DeliveryDateCell
                    orderId={d.order_id}
                    deliverydate={d.deliverydate}
                    status={d.status}
                    onSave={handleUpdateDeliveryDate}
                    saving={updatingDateId === d.order_id}
                  />

                  <StatusDropdown
                    orderId={d.order_id}
                    currentStatus={d.status}
                    onUpdate={handleUpdateStatus}
                    updatingId={updatingStatusId}
                  />

                  <div className="flex items-center gap-2">
                    <AssignButton
                       deliverymanName={d.deliveryman}
                        onClick={() => openAssignModal(d)}
                        disabled={["delivered","partial","canceled"].includes(d.status?.toLowerCase())}
                         />
                  </div>
                </div>
              );
            })}

            {!loading && filtered.length>0 && (
              <div className="px-6 py-3 border-t border-gray-50 bg-gray-50/60 rounded-b-2xl flex items-center justify-between">
                <p className="text-xs text-gray-400">
                  Showing <span className="font-semibold text-gray-600">{filtered.length}</span> of{" "}
                  <span className="font-semibold text-gray-600">{deliveries.length}</span> deliveries
                  {" "}· <span className="font-semibold text-gray-600">FIFO</span> by order date
                </p>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-400"/>
                  <span className="text-xs text-gray-400">Outside delivery zone</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* ASSIGN MODAL */}
      {showAssignModal && assignOrder && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => !assigning && setShowAssignModal(false)}/>
          <div className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
            <div className="px-6 pt-6 pb-4">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-base font-bold text-gray-900">Assign Deliveryman</h2>
                  <p className="text-sm text-gray-400 mt-0.5">{assignOrder.order_id} — {assignOrder.customer_name}</p>
                </div>
                <button onClick={() => !assigning && setShowAssignModal(false)} disabled={assigning}
                  className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 transition cursor-pointer disabled:opacity-40">
                  <X size={15}/>
                </button>
              </div>
              <div className="flex items-center gap-2 flex-wrap mb-3">
                <span className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-medium border ${TYPE_COLORS[assignOrder.delivery_type]||"bg-gray-100 text-gray-600 border-gray-200"}`}>
                  <Calendar size={11}/> {assignOrder.delivery_type}
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-medium bg-gray-100 text-gray-600 border border-gray-200">
                  <MapPin size={11}/> {assignOrder.wilaya}
                </span>
                {assignOrder.deliverydate && (
                  <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-medium bg-blue-50 text-blue-600 border border-blue-200">
                    <Calendar size={11}/> {fmtDate(assignOrder.deliverydate)}
                  </span>
                )}
              </div>
              {assignOrder.status?.toLowerCase() === "pending" && (
                <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-xl px-3 py-2.5 text-xs text-blue-700 font-medium mb-3">
                  <RefreshCw size={12} className="shrink-0"/>
                  Assigning a deliveryman will automatically set the status to <strong>Processing</strong>.
                </div>
              )}
              <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5 text-xs text-amber-700 font-medium">
                <Clock size={12} className="shrink-0"/>
                Each deliveryman handles <strong>1 order per day</strong> (8h shift).
                Deliverymen marked <span className="text-red-500 font-bold">Busy</span> already have an order on {fmtDateShort(assignOrder.deliverydate)||"this date"}.
              </div>
            </div>

            <div className="px-6 pb-2 max-h-80 overflow-y-auto space-y-4">
              {assignOrder.deliveryman && (
                <label className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition ${
                  assignDeliveryman==="__unassign__" ? "border-red-300 bg-red-50" : "border-gray-200 hover:bg-gray-50"
                }`}>
                  <input type="radio" className="hidden" value="__unassign__"
                    checked={assignDeliveryman==="__unassign__"} onChange={() => setAssignDeliveryman("__unassign__")}/>
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
                    <X size={14} className="text-gray-500"/>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-700">Unassign</p>
                    <p className="text-xs text-gray-400">Remove current deliveryman</p>
                  </div>
                  {assignDeliveryman==="__unassign__" && <CheckCircle2 size={16} className="text-red-400 shrink-0"/>}
                </label>
              )}

              {assignGroups.available.length>0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"/>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                      Free on {fmtDateShort(assignOrder.deliverydate)||"this date"}
                    </p>
                  </div>
                  <div className="space-y-2">
                    {assignGroups.available.map(dm => (
                      <label key={dm.id} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition ${
                        assignDeliveryman===dm.username ? "border-indigo-300 bg-indigo-50" : "border-gray-200 hover:bg-gray-50"
                      }`}>
                        <input type="radio" className="hidden" value={dm.username}
                          checked={assignDeliveryman===dm.username} onChange={() => setAssignDeliveryman(dm.username)}/>
                        <Avatar name={dm.username} size="w-9 h-9"/>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-800">{dm.username}</p>
                          <p className="text-xs text-gray-400">
                            {dm.phone_num && <span>{dm.phone_num} · </span>}
                            {dm.activeCount} active order{dm.activeCount!==1?"s":""}
                          </p>
                        </div>
                        <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full shrink-0">Free</span>
                        {assignDeliveryman===dm.username && <CheckCircle2 size={16} className="text-indigo-500 shrink-0"/>}
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {assignGroups.busy.length>0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-2 h-2 rounded-full bg-red-400 shrink-0"/>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                      Busy on {fmtDateShort(assignOrder.deliverydate)||"this date"}
                    </p>
                  </div>
                  <div className="space-y-2">
                    {assignGroups.busy.map(dm => (
                      <label key={dm.id} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition ${
                        assignDeliveryman===dm.username ? "border-indigo-300 bg-indigo-50" : "border-gray-100 bg-gray-50/50 hover:bg-gray-50"
                      }`}>
                        <input type="radio" className="hidden" value={dm.username}
                          checked={assignDeliveryman===dm.username} onChange={() => setAssignDeliveryman(dm.username)}/>
                        <Avatar name={dm.username} size="w-9 h-9"/>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-600">{dm.username}</p>
                          <p className="text-xs text-gray-400">
                            {dm.phone_num && <span>{dm.phone_num} · </span>}
                            {dm.activeCount} active order{dm.activeCount!==1?"s":""}
                          </p>
                        </div>
                        <span className="text-xs font-semibold text-red-500 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full shrink-0">Busy</span>
                        {assignDeliveryman===dm.username && <CheckCircle2 size={16} className="text-indigo-500 shrink-0"/>}
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {deliverymen.length===0 && (
                <p className="text-sm text-gray-400 text-center py-6">No deliverymen available</p>
              )}
            </div>

            <div className="px-6 py-4 border-t border-gray-100 flex gap-3 mt-2">
              <button onClick={() => setShowAssignModal(false)} disabled={assigning}
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-sm text-gray-700 font-medium transition cursor-pointer disabled:opacity-40">
                Cancel
              </button>
              <button onClick={handleAssign} disabled={!assignDeliveryman || assigning}
                className="flex-1 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                {assigning
                  ? <><Loader2 size={14} className="animate-spin"/> Assigning…</>
                  : <><UserCheck size={14}/> Confirm Assignment</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {showDmModal && selectedDeliveryman && (
        <DmModal
          dm={selectedDeliveryman}
          deliveries={deliveries}
          nextPendingOrder={nextPendingOrder}
          onClose={() => setShowDmModal(false)}
          onRequestNext={handleRequestNext}
        />
      )}
    </div>
  );
}