import { useState, useEffect, useCallback } from "react";
import api from "../../services/api";
import { StarRating, Spinner, ErrorBanner } from "../ui/Shared";
import Sidebar from "../ui/Sidebar";

const LINKS = [
  {
    to: "/deliveryman-dash", end: true, label: "Today's Orders",
    icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" /></svg>,
  },
  {
    to: "/deliveryman-dash/schedule", label: "Schedule",
    icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path strokeLinecap="round" d="M12 6v6l4 2" /></svg>,
  },
  {
    to: "/deliveryman-dash/history", label: "History",
    icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>,
  },
];

function InfoRow({ icon, label, value }) {
  return (
    <div className="flex items-center gap-3 sm:gap-4 px-4 sm:px-5 py-3 sm:py-4 border-b border-slate-100 last:border-0">
      <div className="w-9 h-9 rounded-xl bg-violet-50 flex items-center justify-center shrink-0">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-slate-400 font-medium">{label}</p>
        <p className="text-sm font-semibold text-slate-800 mt-0.5 truncate">
          {value ?? <span className="text-slate-400 italic">—</span>}
        </p>
      </div>
      <svg className="w-4 h-4 text-slate-300 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
      </svg>
    </div>
  );
}

function PerfTile({ value, label, color, bg }) {
  return (
    <div className="rounded-xl p-3 sm:p-4" style={{ background: bg }}>
      <div className="text-lg sm:text-xl font-extrabold truncate" style={{ color }}>{value}</div>
      <div className="text-xs text-slate-500 mt-0.5">{label}</div>
    </div>
  );
}

const PhoneIcon    = () => <svg className="w-4 h-4 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>;
const VehicleIcon  = () => <svg className="w-4 h-4 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/></svg>;
const CalendarIcon = () => <svg className="w-4 h-4 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 2v4M8 2v4M3 10h18"/></svg>;

export default function DlvProfilePage() {
  const [openBar, setOpenBar] = useState(window.innerWidth >= 600);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res = await api.get("/api/deliveryman/profile");
      setProfile(res.data);
    } catch (e) {
      setError(e.response?.data?.detail || e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar
        openBar={openBar} setOpenBar={setOpenBar} links={LINKS}
        title="DeliveryApp" subtitle="Driver Panel" role="Deliveryman"
        profilePath="/deliveryman-dash/profile"
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="sticky top-0 z-20 bg-white border-b border-slate-100 shadow-sm">
          <div className="flex items-center gap-3 px-4 sm:px-6 py-3 sm:py-4">
            <button
              onClick={() => setOpenBar((v) => !v)}
              className="min-[600px]:hidden w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors shrink-0"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div>
              <h1 className="text-base sm:text-lg font-extrabold text-slate-800 leading-none">My Profile</h1>
              {profile && <p className="text-xs text-slate-400 mt-0.5">{profile.name} · DRV-{profile.id}</p>}
            </div>
          </div>
        </header>

        <main className="flex-1 p-3 sm:p-5 space-y-3 sm:space-y-5 overflow-y-auto">
          {loading && <Spinner />}
          {error   && <ErrorBanner message={error} onRetry={load} />}

          {profile && (
            <>
              <div
                className="rounded-2xl p-4 sm:p-6 text-white relative overflow-hidden"
                style={{ background: "linear-gradient(135deg,#7c3aed 0%,#5b21b6 100%)" }}
              >
                <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: "radial-gradient(circle at 80% 20%, white 0%, transparent 50%)" }} />
                <div className="relative flex items-center gap-3 sm:gap-5">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
                    <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-lg sm:text-xl font-extrabold truncate">{profile.name}</h2>
                    <p className="text-white/70 text-xs sm:text-sm">Delivery Driver · ID #DRV-{profile.id}</p>
                    {profile.avg_rating != null && (
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        <StarRating rating={profile.avg_rating} size="lg" />
                        <span className="text-xs sm:text-sm text-white/80">{profile.avg_rating} avg rating</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 sm:p-5">
                <p className="text-sm font-bold text-slate-700 mb-3 sm:mb-4 flex items-center gap-2">
                  <svg className="w-4 h-4 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
                  </svg>
                  Performance Overview
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                  <PerfTile value={profile.stats.total_orders}        label="Total Orders" color="#7c3aed" bg="#f5f3ff" />
                  <PerfTile value={profile.stats.delivered}           label="Delivered"    color="#059669" bg="#ecfdf5" />
                  <PerfTile value={profile.stats.issues}              label="Issues"       color="#f43f5e" bg="#fff1f2" />
                  <PerfTile value={`${profile.stats.total_earned}DA`} label="Total Earned" color="#7c3aed" bg="#f5f3ff" />
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <InfoRow icon={<PhoneIcon    />} label="Phone"        value={profile.phone}        />
                <InfoRow icon={<VehicleIcon  />} label="Vehicle"      value={profile.vehicle}      />
                <InfoRow icon={<CalendarIcon />} label="Member Since" value={profile.member_since} />
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}