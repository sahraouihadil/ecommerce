import Header from "./ui/Header";
import Sidebar from "./ui/Sidebar";
import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Users, MessageSquare, CheckSquare,
  BarChart, Activity, Settings,
  Boxes, Truck, RotateCcw, Bot,
  Megaphone, BadgePercent, Mail, FileText,
  Loader2,TriangleAlert
} from "lucide-react";
import api from "../services/api";

// ── role config (unchanged) ───────────────────────────────────────────────────

const ROLE_CONFIG = {
  "/admin-dash": {
    profilePath: "/admin-dash/profile",
    title: "AdminCore",
    subtitle: "Enterprise Suite",
    role: "Super Admin",
    badgeColor: "bg-purple-100 text-purple-700",
    links: [
      { to: "/admin-dash",               label: "Dashboard",     icon: <LayoutDashboard size={18} />, end: true },
      { to: "/admin-dash/accounts",      label: "Accounts",      icon: <Users size={18} /> },
      { to: "/admin-dash/complaints",    label: "Complaints",    icon: <MessageSquare size={18} /> },
      { to: "/admin-dash/reports",       label: "Reports",       icon: <BarChart size={18} /> },
      { to: "/admin-dash/engagement",    label: "Engagement",    icon: <Activity size={18} /> },
      { to: "/admin-dash/configuration", label: "Configuration", icon: <Settings size={18} /> },
      { to: "/admin-dash/validation",    label: "Validation",    icon: <CheckSquare size={18} /> },
    ],
  },
  "/marketing-manager-dash": {
    profilePath: "/marketing-manager-dash/profile",
    title: "MarketingCore",
    subtitle: "Enterprise Suite",
    role: "Marketing Manager",
    badgeColor: "bg-blue-100 text-blue-700",
    links: [
      { to: "/marketing-manager-dash",             label: "Dashboard",   icon: <LayoutDashboard size={18} />, end: true },
      { to: "/marketing-manager-dash/campaigns",   label: "Campaigns",   icon: <Megaphone size={18} /> },
      { to: "/marketing-manager-dash/promotions",  label: "Promotions",  icon: <BadgePercent size={18} /> },
      { to: "/marketing-manager-dash/newsletters", label: "Newsletters", icon: <Mail size={18} /> },
      { to: "/marketing-manager-dash/blogs",       label: "Blogs",       icon: <FileText size={18} /> },
    ],
  },
  "/stock-manager-dash": {
    profilePath: "/stock-manager-dash/profile",
    title: "StockManagerCore",
    subtitle: "Enterprise Suite",
    role: "Stock Manager",
    badgeColor: "bg-green-100 text-green-700",
    links: [
  { to: '/stock-manager-dash',              label: 'Dashboard',         icon: <LayoutDashboard />, end: true },
  { to: '/stock-manager-dash/inventories',  label: "Product's Catalog", icon: <Boxes />            },
  { to: '/stock-manager-dash/ar',           label: 'AR/3D Management',  icon: <Bot size={18} />    },
  { to: '/stock-manager-dash/deliveries',   label: 'Delivery',          icon: <Truck />            },
  { to: '/stock-manager-dash/problems',     label: 'Problems',          icon: <TriangleAlert />     },
  { to: '/stock-manager-dash/returns',      label: 'Returns',           icon: <RotateCcw />        },
    ],
  },
  "/deliveryman-dash": {
    profilePath: "/deliveryman-dash/profile",
    title: "DeliverPro",
    subtitle: "Driver Dashboard",
    role: "Deliveryman",
    badgeColor: "bg-orange-100 text-orange-700",
    links: [
      { to: "/deliveryman-dash", label: "Dashboard", icon: <LayoutDashboard size={18} />, end: true },
    ],
  },
};

function getRoleConfig(pathname) {
  const match = Object.keys(ROLE_CONFIG).find((key) => pathname.startsWith(key));
  return ROLE_CONFIG[match] ?? ROLE_CONFIG["/admin-dash"];
}

// ── edit modal ────────────────────────────────────────────────────────────────

function EditModal({ profile, onClose, onSaved }) {
  const [form,    setForm]    = useState({ username: profile.username, email: profile.email, phone: profile.contact.phone });
  const [file,    setFile]    = useState(null);
  const [preview, setPreview] = useState(profile.avatar_url || "https://i.pravatar.cc/100");
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");
  const fileRef = useRef();

  function handleFile(e) {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }

  async function handleSave() {
    setLoading(true);
    setError("");
    try {
      const fd = new FormData();
      if (form.username) fd.append("username", form.username);
      if (form.email)    fd.append("email",    form.email);
      if (form.phone)    fd.append("phone",    form.phone);
      if (file)          fd.append("avatar",   file);

      const { data } = await api.put("/api/staff/profile", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      onSaved(data.user);
      onClose();
    } catch (err) {
      setError(err?.response?.data?.detail || "Update failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-5">
        <h3 className="font-bold text-lg">Edit Profile</h3>

        {/* avatar picker */}
        <div className="flex items-center gap-4">
          <img src={preview} alt="avatar" className="w-16 h-16 rounded-xl object-cover border" />
          <button
            onClick={() => fileRef.current.click()}
            className="text-sm px-3 py-1.5 rounded-lg border border-gray-300 hover:bg-gray-50"
          >
            Change Photo
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
        </div>

        {[
          { label: "Username", key: "username", type: "text" },
          { label: "Email",    key: "email",    type: "email" },
          { label: "Phone",    key: "phone",    type: "tel" },
        ].map(({ label, key, type }) => (
          <div key={key}>
            <label className="text-xs text-gray-500 mb-1 block">{label}</label>
            <input
              type={type}
              value={form[key]}
              onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
          </div>
        ))}

        {error && <p className="text-xs text-red-500">{error}</p>}

        <div className="flex gap-3 pt-1">
          <button
            onClick={onClose}
            className="flex-1 border border-gray-200 rounded-xl py-2 text-sm hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex-1 bg-black text-white rounded-xl py-2 text-sm flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading && <Loader2 size={14} className="animate-spin" />}
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

// ── main component ────────────────────────────────────────────────────────────

export default function AProfilePage() {
  const [openBar,    setOpenBar]    = useState(window.innerWidth >= 600);
  const [profile,    setProfile]    = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [editOpen,   setEditOpen]   = useState(false);
  const [actionMsg,  setActionMsg]  = useState("");

  const location = useLocation();
  const navigate = useNavigate();
  const config   = getRoleConfig(location.pathname);

  // ── fetch profile ───────────────────────────────────────────────
  useEffect(() => {
    api.get("/api/staff/profile")
      .then(r => setProfile(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // ── patch local state after edit ────────────────────────────────
  function handleSaved(updatedUser) {
    setProfile(prev => ({
      ...prev,
      username:   updatedUser.username,
      email:      updatedUser.email,
      avatar_url: updatedUser.avatar_url,
      contact: { ...prev.contact, email: updatedUser.email, phone: updatedUser.phone },
    }));
  }

  // ── sign out all devices ────────────────────────────────────────
  async function handleSignOutAll() {
    try {
      await api.post("/api/staff/profile/signout");
      localStorage.clear();
      navigate("/login");
    } catch {
      setActionMsg("Sign-out failed. Try again.");
    }
  }

  // ── deactivate account ──────────────────────────────────────────
  async function handleDeactivate() {
    if (!window.confirm("Deactivate your account? This cannot be undone easily.")) return;
    try {
      await api.delete("/api/staff/profile");
      localStorage.clear();
      navigate("/login");
    } catch (err) {
      setActionMsg(err?.response?.data?.detail || "Deactivation failed.");
    }
  }

  // ── spinner while loading ───────────────────────────────────────
  if (loading) return (
    <div className="flex items-center justify-center h-screen">
      <Loader2 size={32} className="animate-spin text-indigo-600" />
    </div>
  );

  const avatar = profile?.avatar_url
    ? `${import.meta.env.VITE_API_URL}/${profile.avatar_url}`
    : "https://i.pravatar.cc/100";

  const headerStats = [
    { label: "Role",         value: profile?.role        || config.role },
    { label: "Member Since", value: profile?.member_since || "—"        },
    { label: "Last Login",   value: profile?.last_login   || "Just now" },
    { label: "Sessions",     value: "1"                                  },
  ];

  const contactRows = [
    { label: "Email",    value: profile?.contact?.email    || "—" },
    { label: "Phone",    value: profile?.contact?.phone    || "—" },
    { label: "Location", value: profile?.contact?.location || "—" },
    { label: "Timezone", value: profile?.contact?.timezone || "—" },
  ];

  return (
    <div className="flex min-h-screen bg-gray-100">

      {editOpen && (
        <EditModal
          profile={profile}
          onClose={() => setEditOpen(false)}
          onSaved={handleSaved}
        />
      )}

      <Sidebar
        openBar={openBar}
        setOpenBar={setOpenBar}
        links={config.links}
        title={config.title}
        subtitle={config.subtitle}
        role={config.role}
        profilePath={config.profilePath}
      />

      <main className="flex-1">
        <Header concept="My Profile" setOpenBar={setOpenBar} openBar={openBar} />

        {/* TOP PROFILE CARD */}
        <div className="bg-white rounded-2xl shadow overflow-hidden m-6">
          <div className="h-32 bg-gradient-to-r from-black via-indigo-600 to-purple-500" />
          <div className="p-6 relative">
            <img
              src={avatar}
              alt="avatar"
              className="w-20 h-20 md:w-24 md:h-24 rounded-xl border-4 border-white absolute -top-10 md:-top-12 left-1/2 md:left-6 -translate-x-1/2 md:translate-x-0 object-cover"
            />
            <div className="mt-16 md:mt-0 md:ml-32">
              <div className="flex justify-between items-center flex-wrap gap-4">
                <div>
                  <h2 className="text-xl font-bold">
                    {profile?.username || config.role}
                    <span className={`ml-2 text-xs px-2 py-1 rounded-full m-4 ${config.badgeColor}`}>
                      {config.role}
                    </span>
                  </h2>
                  <p className="text-gray-500 text-sm">{profile?.email}</p>
                </div>
                <button
                  onClick={() => setEditOpen(true)}
                  className="bg-black text-white px-4 py-2 rounded-xl text-sm"
                >
                  ✏️ Edit Profile
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                {headerStats.map(({ label, value }) => (
                  <div key={label} className="bg-gray-100 rounded-xl p-3">
                    <p className="text-xs text-gray-500">{label}</p>
                    <p className="font-semibold">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* LOWER GRID */}
        <div className="columns-1 md:columns-2 gap-6 space-y-6 m-6">

          {/* Contact Info */}
          <div className="bg-white rounded-2xl shadow p-6 break-inside-avoid">
            <h3 className="font-semibold mb-4">Contact Information</h3>
            <div className="space-y-4 text-sm">
              {contactRows.map(({ label, value }) => (
                <div key={label}>
                  <p className="text-gray-500">{label}</p>
                  <p className="font-medium">{value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Security */}
          <div className="bg-white rounded-2xl shadow p-6 break-inside-avoid">
            <h3 className="font-semibold mb-4">Security</h3>
            {[
              { title: "Change Password", sub: "Last changed 30 days ago"  },
              { title: "Two-Factor Auth", sub: "Enabled via Authenticator" },
              { title: "Active Sessions", sub: "1 device currently active" },
            ].map(({ title, sub }) => (
              <div key={title} className="bg-gray-100 p-4 rounded-xl flex justify-between items-center m-2">
                <div>
                  <p className="font-medium">{title}</p>
                  <p className="text-xs text-gray-500">{sub}</p>
                </div>
                <span>›</span>
              </div>
            ))}
          </div>

        </div>

        {/* Danger Zone */}
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 m-6">
          <div>
            <h3 className="font-semibold text-red-600">⚠ Danger Zone</h3>
            <p className="text-sm text-red-500">
              {actionMsg || "These actions are irreversible. Proceed with caution."}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <button
              onClick={handleSignOutAll}
              className="px-4 py-2 rounded-xl border border-red-300 text-red-600 hover:bg-red-100"
            >
              Sign Out of All Devices
            </button>
            <button
              onClick={handleDeactivate}
              className="px-4 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700"
            >
              Deactivate Account
            </button>
          </div>
        </div>

      </main>
    </div>
  );
}