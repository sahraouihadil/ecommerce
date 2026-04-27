import { useState, useMemo } from "react";

// ─── MOCK DATA ────────────────────────────────────────────────────────────────
const DRIVER = {
  name: "Ahmad Al-Mutairi",
  id: "DRV-2047",
  phone: "+966 50 000 1234",
  vehicle: "Toyota Corolla · XYZ 1234",
  memberSince: "January 2024",
  rating: 4.8,
};

const TODAY = "2025-01-15";

const INITIAL_ORDERS = [
  { id: "ORD-001", customer: "Ahmed Al-Rashidi",   address: "14 King Fahd Road, Apt 3B, Riyadh",    eta: 25, km: 2.4, amount: 87.50,  status: "Pending",    date: "2025-01-15", rating: null },
  { id: "ORD-002", customer: "Sara Mohammed",       address: "7 Olaya Street, Tower 2, Riyadh",       eta: 10, km: 1.1, amount: 54.00,  status: "In Transit", date: "2025-01-15", rating: null },
  { id: "ORD-003", customer: "Khalid Bin Saud",     address: "3 Prince Sultan Ave, Riyadh",           eta: 40, km: 5.7, amount: 132.00, status: "Pending",    date: "2025-01-15", rating: null },
  { id: "ORD-007", customer: "Youssef Hamdan",      address: "18 Imam Turki Street, Riyadh",          eta: 30, km: 3.5, amount: 64.00,  status: "Pending",    date: "2025-01-15", rating: null },
  { id: "ORD-004", customer: "Fatima Al-Zahrani",   address: "22 Al Amir Street",                     eta: 0,  km: 1.8, amount: 76.00,  status: "Delivered",  date: "2025-01-14", rating: 5 },
  { id: "ORD-005", customer: "Omar Al-Ghamdi",      address: "9 Tahlia Street, Floor 4",              eta: 0,  km: 3.2, amount: 92.00,  status: "Delivered",  date: "2025-01-14", rating: 4 },
  { id: "ORD-006", customer: "Nora Al-Qahtani",     address: "5 Sitteen Road",                        eta: 0,  km: 2.9, amount: 115.00, status: "Problem",    date: "2025-01-13", rating: null },
  { id: "ORD-008", customer: "Layla Bin Abdullah",  address: "11 Al Urubah Road",                     eta: 0,  km: 4.1, amount: 48.50,  status: "Delivered",  date: "2025-01-13", rating: 5 },
];

// ─── ICONS ────────────────────────────────────────────────────────────────────
const Icon = {
  Home: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  ),
  History: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
    </svg>
  ),
  User: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
    </svg>
  ),
  Menu: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
    </svg>
  ),
  Package: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>
    </svg>
  ),
  Check: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
    </svg>
  ),
  Truck: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
    </svg>
  ),
  Clock: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
    </svg>
  ),
  Navigation: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <polygon points="3 11 22 2 13 21 11 13 3 11"/>
    </svg>
  ),
  MapPin: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
    </svg>
  ),
  ChevronRight: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <polyline points="9 18 15 12 9 6"/>
    </svg>
  ),
  Calendar: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  ),
  TrendUp: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
    </svg>
  ),
  Alert: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  ),
  Dollar: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
    </svg>
  ),
  Phone: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13.1a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2.46h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 10a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
    </svg>
  ),
  Car: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
    </svg>
  ),
  Star: ({ filled, half }) => (
    <svg viewBox="0 0 24 24" fill={filled ? "#f59e0b" : half ? "url(#half)" : "none"} stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      {half && (
        <defs>
          <linearGradient id="half">
            <stop offset="50%" stopColor="#f59e0b"/>
            <stop offset="50%" stopColor="transparent"/>
          </linearGradient>
        </defs>
      )}
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  ),
  Search: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  ),
  X: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  ),
  Hash: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/><line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/>
    </svg>
  ),
};

function Stars({ rating, max = 5 }) {
  return (
    <span className="flex items-center gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <Icon.Star key={i} filled={i < Math.floor(rating)} half={i === Math.floor(rating) && rating % 1 >= 0.5} />
      ))}
    </span>
  );
}

const STATUS_STYLES = {
  "Pending":    "bg-amber-50   text-amber-600  border border-amber-200",
  "In Transit": "bg-blue-50    text-blue-600   border border-blue-200",
  "Delivered":  "bg-emerald-50 text-emerald-600 border border-emerald-200",
  "Problem":    "bg-red-50     text-red-600    border border-red-200",
};
const STATUS_DOT = {
  "Pending":    "bg-amber-400",
  "In Transit": "bg-blue-500",
  "Delivered":  "bg-emerald-500",
  "Problem":    "bg-red-500",
};

function StatusBadge({ status }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${STATUS_STYLES[status] || "bg-gray-100 text-gray-600"}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[status] || "bg-gray-400"}`}/>
      {status}
    </span>
  );
}

// ─── ORDER MODAL ──────────────────────────────────────────────────────────────
function OrderModal({ order, onClose, onStatusChange }) {
  const [confirmAction, setConfirmAction] = useState(null);
  const actions = {
    "Pending":    ["Mark In Transit", "In Transit"],
    "In Transit": ["Mark Delivered",  "Delivered"],
  };
  const [actionLabel, nextStatus] = actions[order.status] || [];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose}/>
      <div className="relative bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-br from-indigo-600 to-purple-700 px-6 pt-6 pb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-indigo-200 text-xs font-semibold tracking-widest uppercase">{order.id}</p>
              <h2 className="text-white text-xl font-bold mt-1">{order.customer}</h2>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition cursor-pointer">
              <Icon.X/>
            </button>
          </div>
          <div className="flex items-center gap-2 text-indigo-100 text-sm">
            <Icon.MapPin/><span>{order.address}</span>
          </div>
          <div className="flex items-center gap-4 mt-4">
            <div className="flex items-center gap-1.5 bg-white/20 rounded-xl px-3 py-2 text-white text-sm">
              <Icon.Clock/> {order.eta} min
            </div>
            <div className="flex items-center gap-1.5 bg-white/20 rounded-xl px-3 py-2 text-white text-sm">
              <Icon.Navigation/> {order.km} km
            </div>
            <div className="ml-auto">
              <p className="text-white text-xl font-bold">SAR {order.amount.toFixed(2)}</p>
            </div>
          </div>
        </div>
        <div className="px-6 py-5 -mt-3 bg-white rounded-t-3xl relative">
          <div className="flex items-center justify-between mb-5">
            <p className="text-sm font-semibold text-gray-500">Current Status</p>
            <StatusBadge status={order.status}/>
          </div>
          {actionLabel && (
            confirmAction ? (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-4">
                <p className="text-sm font-semibold text-amber-800 mb-3">Confirm status change?</p>
                <p className="text-xs text-amber-600 mb-4">
                  Change <strong>{order.id}</strong> from <strong>{order.status}</strong> → <strong>{nextStatus}</strong>
                </p>
                <div className="flex gap-2">
                  <button onClick={() => setConfirmAction(null)}
                    className="flex-1 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 font-medium hover:bg-gray-50 transition cursor-pointer">
                    Cancel
                  </button>
                  <button onClick={() => { onStatusChange(order.id, nextStatus); onClose(); }}
                    className="flex-1 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition cursor-pointer">
                    Confirm
                  </button>
                </div>
              </div>
            ) : (
              <button onClick={() => setConfirmAction(true)}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold text-sm hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md shadow-indigo-200 cursor-pointer mb-4">
                {actionLabel}
              </button>
            )
          )}
          {order.status === "Delivered" && order.rating && (
            <div className="flex items-center justify-between p-3 bg-amber-50 rounded-2xl">
              <p className="text-sm font-medium text-gray-700">Customer Rating</p>
              <Stars rating={order.rating}/>
            </div>
          )}
          {order.status === "Problem" && (
            <div className="flex items-center gap-3 p-3 bg-red-50 rounded-2xl">
              <Icon.Alert/>
              <p className="text-sm text-red-700 font-medium">This order has a reported issue.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── SHARED NAV ITEMS ─────────────────────────────────────────────────────────
function NavItems({ page, setPage, pendingCount, onNavigate }) {
  const NAV = [
    { key: "today",   label: "Today's Orders", NavIcon: Icon.Home,    badge: pendingCount },
    { key: "history", label: "History",         NavIcon: Icon.History, badge: 0 },
    { key: "profile", label: "Profile",         NavIcon: Icon.User,    badge: 0 },
  ];
  return (
    <nav className="flex-1 px-3 py-4 space-y-1">
      {NAV.map(({ key, label, NavIcon, badge }) => {
        const active = page === key;
        return (
          <button key={key} onClick={() => { setPage(key); onNavigate?.(); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all cursor-pointer text-left ${
              active
                ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-200"
                : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
            }`}>
            <NavIcon/>
            {label}
            {badge > 0 && (
              <span className={`ml-auto text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center ${
                active ? "bg-white/25 text-white" : "bg-amber-100 text-amber-600"
              }`}>{badge}</span>
            )}
          </button>
        );
      })}
    </nav>
  );
}

// ─── DRIVER CARD ──────────────────────────────────────────────────────────────
function DriverCard() {
  return (
    <div className="px-4 py-4 border-t border-gray-50">
      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl">
        <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shrink-0">
          <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
          </svg>
        </div>
        <div className="min-w-0">
          <p className="text-xs font-bold text-gray-800 truncate">{DRIVER.name}</p>
          <p className="text-[10px] text-gray-400">ID #{DRIVER.id}</p>
        </div>
      </div>
    </div>
  );
}

// ─── DESKTOP SIDEBAR ─────────────────────────────────────────────────────────
function Sidebar({ page, setPage, pendingCount }) {
  return (
    <aside className="hidden lg:flex w-60 bg-white border-r border-gray-100 flex-col shrink-0 shadow-sm">
      <div className="px-5 py-5 border-b border-gray-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-xl flex items-center justify-center shadow-md shadow-indigo-200 text-white">
            <Icon.Truck/>
          </div>
          <div>
            <p className="text-sm font-extrabold text-gray-900 tracking-tight">DeliverPro</p>
            <p className="text-xs text-gray-400">Driver Dashboard</p>
          </div>
        </div>
      </div>
      <NavItems page={page} setPage={setPage} pendingCount={pendingCount}/>
      <DriverCard/>
    </aside>
  );
}

// ─── MOBILE DRAWER ────────────────────────────────────────────────────────────
function MobileDrawer({ open, onClose, page, setPage, pendingCount }) {
  return (
    <>
      <div
        className={`lg:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        onClick={onClose}
      />
      <div className={`lg:hidden fixed top-0 left-0 bottom-0 z-50 w-64 bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${open ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="px-5 py-5 border-b border-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-xl flex items-center justify-center shadow-md shadow-indigo-200 text-white">
              <Icon.Truck/>
            </div>
            <div>
              <p className="text-sm font-extrabold text-gray-900 tracking-tight">DeliverPro</p>
              <p className="text-xs text-gray-400">Driver Dashboard</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition cursor-pointer">
            <Icon.X/>
          </button>
        </div>
        <NavItems page={page} setPage={setPage} pendingCount={pendingCount} onNavigate={onClose}/>
        <DriverCard/>
      </div>
    </>
  );
}

// ─── PAGE: TODAY ──────────────────────────────────────────────────────────────
function TodayPage({ orders, onStatusChange }) {
  const [selected, setSelected] = useState(null);
  const todayOrders = orders.filter(o => o.date === TODAY);
  const delivered   = todayOrders.filter(o => o.status === "Delivered").length;
  const inTransit   = todayOrders.filter(o => o.status === "In Transit").length;
  const pending     = todayOrders.filter(o => o.status === "Pending").length;
  const selectedOrder = selected ? orders.find(o => o.id === selected) : null;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Today's Orders</h1>
        <p className="text-sm text-gray-400 mt-0.5">Wed, Jan 15, 2025</p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { icon: <Icon.Package/>, value: todayOrders.length, label: "Total Today",  bg: "bg-indigo-50",  ic: "text-indigo-600" },
          { icon: <Icon.Check/>,   value: delivered,           label: "Delivered",    bg: "bg-emerald-50", ic: "text-emerald-600" },
          { icon: <Icon.Truck/>,   value: inTransit,           label: "In Transit",   bg: "bg-blue-50",    ic: "text-blue-600" },
          { icon: <Icon.Clock/>,   value: pending,             label: "Pending",      bg: "bg-amber-50",   ic: "text-amber-600" },
        ].map(({ icon, value, label, bg, ic }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
            <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center ${ic} mb-3`}>{icon}</div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{label}</p>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
          <p className="text-sm font-semibold text-gray-700">
            <span className="text-indigo-600 font-bold">{todayOrders.length}</span> orders assigned today
          </p>
          <p className="text-xs text-gray-400 flex items-center gap-1.5">
            <Icon.Calendar/> Wed, Jan 15, 2025
          </p>
        </div>
        <div className="divide-y divide-gray-50">
          {todayOrders.map(order => (
            <button key={order.id} onClick={() => setSelected(order.id)}
              className="w-full flex items-center gap-4 px-5 py-4 hover:bg-gray-50/80 transition text-left cursor-pointer group">
              <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-500 shrink-0 group-hover:bg-indigo-100 transition">
                <Icon.Package/>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-gray-900">{order.id}</span>
                  <span className="text-gray-300 hidden sm:inline">·</span>
                  <span className="text-sm font-semibold text-gray-700 hidden sm:inline truncate">{order.customer}</span>
                </div>
                <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1 truncate">
                  <Icon.MapPin/> {order.address}
                </p>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                <div className="text-right hidden md:block">
                  <p className="text-xs text-gray-400 flex items-center justify-end gap-1"><Icon.Clock/> {order.eta} min</p>
                  <p className="text-xs text-gray-400 flex items-center justify-end gap-1 mt-0.5"><Icon.Navigation/> {order.km} km</p>
                </div>
                <p className="text-sm font-bold text-indigo-600 text-right">SAR {order.amount.toFixed(2)}</p>
                <StatusBadge status={order.status}/>
                <span className="text-gray-300 group-hover:text-gray-500 transition"><Icon.ChevronRight/></span>
              </div>
            </button>
          ))}
        </div>
      </div>
      {selectedOrder && <OrderModal order={selectedOrder} onClose={() => setSelected(null)} onStatusChange={onStatusChange}/>}
    </div>
  );
}

// ─── PAGE: HISTORY ────────────────────────────────────────────────────────────
function HistoryPage({ orders }) {
  const [dateFilter, setDateFilter] = useState("");
  const [selected, setSelected]     = useState(null);
  const historyOrders = orders.filter(o => o.date !== TODAY);

  const filtered = useMemo(() => {
    if (!dateFilter) return historyOrders;
    return historyOrders.filter(o => o.date === dateFilter);
  }, [historyOrders, dateFilter]);

  const delivered   = historyOrders.filter(o => o.status === "Delivered").length;
  const issues      = historyOrders.filter(o => o.status === "Problem").length;
  const totalEarned = historyOrders.filter(o => o.status === "Delivered").reduce((s, o) => s + o.amount, 0);
  const selectedOrder = selected ? orders.find(o => o.id === selected) : null;

  function fmtDate(d) {
    return new Date(d).toLocaleDateString("en-US", { weekday:"short", month:"short", day:"numeric", year:"numeric" });
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Delivery History</h1>
        <p className="text-sm text-gray-400 mt-0.5">All completed &amp; problem orders</p>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4 mb-5 flex flex-wrap items-center gap-4">
        <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 shrink-0">
          <Icon.Search/>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-800">Filter by Date</p>
          <p className="text-xs text-gray-400">Enter a date to see its orders</p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <input type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)}
            className="flex-1 sm:flex-none border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-gray-50 cursor-pointer"/>
          {dateFilter && (
            <button onClick={() => setDateFilter("")} className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 hover:bg-gray-200 transition cursor-pointer">
              <Icon.X/>
            </button>
          )}
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
        {[
          { icon: <Icon.TrendUp/>, value: historyOrders.length, label: "Total History",  bg: "bg-indigo-50",  ic: "text-indigo-600" },
          { icon: <Icon.Check/>,   value: delivered,             label: "Delivered",      bg: "bg-emerald-50", ic: "text-emerald-600" },
          { icon: <Icon.Alert/>,   value: issues,                label: "Issues",         bg: "bg-red-50",     ic: "text-red-500" },
          { icon: <Icon.Dollar/>,  value: `SAR ${totalEarned.toFixed(0)}`, label: "Total Earned", bg: "bg-violet-50", ic: "text-violet-600" },
        ].map(({ icon, value, label, bg, ic }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
            <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center ${ic} mb-3`}>{icon}</div>
            <p className="text-xl font-bold text-gray-900">{value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{label}</p>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm font-semibold text-gray-400">No orders found for this date</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {filtered.map(order => (
              <button key={order.id} onClick={() => setSelected(order.id)}
                className="w-full flex items-center gap-4 px-5 py-4 hover:bg-gray-50/80 transition text-left cursor-pointer group">
                <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400 shrink-0 group-hover:bg-gray-200 transition">
                  <Icon.Hash/>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-gray-900">{order.id}</span>
                    <span className="text-gray-300 hidden sm:inline">·</span>
                    <span className="text-sm font-semibold text-gray-700 hidden sm:inline truncate">{order.customer}</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1 truncate">
                    <Icon.MapPin/> {order.address}
                  </p>
                </div>
                <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                  <div className="text-right hidden md:block">
                    <p className="text-xs text-gray-400 flex items-center justify-end gap-1">
                      <Icon.Calendar/> {fmtDate(order.date)}
                    </p>
                    {order.rating && <div className="flex justify-end mt-0.5"><Stars rating={order.rating}/></div>}
                  </div>
                  <p className="text-sm font-bold text-indigo-600 text-right">SAR {order.amount.toFixed(2)}</p>
                  <StatusBadge status={order.status}/>
                  <span className="text-gray-300 group-hover:text-gray-500 transition"><Icon.ChevronRight/></span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
      {selectedOrder && <OrderModal order={selectedOrder} onClose={() => setSelected(null)} onStatusChange={() => {}}/>}
    </div>
  );
}

// ─── PAGE: PROFILE ────────────────────────────────────────────────────────────
function ProfilePage({ orders }) {
  const delivered   = orders.filter(o => o.status === "Delivered").length;
  const issues      = orders.filter(o => o.status === "Problem").length;
  const totalEarned = orders.filter(o => o.status === "Delivered").reduce((s, o) => s + o.amount, 0);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        <p className="text-sm text-gray-400 mt-0.5">{DRIVER.name} · {DRIVER.id}</p>
      </div>
      <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 rounded-3xl p-6 mb-5 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full"/>
        <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-white/5 rounded-full"/>
        <div className="relative flex items-center gap-5">
          <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center shrink-0">
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10 opacity-80">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
            </svg>
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">{DRIVER.name}</h2>
            <p className="text-indigo-200 text-sm mt-0.5">Delivery Driver · ID #{DRIVER.id}</p>
            <div className="flex items-center gap-2 mt-2">
              <Stars rating={DRIVER.rating}/>
              <span className="text-indigo-100 text-sm font-semibold">{DRIVER.rating} avg rating</span>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5 mb-5">
        <div className="flex items-center gap-2 mb-4">
          <Icon.TrendUp/>
          <h3 className="text-sm font-bold text-gray-800">Performance Overview</h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { icon: <Icon.Package/>, value: orders.length, label: "Total Orders",  bg: "bg-indigo-50",  ic: "text-indigo-500" },
            { icon: <Icon.Check/>,   value: delivered,      label: "Delivered",     bg: "bg-emerald-50", ic: "text-emerald-500" },
            { icon: <Icon.Alert/>,   value: issues,         label: "Issues",        bg: "bg-red-50",     ic: "text-red-500" },
            { icon: <Icon.Dollar/>,  value: `SAR ${totalEarned.toFixed(0)}`, label: "Total Earned", bg: "bg-violet-50", ic: "text-violet-500" },
          ].map(({ icon, value, label, bg, ic }) => (
            <div key={label} className={`${bg} rounded-2xl p-4`}>
              <div className={`${ic} mb-2`}>{icon}</div>
              <p className="text-lg font-bold text-gray-900">{value}</p>
              <p className="text-xs text-gray-400 mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        {[
          { icon: <Icon.Phone/>,    label: "Phone",        value: DRIVER.phone },
          { icon: <Icon.Car/>,      label: "Vehicle",      value: DRIVER.vehicle },
          { icon: <Icon.Calendar/>, label: "Member Since", value: DRIVER.memberSince },
        ].map(({ icon, label, value }, i, arr) => (
          <div key={label} className={`flex items-center gap-4 px-5 py-4 ${i < arr.length - 1 ? "border-b border-gray-50" : ""} hover:bg-gray-50/50 transition group cursor-pointer`}>
            <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400 group-hover:bg-indigo-50 group-hover:text-indigo-500 transition shrink-0">
              {icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-400">{label}</p>
              <p className="text-sm font-semibold text-gray-800 truncate">{value}</p>
            </div>
            <span className="text-gray-300 group-hover:text-gray-500 transition shrink-0"><Icon.ChevronRight/></span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── APP ROOT ─────────────────────────────────────────────────────────────────
export function DeliverymanDashboard() {
  const [page,       setPage]       = useState("today");
  const [orders,     setOrders]     = useState(INITIAL_ORDERS);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const pendingCount = orders.filter(o => o.date === TODAY && o.status === "Pending").length;

  function handleStatusChange(orderId, newStatus) {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
  }

  return (
    <div className="flex min-h-screen bg-gray-50" style={{ fontFamily: "'DM Sans', 'Nunito', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 99px; }
      `}</style>

      {/* Desktop sidebar — hidden on mobile */}
      <Sidebar page={page} setPage={setPage} pendingCount={pendingCount} profilePath="/deliveryman-dash/profile"/>

      {/* Mobile slide-in drawer — hidden on desktop */}
      <MobileDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        page={page}
        setPage={setPage}
        pendingCount={pendingCount}
      />

      {/* Main content */}
      <main className="flex-1 min-w-0 flex flex-col">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-100 px-4 lg:px-8 py-4 flex items-center gap-3 shrink-0">
          {/* Hamburger: only visible on mobile */}
          <button
            onClick={() => setDrawerOpen(true)}
            className="lg:hidden w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center text-gray-500 hover:bg-gray-200 transition cursor-pointer shrink-0"
          >
            <Icon.Menu/>
          </button>
          <div className="flex-1"/>
          <button className="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center text-gray-500 hover:bg-gray-200 transition cursor-pointer">
            <Icon.User/>
          </button>
        </header>

        {/* Page content */}
        <div className="flex-1 px-4 lg:px-8 py-6 overflow-y-auto">
          {page === "today"   && <TodayPage   orders={orders} onStatusChange={handleStatusChange}/>}
          {page === "history" && <HistoryPage orders={orders}/>}
          {page === "profile" && <ProfilePage orders={orders}/>}
        </div>
      </main>
    </div>
  );
}