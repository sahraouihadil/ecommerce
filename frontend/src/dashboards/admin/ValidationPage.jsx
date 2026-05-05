/**
 * ValidationPage.jsx - Content Validation Queue (Admin)
 * Connected to real backend API.
 */

import Header from "../ui/Header";
import Sidebar from "../ui/Sidebar";
import { useState, useEffect, useCallback } from "react";
import {
  LayoutDashboard, Users, MessageSquare, CheckSquare,
  BarChart, Activity, Settings, X, Loader2,
  AlignLeft, Calendar, Tag, Layers, Palette,
} from "lucide-react";
import api from "../../services/api";

// ── color dot helper ──────────────────────────────────────────────────────────
const PRESET_HEX = {
  Black:"#111827",White:"#F9FAFB",Gray:"#6B7280",Charcoal:"#374151",Beige:"#D4B896",
  Ivory:"#FFFFF0",Brown:"#92400E",Red:"#EF4444",Orange:"#F97316",Yellow:"#EAB308",
  Green:"#22C55E",Teal:"#14B8A6",Blue:"#3B82F6",Navy:"#1E3A5F",Purple:"#A855F7",
  Pink:"#EC4899",Cream:"#FFF5E1",Sand:"#EADBC8",Taupe:"#8B7D7B",Mocha:"#7B4B3A",
  Chocolate:"#5C3317",Coffee:"#6F4E37",Camel:"#C19A6B",Olive:"#6B8E23",Mint:"#98FF98",
  "Forest Green":"#14532D",Sage:"#9CAF88",Emerald:"#10B981","Sky Blue":"#38BDF8",
  "Royal Blue":"#1D4ED8","Steel Blue":"#4682B4","Baby Blue":"#BFDBFE",Cyan:"#06B6D4",
  Lavender:"#C4B5FD",Plum:"#7E22CE",Violet:"#8B5CF6",Indigo:"#4F46E5",Rose:"#F43F5E",
  Coral:"#FF7F50",Salmon:"#FA8072",Burgundy:"#7F1D1D",Amber:"#F59E0B",Mustard:"#D97706",
  Peach:"#FFDAB9",Gold:"#D4AF37",Bronze:"#CD7F32",Copper:"#B87333",Silver:"#C0C0C0",
};

function ColorDot({ name }) {
  return (
    <span title={name} style={{
      display:"inline-block", width:14, height:14, borderRadius:"50%",
      background: PRESET_HEX[name] ?? "#d1d5db",
      border:"1.5px solid #e2e8f0", flexShrink:0,
    }} />
  );
}

export default function ValidationPage() {
  const [openBar, setOpenBar]               = useState(window.innerWidth >= 768);
  const [selected, setSelected]             = useState(null);
  const [activeFilter, setActiveFilter]     = useState("All");
  const [activeStatusFilter, setActiveStatusFilter] = useState("All"); // ← NEW
  const [rejectNote, setRejectNote]         = useState("");

  // ── Server state ──────────────────────────────────────────────────────────
  const [allItems, setAllItems]           = useState([]);
  const [items, setItems]                 = useState([]);
  const [stats, setStats]                 = useState({ pending:0, approved:0, rejected:0, total:0 });
  const [loadingList, setLoadingList]     = useState(true);
  const [loadingAll, setLoadingAll]       = useState(true);
  const [loadingAction, setLoadingAction] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [itemDetail, setItemDetail]       = useState(null);
  const [error, setError]                 = useState(null);

  const STATUS_STYLE = {
    Pending:  { bg:"#fffbeb", color:"#d97706", icon:"⏳", dot:"#f59e0b" },
    Approved: { bg:"#f0fdf4", color:"#16a34a", icon:"✓",  dot:"#10b981" },
    Rejected: { bg:"#fff1f2", color:"#dc2626", icon:"✕",  dot:"#ef4444" },
  };

  const TYPE_STYLE = {
    Products:   { bg:"#eff6ff", color:"#2563eb" },
    AR:         { bg:"#f5f3ff", color:"#7c3aed" },
    Campaigns:  { bg:"#fef3c7", color:"#92400e" },
    Promotions: { bg:"#fce7f3", color:"#9d174d" },
  };

  const TYPE_ICON = { Products:"📦", AR:"🥽", Campaigns:"📣", Promotions:"🎁" };
  const filters   = ["All", "Products", "AR", "Campaigns", "Promotions"];

  // ── Stat card config — now with status keys ───────────────────────────────
  const STAT_CARDS = [
    {
      key:     "Pending",
      label:   activeFilter === "All" ? "Pending Review" : `${activeFilter} · Pending`,
      countKey:"pending",
      icon:    "⏳",
      iconBg:  "#fffbeb",
      clr:     "#d97706",
      activeBorder: "#fde68a",
      activeShadow: "0 0 0 3px rgba(245,158,11,0.18)",
    },
    {
      key:     "Approved",
      label:   activeFilter === "All" ? "Approved" : `${activeFilter} · Approved`,
      countKey:"approved",
      icon:    "✅",
      iconBg:  "#ecfdf5",
      clr:     "#16a34a",
      activeBorder: "#6ee7b7",
      activeShadow: "0 0 0 3px rgba(16,185,129,0.18)",
    },
    {
      key:     "Rejected",
      label:   activeFilter === "All" ? "Rejected" : `${activeFilter} · Rejected`,
      countKey:"rejected",
      icon:    "❌",
      iconBg:  "#fff1f2",
      clr:     "#dc2626",
      activeBorder: "#fca5a5",
      activeShadow: "0 0 0 3px rgba(239,68,68,0.18)",
    },
  ];

  const adminLinks = [
    { to:"/admin-dash",               label:"Dashboard",     icon:<LayoutDashboard size={18}/>, end:true },
    { to:"/admin-dash/accounts",      label:"Accounts",      icon:<Users size={18}/> },
    { to:"/admin-dash/complaints",    label:"Complaints",    icon:<MessageSquare size={18}/> },
    { to:"/admin-dash/reports",       label:"Reports",       icon:<BarChart size={18}/> },
    { to:"/admin-dash/engagement",    label:"Engagement",    icon:<Activity size={18}/> },
    { to:"/admin-dash/configuration", label:"Configuration", icon:<Settings size={18}/> },
    { to:"/admin-dash/validation",    label:"Validation",    icon:<CheckSquare size={18}/> },
  ];

  // ── Fetch global stats ────────────────────────────────────────────────────
  const fetchStats = useCallback(async () => {
    try {
      const res = await api.get("/api/validation/stats");
      setStats(res.data);
    } catch (err) {
      console.error("Failed to load stats:", err);
    }
  }, []);

  // ── Fetch ALL items (no type/status filter) — for scoped stat counts ──────
  const fetchAllItems = useCallback(async () => {
    setLoadingAll(true);
    try {
      const res = await api.get("/api/validation/", { params: { limit: 500 } });
      setAllItems(res.data);
    } catch (err) {
      console.error("Failed to load all items:", err);
    } finally {
      setLoadingAll(false);
    }
  }, []);

  // ── Fetch filtered list — respects BOTH type AND status filters ───────────
  const fetchList = useCallback(async () => {
    setLoadingList(true);
    setError(null);
    try {
      const params = {};
      if (activeFilter !== "All")       params.item_type = activeFilter;
      if (activeStatusFilter !== "All") params.status    = activeStatusFilter; // ← NEW
      const res = await api.get("/api/validation/", { params });
      setItems(res.data);
    } catch (err) {
      console.error("Failed to load validation queue:", err);
      setError("Failed to load the validation queue. Please try again.");
    } finally {
      setLoadingList(false);
    }
  }, [activeFilter, activeStatusFilter]); // ← activeStatusFilter added to deps

  useEffect(() => { fetchStats(); fetchAllItems(); }, [fetchStats, fetchAllItems]);
  useEffect(() => { fetchList(); }, [fetchList]);

  // ── Escape closes modal ───────────────────────────────────────────────────
  useEffect(() => {
    const h = (e) => { if (e.key === "Escape") { setSelected(null); setItemDetail(null); } };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  useEffect(() => { setRejectNote(""); setItemDetail(null); }, [selected?.id]);

  // ── Fetch full item detail when modal opens ───────────────────────────────
  useEffect(() => {
    if (!selected) return;
    const run = async () => {
      setLoadingDetail(true);
      try {
        const endpointMap = {
          Products:   `/api/products/${selected.item_id}`,
          AR:         `/api/ar/${selected.item_id}`,
          Campaigns:  `/api/campaigns/${selected.item_id}`,
          Promotions: `/api/promotions/${selected.item_id}`,
        };
        const endpoint = endpointMap[selected.item_type];
        if (!endpoint) { setItemDetail(null); return; }
        const res = await api.get(endpoint);
        setItemDetail(res.data);
      } catch (err) {
        console.error("Failed to load item detail:", err);
        setItemDetail(null);
      } finally {
        setLoadingDetail(false);
      }
    };
    run();
  }, [selected?.id]);

  // ── Scoped stat counts ────────────────────────────────────────────────────
  const scopedStats = activeFilter === "All"
    ? { pending: stats.pending, approved: stats.approved, rejected: stats.rejected }
    : {
        pending:  allItems.filter(i => i.item_type === activeFilter && i.status === "Pending").length,
        approved: allItems.filter(i => i.item_type === activeFilter && i.status === "Approved").length,
        rejected: allItems.filter(i => i.item_type === activeFilter && i.status === "Rejected").length,
      };

  // ── Optimistic update — patches both lists ────────────────────────────────
  const applyStatusUpdate = (id, newStatus, extra = {}) => {
    const patch = { status: newStatus, ...extra };
    setItems(prev    => prev.map(i => i.id === id ? { ...i, ...patch } : i));
    setAllItems(prev => prev.map(i => i.id === id ? { ...i, ...patch } : i));
    setSelected(prev => prev?.id === id ? { ...prev, ...patch } : prev);
  };

  const handleApprove = async () => {
    if (!selected || loadingAction) return;
    setLoadingAction(true);
    try {
      const res = await api.put(`/api/validation/${selected.id}/approve`);
      applyStatusUpdate(selected.id, "Approved", { reviewed_at: res.data.reviewed_at });
      fetchStats();
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to approve. Please try again.");
    } finally {
      setLoadingAction(false);
    }
  };

  const handleReject = async () => {
    if (!selected || loadingAction) return;
    if (!rejectNote.trim()) { alert("Please provide a rejection note before rejecting."); return; }
    setLoadingAction(true);
    try {
      const res = await api.put(`/api/validation/${selected.id}/reject`, { rejection_note: rejectNote.trim() });
      applyStatusUpdate(selected.id, "Rejected", {
        rejection_note: res.data.rejection_note,
        reviewed_at:    res.data.reviewed_at,
      });
      fetchStats();
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to reject. Please try again.");
    } finally {
      setLoadingAction(false);
    }
  };

  // ── Toggle stat card: click active card to clear, click another to set ────
  const handleStatCardClick = (statusKey) => {
    setActiveStatusFilter(prev => prev === statusKey ? "All" : statusKey);
  };

  const isFinal   = selected?.status === "Approved" || selected?.status === "Rejected";
  const typeCount = (type) => items.filter(i => i.item_type === type).length;
  const isLoading = activeFilter !== "All" ? loadingList : loadingAll;

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        .val-page  { display:flex; min-height:100vh; background:#f8fafc; font-family:'Inter','Segoe UI',sans-serif; }
        .val-main  { flex:1; overflow-y:auto; min-width:0; }
        .val-inner { padding:24px 28px 48px; max-width:860px; margin:0 auto; display:flex; flex-direction:column; gap:20px; }

        /* stat cards */
        .val-stats-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:14px; }
        .val-stat-card  {
          background:#fff; border-radius:16px; border:1.5px solid #f1f5f9;
          box-shadow:0 1px 4px rgba(0,0,0,0.06); padding:16px 20px;
          display:flex; align-items:center; gap:14px;
          cursor:pointer;
          transition:box-shadow .18s, transform .18s, border-color .18s;
          user-select:none;
        }
        .val-stat-card:hover { box-shadow:0 6px 18px rgba(0,0,0,0.1); transform:translateY(-2px); }
        .val-stat-icon { width:44px; height:44px; border-radius:13px; display:flex; align-items:center; justify-content:center; font-size:20px; flex-shrink:0; }

        /* filter bar */
        .val-filter-bar { display:flex; gap:8px; flex-wrap:wrap; }
        .val-filter-btn { padding:7px 18px; border-radius:99px; font-size:13px; font-weight:600; border:1.5px solid #e2e8f0; cursor:pointer; transition:all .15s; background:#fff; color:#64748b; font-family:inherit; }
        .val-filter-btn.active { background:#0f172a; color:#fff; border-color:#0f172a; }
        .val-filter-btn:not(.active):hover { border-color:#6366f1; color:#6366f1; }

        /* status filter pill strip */
        .val-status-filter-bar { display:flex; gap:6px; flex-wrap:wrap; align-items:center; }
        .val-status-pill {
          display:inline-flex; align-items:center; gap:5px;
          padding:4px 12px; border-radius:99px; font-size:12px; font-weight:700;
          border:1.5px solid transparent; cursor:pointer; transition:all .15s; font-family:inherit;
        }

        /* list */
        .val-list        { background:#fff; border-radius:16px; border:1px solid #f1f5f9; box-shadow:0 1px 3px rgba(0,0,0,0.06); overflow:hidden; }
        .val-list-header { display:flex; justify-content:space-between; align-items:center; padding:16px 20px; border-bottom:1px solid #f1f5f9; flex-wrap:wrap; gap:8px; }
        .val-item        { display:flex; align-items:center; gap:14px; padding:15px 20px; cursor:pointer; border-left:3px solid transparent; border-bottom:1px solid #f8fafc; transition:all .12s; }
        .val-item:last-child { border-bottom:none; }
        .val-item:hover  { background:#fafbff; border-left-color:#c7d2fe; }
        .val-item-body   { flex:1; min-width:0; }
        .val-item-top    { display:flex; justify-content:space-between; align-items:center; gap:8px; margin-bottom:4px; }
        .val-type-tag    { font-size:10px; font-weight:800; padding:3px 8px; border-radius:6px; text-transform:uppercase; letter-spacing:.06em; display:inline-block; margin-bottom:4px; }
        .val-empty       { text-align:center; padding:48px 20px; color:#94a3b8; }
        .val-loading     { display:flex; align-items:center; justify-content:center; gap:8px; padding:48px 20px; color:#94a3b8; font-size:14px; }
        .val-error       { text-align:center; padding:32px 20px; color:#dc2626; font-size:13px; }
        .val-spin        { animation:spin .8s linear infinite; }
        @keyframes spin  { to { transform:rotate(360deg); } }

        /* modal */
        .val-overlay { position:fixed; inset:0; background:rgba(15,23,42,0.5); backdrop-filter:blur(4px); z-index:1000; display:flex; align-items:center; justify-content:center; padding:20px; animation:vFadeIn .18s ease; }
        @keyframes vFadeIn { from{opacity:0}to{opacity:1} }
        .val-modal { background:#fff; border-radius:22px; box-shadow:0 32px 80px rgba(0,0,0,0.22); width:100%; max-width:680px; max-height:90vh; overflow-y:auto; animation:vSlideUp .22s ease; position:relative; display:flex; flex-direction:column; }
        @keyframes vSlideUp { from{opacity:0;transform:translateY(28px)}to{opacity:1;transform:translateY(0)} }
        .val-hero             { width:100%; height:220px; object-fit:cover; border-radius:22px 22px 0 0; display:block; background:#f1f5f9; }
        .val-hero-placeholder { width:100%; height:180px; background:linear-gradient(135deg,#f1f5f9,#e2e8f0); border-radius:22px 22px 0 0; display:flex; align-items:center; justify-content:center; font-size:56px; }
        .val-modal-body   { padding:26px 28px 0; display:flex; flex-direction:column; gap:18px; }
        .val-modal-footer { padding:20px 28px 26px; display:flex; gap:12px; border-top:1px solid #f1f5f9; margin-top:20px; }
        .val-modal-close  { position:absolute; top:14px; right:14px; background:rgba(255,255,255,0.92); border:none; border-radius:50%; width:36px; height:36px; display:flex; align-items:center; justify-content:center; cursor:pointer; color:#64748b; transition:background .15s; box-shadow:0 2px 8px rgba(0,0,0,0.12); z-index:10; }
        .val-modal-close:hover { background:#fff; color:#0f172a; }
        .val-detail-grid  { display:grid; grid-template-columns:1fr 1fr; gap:10px; }
        .val-detail-cell  { background:#f8fafc; border:1px solid #f1f5f9; border-radius:12px; padding:13px 15px; }
        .val-section-label { font-size:10px; font-weight:800; color:#94a3b8; text-transform:uppercase; letter-spacing:.07em; margin:0 0 6px; display:flex; align-items:center; gap:4px; }
        .val-cell-value   { margin:0; font-size:13px; font-weight:600; color:#1e293b; }
        .val-img-strip    { display:flex; gap:8px; flex-wrap:wrap; }
        .val-img-thumb    { width:72px; height:72px; border-radius:10px; object-fit:cover; border:1.5px solid #e2e8f0; background:#f1f5f9; }
        .val-color-strip  { display:flex; gap:6px; flex-wrap:wrap; align-items:center; }
        .val-color-chip   { display:flex; align-items:center; gap:5px; background:#f8fafc; border:1px solid #e2e8f0; border-radius:20px; padding:3px 9px 3px 5px; font-size:12px; font-weight:500; color:#475569; }
        .val-textarea     { width:100%; padding:12px 14px; border:1.5px solid #e2e8f0; border-radius:12px; font-size:13px; font-family:inherit; resize:vertical; outline:none; min-height:88px; background:#f8fafc; color:#0f172a; box-sizing:border-box; transition:border-color .2s; }
        .val-textarea:focus { border-color:#6366f1; background:#fff; }
        .val-btn-approve  { flex:1; background:#10b981; color:#fff; border:none; border-radius:12px; padding:13px; font-size:14px; font-weight:700; cursor:pointer; font-family:inherit; transition:background .15s; display:flex; align-items:center; justify-content:center; gap:6px; }
        .val-btn-approve:hover:not(:disabled) { background:#059669; }
        .val-btn-reject   { flex:1; background:#fff; color:#dc2626; border:1.5px solid #fecaca; border-radius:12px; padding:13px; font-size:14px; font-weight:700; cursor:pointer; font-family:inherit; transition:all .15s; display:flex; align-items:center; justify-content:center; gap:6px; }
        .val-btn-reject:hover:not(:disabled) { background:#fff1f2; border-color:#fca5a5; }
        .val-btn-approve:disabled,.val-btn-reject:disabled { opacity:0.6; cursor:not-allowed; }

        @media(max-width:640px){
          .val-inner{padding:14px 10px 32px;gap:14px}
          .val-stats-grid{gap:8px}
          .val-modal{border-radius:16px}
          .val-modal-body{padding:18px 14px 0}
          .val-modal-footer{padding:14px}
          .val-detail-grid{grid-template-columns:1fr}
          .val-item{padding:12px 14px}
          .val-hero{height:160px}
        }
        @media(max-width:420px){.val-stats-grid{grid-template-columns:1fr}}
      `}</style>

      <div className="val-page">
        <Sidebar openBar={openBar} setOpenBar={setOpenBar} links={adminLinks}
          title="AdminCore" subtitle="Enterprise Suite" role="Super Admin" profilePath="/admin-dash/profile" />

        <main className="val-main">
          <Header concept="Validation" setOpenBar={setOpenBar} openBar={openBar} />

          <div className="val-inner">

            {/* ── Stat Cards — clickable status filter ── */}
            <div className="val-stats-grid">
              {STAT_CARDS.map(s => {
                const isActive = activeStatusFilter === s.key;
                return (
                  <div
                    key={s.key}
                    className="val-stat-card"
                    onClick={() => handleStatCardClick(s.key)}
                    style={isActive ? {
                      borderColor: s.activeBorder,
                      boxShadow:   s.activeShadow,
                      transform:   "translateY(-2px)",
                    } : {}}
                    title={isActive ? `Click to clear ${s.key} filter` : `Show only ${s.key}`}
                  >
                    <div className="val-stat-icon" style={{ background: s.iconBg }}>
                      {s.icon}
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <p style={{
                        margin:"0 0 2px", fontSize:11, color:"#94a3b8",
                        textTransform:"uppercase", letterSpacing:".07em", fontWeight:700,
                      }}>
                        {s.label}
                      </p>
                      <p style={{
                        margin:0, fontSize:26, fontWeight:800,
                        color: s.clr, letterSpacing:"-0.02em", lineHeight:1,
                      }}>
                        {isLoading ? "—" : scopedStats[s.countKey]}
                      </p>
                    </div>
                    {/* Active indicator dot */}
                    {isActive && (
                      <span style={{
                        width:8, height:8, borderRadius:"50%",
                        background: s.clr, flexShrink:0,
                        boxShadow:`0 0 0 2px ${s.activeBorder}`,
                      }} />
                    )}
                  </div>
                );
              })}
            </div>

            {/* ── Filter Bar (type) ── */}
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              <div className="val-filter-bar">
                {filters.map(f => (
                  <button
                    key={f}
                    className={`val-filter-btn${activeFilter === f ? " active" : ""}`}
                    onClick={() => setActiveFilter(f)}
                  >
                    {f}
                    {f !== "All" && (
                      <span style={{ marginLeft:6, opacity:0.6 }}>({typeCount(f)})</span>
                    )}
                  </button>
                ))}
              </div>

              {/* Active status filter indicator + clear button */}
              {activeStatusFilter !== "All" && (() => {
                const sc = STAT_CARDS.find(s => s.key === activeStatusFilter);
                return (
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <span style={{ fontSize:12, color:"#94a3b8", fontWeight:600 }}>Filtered by status:</span>
                    <button
                      onClick={() => setActiveStatusFilter("All")}
                      style={{
                        display:"inline-flex", alignItems:"center", gap:6,
                        padding:"4px 12px", borderRadius:99, fontSize:12, fontWeight:700,
                        background: sc?.iconBg, color: sc?.clr,
                        border:`1.5px solid ${sc?.activeBorder}`,
                        cursor:"pointer", fontFamily:"inherit",
                      }}
                    >
                      {activeStatusFilter}
                      <X size={11} />
                    </button>
                  </div>
                );
              })()}
            </div>

            {/* ── Queue List ── */}
            <div className="val-list">
              <div className="val-list-header">
                <span style={{ fontWeight:700, fontSize:14, color:"#0f172a" }}>Validation Queue</span>
                <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                  {activeStatusFilter !== "All" && (
                    <span style={{
                      background: STAT_CARDS.find(s => s.key === activeStatusFilter)?.iconBg,
                      color:      STAT_CARDS.find(s => s.key === activeStatusFilter)?.clr,
                      fontSize:11, fontWeight:700, borderRadius:99, padding:"3px 10px",
                    }}>
                      {activeStatusFilter}
                    </span>
                  )}
                  <span style={{ background:"#f1f5f9", color:"#64748b", fontSize:12, fontWeight:600, borderRadius:99, padding:"3px 10px" }}>
                    {items.length} {activeFilter === "All" ? "Total" : activeFilter}
                  </span>
                </div>
              </div>

              {loadingList ? (
                <div className="val-loading">
                  <Loader2 size={18} className="val-spin" /> Loading queue…
                </div>
              ) : error ? (
                <div className="val-error">
                  {error}<br />
                  <button onClick={fetchList} style={{ marginTop:10, padding:"6px 16px", borderRadius:8, border:"1px solid #fecaca", background:"#fff1f2", color:"#dc2626", cursor:"pointer", fontWeight:600 }}>
                    Retry
                  </button>
                </div>
              ) : items.length === 0 ? (
                <div className="val-empty">
                  <div style={{ fontSize:28, marginBottom:10 }}>📭</div>
                  <p style={{ fontWeight:700, fontSize:14, color:"#475569", margin:"0 0 4px" }}>No items found</p>
                  <p style={{ fontSize:13, margin:0 }}>No submissions match the current filter.</p>
                </div>
              ) : (
                items.map((item) => {
                  const ss = STATUS_STYLE[item.status] || STATUS_STYLE.Pending;
                  const ts = TYPE_STYLE[item.item_type] || { bg:"#f8fafc", color:"#64748b" };
                  return (
                    <div key={item.id} className="val-item" onClick={() => setSelected(item)}>
                      <div style={{ width:10, height:10, borderRadius:"50%", background:ss.dot, flexShrink:0 }} />
                      <div className="val-item-body">
                        <span className="val-type-tag" style={{ background:ts.bg, color:ts.color }}>{item.item_type}</span>
                        <div className="val-item-top">
                          <p style={{ margin:0, fontWeight:700, fontSize:14, color:"#0f172a", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                            {item.title}
                          </p>
                          <span style={{ background:ss.bg, color:ss.color, padding:"3px 10px", borderRadius:99, fontSize:11, fontWeight:700, flexShrink:0, display:"inline-flex", alignItems:"center", gap:4 }}>
                            <span style={{ width:5, height:5, borderRadius:"50%", background:ss.dot, display:"inline-block" }} />
                            {item.status}
                          </span>
                        </div>
                        <p style={{ margin:0, fontSize:12, color:"#94a3b8" }}>
                          By {item.user || "—"} · #{item.id}
                        </p>
                      </div>
                      <span style={{ color:"#cbd5e1", fontSize:18, flexShrink:0 }}>›</span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </main>
      </div>

      {/* ── Detail Modal ── */}
      {selected && (() => {
        const ss = STATUS_STYLE[selected.status] || STATUS_STYLE.Pending;
        const ts = TYPE_STYLE[selected.item_type] || { bg:"#f8fafc", color:"#64748b" };
        const d  = itemDetail;

        const images     = d?.images || (d?.image_url ? [d.image_url] : []);
        const primaryImg = images[0] ? `http://127.0.0.1:8000/${images[0]}` : null;
        const extraImgs  = images.slice(1, 4);

        const stockQty   = d?.quantity ?? null;
        const stockLabel = stockQty === null ? null
          : stockQty === 0 ? "Out of Stock"
          : stockQty < 10  ? "Low Stock"
          : "In Stock";
        const stockColor = stockLabel === "In Stock" ? "#16a34a" : stockLabel === "Low Stock" ? "#d97706" : "#dc2626";
        const stockBg    = stockLabel === "In Stock" ? "#f0fdf4"  : stockLabel === "Low Stock" ? "#fffbeb"  : "#fff1f2";

        return (
          <div className="val-overlay"
            onClick={(e) => { if (e.target === e.currentTarget) { setSelected(null); setItemDetail(null); } }}>
            <div className="val-modal">
              <button className="val-modal-close" onClick={() => { setSelected(null); setItemDetail(null); }}>
                <X size={16} />
              </button>

              {loadingDetail ? (
                <div className="val-hero-placeholder">
                  <Loader2 size={32} className="val-spin" style={{ color:"#94a3b8" }} />
                </div>
              ) : primaryImg ? (
                <img src={primaryImg} alt={d?.name || selected.title} className="val-hero" />
              ) : (
                <div className="val-hero-placeholder">
                  {TYPE_ICON[selected.item_type] || "📄"}
                </div>
              )}

              <div className="val-modal-body">

                <div style={{ display:"flex", gap:12, alignItems:"flex-start", paddingRight:8 }}>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:"flex", gap:8, alignItems:"center", marginBottom:6, flexWrap:"wrap" }}>
                      <span className="val-type-tag" style={{ background:ts.bg, color:ts.color, marginBottom:0 }}>
                        {selected.item_type}
                      </span>
                      <span style={{ background:ss.bg, color:ss.color, padding:"3px 10px", borderRadius:99, fontSize:11, fontWeight:700, display:"inline-flex", alignItems:"center", gap:4 }}>
                        <span style={{ width:5, height:5, borderRadius:"50%", background:ss.dot, display:"inline-block" }} />
                        {selected.status}
                      </span>
                      {d?.sku && (
                        <span style={{ background:"#f1f5f9", color:"#64748b", padding:"3px 9px", borderRadius:99, fontSize:11, fontWeight:600, fontFamily:"monospace" }}>
                          {d.sku}
                        </span>
                      )}
                    </div>
                    <h2 style={{ margin:"0 0 3px", fontSize:20, fontWeight:800, color:"#0f172a", letterSpacing:"-0.02em", lineHeight:1.25 }}>
                      {d?.name || selected.title}
                    </h2>
                    <p style={{ margin:0, fontSize:12, color:"#94a3b8", fontFamily:"monospace" }}>
                      V-{String(selected.id).padStart(3,"0")} · Submitted by {selected.user || "Unknown"}
                    </p>
                  </div>
                  {d?.price != null && (
                    <div style={{ background:"#0f172a", color:"#fff", borderRadius:12, padding:"8px 16px", fontWeight:800, fontSize:18, flexShrink:0, letterSpacing:"-0.02em" }}>
                      {d.price}DA
                    </div>
                  )}
                </div>

                {!loadingDetail && extraImgs.length > 0 && (
                  <div>
                    <p className="val-section-label">More Images</p>
                    <div className="val-img-strip">
                      {extraImgs.map((url, i) => (
                        <img key={i} src={`http://127.0.0.1:8000/${url}`} alt={`img-${i+2}`} className="val-img-thumb" />
                      ))}
                    </div>
                  </div>
                )}

                {d?.description && (
                  <div>
                    <p className="val-section-label"><AlignLeft size={10} /> Description</p>
                    <p style={{ margin:0, fontSize:13, color:"#475569", lineHeight:1.6, background:"#f8fafc", border:"1px solid #f1f5f9", borderRadius:12, padding:"12px 14px" }}>
                      {d.description}
                    </p>
                  </div>
                )}

                {!loadingDetail && (
                  <div className="val-detail-grid">
                    {d?.category && (
                      <div className="val-detail-cell">
                        <p className="val-section-label"><Tag size={10} /> Category</p>
                        <p className="val-cell-value" style={{ textTransform:"capitalize" }}>{d.category}</p>
                      </div>
                    )}
                    {stockLabel && (
                      <div className="val-detail-cell">
                        <p className="val-section-label"><Layers size={10} /> Stock</p>
                        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                          <p className="val-cell-value">{d.quantity} units</p>
                          <span style={{ background:stockBg, color:stockColor, fontSize:10, fontWeight:700, padding:"2px 8px", borderRadius:99 }}>
                            {stockLabel}
                          </span>
                        </div>
                      </div>
                    )}
                    <div className="val-detail-cell">
                      <p className="val-section-label"><Calendar size={10} /> Submitted</p>
                      <p className="val-cell-value" style={{ fontFamily:"monospace", fontSize:12 }}>
                        {selected.submitted_at
                          ? new Date(selected.submitted_at).toLocaleString("en-GB", { dateStyle:"medium", timeStyle:"short" })
                          : "—"}
                      </p>
                    </div>
                    {selected.reviewed_at && (
                      <div className="val-detail-cell">
                        <p className="val-section-label"><Calendar size={10} /> Reviewed</p>
                        <p className="val-cell-value" style={{ fontFamily:"monospace", fontSize:12 }}>
                          {new Date(selected.reviewed_at).toLocaleString("en-GB", { dateStyle:"medium", timeStyle:"short" })}
                        </p>
                      </div>
                    )}
                    {d?.able_3d != null && (
                      <div className="val-detail-cell">
                        <p className="val-section-label">3D / AR</p>
                        <p className="val-cell-value">
                          {d.able_3d ? "✅ 3D ready" : "—"}{d.able_ar ? " · 🥽 AR ready" : ""}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {!loadingDetail && d?.colors?.length > 0 && (
                  <div>
                    <p className="val-section-label"><Palette size={10} /> Colors</p>
                    <div className="val-color-strip">
                      {d.colors.map(name => (
                        <span key={name} className="val-color-chip">
                          <ColorDot name={name} /> {name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {loadingDetail && (
                  <div style={{ display:"flex", alignItems:"center", gap:8, color:"#94a3b8", fontSize:13 }}>
                    <Loader2 size={15} className="val-spin" /> Loading product details…
                  </div>
                )}

                <div>
                  <p className="val-section-label">
                    Rejection Note{" "}
                    <span style={{ color:"#cbd5e1", fontWeight:400, textTransform:"none", letterSpacing:0 }}>(shown to submitter)</span>
                  </p>
                  <textarea
                    className="val-textarea"
                    placeholder="Required when rejecting — describe what needs to be corrected…"
                    value={selected.status === "Rejected" ? (selected.rejection_note || "") : rejectNote}
                    onChange={(e) => setRejectNote(e.target.value)}
                    disabled={isFinal}
                    style={{ opacity: isFinal ? 0.65 : 1 }}
                  />
                </div>

                {isFinal && (
                  <p style={{ margin:0, fontSize:12, color:"#94a3b8", textAlign:"center", background:"#f8fafc", borderRadius:10, padding:"9px 14px" }}>
                    🔒 This item is <strong>{selected.status}</strong> and can no longer be modified.
                  </p>
                )}
              </div>

              <div className="val-modal-footer">
                <button className="val-btn-approve" onClick={handleApprove} disabled={isFinal || loadingAction}
                  style={selected.status === "Approved" ? { background:"#f0fdf4", color:"#16a34a" } : {}}>
                  {loadingAction ? <Loader2 size={16} className="val-spin" /> : null}
                  {selected.status === "Approved" ? "✓ Approved" : "✓ Approve"}
                </button>
                <button className="val-btn-reject" onClick={handleReject} disabled={isFinal || loadingAction}
                  style={selected.status === "Rejected" ? { background:"#fff1f2", color:"#dc2626", borderColor:"#fecaca" } : {}}>
                  {loadingAction ? <Loader2 size={16} className="val-spin" /> : null}
                  {selected.status === "Rejected" ? "✕ Rejected" : "✕ Reject"}
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </>
  );
}