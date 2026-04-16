/**
 * ProfilePage.jsx - User Profile Page (Fully Functional)
 * =========================================================
 * ROUTE: /profile
 * API:   GET /profile, PUT /profile, POST /profile/avatar
 * Redirects to /login if token is invalid/expired.
 *
 * NEW FEATURES:
 *  - Avatar upload (click avatar → file picker → preview + save)
 *  - Inline edit modal for Personal Info (username, email, phone)
 *  - Functional address add/edit/remove
 *  - Nav tabs render different content panels
 *  - Toast notifications for save feedback
 */

import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";

/* ─── Tailwind config additions (tailwind.config.js) ─────────────────────────
   (same as before — keep your existing config)
   ─────────────────────────────────────────────────────────────────────────── */

const NAV_ITEMS = [
  { key: "profile", icon: "account_circle", label: "My Profile" },
  { key: "orders", icon: "history", label: "Orders" },
  { key: "favorites", icon: "favorite", label: "Favorites" },
  { key: "addresses", icon: "location_on", label: "Addresses" },
  { key: "settings", icon: "settings", label: "Settings" },
];

function roleLabel(role) {
  if (!role) return "Member";
  return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
}

/* ══════════════════════════════════════════════════════════════════════════════
   TOAST
   ══════════════════════════════════════════════════════════════════════════════ */
function Toast({ toasts }) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 pointer-events-none">
      {toasts.map(t => (
        <div
          key={t.id}
          className="flex items-center gap-3 px-5 py-4 rounded-xl shadow-2xl text-sm font-medium"
          style={{
            background: t.type === "error" ? "#ba1a1a" : "#18281e",
            color: "#fff",
            animation: "slideUp 0.3s ease",
          }}
        >
          <span className="material-symbols-outlined text-base">
            {t.type === "error" ? "error" : "check_circle"}
          </span>
          {t.message}
        </div>
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   EDIT PROFILE MODAL
   ══════════════════════════════════════════════════════════════════════════════ */
function EditProfileModal({ user, onClose, onSave, saving }) {
  const [form, setForm] = useState({
    username: user?.username || "",
    email: user?.email || "",
    phoneNum: user?.phoneNum || "",
  });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.username.trim()) e.username = "Username is required";
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Invalid email";
    if (form.phoneNum && !/^[+\d\s\-()]{7,}$/.test(form.phoneNum))
      e.phoneNum = "Invalid phone number";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) onSave(form);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(28,28,25,0.55)", backdropFilter: "blur(6px)" }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-lg rounded-2xl p-8 md:p-10 relative"
        style={{ background: "#fcf9f4", boxShadow: "0 32px 80px rgba(28,28,25,0.18)" }}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full transition-colors"
          style={{ color: "#474348" }}
          onMouseEnter={e => e.currentTarget.style.background = "#f0ede8"}
          onMouseLeave={e => e.currentTarget.style.background = ""}
        >
          <span className="material-symbols-outlined">close</span>
        </button>

        <h2
          className="text-2xl mb-8"
          style={{ fontFamily: "'Noto Serif', serif", color: "#271828ff" }}
        >
          Edit Details
        </h2>

        <div className="space-y-6">
          {[
            { key: "username", label: "Username", type: "text", placeholder: "Your display name" },
            { key: "email", label: "Email Address", type: "email", placeholder: "you@example.com" },
            { key: "phoneNum", label: "Phone Number", type: "tel", placeholder: "+213 XX XX XX XX" },
          ].map(({ key, label, type, placeholder }) => (
            <div key={key}>
              <label
                className="block text-[0.6875rem] uppercase tracking-widest font-bold mb-2"
                style={{ color: "#474348ff" }}
              >
                {label}
              </label>
              <input
                type={type}
                value={form[key]}
                placeholder={placeholder}
                onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                className="w-full px-5 py-3.5 rounded-xl text-base outline-none transition-all"
                style={{
                  background: "#f0ede8",
                  color: "#1c1c19",
                  border: errors[key] ? "1.5px solid #ba1a1a" : "1.5px solid transparent",
                  fontFamily: "'Manrope', sans-serif",
                }}
                onFocus={e => { if (!errors[key]) e.target.style.border = "1.5px solid #5a6051"; }}
                onBlur={e => { if (!errors[key]) e.target.style.border = "1.5px solid transparent"; }}
              />
              {errors[key] && (
                <p className="text-xs mt-1.5" style={{ color: "#ba1a1a" }}>{errors[key]}</p>
              )}
            </div>
          ))}
        </div>

        <div className="flex gap-4 mt-10">
          <button
            onClick={onClose}
            className="flex-1 py-3.5 rounded-xl font-medium text-sm transition-all"
            style={{ background: "#e5e2dd", color: "#434844" }}
            onMouseEnter={e => e.currentTarget.style.background = "#dcdad5"}
            onMouseLeave={e => e.currentTarget.style.background = "#e5e2dd"}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex-1 py-3.5 rounded-xl font-medium text-sm transition-all flex items-center justify-center gap-2"
            style={{
              background: saving ? "#96a99b" : "#18281e",
              color: "#ffffff",
              cursor: saving ? "not-allowed" : "pointer",
            }}
          >
            {saving && <span className="material-symbols-outlined text-base animate-spin">refresh</span>}
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   ADDRESS MODAL (add / edit)
   ══════════════════════════════════════════════════════════════════════════════ */
function AddressModal({ existing, onClose, onSave, saving }) {
  const [form, setForm] = useState({
    label: existing?.label || "Home",
    address: existing?.address || "",
  });
  const [error, setError] = useState("");

  const handleSubmit = () => {
    if (!form.address.trim()) { setError("Address cannot be empty"); return; }
    onSave(form);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(28,28,25,0.55)", backdropFilter: "blur(6px)" }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-lg rounded-2xl p-8 md:p-10 relative"
        style={{ background: "#fcf9f4", boxShadow: "0 32px 80px rgba(28,28,25,0.18)" }}
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full"
          style={{ color: "#474348" }}
          onMouseEnter={e => e.currentTarget.style.background = "#f0ede8"}
          onMouseLeave={e => e.currentTarget.style.background = ""}
        >
          <span className="material-symbols-outlined">close</span>
        </button>

        <h2
          className="text-2xl mb-8"
          style={{ fontFamily: "'Noto Serif', serif", color: "#271828ff" }}
        >
          {existing ? "Edit Address" : "Add New Address"}
        </h2>

        <div className="space-y-5">
          {/* Label */}
          <div>
            <label className="block text-[0.6875rem] uppercase tracking-widest font-bold mb-2"
              style={{ color: "#474348ff" }}>Label</label>
            <div className="flex gap-3 flex-wrap">
              {["Home", "Work", "Other"].map(l => (
                <button
                  key={l}
                  onClick={() => setForm(f => ({ ...f, label: l }))}
                  className="px-5 py-2 rounded-full text-sm font-medium transition-all"
                  style={
                    form.label === l
                      ? { background: "#18281e", color: "#fff" }
                      : { background: "#e5e2dd", color: "#434844" }
                  }
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
          {/* Address */}
          <div>
            <label className="block text-[0.6875rem] uppercase tracking-widest font-bold mb-2"
              style={{ color: "#474348ff" }}>Address</label>
            <textarea
              rows={3}
              value={form.address}
              onChange={e => { setForm(f => ({ ...f, address: e.target.value })); setError(""); }}
              placeholder="Street, City, Wilaya…"
              className="w-full px-5 py-3.5 rounded-xl text-base outline-none resize-none"
              style={{
                background: "#f0ede8",
                color: "#1c1c19",
                border: error ? "1.5px solid #ba1a1a" : "1.5px solid transparent",
                fontFamily: "'Manrope', sans-serif",
              }}
              onFocus={e => { if (!error) e.target.style.border = "1.5px solid #5a6051"; }}
              onBlur={e => { if (!error) e.target.style.border = "1.5px solid transparent"; }}
            />
            {error && <p className="text-xs mt-1.5" style={{ color: "#ba1a1a" }}>{error}</p>}
          </div>
        </div>

        <div className="flex gap-4 mt-8">
          <button
            onClick={onClose}
            className="flex-1 py-3.5 rounded-xl font-medium text-sm"
            style={{ background: "#e5e2dd", color: "#434844" }}
          >Cancel</button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex-1 py-3.5 rounded-xl font-medium text-sm flex items-center justify-center gap-2"
            style={{
              background: saving ? "#96a99b" : "#18281e",
              color: "#fff",
              cursor: saving ? "not-allowed" : "pointer",
            }}
          >
            {saving ? "Saving…" : "Save Address"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   AVATAR UPLOAD BUTTON
   ══════════════════════════════════════════════════════════════════════════════ */
function AvatarUpload({ user, onAvatarChange, uploading }) {
  const fileRef = useRef(null);
  const [preview, setPreview] = useState(user?.avatarUrl || null);

  const handleFile = useCallback(async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return;
    if (file.size > 5 * 1024 * 1024) return; // 5 MB max

    // Local preview
    const reader = new FileReader();
    reader.onload = ev => setPreview(ev.target.result);
    reader.readAsDataURL(file);

    // Notify parent
    await onAvatarChange(file);
  }, [onAvatarChange]);

  const initials = (user?.username || "U")
    .split(" ")
    .map(w => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="flex items-center gap-6 mb-10">
      {/* Avatar circle */}
      <div className="relative group cursor-pointer" onClick={() => fileRef.current?.click()}>
        <div
          className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden flex items-center justify-center select-none"
          style={{
            background: "#3d2d3eff",
            color: "#e5d4e7ff",
            fontFamily: "'Noto Serif', serif",
            fontSize: "1.75rem",
            fontStyle: "italic",
          }}
        >
          {preview
            ? <img src={preview} alt="avatar" className="w-full h-full object-cover" />
            : initials}
        </div>

        {/* Overlay */}
        <div
          className="absolute inset-0 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ background: "rgba(28,28,25,0.5)" }}
        >
          {uploading
            ? <span className="material-symbols-outlined text-white text-xl animate-spin">refresh</span>
            : <span className="material-symbols-outlined text-white text-xl">photo_camera</span>}
        </div>
      </div>

      <div>
        <p className="font-semibold text-base md:text-lg" style={{ color: "#271828ff" }}>
          {user?.username || "—"}
        </p>
        <button
          onClick={() => fileRef.current?.click()}
          className="text-xs mt-1 underline underline-offset-4 transition-opacity hover:opacity-60"
          style={{ color: "#5a6051" }}
        >
          {uploading ? "Uploading…" : "Change photo"}
        </button>
        <p className="text-[0.65rem] mt-1" style={{ color: "#96a99b" }}>JPG, PNG · max 5 MB</p>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
      />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   PLACEHOLDER PANELS
   ══════════════════════════════════════════════════════════════════════════════ */
function EmptyPanel({ icon, title, subtitle }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <span className="material-symbols-outlined text-5xl mb-5" style={{ color: "#c3c8c2" }}>{icon}</span>
      <h3
        className="text-xl mb-2"
        style={{ fontFamily: "'Noto Serif', serif", color: "#271828ff" }}
      >{title}</h3>
      <p className="text-sm" style={{ color: "#474348" }}>{subtitle}</p>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   MAIN PAGE
   ══════════════════════════════════════════════════════════════════════════════ */
export function ProfilePage() {
  const navigate = useNavigate();

  // ── state ──
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeNav, setActiveNav] = useState("profile");

  // modals
  const [editOpen, setEditOpen] = useState(false);
  const [addrModal, setAddrModal] = useState(null); // null | "new" | {index, data}
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  // addresses (local list derived from user.address + extras)
  const [addresses, setAddresses] = useState([]);

  // toasts
  const [toasts, setToasts] = useState([]);
  const addToast = useCallback((message, type = "success") => {
    const id = Date.now();
    setToasts(t => [...t, { id, message, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3000);
  }, []);

  // ── fetch profile ──
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get("/profile");
        const data = response.data;
        setUser(data);
        // Seed addresses from profile
        if (data.address) {
          setAddresses([{ label: "Home", address: data.address, primary: true }]);
        } else {
          setAddresses([]);
        }
      } catch {
        localStorage.removeItem("token");
        navigate("/login", { replace: true });
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [navigate]);

  // ── save profile info ──
  const handleSaveProfile = async (form) => {
    setSaving(true);
    try {
      const response = await api.put("/profile", form);
      setUser(prev => ({ ...prev, ...response.data }));
      setEditOpen(false);
      addToast("Profile updated successfully");
    } catch (err) {
      addToast(err?.response?.data?.message || "Failed to update profile", "error");
    } finally {
      setSaving(false);
    }
  };

  // ── avatar upload ──
  const handleAvatarChange = async (file) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("avatar", file);
      const response = await api.post("/profile/avatar", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setUser(prev => ({ ...prev, avatarUrl: response.data.avatarUrl }));
      addToast("Photo updated!");
    } catch (err) {
      addToast("Failed to upload photo", "error");
    } finally {
      setUploading(false);
    }
  };

  // ── address save (add or edit) ──
  const handleSaveAddress = async (form) => {
    setSaving(true);
    try {
      if (addrModal === "new") {
        const newAddr = { ...form, primary: addresses.length === 0 };
        const newList = [...addresses, newAddr];
        setAddresses(newList);
        // Sync primary address to profile
        if (newAddr.primary) {
          await api.put("/profile", { address: newAddr.address });
          setUser(prev => ({ ...prev, address: newAddr.address }));
        }
        addToast("Address added");
      } else {
        const newList = addresses.map((a, i) =>
          i === addrModal.index ? { ...a, ...form } : a
        );
        setAddresses(newList);
        if (addresses[addrModal.index].primary) {
          await api.put("/profile", { address: form.address });
          setUser(prev => ({ ...prev, address: form.address }));
        }
        addToast("Address updated");
      }
      setAddrModal(null);
    } catch {
      addToast("Failed to save address", "error");
    } finally {
      setSaving(false);
    }
  };

  // ── address remove ──
  const handleRemoveAddress = async (index) => {
    const updated = addresses.filter((_, i) => i !== index);
    // If removed was primary, promote next
    if (addresses[index].primary && updated.length > 0) {
      updated[0].primary = true;
      await api.put("/profile", { address: updated[0].address });
      setUser(prev => ({ ...prev, address: updated[0].address }));
    }
    setAddresses(updated);
    addToast("Address removed");
  };

  // ── set primary ──
  const handleSetPrimary = async (index) => {
    const updated = addresses.map((a, i) => ({ ...a, primary: i === index }));
    setAddresses(updated);
    await api.put("/profile", { address: updated[index].address });
    setUser(prev => ({ ...prev, address: updated[index].address }));
    addToast("Primary address updated");
  };

  /* ── loading ── */
  if (loading)
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <style>{FONTS + KEYFRAMES}</style>
        <p style={{ fontFamily: "'Noto Serif', serif", color: "#261828ff" }}
          className="text-xl italic animate-pulse">
          Loading your sanctuary…
        </p>
      </div>
    );

  /* ─────────────────────────────────────────────── render ─── */
  return (
    <>
      <style>{FONTS + KEYFRAMES}</style>

      {/* Modals */}
      {editOpen && (
        <EditProfileModal
          user={user}
          onClose={() => setEditOpen(false)}
          onSave={handleSaveProfile}
          saving={saving}
        />
      )}
      {addrModal !== null && (
        <AddressModal
          existing={typeof addrModal === "object" ? addrModal.data : null}
          onClose={() => setAddrModal(null)}
          onSave={handleSaveAddress}
          saving={saving}
        />
      )}

      <Toast toasts={toasts} />

      <main
        className="pt-10 pb-16 md:pb-24 max-w-screen-2xl mx-auto px-6 md:px-8"
        style={{
          background: "#fcf9f4", minHeight: "100vh", color: "#1c1c19",
          fontFamily: "'Manrope', sans-serif",
        }}
      >
        {/* ── Page Header ── */}
        <header className="mb-8 md:mb-14">
          <h1
            className="text-4xl md:text-5xl lg:text-6xl mb-3 md:mb-4"
            style={{ fontFamily: "'Noto Serif', serif", color: "#271828ff" }}
          >
            My Profile
          </h1>
          <p style={{ color: "#474348ff" }} className="font-light text-base md:text-lg">
            Welcome back{user?.username ? `, ${user.username}` : ""}. Your sanctuary details and curated history.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-16">

          {/* ── Sidebar Nav ── */}
          <aside className="lg:col-span-3">
            <nav
              className="flex lg:flex-col overflow-x-auto lg:overflow-visible -mx-6 px-6 lg:mx-0 lg:px-0 space-x-2 lg:space-x-0 lg:space-y-1 mb-8 lg:mb-0"
              style={{ msOverflowStyle: "none", scrollbarWidth: "none" }}
            >
              {NAV_ITEMS.map(({ key, icon, label }) => {
                const active = activeNav === key;
                return (
                  <button
                    key={key}
                    onClick={() => setActiveNav(key)}
                    className="flex items-center space-x-3 md:space-x-4 px-5 py-3 md:px-6 md:py-4 rounded-md transition-all shrink-0 lg:w-full"
                    style={
                      active
                        ? { background: "#261828ff", color: "#ffffff" }
                        : { color: "#434844" }
                    }
                    onMouseEnter={e => { if (!active) e.currentTarget.style.background = "#f0ede8"; }}
                    onMouseLeave={e => { if (!active) e.currentTarget.style.background = ""; }}
                  >
                    <span className="material-symbols-outlined">{icon}</span>
                    <span className="font-medium text-sm md:text-base">{label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Sign out — desktop */}
            <div className="hidden lg:block pt-8 mt-8" style={{ borderTop: "1px solid #c3c8c220" }}>
              <button
                className="flex items-center space-x-4 px-6 py-4 opacity-80 hover:opacity-100 transition-opacity"
                style={{ color: "#ba1a1a" }}
                onClick={() => { localStorage.removeItem("token"); navigate("/login"); }}
              >
                <span className="material-symbols-outlined">logout</span>
                <span className="font-medium">Sign Out</span>
              </button>
            </div>
          </aside>

          {/* ── Main Content (tab-switched) ── */}
          <section className="lg:col-span-9">
            {activeNav === "profile" && <ProfilePanel user={user} addresses={addresses} onEdit={() => setEditOpen(true)} onAvatarChange={handleAvatarChange} uploading={uploading} onAddAddress={() => setAddrModal("new")} onEditAddress={(i) => setAddrModal({ index: i, data: addresses[i] })} onRemoveAddress={handleRemoveAddress} onSetPrimary={handleSetPrimary} />}
            {activeNav === "orders" && <OrdersPanel />}
            {activeNav === "favorites" && <EmptyPanel icon="favorite" title="No favourites yet" subtitle="Items you heart will appear here." />}
            {activeNav === "addresses" && <AddressesPanel addresses={addresses} onAdd={() => setAddrModal("new")} onEdit={(i) => setAddrModal({ index: i, data: addresses[i] })} onRemove={handleRemoveAddress} onSetPrimary={handleSetPrimary} />}
            {activeNav === "settings" && <EmptyPanel icon="settings" title="Settings" subtitle="Account preferences coming soon." />}

            {/* Sign Out — mobile */}
            <div
              className="lg:hidden pt-8 mt-8"
              style={{ borderTop: "1px solid #c7c2c820" }}
            >
              <button
                className="flex items-center space-x-4 px-6 py-4 mx-auto opacity-80 hover:opacity-100 transition-opacity"
                style={{ color: "#ba1a1a" }}
                onClick={() => { localStorage.removeItem("token"); navigate("/login"); }}
              >
                <span className="material-symbols-outlined">logout</span>
                <span className="font-medium">Sign Out</span>
              </button>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   PROFILE PANEL
   ══════════════════════════════════════════════════════════════════════════════ */
function ProfilePanel({ user, addresses, onEdit, onAvatarChange, uploading, onAddAddress, onEditAddress, onRemoveAddress, onSetPrimary }) {
  return (
    <div className="space-y-12 md:space-y-16">

      {/* ── Avatar + Info ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">

        {/* Personal Info Card */}
        <div
          className="rounded-xl p-8 md:p-10 relative overflow-hidden"
          style={{
            background: "#ffffff",
            border: "1px solid #c7c2c81a",
            boxShadow: "0 20px 50px rgba(28,28,25,0.03)",
          }}
        >
          <div
            className="absolute top-0 right-0 w-32 h-32 rounded-bl-full"
            style={{ background: "#2818240d", transform: "translate(2rem,-2rem)" }}
          />

          <h2
            className="text-2xl mb-6"
            style={{ fontFamily: "'Noto Serif', serif", color: "#271828ff" }}
          >
            Personal Information
          </h2>

          {/* Inline avatar inside card */}
          <AvatarUpload user={user} onAvatarChange={onAvatarChange} uploading={uploading} />

          <div className="space-y-6">
            {[
              { label: "Username", value: user?.username },
              { label: "Email Address", value: user?.email },
              { label: "Phone", value: user?.phoneNum || "Not set" },
              { label: "Role", value: roleLabel(user?.role) },
            ].map(({ label, value }) => (
              <div key={label} className="space-y-1">
                <span
                  className="text-[0.6875rem] uppercase tracking-widest font-bold"
                  style={{ color: "#474348ff" }}
                >
                  {label}
                </span>
                <p className="text-lg" style={{ color: "#271828ff" }}>{value}</p>
              </div>
            ))}
          </div>

          <button
            onClick={onEdit}
            className="mt-10 flex items-center gap-2 text-sm hover:opacity-70 transition-all"
            style={{
              color: "#251828ff",
              textDecoration: "underline",
              textUnderlineOffset: "8px",
            }}
          >
            <span className="material-symbols-outlined text-base">edit</span>
            Edit Details
          </button>
        </div>

        {/* Membership Card */}
        <div
          className="rounded-xl p-8 md:p-10 flex flex-col justify-between relative"
          style={{
            background: "#3d2d3eff",
            color: "#a996a9ff",
            boxShadow: "0 20px 40px rgba(28,28,25,0.12)",
          }}
        >
          <div>
            <span
              className="text-[0.6875rem] uppercase tracking-[0.2em] font-bold block mb-2"
              style={{ color: "#a796a999" }}
            >
              Tier Level
            </span>
            <h2
              className="text-3xl italic mb-4"
              style={{ fontFamily: "'Noto Serif', serif", color: "#e5d4e7ff" }}
            >
              {roleLabel(user?.role)} Circle
            </h2>
            <p className="text-sm leading-relaxed max-w-[200px]" style={{ color: "#a796a9ff" }}>
              Enjoying complimentary white-glove delivery and early collection access.
            </p>
          </div>
          <div className="flex items-end justify-between mt-8">
            <div className="space-y-1">
              <span
                className="text-[0.6875rem] uppercase tracking-widest"
                style={{ color: "#a996a499" }}
              >
                Member Since
              </span>
              <p className="text-2xl font-light" style={{ color: "#e7d4e5ff" }}>
                {user?.createdAt
                  ? new Date(user.createdAt).getFullYear()
                  : new Date().getFullYear()}
              </p>
            </div>
            <span
              className="material-symbols-outlined text-5xl"
              style={{ color: "#e7d4e6ff", opacity: 0.2 }}
            >
              stars
            </span>
          </div>
        </div>
      </div>

      {/* ── Recent Orders ── */}
      <OrdersPanel preview />

      {/* ── Quick Addresses ── */}
      <AddressesPanel
        addresses={addresses}
        onAdd={onAddAddress}
        onEdit={onEditAddress}
        onRemove={onRemoveAddress}
        onSetPrimary={onSetPrimary}
        preview
      />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   ORDERS PANEL
   ══════════════════════════════════════════════════════════════════════════════ */
function OrdersPanel({ preview = false }) {
  const ORDERS = [
    { name: "Order from your history", date: "Recently ordered", status: "In Transit", statusDot: "#b010b9ff", statusText: "#065f46", price: "—" },
    { name: "Another recent order", date: "Earlier", status: "Delivered", statusDot: "#26182866", statusText: "#434844", price: "—" },
  ];

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="flex items-center justify-between">
        <h2
          className="text-2xl"
          style={{ fontFamily: "'Noto Serif', serif", color: "#261828ff" }}
        >
          {preview ? "Recent Orders" : "All Orders"}
        </h2>
        {preview && (
          <Link
            to="/order"
            className="text-sm hover:underline"
            style={{ color: "#18281e", textUnderlineOffset: "8px" }}
          >
            View All
          </Link>
        )}
      </div>

      <div className="space-y-4">
        {ORDERS.map((o, i) => (
          <div
            key={i}
            className="rounded-xl p-5 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all duration-300"
            style={{ background: "#f6f3ee" }}
            onMouseEnter={e => e.currentTarget.style.background = "#ffffff"}
            onMouseLeave={e => e.currentTarget.style.background = "#f6f3ee"}
          >
            <div className="flex items-center space-x-5 md:space-x-6">
              <div
                className="w-16 h-20 md:w-20 md:h-24 rounded-md flex items-center justify-center flex-shrink-0"
                style={{ background: "#e5e2dd" }}
              >
                <span className="material-symbols-outlined text-2xl" style={{ color: "#777378ff" }}>chair</span>
              </div>
              <div>
                <h3 className="font-medium text-base md:text-lg" style={{ color: "#281828ff" }}>{o.name}</h3>
                <p className="text-xs md:text-sm" style={{ color: "#474348ff" }}>{o.date}</p>
                <div className="mt-2 flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full" style={{ background: o.statusDot }} />
                  <span className="text-[0.6875rem] uppercase tracking-tighter font-bold" style={{ color: o.statusText }}>
                    {o.status}
                  </span>
                </div>
              </div>
            </div>
            <div
              className="flex items-center justify-between md:justify-end space-x-8 md:space-x-12 border-t md:border-t-0 pt-4 md:pt-0"
              style={{ borderColor: "#c7c2c81a" }}
            >
              <div>
                <p className="text-[0.6875rem] uppercase tracking-widest mb-1" style={{ color: "#484347ff" }}>Price</p>
                <p className="font-medium" style={{ color: "#18281e" }}>{o.price}</p>
              </div>
              <Link
                to="/order"
                className="p-3 rounded-full transition-colors"
                style={{ border: "1px solid #c3c8c24d" }}
                onMouseEnter={e => { e.currentTarget.style.background = "#18281e"; e.currentTarget.style.color = "#fff"; }}
                onMouseLeave={e => { e.currentTarget.style.background = ""; e.currentTarget.style.color = ""; }}
              >
                <span className="material-symbols-outlined text-lg">arrow_forward</span>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   ADDRESSES PANEL
   ══════════════════════════════════════════════════════════════════════════════ */
function AddressesPanel({ addresses, onAdd, onEdit, onRemove, onSetPrimary, preview = false }) {
  return (
    <div className="space-y-6 md:space-y-8 pt-4">
      <h2
        className="text-2xl"
        style={{ fontFamily: "'Noto Serif', serif", color: "#261828ff" }}
      >
        {preview ? "My Addresses" : "All Addresses"}
      </h2>

      <div
        className="flex space-x-4 md:space-x-6 overflow-x-auto pb-6 -mx-6 px-6 md:mx-0 md:px-0"
        style={{ msOverflowStyle: "none", scrollbarWidth: "none" }}
      >
        {addresses.map((addr, i) => (
          <div
            key={i}
            className="min-w-[260px] md:min-w-[280px] rounded-xl p-6 md:p-8 relative flex flex-col justify-between h-52 flex-shrink-0"
            style={{
              background: "#ffffff",
              border: addr.primary ? "1.5px solid #28182744" : "1px solid #28182718",
            }}
          >
            <div className="absolute top-6 right-6 flex gap-2">
              {addr.primary
                ? (
                  <span
                    className="text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-widest"
                    style={{ background: "#2418280d", color: "#251828ff" }}
                  >
                    Primary
                  </span>
                )
                : (
                  <button
                    className="text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-widest transition-all"
                    style={{ background: "#f0ede8", color: "#5a6051" }}
                    onClick={() => onSetPrimary(i)}
                  >
                    Set Primary
                  </button>
                )}
            </div>

            <div className="pr-20">
              <p className="font-bold mb-1" style={{ color: "#281826ff" }}>{addr.label}</p>
              <p className="text-sm leading-relaxed" style={{ color: "#474348ff" }}>{addr.address}</p>
            </div>

            <div className="flex space-x-4 mt-4">
              <button
                className="text-xs font-semibold transition-opacity hover:opacity-60"
                style={{ color: "#271828ff" }}
                onClick={() => onEdit(i)}
              >
                Edit
              </button>
              <button
                className="text-xs font-semibold transition-opacity hover:opacity-60"
                style={{ color: "#ba1a1a" }}
                onClick={() => onRemove(i)}
              >
                Remove
              </button>
            </div>
          </div>
        ))}

        {/* Add new */}
        <button
          onClick={onAdd}
          className="min-w-[260px] md:min-w-[280px] rounded-xl p-6 md:p-8 flex flex-col items-center justify-center h-52 transition-all flex-shrink-0"
          style={{ border: "2px dashed #c3c8c2", color: "#484348ff" }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = "#25182866"; e.currentTarget.style.background = "#f0ede880"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "#c3c8c2"; e.currentTarget.style.background = ""; }}
        >
          <span className="material-symbols-outlined text-3xl mb-3">add_location_alt</span>
          <span className="text-sm font-medium">Add New Address</span>
        </button>
      </div>
    </div>
  );
}

/* ── Google Fonts + keyframes ── */
const FONTS = `
  @import url('https://fonts.googleapis.com/css2?family=Noto+Serif:ital,wght@0,400;0,700;1,400&family=Manrope:wght@300;400;500;600&display=swap');
  @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');
  .material-symbols-outlined {
    font-family: 'Material Symbols Outlined';
    font-variation-settings: 'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 24;
    font-size: inherit;
    line-height: 1;
    display: inline-block;
    vertical-align: middle;
  }
  *::-webkit-scrollbar { display: none; }
`;

const KEYFRAMES = `
  @keyframes slideUp {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0); }
  }
`;