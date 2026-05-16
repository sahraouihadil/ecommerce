import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

// ─── NOTE FOR BACKEND ──────────────────────────────────────────────────────
// When deliveryType === "specific date", `deliverydate` is now sent as a
// JSON array of ISO date strings, e.g. ["2025-08-10","2025-08-14"].
// Update your OrderCreate schema:
//   deliverydate: Union[str, List[str], None]   (or just str if you JSON.stringify on receipt)
// In orders.py you can store it as: json.dumps(data.deliverydate) if isinstance(data.deliverydate, list) else data.deliverydate
// ──────────────────────────────────────────────────────────────────────────

const WILAYAS = [
  "Constantine", "Mila", "Guelma", "Oum El Bouaghi", "Skikda", "Batna", "Sétif",
  "Jijel", "Annaba", "Bordj Bou Arréridj", "Khenchela", "Souk Ahras", "Béjaïa", "Tébessa",
];

const PAYMENT_METHODS = [
  { id: "cod",    label: "Cash on Delivery", sub: "Local Only" },
  { id: "cib",    label: "CIB / Card",       sub: "Visa · Mastercard", hasForm: true },
  { id: "pickup", label: "Self Pickup",       sub: "Algiers Showroom" },
];

const MAX_DATES = 10;

const getTomorrow = () => {
  const t = new Date(Date.now() + 86400000);
  return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, "0")}-${String(t.getDate()).padStart(2, "0")}`;
};

const getNextDateOfWeekday = (dayName) => {
  const map = { Sunday:0, Monday:1, Tuesday:2, Wednesday:3, Thursday:4, Friday:5, Saturday:6 };
  const today = new Date(); let diff = map[dayName] - today.getDay();
  if (diff <= 0) diff += 7;
  const r = new Date(); r.setDate(today.getDate() + diff);
  return `${r.getFullYear()}-${String(r.getMonth() + 1).padStart(2, "0")}-${String(r.getDate()).padStart(2, "0")}`;
};

const toYMD = (date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

const formatDisplay = (ymd) => {
  const [y, m, d] = ymd.split("-");
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${months[parseInt(m, 10) - 1]} ${parseInt(d, 10)}, ${y}`;
};

// ─── Shared styled atoms ──────────────────────────────────────────────────
const Label = ({ children }) => (
  <p style={{ fontFamily:"sans-serif", fontSize:"0.55rem", letterSpacing:"0.3em", textTransform:"uppercase", color:"#9E8E7A", marginBottom:"0.5rem" }}>
    {children}
  </p>
);

const FieldWrap = ({ children }) => (
  <div
    style={{ display:"flex", alignItems:"center", gap:"10px", background:"#EDE7D9", border:"1.5px solid rgba(200,169,106,0.22)", borderRadius:"14px", padding:"0.85rem 1.1rem", transition:"border-color 0.2s" }}
    onFocus={e => e.currentTarget.style.borderColor = "rgba(200,169,106,0.65)"}
    onBlur ={e => e.currentTarget.style.borderColor = "rgba(200,169,106,0.22)"}
  >
    {children}
  </div>
);

const inputSt = { flex:1, background:"transparent", border:"none", outline:"none", fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:"1.05rem", color:"#3D2F1F", lineHeight:1, minWidth:0 };

const SectionCard = ({ children, step, title, delay=0 }) => (
  <div style={{
    background:"#EDE7D9", border:"1px solid rgba(200,169,106,0.22)", borderRadius:"16px",
    padding:"clamp(1.25rem,4vw,2rem) clamp(1rem,4vw,2.25rem)",
    opacity:0, animation:`fadeUp 0.5s ease ${delay}ms forwards`,
  }}>
    <div style={{ display:"flex", alignItems:"center", gap:"12px", marginBottom:"1.5rem" }}>
      <div style={{ width:"28px", height:"28px", borderRadius:"50%", border:"1.5px solid rgba(200,169,106,0.5)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
        <span style={{ fontFamily:"'Cinzel Decorative',serif", fontSize:"0.65rem", color:"#9A7D4A" }}>{step}</span>
      </div>
      <h2 style={{ fontFamily:"'Cinzel Decorative',serif", fontSize:"clamp(0.75rem,2.5vw,0.9rem)", fontWeight:700, letterSpacing:"0.06em", color:"#1C1916" }}>{title}</h2>
    </div>
    {children}
  </div>
);

// ─── Advisory notice (matches the gold palette, not alarming) ────────────
function ScheduleAdvisory() {
  return (
    <div style={{
      marginTop:"1.25rem",
      background:"rgba(200,169,106,0.07)",
      border:"1px solid rgba(200,169,106,0.28)",
      borderRadius:"12px",
      padding:"0.9rem 1.1rem",
      display:"flex", gap:"10px", alignItems:"flex-start",
      animation:"fadeUp 0.3s ease",
    }}>
      {/* Hourglass icon in gold */}
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#C8A96A" strokeWidth="1.6" style={{ flexShrink:0, marginTop:"1px" }}>
        <path d="M5 2h14M5 22h14M6 2v4l4 4-4 4v4M18 2v4l-4 4 4 4v4"/>
      </svg>
      <div>
        <p style={{ margin:0, fontFamily:"'Cinzel Decorative',serif", fontSize:"0.56rem", letterSpacing:"0.08em", color:"#9A7D4A", marginBottom:"0.35rem" }}>
          Scheduling Notice
        </p>
        <p style={{ margin:0, fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:"0.9rem", color:"#7A6040", lineHeight:1.55 }}>
          Your selected dates are preferences — our team will confirm availability and reach you to finalise the exact delivery day. Selecting multiple dates increases the chance of a swift arrangement.
        </p>
      </div>
    </div>
  );
}

// ─── Multi-date inline calendar ───────────────────────────────────────────
function MultiDateCalendar({ selectedDates, onChange }) {
  const today = new Date(); today.setHours(0,0,0,0);
  const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);

  const [viewYear,  setViewYear]  = useState(tomorrow.getFullYear());
  const [viewMonth, setViewMonth] = useState(tomorrow.getMonth()); // 0-indexed

  const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const dayNames   = ["Su","Mo","Tu","We","Th","Fr","Sa"];

  const firstOfMonth = new Date(viewYear, viewMonth, 1);
  const startPad     = firstOfMonth.getDay(); // 0 = Sunday
  const daysInMonth  = new Date(viewYear, viewMonth + 1, 0).getDate();

  const cells = [];
  for (let i = 0; i < startPad; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(viewYear, viewMonth, d));

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const toggleDate = useCallback((date) => {
    if (!date) return;
    date.setHours(0,0,0,0);
    if (date <= today) return; // no past/today
    const ymd = toYMD(date);
    if (selectedDates.includes(ymd)) {
      onChange(selectedDates.filter(d => d !== ymd));
    } else {
      if (selectedDates.length >= MAX_DATES) return;
      onChange([...selectedDates, ymd].sort());
    }
  }, [selectedDates, onChange, today]);

  const navBtn = (label, onClick) => (
    <button onClick={onClick} style={{
      background:"none", border:"1px solid rgba(200,169,106,0.3)", borderRadius:"8px",
      width:"28px", height:"28px", cursor:"pointer", color:"#9A7D4A",
      display:"flex", alignItems:"center", justifyContent:"center",
      fontFamily:"sans-serif", fontSize:"0.8rem", transition:"all .15s",
    }}
      onMouseEnter={e => { e.currentTarget.style.background="rgba(200,169,106,0.12)"; }}
      onMouseLeave={e => { e.currentTarget.style.background="none"; }}
    >{label}</button>
  );

  return (
    <div style={{ marginTop:"1.25rem", animation:"fadeUp 0.3s ease" }}>
      {/* Calendar shell */}
      <div style={{
        background:"rgba(200,169,106,0.06)",
        border:"1px solid rgba(200,169,106,0.22)",
        borderRadius:"14px",
        padding:"1rem 1.1rem 1.25rem",
      }}>
        {/* Month nav */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"0.9rem" }}>
          {navBtn("‹", prevMonth)}
          <span style={{ fontFamily:"'Cinzel Decorative',serif", fontSize:"0.65rem", letterSpacing:"0.12em", color:"#9A7D4A" }}>
            {monthNames[viewMonth]} {viewYear}
          </span>
          {navBtn("›", nextMonth)}
        </div>

        {/* Day-of-week headers */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:"2px", marginBottom:"4px" }}>
          {dayNames.map(d => (
            <div key={d} style={{ textAlign:"center", fontFamily:"sans-serif", fontSize:"0.45rem", letterSpacing:"0.15em", color:"rgba(154,125,74,0.55)", paddingBottom:"4px" }}>
              {d}
            </div>
          ))}
        </div>

        {/* Date cells */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:"3px" }}>
          {cells.map((date, idx) => {
            if (!date) return <div key={`pad-${idx}`}/>;
            date.setHours(0,0,0,0);
            const ymd       = toYMD(date);
            const isPast    = date <= today;
            const isSelected= selectedDates.includes(ymd);
            const isToday   = date.getTime() === today.getTime();
            const atMax     = selectedDates.length >= MAX_DATES && !isSelected;

            return (
              <button
                key={ymd}
                onClick={() => toggleDate(new Date(date))}
                disabled={isPast || atMax}
                title={atMax ? `Max ${MAX_DATES} dates` : ""}
                style={{
                  aspectRatio:"1",
                  borderRadius:"8px",
                  border: isSelected ? "1.5px solid rgba(200,169,106,0.7)" : "1.5px solid transparent",
                  background: isSelected
                    ? "rgba(200,169,106,0.18)"
                    : isToday
                    ? "rgba(200,169,106,0.06)"
                    : "transparent",
                  fontFamily:"'Cormorant Garamond',Georgia,serif",
                  fontSize:"0.88rem",
                  color: isSelected
                    ? "#9A7D4A"
                    : isPast
                    ? "rgba(154,125,74,0.22)"
                    : "#3D2F1F",
                  cursor: isPast || atMax ? "not-allowed" : "pointer",
                  opacity: isPast ? 0.4 : atMax ? 0.45 : 1,
                  transition:"all .15s",
                  padding:0,
                  display:"flex", alignItems:"center", justifyContent:"center",
                  minHeight:"32px",
                  fontWeight: isSelected ? 600 : 400,
                }}
                onMouseEnter={e => { if (!isPast && !atMax && !isSelected) e.currentTarget.style.background="rgba(200,169,106,0.09)"; }}
                onMouseLeave={e => { if (!isPast && !atMax && !isSelected) e.currentTarget.style.background="transparent"; }}
              >
                {date.getDate()}
              </button>
            );
          })}
        </div>

        {/* Counter */}
        <div style={{ marginTop:"0.85rem", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <span style={{ fontFamily:"sans-serif", fontSize:"0.48rem", letterSpacing:"0.2em", textTransform:"uppercase", color:"rgba(154,125,74,0.6)" }}>
            {selectedDates.length} / {MAX_DATES} dates selected
          </span>
          {selectedDates.length > 0 && (
            <button onClick={() => onChange([])} style={{
              background:"none", border:"none", cursor:"pointer",
              fontFamily:"sans-serif", fontSize:"0.47rem", letterSpacing:"0.18em",
              textTransform:"uppercase", color:"rgba(154,125,74,0.55)",
              textDecoration:"underline", padding:0,
            }}>
              Clear all
            </button>
          )}
        </div>
      </div>

      {/* Selected date pills */}
      {selectedDates.length > 0 && (
        <div style={{ marginTop:"0.85rem", display:"flex", flexWrap:"wrap", gap:"0.45rem" }}>
          {selectedDates.map(ymd => (
            <span key={ymd} style={{
              display:"inline-flex", alignItems:"center", gap:"5px",
              background:"rgba(200,169,106,0.12)",
              border:"1px solid rgba(200,169,106,0.35)",
              borderRadius:"2rem",
              padding:"0.28rem 0.7rem",
              fontFamily:"'Cormorant Garamond',Georgia,serif",
              fontSize:"0.88rem", color:"#9A7D4A",
            }}>
              {formatDisplay(ymd)}
              <button
                onClick={() => onChange(selectedDates.filter(d => d !== ymd))}
                style={{ background:"none", border:"none", cursor:"pointer", padding:0, lineHeight:1, color:"rgba(154,125,74,0.55)", fontSize:"0.9rem" }}
              >×</button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────
export function CheckoutPage() {
  const [items,   setItems]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const navigate = useNavigate();

  const [fullName,      setFullName]      = useState("");
  const [phone,         setPhone]         = useState("");
  const [wilaya,        setWilaya]        = useState("");
  const [city,          setCity]          = useState("");
  const [streetAddress, setStreetAddress] = useState("");
  const [notes,         setNotes]         = useState("");

  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [cardNumber,    setCardNumber]    = useState("");
  const [cardExpiry,    setCardExpiry]    = useState("");
  const [cardCvv,       setCardCvv]       = useState("");

  const [deliveryType,  setDeliveryType]  = useState("any time");
  // For "specific date" — array of selected date strings
  const [selectedDates, setSelectedDates] = useState([]);
  // For "day of week"
  const [selectedDow,   setSelectedDow]   = useState("");
  const [deliveryDate,  setDeliveryDate]  = useState(getTomorrow());

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@400;700;900&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&display=swap";
    document.head.appendChild(link);
    return () => document.head.removeChild(link);
  }, []);

  useEffect(() => {
    const fetch_ = async () => {
      try {
        const res = await api.get("/api/cart");
        setItems(res.data);
        if (res.data.length === 0) navigate("/cart");
      } catch { navigate("/login"); }
      finally { setLoading(false); }
    };
    fetch_();
  }, [navigate]);

  const total = items.reduce((s, i) => s + (i.product?.price || 0) * i.quantity, 0);

  // Delivery date value sent to backend
  const deliveryPayload =
    deliveryType === "specific date" ? selectedDates          // array
    : deliveryType === "day of week" ? deliveryDate           // single ISO string
    : getTomorrow();                                           // ASAP fallback

  const specificDateValid =
    deliveryType !== "specific date" || selectedDates.length > 0;

  const canSubmit =
    fullName && phone && wilaya && city && streetAddress &&
    (paymentMethod !== "cib" || (cardNumber.replace(/\s/g,"").length === 16 && cardExpiry && cardCvv)) &&
    specificDateValid && !placing;

  const handlePlaceOrder = async () => {
    if (!canSubmit) return;
    setPlacing(true);
    try {
      const res = await api.post("/api/orders", {
        fullName, phone, wilaya, city, streetAddress, notes, paymentMethod,
        ...(paymentMethod === "cib" ? { cardNumber, cardExpiry, cardCvv } : {}),
        delivery_type: deliveryType,
        // array for "specific date", single string otherwise
        deliverydate: deliveryPayload,
      });
      navigate("/order/confirmation", {
        state: {
          orderId:       res.data.order_id,
          total:         res.data.total ?? total,
          fullName, wilaya, paymentMethod,
          delivery_type: deliveryType,
          deliverydate:
            deliveryType === "any time"      ? "ASAP"
            : deliveryType === "specific date" ? selectedDates.join(", ")
            : deliveryDate,
          items: items.map(i => ({
            id: i.id, quantity: i.quantity,
            product: { name:i.product?.name, price:i.product?.price, image:i.product?.image, sku:i.product?.sku }
          })),
        }
      });
    } catch (err) {
      alert(err?.response?.data?.detail || "Failed to place order");
    } finally { setPlacing(false); }
  };

  const base = { minHeight:"100vh", background:"#F5F0E8", color:"#1C1916", fontFamily:"'Cormorant Garamond',Georgia,serif", overflowX:"hidden", position:"relative" };

  if (loading) return (
    <div style={{ ...base, display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:"1.5rem" }}>
        <div style={{ position:"relative", width:"48px", height:"48px" }}>
          <div style={{ position:"absolute", inset:0, borderRadius:"50%", border:"1px solid #C8A96A", borderTopColor:"transparent", animation:"spin 1s linear infinite" }}/>
          <div style={{ position:"absolute", inset:"5px", borderRadius:"50%", border:"1px solid rgba(200,169,106,0.25)" }}/>
        </div>
        <p style={{ fontFamily:"sans-serif", fontSize:"0.575rem", letterSpacing:"0.42em", textTransform:"uppercase", color:"#9E8E7A" }}>Preparing checkout</p>
        <style>{`@keyframes spin { to { transform:rotate(360deg); } }`}</style>
      </div>
    </div>
  );

  return (
    <div style={base}>
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:none; } }
        @keyframes spin   { to { transform:rotate(360deg); } }

        .co-layout {
          display:grid; grid-template-columns:1fr; gap:2rem;
        }
        @media (min-width:1024px) {
          .co-layout { grid-template-columns:1fr 360px; }
        }

        .addr-grid {
          display:grid; grid-template-columns:1fr; gap:0.85rem;
        }
        @media (min-width:560px) {
          .addr-grid { grid-template-columns:1fr 1fr; }
          .addr-full  { grid-column:1 / -1; }
        }

        .card-grid {
          display:grid; grid-template-columns:1fr; gap:0.85rem;
        }
        @media (min-width:480px) {
          .card-grid { grid-template-columns:1fr 1fr; }
        }

        .summary-sticky { position:static; }
        @media (min-width:1024px) {
          .summary-sticky { position:sticky; top:7rem; }
        }

        .pill-grid {
          display:grid; grid-template-columns:1fr 1fr; gap:0.75rem;
        }
        @media (min-width:400px) {
          .pill-grid { grid-template-columns:repeat(3,1fr); }
        }

        select { -webkit-appearance:none; appearance:none; }
        .pill-btn { min-height:72px; }
      `}</style>

      {/* Ghost watermark */}
      <div aria-hidden="true" style={{ position:"fixed", inset:0, display:"flex", alignItems:"center", justifyContent:"center", pointerEvents:"none", userSelect:"none", zIndex:0 }}>
        <span style={{ fontFamily:"'Cinzel Decorative',serif", fontSize:"clamp(3rem,18vw,16rem)", fontWeight:900, color:"transparent", WebkitTextStroke:"1px rgba(180,148,90,0.04)", letterSpacing:"0.12em", whiteSpace:"nowrap" }}>CHECKOUT</span>
      </div>

      <div style={{ maxWidth:"1180px", margin:"0 auto", padding:"clamp(5rem,10vw,9rem) clamp(1rem,4vw,1.5rem) 5rem", position:"relative", zIndex:1 }}>

        {/* Header */}
        <div style={{ marginBottom:"2.5rem" }}>
          <p style={{ fontFamily:"sans-serif", fontSize:"0.575rem", letterSpacing:"0.38em", textTransform:"uppercase", color:"#9E8E7A", marginBottom:"0.75rem" }}>Complete Your Order</p>
          <h1 style={{ fontFamily:"'Cinzel Decorative',serif", fontSize:"clamp(1.6rem,5vw,3rem)", fontWeight:700, letterSpacing:"0.035em", lineHeight:1.08, color:"#1C1916", marginBottom:"1.25rem" }}>Checkout</h1>
          <div style={{ display:"flex", alignItems:"center", gap:"6px", maxWidth:"10rem" }}>
            <div style={{ height:"1px", flex:1, background:"#C8A96A", opacity:0.55 }}/>
            <div style={{ width:"4px", height:"4px", background:"#C8A96A", transform:"rotate(45deg)", opacity:0.7 }}/>
            <div style={{ height:"1px", flex:1, background:"#C8A96A", opacity:0.55 }}/>
          </div>
        </div>

        <div className="co-layout">

          {/* LEFT — Form sections */}
          <div style={{ display:"flex", flexDirection:"column", gap:"1.5rem" }}>

            {/* Section 1 — Address */}
            <SectionCard step="1" title="Delivery Address" delay={0}>
              <div className="addr-grid">
                <FieldWrap><input style={inputSt} placeholder="Full name"            value={fullName}      onChange={e => setFullName(e.target.value)} /></FieldWrap>
                <FieldWrap><input style={inputSt} placeholder="Phone (0550 123 456)" value={phone}         onChange={e => setPhone(e.target.value)} /></FieldWrap>

                <FieldWrap>
                  <select value={wilaya} onChange={e => setWilaya(e.target.value)} style={{ ...inputSt, cursor:"pointer" }}>
                    <option value="">Select Wilaya</option>
                    {WILAYAS.map(w => <option key={w} value={w}>{w}</option>)}
                  </select>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#9E8E7A" strokeWidth="2" style={{ flexShrink:0, opacity:0.6 }}><path d="M6 9l6 6 6-6"/></svg>
                </FieldWrap>

                <FieldWrap><input style={inputSt} placeholder="City / Commune" value={city} onChange={e => setCity(e.target.value)} /></FieldWrap>

                <div className="addr-full">
                  <FieldWrap><input style={inputSt} placeholder="Street address" value={streetAddress} onChange={e => setStreetAddress(e.target.value)} /></FieldWrap>
                </div>
                <div className="addr-full">
                  <FieldWrap><input style={inputSt} placeholder="Additional notes (optional)" value={notes} onChange={e => setNotes(e.target.value)} /></FieldWrap>
                </div>
              </div>
            </SectionCard>

            {/* Section 2 — Payment */}
            <SectionCard step="2" title="Payment Method" delay={80}>
              <div className="pill-grid" style={{ marginBottom: paymentMethod === "cib" ? "1.5rem" : 0 }}>
                {PAYMENT_METHODS.map(m => {
                  const active = paymentMethod === m.id;
                  return (
                    <button key={m.id} className="pill-btn" onClick={() => setPaymentMethod(m.id)} style={{
                      display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:"6px",
                      padding:"1rem 0.5rem",
                      background: active ? "rgba(200,169,106,0.12)" : "#F5F0E8",
                      border:`1.5px solid ${active ? "rgba(200,169,106,0.6)" : "rgba(200,169,106,0.2)"}`,
                      borderRadius:"14px", cursor:"pointer", transition:"all 0.2s", position:"relative",
                    }}>
                      {active && <div style={{ position:"absolute", top:"8px", right:"8px", width:"6px", height:"6px", borderRadius:"50%", background:"#C8A96A" }}/>}
                      <span style={{ fontFamily:"'Cinzel Decorative',serif", fontSize:"clamp(0.55rem,1.8vw,0.65rem)", fontWeight:700, letterSpacing:"0.04em", color: active ? "#9A7D4A" : "#1C1916", textAlign:"center", lineHeight:1.3 }}>{m.label}</span>
                      <span style={{ fontFamily:"sans-serif", fontSize:"0.5rem", letterSpacing:"0.15em", textTransform:"uppercase", color:"#9E8E7A", textAlign:"center" }}>{m.sub}</span>
                    </button>
                  );
                })}
              </div>

              {paymentMethod === "cib" && (
                <div style={{ borderTop:"1px solid rgba(200,169,106,0.25)", paddingTop:"1.5rem", display:"flex", flexDirection:"column", gap:"0.85rem", animation:"fadeUp 0.25s ease" }}>
                  <FieldWrap>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9E8E7A" strokeWidth="1.5" style={{ flexShrink:0 }}><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
                    <input style={inputSt} placeholder="Card number (16 digits)" maxLength={19} value={cardNumber}
                      onChange={e => { const v = e.target.value.replace(/\D/g,"").slice(0,16); setCardNumber(v.replace(/(.{4})/g,"$1 ").trim()); }}/>
                  </FieldWrap>
                  <div className="card-grid">
                    <FieldWrap>
                      <input style={inputSt} placeholder="MM/YY" maxLength={5} value={cardExpiry}
                        onChange={e => { let v = e.target.value.replace(/\D/g,"").slice(0,4); if (v.length > 2) v = v.slice(0,2)+"/"+v.slice(2); setCardExpiry(v); }}/>
                    </FieldWrap>
                    <FieldWrap>
                      <input style={inputSt} placeholder="CVV" maxLength={3} value={cardCvv} onChange={e => setCardCvv(e.target.value.replace(/\D/g,"").slice(0,3))}/>
                    </FieldWrap>
                  </div>
                </div>
              )}
            </SectionCard>

            {/* Section 3 — Delivery schedule */}
            <SectionCard step="3" title="Delivery Schedule" delay={160}>
              <div className="pill-grid">
                {[
                  { id:"any time",      label:"Any Time",      sub:"Deliver ASAP"  },
                  { id:"specific date", label:"Specific Dates", sub:"Pick your days" },
                  { id:"day of week",   label:"Day of Week",   sub:"Pick a weekday" },
                ].map(opt => {
                  const active = deliveryType === opt.id;
                  return (
                    <button key={opt.id} className="pill-btn" onClick={() => {
                      setDeliveryType(opt.id);
                      if (opt.id === "any time") { setSelectedDates([]); setSelectedDow(""); setDeliveryDate(getTomorrow()); }
                    }} style={{
                      display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:"6px",
                      padding:"1rem 0.5rem",
                      background: active ? "rgba(200,169,106,0.12)" : "#F5F0E8",
                      border:`1.5px solid ${active ? "rgba(200,169,106,0.6)" : "rgba(200,169,106,0.2)"}`,
                      borderRadius:"14px", cursor:"pointer", transition:"all 0.2s", position:"relative",
                    }}>
                      {active && <div style={{ position:"absolute", top:"8px", right:"8px", width:"6px", height:"6px", borderRadius:"50%", background:"#C8A96A" }}/>}
                      <span style={{ fontFamily:"'Cinzel Decorative',serif", fontSize:"clamp(0.55rem,1.8vw,0.65rem)", fontWeight:700, letterSpacing:"0.04em", color: active ? "#9A7D4A" : "#1C1916", textAlign:"center", lineHeight:1.3 }}>{opt.label}</span>
                      <span style={{ fontFamily:"sans-serif", fontSize:"0.5rem", letterSpacing:"0.15em", textTransform:"uppercase", color:"#9E8E7A", textAlign:"center" }}>{opt.sub}</span>
                    </button>
                  );
                })}
              </div>

              {/* ── Specific date: advisory + multi-date calendar ── */}
              {deliveryType === "specific date" && (
                <div style={{ borderTop:"1px solid rgba(200,169,106,0.2)", paddingTop:"1.5rem", marginTop:"1.5rem" }}>
                  <ScheduleAdvisory/>
                  <div style={{ marginTop:"1.25rem" }}>
                    <Label>Select preferred dates (up to {MAX_DATES})</Label>
                    <MultiDateCalendar selectedDates={selectedDates} onChange={setSelectedDates}/>
                  </div>
                </div>
              )}

              {/* ── Day of week ── */}
              {deliveryType === "day of week" && (
                <div style={{ marginTop:"1.5rem", borderTop:"1px solid rgba(200,169,106,0.25)", paddingTop:"1.5rem", animation:"fadeUp 0.25s ease" }}>
                  <Label>Choose a weekday</Label>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:"0.5rem", marginTop:"0.5rem" }}>
                    {["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"].map(d => {
                      const active = selectedDow === d;
                      return (
                        <button key={d} onClick={() => { setSelectedDow(d); setDeliveryDate(getNextDateOfWeekday(d)); }} style={{
                          padding:"0.5rem 0.9rem",
                          background: active ? "#1C1916" : "transparent",
                          border:`1px solid ${active ? "#1C1916" : "rgba(200,169,106,0.35)"}`,
                          borderRadius:"2rem",
                          fontFamily:"sans-serif", fontSize:"0.52rem", letterSpacing:"0.18em", textTransform:"uppercase",
                          color: active ? "#F5F0E8" : "#9A7D4A",
                          cursor:"pointer", transition:"all 0.18s", minHeight:"36px",
                        }}>{d.slice(0,3)}</button>
                      );
                    })}
                  </div>
                </div>
              )}
            </SectionCard>
          </div>

          {/* RIGHT — Order Summary */}
          <aside style={{ opacity:0, animation:"fadeUp 0.5s ease 60ms forwards" }}>
            <div className="summary-sticky" style={{
              background:"#2C1F10", borderRadius:"16px",
              border:"1px solid rgba(200,169,106,0.2)",
              padding:"clamp(1.25rem,4vw,2rem) clamp(1rem,4vw,2.25rem)",
              color:"#E8DCC8",
            }}>
              <p style={{ fontFamily:"'Cinzel Decorative',serif", fontSize:"0.7rem", letterSpacing:"0.35em", textTransform:"uppercase", color:"#C8A96A", marginBottom:"1.75rem" }}>Order Summary</p>

              <div style={{ display:"flex", flexDirection:"column", gap:"1rem", marginBottom:"1.75rem" }}>
                {items.map(item => (
                  <div key={item.id} style={{ display:"flex", alignItems:"center", gap:"12px" }}>
                    <div style={{ width:"38px", height:"38px", borderRadius:"8px", background:"rgba(255,255,255,0.07)", overflow:"hidden", flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center" }}>
                      {item.product?.image
                        ? <img src={item.product.image} alt={item.product.name} style={{ width:"100%", height:"100%", objectFit:"cover" }}/>
                        : <span style={{ fontSize:"10px", color:"rgba(200,169,106,0.4)" }}>img</span>}
                    </div>
                    <span style={{ flex:1, fontFamily:"'Cormorant Garamond',serif", fontSize:"0.95rem", color:"rgba(232,220,200,0.8)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", minWidth:0 }}>
                      {item.quantity}× {item.product?.name ?? "Item"}
                    </span>
                    <span style={{ fontFamily:"'Cinzel Decorative',serif", fontSize:"0.8rem", color:"#C8A96A", whiteSpace:"nowrap", flexShrink:0 }}>
                      {((item.product?.price || 0) * item.quantity).toLocaleString()} DA
                    </span>
                  </div>
                ))}
              </div>

              <div style={{ height:"1px", background:"rgba(200,169,106,0.2)", marginBottom:"1.5rem" }}/>

              <div style={{ display:"flex", flexDirection:"column", gap:"0.75rem", marginBottom:"1.5rem" }}>
                {[
                  { label:"Subtotal", value:`${total.toLocaleString()} DA` },
                  { label:"Delivery", value:"Free", valueStyle:{ color:"#5DC88A", fontFamily:"sans-serif", fontSize:"0.55rem", letterSpacing:"0.2em", textTransform:"uppercase" } },
                  { label:"Payment",  value: PAYMENT_METHODS.find(m => m.id === paymentMethod)?.label },
                  {
                    label:"Schedule",
                    value: deliveryType === "any time"
                      ? "ASAP"
                      : deliveryType === "specific date"
                      ? selectedDates.length
                        ? `${selectedDates.length} date${selectedDates.length > 1 ? "s" : ""} selected`
                        : "—"
                      : selectedDow || "—"
                  },
                ].map(({ label, value, valueStyle }) => (
                  <div key={label} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", gap:"0.5rem" }}>
                    <span style={{ fontFamily:"sans-serif", fontSize:"0.52rem", letterSpacing:"0.22em", textTransform:"uppercase", color:"rgba(200,169,106,0.55)", flexShrink:0 }}>{label}</span>
                    <span style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"0.95rem", color:"rgba(232,220,200,0.75)", textAlign:"right", ...valueStyle }}>{value}</span>
                  </div>
                ))}
              </div>

              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline", borderTop:"1px solid rgba(200,169,106,0.2)", paddingTop:"1.25rem", marginBottom:"1.75rem" }}>
                <span style={{ fontFamily:"sans-serif", fontSize:"0.55rem", letterSpacing:"0.3em", textTransform:"uppercase", color:"rgba(200,169,106,0.7)" }}>Total</span>
                <span style={{ fontFamily:"'Cinzel Decorative',serif", fontSize:"1.2rem", fontWeight:700, color:"#C8A96A" }}>{total.toLocaleString()} DA</span>
              </div>

              <button
                onClick={handlePlaceOrder} disabled={!canSubmit}
                style={{
                  width:"100%", padding:"0.9rem",
                  background: canSubmit ? "#C8A96A" : "rgba(200,169,106,0.3)",
                  border:"none", borderRadius:"2rem",
                  fontFamily:"sans-serif", fontSize:"0.575rem", letterSpacing:"0.28em", textTransform:"uppercase",
                  color: canSubmit ? "#1C1916" : "rgba(200,169,106,0.5)",
                  cursor: canSubmit ? "pointer" : "not-allowed",
                  fontWeight:600, transition:"all 0.2s", minHeight:"48px",
                }}
                onMouseEnter={e => { if (canSubmit) e.currentTarget.style.background="#D4BA80"; }}
                onMouseLeave={e => { if (canSubmit) e.currentTarget.style.background="#C8A96A"; }}
              >
                {placing ? "Placing Order…" : paymentMethod === "cib" ? "Pay Now" : "Confirm Order"}
              </button>

              <p style={{ textAlign:"center", marginTop:"1.25rem", fontFamily:"sans-serif", fontSize:"0.5rem", letterSpacing:"0.15em", color:"rgba(200,169,106,0.3)", lineHeight:1.8 }}>
                By completing your purchase you agree to our{" "}
                <a href="#" style={{ color:"rgba(200,169,106,0.55)", textDecoration:"underline" }}>Terms</a>
                {" & "}
                <a href="#" style={{ color:"rgba(200,169,106,0.55)", textDecoration:"underline" }}>Privacy</a>
              </p>

              <div style={{ display:"flex", justifyContent:"center", marginTop:"1.5rem" }}>
                <span style={{ fontFamily:"'Cinzel Decorative',serif", fontSize:"0.48rem", letterSpacing:"0.45em", textTransform:"uppercase", color:"rgba(200,169,106,0.2)" }}>
                  enter your sanctuary
                </span>
              </div>
            </div>
          </aside>

        </div>
      </div>
    </div>
  );
}