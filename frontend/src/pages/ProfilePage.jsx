/**
 * ProfilePage.jsx - User Profile Page
 * ======================================
 * Displays the current user's profile information:
 *   - Username, email, phone number, role
 *
 * Fetches from GET /profile (requires valid JWT token).
 * If the token is invalid/expired, the user is redirected to /login.
 */

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

/* ─── Inline SVG icons ─────────────────────────────────────────────── */

function MenuIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={2} strokeLinecap="round" className={className}>
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}
function SearchIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}
function StarIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}
function PinIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}
function ChevronRightIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}
function CheckCircleIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}
function UserEditIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}
function BellIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}
function ShieldIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}
function LogOutIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}
function HomeIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}
function CompassIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="10" />
      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
    </svg>
  );
}
function BotIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="3" y="11" width="18" height="10" rx="2" />
      <circle cx="12" cy="5" r="2" />
      <line x1="12" y1="7" x2="12" y2="11" />
      <line x1="8" y1="16" x2="8" y2="16" strokeWidth={3} />
      <line x1="16" y1="16" x2="16" y2="16" strokeWidth={3} />
    </svg>
  );
}
function PersonIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}
function PaletteIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
      <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
      <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
      <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" />
    </svg>
  );
}

/* ─── Helpers ──────────────────────────────────────────────────────── */

/** Generate initials avatar from a username string */
function getInitials(name = "") {
  return name
    .split(/[\s_@]+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

/* ─── Component ────────────────────────────────────────────────────── */

export function ProfilePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get("/profile");
        setUser(response.data);
      } catch {
        localStorage.removeItem("token");
        navigate("/login", { replace: true });
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login", { replace: true });
  };

  /* ── Loading ─────────────────────────────────────────────────────── */
  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f6f8] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-violet-200 border-t-violet-600 animate-spin" />
          <p className="text-sm font-medium text-gray-400 tracking-wide">
            Summoning your profile…
          </p>
        </div>
      </div>
    );
  }

  const initials = getInitials(user?.username);

  /* ── Main render ─────────────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-[#f7f6f8] text-[#2d2f30] pb-32">

      {/* ── Top App Bar ─────────────────────────────────────────────── */}
      <header
        className="flex justify-between items-center px-6 py-4 w-full
                   sticky top-0 z-50 bg-[#f7f6f8]
                   shadow-[0_20px_40px_rgba(45,47,48,0.06)]
                   rounded-b-[2rem]"
      >
        <div className="flex items-center gap-4">
          <button
            className="p-2 text-violet-600 hover:bg-gray-200 rounded-full
                       active:scale-90 transition-all duration-200"
            aria-label="Menu"
          >
            <MenuIcon className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-black text-violet-600 tracking-tighter italic select-none">
            ARoomX
          </h1>
        </div>
        <button
          className="p-2 text-violet-600 hover:bg-gray-200 rounded-full
                     active:scale-90 transition-all duration-200"
          aria-label="Search"
        >
          <SearchIcon className="w-6 h-6" />
        </button>
      </header>

      {/* ── Main content ─────────────────────────────────────────────── */}
      <main className="max-w-screen-xl mx-auto px-6 mt-8">

        {/* ── Profile Header Bento ──────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Main Profile Card */}
          <div
            className="md:col-span-2 bg-white p-8 rounded-2xl
                       flex flex-col md:flex-row items-center gap-8
                       shadow-[0_20px_40px_rgba(45,47,48,0.06)]
                       relative overflow-hidden"
          >
            {/* Glow blob */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-violet-200/20 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />

            {/* Avatar */}
            <div className="relative group shrink-0">
              <div
                className="w-32 h-32 md:w-40 md:h-40 rounded-2xl overflow-hidden
                           shadow-xl ring-4 ring-violet-200/40
                           rotate-3 group-hover:rotate-0 transition-transform duration-500
                           bg-violet-100 flex items-center justify-center"
              >
                <span className="text-4xl font-black text-violet-600 select-none">
                  {initials || "?"}
                </span>
              </div>
              {/* Badge */}
              <div className="absolute -bottom-2 -right-2 bg-yellow-300 p-2 rounded-full shadow-lg">
                <svg
                  viewBox="0 0 24 24" fill="currentColor"
                  className="w-5 h-5 text-yellow-800"
                >
                  <path d="M7.5 5.6L10 7 8.6 4.5 10 2 7.5 3.4 5 2l1.4 2.5L5 7zm12 9.8L17 14l1.4 2.5L17 19l2.5-1.4L22 19l-1.4-2.5L22 14zM4.1 4.1L2 6.2l6.8 6.8-1.4 2.5L10 14l2.5-1.4L19.8 20 22 17.8 15.2 11l1.4-2.5L14 10l-2.5 1.4z" />
                </svg>
              </div>
            </div>

            {/* User info */}
            <div className="flex-1 text-center md:text-left">
              <span className="text-[10px] uppercase tracking-widest text-amber-600 font-bold mb-2 block">
                {user?.role ?? "Member"}
              </span>
              <h2 className="text-4xl font-bold text-[#2d2f30] mb-2 tracking-tight">
                {user?.username ?? "Anonymous"}
              </h2>
              <p className="text-gray-500 max-w-sm text-sm leading-relaxed">
                {user?.email}
              </p>

              {/* Tags */}
              <div className="mt-6 flex flex-wrap justify-center md:justify-start gap-3">
                <div className="bg-gray-100 px-4 py-2 rounded-full flex items-center gap-2">
                  <StarIcon className="w-4 h-4 text-violet-600" />
                  <span className="text-xs font-semibold">Gold Spells Member</span>
                </div>
                {user?.phoneNum && (
                  <div className="bg-gray-100 px-4 py-2 rounded-full flex items-center gap-2">
                    <PinIcon className="w-4 h-4 text-violet-600" />
                    <span className="text-xs font-semibold">{user.phoneNum}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Magic Balance card */}
          <div
            className="bg-violet-600 p-8 rounded-2xl text-white
                       flex flex-col justify-between
                       shadow-[0_20px_40px_rgba(45,47,48,0.1)]
                       relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-violet-600 to-violet-800 opacity-50 rounded-2xl pointer-events-none" />
            <div className="relative z-10">
              <h3 className="text-xl font-bold mb-4">Magic Balance</h3>
              <div className="text-4xl font-black mb-1">
                1,240{" "}
                <span className="text-lg font-normal opacity-70">✨</span>
              </div>
              <p className="text-sm opacity-80">Next reward: levitating lamp</p>
            </div>
            <button
              className="relative z-10 w-full mt-6 py-3 bg-yellow-300 text-yellow-900
                         font-bold rounded-full
                         hover:scale-105 active:scale-95
                         transition-all shadow-lg"
            >
              Recharge Mana
            </button>
          </div>
        </div>

        {/* ── Orders & Saved ────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">

          {/* My Magic Orders */}
          <section>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold">My Magic Orders</h3>
              <button
                onClick={() => navigate("/orders")}
                className="text-violet-600 font-bold text-sm hover:underline"
              >
                See all past spells
              </button>
            </div>
            <div className="space-y-4">
              {/* Order 1 */}
              <div
                className="bg-gray-100 p-6 rounded-2xl flex items-center gap-4
                           hover:bg-gray-200 transition-colors cursor-pointer"
              >
                <div className="w-16 h-16 bg-white rounded-xl overflow-hidden shrink-0 flex items-center justify-center">
                  <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center">
                    <StarIcon className="w-4 h-4 text-violet-400" />
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-base">Velvet Cloud Stool</h4>
                  <p className="text-sm text-gray-500">Arrival: 2 Dream Cycles</p>
                </div>
                <span className="bg-violet-100 text-violet-600 px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap">
                  In Transit
                </span>
              </div>
              {/* Order 2 */}
              <div
                className="bg-gray-100 p-6 rounded-2xl flex items-center gap-4
                           hover:bg-gray-200 transition-colors cursor-pointer"
              >
                <div className="w-16 h-16 bg-white rounded-xl overflow-hidden shrink-0 flex items-center justify-center">
                  <div className="w-8 h-8 rounded-lg bg-teal-100 flex items-center justify-center">
                    <StarIcon className="w-4 h-4 text-teal-400" />
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-base">Obsidian Glow Lamp</h4>
                  <p className="text-sm text-gray-500">Manifested 3 days ago</p>
                </div>
                <CheckCircleIcon className="w-6 h-6 text-gray-400 shrink-0" />
              </div>
            </div>
          </section>

          {/* Saved Oddities */}
          <section>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold">Saved Oddities</h3>
              <button className="text-violet-600 font-bold text-sm hover:underline">
                Manage Vault
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { name: "Asymmetric Table", price: "$245", bg: "bg-amber-50" },
                { name: "Neon Dream Bed", price: "$1,890", bg: "bg-violet-50" },
              ].map((item) => (
                <div
                  key={item.name}
                  className="aspect-square bg-white rounded-2xl p-4
                             flex flex-col justify-between shadow-sm
                             hover:scale-[1.02] transition-transform cursor-pointer"
                >
                  <div className={`h-2/3 rounded-xl ${item.bg} overflow-hidden`} />
                  <div className="mt-2">
                    <h5 className="text-xs font-bold truncate">{item.name}</h5>
                    <span className="text-xs text-violet-600 font-bold">{item.price}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* ── Roomie Chat History ───────────────────────────────────── */}
        <section className="mt-12">
          <h3 className="text-2xl font-bold mb-6">Roomie Chat History</h3>
          <div className="bg-gray-100 rounded-2xl overflow-hidden">
            {[
              {
                title: "Consultation on 'Gravity' Sofa",
                sub: "Yesterday, 4:20 PM",
                iconBg: "bg-violet-200",
                icon: <BotIcon className="w-5 h-5 text-violet-700" />,
              },
              {
                title: "Color Matching: Mauve vs Lavender",
                sub: "Last Week",
                iconBg: "bg-teal-100",
                icon: <PaletteIcon className="w-5 h-5 text-teal-700" />,
              },
            ].map((item, i) => (
              <div
                key={i}
                className="p-6 border-b border-gray-200/60 last:border-b-0
                           flex items-center justify-between
                           hover:bg-gray-200 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 ${item.iconBg} rounded-full flex items-center justify-center shrink-0`}>
                    {item.icon}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">{item.title}</h4>
                    <p className="text-xs text-gray-500 mt-0.5">{item.sub}</p>
                  </div>
                </div>
                <ChevronRightIcon className="w-5 h-5 text-gray-400 shrink-0" />
              </div>
            ))}
          </div>
        </section>

        {/* ── Account Spells ────────────────────────────────────────── */}
        <section className="mt-12">
          <h3 className="text-2xl font-bold mb-6">Account Spells</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {/* Edit Persona */}
            <button
              className="flex flex-col items-center justify-center p-8 bg-white rounded-2xl
                         shadow-sm hover:shadow-md hover:bg-violet-600 hover:text-white
                         transition-all group"
            >
              <UserEditIcon className="w-8 h-8 mb-3 group-hover:scale-110 transition-transform" />
              <span className="font-bold text-sm">Edit Persona</span>
            </button>

            {/* Magic Alerts */}
            <button
              className="flex flex-col items-center justify-center p-8 bg-white rounded-2xl
                         shadow-sm hover:shadow-md hover:bg-violet-600 hover:text-white
                         transition-all group"
            >
              <BellIcon className="w-8 h-8 mb-3 group-hover:scale-110 transition-transform" />
              <span className="font-bold text-sm">Magic Alerts</span>
            </button>

            {/* Privacy Wards */}
            <button
              className="flex flex-col items-center justify-center p-8 bg-white rounded-2xl
                         shadow-sm hover:shadow-md hover:bg-violet-600 hover:text-white
                         transition-all group"
            >
              <ShieldIcon className="w-8 h-8 mb-3 group-hover:scale-110 transition-transform" />
              <span className="font-bold text-sm">Privacy Wards</span>
            </button>

            {/* Logout / Vanish */}
            <button
              onClick={handleLogout}
              className="flex flex-col items-center justify-center p-8 bg-white rounded-2xl
                         shadow-sm hover:shadow-md hover:bg-red-500 hover:text-white
                         transition-all group"
            >
              <LogOutIcon className="w-8 h-8 mb-3 group-hover:scale-110 transition-transform" />
              <span className="font-bold text-sm">Vanish</span>
            </button>
          </div>
        </section>
      </main>

      {/* ── Bottom Nav Bar ────────────────────────────────────────────── */}
      <nav
        className="fixed bottom-0 left-0 w-full z-50
                   flex justify-around items-center
                   px-4 pb-6 pt-2
                   bg-white/80 backdrop-blur-xl
                   shadow-[0_-10px_40px_rgba(45,47,48,0.08)]
                   rounded-t-[2rem]"
      >
        <NavItem
          icon={<HomeIcon className="w-6 h-6" />}
          label="Home"
          onClick={() => navigate("/")}
        />
        <NavItem
          icon={<CompassIcon className="w-6 h-6" />}
          label="Browse"
          onClick={() => navigate("/browse")}
        />
        <NavItem
          icon={<BotIcon className="w-6 h-6" />}
          label="Roomie"
          onClick={() => navigate("/roomie")}
        />
        {/* Active: Profile */}
        <button
          className="flex flex-col items-center justify-center
                     bg-violet-600 text-white rounded-full
                     px-6 py-2 scale-105 shadow-lg shadow-violet-200"
          aria-label="Profile (active)"
        >
          <PersonIcon className="w-6 h-6 mb-1" />
          <span className="text-[10px] uppercase tracking-widest font-medium">
            Profile
          </span>
        </button>
      </nav>
    </div>
  );
}

/* ─── Bottom nav item ──────────────────────────────────────────────── */
function NavItem({ icon, label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center justify-center
                 text-gray-400 px-4 py-2
                 hover:text-violet-600 transition-colors"
    >
      {icon}
      <span className="text-[10px] uppercase tracking-widest font-medium mt-1">
        {label}
      </span>
    </button>
  );
}