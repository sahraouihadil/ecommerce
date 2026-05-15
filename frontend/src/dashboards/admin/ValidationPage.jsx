/**
 * ValidationPage.jsx - Content Validation Queue (Admin)
 * Connected to real backend API.
 * - Smooth open/close transitions on both modals (mount → fade+slide → unmount)
 * - AR type  → only "View in AR" button shown  (no 3D button)
 * - 3D type  → only "View 3D Model" button shown (no AR button)
 * - Products → shows whichever flags are set (has3D / hasAR)
 * - Stat card counts always global (never zeroed by type filter)
 * - Campaigns → rich detail panel: image, name, title, budget, discount, channels, dates, usage
 * - Campaigns filter → returns both "Campaigns" and "Campaigns_Delete" item types
 * - Products filter  → returns both "Products"  and "Products_Delete"  item types
 */

import Header from "../ui/Header";
import Sidebar from "../ui/Sidebar";
import ProductViewer from "../../components/ProductViewer/ProductViewer";
import { useState, useEffect, useCallback, useRef } from "react";
import {
  LayoutDashboard, Users, MessageSquare, CheckSquare,
  BarChart, Activity, Settings, X, Loader2,
  AlignLeft, Calendar, Tag, Layers, Palette, ArrowLeft,
  Hash, DollarSign, TrendingUp, MousePointer, Eye,
  Store, Globe, ShieldCheck, ShieldOff, Megaphone,
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

// ── Smooth modal wrapper ───────────────────────────────────────────────────────
function AnimatedModal({ visible, onExited, duration = 260, children, overlayClass, onOverlayClick }) {
  const [mounted, setMounted] = useState(false);
  const [shown,   setShown]   = useState(false);
  const exitTimer = useRef(null);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      requestAnimationFrame(() => requestAnimationFrame(() => setShown(true)));
    } else {
      setShown(false);
      clearTimeout(exitTimer.current);
      exitTimer.current = setTimeout(() => {
        setMounted(false);
        onExited?.();
      }, duration);
    }
    return () => clearTimeout(exitTimer.current);
  }, [visible]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!mounted) return null;

  return (
    <div
      className={overlayClass}
      data-shown={shown ? "true" : "false"}
      onClick={onOverlayClick}
    >
      {children}
    </div>
  );
}

// ── Campaign channel badges ────────────────────────────────────────────────────
function ChannelBadges({ channel }) {
  const map = {
    'Ads on Shop': { emoji: '🛍️', bg: '#EEF0FF', color: '#5B47E0' },
    'Facebook':    { emoji: '📘', bg: '#E7F0FD', color: '#1877F2' },
    'Instagram':   { emoji: '📸', bg: '#FDE7F3', color: '#E1306C' },
  };
  const parts = (channel || '').split(',').map(s => s.trim()).filter(Boolean);
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
      {parts.map(p => {
        const m = map[p] || { emoji: '📣', bg: '#F3F4F6', color: '#6B7280' };
        return (
          <span key={p} style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            padding: '4px 10px', borderRadius: 99,
            background: m.bg, color: m.color,
            fontSize: '0.75rem', fontWeight: 700,
          }}>
            {m.emoji} {p}
          </span>
        );
      })}
    </div>
  );
}

// ── Campaign detail panel ─────────────────────────────────────────────────────
function CampaignDetail({ d, selected }) {
  const BASE = "http://127.0.0.1:8000";
  const imageUrl = d?.image_url
    ? (d.image_url.startsWith('http') ? d.image_url : `${BASE}/${d.image_url.replace(/^\//, '')}`)
    : null;

  const hasDiscount = d?.discount != null && Number(d.discount) > 0;
  const discountLabel = hasDiscount
    ? (d.discount_type === 'percentage' ? `${d.discount}% off` : `${d.discount} DA off`)
    : null;

  const budgetPct = d?.budget > 0 ? Math.min(100, Math.round(((d.spent || 0) / d.budget) * 100)) : 0;
  const usagePct  = d?.usage_max > 0
    ? Math.min(100, Math.round(((d.usage_current || 0) / d.usage_max) * 100))
    : null;

  const stockColor = usagePct === null ? null
    : usagePct >= 90 ? '#dc2626'
    : usagePct >= 60 ? '#d97706'
    : '#16a34a';

  const statCells = [
    { icon: <DollarSign size={12}/>, label: "Budget",      value: `${Number(d?.budget || 0).toLocaleString()} DA` },
    { icon: <TrendingUp size={12}/>, label: "Spent",       value: `${Number(d?.spent || 0).toLocaleString()} DA` },
    { icon: <Eye size={12}/>,        label: "Impressions", value: Number(d?.impressions || 0).toLocaleString() },
    { icon: <MousePointer size={12}/>,label:"Clicks",      value: Number(d?.clicks || 0).toLocaleString() },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {imageUrl && (
        <div style={{ position: 'relative', borderRadius: 14, overflow: 'hidden', border: '1px solid #f1f5f9' }}>
          <img src={imageUrl} alt={d?.name || selected.title} style={{ width: '100%', height: 180, objectFit: 'cover', display: 'block' }} />
          {discountLabel && (
            <span style={{
              position: 'absolute', top: 10, left: 10,
              padding: '5px 12px', borderRadius: 99,
              fontSize: '0.75rem', fontWeight: 700,
              background: '#fef9c3', color: '#b45309',
              boxShadow: '0 1px 6px rgba(0,0,0,0.12)',
              display: 'inline-flex', alignItems: 'center', gap: 4,
            }}>
              <Tag size={11}/> {discountLabel}
            </span>
          )}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {d?.name && (
          <div>
            <p className="val-section-label"><Megaphone size={10}/> Campaign Name</p>
            <p style={{ margin: 0, fontSize: 15, fontWeight: 800, color: '#0f172a' }}>{d.name}</p>
          </div>
        )}
        {d?.title && d.title !== d?.name && (
          <div>
            <p className="val-section-label"><AlignLeft size={10}/> Headline</p>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: '#5B47E0' }}>{d.title}</p>
          </div>
        )}
        {d?.channel && (
          <div>
            <p className="val-section-label"><Globe size={10}/> Ad Placement</p>
            <ChannelBadges channel={d.channel} />
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {statCells.map(({ icon, label, value }) => (
          <div key={label} className="val-detail-cell">
            <p className="val-section-label">{icon} {label}</p>
            <p className="val-cell-value">{value}</p>
          </div>
        ))}
      </div>

      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600 }}>Budget Used</span>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#374151' }}>{budgetPct}%</span>
        </div>
        <div style={{ height: 6, borderRadius: 99, background: '#f1f5f9', overflow: 'hidden' }}>
          <div style={{
            height: '100%', width: `${budgetPct}%`,
            background: budgetPct >= 90 ? '#ef4444' : budgetPct >= 60 ? '#f59e0b' : '#5B47E0',
            borderRadius: 99, transition: 'width 0.5s ease',
          }} />
        </div>
      </div>

      {hasDiscount && (
        <div style={{
          border: '1px dashed #c4b5fd', borderRadius: 12,
          padding: '14px 16px', background: '#faf5ff',
          display: 'flex', flexDirection: 'column', gap: 10,
        }}>
          <p className="val-section-label" style={{ marginBottom: 0 }}><Tag size={10}/> Discount & Coupon</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <p style={{ margin: '0 0 2px', fontSize: 10, color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em' }}>Value</p>
              <p style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#7c3aed' }}>{discountLabel}</p>
            </div>
            <div>
              <p style={{ margin: '0 0 2px', fontSize: 10, color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em' }}>Type</p>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: '#374151', textTransform: 'capitalize' }}>
                {d.discount_type === 'percentage' ? 'Percentage (%)' : 'Fixed Amount (DA)'}
              </p>
            </div>
          </div>
          {d?.code && (
            <div>
              <p style={{ margin: '0 0 5px', fontSize: 10, color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em' }}>Coupon Code</p>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                padding: '5px 12px', borderRadius: 8,
                background: '#ede9fe', color: '#7c3aed',
                fontSize: '0.8125rem', fontWeight: 700, fontFamily: 'monospace', letterSpacing: '0.1em',
                border: '1.5px dashed #a78bfa',
              }}>
                <Hash size={11}/> {d.code}
              </span>
            </div>
          )}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
              <span style={{ fontSize: 10, color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', display: 'flex', alignItems: 'center', gap: 4 }}>
                <Users size={10}/> Redemptions
              </span>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#374151' }}>
                {d?.usage_current ?? 0} / {d?.usage_max > 0 ? d.usage_max : '∞'}
              </span>
            </div>
            {usagePct !== null && (
              <div style={{ height: 5, borderRadius: 99, background: '#ede9fe', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${usagePct}%`, background: stockColor, borderRadius: 99, transition: 'width 0.5s ease' }}/>
              </div>
            )}
          </div>
        </div>
      )}

      {d?.status && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '5px 12px', borderRadius: 8,
            background: d.status === 'active' ? '#ecfdf5' : d.status === 'draft' ? '#fef9c3' : d.status === 'paused' ? '#fff7ed' : '#eff6ff',
            color: d.status === 'active' ? '#16a34a' : d.status === 'draft' ? '#b45309' : d.status === 'paused' ? '#c2410c' : '#2563eb',
            fontSize: '0.75rem', fontWeight: 700,
          }}>
            {d.status.charAt(0).toUpperCase() + d.status.slice(1)}
          </div>
          {d.is_active !== undefined && (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '5px 12px', borderRadius: 8,
              background: d.is_active ? '#ecfdf5' : '#f3f4f6',
              color: d.is_active ? '#16a34a' : '#6b7280',
              fontSize: '0.75rem', fontWeight: 700,
            }}>
              {d.is_active ? <ShieldCheck size={11}/> : <ShieldOff size={11}/>}
              {d.is_active ? 'Live on Storefront' : 'Hidden from Storefront'}
            </div>
          )}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {d?.start_date && (
          <div className="val-detail-cell">
            <p className="val-section-label"><Calendar size={10}/> Start Date</p>
            <p className="val-cell-value" style={{ fontFamily: 'monospace', fontSize: 12 }}>
              {new Date(d.start_date).toLocaleDateString('en-GB', { dateStyle: 'medium' })}
            </p>
          </div>
        )}
        {d?.end_date && (
          <div className="val-detail-cell">
            <p className="val-section-label"><Calendar size={10}/> End Date</p>
            <p className="val-cell-value" style={{ fontFamily: 'monospace', fontSize: 12 }}>
              {new Date(d.end_date).toLocaleDateString('en-GB', { dateStyle: 'medium' })}
            </p>
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <div className="val-detail-cell">
          <p className="val-section-label"><Calendar size={10}/> Submitted</p>
          <p className="val-cell-value" style={{ fontFamily: 'monospace', fontSize: 11 }}>
            {selected.submitted_at
              ? new Date(selected.submitted_at).toLocaleString('en-GB', { dateStyle:'medium', timeStyle:'short' })
              : '—'}
          </p>
        </div>
        {selected.reviewed_at && (
          <div className="val-detail-cell">
            <p className="val-section-label"><Calendar size={10}/> Reviewed</p>
            <p className="val-cell-value" style={{ fontFamily: 'monospace', fontSize: 11 }}>
              {new Date(selected.reviewed_at).toLocaleString('en-GB', { dateStyle:'medium', timeStyle:'short' })}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Product Delete detail panel ───────────────────────────────────────────────
function ProductDeleteDetail({ d, selected }) {
  if (!d) return null;

  const images   = d?.images || (d?.image_url ? [d.image_url] : []);
  const imgUrl   = images[0] ? `http://127.0.0.1:8000/${images[0]}` : null;
  const stockQty = d?.quantity ?? null;
  const stockLabel = stockQty === null ? null
    : stockQty === 0 ? "Out of Stock"
    : stockQty < 10  ? "Low Stock"
    : "In Stock";
  const stockColor = stockLabel === "In Stock" ? "#16a34a" : stockLabel === "Low Stock" ? "#d97706" : "#dc2626";
  const stockBg    = stockLabel === "In Stock" ? "#f0fdf4"  : stockLabel === "Low Stock" ? "#fffbeb"  : "#fff1f2";

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Product image */}
      {imgUrl && (
        <div style={{ borderRadius: 14, overflow: 'hidden', border: '1px solid #f1f5f9' }}>
          <img src={imgUrl} alt={d.name} style={{ width: '100%', height: 180, objectFit: 'cover', display: 'block' }} />
        </div>
      )}

      {/* Warning banner */}
      <div style={{
        background: '#fff1f2', border: '1px solid #fecaca', borderRadius: 12,
        padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 6,
      }}>
        <p style={{ margin: 0, fontSize: 13, fontWeight: 800, color: '#dc2626', display: 'flex', alignItems: 'center', gap: 6 }}>
          🗑️ Deletion Request
        </p>
        <p style={{ margin: 0, fontSize: 12, color: '#b91c1c', lineHeight: 1.5 }}>
          Approving this will <strong>permanently delete</strong> this product and all its images from the system.
          This action cannot be undone.
        </p>
      </div>

      {/* Product details grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {d?.category && (
          <div className="val-detail-cell">
            <p className="val-section-label"><Tag size={10}/> Category</p>
            <p className="val-cell-value" style={{ textTransform: 'capitalize' }}>{d.category}</p>
          </div>
        )}
        {d?.sku && (
          <div className="val-detail-cell">
            <p className="val-section-label"><Hash size={10}/> SKU</p>
            <p className="val-cell-value" style={{ fontFamily: 'monospace' }}>{d.sku}</p>
          </div>
        )}
        <div className="val-detail-cell">
          <p className="val-section-label"><DollarSign size={10}/> Price</p>
          <p className="val-cell-value">${d.price}</p>
        </div>
        {stockLabel && (
          <div className="val-detail-cell">
            <p className="val-section-label"><Layers size={10}/> Stock</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <p className="val-cell-value">{d.quantity} units</p>
              <span style={{ background: stockBg, color: stockColor, fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 99 }}>{stockLabel}</span>
            </div>
          </div>
        )}
        <div className="val-detail-cell">
          <p className="val-section-label"><Calendar size={10}/> Submitted</p>
          <p className="val-cell-value" style={{ fontFamily: 'monospace', fontSize: 11 }}>
            {selected.submitted_at
              ? new Date(selected.submitted_at).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })
              : '—'}
          </p>
        </div>
        {selected.reviewed_at && (
          <div className="val-detail-cell">
            <p className="val-section-label"><Calendar size={10}/> Reviewed</p>
            <p className="val-cell-value" style={{ fontFamily: 'monospace', fontSize: 11 }}>
              {new Date(selected.reviewed_at).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}
            </p>
          </div>
        )}
      </div>

      {/* Colors */}
      {d?.colors?.length > 0 && (
        <div>
          <p className="val-section-label"><Palette size={10}/> Colors</p>
          <div className="val-color-strip">
            {d.colors.map(name => (
              <span key={name} className="val-color-chip">
                <ColorDot name={name} /> {name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Description */}
      {d?.description && (
        <div>
          <p className="val-section-label"><AlignLeft size={10}/> Description</p>
          <p style={{ margin: 0, fontSize: 13, color: '#475569', lineHeight: 1.6, background: '#f8fafc', border: '1px solid #f1f5f9', borderRadius: 12, padding: '12px 14px' }}>
            {d.description}
          </p>
        </div>
      )}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
export default function ValidationPage() {
  const [openBar, setOpenBar]               = useState(window.innerWidth >= 768);
  const [selected, setSelected]             = useState(null);
  const [detailVisible, setDetailVisible]   = useState(false);
  const [activeFilter, setActiveFilter]     = useState("All");
  const [activeStatusFilter, setActiveStatusFilter] = useState("All");
  const [rejectNote, setRejectNote]         = useState("");

  const [modelViewer, setModelViewer]       = useState(null);
  const [viewerVisible, setViewerVisible]   = useState(false);

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
    Products:          { bg:"#eff6ff", color:"#2563eb" },
    AR:                { bg:"#f5f3ff", color:"#7c3aed" },
    "3D":              { bg:"#fdf4ff", color:"#9333ea" },
    Campaigns:         { bg:"#fef3c7", color:"#92400e" },
    Blogs:             { bg:"#fce7f3", color:"#9d174d" },
    Campaigns_Delete:  { bg:"#fff1f2", color:"#991b1b" },
    Products_Delete:   { bg:"#fff1f2", color:"#991b1b" },
  };

  const TYPE_ICON = { Products:"📦", AR:"🥽", "3D":"🧊", Campaigns:"📣", Blogs:"", Products_Delete:"🗑️" };
  const filters   = ["All", "Products", "AR", "3D", "Campaigns", "Blogs"];

  const STAT_CARDS = [
    { key:"Pending",  label:"Pending Review", countKey:"pending",  icon:"⏳", iconBg:"#fffbeb", clr:"#d97706", activeBorder:"#fde68a", activeShadow:"0 0 0 3px rgba(245,158,11,0.18)" },
    { key:"Approved", label:"Approved",       countKey:"approved", icon:"✅", iconBg:"#ecfdf5", clr:"#16a34a", activeBorder:"#6ee7b7", activeShadow:"0 0 0 3px rgba(16,185,129,0.18)" },
    { key:"Rejected", label:"Rejected",       countKey:"rejected", icon:"❌", iconBg:"#fff1f2", clr:"#dc2626", activeBorder:"#fca5a5", activeShadow:"0 0 0 3px rgba(239,68,68,0.18)" },
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

  // ── Fetchers ──────────────────────────────────────────────────────────────
  const fetchStats = useCallback(async () => {
    try {
      const res = await api.get("/api/validation/stats");
      setStats(res.data);
    } catch (err) { console.error("Failed to load stats:", err); }
  }, []);

  const fetchAllItems = useCallback(async () => {
    setLoadingAll(true);
    try {
      const res = await api.get("/api/validation/", { params: { limit: 500 } });
      setAllItems(res.data);
    } catch (err) { console.error("Failed to load all items:", err); }
    finally { setLoadingAll(false); }
  }, []);

  const fetchList = useCallback(async () => {
    setLoadingList(true);
    setError(null);
    try {
      if (activeFilter === "Campaigns") {
        const baseParams = activeStatusFilter !== "All" ? { status: activeStatusFilter } : {};
        const [resNormal, resDelete] = await Promise.all([
          api.get("/api/validation/", { params: { ...baseParams, item_type: "Campaigns" } }),
          api.get("/api/validation/", { params: { ...baseParams, item_type: "Campaigns_Delete" } }),
        ]);
        const merged = [...resNormal.data, ...resDelete.data].sort((a, b) => b.id - a.id);
        setItems(merged);
      } else if (activeFilter === "Products") {
        // ── FIX: also fetch Products_Delete when filtering by Products ──
        const baseParams = activeStatusFilter !== "All" ? { status: activeStatusFilter } : {};
        const [resNormal, resDelete] = await Promise.all([
          api.get("/api/validation/", { params: { ...baseParams, item_type: "Products" } }),
          api.get("/api/validation/", { params: { ...baseParams, item_type: "Products_Delete" } }),
        ]);
        const merged = [...resNormal.data, ...resDelete.data].sort((a, b) => b.id - a.id);
        setItems(merged);
      } else {
        const params = {};
        if (activeFilter !== "All")       params.item_type = activeFilter;
        if (activeStatusFilter !== "All") params.status    = activeStatusFilter;
        const res = await api.get("/api/validation/", { params });
        setItems(res.data);
      }
    } catch (err) {
      console.error("Failed to load validation queue:", err);
      setError("Failed to load the validation queue. Please try again.");
    } finally { setLoadingList(false); }
  }, [activeFilter, activeStatusFilter]);

  useEffect(() => { fetchStats(); fetchAllItems(); }, [fetchStats, fetchAllItems]);
  useEffect(() => { fetchList(); }, [fetchList]);

  useEffect(() => {
    const h = (e) => {
      if (e.key !== "Escape") return;
      if (viewerVisible) { closeViewer(); return; }
      if (detailVisible) { closeDetail(); }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [viewerVisible, detailVisible]);

  const openDetail = (item) => {
    setSelected(item);
    setRejectNote("");
    setItemDetail(null);
    setDetailVisible(true);
  };

  const closeDetail = () => setDetailVisible(false);
  const closeViewer = () => setViewerVisible(false);

  // ── Fetch item detail ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!selected) return;
    const run = async () => {
      setLoadingDetail(true);
      try {
        const endpointMap = {
          Products:         `/api/products/${selected.item_id}`,
          Products_Delete:  `/api/products/${selected.item_id}`,
          AR:               `/api/products/${selected.item_id}`,
          "3D":             `/api/products/${selected.item_id}`,
          Campaigns:        `/api/campaigns/${selected.item_id}`,
          Campaigns_Delete: `/api/campaigns/${selected.item_id}`,
        };
        const endpoint = endpointMap[selected.item_type];
        if (!endpoint) { setItemDetail(null); return; }
        const res = await api.get(endpoint);
        setItemDetail(res.data);
      } catch (err) {
        console.error("Failed to load item detail:", err);
        setItemDetail(null);
      } finally { setLoadingDetail(false); }
    };
    run();
  }, [selected?.id]);

  const globalStats = {
    pending:  stats.pending,
    approved: stats.approved,
    rejected: stats.rejected,
  };

  const applyStatusUpdate = (id, newStatus, extra = {}) => {
    const patch = { status: newStatus, ...extra };
    setItems(prev    => prev.map(i => i.id === id ? { ...i, ...patch } : i));
    setAllItems(prev => prev.map(i => i.id === id ? { ...i, ...patch } : i));
    setSelected(prev => prev?.id === id ? { ...prev, ...patch } : prev);

    setStats(prev => {
      const oldStatus = allItems.find(i => i.id === id)?.status;
      if (!oldStatus || oldStatus === newStatus) return prev;
      const next = { ...prev };
      const dec = (k) => { next[k] = Math.max(0, (next[k] ?? 0) - 1); };
      const inc = (k) => { next[k] = (next[k] ?? 0) + 1; };
      dec(oldStatus.toLowerCase());
      inc(newStatus.toLowerCase());
      return next;
    });
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
    } finally { setLoadingAction(false); }
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
    } finally { setLoadingAction(false); }
  };

  const handleStatCardClick = (statusKey) => {
    setActiveStatusFilter(prev => prev === statusKey ? "All" : statusKey);
  };

  const openModelViewer = (mode, d, sel) => {
    closeDetail();
    setTimeout(() => {
      setModelViewer({
        modelSrc:    d.model_src,
        model3d:     d.model_3d,
        iosSrc:      d?.ios_src ?? undefined,
        productName: d?.name || sel?.title || "",
        price:       d?.price,
        variants:    d?.colors?.map(name => ({ name, color: PRESET_HEX[name] ?? "#d1d5db" })),
        mode,
      });
      setViewerVisible(true);
    }, 280);
  };

  const isFinal = selected?.status === "Approved" || selected?.status === "Rejected";

  // ── typeCount: "Products" includes Products + Products_Delete
  //              "Campaigns" includes Campaigns + Campaigns_Delete
  const typeCount = (type) => {
    if (type === "Products") {
      return allItems.filter(i => i.item_type === "Products" || i.item_type === "Products_Delete").length;
    }
    if (type === "Campaigns") {
      return allItems.filter(i => i.item_type === "Campaigns" || i.item_type === "Campaigns_Delete").length;
    }
    return allItems.filter(i => i.item_type === type).length;
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        .val-page  { display:flex; min-height:100vh; background:#f8fafc; font-family:'Inter','Segoe UI',sans-serif; }
        .val-main  { flex:1; overflow-y:auto; min-width:0; }
        .val-inner { padding:24px 28px 48px; max-width:860px; margin:0 auto; display:flex; flex-direction:column; gap:20px; }

        .val-stats-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:14px; }
        .val-stat-card  {
          background:#fff; border-radius:16px; border:1.5px solid #f1f5f9;
          box-shadow:0 1px 4px rgba(0,0,0,0.06); padding:16px 20px;
          display:flex; align-items:center; gap:14px; cursor:pointer;
          transition:box-shadow .18s, transform .18s, border-color .18s; user-select:none;
        }
        .val-stat-card:hover { box-shadow:0 6px 18px rgba(0,0,0,0.1); transform:translateY(-2px); }
        .val-stat-icon { width:44px; height:44px; border-radius:13px; display:flex; align-items:center; justify-content:center; font-size:20px; flex-shrink:0; }

        .val-filter-bar { display:flex; gap:8px; flex-wrap:wrap; }
        .val-filter-btn {
          padding:7px 18px; border-radius:99px; font-size:13px; font-weight:600;
          border:1.5px solid #e2e8f0; cursor:pointer; background:#fff; color:#64748b;
          font-family:inherit; transition:background .2s, color .2s, border-color .2s;
        }
        .val-filter-btn.active { background:#0f172a; color:#fff; border-color:#0f172a; }
        .val-filter-btn:not(.active):hover { border-color:#6366f1; color:#6366f1; }

        .val-list        { background:#fff; border-radius:16px; border:1px solid #f1f5f9; box-shadow:0 1px 3px rgba(0,0,0,0.06); overflow:hidden; }
        .val-list-header { display:flex; justify-content:space-between; align-items:center; padding:16px 20px; border-bottom:1px solid #f1f5f9; flex-wrap:wrap; gap:8px; }
        .val-item        { display:flex; align-items:center; gap:14px; padding:15px 20px; cursor:pointer; border-left:3px solid transparent; border-bottom:1px solid #f8fafc; transition:background .15s, border-color .15s; }
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

        .val-overlay {
          position:fixed; inset:0;
          background:rgba(15,23,42,0);
          backdrop-filter:blur(0px) saturate(1);
          z-index:1000;
          display:flex; align-items:center; justify-content:center; padding:20px;
          transition: background 260ms ease, backdrop-filter 260ms ease;
        }
        .val-overlay[data-shown="true"] {
          background:rgba(15,23,42,0.52);
          backdrop-filter:blur(5px) saturate(1.4);
        }

        .val-modal {
          background:#fff; border-radius:22px;
          box-shadow:0 32px 80px rgba(0,0,0,0.22);
          width:100%; max-width:680px; max-height:90vh;
          overflow-y:auto; position:relative; display:flex; flex-direction:column;
          opacity:0;
          transform:translateY(28px) scale(0.975);
          transition: opacity 260ms cubic-bezier(.22,1,.36,1),
                      transform 260ms cubic-bezier(.22,1,.36,1);
        }
        .val-overlay[data-shown="true"] .val-modal {
          opacity:1;
          transform:translateY(0) scale(1);
        }

        .val-hero             { width:100%; height:220px; object-fit:cover; border-radius:22px 22px 0 0; display:block; background:#f1f5f9; }
        .val-hero-placeholder { width:100%; height:180px; background:linear-gradient(135deg,#1e1b4b,#312e81); border-radius:22px 22px 0 0; display:flex; align-items:center; justify-content:center; font-size:56px; }
        .val-hero-placeholder.campaign { background:linear-gradient(135deg,#78350f,#92400e); }
        .val-hero-placeholder.campaign-delete { background:linear-gradient(135deg,#7f1d1d,#991b1b); }
        .val-hero-placeholder.product-delete  { background:linear-gradient(135deg,#7f1d1d,#b91c1c); }
        .val-modal-body   { padding:26px 28px 0; display:flex; flex-direction:column; gap:18px; }
        .val-modal-footer { padding:20px 28px 26px; display:flex; gap:12px; border-top:1px solid #f1f5f9; margin-top:20px; }
        .val-modal-close  {
          position:absolute; top:14px; right:14px;
          background:rgba(255,255,255,0.92); border:none; border-radius:50%;
          width:36px; height:36px; display:flex; align-items:center; justify-content:center;
          cursor:pointer; color:#64748b; box-shadow:0 2px 8px rgba(0,0,0,0.12); z-index:10;
          transition:background .15s, color .15s;
        }
        .val-modal-close:hover { background:#fff; color:#0f172a; }
        .val-detail-grid  { display:grid; grid-template-columns:1fr 1fr; gap:10px; }
        .val-detail-cell  { background:#f8fafc; border:1px solid #f1f5f9; border-radius:12px; padding:13px 15px; }
        .val-section-label { font-size:10px; font-weight:800; color:#94a3b8; text-transform:uppercase; letter-spacing:.07em; margin:0 0 6px; display:flex; align-items:center; gap:4px; }
        .val-cell-value   { margin:0; font-size:13px; font-weight:600; color:#1e293b; }
        .val-img-strip    { display:flex; gap:8px; flex-wrap:wrap; }
        .val-img-thumb    { width:72px; height:72px; border-radius:10px; object-fit:cover; border:1.5px solid #e2e8f0; background:#f1f5f9; }
        .val-color-strip  { display:flex; gap:6px; flex-wrap:wrap; align-items:center; }
        .val-color-chip   { display:flex; align-items:center; gap:5px; background:#f8fafc; border:1px solid #e2e8f0; border-radius:20px; padding:3px 9px 3px 5px; font-size:12px; font-weight:500; color:#475569; }
        .val-textarea     { width:100%; padding:12px 14px; border:1.5px solid #e2e8f0; border-radius:12px; font-size:13px; font-family:inherit; resize:vertical; outline:none; min-height:88px; background:#f8fafc; color:#0f172a; box-sizing:border-box; transition:border-color .2s, background .2s; }
        .val-textarea:focus { border-color:#6366f1; background:#fff; }
        .val-btn-approve  { flex:1; background:#10b981; color:#fff; border:none; border-radius:12px; padding:13px; font-size:14px; font-weight:700; cursor:pointer; font-family:inherit; transition:background .18s; display:flex; align-items:center; justify-content:center; gap:6px; }
        .val-btn-approve:hover:not(:disabled) { background:#059669; }
        .val-btn-reject   { flex:1; background:#fff; color:#dc2626; border:1.5px solid #fecaca; border-radius:12px; padding:13px; font-size:14px; font-weight:700; cursor:pointer; font-family:inherit; transition:background .18s, border-color .18s; display:flex; align-items:center; justify-content:center; gap:6px; }
        .val-btn-reject:hover:not(:disabled) { background:#fff1f2; border-color:#fca5a5; }
        .val-btn-approve:disabled,.val-btn-reject:disabled { opacity:0.6; cursor:not-allowed; }

        .val-model-launch-row { display:flex; gap:10px; flex-wrap:wrap; }
        .val-model-launch-btn {
          display:inline-flex; align-items:center; gap:8px;
          padding:12px 24px; border-radius:13px;
          font-size:13px; font-weight:800; font-family:inherit;
          cursor:pointer; border:2px solid transparent;
          transition:background .22s, color .22s, border-color .22s, box-shadow .22s, transform .22s;
        }
        .val-model-launch-btn.btn-3d  { background:#f5f3ff; color:#7c3aed; border-color:#ddd6fe; }
        .val-model-launch-btn.btn-3d:hover { background:#4c1d95; color:#fff; border-color:#4c1d95; box-shadow:0 6px 20px rgba(124,58,237,0.35); transform:translateY(-2px); }
        .val-model-launch-btn.btn-ar  { background:#ecfdf5; color:#059669; border-color:#6ee7b7; }
        .val-model-launch-btn.btn-ar:hover { background:#065f46; color:#fff; border-color:#065f46; box-shadow:0 6px 20px rgba(5,150,105,0.35); transform:translateY(-2px); }

        .val-campaign-divider { height:1px; background:linear-gradient(to right,transparent,#e2e8f0,transparent); margin:4px 0; }

        .val-viewer-overlay {
          position:fixed; inset:0;
          background:rgba(5,7,20,0);
          backdrop-filter:blur(0px);
          z-index:1100;
          display:flex; flex-direction:column; align-items:stretch; justify-content:flex-start;
          transition: background 300ms ease, backdrop-filter 300ms ease;
        }
        .val-viewer-overlay[data-shown="true"] { background:rgba(5,7,20,0.96); backdrop-filter:blur(14px); }
        .val-viewer-topbar {
          flex-shrink:0; display:flex; align-items:center; justify-content:space-between;
          padding:14px 20px;
          background:linear-gradient(to bottom,rgba(5,7,20,0.85) 0%,transparent 100%);
          position:relative; z-index:10;
          opacity:0; transform:translateY(16px);
          transition: opacity 300ms cubic-bezier(.22,1,.36,1), transform 300ms cubic-bezier(.22,1,.36,1);
        }
        .val-viewer-overlay[data-shown="true"] .val-viewer-topbar { opacity:1; transform:translateY(0); }
        .val-viewer-body {
          flex:1; display:flex; align-items:center; justify-content:center;
          padding:0 20px 20px; min-height:0;
          opacity:0; transform:translateY(22px);
          transition: opacity 320ms cubic-bezier(.22,1,.36,1) 50ms, transform 320ms cubic-bezier(.22,1,.36,1) 50ms;
        }
        .val-viewer-overlay[data-shown="true"] .val-viewer-body { opacity:1; transform:translateY(0); }
        .val-viewer-back-btn { display:inline-flex; align-items:center; gap:7px; padding:8px 18px; border-radius:99px; font-size:13px; font-weight:700; font-family:inherit; background:rgba(255,255,255,0.1); color:#fff; border:1.5px solid rgba(255,255,255,0.2); cursor:pointer; backdrop-filter:blur(6px); transition:background .18s, border-color .18s; }
        .val-viewer-back-btn:hover { background:rgba(255,255,255,0.2); border-color:rgba(255,255,255,0.45); }
        .val-viewer-title { font-size:14px; font-weight:700; color:rgba(255,255,255,0.7); letter-spacing:.02em; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:260px; }
        .val-viewer-close-btn { width:38px; height:38px; border-radius:50%; border:none; background:rgba(255,255,255,0.1); color:rgba(255,255,255,0.75); display:flex; align-items:center; justify-content:center; cursor:pointer; transition:background .18s, color .18s; }
        .val-viewer-close-btn:hover { background:rgba(255,255,255,0.22); color:#fff; }
        .val-viewer-inner { width:100%; max-width:800px; height:100%; display:flex; align-items:center; justify-content:center; }

        @media(max-width:640px){
          .val-inner{padding:14px 10px 32px;gap:14px}
          .val-stats-grid{gap:8px}
          .val-modal{border-radius:16px}
          .val-modal-body{padding:18px 14px 0}
          .val-modal-footer{padding:14px}
          .val-detail-grid{grid-template-columns:1fr}
          .val-item{padding:12px 14px}
          .val-hero{height:160px}
          .val-viewer-title{max-width:120px}
          .val-model-launch-btn{padding:10px 16px;font-size:12px}
        }
        @media(max-width:420px){.val-stats-grid{grid-template-columns:1fr}}
      `}</style>

      <div className="val-page">
        <Sidebar openBar={openBar} setOpenBar={setOpenBar} links={adminLinks}
          title="AdminCore" subtitle="Enterprise Suite" role="Super Admin" profilePath="/admin-dash/profile" />

        <main className="val-main">
          <Header concept="Validation" setOpenBar={setOpenBar} openBar={openBar} />

          <div className="val-inner">

            {/* ── Stat Cards ── */}
            <div className="val-stats-grid">
              {STAT_CARDS.map(s => {
                const isActive = activeStatusFilter === s.key;
                return (
                  <div
                    key={s.key}
                    className="val-stat-card"
                    onClick={() => handleStatCardClick(s.key)}
                    style={isActive ? { borderColor:s.activeBorder, boxShadow:s.activeShadow, transform:"translateY(-2px)" } : {}}
                    title={isActive ? `Click to clear ${s.key} filter` : `Show only ${s.key}`}
                  >
                    <div className="val-stat-icon" style={{ background:s.iconBg }}>{s.icon}</div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <p style={{ margin:"0 0 2px", fontSize:11, color:"#94a3b8", textTransform:"uppercase", letterSpacing:".07em", fontWeight:700 }}>{s.label}</p>
                      <p style={{ margin:0, fontSize:26, fontWeight:800, color:s.clr, letterSpacing:"-0.02em", lineHeight:1 }}>
                        {loadingAll ? "—" : globalStats[s.countKey]}
                      </p>
                    </div>
                    {isActive && (
                      <span style={{ width:8, height:8, borderRadius:"50%", background:s.clr, flexShrink:0, boxShadow:`0 0 0 2px ${s.activeBorder}` }} />
                    )}
                  </div>
                );
              })}
            </div>

            {/* ── Filter Bar ── */}
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              <div className="val-filter-bar">
                {filters.map(f => (
                  <button key={f} className={`val-filter-btn${activeFilter === f ? " active" : ""}`} onClick={() => setActiveFilter(f)}>
                    {f}
                    {f !== "All" && <span style={{ marginLeft:6, opacity:0.6 }}>({typeCount(f)})</span>}
                  </button>
                ))}
              </div>
              {activeStatusFilter !== "All" && (() => {
                const sc = STAT_CARDS.find(s => s.key === activeStatusFilter);
                return (
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <span style={{ fontSize:12, color:"#94a3b8", fontWeight:600 }}>Filtered by status:</span>
                    <button
                      onClick={() => setActiveStatusFilter("All")}
                      style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"4px 12px", borderRadius:99, fontSize:12, fontWeight:700, background:sc?.iconBg, color:sc?.clr, border:`1.5px solid ${sc?.activeBorder}`, cursor:"pointer", fontFamily:"inherit" }}
                    >{activeStatusFilter} <X size={11} /></button>
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
                    <span style={{ background:STAT_CARDS.find(s => s.key === activeStatusFilter)?.iconBg, color:STAT_CARDS.find(s => s.key === activeStatusFilter)?.clr, fontSize:11, fontWeight:700, borderRadius:99, padding:"3px 10px" }}>{activeStatusFilter}</span>
                  )}
                  <span style={{ background:"#f1f5f9", color:"#64748b", fontSize:12, fontWeight:600, borderRadius:99, padding:"3px 10px" }}>
                    {items.length} {activeFilter === "All" ? "Total" : activeFilter}
                  </span>
                </div>
              </div>

              {loadingList ? (
                <div className="val-loading"><Loader2 size={18} className="val-spin" /> Loading queue…</div>
              ) : error ? (
                <div className="val-error">
                  {error}<br />
                  <button onClick={fetchList} style={{ marginTop:10, padding:"6px 16px", borderRadius:8, border:"1px solid #fecaca", background:"#fff1f2", color:"#dc2626", cursor:"pointer", fontWeight:600 }}>Retry</button>
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
                    <div key={item.id} className="val-item" onClick={() => openDetail(item)}>
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
                        <p style={{ margin:0, fontSize:12, color:"#94a3b8" }}>By {item.user || "—"} · #{item.id}</p>
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

      {/* ══════════════════════════════════════════════════════════════════════
          DETAIL MODAL
      ══════════════════════════════════════════════════════════════════════ */}
      <AnimatedModal
        visible={detailVisible}
        duration={260}
        overlayClass="val-overlay"
        onOverlayClick={(e) => { if (e.target === e.currentTarget) closeDetail(); }}
        onExited={() => { setSelected(null); setItemDetail(null); }}
      >
        {selected && (() => {
          const ss = STATUS_STYLE[selected.status] || STATUS_STYLE.Pending;
          const ts = TYPE_STYLE[selected.item_type] || { bg:"#f8fafc", color:"#64748b" };
          const d  = itemDetail;

          const isCampaign       = selected.item_type === "Campaigns" || selected.item_type === "Campaigns_Delete";
          const isProductDelete  = selected.item_type === "Products_Delete";
          const isARType         = selected.item_type === "AR";
          const is3DType         = selected.item_type === "3D";
          const isProduct        = selected.item_type === "Products";

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

          const hasModelFile = !!(d?.model_3d || d?.model_src);
          const show3DBtn = hasModelFile && (is3DType ? true : isARType ? false : !!(d?.able_3d || d?.valid_3d));
          const showARBtn = hasModelFile && (isARType ? true : is3DType ? false : !!(d?.able_ar || d?.valid_ar));
          const showFallback3D = isProduct && hasModelFile && !show3DBtn && !showARBtn;
          const forceViewer = isARType || is3DType;
          const showViewer  = forceViewer || (isProduct && hasModelFile);

          const campaignHeroClass = selected.item_type === "Campaigns_Delete"
            ? "val-hero-placeholder campaign-delete"
            : "val-hero-placeholder campaign";

          return (
            <div className="val-modal">
              <button className="val-modal-close" onClick={closeDetail}><X size={16} /></button>

              {/* Hero */}
              {!isCampaign && !isProductDelete && (
                loadingDetail ? (
                  <div className="val-hero-placeholder">
                    <Loader2 size={32} className="val-spin" style={{ color:"rgba(255,255,255,0.6)" }} />
                  </div>
                ) : primaryImg && !forceViewer ? (
                  <img src={primaryImg} alt={d?.name || selected.title} className="val-hero" />
                ) : (
                  <div className="val-hero-placeholder">
                    <span>{TYPE_ICON[selected.item_type] || "📄"}</span>
                  </div>
                )
              )}

              {/* Products_Delete hero */}
              {isProductDelete && (
                <div className="val-hero-placeholder product-delete" style={{ height: 100, fontSize: 44 }}>
                  <span>🗑️</span>
                </div>
              )}

              {/* Campaigns hero */}
              {isCampaign && (
                <div className={campaignHeroClass} style={{ height: 100, fontSize: 44 }}>
                  <span>{selected.item_type === "Campaigns_Delete" ? "🗑️" : "📣"}</span>
                </div>
              )}

              {/* Body */}
              <div className="val-modal-body">

                {/* Common header */}
                <div style={{ display:"flex", gap:12, alignItems:"flex-start", paddingRight:8 }}>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:"flex", gap:8, alignItems:"center", marginBottom:6, flexWrap:"wrap" }}>
                      <span className="val-type-tag" style={{ background:ts.bg, color:ts.color, marginBottom:0 }}>{selected.item_type}</span>
                      <span style={{ background:ss.bg, color:ss.color, padding:"3px 10px", borderRadius:99, fontSize:11, fontWeight:700, display:"inline-flex", alignItems:"center", gap:4 }}>
                        <span style={{ width:5, height:5, borderRadius:"50%", background:ss.dot, display:"inline-block" }} />
                        {selected.status}
                      </span>
                    </div>
                    <h2 style={{ margin:"0 0 3px", fontSize:20, fontWeight:800, color:"#0f172a", letterSpacing:"-0.02em", lineHeight:1.25 }}>
                      {d?.name || selected.title}
                    </h2>
                    <p style={{ margin:0, fontSize:12, color:"#94a3b8", fontFamily:"monospace" }}>
                      V-{String(selected.id).padStart(3,"0")} · Submitted by {selected.user || "Unknown"}
                    </p>
                  </div>
                </div>

                {/* ── Products_Delete detail ── */}
                {isProductDelete && (
                  <>
                    <div className="val-campaign-divider" />
                    {loadingDetail ? (
                      <div style={{ display:"flex", alignItems:"center", gap:8, color:"#94a3b8", fontSize:13 }}>
                        <Loader2 size={15} className="val-spin" /> Loading product details…
                      </div>
                    ) : d ? (
                      <ProductDeleteDetail d={d} selected={selected} />
                    ) : (
                      <div style={{ padding:"14px 16px", background:"#fff1f2", border:"1px solid #fecaca", borderRadius:12 }}>
                        <p style={{ margin:0, fontSize:13, color:"#dc2626", fontWeight:600 }}>⚠️ Could not load product details.</p>
                      </div>
                    )}
                    <div className="val-campaign-divider" />
                  </>
                )}

                {/* ── Campaign detail ── */}
                {isCampaign && (
                  <>
                    <div className="val-campaign-divider" />
                    {loadingDetail ? (
                      <div style={{ display:"flex", alignItems:"center", gap:8, color:"#94a3b8", fontSize:13 }}>
                        <Loader2 size={15} className="val-spin" /> Loading campaign details…
                      </div>
                    ) : d ? (
                      <CampaignDetail d={d} selected={selected} />
                    ) : (
                      <div style={{ padding:"14px 16px", background:"#fff1f2", border:"1px solid #fecaca", borderRadius:12 }}>
                        <p style={{ margin:0, fontSize:13, color:"#dc2626", fontWeight:600 }}>⚠️ Could not load campaign details.</p>
                      </div>
                    )}
                    <div className="val-campaign-divider" />
                  </>
                )}

                {/* ── Regular product / AR / 3D sections ── */}
                {!isCampaign && !isProductDelete && (
                  <>
                    {!loadingDetail && showViewer && (
                      <div>
                        <p className="val-section-label" style={{ marginBottom:10 }}>{forceViewer ? "Model Preview" : "3D / AR Preview"}</p>
                        {hasModelFile ? (
                          <div className="val-model-launch-row">
                            {show3DBtn    && <button className="val-model-launch-btn btn-3d" onClick={() => openModelViewer("3d", d, selected)}><span style={{ fontSize:20 }}>🧊</span> View 3D Model</button>}
                            {showARBtn    && <button className="val-model-launch-btn btn-ar" onClick={() => openModelViewer("ar", d, selected)}><span style={{ fontSize:20 }}>🥽</span> View in AR</button>}
                            {showFallback3D && <button className="val-model-launch-btn btn-3d" onClick={() => openModelViewer("3d", d, selected)}><span style={{ fontSize:20 }}>🧊</span> View 3D Model</button>}
                          </div>
                        ) : (
                          <div style={{ padding:"14px 16px", background:"#fff1f2", border:"1px solid #fecaca", borderRadius:12 }}>
                            <p style={{ margin:0, fontSize:13, color:"#dc2626", fontWeight:600 }}>⚠️ No model file found on this product.</p>
                            <p style={{ margin:"4px 0 0", fontSize:12, color:"#94a3b8" }}>model_3d / model_src is not set.</p>
                          </div>
                        )}
                      </div>
                    )}

                    {!loadingDetail && !forceViewer && extraImgs.length > 0 && (
                      <div>
                        <p className="val-section-label">More Images</p>
                        <div className="val-img-strip">
                          {extraImgs.map((url, i) => (
                            <img key={i} src={`http://127.0.0.1:8000/${url}`} alt={`img-${i+2}`} className="val-img-thumb" />
                          ))}
                        </div>
                      </div>
                    )}

                    {!forceViewer && d?.description && (
                      <div>
                        <p className="val-section-label"><AlignLeft size={10} /> Description</p>
                        <p style={{ margin:0, fontSize:13, color:"#475569", lineHeight:1.6, background:"#f8fafc", border:"1px solid #f1f5f9", borderRadius:12, padding:"12px 14px" }}>
                          {d.description}
                        </p>
                      </div>
                    )}

                    {!loadingDetail && (
                      <div className="val-detail-grid">
                        {!forceViewer && d?.category && (
                          <div className="val-detail-cell">
                            <p className="val-section-label"><Tag size={10} /> Category</p>
                            <p className="val-cell-value" style={{ textTransform:"capitalize" }}>{d.category}</p>
                          </div>
                        )}
                        {!forceViewer && stockLabel && (
                          <div className="val-detail-cell">
                            <p className="val-section-label"><Layers size={10} /> Stock</p>
                            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                              <p className="val-cell-value">{d.quantity} units</p>
                              <span style={{ background:stockBg, color:stockColor, fontSize:10, fontWeight:700, padding:"2px 8px", borderRadius:99 }}>{stockLabel}</span>
                            </div>
                          </div>
                        )}
                        <div className="val-detail-cell">
                          <p className="val-section-label"><Calendar size={10} /> Submitted</p>
                          <p className="val-cell-value" style={{ fontFamily:"monospace", fontSize:12 }}>
                            {selected.submitted_at ? new Date(selected.submitted_at).toLocaleString("en-GB", { dateStyle:"medium", timeStyle:"short" }) : "—"}
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
                      </div>
                    )}

                    {!loadingDetail && !forceViewer && d?.colors?.length > 0 && (
                      <div>
                        <p className="val-section-label"><Palette size={10} /> Colors</p>
                        <div className="val-color-strip">
                          {d.colors.map(name => (
                            <span key={name} className="val-color-chip"><ColorDot name={name} /> {name}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {loadingDetail && (
                      <div style={{ display:"flex", alignItems:"center", gap:8, color:"#94a3b8", fontSize:13 }}>
                        <Loader2 size={15} className="val-spin" /> Loading details…
                      </div>
                    )}
                  </>
                )}

                {/* Rejection note */}
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

              {/* Footer */}
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
          );
        })()}
      </AnimatedModal>

      {/* ── Model Viewer Modal ── */}
      <AnimatedModal
        visible={viewerVisible}
        duration={300}
        overlayClass="val-viewer-overlay"
        onOverlayClick={(e) => { if (e.target === e.currentTarget) closeViewer(); }}
        onExited={() => setModelViewer(null)}
      >
        <div className="val-viewer-topbar">
          <button className="val-viewer-back-btn" onClick={closeViewer}><ArrowLeft size={14} /> Back to details</button>
          <span className="val-viewer-title">{modelViewer?.mode === "ar" ? "🥽" : "🧊"} {modelViewer?.productName}</span>
          <button className="val-viewer-close-btn" onClick={closeViewer}><X size={16} /></button>
        </div>
        <div className="val-viewer-body">
          <div className="val-viewer-inner">
            {modelViewer?.modelSrc ? (
              <ProductViewer
                modelSrc={modelViewer.modelSrc}
                model3d={modelViewer.model3d}
                iosSrc={modelViewer.iosSrc}
                productName={modelViewer.productName}
                price={modelViewer.price}
                variants={modelViewer.variants}
              />
            ) : (
              <div style={{ textAlign:"center", color:"rgba(255,255,255,0.55)" }}>
                <p style={{ fontSize:44, margin:"0 0 14px" }}>⚠️</p>
                <p style={{ fontSize:16, fontWeight:700, margin:"0 0 6px", color:"rgba(255,255,255,0.8)" }}>No model file found</p>
                <p style={{ fontSize:13, margin:0 }}>model_3d / model_src is not set on this product.</p>
              </div>
            )}
          </div>
        </div>
      </AnimatedModal>
    </>
  );
}