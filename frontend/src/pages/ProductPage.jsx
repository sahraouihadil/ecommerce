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

/* ── Helpers ── */
const Stars = ({ count, size = 12 }) => (
  <div style={{ display: "flex", gap: "2px" }}>
    {[1, 2, 3, 4, 5].map(i => (
      <svg key={i} width={size} height={size} viewBox="0 0 24 24"
        fill={i <= count ? "#C8A96A" : "none"} stroke="#C8A96A" strokeWidth="1.5">
        <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
      </svg>
    ))}
  </div>
);

const InteractiveStars = ({ value, onChange, size = 22 }) => {
  const [hovered, setHovered] = useState(0);
  return (
    <div style={{ display: "flex", gap: "4px", cursor: "pointer" }}>
      {[1, 2, 3, 4, 5].map(i => (
        <svg
          key={i}
          width={size} height={size} viewBox="0 0 24 24"
          fill={i <= (hovered || value) ? "#C8A96A" : "none"}
          stroke="#C8A96A" strokeWidth="1.5"
          style={{ transition: "transform 0.15s ease", transform: i <= (hovered || value) ? "scale(1.15)" : "scale(1)" }}
          onMouseEnter={() => setHovered(i)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(i)}
        >
          <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
        </svg>
      ))}
    </div>
  );
};

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

/* ── Review form (logged-in only) ── */
function AddReviewForm({ productId, onSubmitted }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [isError, setIsError] = useState(false);
  const [focused, setFocused] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) { setIsError(true); setMsg("Please select a star rating."); return; }
    if (!comment.trim()) { setIsError(true); setMsg("Please write a comment."); return; }

    setLoading(true);
    setMsg("");
    try {
      await api.post(`/api/products/${productId}/reviews`, {
        rating,
        comment: comment.trim(),
      });
      setSubmitted(true);
      setIsError(false);
      setMsg("Your review has been posted.");
      onSubmitted();
    } catch (err) {
      setIsError(true);
      setMsg(err?.response?.data?.detail || "Failed to submit review.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div style={{
        background: "#EDE7D9", border: "1px solid rgba(200,169,106,0.3)", borderRadius: "16px",
        padding: "2.5rem", textAlign: "center",
        animation: "fadeUp 0.5s ease both",
      }}>
        <div style={{
          width: "56px", height: "56px", borderRadius: "50%",
          border: "1px solid rgba(200,169,106,0.45)",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 1.25rem",
          animation: "popIn 0.6s cubic-bezier(0.34,1.56,0.64,1) both",
        }}>
          <svg width="22" height="22" viewBox="0 0 28 28" fill="none">
            <polyline points="5,14 11,20 23,8" stroke="#C8A96A" strokeWidth="1.5"
              strokeLinecap="round" strokeLinejoin="round"
              strokeDasharray="40" strokeDashoffset="0"
              style={{ animation: "checkDraw 0.5s ease 0.3s both" }} />
          </svg>
        </div>
        <p style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: "0.85rem", color: "#1C1916", marginBottom: "0.5rem" }}>
          Thank You
        </p>
        <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1rem", fontStyle: "italic", fontWeight: 300, color: "#6B5F52" }}>
          Your review has been published.
        </p>
      </div>
    );
  }

  return (
    <div style={{
      background: "#EDE7D9",
      border: "1px solid rgba(200,169,106,0.3)",
      borderRadius: "16px",
      padding: "2.25rem 2.5rem",
    }}>
      <p style={{
        fontFamily: "sans-serif", fontSize: "0.55rem", letterSpacing: "0.38em",
        textTransform: "uppercase", color: "#9E8E7A", marginBottom: "0.75rem",
      }}>
        Share Your Experience
      </p>
      <h3 style={{
        fontFamily: "'Cinzel Decorative', serif", fontSize: "1rem", fontWeight: 700,
        color: "#1C1916", marginBottom: "1.25rem",
      }}>
        Write a Review
      </h3>
      <GoldRuleShort />

      <div style={{ marginTop: "1.75rem", marginBottom: "1.75rem" }}>
        <p style={{
          fontFamily: "sans-serif", fontSize: "0.5rem", letterSpacing: "0.28em",
          textTransform: "uppercase", color: "#9E8E7A", marginBottom: "0.75rem",
        }}>
          Your Rating
        </p>
        <InteractiveStars value={rating} onChange={setRating} />
      </div>

      <div style={{ marginBottom: "1.75rem" }}>
        <p style={{
          fontFamily: "sans-serif", fontSize: "0.5rem", letterSpacing: "0.28em",
          textTransform: "uppercase",
          color: focused ? "#C8A96A" : "#9E8E7A",
          marginBottom: "0.75rem",
          transition: "color 0.25s ease",
        }}>
          Your Comment
        </p>
        <textarea
          value={comment}
          onChange={e => setComment(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          rows={4}
          placeholder="Tell others what you think about this piece…"
          style={{
            width: "100%",
            background: "transparent",
            border: "none",
            borderBottom: `1px solid ${focused ? "#C8A96A" : "rgba(200,169,106,0.3)"}`,
            padding: "10px 0",
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "1rem",
            fontStyle: "italic",
            fontWeight: 300,
            color: "#1C1916",
            resize: "none",
            outline: "none",
            lineHeight: 1.8,
            caretColor: "#C8A96A",
            transition: "border-color 0.25s ease",
            boxSizing: "border-box",
          }}
        />
        <div style={{
          display: "flex", justifyContent: "flex-end",
          fontFamily: "sans-serif", fontSize: "0.48rem", letterSpacing: "0.2em",
          color: "rgba(158,142,122,0.4)", marginTop: "6px",
        }}>
          {comment.length} / 500
        </div>
      </div>

      {msg && (
        <p style={{
          marginBottom: "1.25rem",
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: "0.9rem",
          fontStyle: "italic",
          color: isError ? "#c0392b" : "#5a8a6a",
        }}>
          {msg}
        </p>
      )}

      <SubmitButton onClick={handleSubmit} loading={loading} disabled={loading} />
    </div>
  );
}

function SubmitButton({ onClick, loading, disabled }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "inline-flex", alignItems: "center", gap: "0.75rem",
        padding: "0 2rem", height: "48px",
        background: disabled ? "transparent" : hovered ? "#1C1916" : "transparent",
        color: disabled ? "rgba(200,169,106,0.3)" : hovered ? "#FAF8F4" : "#C8A96A",
        border: `1px solid ${disabled ? "rgba(200,169,106,0.15)" : hovered ? "#1C1916" : "rgba(200,169,106,0.55)"}`,
        borderRadius: 0,
        fontFamily: "sans-serif", fontSize: "0.58rem", fontWeight: 600,
        letterSpacing: "0.28em", textTransform: "uppercase",
        cursor: disabled ? "not-allowed" : "pointer",
        transition: "all 0.25s ease", outline: "none",
      }}
    >
      {loading ? "Posting…" : (
        <>
          Post Review
          <span style={{
            display: "inline-block",
            transition: "transform 0.3s ease",
            transform: hovered && !disabled ? "translateX(5px)" : "none",
            fontSize: "0.875rem",
          }}>→</span>
        </>
      )}
    </button>
  );
}

/* ── Main component ── */
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

  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [userChecked, setUserChecked] = useState(false);

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@400;700;900&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&display=swap";
    document.head.appendChild(link);
    return () => document.head.removeChild(link);
  }, []);

  // ── ✅ FIX: كان /api/me وهو غير موجود، صار /profile ──
  useEffect(() => {
    api.get("/profile")
      .then(res => { setCurrentUser(res.data); })
      .catch(() => { setCurrentUser(null); })
      .finally(() => setUserChecked(true));
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

  const fetchReviews = () => {
    setReviewsLoading(true);
    api.get(`/api/products/${productId}/reviews`)
      .then(res => setReviews(res.data))
      .catch(() => setReviews([]))
      .finally(() => setReviewsLoading(false));
  };

  useEffect(() => {
    fetchReviews();
  }, [productId]);

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
  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  const base = {
    minHeight: "100vh", background: "#F5F0E8", color: "#1C1916",
    fontFamily: "'Cormorant Garamond',Georgia,serif", overflowX: "hidden",
  };

  return (
    <div style={base}>
      <style>{`
        @keyframes spin    { to { transform:rotate(360deg); } }
        @keyframes fadeUp  { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:none; } }
        @keyframes fadeIn  { from { opacity:0; } to { opacity:1; } }
        @keyframes popIn   { from { transform:scale(0.5); opacity:0; } to { transform:scale(1); opacity:1; } }
        @keyframes checkDraw { from { stroke-dashoffset:40; } to { stroke-dashoffset:0; } }
        ::placeholder { color:rgba(158,142,122,0.45); font-style:italic; }
      `}</style>

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "clamp(7rem,12vw,9rem) 1.5rem 0" }}>

        <button onClick={() => navigate("/furniture")} style={{
          display: "inline-flex", alignItems: "center", gap: "6px",
          fontFamily: "sans-serif", fontSize: "0.55rem", letterSpacing: "0.28em", textTransform: "uppercase",
          color: "#9E8E7A", background: "none", border: "none", cursor: "pointer", marginBottom: "2.5rem", transition: "color 0.2s",
        }}
          onMouseEnter={e => e.currentTarget.style.color = "#1C1916"}
          onMouseLeave={e => e.currentTarget.style.color = "#9E8E7A"}
        >
          <span style={{ color: "#C8A96A" }}>←</span> Back to Collection
        </button>

        <div style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "4rem", alignItems: "start",
          opacity: mounted ? 1 : 0, transition: "opacity 0.5s ease",
        }}>
          {/* LEFT: Visuals */}
          <div>
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

            {thumbnails.length > 0 && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "10px", marginTop: "12px" }}>
                {thumbnails.slice(0, 3).map((src, i) => (
                  <div key={i} onClick={() => setActiveImg(src)} style={{
                    borderRadius: "12px", overflow: "hidden", aspectRatio: "1/1", cursor: "pointer",
                    border: `1.5px solid ${activeImg === src ? "rgba(200,169,106,0.7)" : "rgba(200,169,106,0.2)"}`,
                    opacity: activeImg === src ? 1 : 0.65, transition: "all 0.2s",
                  }}>
                    <img src={img(src)} alt={`view ${i + 2}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT: Details */}
          <div style={{ position: "sticky", top: "6rem", display: "flex", flexDirection: "column", gap: "2rem" }}>
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
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "0.85rem" }}>
                {avgRating ? (
                  <>
                    <Stars count={Math.round(parseFloat(avgRating))} size={11} />
                    <span style={{ fontFamily: "sans-serif", fontSize: "0.52rem", letterSpacing: "0.18em", color: "#9E8E7A", textTransform: "uppercase" }}>
                      {avgRating} · {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
                    </span>
                  </>
                ) : (
                  <span style={{ fontFamily: "sans-serif", fontSize: "0.52rem", letterSpacing: "0.18em", color: "rgba(158,142,122,0.45)", textTransform: "uppercase" }}>
                    No reviews yet
                  </span>
                )}
              </div>
            </div>

            <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "1.1rem", fontWeight: 300, fontStyle: "italic", color: "#6B5F52", lineHeight: 1.9 }}>
              {product.description}
            </p>

            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {["Sustainably Sourced", "Stain Resistant", "Free Delivery"].map(tag => (
                <span key={tag} style={{ padding: "0.35rem 1rem", background: "#EDE7D9", border: "1px solid rgba(200,169,106,0.25)", borderRadius: "2rem", fontFamily: "sans-serif", fontSize: "0.5rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "#9A7D4A" }}>
                  {tag}
                </span>
              ))}
            </div>

            <GoldRule />

            {product.colors?.length > 0 && (
              <div>
                <p style={{ fontFamily: "sans-serif", fontSize: "0.55rem", letterSpacing: "0.3em", textTransform: "uppercase", color: "#9E8E7A", marginBottom: "0.85rem" }}>
                  Select Colour{activeColor && <span style={{ color: "#9A7D4A", marginLeft: "8px" }}>— {activeColor}</span>}
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
                  {product.colors.map(colorName => {
                    const hex = COLOR_HEX[colorName] || "#d1d5db";
                    const isLight = LIGHT_COLORS.has(colorName);
                    const isActive = activeColor === colorName;
                    return (
                      <button key={colorName} title={colorName} onClick={() => setActiveColor(colorName)} style={{
                        width: "36px", height: "36px", borderRadius: "50%", background: hex, cursor: "pointer",
                        outline: isActive ? `2px solid ${isLight ? "#9A7D4A" : hex}` : "2px solid transparent",
                        outlineOffset: "3px",
                        boxShadow: isLight ? "inset 0 0 0 1px rgba(200,169,106,0.4)" : "0 2px 6px rgba(0,0,0,0.15)",
                        transform: isActive ? "scale(1.15)" : "scale(1)",
                        transition: "all 0.2s", border: "none",
                      }} />
                    );
                  })}
                </div>
              </div>
            )}

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
          <p style={{ fontFamily: "sans-serif", fontSize: "0.575rem", letterSpacing: "0.38em", textTransform: "uppercase", color: "#9E8E7A", marginBottom: "1rem" }}>Craftsmanship</p>
          <h2 style={{ fontFamily: "'Cinzel Decorative',serif", fontSize: "clamp(1.4rem,3.5vw,2rem)", fontWeight: 700, letterSpacing: "0.04em", color: "#1C1916", marginBottom: "1.5rem" }}>Why It's Magical</h2>
          <GoldRuleShort />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: "1.25rem", marginTop: "2.5rem" }}>
          <div style={{ gridColumn: "span 2", background: "#EDE7D9", border: "1px solid rgba(200,169,106,0.22)", borderRadius: "16px", padding: "2.25rem", position: "relative", overflow: "hidden", minHeight: "200px", display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
            <div style={{ position: "absolute", top: "-40px", right: "-40px", width: "200px", height: "200px", borderRadius: "50%", background: "rgba(200,169,106,0.1)", filter: "blur(40px)", pointerEvents: "none" }} />
            <p style={{ fontFamily: "'Cinzel Decorative',serif", fontSize: "0.95rem", fontWeight: 700, color: "#1C1916", marginBottom: "0.6rem" }}>Ergonomic Cloud-Tech</p>
            <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "1.05rem", fontStyle: "italic", fontWeight: 300, color: "#6B5F52", lineHeight: 1.85, maxWidth: "30rem" }}>
              Our patented internal structure adapts to your body's pressure points instantly, mimicking the buoyancy of water without the mess.
            </p>
          </div>
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

      {/* ── REVIEWS SECTION ── */}
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

          {avgRating && (
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "1.5rem" }}>
              <span style={{ fontFamily: "'Cinzel Decorative',serif", fontSize: "2.5rem", fontWeight: 700, color: "#9A7D4A" }}>{avgRating}</span>
              <div>
                <Stars count={Math.round(parseFloat(avgRating))} size={14} />
                <p style={{ fontFamily: "sans-serif", fontSize: "0.52rem", letterSpacing: "0.22em", textTransform: "uppercase", color: "#9E8E7A", marginTop: "4px" }}>
                  Based on {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
                </p>
              </div>
            </div>
          )}
        </div>

        {reviewsLoading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: "1.25rem", marginBottom: "3rem" }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{ background: "#EDE7D9", border: "1px solid rgba(200,169,106,0.15)", borderRadius: "16px", padding: "1.75rem 2rem", opacity: 0.5 }}>
                <div style={{ height: "10px", background: "rgba(200,169,106,0.2)", borderRadius: "4px", marginBottom: "0.75rem", width: "40%" }} />
                <div style={{ height: "1px", background: "rgba(200,169,106,0.15)", marginBottom: "1rem" }} />
                <div style={{ height: "8px", background: "rgba(200,169,106,0.15)", borderRadius: "4px", marginBottom: "0.5rem" }} />
                <div style={{ height: "8px", background: "rgba(200,169,106,0.15)", borderRadius: "4px", width: "70%" }} />
              </div>
            ))}
          </div>
        ) : reviews.length === 0 ? (
          <div style={{
            textAlign: "center", padding: "3rem",
            background: "#EDE7D9", border: "1px solid rgba(200,169,106,0.2)",
            borderRadius: "16px", marginBottom: "3rem",
          }}>
            <div style={{ width: "4px", height: "3rem", background: "linear-gradient(to bottom, transparent, rgba(200,169,106,0.5))", margin: "0 auto 1.25rem" }} />
            <p style={{ fontFamily: "'Cinzel Decorative',serif", fontSize: "0.85rem", color: "#1C1916", marginBottom: "0.5rem" }}>
              No Reviews Yet
            </p>
            <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "1rem", fontStyle: "italic", fontWeight: 300, color: "#6B5F52" }}>
              Be the first to share your experience.
            </p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: "1.25rem", marginBottom: "3rem" }}>
            {reviews.map((r, i) => (
              <div key={r.id ?? i} style={{
                background: "#EDE7D9", border: "1px solid rgba(200,169,106,0.22)", borderRadius: "16px",
                padding: "1.75rem 2rem",
                opacity: mounted ? 1 : 0,
                transform: mounted ? "translateY(0)" : "translateY(16px)",
                transition: `opacity 0.55s ease ${i * 0.08}s, transform 0.55s ease ${i * 0.08}s`,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
                  <div>
                    <p style={{ fontFamily: "'Cinzel Decorative',serif", fontSize: "0.72rem", letterSpacing: "0.04em", color: "#1C1916", marginBottom: "3px" }}>
                      {r.user_name || r.username || "Anonymous"}
                    </p>
                    {r.wilaya && (
                      <p style={{ fontFamily: "sans-serif", fontSize: "0.5rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "#9E8E7A" }}>
                        {r.wilaya}
                      </p>
                    )}
                  </div>
                  <Stars count={r.rating} size={11} />
                </div>
                <div style={{ height: "1px", background: "rgba(200,169,106,0.25)", marginBottom: "1rem" }} />
                <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "1.05rem", fontStyle: "italic", fontWeight: 300, color: "#6B5F52", lineHeight: 1.85 }}>
                  "{r.comment || r.text}"
                </p>
                {(r.created_at || r.date) && (
                  <p style={{ fontFamily: "sans-serif", fontSize: "0.5rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(158,142,122,0.45)", marginTop: "1rem" }}>
                    {r.created_at
                      ? new Date(r.created_at).toLocaleDateString("en-GB", { month: "long", year: "numeric" })
                      : r.date}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        <div style={{ marginBottom: "2.5rem" }}>
          <GoldRule />
        </div>

        {/* ── Add Review — logged-in only ── */}
        {!userChecked ? null : currentUser ? (
          <AddReviewForm productId={productId} onSubmitted={fetchReviews} />
        ) : (
          <div style={{
            background: "#EDE7D9", border: "1px solid rgba(200,169,106,0.22)",
            borderRadius: "16px", padding: "2.5rem",
            display: "flex", flexDirection: "column", alignItems: "center",
            textAlign: "center", gap: "1.25rem",
          }}>
            <div style={{ width: "48px", height: "48px", borderRadius: "50%", border: "1px solid rgba(200,169,106,0.35)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C8A96A" strokeWidth="1.4">
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0110 0v4" />
              </svg>
            </div>
            <div>
              <p style={{ fontFamily: "'Cinzel Decorative',serif", fontSize: "0.85rem", color: "#1C1916", marginBottom: "0.5rem" }}>
                Sign In to Leave a Review
              </p>
              <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "1rem", fontStyle: "italic", fontWeight: 300, color: "#6B5F52", lineHeight: 1.75 }}>
                Share your experience with this piece and help others find their perfect match.
              </p>
            </div>
            <button
              onClick={() => navigate("/login")}
              style={{
                display: "inline-flex", alignItems: "center", gap: "0.625rem",
                padding: "0 1.75rem", height: "46px",
                background: "transparent", border: "1px solid rgba(200,169,106,0.5)",
                borderRadius: 0,
                fontFamily: "sans-serif", fontSize: "0.58rem", fontWeight: 600,
                letterSpacing: "0.28em", textTransform: "uppercase",
                color: "#C8A96A", cursor: "pointer", transition: "all 0.25s ease",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "#1C1916"; e.currentTarget.style.color = "#FAF8F4"; e.currentTarget.style.borderColor = "#1C1916"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#C8A96A"; e.currentTarget.style.borderColor = "rgba(200,169,106,0.5)"; }}
            >
              Sign In <span style={{ fontSize: "0.875rem" }}>→</span>
            </button>
          </div>
        )}

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