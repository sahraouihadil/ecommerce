/**
 * ProductPage.jsx — with CollectiveReflection review section added at the bottom
 */

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

import ProductViewer from "../components/ProductViewer/ProductViewer";
import localProducts from "../data/products";
import api from "../services/api";
import { Button, Card, Section, Divider } from "../components/ui";

// ── Review helpers (inline) ───────────────────────────────────────
function StarRating({ value, onChange, readOnly = false, size = 28 }) {
  const [hovered, setHovered] = useState(0);
  const active = hovered || value;
  return (
    <div style={{ display: "flex", gap: "6px" }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button key={star}
          onClick={() => !readOnly && onChange?.(star)}
          onMouseEnter={() => !readOnly && setHovered(star)}
          onMouseLeave={() => !readOnly && setHovered(0)}
          style={{
            background: "none", border: "none",
            cursor: readOnly ? "default" : "pointer",
            padding: 0, fontSize: `${size}px`, lineHeight: 1,
            color: star <= active ? "#b5956a" : "#ddd5c8",
            transition: "color 0.15s, transform 0.15s",
            transform: !readOnly && hovered === star ? "scale(1.2)" : "scale(1)",
          }}
        >★</button>
      ))}
    </div>
  );
}

function ReviewAvatar({ name, size = 38 }) {
  const initials = name.split(" ").slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("");
  const palettes = [["#e8d8cc", "#5c4a3a"], ["#d4c4b4", "#3d2f22"], ["#c9b8a8", "#4a3728"], ["#e0cfc0", "#6b5244"]];
  const [bg, fg] = palettes[name.charCodeAt(0) % palettes.length];
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", background: bg, color: fg,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.36, fontWeight: "700", fontFamily: "Georgia, serif", flexShrink: 0
    }}>
      {initials}
    </div>
  );
}

const IS_MOBILE = /Android|iPhone|iPad|iPod|webOS|BlackBerry|Windows Phone/i.test(
  typeof navigator !== "undefined" ? navigator.userAgent : ""
);

const COLOR_OPTIONS = [
  { id: "white", label: "White", hex: "#ffffff" },
  { id: "charcoal", label: "Charcoal", hex: "#1A1A1A", active: true },
  { id: "blush", label: "Blush", hex: "#E8D5CC" },
  { id: "taupe", label: "Taupe", hex: "#D4A99A" },
];

export function ProductPage() {
  const { productId } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [cartMsg, setCartMsg] = useState("");
  const [favMsg, setFavMsg] = useState("");
  const [activeColor, setActiveColor] = useState("charcoal");
  const [thumbHover, setThumbHover] = useState(null);
  const [showViewer, setShowViewer] = useState(false);

  useEffect(() => {
    api.get("/api/products").then((res) => {
      const found = res.data.find((p) => p.id === parseInt(productId));
      if (found) {
        const local = localProducts.find((l) => l.name === found.name);
        setProduct({ ...found, ...local, id: found.id });
      }
    }).catch(() => navigate("/furniture"));
  }, [productId]);

  useEffect(() => { setShowViewer(false); }, [productId]);

  const handleAddToCart = async () => {
    try {
      await api.post("/api/cart", null, { params: { product_id: product.id, quantity: 1 } });
      setCartMsg("Added to cart!");
      setTimeout(() => setCartMsg(""), 2000);
    } catch (err) {
      if (err.response?.status === 401) navigate("/login");
      else setCartMsg("Failed to add");
    }
  };

  const handleAddToFavorites = async () => {
    try {
      await api.post("/api/favorites", null, { params: { product_id: product.id } });
      setFavMsg("Added to favorites!");
      setTimeout(() => setFavMsg(""), 2000);
    } catch (err) {
      if (err.response?.status === 401) navigate("/login");
      else setFavMsg("Failed to add");
    }
  };

  if (!product) return (
    <div className="min-h-screen bg-cream flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-2 border-rose border-t-transparent rounded-full animate-spin" />
        <p className="text-muted text-sm font-light">Loading product...</p>
      </div>
    </div>
  );

  const originalPrice = product.price ? Math.round(product.price * 1.19) : null;

  return (
    <div className="min-h-screen bg-cream text-charcoal pb-32">

      <Section size="sm" maxWidth="7xl" className="pt-28">
        <button
          className="inline-flex items-center gap-2 text-muted hover:text-charcoal text-sm font-light tracking-wide mb-10 transition-colors duration-300"
          onClick={() => navigate("/")}
        >
          <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          Back to Collection
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">

          {/* ── Left: Visuals ── */}
          <div>
            <div className="relative">
              {!showViewer && (
                <Card variant="surface" className="relative overflow-hidden aspect-[4/3] p-0">
                  <img
                    src="../../public/pink chair.png"
                    alt={product.name}
                    className="w-full h-full object-cover rounded-3xl"
                  />
                  {product.bestSeller && (
                    <span className="absolute top-5 left-5 bg-white text-charcoal text-[0.6875rem] uppercase tracking-[0.15em] font-semibold px-4 py-2 rounded-full z-[2] shadow-sm">
                      Best Seller
                    </span>
                  )}
                  <div className="absolute bottom-5 right-5 flex gap-3 z-[2]">
                    {IS_MOBILE && product.iosSrc && (
                      <Button variant="blush" size="sm" className="gap-1.5 shadow-md backdrop-blur-md"
                        onClick={() => { setShowViewer(true); setTimeout(() => { document.querySelector("model-viewer")?.activateAR?.(); }, 300); }}>
                        <span className="material-symbols-outlined text-[18px]">view_in_ar</span>
                        View in AR
                      </Button>
                    )}
                    {product.modelSrc && (
                      <Button variant="black" size="sm" className="gap-1.5 shadow-lg" onClick={() => setShowViewer(true)}>
                        <span className="material-symbols-outlined text-[18px]">3d_rotation</span>
                        View in 3D
                      </Button>
                    )}
                  </div>
                </Card>
              )}
              {showViewer && (
                <div className="relative">
                  <ProductViewer modelSrc={product.modelSrc} iosSrc={product.iosSrc} productName={product.name} price={product.price} variants={product.variants} />
                  <Button variant="blush" size="sm" className="absolute top-4 left-4 z-10 gap-1.5 shadow-md backdrop-blur-md" onClick={() => setShowViewer(false)}>
                    <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                    Photo
                  </Button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-3 gap-3 mt-5">
              {[product.images?.[1], product.images?.[2]].filter(Boolean).map((src, i) => (
                <div key={i}
                  className={`rounded-2xl overflow-hidden bg-surface aspect-square cursor-pointer transition-all duration-200 ${thumbHover === i ? 'opacity-100 shadow-md' : 'opacity-70'}`}
                  onMouseEnter={() => setThumbHover(i)} onMouseLeave={() => setThumbHover(null)}>
                  <img src={src} alt={`${product.name} view ${i + 2}`} className="w-full h-full object-cover" />
                </div>
              ))}
              <div className="rounded-2xl bg-surface aspect-square flex flex-col items-center justify-center border-2 border-dashed border-blush/40 gap-1.5">
                <span className="material-symbols-outlined text-[24px] text-rose">videocam</span>
                <span className="text-[0.5625rem] font-semibold text-muted uppercase tracking-[0.08em]">Fabric Story</span>
              </div>
            </div>
          </div>

          {/* ── Right: Details ── */}
          <div className="lg:sticky lg:top-24">
            <div className="flex flex-col gap-8">
              <div>
                <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.25em] text-muted">{product.category}</span>
                <h1 className="font-serif text-[clamp(2rem,5vw,3rem)] font-bold leading-[1.05] tracking-tight text-charcoal mt-3">{product.name}</h1>
                <div className="flex items-baseline gap-3 mt-4">
                  <span className="font-serif text-[1.75rem] font-bold text-charcoal">${product.price}</span>
                  {originalPrice && <span className="text-muted/40 text-lg line-through font-light">${originalPrice}</span>}
                </div>
              </div>
              <Divider variant="line" />
              <div>
                <p className="text-muted leading-[1.8] font-light">{product.description}</p>
                <div className="flex flex-wrap gap-2 mt-5">
                  <span className="inline-flex items-center gap-1.5 bg-surface px-4 py-2 rounded-full text-[0.6875rem] font-semibold text-muted">
                    <span className="material-symbols-outlined text-[16px] text-success">eco</span>Sustainably Sourced
                  </span>
                  <span className="inline-flex items-center gap-1.5 bg-surface px-4 py-2 rounded-full text-[0.6875rem] font-semibold text-muted">
                    <span className="material-symbols-outlined text-[16px] text-charcoal">auto_awesome</span>Stain Resistant
                  </span>
                </div>
              </div>
              <Card variant="surface" className="p-8">
                <span className="block text-[0.6875rem] font-semibold uppercase tracking-[0.25em] text-muted mb-5">Select Color</span>
                <div className="flex gap-4 mb-7">
                  {COLOR_OPTIONS.map((c) => (
                    <button key={c.id} title={c.label} onClick={() => setActiveColor(c.id)}
                      className="w-10 h-10 rounded-full transition-all duration-200 hover:scale-110"
                      style={{ backgroundColor: c.hex, outline: activeColor === c.id ? '3px solid #1A1A1A' : '3px solid transparent', outlineOffset: '3px', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.08)' }} />
                  ))}
                </div>
                <Divider variant="line" className="mb-7" />
                <div className="flex flex-col gap-3">
                  <Button variant="black" size="lg" className="w-full gap-2" onClick={handleAddToCart}>
                    <span className="material-symbols-outlined text-[20px]">shopping_bag</span>Add to Cart
                  </Button>
                  <Button variant="outline" size="lg" className="w-full gap-2" onClick={handleAddToFavorites}>
                    <span className="material-symbols-outlined text-[20px]">favorite</span>Add to Favorites
                  </Button>
                  <p className="text-center text-[0.6875rem] font-light tracking-[0.12em] text-muted/50 uppercase mt-3">Free white-glove delivery in 4-6 weeks</p>
                </div>
                {cartMsg && <div className={`mt-4 p-3 rounded-2xl text-sm font-semibold text-center ${cartMsg.startsWith("Failed") ? 'bg-danger/10 text-danger' : 'bg-success/10 text-success'}`}>{cartMsg}</div>}
                {favMsg && <div className={`mt-4 p-3 rounded-2xl text-sm font-semibold text-center ${favMsg.startsWith("Failed") ? 'bg-danger/10 text-danger' : 'bg-success/10 text-success'}`}>{favMsg}</div>}
              </Card>
              <Card variant="cream" className="border-2 border-blush/40 p-6 flex items-center gap-5 bg-blush/15">
                <div className="w-14 h-14 flex-shrink-0 rounded-full bg-charcoal flex items-center justify-center shadow-md">
                  <span className="material-symbols-outlined text-[24px] text-cream">smart_toy</span>
                </div>
                <div>
                  <p className="font-serif font-bold text-charcoal text-[1rem] mb-1">Need styling advice?</p>
                  <p className="text-muted text-[0.85rem] font-light leading-relaxed">Roomie is online and ready to help you match your decor.</p>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </Section>

      {/* ── Why it's magical ── */}
      <Section size="sm" maxWidth="7xl" className="mt-8">
        <Divider variant="diamond" className="mb-12" />
        <h2 className="font-serif text-[1.75rem] font-bold text-charcoal mb-10">Why it's magical</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card variant="surface" className="md:col-span-2 p-10 relative overflow-hidden min-h-[240px] flex flex-col justify-end">
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-blush/40 blur-[56px] translate-x-1/2 -translate-y-1/2 pointer-events-none" />
            <div className="relative z-[1] max-w-md">
              <h3 className="font-serif text-xl font-bold text-charcoal mb-3">Ergonomic Cloud-Tech</h3>
              <p className="text-muted leading-[1.75] text-[0.9375rem] font-light">Our patented internal structure mimics the buoyancy of water without the mess. It adapts to your body's pressure points instantly.</p>
            </div>
          </Card>
          <Card variant="cream" className="p-10 flex flex-col items-center justify-center text-center bg-blush/30">
            <span className="material-symbols-outlined text-[48px] text-charcoal mb-4">workspace_premium</span>
            <h3 className="font-serif text-lg font-bold text-charcoal mb-2">Lifetime Warranty</h3>
            <p className="text-muted text-[0.85rem] leading-[1.65] font-light">We believe in clouds that last forever. Guaranteed frame & foam.</p>
          </Card>
          {[
            { icon: "view_in_ar", title: "AR Preview", body: "See it in your room before buying" },
            { icon: "palette", title: "Custom Colors", body: `${product.variants?.length ?? 4} color options available` },
            { icon: "local_shipping", title: "Free Delivery", body: "Arrives in 5-7 business days" },
          ].map((f) => (
            <Card key={f.title} variant="white" className="p-7 flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-blush/30 flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-[20px] text-charcoal">{f.icon}</span>
              </div>
              <div>
                <p className="font-serif font-bold text-charcoal text-[0.9375rem] mb-1">{f.title}</p>
                <p className="text-muted text-[0.85rem] font-light leading-relaxed">{f.body}</p>
              </div>
            </Card>
          ))}
        </div>
      </Section>

      {/* ── COLLECTIVE REFLECTION — Review Section ── */}
      <Section size="sm" maxWidth="7xl" className="mt-16">
        <Divider variant="diamond" className="mb-12" />
        <CollectiveReflectionSection />
      </Section>

    </div>
  );
}

// ── Collective Reflection (inlined) ──────────────────────────────
function CollectiveReflectionSection() {
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [focused, setFocused] = useState(null);
  const [submitHovered, setSubmitHovered] = useState(false);

  const handleSubmit = () => {
    if (!name.trim() || !text.trim() || !rating) return;
    setReviews((prev) => [{
      id: Date.now(), name: name.trim(), rating, text: text.trim(),
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    }, ...prev]);
    setName(""); setText(""); setRating(5);
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  const avg = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;

  const fieldStyle = (key) => ({
    width: "100%", boxSizing: "border-box",
    padding: key === "text" ? "13px 16px" : "0 16px",
    height: key === "text" ? "auto" : "50px",
    background: focused === key ? "#ffffff" : "#faf8f5",
    border: `1.5px solid ${focused === key ? "#b5956a" : "rgba(181,149,106,0.3)"}`,
    borderRadius: "12px", fontSize: "0.88rem", color: "#1a1a1a", outline: "none",
    fontFamily: "Georgia, serif", lineHeight: 1.65,
    transition: "all 0.2s",
    boxShadow: focused === key ? "0 0 0 3px rgba(181,149,106,0.12)" : "none",
    resize: "none",
  });

  const labelStyle = (key) => ({
    display: "block", fontSize: "0.65rem", letterSpacing: "0.14em",
    textTransform: "uppercase", fontWeight: "700", marginBottom: "8px",
    color: focused === key ? "#5c4a3a" : "#b5a898", transition: "color 0.2s",
  });

  return (
    <div style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "32px", flexWrap: "wrap" }}>
        <div style={{
          width: 34, height: 34, borderRadius: "50%", border: "1.5px solid rgba(92,74,58,0.3)",
          display: "flex", alignItems: "center", justifyContent: "center", color: "#5c4a3a", fontSize: "15px"
        }}>
          ◯
        </div>
        <h2 style={{
          fontSize: "1rem", fontWeight: "700", letterSpacing: "0.22em",
          textTransform: "uppercase", color: "#1a1a1a", margin: 0
        }}>
          Collective Reflection
        </h2>
        <span style={{
          background: "#e8e0d8", color: "#5c4a3a", fontSize: "0.72rem", fontWeight: "600",
          padding: "3px 12px", borderRadius: "999px"
        }}>
          {reviews.length} Thought{reviews.length !== 1 ? "s" : ""}
        </span>
        {reviews.length > 0 && (
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "1.8rem", fontWeight: "800", color: "#1a1a1a", lineHeight: 1 }}>
              {(Math.round(avg * 10) / 10).toFixed(1)}
            </span>
            <div>
              <StarRating value={Math.round(avg)} readOnly size={15} />
              <p style={{ fontSize: "0.68rem", color: "#b5a898", marginTop: "3px" }}>{reviews.length} review{reviews.length !== 1 ? "s" : ""}</p>
            </div>
          </div>
        )}
      </div>

      {/* Two-column */}
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1.15fr)", gap: "24px", alignItems: "start" }}>

        {/* LEFT — Form */}
        <div style={{
          background: "#ffffff", borderRadius: "22px", padding: "32px",
          border: "1px solid rgba(181,149,106,0.18)",
          boxShadow: "0 4px 24px rgba(92,74,58,0.07)"
        }}>
          <p style={{
            fontSize: "0.7rem", letterSpacing: "0.2em", textTransform: "uppercase",
            fontWeight: "700", color: "#1a1a1a", marginBottom: "24px"
          }}>
            Share Your Experience
          </p>

          {/* Stars */}
          <div style={{ marginBottom: "20px" }}>
            <label style={labelStyle("rating")}>Rating</label>
            <StarRating value={rating} onChange={setRating} size={30} />
          </div>

          {/* Name */}
          <div style={{ marginBottom: "16px" }}>
            <label style={labelStyle("name")}>Name</label>
            <input type="text" placeholder="e.g. Amira B." value={name}
              onChange={(e) => setName(e.target.value)}
              onFocus={() => setFocused("name")} onBlur={() => setFocused(null)}
              style={fieldStyle("name")} />
          </div>

          {/* Review */}
          <div style={{ marginBottom: "24px" }}>
            <label style={labelStyle("text")}>Review</label>
            <textarea placeholder="How does this piece feel in your home?" value={text}
              onChange={(e) => setText(e.target.value)} rows={4}
              onFocus={() => setFocused("text")} onBlur={() => setFocused(null)}
              style={fieldStyle("text")} />
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            onMouseEnter={() => setSubmitHovered(true)}
            onMouseLeave={() => setSubmitHovered(false)}
            style={{
              width: "100%", height: "52px",
              background: submitted ? "linear-gradient(135deg,#16a34a,#15803d)"
                : submitHovered ? "linear-gradient(135deg,#2a1f17,#3d2f22)"
                  : "linear-gradient(135deg,#1a1a1a,#2d2318)",
              color: "white", border: "none", borderRadius: "999px",
              fontSize: "0.72rem", fontWeight: "700", letterSpacing: "0.2em",
              textTransform: "uppercase", cursor: "pointer", fontFamily: "Georgia, serif",
              transition: "all 0.25s",
              boxShadow: submitHovered ? "0 10px 28px rgba(26,26,26,0.28)" : "0 4px 14px rgba(26,26,26,0.18)",
              transform: submitHovered ? "translateY(-1px)" : "none",
            }}
          >
            {submitted ? "✓ Reflection Shared!" : "Share Reflection"}
          </button>
        </div>

        {/* RIGHT — Reviews or empty state */}
        <div>
          {reviews.length === 0 ? (
            <div style={{
              background: "#f5f1ec", borderRadius: "22px", padding: "64px 32px",
              textAlign: "center", border: "1px solid rgba(181,149,106,0.15)", minHeight: "340px",
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "12px"
            }}>
              <div style={{
                width: 56, height: 56, borderRadius: "50%",
                border: "2px solid rgba(181,149,106,0.25)", display: "flex",
                alignItems: "center", justifyContent: "center", fontSize: "22px",
                color: "rgba(181,149,106,0.4)", marginBottom: "4px"
              }}>
                💬
              </div>
              <p style={{ fontFamily: "Georgia, serif", fontWeight: "700", fontSize: "1.1rem", color: "#1a1a1a" }}>
                Awaiting Reflections
              </p>
              <p style={{
                fontSize: "0.7rem", letterSpacing: "0.16em", textTransform: "uppercase",
                color: "#b5a898", fontWeight: "600"
              }}>
                Be the first to share your journey.
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {reviews.map((r) => (
                <div key={r.id} style={{
                  background: "#ffffff", borderRadius: "18px", padding: "22px 24px",
                  border: "1px solid rgba(181,149,106,0.15)",
                  boxShadow: "0 2px 12px rgba(92,74,58,0.06)"
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                    <ReviewAvatar name={r.name} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{
                        fontFamily: "Georgia,serif", fontWeight: "700", fontSize: "0.88rem",
                        color: "#1a1a1a", marginBottom: "3px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"
                      }}>
                        {r.name}
                      </p>
                      <StarRating value={r.rating} readOnly size={14} />
                    </div>
                    <span style={{ fontSize: "0.7rem", color: "#b5a898", flexShrink: 0 }}>{r.date}</span>
                  </div>
                  <p style={{
                    fontSize: "0.875rem", color: "#6b5d53", lineHeight: 1.7,
                    fontFamily: "Georgia,serif", fontWeight: "300"
                  }}>
                    {r.text}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}