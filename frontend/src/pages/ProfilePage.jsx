import { useState, useRef, useEffect, useCallback } from "react";
import api from "../services/api";
import { logout } from "../services/auth";
import { useNavigate } from "react-router-dom";

// ─── Keyframes ────────────────────────────────────────────────────────────────
const KEYFRAMES = `
  @keyframes fadeUp      { from { opacity:0; transform:translateY(18px);   } to { opacity:1; transform:none;              } }
  @keyframes fadeIn      { from { opacity:0;                               } to { opacity:1;                              } }
  @keyframes bounceIn    { 0%   { opacity:0; transform:scale(0.5);         } 70%{ opacity:1; transform:scale(1.08);       } 100%{ transform:scale(1); } }
  @keyframes slideDown   { from { opacity:0; transform:translateY(-10px);  } to { opacity:1; transform:none;              } }
  @keyframes slideInLeft { from { opacity:0; transform:translateX(-20px);  } to { opacity:1; transform:none;              } }
  @keyframes scaleIn     { from { opacity:0; transform:scale(0.92);        } to { opacity:1; transform:scale(1);          } }
  @keyframes shimmer     { 0%,100%{opacity:0.6} 50%{opacity:1}                                                              }
  @keyframes pulseRing   { 0%  {box-shadow:0 0 0 0   rgba(92,74,58,0.3);}  70%{box-shadow:0 0 0 10px rgba(92,74,58,0);}  100%{box-shadow:0 0 0 0 rgba(92,74,58,0);} }
  @keyframes barFill     { from { width:0%; } to { width:var(--bar-w); }                                                    }
  @keyframes spin        { to { transform:rotate(360deg); } }
`;

function getInitials(name = "") {
  return name.split(/[\s_@]+/).slice(0, 2).map(w => w[0]?.toUpperCase() ?? "").join("");
}
const BASE = "http://127.0.0.1:8000";
const img = path => (path ? `${BASE}/${path}` : null);
const real = val => (val && val !== "string" ? val : null);

function Toggle({ on, onToggle }) {
  return (
    <button onClick={onToggle}
      style={{ background: on ? "#5c4a3a" : "#ddd", transition: "background 0.3s" }}
      className="relative w-10 h-5 rounded-full flex-shrink-0"
    >
      <span className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all duration-300"
        style={{ left: on ? "1.25rem" : "0.125rem" }} />
    </button>
  );
}

const STATUS_COLORS = {
  delivered: { bg: "#F0FDF4", text: "#16A34A" },
  shipped: { bg: "#FFFBEB", text: "#D97706" },
  canceled: { bg: "#FEE2E2", text: "#EF4444" },
  pending: { bg: "#F5F5F5", text: "#666666" },
  partial: { bg: "#F0FDF4", text: "#4ADE80" },
};

function formatDate(dateStr) {
  if (!dateStr) return "";
  try { return new Date(dateStr).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }); }
  catch { return dateStr; }
}
function formatPrice(val) {
  if (val == null) return "";
  return `${Number(val).toFixed(2)} DA`;
}

const DEFAULT_NOTIF = { orders: true, promotions: false, newsletter: true };
const DEFAULT_PRIV = { publicProfile: false, shareActivity: true };

function loadPref(key, fallback) {
  try { const raw = localStorage.getItem(key); return raw ? { ...fallback, ...JSON.parse(raw) } : fallback; }
  catch { return fallback; }
}

// ─── Count-up hook ────────────────────────────────────────────────────────────
function useCountUp(target, duration = 1000) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!target) return;
    const steps = 36;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      const ease = 1 - Math.pow(1 - step / steps, 3);
      setValue(Math.round(target * ease));
      if (step >= steps) { setValue(target); clearInterval(timer); }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [target, duration]);
  return value;
}

export function ProfilePage() {
  const [profileInfo, setProfileInfo] = useState();
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarHover, setAvatarHover] = useState(false);
  const editFileInputRef = useRef(null);
  const quickUploadRef = useRef(null);
  const [draft, setDraft] = useState({});
  const [editing, setEditing] = useState(false);
  const [notif, setNotif] = useState(() => loadPref("notif_prefs", DEFAULT_NOTIF));
  const [showNotif, setShowNotif] = useState(false);
  const [notifSaved, setNotifSaved] = useState(false);
  const [priv, setPriv] = useState(() => loadPref("priv_prefs", DEFAULT_PRIV));
  const [showPriv, setShowPriv] = useState(false);
  const [privSaved, setPrivSaved] = useState(false);
  const [showAllOrders, setShowAllOrders] = useState(false);
  const [showAllFavorites, setShowAllFavorites] = useState(false);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [mounted, setMounted] = useState(false);
  const navigate = useNavigate();

  const fetchProfile = useCallback(async () => {
    try {
      const res = await api.get("/api/profile");
      setProfileInfo(res.data);
      setDraft(res.data);
      if (res.data.avatar_url) setAvatar(res.data.avatar_url);
      setTimeout(() => setMounted(true), 80);
    } catch (err) { console.error(err); }
  }, []);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  // Count-up values — only start once profileInfo loads
  const animOrders = useCountUp(profileInfo?.orders.length ?? 0, 900);
  const animFavorites = useCountUp(profileInfo?.favorites.length ?? 0, 900);
  const animPoints = useCountUp(profileInfo?.stats.points ?? 0, 1200);

  const handleSaveNotif = () => { localStorage.setItem("notif_prefs", JSON.stringify(notif)); setNotifSaved(true); setTimeout(() => setNotifSaved(false), 2000); };
  const handleSavePriv = () => { localStorage.setItem("priv_prefs", JSON.stringify(priv)); setPrivSaved(true); setTimeout(() => setPrivSaved(false), 2000); };

  const handleSaveProfile = async () => {
    try {
      const formData = new FormData();
      if (draft.username) formData.append("username", draft.username);
      if (draft.email) formData.append("email", draft.email);
      if (draft.phone) formData.append("phone", draft.phone);
      if (avatarFile) formData.append("avatar", avatarFile);
      const res = await api.put("/api/profile", formData, { headers: { "Content-Type": "multipart/form-data" } });
      const updated = res.data.user;
      setProfileInfo(p => ({ ...p, username: updated.username, email: updated.email, phone: updated.phone, avatar_url: updated.avatar_url }));
      if (updated.avatar_url) setAvatar(updated.avatar_url);
      setAvatarPreview(null); setAvatarFile(null); setEditing(false);
    } catch (err) { console.error("Update failed:", err); }
  };

  const handleAvatarFileChange = e => {
    const file = e.target.files[0];
    if (file) { setAvatarPreview(URL.createObjectURL(file)); setAvatarFile(file); }
  };

  const displaySrc = (editing && avatarPreview) ? avatarPreview : avatarPreview ? avatarPreview : img(avatar);

  const removeFavorite = async favId => {
    try { await api.delete(`/api/favorites/${favId}`); setProfileInfo(p => ({ ...p, favorites: p.favorites.filter(i => i.id !== favId) })); }
    catch (err) { console.error(err); }
  };

  const handleLogout = () => { logout(); setProfileInfo(null); navigate("/"); };

  if (!profileInfo) return (
    <div style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }} className="min-h-screen bg-[#FAF8F4] flex items-center justify-center text-[#bbb] text-sm">
      <style>{KEYFRAMES}</style>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
        <div style={{ width: "32px", height: "32px", border: "2px solid rgba(92,74,58,0.3)", borderTopColor: "#5c4a3a", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        <span style={{ animation: "shimmer 1.5s ease infinite", fontSize: "0.75rem", letterSpacing: "0.15em" }}>Loading…</span>
      </div>
    </div>
  );

  const visibleOrders = showAllOrders ? profileInfo.orders : profileInfo.orders.slice(0, 2);
  const visibleFavorites = showAllFavorites ? profileInfo.favorites : profileInfo.favorites.slice(0, 2);
  const initials = getInitials(profileInfo.username);
  const displayEmail = real(profileInfo.email);
  const displayPhone = real(profileInfo.phone);
  const displayRole = real(profileInfo.role);

  return (
    <div style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }} className="min-h-screen bg-[#FAF8F4] text-[#1a1a1a] pb-24">
      <style>{KEYFRAMES}</style>

      <main className="max-w-5xl mx-auto px-6 pt-36">

        {/* ── HEADER PROFILE ROW ── */}
        <div className="flex items-center gap-8 mb-10">

          {/* Avatar with bounce-in + camera overlay */}
          <div style={{ width: "96px", height: "96px", position: "relative", flexShrink: 0, animation: "bounceIn 0.6s cubic-bezier(0.34,1.56,0.64,1) both" }}
            onMouseEnter={() => setAvatarHover(true)} onMouseLeave={() => setAvatarHover(false)}
          >
            <div style={{ position: "absolute", inset: "-3px", borderRadius: "50%", border: "1.5px solid rgba(92,74,58,0.25)", animation: mounted ? "pulseRing 2.5s 0.8s infinite" : "none" }} />
            <div style={{ width: "96px", height: "96px", borderRadius: "50%", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #5c4a3a, #8b6f5e)", position: "relative" }}>
              {displaySrc
                ? <img src={displaySrc} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.3s ease", transform: avatarHover ? "scale(1.08)" : "scale(1)" }} />
                : <span style={{ fontSize: "2rem", fontWeight: "700", color: "white" }}>{initials || "?"}</span>}
            </div>
            <div onClick={() => quickUploadRef.current?.click()} title="Change photo"
              style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "rgba(0,0,0,0.42)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", opacity: avatarHover ? 1 : 0, transition: "opacity 0.25s ease" }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" />
              </svg>
            </div>
            <input ref={quickUploadRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleAvatarFileChange} />
          </div>

          {/* Name / info — staggered */}
          <div className="flex-1 min-w-0">
            <h1 className="font-bold text-2xl tracking-tight truncate" style={{ animation: "slideInLeft 0.5s ease 0.15s both" }}>{profileInfo.username}</h1>
            {displayEmail && <p className="text-[#888] text-sm mt-0.5 truncate" style={{ animation: "slideInLeft 0.5s ease 0.22s both" }}>{displayEmail}</p>}
            {displayPhone && <p className="text-[#aaa] text-xs mt-0.5" style={{ animation: "slideInLeft 0.5s ease 0.29s both" }}>{displayPhone}</p>}
            {displayRole && <p className="text-[#bbb] text-xs mt-0.5 capitalize" style={{ animation: "slideInLeft 0.5s ease 0.36s both" }}>{displayRole}</p>}
          </div>

          <button onClick={() => { setDraft(profileInfo); setEditing(v => !v); setShowNotif(false); setShowPriv(false); }}
            className="text-xs font-semibold px-4 py-2 rounded-full border border-[#d4c9bc] text-[#5c4a3a] hover:bg-[#5c4a3a] hover:text-white transition-all duration-200 flex-shrink-0"
            style={{ animation: "fadeUp 0.5s ease 0.4s both" }}>
            {editing ? "Cancel" : "Edit"}
          </button>
        </div>

        {/* ── EDIT PANEL — slides down ── */}
        {editing && (
          <div className="mb-8 p-6 bg-white border border-[#e8e0d8] rounded-2xl shadow-sm" style={{ animation: "slideDown 0.35s cubic-bezier(0.22,1,0.36,1) both" }}>
            <h3 className="font-bold text-base mb-6">Edit Profile</h3>
            <div className="flex items-center gap-5 mb-6 pb-6 border-b border-[#f0ece6]">
              <div style={{ width: "72px", height: "72px", borderRadius: "50%", overflow: "hidden", flexShrink: 0, background: "linear-gradient(135deg, #5c4a3a, #8b6f5e)", display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid #e8e0d8" }}>
                {displaySrc
                  ? <img src={displaySrc} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  : <span style={{ fontSize: "1.5rem", fontWeight: "700", color: "white" }}>{initials || "?"}</span>}
              </div>
              <div>
                <p className="text-xs font-semibold text-[#555] mb-1">Profile Photo</p>
                <p className="text-[10px] text-[#bbb] mb-2">JPG, PNG or GIF · Max 5 MB</p>
                <button type="button" onClick={() => editFileInputRef.current?.click()}
                  className="text-xs font-semibold px-4 py-1.5 rounded-full border border-[#d4c9bc] text-[#5c4a3a] hover:bg-[#5c4a3a] hover:text-white transition-all duration-200">
                  Upload new photo
                </button>
                <input ref={editFileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarFileChange} />
              </div>
              {(avatarPreview || avatar) && (
                <button type="button" onClick={() => { setAvatar(null); setAvatarPreview(null); setAvatarFile(null); }}
                  className="ml-auto text-[10px] text-[#ccc] hover:text-red-400 transition-colors font-semibold">Remove</button>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: "Username", key: "username", type: "text", placeholder: "Your name" },
                { label: "Email", key: "email", type: "email", placeholder: "you@example.com" },
                { label: "Phone", key: "phone", type: "tel", placeholder: "+213 6XX XXX XXX" },
              ].map(({ label, key, type, placeholder }, i) => (
                <div key={key} style={{ animation: `fadeUp 0.3s ease ${i * 60}ms both` }}>
                  <label className="block text-[10px] font-semibold text-[#aaa] mb-1 uppercase tracking-widest">{label}</label>
                  <input type={type} value={draft[key] ?? ""} placeholder={placeholder}
                    onChange={e => setDraft({ ...draft, [key]: e.target.value })}
                    className="w-full border border-[#e0d8d0] rounded-lg px-3 py-2 text-sm bg-[#faf8f4] focus:outline-none focus:border-[#5c4a3a] transition-colors placeholder:text-[#ccc]" />
                </div>
              ))}
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={handleSaveProfile}
                className="px-5 py-2 bg-[#5c4a3a] text-white text-xs font-semibold rounded-full hover:bg-[#3d2f22] transition-all duration-200 hover:-translate-y-0.5">
                Save Changes
              </button>
              <button onClick={() => { setEditing(false); setAvatarPreview(null); setAvatarFile(null); setAvatar(profileInfo.avatar_url || null); }}
                className="px-5 py-2 border border-[#d4c9bc] text-[#888] text-xs font-semibold rounded-full hover:bg-[#f0ece6] transition-colors">
                Discard
              </button>
            </div>
          </div>
        )}

        {/* ── STATS BAR — count-up + progress fill ── */}
        <div className="flex gap-10 mb-10 pb-8 border-b border-[#e8e0d8] items-end flex-wrap">
          {[
            { val: animOrders, label: "Orders", delay: 0 },
            { val: animFavorites, label: "Saved", delay: 80 },
          ].map(({ val, label, delay }) => (
            <div key={label} style={{ animation: `fadeUp 0.5s ease ${delay}ms both` }}>
              <p className="font-bold text-xl" style={{ fontVariantNumeric: "tabular-nums", transition: "all 0.05s" }}>{val}</p>
              <p className="text-[#bbb] text-xs mt-0.5">{label}</p>
            </div>
          ))}

          {/* Points + tier + progress */}
          <div className="flex-1 min-w-[160px]" style={{ animation: "fadeUp 0.5s ease 160ms both" }}>
            <div className="flex items-center gap-2 mb-1">
              <p className="font-bold text-xl" style={{ fontVariantNumeric: "tabular-nums" }}>{animPoints.toLocaleString()}</p>
              <span style={{
                background: profileInfo.stats.tier.color + "18", color: profileInfo.stats.tier.color,
                border: `1px solid ${profileInfo.stats.tier.color}44`,
                fontSize: "10px", fontWeight: "700", padding: "2px 8px", borderRadius: "999px", letterSpacing: "0.06em",
                animation: "scaleIn 0.5s cubic-bezier(0.34,1.56,0.64,1) 0.5s both",
              }}>
                {profileInfo.stats.tier.name.toUpperCase()}
              </span>
            </div>
            <p className="text-[#bbb] text-xs mb-2">Points</p>
            {/* Animated progress bar */}
            <div style={{ background: "#ede7df", borderRadius: "999px", height: "5px", width: "100%", maxWidth: "200px", overflow: "hidden" }}>
              <div style={{
                height: "100%", borderRadius: "999px",
                background: `linear-gradient(90deg, ${profileInfo.stats.tier.color}99, ${profileInfo.stats.tier.color})`,
                width: mounted ? `${profileInfo.stats.progress_pct}%` : "0%",
                transition: "width 1.2s cubic-bezier(0.22,1,0.36,1) 0.3s",
              }} />
            </div>
            {profileInfo.stats.next_tier
              ? <p className="text-[#bbb] text-[10px] mt-1">{(profileInfo.stats.next_tier.min - profileInfo.stats.points).toLocaleString()} pts →{" "}<span style={{ color: profileInfo.stats.next_tier.color, fontWeight: "700" }}>{profileInfo.stats.next_tier.name}</span></p>
              : <p className="text-[10px] mt-1" style={{ color: profileInfo.stats.tier.color, fontWeight: "700" }}>Max level reached 🏆</p>}
          </div>
        </div>

        {/* ── TWO-COLUMN SPLIT ── */}
        <div className="flex gap-0">

          {/* LEFT */}
          <div className="flex-1 min-w-0 pr-10">

            {/* MY ORDERS */}
            <section className="mb-10">
              <div className="flex justify-between items-center mb-5" style={{ animation: "slideInLeft 0.5s ease 0.2s both" }}>
                <h2 className="font-bold text-lg">My Orders</h2>
                <button onClick={() => setShowAllOrders(v => !v)}
                  className="text-xs text-[#aaa] hover:text-[#5c4a3a] transition-colors font-semibold">
                  {showAllOrders ? "Show less ↑" : `See all (${profileInfo.orders.length}) →`}
                </button>
              </div>
              <div className="space-y-3">
                {visibleOrders.length === 0 && <p className="py-6 text-center text-sm text-[#bbb]">No orders yet.</p>}
                {visibleOrders.map((order, i) => {
                  const s = STATUS_COLORS[order.status?.toLowerCase()] ?? { bg: "#F5F5F5", text: "#666" };
                  const isExpanded = expandedOrderId === order.id;
                  return (
                    <div key={order.id}
                      onClick={() => navigate(`/order/tracking/${order.id}/${order.items?.product_id ?? 0}`)}
                      className="bg-white rounded-xl border border-[#ede7df] hover:border-[#5c4a3a] hover:shadow-sm cursor-pointer overflow-hidden"
                      style={{
                        opacity: mounted ? 1 : 0,
                        transform: mounted ? "none" : "translateY(14px)",
                        transition: `opacity 0.5s ease ${i * 80}ms, transform 0.5s ease ${i * 80}ms, border-color 0.2s, box-shadow 0.2s`,
                      }}
                    >
                      <div className="flex items-center justify-between p-4">
                        <div className="min-w-0 pr-4">
                          <p className="text-sm font-medium">
                            Order #{order.id}<span className="text-[#bbb] font-normal ml-1">· {order.items?.length ?? 0} item{(order.items?.length ?? 0) !== 1 ? "s" : ""}</span>
                          </p>
                          <p className="text-xs text-[#bbb] mt-0.5">{formatDate(order.created_at)} · {formatPrice(order.total_price)}</p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-[11px] font-semibold px-3 py-1 rounded-full" style={{ background: s.bg, color: s.text }}>{order.status}</span>
                          {order.items?.length > 0 && (
                            <button onClick={e => { e.stopPropagation(); setExpandedOrderId(isExpanded ? null : order.id); }}
                              className="text-[#bbb] hover:text-[#5c4a3a] transition-colors text-xs font-semibold"
                              style={{ transition: "transform 0.2s", transform: isExpanded ? "rotate(180deg)" : "none" }}>
                              ▼
                            </button>
                          )}
                        </div>
                      </div>
                      {isExpanded && order.items?.length > 0 && (
                        <div className="border-t border-[#f0ebe4] divide-y divide-[#f5f0ea]" style={{ animation: "slideDown 0.25s ease both" }}>
                          {order.items.map((item, j) => (
                            <div key={item.id} className="flex items-center gap-3 px-4 py-3"
                              style={{ animation: `fadeUp 0.3s ease ${j * 50}ms both` }}>
                              {item.product?.image
                                ? <img src={img(item.product.image)} alt={item.product?.name} className="w-10 h-10 rounded-lg object-cover flex-shrink-0 bg-[#f0ebe4]" style={{ transition: "transform 0.2s" }} onMouseEnter={e => e.currentTarget.style.transform = "scale(1.06)"} onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"} />
                                : <div className="w-10 h-10 rounded-lg bg-[#f0ebe4] flex-shrink-0" />}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{item.product?.name ?? `Product #${item.product_id}`}</p>
                                <p className="text-xs text-[#bbb] mt-0.5">Qty: {item.quantity} · {formatPrice(item.price)}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>

            {/* FAVORITES */}
            <section>
              <div className="flex justify-between items-center mb-5" style={{ animation: "slideInLeft 0.5s ease 0.3s both" }}>
                <h2 className="font-bold text-lg">Favorites List</h2>
                <button onClick={() => setShowAllFavorites(v => !v)}
                  className="text-xs text-[#aaa] hover:text-[#5c4a3a] transition-colors font-semibold">
                  {showAllFavorites ? "Show less ↑" : `View all (${profileInfo.favorites.length}) →`}
                </button>
              </div>
              <div className="space-y-3">
                {visibleFavorites.length === 0 && <p className="py-6 text-center text-sm text-[#bbb]">No favorites yet.</p>}
                {visibleFavorites.map((item, i) => (
                  <div key={item.id}
                    className="flex items-center justify-between p-4 bg-white rounded-xl border border-[#ede7df] hover:border-[#c9bdb0] hover:shadow-sm"
                    style={{
                      opacity: mounted ? 1 : 0,
                      transform: mounted ? "none" : "translateY(14px)",
                      transition: `opacity 0.5s ease ${i * 70 + 200}ms, transform 0.5s ease ${i * 70 + 200}ms, border-color 0.2s, box-shadow 0.2s`,
                    }}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img src={img(item.image)} alt={item.name}
                        className="w-12 h-12 rounded-lg object-cover border border-[#eee]"
                        style={{ transition: "transform 0.25s ease" }}
                        onMouseEnter={e => e.currentTarget.style.transform = "scale(1.08)"}
                        onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
                      />
                      <span className="text-sm truncate">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className="text-[#5c4a3a] text-sm font-bold">{formatPrice(item.price)}</span>
                      <button onClick={() => removeFavorite(item.id)}
                        className="text-[#ccc] hover:text-red-400 transition-colors text-xs"
                        style={{ transition: "transform 0.15s, color 0.2s" }}
                        onMouseEnter={e => e.currentTarget.style.transform = "scale(1.2)"}
                        onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
                        title="Remove">✕</button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* VERTICAL DIVIDER */}
          <div className="w-px bg-[#e8e0d8] self-stretch flex-shrink-0" style={{ animation: "fadeIn 0.8s ease 0.5s both" }} />

          {/* RIGHT — Account */}
          <div className="w-60 flex-shrink-0 pl-10" style={{ animation: "fadeUp 0.5s ease 0.35s both" }}>
            <h2 className="font-bold text-lg mb-5">Account</h2>
            <div className="space-y-1">

              {[
                {
                  label: "Edit Profile",
                  icon: "›",
                  active: editing,
                  onClick: () => { setDraft(profileInfo); setEditing(v => !v); setShowNotif(false); setShowPriv(false); },
                },
                {
                  label: "Notifications",
                  icon: "›",
                  active: showNotif,
                  onClick: () => { setShowNotif(v => !v); setShowPriv(false); setEditing(false); },
                },
              ].map(({ label, active, onClick }, i) => (
                <div key={label}>
                  <button onClick={onClick}
                    className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm text-[#555] hover:bg-white hover:text-[#5c4a3a] border border-transparent hover:border-[#ede7df] transition-all"
                    style={{ animation: `fadeUp 0.4s ease ${i * 60 + 400}ms both` }}>
                    <span>{label}</span>
                    <span className="text-[#bbb] text-xs" style={{ transition: "transform 0.2s", display: "inline-block", transform: active ? "rotate(90deg)" : "none" }}>›</span>
                  </button>

                  {label === "Notifications" && showNotif && (
                    <div className="mx-1 mb-1 bg-white border border-[#ede7df] rounded-xl p-4 space-y-3" style={{ animation: "slideDown 0.25s ease both" }}>
                      {Object.entries(notif).map(([key, val], j) => (
                        <div key={key} className="flex items-center justify-between gap-2" style={{ animation: `fadeUp 0.25s ease ${j * 50}ms both` }}>
                          <span className="text-xs text-[#666] capitalize">{key.replace(/([A-Z])/g, " $1")}</span>
                          <Toggle on={val} onToggle={() => setNotif(n => ({ ...n, [key]: !n[key] }))} />
                        </div>
                      ))}
                      <button onClick={handleSaveNotif}
                        className="w-full mt-1 py-1.5 rounded-lg text-[11px] font-semibold transition-all duration-300"
                        style={{ background: notifSaved ? "#F0FDF4" : "#5c4a3a", color: notifSaved ? "#16A34A" : "white" }}>
                        {notifSaved ? "✓ Saved" : "Save preferences"}
                      </button>
                    </div>
                  )}
                </div>
              ))}

              {/* Privacy */}
              <button onClick={() => { setShowPriv(v => !v); setShowNotif(false); setEditing(false); }}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm text-[#555] hover:bg-white hover:text-[#5c4a3a] border border-transparent hover:border-[#ede7df] transition-all"
                style={{ animation: "fadeUp 0.4s ease 520ms both" }}>
                <span>Privacy</span>
                <span className="text-[#bbb] text-xs" style={{ transition: "transform 0.2s", display: "inline-block", transform: showPriv ? "rotate(90deg)" : "none" }}>›</span>
              </button>
              {showPriv && (
                <div className="mx-1 mb-1 bg-white border border-[#ede7df] rounded-xl p-4 space-y-3" style={{ animation: "slideDown 0.25s ease both" }}>
                  {Object.entries(priv).map(([key, val], j) => (
                    <div key={key} className="flex items-center justify-between gap-2" style={{ animation: `fadeUp 0.25s ease ${j * 50}ms both` }}>
                      <span className="text-xs text-[#666] capitalize">{key.replace(/([A-Z])/g, " $1")}</span>
                      <Toggle on={val} onToggle={() => setPriv(p => ({ ...p, [key]: !p[key] }))} />
                    </div>
                  ))}
                  <button onClick={handleSavePriv}
                    className="w-full mt-1 py-1.5 rounded-lg text-[11px] font-semibold transition-all duration-300"
                    style={{ background: privSaved ? "#F0FDF4" : "#5c4a3a", color: privSaved ? "#16A34A" : "white" }}>
                    {privSaved ? "✓ Saved" : "Save preferences"}
                  </button>
                </div>
              )}

              <div className="pt-2 pb-1 px-1" style={{ animation: "fadeIn 0.4s ease 600ms both" }}>
                <div className="h-px bg-[#ede7df]" />
              </div>

              <button onClick={handleLogout}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm text-red-400 hover:bg-red-50 border border-transparent transition-all"
                style={{ animation: "fadeUp 0.4s ease 640ms both" }}
                onMouseEnter={e => { e.currentTarget.style.letterSpacing = "0.02em"; }}
                onMouseLeave={e => { e.currentTarget.style.letterSpacing = "normal"; }}
              >
                <span>Logout</span>
                <span className="text-xs" style={{ transition: "transform 0.2s" }}>→</span>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}