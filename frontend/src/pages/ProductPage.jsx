import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ProductViewer from "../components/ProductViewer/ProductViewer";
import api from "../services/api";
import { PRESET_COLORS } from "../dashboards/stockmanager/ProductCatalogPage";

const IS_MOBILE = /Android|iPhone|iPad|iPod|webOS|BlackBerry|Windows Phone/i.test(
  typeof navigator !== "undefined" ? navigator.userAgent : ""
);

export const COLOR_HEX = Object.fromEntries(
  PRESET_COLORS.map(c => [c.name, c.hex])
);
const LIGHT_COLORS = new Set(["White", "Ivory", "Beige", "Yellow"]);
const BASE = "http://127.0.0.1:8000";
const img = (path) => (path ? `${BASE}/${path}` : null);

/* ── Static review data ── */
const REVIEWS = [
  { name: "Yasmine B.", wilaya: "Constantine", rating: 5, date: "March 2026", text: "Absolutely breathtaking piece. The finish is immaculate and it arrived perfectly wrapped. The AR preview was spot-on — it fits the corner exactly as I imagined." },
  { name: "Karim M.", wilaya: "Sétif", rating: 5, date: "February 2026", text: "Worth every dinar. The craftsmanship is leagues above anything I've found locally. My living room finally feels complete." },
  { name: "Lina H.", wilaya: "Annaba", rating: 4, date: "January 2026", text: "Delivery was smooth and the packaging was luxurious. Slight colour variation from the screen but still beautiful in person. Would order again without hesitation." },
  { name: "Anis T.", wilaya: "Batna", rating: 5, date: "December 2025", text: "The 3D viewer made all the difference. I previewed it for a week before buying and it looked identical when it arrived. Exceptional service." },
];

const Stars = ({ count, size = 12 }) => (
  <div style={{ display: "flex", gap: "2px" }}>
    {[1, 2, 3, 4, 5].map(i => (
      <svg key={i} width={size} height={size} viewBox="0 0 24 24" fill={i <= count ? "#C8A96A" : "none"} stroke="#C8A96A" strokeWidth="1.5">
        <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
      </svg>
    ))}
  </div>
);

const GoldRule = () => (
  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
    <div style={{ height: "1px", flex: 1, background: "linear-gradient(to right, transparent, rgba(200,169,106,0.5))" }} />
    <div style={{ width: "5px", height: "5px", background: "#C8A96A", transform: "rotate(45deg)", flexShrink: 0 }} />
    <div style={{ height: "1px", flex: 1, background: "linear-gradient(to left, transparent, rgba(200,169,106,0.5))" }} />
  </div>
);

const GoldRuleShort = ({ maxWidth = "14rem" }) => (
  <div style={{ display: "flex", alignItems: "center", gap: "6px", maxWidth }}>
    <div style={{ height: "1px", flex: 1, background: "#C8A96A", opacity: 0.55 }} />
    <div style={{ width: "4px", height: "4px", background: "#C8A96A", transform: "rotate(45deg)", opacity: 0.7, flexShrink: 0 }} />
    <div style={{ height: "1px", flex: 1, background: "#C8A96A", opacity: 0.55 }} />
  </div>
);

export function ProductPage() {
  const { productId } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [cartMsg, setCartMsg] = useState("");
  const [favMsg, setFavMsg] = useState("");
  const [activeColor, setActiveColor] = useState(null);
  const [activeImg, setActiveImg] = useState(null);
  const [showViewer, setShowViewer] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@400;700;900&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&display=swap";
    document.head.appendChild(link);
    return () => document.head.removeChild(link);
  }, []);

  useEffect(() => {
    api.get(`/api/products/${productId}`)
      .then(res => {
        const p = res.data;
        setProduct(p);
        if (p.colors?.length) setActiveColor(p.colors[0]);
        setActiveImg(p.images?.[0] ?? p.image_url ?? null);
        setTimeout(() => setMounted(true), 60);
      })
      .catch(() => navigate("/furniture"));
  }, [productId, navigate]);

  useEffect(() => { setShowViewer(false); }, [productId]);

  const handleAddToCart = async () => {
    try {
      await api.post("/api/cart", null, { params: { product_id: product.id, quantity: 1 } });
      setCartMsg("Added to cart!"); setTimeout(() => setCartMsg(""), 2500);
    } catch (err) {
      if (err.response?.status === 401) navigate("/login");
      else setCartMsg("Failed to add");
    }
  };

  const handleAddToFavorites = async () => {
    try {
      await api.post("/api/favorites", null, { params: { product_id: product.id } });
      setFavMsg("Added to favourites!"); setTimeout(() => setFavMsg(""), 2500);
    } catch (err) {
      if (err.response?.status === 401) navigate("/login");
      else setFavMsg("Failed to add");
    }
  };

  /* ── Loading ── */
  if (!product) return (
    <div style={{ minHeight: "100vh", background: "#F5F0E8", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Cormorant Garamond',Georgia,serif" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1.5rem" }}>
        <div style={{ position: "relative", width: "48px", height: "48px" }}>
          <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "1px solid #C8A96A", borderTopColor: "transparent", animation: "spin 1s linear infinite" }} />
          <div style={{ position: "absolute", inset: "5px", borderRadius: "50%", border: "1px solid rgba(200,169,106,0.25)" }} />
        </div>
        <p style={{ fontFamily: "sans-serif", fontSize: "0.575rem", letterSpacing: "0.42em", textTransform: "uppercase", color: "#9E8E7A" }}>Loading product</p>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}`}</style>
      </div>
    </div>
  );

  const originalPrice = product.price ? Math.round(product.price * 1.19) : null;
  const allImages = product.images ?? (product.image_url ? [product.image_url] : []);
  const thumbnails = allImages.filter(s => s !== activeImg);
  const avgRating = (REVIEWS.reduce((s, r) => s + r.rating, 0) / REVIEWS.length).toFixed(1);

  const base = { minHeight: "100vh", background: "#F5F0E8", color: "#1C1916", fontFamily: "'Cormorant Garamond',Georgia,serif", overflowX: "hidden" };

  return (
    <div style={base}>
      <style>{`
        @keyframes spin    { to { transform:rotate(360deg); } }
        @keyframes fadeUp  { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:none; } }
        @keyframes fadeIn  { from { opacity:0; } to { opacity:1; } }
      `}</style>

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "clamp(7rem,12vw,9rem) 1.5rem 0" }}>

        {/* ── Back link ── */}
        <button onClick={() => navigate("/furniture")} style={{
          display: "inline-flex", alignItems: "center", gap: "6px",
          fontFamily: "sans-serif", fontSize: "0.55rem", letterSpacing: "0.28em", textTransform: "uppercase",
          color: "#9E8E7A", background: "none", border: "none", cursor: "pointer", marginBottom: "2.5rem",
          transition: "color 0.2s",
        }}
          onMouseEnter={e => e.currentTarget.style.color = "#1C1916"}
          onMouseLeave={e => e.currentTarget.style.color = "#9E8E7A"}
        >
          <span style={{ color: "#C8A96A" }}>←</span> Back to Collection
        </button>

        {/* ── Main two-col grid ── */}
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "4rem", alignItems: "start",
          opacity: mounted ? 1 : 0, transition: "opacity 0.5s ease",
        }}>

          {/* ── LEFT: Visuals ── */}
          <div>
            {/* Main image / viewer */}
            <div style={{ position: "relative", borderRadius: "20px", overflow: "hidden", border: "1px solid rgba(200,169,106,0.2)" }}>
              {!showViewer ? (
                <>
                  {activeImg
                    ? <img src={img(activeImg)} alt={product.name} style={{ width: "100%", aspectRatio: "4/3", objectFit: "cover", display: "block" }} />
                    : <div style={{ width: "100%", aspectRatio: "4/3", background: "#EDE7D9", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <span style={{ fontFamily: "sans-serif", fontSize: "0.55rem", letterSpacing: "0.3em", textTransform: "uppercase", color: "#9E8E7A" }}>No image</span>
                    </div>
                  }

                  {product.best_seller && (
                    <div style={{ position: "absolute", top: "16px", left: "16px", padding: "0.35rem 1rem", background: "rgba(245,240,232,0.92)", borderRadius: "2rem", fontFamily: "sans-serif", fontSize: "0.5rem", letterSpacing: "0.28em", textTransform: "uppercase", color: "#9A7D4A", border: "1px solid rgba(200,169,106,0.35)" }}>
                      Best Seller
                    </div>
                  )}

                  {/* 3D / AR buttons */}
                  <div style={{ position: "absolute", bottom: "16px", right: "16px", display: "flex", gap: "8px" }}>
                    {IS_MOBILE && (product.able_ar ?? product.model_src) && (
                      <button onClick={() => { setShowViewer(true); setTimeout(() => document.querySelector("model-viewer")?.activateAR?.(), 300); }}
                        style={{ display: "flex", alignItems: "center", gap: "6px", padding: "0.5rem 1rem", background: "rgba(245,240,232,0.92)", border: "1px solid rgba(200,169,106,0.35)", borderRadius: "2rem", fontFamily: "sans-serif", fontSize: "0.52rem", letterSpacing: "0.22em", textTransform: "uppercase", color: "#9A7D4A", cursor: "pointer" }}>
                        View in AR
                      </button>
                    )}
                    {product.model_src && (
                      <button onClick={() => setShowViewer(true)}
                        style={{ display: "flex", alignItems: "center", gap: "6px", padding: "0.5rem 1rem", background: "#1C1916", border: "1px solid #1C1916", borderRadius: "2rem", fontFamily: "sans-serif", fontSize: "0.52rem", letterSpacing: "0.22em", textTransform: "uppercase", color: "#F5F0E8", cursor: "pointer" }}>
                        View in 3D
                      </button>
                    )}
                  </div>
                </>
              ) : (
                <div style={{ position: "relative" }}>
                  <ProductViewer modelSrc={product.model_src} iosSrc={product.ios_src} productName={product.name} price={product.price} />
                  <button onClick={() => setShowViewer(false)} style={{ position: "absolute", top: "12px", left: "12px", padding: "0.45rem 1rem", background: "rgba(245,240,232,0.92)", border: "1px solid rgba(200,169,106,0.35)", borderRadius: "2rem", fontFamily: "sans-serif", fontSize: "0.52rem", letterSpacing: "0.22em", textTransform: "uppercase", color: "#9A7D4A", cursor: "pointer" }}>
                    ← Photo
                  </button>
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {thumbnails.length > 0 && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "10px", marginTop: "12px" }}>
                {thumbnails.slice(0, 3).map((src, i) => (
                  <div key={i} onClick={() => setActiveImg(src)} style={{
                    borderRadius: "12px", overflow: "hidden", aspectRatio: "1/1", cursor: "pointer",
                    border: `1.5px solid ${activeImg === src ? "rgba(200,169,106,0.7)" : "rgba(200,169,106,0.2)"}`,
                    opacity: activeImg === src ? 1 : 0.65,
                    transition: "all 0.2s",
                  }}>
                    <img src={img(src)} alt={`view ${i + 2}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── RIGHT: Details ── */}
          <div style={{ position: "sticky", top: "6rem", display: "flex", flexDirection: "column", gap: "2rem" }}>

            {/* Category + title + price */}
            <div>
              <p style={{ fontFamily: "sans-serif", fontSize: "0.55rem", letterSpacing: "0.38em", textTransform: "uppercase", color: "#9E8E7A", marginBottom: "0.85rem" }}>
                {product.category}
              </p>
              <h1 style={{ fontFamily: "'Cinzel Decorative',serif", fontSize: "clamp(1.5rem,4vw,2.4rem)", fontWeight: 700, letterSpacing: "0.035em", lineHeight: 1.1, color: "#1C1916", marginBottom: "1.25rem" }}>
                {product.name}
              </h1>
              <GoldRuleShort />

              <div style={{ display: "flex", alignItems: "baseline", gap: "12px", marginTop: "1.25rem" }}>
                <span style={{ fontFamily: "'Cinzel Decorative',serif", fontSize: "1.4rem", fontWeight: 700, color: "#9A7D4A" }}>
                  {Number(product.price).toLocaleString()} DA
                </span>
                {originalPrice && (
                  <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "1.1rem", color: "rgba(158,142,122,0.45)", textDecoration: "line-through", fontStyle: "italic" }}>
                    {Number(originalPrice).toLocaleString()} DA
                  </span>
                )}
              </div>

              {/* Star summary */}
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "0.85rem" }}>
                <Stars count={5} size={11} />
                <span style={{ fontFamily: "sans-serif", fontSize: "0.52rem", letterSpacing: "0.18em", color: "#9E8E7A", textTransform: "uppercase" }}>
                  {avgRating} · {REVIEWS.length} reviews
                </span>
              </div>
            </div>

            {/* Description */}
            <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "1.1rem", fontWeight: 300, fontStyle: "italic", color: "#6B5F52", lineHeight: 1.9 }}>
              {product.description}
            </p>

            {/* Feature pills */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {["Sustainably Sourced", "Stain Resistant", "Free Delivery"].map(tag => (
                <span key={tag} style={{ padding: "0.35rem 1rem", background: "#EDE7D9", border: "1px solid rgba(200,169,106,0.25)", borderRadius: "2rem", fontFamily: "sans-serif", fontSize: "0.5rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "#9A7D4A" }}>
                  {tag}
                </span>
              ))}
            </div>

            <GoldRule />

            {/* Color swatches */}
            {product.colors?.length > 0 && (
              <div>
                <p style={{ fontFamily: "sans-serif", fontSize: "0.55rem", letterSpacing: "0.3em", textTransform: "uppercase", color: "#9E8E7A", marginBottom: "0.85rem" }}>
                  Select Colour
                  {activeColor && <span style={{ color: "#9A7D4A", marginLeft: "8px" }}>— {activeColor}</span>}
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
                  {product.colors.map(colorName => {
                    const hex = COLOR_HEX[colorName] || COLOR_HEX[Object.keys(COLOR_HEX).find(k => k.toLowerCase() === colorName?.toLowerCase())] || "#d1d5db";
                    const isLight = LIGHT_COLORS.has(colorName);
                    const isActive = activeColor === colorName;
                    return (
                      <button key={colorName} title={colorName} onClick={() => setActiveColor(colorName)} style={{
                        width: "36px", height: "36px", borderRadius: "50%", background: hex, cursor: "pointer",
                        outline: isActive ? `2px solid ${isLight ? "#9A7D4A" : hex}` : "2px solid transparent",
                        outlineOffset: "3px",
                        boxShadow: isLight ? "inset 0 0 0 1px rgba(200,169,106,0.4)" : "0 2px 6px rgba(0,0,0,0.15)",
                        transform: isActive ? "scale(1.15)" : "scale(1)",
                        transition: "all 0.2s",
                        border: "none",
                      }} />
                    );
                  })}
                </div>
              </div>
            )}

            {/* CTA buttons */}
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <button onClick={handleAddToCart} style={{
                width: "100%", padding: "0.9rem", background: "#1C1916", border: "1px solid #1C1916", borderRadius: "2rem",
                fontFamily: "sans-serif", fontSize: "0.57rem", letterSpacing: "0.28em", textTransform: "uppercase",
                color: "#F5F0E8", cursor: "pointer", transition: "background 0.2s",
              }}
                onMouseEnter={e => e.currentTarget.style.background = "#3D2F1F"}
                onMouseLeave={e => e.currentTarget.style.background = "#1C1916"}
              >
                Add to Cart
              </button>
              <button onClick={handleAddToFavorites} style={{
                width: "100%", padding: "0.85rem", background: "transparent", border: "1.5px solid rgba(200,169,106,0.4)", borderRadius: "2rem",
                fontFamily: "sans-serif", fontSize: "0.57rem", letterSpacing: "0.28em", textTransform: "uppercase",
                color: "#9A7D4A", cursor: "pointer", transition: "background 0.2s",
              }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(200,169,106,0.1)"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >
                Add to Favourites
              </button>

              <p style={{ textAlign: "center", fontFamily: "sans-serif", fontSize: "0.5rem", letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(158,142,122,0.5)", marginTop: "4px" }}>
                Free white-glove delivery in 4–6 weeks
              </p>
            </div>

            {/* Toast messages */}
            {cartMsg && (
              <div style={{ padding: "0.65rem 1rem", background: cartMsg.startsWith("F") ? "rgba(180,60,60,0.08)" : "rgba(74,124,89,0.08)", border: `1px solid ${cartMsg.startsWith("F") ? "rgba(180,60,60,0.25)" : "rgba(74,124,89,0.25)"}`, borderRadius: "12px", fontFamily: "sans-serif", fontSize: "0.55rem", letterSpacing: "0.2em", textTransform: "uppercase", color: cartMsg.startsWith("F") ? "#993333" : "#4A7C59", textAlign: "center", animation: "fadeIn 0.2s ease" }}>
                {cartMsg}
              </div>
            )}
            {favMsg && (
              <div style={{ padding: "0.65rem 1rem", background: "rgba(74,124,89,0.08)", border: "1px solid rgba(74,124,89,0.25)", borderRadius: "12px", fontFamily: "sans-serif", fontSize: "0.55rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "#4A7C59", textAlign: "center", animation: "fadeIn 0.2s ease" }}>
                {favMsg}
              </div>
            )}

            {/* Roomie teaser */}
            <div style={{ display: "flex", alignItems: "center", gap: "16px", padding: "1.25rem 1.5rem", background: "#EDE7D9", border: "1px solid rgba(200,169,106,0.22)", borderRadius: "14px" }}>
              <div style={{ width: "44px", height: "44px", borderRadius: "50%", background: "#1C1916", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C8A96A" strokeWidth="1.5"><rect x="3" y="8" width="18" height="12" rx="3" /><path d="M8 8V6a4 4 0 018 0v2" /><circle cx="9" cy="14" r="1" fill="#C8A96A" /><circle cx="15" cy="14" r="1" fill="#C8A96A" /></svg>
              </div>
              <div>
                <p style={{ fontFamily: "'Cinzel Decorative',serif", fontSize: "0.7rem", letterSpacing: "0.04em", color: "#1C1916", marginBottom: "3px" }}>Need styling advice?</p>
                <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "0.95rem", fontStyle: "italic", fontWeight: 300, color: "#6B5F52", lineHeight: 1.5 }}>Roomie is online and ready to help.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Why it's magical ── */}
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "5rem 1.5rem" }}>
        <GoldRule />

        <div style={{ marginTop: "3.5rem" }}>
          <p style={{ fontFamily: "sans-serif", fontSize: "0.575rem", letterSpacing: "0.38em", textTransform: "uppercase", color: "#9E8E7A", marginBottom: "1rem" }}>
            Craftsmanship
          </p>
          <h2 style={{ fontFamily: "'Cinzel Decorative',serif", fontSize: "clamp(1.4rem,3.5vw,2rem)", fontWeight: 700, letterSpacing: "0.04em", color: "#1C1916", marginBottom: "1.5rem" }}>
            Why It's Magical
          </h2>
          <GoldRuleShort />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: "1.25rem", marginTop: "2.5rem" }}>
          {/* Wide feature card */}
          <div style={{ gridColumn: "span 2", background: "#EDE7D9", border: "1px solid rgba(200,169,106,0.22)", borderRadius: "16px", padding: "2.25rem", position: "relative", overflow: "hidden", minHeight: "200px", display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
            <div style={{ position: "absolute", top: "-40px", right: "-40px", width: "200px", height: "200px", borderRadius: "50%", background: "rgba(200,169,106,0.1)", filter: "blur(40px)", pointerEvents: "none" }} />
            <p style={{ fontFamily: "'Cinzel Decorative',serif", fontSize: "0.95rem", fontWeight: 700, color: "#1C1916", marginBottom: "0.6rem" }}>Ergonomic Cloud-Tech</p>
            <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "1.05rem", fontStyle: "italic", fontWeight: 300, color: "#6B5F52", lineHeight: 1.85, maxWidth: "30rem" }}>
              Our patented internal structure adapts to your body's pressure points instantly, mimicking the buoyancy of water without the mess.
            </p>
          </div>

          {/* Warranty card */}
          <div style={{ background: "#2C1F10", border: "1px solid rgba(200,169,106,0.2)", borderRadius: "16px", padding: "2.25rem", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#C8A96A" strokeWidth="1.2" style={{ marginBottom: "1rem" }}><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" /></svg>
            <p style={{ fontFamily: "'Cinzel Decorative',serif", fontSize: "0.8rem", color: "#C8A96A", marginBottom: "0.5rem" }}>Lifetime Warranty</p>
            <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "0.95rem", fontStyle: "italic", fontWeight: 300, color: "rgba(232,220,200,0.7)", lineHeight: 1.7 }}>Guaranteed frame & foam, forever.</p>
          </div>

          {[
            { title: "AR Preview", body: "See it in your room before buying" },
            { title: "Custom Colours", body: `${product.colors?.length ?? 0} options available` },
            { title: "Free Delivery", body: "Arrives in 5–7 business days" },
          ].map(f => (
            <div key={f.title} style={{ background: "#EDE7D9", border: "1px solid rgba(200,169,106,0.22)", borderRadius: "16px", padding: "1.75rem" }}>
              <div style={{ width: "1px", height: "2rem", background: "linear-gradient(to bottom, transparent, #C8A96A)", marginBottom: "1rem" }} />
              <p style={{ fontFamily: "'Cinzel Decorative',serif", fontSize: "0.75rem", color: "#1C1916", marginBottom: "0.5rem" }}>{f.title}</p>
              <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "1rem", fontStyle: "italic", fontWeight: 300, color: "#6B5F52", lineHeight: 1.75 }}>{f.body}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Customer Reviews ── */}
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 1.5rem 7rem" }}>
        <GoldRule />

        <div style={{ marginTop: "3.5rem", marginBottom: "2.5rem" }}>
          <p style={{ fontFamily: "sans-serif", fontSize: "0.575rem", letterSpacing: "0.38em", textTransform: "uppercase", color: "#9E8E7A", marginBottom: "1rem" }}>
            What They Say
          </p>
          <h2 style={{ fontFamily: "'Cinzel Decorative',serif", fontSize: "clamp(1.4rem,3.5vw,2rem)", fontWeight: 700, letterSpacing: "0.04em", color: "#1C1916", marginBottom: "1.25rem" }}>
            Customer Reviews
          </h2>
          <GoldRuleShort />

          {/* Aggregate */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "1.5rem" }}>
            <span style={{ fontFamily: "'Cinzel Decorative',serif", fontSize: "2.5rem", fontWeight: 700, color: "#9A7D4A" }}>{avgRating}</span>
            <div>
              <Stars count={5} size={14} />
              <p style={{ fontFamily: "sans-serif", fontSize: "0.52rem", letterSpacing: "0.22em", textTransform: "uppercase", color: "#9E8E7A", marginTop: "4px" }}>
                Based on {REVIEWS.length} reviews
              </p>
            </div>
          </div>
        </div>

        {/* Review grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: "1.25rem" }}>
          {REVIEWS.map((r, i) => (
            <div key={i} style={{
              background: "#EDE7D9", border: "1px solid rgba(200,169,106,0.22)", borderRadius: "16px",
              padding: "1.75rem 2rem",
              opacity: mounted ? 1 : 0,
              transform: mounted ? "translateY(0)" : "translateY(16px)",
              transition: `opacity 0.55s ease ${i * 0.1}s, transform 0.55s ease ${i * 0.1}s`,
            }}>
              {/* Top row */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
                <div>
                  <p style={{ fontFamily: "'Cinzel Decorative',serif", fontSize: "0.72rem", letterSpacing: "0.04em", color: "#1C1916", marginBottom: "3px" }}>{r.name}</p>
                  <p style={{ fontFamily: "sans-serif", fontSize: "0.5rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "#9E8E7A" }}>{r.wilaya}</p>
                </div>
                <Stars count={r.rating} size={11} />
              </div>

              {/* Thin gold line */}
              <div style={{ height: "1px", background: "rgba(200,169,106,0.25)", marginBottom: "1rem" }} />

              {/* Review text */}
              <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "1.05rem", fontStyle: "italic", fontWeight: 300, color: "#6B5F52", lineHeight: 1.85 }}>
                "{r.text}"
              </p>

              {/* Date */}
              <p style={{ fontFamily: "sans-serif", fontSize: "0.5rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(158,142,122,0.45)", marginTop: "1rem" }}>
                {r.date}
              </p>
            </div>
          ))}
        </div>

        {/* Footer signature */}
        <div style={{ display: "flex", justifyContent: "center", marginTop: "3.5rem" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1.25rem" }}>
            <GoldRule />
            <span style={{ fontFamily: "'Cinzel Decorative',serif", fontSize: "0.55rem", letterSpacing: "0.5em", textTransform: "uppercase", color: "rgba(200,169,106,0.35)" }}>
              enter your sanctuary
            </span>
          </div>
        </div>
      </div>

    </div>
  );
}