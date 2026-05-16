/**
 * ConfigurationPage.jsx — System Configuration (Admin)
 *
 * Changes from previous version:
 *  • Product cards show the real product image (product.image_url).
 *    Falls back to a clean placeholder with the product initial if no URL.
 *
 *  • "View AR" modal requests camera permission via getUserMedia and
 *    renders the live camera feed as the AR background. Shows a
 *    permission-request screen first, then an error state if denied.
 */

import Header  from "../ui/Header";
import Sidebar from "../ui/Sidebar";
import { useState, useEffect, useRef } from "react";
import { useConfig } from "../../context/ConfigContext";
import {
  LayoutDashboard, Users, MessageSquare, CheckSquare,
  BarChart, Activity, Settings, Loader2, X,
  SlidersHorizontal, Scan, Camera, CameraOff,
} from "lucide-react";

const BASE = "http://127.0.0.1:8000";
const img = (path) => (path ? `${BASE}/${path}` : null);

// ─── Admin nav links ──────────────────────────────────────────────────────
const ADMIN_LINKS = [
  { to: "/admin-dash",               label: "Dashboard",     icon: <LayoutDashboard size={18} />, end: true },
  { to: "/admin-dash/accounts",      label: "Accounts",      icon: <Users size={18} /> },
  { to: "/admin-dash/complaints",    label: "Complaints",    icon: <MessageSquare size={18} /> },
  { to: "/admin-dash/reports",       label: "Reports",       icon: <BarChart size={18} /> },
  { to: "/admin-dash/engagement",    label: "Engagement",    icon: <Activity size={18} /> },
  { to: "/admin-dash/configuration", label: "Configuration", icon: <Settings size={18} /> },
  { to: "/admin-dash/validation",    label: "Validation",    icon: <CheckSquare size={18} /> },
];

// ─── Toggle switch ────────────────────────────────────────────────────────
function Toggle({ on, onToggle, disabled, size = "md" }) {
  const w   = size === "lg" ? 56 : 46;
  const h   = size === "lg" ? 30 : 26;
  const d   = size === "lg" ? 24 : 20;
  const onL = size === "lg" ? 27 : 22;
  const pad = (h - d) / 2;
  return (
    <button
      onClick={onToggle} aria-checked={on} role="switch" disabled={disabled}
      style={{
        width: w, height: h, borderRadius: 99,
        cursor: disabled ? "not-allowed" : "pointer",
        border: "none",
        background: on ? "#6366f1" : "#e2e8f0",
        position: "relative", transition: "background .2s",
        flexShrink: 0, padding: 0,
        opacity: disabled ? 0.5 : 1,
        boxShadow: on && !disabled ? "0 0 0 3px rgba(99,102,241,.25)" : "none",
      }}
    >
      <span style={{
        position: "absolute", top: pad, left: on ? onL : pad,
        width: d, height: d, borderRadius: "50%",
        background: "#fff", transition: "left .2s",
        boxShadow: "0 1px 4px rgba(0,0,0,.2)", display: "block",
      }} />
    </button>
  );
}

// ─── Error toast ──────────────────────────────────────────────────────────
function ErrorToast({ message, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 5000); return () => clearTimeout(t); }, [onClose]);
  return (
    <div style={{
      position:"fixed", bottom:24, right:24, zIndex:9999,
      background:"#fef2f2", border:"1px solid #fecaca",
      borderRadius:14, padding:"14px 18px",
      display:"flex", alignItems:"center", gap:12,
      boxShadow:"0 8px 30px rgba(0,0,0,0.12)",
      maxWidth:400, animation:"slideUp .2s ease",
    }}>
      <span style={{ fontSize:18 }}>⚠️</span>
      <p style={{ margin:0, fontSize:13, color:"#dc2626", fontWeight:600, flex:1 }}>{message}</p>
      <button onClick={onClose} style={{ background:"none",border:"none",cursor:"pointer",color:"#dc2626" }}>
        <X size={16}/>
      </button>
    </div>
  );
}

// ─── AR Badge ─────────────────────────────────────────────────────────────
function ARBadge({ ableAr, arOn }) {
  let label, bg, color;
  if (!arOn)              { label="Global OFF"; bg="#fff7ed"; color="#ea580c"; }
  else if (ableAr===true) { label="AR Active";  bg="#eef2ff"; color="#6366f1"; }
  else if (ableAr===false){ label="AR Off";     bg="#fff7ed"; color="#ea580c"; }
  else                    { label="AR Hidden";  bg="#f8fafc"; color="#94a3b8"; }
  return (
    <span style={{
      fontSize:10, fontWeight:800, letterSpacing:.5,
      padding:"3px 10px", borderRadius:99,
      background:bg, color, textTransform:"uppercase", whiteSpace:"nowrap",
    }}>{label}</span>
  );
}

// ─── Product Thumbnail ────────────────────────────────────────────────────
// Shows the real product image. Falls back to an initial-based placeholder.
function ProductThumbnail({ product }) {
  const [imgError, setImgError] = useState(false);

  if (product.image && !imgError) {
    return (
      <div style={{ height:150, borderRadius:"14px 14px 0 0", overflow:"hidden", background:"#f1f5f9" }}>
        <img
          src={img(product.image)}
          alt={product.name}
          onError={() => setImgError(true)}
          style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }}
        />
      </div>
    );
  }

  // Placeholder: gradient bg + product initial letter
  const initial = (product.name || "?")[0].toUpperCase();
  return (
    <div style={{
      height:150, borderRadius:"14px 14px 0 0",
      background:"linear-gradient(145deg,#e0e7ff 0%,#c7d2fe 100%)",
      display:"flex", flexDirection:"column",
      alignItems:"center", justifyContent:"center", gap:8,
    }}>
      <div style={{
        width:56, height:56, borderRadius:"50%",
        background:"rgba(99,102,241,0.15)",
        border:"2px solid rgba(99,102,241,0.3)",
        display:"flex", alignItems:"center", justifyContent:"center",
        fontSize:24, fontWeight:800, color:"#6366f1",
      }}>
        {initial}
      </div>
      <span style={{
        fontSize:9, fontWeight:700, color:"#6366f1",
        letterSpacing:1.2, textTransform:"uppercase",
        background:"rgba(255,255,255,0.7)",
        padding:"2px 10px", borderRadius:99,
      }}>
        {product.type || product.category || "Product"}
      </span>
    </div>
  );
}

// ─── AR Preview Modal (with real camera) ──────────────────────────────────
//
// States:
//   "prompt"   — show permission request screen
//   "loading"  — getUserMedia in progress
//   "active"   — camera stream running, show AR overlay
//   "denied"   — permission denied or error
//
function ARPreviewModal({ product, onClose }) {
  const [camState, setCamState] = useState("prompt"); // prompt | loading | active | denied
  const [errorMsg, setErrorMsg] = useState("");
  const videoRef  = useRef(null);
  const streamRef = useRef(null);

  // Stop camera stream on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  const requestCamera = async () => {
    setCamState("loading");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCamState("active");
    } catch (err) {
      const msg =
        err.name === "NotAllowedError"  ? "Camera access was denied. Please allow camera permission in your browser settings and try again."
        : err.name === "NotFoundError"  ? "No camera found on this device."
        : err.name === "NotReadableError" ? "Camera is already in use by another application."
        : `Camera error: ${err.message}`;
      setErrorMsg(msg);
      setCamState("denied");
    }
  };

  const handleClose = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    onClose();
  };

  return (
    <div style={{
      position:"fixed", inset:0, zIndex:10000,
      background:"rgba(0,0,0,0.92)",
      display:"flex", flexDirection:"column",
      alignItems:"center", justifyContent:"center",
      animation:"fadeIn .2s ease",
    }}>
      {/* Close button */}
      <button
        onClick={handleClose}
        style={{
          position:"absolute", top:20, right:20,
          background:"rgba(255,255,255,0.1)", border:"1px solid rgba(255,255,255,0.2)",
          borderRadius:99, width:38, height:38,
          display:"flex", alignItems:"center", justifyContent:"center",
          cursor:"pointer", color:"#fff", zIndex:10,
        }}
      ><X size={18}/></button>

      {/* ── PROMPT state ── */}
      {camState === "prompt" && (
        <div style={{ textAlign:"center", maxWidth:340, padding:"0 20px" }}>
          <div style={{
            width:80, height:80, borderRadius:"50%",
            background:"rgba(99,102,241,0.15)",
            border:"2px solid rgba(99,102,241,0.4)",
            display:"flex", alignItems:"center", justifyContent:"center",
            margin:"0 auto 20px",
          }}>
            <Camera size={36} color="#818cf8"/>
          </div>
          <p style={{ margin:"0 0 8px", color:"#fff", fontWeight:800, fontSize:20 }}>
            Camera Access Required
          </p>
          <p style={{ margin:"0 0 24px", color:"#94a3b8", fontSize:14, lineHeight:1.6 }}>
            To view <strong style={{ color:"#e2e8f0" }}>{product.name}</strong> in Augmented Reality,
            we need access to your camera. Your video is never stored or transmitted.
          </p>
          <button
            onClick={requestCamera}
            style={{
              padding:"12px 32px", borderRadius:12, border:"none",
              background:"linear-gradient(135deg,#6366f1,#818cf8)",
              color:"#fff", fontWeight:700, fontSize:15,
              cursor:"pointer", fontFamily:"inherit",
              boxShadow:"0 4px 16px rgba(99,102,241,0.4)",
              display:"flex", alignItems:"center", gap:8, margin:"0 auto",
            }}
          >
            <Camera size={16}/>
            Allow Camera &amp; View AR
          </button>
        </div>
      )}

      {/* ── LOADING state ── */}
      {camState === "loading" && (
        <div style={{ textAlign:"center" }}>
          <Loader2 size={40} color="#818cf8" style={{ animation:"spin .8s linear infinite", marginBottom:16 }}/>
          <p style={{ color:"#94a3b8", fontSize:14, margin:0 }}>Starting camera…</p>
        </div>
      )}

      {/* ── DENIED state ── */}
      {camState === "denied" && (
        <div style={{ textAlign:"center", maxWidth:340, padding:"0 20px" }}>
          <div style={{
            width:80, height:80, borderRadius:"50%",
            background:"rgba(239,68,68,0.12)",
            border:"2px solid rgba(239,68,68,0.3)",
            display:"flex", alignItems:"center", justifyContent:"center",
            margin:"0 auto 20px",
          }}>
            <CameraOff size={36} color="#f87171"/>
          </div>
          <p style={{ margin:"0 0 8px", color:"#fff", fontWeight:800, fontSize:20 }}>
            Camera Unavailable
          </p>
          <p style={{ margin:"0 0 24px", color:"#94a3b8", fontSize:14, lineHeight:1.6 }}>
            {errorMsg}
          </p>
          <button
            onClick={requestCamera}
            style={{
              padding:"11px 28px", borderRadius:12, border:"1.5px solid rgba(99,102,241,0.4)",
              background:"rgba(99,102,241,0.1)",
              color:"#a5b4fc", fontWeight:700, fontSize:14,
              cursor:"pointer", fontFamily:"inherit",
              display:"flex", alignItems:"center", gap:8, margin:"0 auto",
            }}
          >
            Try Again
          </button>
        </div>
      )}

      {/* ── ACTIVE state — live camera + AR overlay ── */}
      {camState === "active" && (
        <div style={{ position:"relative", width:"min(420px,100vw)", height:"min(560px,80vh)", borderRadius:20, overflow:"hidden" }}>

          {/* Live camera feed */}
          <video
            ref={videoRef}
            autoPlay playsInline muted
            onLoadedMetadata={e => e.target.play()}
            style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }}
          />

          {/* Corner bracket viewfinder */}
          {[
            { top:16,    left:16,    borderTop:"3px solid #6366f1", borderLeft:"3px solid #6366f1" },
            { top:16,    right:16,   borderTop:"3px solid #6366f1", borderRight:"3px solid #6366f1" },
            { bottom:16, left:16,    borderBottom:"3px solid #6366f1", borderLeft:"3px solid #6366f1" },
            { bottom:16, right:16,   borderBottom:"3px solid #6366f1", borderRight:"3px solid #6366f1" },
          ].map((s, i) => (
            <div key={i} style={{ position:"absolute", width:28, height:28, borderRadius:3, ...s }}/>
          ))}

          {/* Scan line */}
          <div style={{
            position:"absolute", left:20, right:20,
            height:2,
            background:"linear-gradient(90deg,transparent,#6366f1,transparent)",
            animation:"arScan 2.4s ease-in-out infinite",
            borderRadius:1,
          }}/>

          {/* Product name overlay at bottom */}
          <div style={{
            position:"absolute", bottom:0, left:0, right:0,
            padding:"32px 20px 20px",
            background:"linear-gradient(transparent,rgba(0,0,0,0.75))",
          }}>
            {/* Product image thumbnail if available */}
            {product.image_url && (
              <div style={{
                width:52, height:52, borderRadius:10,
                overflow:"hidden", border:"2px solid rgba(255,255,255,0.3)",
                marginBottom:10,
              }}>
                <img src={product.image_url} alt={product.name}
                  style={{ width:"100%", height:"100%", objectFit:"cover" }}/>
              </div>
            )}
            <p style={{ margin:0, color:"#fff", fontWeight:800, fontSize:17 }}>{product.name}</p>
            <p style={{ margin:"3px 0 10px", color:"rgba(255,255,255,0.6)", fontSize:12 }}>
              {product.type || product.category || "—"}
            </p>
            <div style={{
              display:"inline-flex", alignItems:"center", gap:7,
              background:"rgba(99,102,241,0.2)", border:"1px solid rgba(99,102,241,0.4)",
              borderRadius:99, padding:"6px 14px",
            }}>
              <div style={{ width:7, height:7, borderRadius:"50%", background:"#6366f1", animation:"arPulse 1s infinite" }}/>
              <span style={{ color:"#a5b4fc", fontSize:11, fontWeight:700, letterSpacing:.5 }}>
                AR PREVIEW ACTIVE
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Configure drawer ─────────────────────────────────────────────────────
function ConfigureDrawer({ product, index, onClose }) {
  const { toggleProductAR, arLoading, arOn } = useConfig();
  const isOn    = Boolean(product.active) && arOn;
  const canEdit = arOn && !arLoading;

  return (
    <div style={{
      position:"absolute", inset:0, borderRadius:16,
      background:"rgba(15,23,42,0.97)",
      display:"flex", flexDirection:"column",
      padding:18, zIndex:10, animation:"fadeIn .15s ease",
    }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
        <div>
          <p style={{ margin:0, fontWeight:800, color:"#fff", fontSize:13 }}>{product.name}</p>
          <p style={{ margin:0, fontSize:10, color:"#64748b", textTransform:"uppercase", letterSpacing:.5 }}>
            {product.type || product.category}
          </p>
        </div>
        <button onClick={onClose} style={{ background:"none",border:"none",cursor:"pointer",color:"#64748b",padding:4 }}>
          <X size={17}/>
        </button>
      </div>

      {/* AR toggle */}
      <div style={{
        background:"rgba(255,255,255,0.06)", borderRadius:12,
        padding:"14px", display:"flex",
        justifyContent:"space-between", alignItems:"center", gap:12, marginBottom:10,
      }}>
        <div>
          <p style={{ margin:0, color:"#fff", fontWeight:700, fontSize:13 }}>AR Feature</p>
          <p style={{ margin:"3px 0 0", color:"#64748b", fontSize:11 }}>
            {!arOn ? "Global AR is currently disabled"
              : isOn ? "Augmented Reality is active"
              : "AR is off for this product"}
          </p>
        </div>
        <Toggle on={isOn} onToggle={() => toggleProductAR(index)} disabled={!canEdit}/>
      </div>

      {/* Details grid */}
      <div style={{ background:"rgba(255,255,255,0.04)", borderRadius:12, padding:12, flex:1 }}>
        <p style={{ margin:"0 0 8px", color:"#475569", fontSize:10, fontWeight:700, letterSpacing:1, textTransform:"uppercase" }}>
          Details
        </p>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:6 }}>
          {[
            ["ID",        `#${product.id}`],
            ["Category",  product.type || product.category || "—"],
            ["AR State",  product.able_ar === true ? "Active" : product.able_ar === false ? "Off" : "Hidden"],
            ["Validated", product.valid_ar !== undefined ? (product.valid_ar ? "✓ Yes" : "✗ No") : "—"],
          ].map(([k, v]) => (
            <div key={k} style={{ background:"rgba(255,255,255,0.04)", borderRadius:8, padding:"7px 10px" }}>
              <p style={{ margin:0, color:"#475569", fontSize:9, textTransform:"uppercase", letterSpacing:.5 }}>{k}</p>
              <p style={{ margin:"2px 0 0", color:"#e2e8f0", fontSize:12, fontWeight:600 }}>{v}</p>
            </div>
          ))}
        </div>
      </div>

      {arLoading && (
        <div style={{ display:"flex", alignItems:"center", gap:6, marginTop:10, color:"#818cf8", fontSize:12 }}>
          <Loader2 size={12} style={{ animation:"spin .8s linear infinite" }}/>
          Saving to database…
        </div>
      )}
    </div>
  );
}

// ─── Product card ─────────────────────────────────────────────────────────
function ProductCard({ product, index }) {
  const [configOpen, setConfigOpen] = useState(false);
  const [arOpen,     setArOpen]     = useState(false);
  const { arOn } = useConfig();

  const arAvailable = Boolean(product.able_ar) && arOn;

  return (
    <>
      <div
        style={{
          background:"#fff", borderRadius:16,
          border:"1px solid #f1f5f9",
          boxShadow:"0 1px 4px rgba(0,0,0,0.06)",
          overflow:"hidden", position:"relative",
          transition:"box-shadow .2s, transform .18s",
          display:"flex", flexDirection:"column",
        }}
        onMouseEnter={e => { e.currentTarget.style.boxShadow="0 8px 28px rgba(99,102,241,0.13)"; e.currentTarget.style.transform="translateY(-3px)"; }}
        onMouseLeave={e => { e.currentTarget.style.boxShadow="0 1px 4px rgba(0,0,0,0.06)";       e.currentTarget.style.transform="translateY(0)"; }}
      > 

        <ProductThumbnail product={product}/>

        <div style={{ padding:"13px 15px 15px", flex:1, display:"flex", flexDirection:"column" }}>
          {/* Name + badge */}
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:6, marginBottom:12 }}>
            <div style={{ minWidth:0 }}>
              <p style={{ margin:0, fontWeight:800, fontSize:14, color:"#0f172a", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
                {product.name}
              </p>
              <p style={{ margin:"2px 0 0", fontSize:11, color:"#94a3b8" }}>
                {product.type || product.category || "—"}
              </p>
            </div>
            <ARBadge ableAr={product.able_ar} arOn={arOn}/>
          </div>

          {/* Two-button row */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginTop:"auto" }}>

            {/* View AR */}
            <button
              onClick={() => arAvailable && setArOpen(true)}
              disabled={!arAvailable}
              title={!arAvailable ? "AR is not active for this product" : "Preview in AR"}
              style={{
                display:"flex", alignItems:"center", justifyContent:"center", gap:5,
                padding:"9px 0", borderRadius:10, fontSize:12, fontWeight:700,
                fontFamily:"inherit", cursor: arAvailable ? "pointer" : "not-allowed",
                border: "1.5px solid",
                borderColor: arAvailable ? "#6366f1" : "#e2e8f0",
                background:  arAvailable ? "#eef2ff" : "#f8fafc",
                color:        arAvailable ? "#6366f1" : "#cbd5e1",
                transition:"all .15s",
                opacity: arAvailable ? 1 : 0.6,
              }}
              onMouseEnter={e => { if (arAvailable) { e.currentTarget.style.background="#e0e7ff"; } }}
              onMouseLeave={e => { if (arAvailable) { e.currentTarget.style.background="#eef2ff"; } }}
            >
              <Scan size={13}/>
              View AR
            </button>

            {/* Configure */}
            <button
              onClick={() => setConfigOpen(true)}
              style={{
                display:"flex", alignItems:"center", justifyContent:"center", gap:5,
                padding:"9px 0", borderRadius:10, fontSize:12, fontWeight:700,
                fontFamily:"inherit", cursor:"pointer",
                border:"1.5px solid #e2e8f0",
                background:"#f8fafc", color:"#475569",
                transition:"all .15s",
              }}
              onMouseEnter={e => { e.currentTarget.style.background="#eef2ff"; e.currentTarget.style.borderColor="#6366f1"; e.currentTarget.style.color="#6366f1"; }}
              onMouseLeave={e => { e.currentTarget.style.background="#f8fafc"; e.currentTarget.style.borderColor="#e2e8f0"; e.currentTarget.style.color="#475569"; }}
            >
              <SlidersHorizontal size={13}/>
              Configure
            </button>
          </div>
        </div>

        {configOpen && (
          <ConfigureDrawer product={product} index={index} onClose={() => setConfigOpen(false)}/>
        )}
      </div>

      {/* AR preview modal — full-screen with live camera */}
      {arOpen && <ARPreviewModal product={product} onClose={() => setArOpen(false)}/>}
    </>
  );
}

// ─── Skeleton card ────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div style={{ background:"#fff", borderRadius:16, border:"1px solid #f1f5f9", overflow:"hidden" }}>
      <div style={{ height:150, background:"linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%)", backgroundSize:"200% 100%", animation:"shimmer 1.4s infinite" }}/>
      <div style={{ padding:"13px 15px 15px" }}>
        <div style={{ height:14, background:"#f1f5f9", borderRadius:7, marginBottom:8, width:"70%", animation:"shimmer 1.4s infinite" }}/>
        <div style={{ height:10, background:"#f1f5f9", borderRadius:5, marginBottom:14, width:"40%", animation:"shimmer 1.4s infinite" }}/>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
          <div style={{ height:36, background:"#f8fafc", borderRadius:10, border:"1.5px solid #e2e8f0" }}/>
          <div style={{ height:36, background:"#f8fafc", borderRadius:10, border:"1.5px solid #e2e8f0" }}/>
        </div>
      </div>
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────
function EmptyState() {
  return (
    <div style={{ gridColumn:"1 / -1", textAlign:"center", padding:"48px 24px", color:"#94a3b8" }}>
      <div style={{ fontSize:40, marginBottom:12 }}>📦</div>
      <p style={{ margin:0, fontWeight:700, fontSize:14, color:"#64748b" }}>No products found</p>
      <p style={{ margin:"4px 0 0", fontSize:12 }}>
        Could not load products from the database. Check your connection.
      </p>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────
export default function ConfigurationPage() {
  const [openBar, setOpenBar] = useState(window.innerWidth >= 768);

  const {
    arOn, toggleGlobalAR, arLoading, arError, clearArError,
    botOn, toggleBot,
    products, dbLoaded,
  } = useConfig();

  const activeCount = products.filter(p => p.able_ar === true).length;

  return (
    <>
      <style>{`
        @keyframes slideUp  { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn   { from{opacity:0} to{opacity:1} }
        @keyframes spin     { to{transform:rotate(360deg)} }
        @keyframes shimmer  { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        @keyframes arPulse  { 0%,100%{opacity:.2;transform:scale(.95)} 50%{opacity:1;transform:scale(1.05)} }
        @keyframes arScan   { 0%{top:20px;opacity:0} 10%{opacity:1} 90%{opacity:1} 100%{top:calc(100% - 22px);opacity:0} }

        .cfg-page  { display:flex; min-height:100vh; background:#f8fafc; font-family:'Inter','Segoe UI',sans-serif; }
        .cfg-main  { flex:1; overflow-y:auto; min-width:0; }
        .cfg-inner { padding:28px 28px 52px; }

        .cfg-hero {
          display:grid; grid-template-columns:1fr 1fr;
          gap:16px; margin:20px 0 32px;
        }
        .cfg-global-card {
          background:#fff; border:1.5px solid #f1f5f9;
          border-radius:18px; box-shadow:0 2px 8px rgba(0,0,0,.05);
          padding:22px 24px; display:flex; align-items:center;
          justify-content:space-between; gap:16px; transition:box-shadow .2s;
        }
        .cfg-global-card:hover { box-shadow:0 6px 24px rgba(99,102,241,.1); }
        .cfg-global-on { background:linear-gradient(135deg,#6366f1 0%,#818cf8 100%); border-color:transparent; }
        .cfg-global-on p { color:#fff !important; }
        .cfg-global-on small { color:rgba(255,255,255,.72) !important; }

        .cfg-ph   { display:flex; align-items:center; justify-content:space-between; margin-bottom:14px; }
        .cfg-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(200px,1fr)); gap:18px; }

        @media (max-width:900px) {
          .cfg-hero  { grid-template-columns:1fr; }
          .cfg-inner { padding:16px 14px 40px; }
        }
      `}</style>

      {arError && <ErrorToast message={arError} onClose={clearArError}/>}

      <div className="cfg-page">
        <Sidebar
          openBar={openBar} setOpenBar={setOpenBar}
          links={ADMIN_LINKS} title="AdminCore"
          subtitle="Enterprise Suite" role="Super Admin"
          profilePath="/admin-dash/profile"
        />

        <main className="cfg-main">
          <Header concept="Configuration" setOpenBar={setOpenBar} openBar={openBar}/>

          <div className="cfg-inner">
            <p style={{ margin:0, fontSize:14, color:"#64748b" }}>
              Manage global feature switches and per-product AR settings.
            </p>

            {/* ── Global controls ── */}
            <div className="cfg-hero">

              <div className={`cfg-global-card${arOn ? " cfg-global-on" : ""}`}>
                <div style={{ display:"flex", gap:14, alignItems:"center" }}>
                  <div style={{
                    width:46, height:46, borderRadius:13, flexShrink:0,
                    background: arOn ? "rgba(255,255,255,0.2)" : "#eef2ff",
                    display:"flex", alignItems:"center", justifyContent:"center", fontSize:22,
                  }}>🥽</div>
                  <div>
                    <p style={{ margin:0, fontWeight:800, fontSize:15, color:"#0f172a", display:"flex", alignItems:"center", gap:7 }}>
                      Global AR Support
                      {arLoading && <Loader2 size={13} style={{ animation:"spin .8s linear infinite", color: arOn ? "#fff" : "#6366f1" }}/>}
                    </p>
                    <small style={{ fontSize:12, color:"#94a3b8", marginTop:2, display:"block" }}>
                      {arOn ? "Master switch — AR enabled across all products"
                            : "All product AR features are currently disabled"}
                    </small>
                  </div>
                </div>
                <Toggle on={arOn} onToggle={toggleGlobalAR} disabled={arLoading} size="lg"/>
              </div>

              <div className={`cfg-global-card${botOn ? " cfg-global-on" : ""}`}>
                <div style={{ display:"flex", gap:14, alignItems:"center" }}>
                  <div style={{
                    width:46, height:46, borderRadius:13, flexShrink:0,
                    background: botOn ? "rgba(255,255,255,0.2)" : "#f0fdf4",
                    display:"flex", alignItems:"center", justifyContent:"center", fontSize:22,
                  }}>🤖</div>
                  <div>
                    <p style={{ margin:0, fontWeight:800, fontSize:15, color:"#0f172a" }}>
                      AI Support Chatbot
                    </p>
                    <small style={{ fontSize:12, color:"#94a3b8", marginTop:2, display:"block" }}>
                      {botOn ? "Automated customer assistance is active"
                             : "ChatWidget removed from all customer pages"}
                    </small>
                  </div>
                </div>
                <Toggle on={botOn} onToggle={toggleBot} disabled={false} size="lg"/>
              </div>
            </div>

            {/* ── Product grid ── */}
            <div className="cfg-ph">
              <div>
                <h2 style={{ margin:0, fontSize:16, fontWeight:800, color:"#0f172a" }}>
                  Product AR Management
                </h2>
                <p style={{ margin:"3px 0 0", fontSize:12, color:"#94a3b8" }}>
                  {dbLoaded
                    ? `${activeCount} of ${products.length} products have AR active`
                    : "Loading products from database…"}
                </p>
              </div>
              {arLoading && (
                <div style={{ display:"flex", alignItems:"center", gap:6, fontSize:12, color:"#6366f1", fontWeight:600 }}>
                  <Loader2 size={14} style={{ animation:"spin .8s linear infinite" }}/>
                  Syncing…
                </div>
              )}
            </div>

            <div className="cfg-grid">
              {!dbLoaded
                ? Array.from({ length:6 }).map((_,i) => <SkeletonCard key={i}/>)
                : products.length === 0
                  ? <EmptyState/>
                  : products.map((product, i) => (
                      <ProductCard key={product.id ?? i} product={product} index={i}/>
                    ))
              }
            </div>
          </div>
        </main>
      </div>
    </>
  );
}