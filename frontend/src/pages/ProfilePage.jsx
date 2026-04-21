import { useState, useRef } from "react";

function getInitials(name = "") {
  return name
    .split(/[\s_@]+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

const INITIAL_USER = {
  username: "Sofia Mercer",
  email: "sofia.mercer@email.com",
  role: "Premium Member",
};

const INITIAL_ORDERS = [
  { id: 1, name: "Velvet Cloud Stool", status: "In Transit", date: "Apr 18, 2025", price: "$195" },
  { id: 2, name: "Obsidian Glow Lamp", status: "Delivered", date: "Apr 10, 2025", price: "$310" },
  { id: 3, name: "Marble Side Table", status: "Processing", date: "Apr 20, 2025", price: "$420" },
];

const INITIAL_SAVED = [
  { id: 1, name: "Asymmetric Table", price: "$245" },
  { id: 2, name: "Oak Nightstand", price: "$380" },
  { id: 3, name: "Linen Accent Chair", price: "$560" },
  { id: 4, name: "Ceramic Floor Vase", price: "$130" },
];

const STATUS_COLORS = {
  "In Transit": { bg: "#EFF6FF", text: "#2563EB" },
  Delivered: { bg: "#F0FDF4", text: "#16A34A" },
  Processing: { bg: "#FFFBEB", text: "#D97706" },
};

// Points = 1 pt per $1 on delivered orders only
const POINTS_PER_DOLLAR = 1;

const TIERS = [
  { name: "Bronze", min: 0, max: 499, color: "#b87333" },
  { name: "Silver", min: 500, max: 999, color: "#9e9e9e" },
  { name: "Gold", min: 1000, max: 1999, color: "#D97706" },
  { name: "Platinum", min: 2000, max: Infinity, color: "#5c4a3a" },
];

function getTier(pts) {
  return TIERS.find((t) => pts >= t.min && pts <= t.max) ?? TIERS[0];
}

function calcPoints(orders) {
  return orders
    .filter((o) => o.status === "Delivered")
    .reduce((sum, o) => {
      const num = parseFloat(o.price.replace(/[^0-9.]/g, ""));
      return sum + Math.round(num * POINTS_PER_DOLLAR);
    }, 0);
}

function Toggle({ on, onToggle }) {
  return (
    <button
      onClick={onToggle}
      style={{ background: on ? "#5c4a3a" : "#ddd" }}
      className="relative w-10 h-5 rounded-full transition-colors duration-200 flex-shrink-0"
    >
      <span
        className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all duration-200"
        style={{ left: on ? "1.25rem" : "0.125rem" }}
      />
    </button>
  );
}

export function ProfilePage() {
  const [user, setUser] = useState(INITIAL_USER);
  const [orders, setOrders] = useState(INITIAL_ORDERS);
  const [saved, setSaved] = useState(INITIAL_SAVED);
  const [avatar, setAvatar] = useState(null);
  const fileInputRef = useRef(null);

  // Points calculés dynamiquement depuis les commandes "Delivered"
  const points = calcPoints(orders);
  const tier = getTier(points);
  const nextTier = TIERS.find((t) => t.min > points) ?? null;
  const progressPct = nextTier
    ? Math.min(100, Math.round(((points - tier.min) / (nextTier.min - tier.min)) * 100))
    : 100;

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) setAvatar(URL.createObjectURL(file));
  };

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(user);
  const handleSaveProfile = () => { setUser(draft); setEditing(false); };

  const [notif, setNotif] = useState({ orders: true, promotions: false, newsletter: true });
  const [showNotif, setShowNotif] = useState(false);

  const [priv, setPriv] = useState({ publicProfile: false, shareActivity: true });
  const [showPriv, setShowPriv] = useState(false);

  const [showAllOrders, setShowAllOrders] = useState(false);
  const [showAllSaved, setShowAllSaved] = useState(false);

  const visibleOrders = showAllOrders ? orders : orders.slice(0, 2);
  const visibleSaved = showAllSaved ? saved : saved.slice(0, 2);

  const initials = getInitials(user.username);

  return (
    <div
      style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}
      className="min-h-screen bg-[#FAF8F4] text-[#1a1a1a] pb-24"
    >
      {/* ── GLASSMORPHISM HEADER ── */}
      <header
        style={{
          background: "rgba(255, 253, 249, 0.55)",
          backdropFilter: "blur(18px)",
          WebkitBackdropFilter: "blur(18px)",
          borderBottom: "1px solid rgba(210, 196, 182, 0.45)",
          boxShadow: "0 4px 24px rgba(92, 74, 58, 0.06)",
          position: "sticky",
          top: 0,
          zIndex: 50,
        }}
      >
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          {/* Logo / brand */}
          <span
            style={{
              fontFamily: "'Georgia', serif",
              fontWeight: "700",
              fontSize: "1.1rem",
              letterSpacing: "0.08em",
              color: "#5c4a3a",
            }}
          >
            MAISON
          </span>

          {/* Nav links */}
          <nav className="flex items-center gap-6">
            {["Shop", "Collections", "About"].map((link) => (
              <button
                key={link}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "0.78rem",
                  fontFamily: "'Georgia', serif",
                  color: "#888",
                  cursor: "pointer",
                  letterSpacing: "0.05em",
                  transition: "color 0.2s",
                }}
                onMouseEnter={(e) => (e.target.style.color = "#5c4a3a")}
                onMouseLeave={(e) => (e.target.style.color = "#888")}
              >
                {link}
              </button>
            ))}

            {/* Avatar pill inside header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                background: "rgba(92, 74, 58, 0.08)",
                borderRadius: "999px",
                padding: "4px 12px 4px 4px",
                border: "1px solid rgba(92, 74, 58, 0.15)",
              }}
            >
              <div
                style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "50%",
                  overflow: "hidden",
                  background: "linear-gradient(135deg, #5c4a3a, #8b6f5e)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                {avatar
                  ? <img src={avatar} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  : <span style={{ color: "white", fontSize: "10px", fontWeight: "700" }}>{initials || "?"}</span>
                }
              </div>
              <span style={{ fontSize: "0.75rem", color: "#5c4a3a", fontWeight: "600" }}>
                {user.username.split(" ")[0]}
              </span>
            </div>
          </nav>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 pt-24">

        {/* HEADER PROFILE ROW */}
        <div className="flex items-center gap-8 mb-10">

          {/* ── BIGGER PROFILE PICTURE CIRCLE ── */}
          <div
            className="relative flex-shrink-0 group cursor-pointer"
            onClick={() => fileInputRef.current.click()}
            style={{ width: "96px", height: "96px" }}   /* was w-20 h-20 = 80px, now 96px */
          >
            {/* Subtle ring around circle */}
            <div
              style={{
                position: "absolute",
                inset: "-3px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #8b6f5e44, #5c4a3a33)",
                border: "1.5px solid rgba(92,74,58,0.25)",
              }}
            />
            <div
              style={{
                width: "96px",
                height: "96px",
                borderRadius: "50%",
                overflow: "hidden",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "linear-gradient(135deg, #5c4a3a, #8b6f5e)",
                position: "relative",
              }}
            >
              {avatar
                ? <img src={avatar} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : <span style={{ fontSize: "2rem", fontWeight: "700", color: "white" }}>{initials || "?"}</span>
              }
            </div>
            {/* Hover overlay */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: "50%",
                background: "rgba(0,0,0,0.38)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                opacity: 0,
                transition: "opacity 0.2s",
              }}
              className="group-hover:opacity-100"
            >
              <span style={{ color: "white", fontSize: "10px", fontWeight: "700", letterSpacing: "0.05em" }}>Change</span>
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
          </div>

          <div className="flex-1 min-w-0">
            <h1 className="font-bold text-2xl tracking-tight truncate">{user.username}</h1>
            <p className="text-[#888] text-sm mt-0.5 truncate">{user.email}</p>
            <p className="text-[#bbb] text-xs mt-0.5 capitalize">{user.role}</p>
          </div>

          <button
            onClick={() => { setDraft(user); setEditing((v) => !v); setShowNotif(false); setShowPriv(false); }}
            className="text-xs font-semibold px-4 py-2 rounded-full border border-[#d4c9bc] text-[#5c4a3a] hover:bg-[#5c4a3a] hover:text-white transition-all duration-200 flex-shrink-0"
          >
            {editing ? "Cancel" : "Edit"}
          </button>
        </div>

        {/* EDIT PANEL */}
        {editing && (
          <div className="mb-8 p-6 bg-white border border-[#e8e0d8] rounded-2xl shadow-sm">
            <h3 className="font-bold text-base mb-4">Edit Profile</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: "Username", key: "username", type: "text" },
                { label: "Email", key: "email", type: "email" },
                { label: "Role", key: "role", type: "text" },
              ].map(({ label, key, type }) => (
                <div key={key}>
                  <label className="block text-[10px] font-semibold text-[#aaa] mb-1 uppercase tracking-widest">{label}</label>
                  <input
                    type={type}
                    value={draft[key]}
                    onChange={(e) => setDraft({ ...draft, [key]: e.target.value })}
                    className="w-full border border-[#e0d8d0] rounded-lg px-3 py-2 text-sm bg-[#faf8f4] focus:outline-none focus:border-[#5c4a3a] transition-colors"
                  />
                </div>
              ))}
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={handleSaveProfile}
                className="px-5 py-2 bg-[#5c4a3a] text-white text-xs font-semibold rounded-full hover:bg-[#3d2f22] transition-colors">
                Save Changes
              </button>
              <button onClick={() => setEditing(false)}
                className="px-5 py-2 border border-[#d4c9bc] text-[#888] text-xs font-semibold rounded-full hover:bg-[#f0ece6] transition-colors">
                Discard
              </button>
            </div>
          </div>
        )}

        {/* STATS BAR */}
        <div className="flex gap-10 mb-10 pb-8 border-b border-[#e8e0d8] items-end flex-wrap">
          {/* Orders count */}
          <div>
            <p className="font-bold text-xl">{orders.length}</p>
            <p className="text-[#bbb] text-xs mt-0.5">Orders</p>
          </div>
          {/* Saved count */}
          <div>
            <p className="font-bold text-xl">{saved.length}</p>
            <p className="text-[#bbb] text-xs mt-0.5">Saved</p>
          </div>
          {/* Points — dynamiques avec tier + progress */}
          <div className="flex-1 min-w-[160px]">
            <div className="flex items-center gap-2 mb-1">
              <p className="font-bold text-xl">{points.toLocaleString()}</p>
              {/* Tier badge */}
              <span
                style={{
                  background: tier.color + "18",
                  color: tier.color,
                  border: `1px solid ${tier.color}44`,
                  fontSize: "10px",
                  fontWeight: "700",
                  padding: "2px 8px",
                  borderRadius: "999px",
                  letterSpacing: "0.06em",
                }}
              >
                {tier.name.toUpperCase()}
              </span>
            </div>
            <p className="text-[#bbb] text-xs mb-2">Points</p>
            {/* Progress bar vers prochain tier */}
            <div style={{ background: "#ede7df", borderRadius: "999px", height: "5px", width: "100%", maxWidth: "200px" }}>
              <div
                style={{
                  width: `${progressPct}%`,
                  background: `linear-gradient(90deg, ${tier.color}99, ${tier.color})`,
                  borderRadius: "999px",
                  height: "100%",
                  transition: "width 0.6s ease",
                }}
              />
            </div>
            {nextTier ? (
              <p className="text-[#bbb] text-[10px] mt-1">
                {(nextTier.min - points).toLocaleString()} pts → <span style={{ color: nextTier.color, fontWeight: "700" }}>{nextTier.name}</span>
              </p>
            ) : (
              <p className="text-[10px] mt-1" style={{ color: tier.color, fontWeight: "700" }}>Niveau maximum atteint 🏆</p>
            )}
          </div>
        </div>

        {/* TWO-COLUMN SPLIT */}
        <div className="flex gap-0">

          {/* LEFT — Orders + Saved */}
          <div className="flex-1 min-w-0 pr-10">

            <section className="mb-10">
              <div className="flex justify-between items-center mb-5">
                <h2 className="font-bold text-lg">My Orders</h2>
                <button
                  onClick={() => setShowAllOrders((v) => !v)}
                  className="text-xs text-[#aaa] hover:text-[#5c4a3a] transition-colors font-semibold"
                >
                  {showAllOrders ? "Show less ↑" : `See all (${orders.length}) →`}
                </button>
              </div>
              <div className="space-y-3">
                {visibleOrders.map((order) => {
                  const s = STATUS_COLORS[order.status] ?? { bg: "#F5F5F5", text: "#666" };
                  const orderPts = order.status === "Delivered"
                    ? Math.round(parseFloat(order.price.replace(/[^0-9.]/g, "")) * POINTS_PER_DOLLAR)
                    : null;
                  return (
                    <div
                      key={order.id}
                      className="flex items-center justify-between p-4 bg-white rounded-xl border border-[#ede7df] hover:border-[#c9bdb0] transition-colors"
                    >
                      <div className="min-w-0 pr-4">
                        <p className="text-sm font-medium truncate">{order.name}</p>
                        <p className="text-xs text-[#bbb] mt-0.5">{order.date} · {order.price}</p>
                        {orderPts !== null && (
                          <p className="text-[10px] mt-0.5" style={{ color: "#16A34A", fontWeight: "700" }}>
                            +{orderPts} pts collected
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span
                          className="text-[11px] font-semibold px-3 py-1 rounded-full cursor-pointer select-none"
                          style={{ background: s.bg, color: s.text }}
                          title="Cliquer pour changer le statut (demo)"
                          onClick={() => {
                            const cycle = ["Processing", "In Transit", "Delivered"];
                            const next = cycle[(cycle.indexOf(order.status) + 1) % cycle.length];
                            setOrders((prev) => prev.map((o) => o.id === order.id ? { ...o, status: next } : o));
                          }}
                        >
                          {order.status}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            <section>
              <div className="flex justify-between items-center mb-5">
                <h2 className="font-bold text-lg">Wish List</h2>
                <button
                  onClick={() => setShowAllSaved((v) => !v)}
                  className="text-xs text-[#aaa] hover:text-[#5c4a3a] transition-colors font-semibold"
                >
                  {showAllSaved ? "Show less ↑" : `View all (${saved.length}) →`}
                </button>
              </div>
              <div className="space-y-3">
                {visibleSaved.length === 0 && (
                  <p className="py-6 text-center text-sm text-[#bbb]">No saved items yet.</p>
                )}
                {visibleSaved.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-4 bg-white rounded-xl border border-[#ede7df] hover:border-[#c9bdb0] transition-colors"
                  >
                    <span className="text-sm truncate pr-4">{item.name}</span>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className="text-[#5c4a3a] text-sm font-bold">{item.price}</span>
                      <button
                        onClick={() => setSaved((p) => p.filter((i) => i.id !== item.id))}
                        className="text-[#ccc] hover:text-red-400 transition-colors text-xs"
                        title="Remove"
                      >✕</button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* VERTICAL DIVIDER */}
          <div className="w-px bg-[#e8e0d8] self-stretch flex-shrink-0" />

          {/* RIGHT — Account */}
          <div className="w-60 flex-shrink-0 pl-10">
            <h2 className="font-bold text-lg mb-5">Account</h2>

            <div className="space-y-1">

              <button
                onClick={() => { setDraft(user); setEditing((v) => !v); setShowNotif(false); setShowPriv(false); }}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm text-[#555] hover:bg-white hover:text-[#5c4a3a] border border-transparent hover:border-[#ede7df] transition-all"
              >
                <span>Edit Profile</span>
                <span className="text-[#bbb] text-xs">{editing ? "↑" : "›"}</span>
              </button>

              <button
                onClick={() => { setShowNotif((v) => !v); setShowPriv(false); setEditing(false); }}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm text-[#555] hover:bg-white hover:text-[#5c4a3a] border border-transparent hover:border-[#ede7df] transition-all"
              >
                <span>Notifications</span>
                <span className="text-[#bbb] text-xs">{showNotif ? "↑" : "›"}</span>
              </button>
              {showNotif && (
                <div className="mx-1 mb-1 bg-white border border-[#ede7df] rounded-xl p-4 space-y-3">
                  {Object.entries(notif).map(([key, val]) => (
                    <div key={key} className="flex items-center justify-between gap-2">
                      <span className="text-xs text-[#666] capitalize">{key.replace(/([A-Z])/g, " $1")}</span>
                      <Toggle on={val} onToggle={() => setNotif((n) => ({ ...n, [key]: !n[key] }))} />
                    </div>
                  ))}
                </div>
              )}

              <button
                onClick={() => { setShowPriv((v) => !v); setShowNotif(false); setEditing(false); }}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm text-[#555] hover:bg-white hover:text-[#5c4a3a] border border-transparent hover:border-[#ede7df] transition-all"
              >
                <span>Privacy</span>
                <span className="text-[#bbb] text-xs">{showPriv ? "↑" : "›"}</span>
              </button>
              {showPriv && (
                <div className="mx-1 mb-1 bg-white border border-[#ede7df] rounded-xl p-4 space-y-3">
                  {Object.entries(priv).map(([key, val]) => (
                    <div key={key} className="flex items-center justify-between gap-2">
                      <span className="text-xs text-[#666] capitalize">{key.replace(/([A-Z])/g, " $1")}</span>
                      <Toggle on={val} onToggle={() => setPriv((p) => ({ ...p, [key]: !p[key] }))} />
                    </div>
                  ))}
                </div>
              )}

              <div className="pt-2 pb-1 px-1">
                <div className="h-px bg-[#ede7df]" />
              </div>

              <button
                onClick={() => alert("Logged out!")}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm text-red-400 hover:bg-red-50 border border-transparent transition-all"
              >
                <span>Logout</span>
                <span className="text-xs">→</span>
              </button>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}