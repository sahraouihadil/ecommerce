/**
 * ProductPage.jsx - Individual Product Detail Page
 * ===================================================
 * Shows a single product with:
 *   - Static image by default (switches to 3D viewer on demand)
 *   - "View in 3D" button (all devices)
 *   - "View in AR" button (mobile/tablet only — shown via UA detection)
 *   - Color variant selector
 *   - Product details (name, price, category, description)
 *   - "Add to Cart" and "Add to Favorites" buttons
 *
 * ROUTE: /product/:productId  (e.g. /product/3)
 */

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

import ProductViewer from "../components/ProductViewer/ProductViewer";
import localProducts from "../data/products";
import api from "../services/api";

// ── Detect mobile/tablet (AR-capable devices) ────────────────────
const IS_MOBILE = /Android|iPhone|iPad|iPod|webOS|BlackBerry|Windows Phone/i.test(
  typeof navigator !== "undefined" ? navigator.userAgent : ""
);

// ── Inline SVG Icons ─────────────────────────────────────────────
const IconArrowBack = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
    <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
  </svg>
);

const IconCart = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
    <path d="M22 9h-4.79l-4.38-6.56c-.19-.28-.51-.44-.83-.44s-.64.16-.83.44L6.79 9H2c-.55 0-1 .45-1 1 0 .09.01.18.04.27l2.54 9.27c.23.84 1 1.46 1.92 1.46h13c.92 0 1.69-.62 1.93-1.46l2.54-9.27L23 10c0-.55-.45-1-1-1zm-9 8c-.83 0-1.5-.67-1.5-1.5S12.17 14 13 14s1.5.67 1.5 1.5S13.83 17 13 17zm-1-9 1.5-2.25L14.99 8H12V8zm-1.5 0H8.01l1.5-2.25L10.5 8z" />
  </svg>
);

const IconHeart = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
  </svg>
);

const IconAR = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
    <path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8 3 3 3-3a4.237 4.237 0 0 0-6 0zm-4-4 2 2a7.074 7.074 0 0 1 10 0l2-2C15.14 9.14 8.87 9.14 5 13z" />
  </svg>
);

const IconEco = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
    <path d="M6.05 8.89C4.23 10.71 3.85 13.25 4.72 15.43L2 18.15l1.41 1.41 2.72-2.72c2.18.87 4.72.5 6.54-1.32C15 13.1 15.5 8.5 15.5 8.5s-4.6.5-7.06 2.96l-.89-.89c2.46-2.46 4.18-7.27 4.18-7.27S7.87 5.07 5.05 8.89z" />
  </svg>
);

const IconStar = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
    <path d="M12 2l1.5 4.5L18 8l-4.5 1.5L12 14l-1.5-4.5L6 8l4.5-1.5L12 2z" />
  </svg>
);

const IconRobot = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
    <path d="M20 9V7c0-1.1-.9-2-2-2h-3c0-1.66-1.34-3-3-3S9 3.34 9 5H6c-1.1 0-2 .9-2 2v2c-1.66 0-3 1.34-3 3s1.34 3 3 3v4c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-4c1.66 0 3-1.34 3-3s-1.34-3-3-3zm-2 10H6V7h12v12zm-9-6c-.83 0-1.5-.67-1.5-1.5S8.17 10 9 10s1.5.67 1.5 1.5S9.83 13 9 13zm6 0c-.83 0-1.5-.67-1.5-1.5S14.17 10 15 10s1.5.67 1.5 1.5S15.83 13 15 13zm-3 3h-2v-1h2v1zm2 0h-2v-1h2v1z" />
  </svg>
);

const IconAward = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="48" height="48">
    <path d="M12 1l2.39 7.26H22l-6.19 4.5 2.39 7.26L12 15.51l-6.19 5.01 2.39-7.26L2 8.26h7.61L12 1zm0 4.5-1.39 4.26H6.42l3.65 2.65-1.38 4.27L12 13.94l3.3 2.74-1.38-4.27 3.65-2.65h-4.18L12 5.5z" />
  </svg>
);

// Icon for the "View in 3D" button
const Icon3D = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
  </svg>
);

// ── Color swatches config ─────────────────────────────────────────
const COLOR_OPTIONS = [
  { id: "white", label: "White", hex: "#ffffff" },
  { id: "sky", label: "Sky", hex: "#6448b2", active: true },
  { id: "pink", label: "Pink", hex: "#f9a8d4" },
  { id: "storm", label: "Storm", hex: "#9ca3af" },
];

// ── Component ─────────────────────────────────────────────────────
export function ProductPage() {
  const { productId } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [cartMsg, setCartMsg] = useState("");
  const [favMsg, setFavMsg] = useState("");
  const [activeColor, setActiveColor] = useState("sky");
  const [thumbHover, setThumbHover] = useState(null);

  // ── NEW: 3D viewer is hidden by default; user clicks "View in 3D" to open it
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

  // Reset viewer when navigating to a different product
  useEffect(() => {
    setShowViewer(false);
  }, [productId]);

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
    <div style={{
      minHeight: "100dvh", display: "flex",
      alignItems: "center", justifyContent: "center",
      backgroundColor: "#f7f6f8",
      fontFamily: "'Be Vietnam Pro', sans-serif",
      color: "#5b5b5d",
    }}>
      Loading product…
    </div>
  );

  // ── Styles ──────────────────────────────────────────────────────
  const S = {
    page: {
      minHeight: "100dvh",
      backgroundColor: "#f7f6f8",
      fontFamily: "'Be Vietnam Pro', sans-serif",
      color: "#2d2f30",
      paddingBottom: "8rem",
    },
    backBtn: {
      display: "inline-flex", alignItems: "center", gap: "0.5rem",
      background: "none", border: "none",
      color: "#5b5b5d", fontWeight: "600",
      fontSize: "0.9rem", cursor: "pointer",
      padding: "0.5rem 0", marginBottom: "2rem",
      fontFamily: "'Be Vietnam Pro', sans-serif",
      transition: "color 0.15s",
    },
    grid: {
      maxWidth: "1280px", margin: "0 auto",
      padding: "1.5rem 1.5rem 0",
      display: "grid",
      gridTemplateColumns: "1fr",
      gap: "3rem",
    },
    // ── Static image (shown when showViewer = false) ──
    staticImgWrap: {
      position: "relative",
      borderRadius: "1.25rem",
      overflow: "hidden",
      backgroundColor: "#f1f0f3",
      aspectRatio: "4/3",
    },
    staticImg: {
      width: "100%", height: "100%",
      objectFit: "cover", display: "block",
    },
    // ── Action pill buttons overlaid on the image ─────────────────
    //    Row sits at the bottom-right of the image
    viewerActionsRow: {
      position: "absolute",
      bottom: "1.25rem",
      right: "1.25rem",
      display: "flex",
      gap: "0.5rem",
      zIndex: 2,
    },
    // Shared pill style
    pillBtn: (primary) => ({
      display: "inline-flex",
      alignItems: "center",
      gap: "0.45rem",
      padding: "0.55rem 1.1rem",
      borderRadius: "9999px",
      border: "none",
      cursor: "pointer",
      fontFamily: "'Be Vietnam Pro', sans-serif",
      fontWeight: "700",
      fontSize: "0.85rem",
      backdropFilter: "blur(12px)",
      WebkitBackdropFilter: "blur(12px)",
      transition: "transform 0.15s ease",
      ...(primary
        ? {
          backgroundColor: "#6448b2",
          color: "#f7f0ff",
          boxShadow: "0 4px 16px rgba(100,72,178,0.35)",
        }
        : {
          backgroundColor: "rgba(255,255,255,0.55)",
          color: "#6448b2",
          boxShadow: "0 4px 16px rgba(0,0,0,0.10)",
        }),
    }),
    bestSellerBadge: {
      position: "absolute", top: "1.25rem", left: "1.25rem",
      backgroundColor: "#fed01b", color: "#433500",
      fontSize: "10px", fontWeight: "700",
      letterSpacing: "0.15em", padding: "0.35rem 1rem",
      borderRadius: "9999px",
      zIndex: 2,
    },
    thumbGrid: {
      display: "grid", gridTemplateColumns: "repeat(3,1fr)",
      gap: "0.75rem", marginTop: "1rem",
    },
    thumb: (hovered) => ({
      borderRadius: "0.75rem", overflow: "hidden",
      backgroundColor: "#f1f0f3", aspectRatio: "1/1",
      opacity: hovered ? 1 : 0.75,
      transition: "opacity 0.2s ease",
      cursor: "pointer",
    }),
    thumbImg: { width: "100%", height: "100%", objectFit: "cover", display: "block" },
    thumbVideo: {
      borderRadius: "0.75rem",
      backgroundColor: "#f1f0f3", aspectRatio: "1/1",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      border: "2px dashed rgba(173,173,175,0.4)",
      gap: "0.25rem",
    },
    detailsWrap: { display: "flex", flexDirection: "column", gap: "2rem" },
    category: {
      fontSize: "11px", fontWeight: "700",
      textTransform: "uppercase", letterSpacing: "0.2em",
      color: "#5b5b5d",
    },
    productName: {
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      fontWeight: "800", fontSize: "clamp(2rem,5vw,3rem)",
      lineHeight: "1", letterSpacing: "-0.02em",
      color: "#2d2f30", margin: "0.5rem 0 0",
    },
    priceRow: { display: "flex", alignItems: "baseline", gap: "0.75rem", marginTop: "0.5rem" },
    priceMain: {
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      fontWeight: "700", fontSize: "1.75rem", color: "#6448b2",
    },
    priceOld: {
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      fontSize: "1.1rem", color: "rgba(91,91,93,0.5)",
      textDecoration: "line-through",
    },
    description: { fontSize: "1rem", color: "#5b5b5d", lineHeight: "1.75" },
    tagsRow: { display: "flex", flexWrap: "wrap", gap: "0.5rem", marginTop: "0.75rem" },
    tag: {
      display: "inline-flex", alignItems: "center", gap: "0.4rem",
      backgroundColor: "#f1f0f3",
      padding: "0.4rem 0.875rem",
      borderRadius: "9999px",
      fontSize: "11px", fontWeight: "700", color: "#5b5b5d",
    },
    customBox: {
      backgroundColor: "#f1f0f3",
      borderRadius: "1.25rem",
      padding: "1.75rem",
    },
    colorLabel: {
      fontSize: "11px", fontWeight: "700",
      textTransform: "uppercase", letterSpacing: "0.2em",
      color: "#5b5b5d", display: "block", marginBottom: "1rem",
    },
    swatchRow: { display: "flex", gap: "1rem", marginBottom: "1.5rem" },
    swatch: (hex, active) => ({
      width: "40px", height: "40px",
      borderRadius: "9999px",
      backgroundColor: hex,
      border: "none", cursor: "pointer",
      outline: active ? `3px solid #6448b2` : "3px solid transparent",
      outlineOffset: "3px",
      boxShadow: "inset 0 2px 4px rgba(0,0,0,0.08)",
      transition: "outline 0.15s ease",
    }),
    addToCartBtn: {
      width: "100%", padding: "1.1rem",
      backgroundColor: "#6448b2", color: "#f7f0ff",
      border: "none", borderRadius: "9999px",
      display: "flex", alignItems: "center",
      justifyContent: "center", gap: "0.6rem",
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      fontWeight: "700", fontSize: "1rem",
      cursor: "pointer",
      boxShadow: "0 10px 30px -8px rgba(100,72,178,0.4)",
      transition: "transform 0.15s ease",
    },
    favBtn: {
      width: "100%", padding: "1.1rem",
      backgroundColor: "transparent",
      color: "#b41340",
      border: "2px solid rgba(180,19,64,0.2)",
      borderRadius: "9999px",
      display: "flex", alignItems: "center",
      justifyContent: "center", gap: "0.6rem",
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      fontWeight: "700", fontSize: "1rem",
      cursor: "pointer",
      transition: "transform 0.15s ease, background-color 0.15s ease",
    },
    deliveryNote: {
      textAlign: "center",
      fontSize: "11px", fontWeight: "700",
      letterSpacing: "0.1em",
      color: "rgba(91,91,93,0.6)",
      textTransform: "uppercase",
      marginTop: "0.75rem",
    },
    roomieBox: {
      backgroundColor: "rgba(100,72,178,0.05)",
      border: "2px dashed rgba(100,72,178,0.2)",
      borderRadius: "1.25rem",
      padding: "1.25rem",
      display: "flex", alignItems: "center", gap: "1rem",
    },
    roomieIcon: {
      width: "48px", height: "48px", flexShrink: 0,
      borderRadius: "9999px",
      backgroundColor: "#6448b2",
      display: "flex", alignItems: "center", justifyContent: "center",
      color: "#f7f0ff",
    },
    successPill: {
      marginTop: "0.75rem", padding: "0.6rem 1rem",
      borderRadius: "0.875rem",
      backgroundColor: "rgba(0,103,92,0.08)",
      color: "#00675c", fontSize: "0.85rem",
      fontWeight: "600", textAlign: "center",
    },
    errorPill: {
      marginTop: "0.75rem", padding: "0.6rem 1rem",
      borderRadius: "0.875rem",
      backgroundColor: "rgba(180,19,64,0.08)",
      color: "#b41340", fontSize: "0.85rem",
      fontWeight: "600", textAlign: "center",
    },
    magicSection: {
      maxWidth: "1280px", margin: "4rem auto 0",
      padding: "0 1.5rem",
    },
    magicH2: {
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      fontWeight: "800", fontSize: "1.75rem",
      color: "#2d2f30", marginBottom: "1.5rem",
    },
    magicGrid: {
      display: "grid",
      gridTemplateColumns: "1fr",
      gap: "1.25rem",
    },
    magicCard1: {
      backgroundColor: "#f1f0f3",
      borderRadius: "1.25rem",
      padding: "2.5rem",
      minHeight: "240px",
      display: "flex", flexDirection: "column",
      justifyContent: "flex-end",
      position: "relative", overflow: "hidden",
    },
    magicCard2: {
      backgroundColor: "#fed01b",
      borderRadius: "1.25rem",
      padding: "2.5rem",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      textAlign: "center",
    },
  };

  const originalPrice = product.price
    ? Math.round(product.price * 1.19)
    : null;

  // ── Pill hover helper (can't use CSS in inline styles, so use onMouse*) ──
  const hoverScale = {
    onMouseEnter: (e) => { e.currentTarget.style.transform = "scale(1.04)"; },
    onMouseLeave: (e) => { e.currentTarget.style.transform = "scale(1)"; },
    onMouseDown: (e) => { e.currentTarget.style.transform = "scale(0.97)"; },
  };

  return (
    <div style={S.page}>

      {/* ── Main content ── */}
      <div style={S.grid}>

        {/* Back button */}
        <div style={{ gridColumn: "1/-1" }}>
          <button
            style={S.backBtn}
            onClick={() => navigate("/")}
            onMouseEnter={e => e.currentTarget.style.color = "#6448b2"}
            onMouseLeave={e => e.currentTarget.style.color = "#5b5b5d"}
          >
            <IconArrowBack />
            Back to Collection
          </button>
        </div>

        {/* Two-column layout on wide screens */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "3rem",
          alignItems: "start",
        }}>

          {/* ── Left: Visuals ── */}
          <div>
            <div style={{ position: "relative", marginBottom: "0" }}>
              {/* Glow backing */}
              <div style={{
                position: "absolute", inset: "-1rem", zIndex: 0,
                backgroundColor: "rgba(171,143,254,0.1)",
                borderRadius: "1.5rem",
                transform: "rotate(1deg)",
              }} />

              <div style={{ position: "relative", zIndex: 1 }}>

                {/* ── STATIC IMAGE (default view) ── */}
                {!showViewer && (
                  <div style={S.staticImgWrap}>
                    <img
                      src="../../public/pink chair.png"
                      alt={product.name}
                      style={S.staticImg}
                    />

                    {/* Best seller badge */}
                    {product.bestSeller && (
                      <div style={S.bestSellerBadge}>Best Seller</div>
                    )}

                    {/* ── Action buttons row ── */}
                    <div style={S.viewerActionsRow}>

                      {/* "View in AR" — mobile only */}
                      {IS_MOBILE && product.iosSrc && (
                        <button
                          style={S.pillBtn(false)}
                          {...hoverScale}
                          onClick={() => {
                            // Trigger model-viewer AR by switching to viewer
                            // and dispatching AR activation after mount
                            setShowViewer(true);
                            setTimeout(() => {
                              document
                                .querySelector("model-viewer")
                                ?.activateAR?.();
                            }, 300);
                          }}
                        >
                          <IconAR />
                          View in AR
                        </button>
                      )}

                      {/* "View in 3D" — all devices */}
                      {product.modelSrc && (
                        <button
                          style={S.pillBtn(true)}
                          {...hoverScale}
                          onClick={() => setShowViewer(true)}
                        >
                          <Icon3D />
                          View in 3D
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* ── 3D VIEWER (shown after clicking "View in 3D" or "View in AR") ── */}
                {showViewer && (
                  <div style={{ position: "relative" }}>
                    <ProductViewer
                      modelSrc={product.modelSrc}
                      iosSrc={product.iosSrc}
                      productName={product.name}
                      price={product.price}
                      variants={product.variants}
                    />

                    {/* "Back to photo" pill — lets user return to static image */}
                    <button
                      style={{
                        ...S.pillBtn(false),
                        position: "absolute",
                        top: "1.25rem",
                        left: "1.25rem",
                        zIndex: 10,
                      }}
                      {...hoverScale}
                      onClick={() => setShowViewer(false)}
                    >
                      ← Photo
                    </button>
                  </div>
                )}

              </div>
            </div>

            {/* Thumbnails */}
            <div style={S.thumbGrid}>
              {[product.images?.[1], product.images?.[2]].filter(Boolean).map((src, i) => (
                <div
                  key={i}
                  style={S.thumb(thumbHover === i)}
                  onMouseEnter={() => setThumbHover(i)}
                  onMouseLeave={() => setThumbHover(null)}
                >
                  <img src={src} alt={`${product.name} view ${i + 2}`} style={S.thumbImg} />
                </div>
              ))}
              {/* Fabric story tile */}
              <div style={S.thumbVideo}>
                <svg viewBox="0 0 24 24" fill="#ab8ffe" width="24" height="24">
                  <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z" />
                </svg>
                <span style={{
                  fontSize: "9px", fontWeight: "700", color: "#5b5b5d",
                  textTransform: "uppercase", letterSpacing: "0.05em"
                }}>
                  Fabric Story
                </span>
              </div>
            </div>
          </div>

          {/* ── Right: Details ── */}
          <div style={{ position: "sticky", top: "6rem" }}>
            <div style={S.detailsWrap}>

              {/* Title + price */}
              <div>
                <span style={S.category}>{product.category}</span>
                <h1 style={S.productName}>{product.name}</h1>
                <div style={S.priceRow}>
                  <span style={S.priceMain}>${product.price}</span>
                  {originalPrice && (
                    <span style={S.priceOld}>${originalPrice}</span>
                  )}
                </div>
              </div>

              {/* Description + tags */}
              <div>
                <p style={S.description}>{product.description}</p>
                <div style={S.tagsRow}>
                  <span style={S.tag}>
                    <span style={{ color: "#00675c" }}><IconEco /></span>
                    Sustainably Sourced
                  </span>
                  <span style={S.tag}>
                    <span style={{ color: "#6448b2" }}><IconStar /></span>
                    Stain Resistant
                  </span>
                </div>
              </div>

              {/* Customisation box */}
              <div style={S.customBox}>
                <span style={S.colorLabel}>Select Color</span>
                <div style={S.swatchRow}>
                  {COLOR_OPTIONS.map((c) => (
                    <button
                      key={c.id}
                      title={c.label}
                      onClick={() => setActiveColor(c.id)}
                      style={S.swatch(c.hex, activeColor === c.id)}
                    />
                  ))}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  <button
                    onClick={handleAddToCart}
                    style={S.addToCartBtn}
                    onMouseEnter={e => e.currentTarget.style.transform = "scale(1.02)"}
                    onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
                    onMouseDown={e => e.currentTarget.style.transform = "scale(0.97)"}
                  >
                    <IconCart />
                    Add to Cart
                  </button>
                  <button
                    onClick={handleAddToFavorites}
                    style={S.favBtn}
                    onMouseEnter={e => {
                      e.currentTarget.style.transform = "scale(1.02)";
                      e.currentTarget.style.backgroundColor = "rgba(180,19,64,0.05)";
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.transform = "scale(1)";
                      e.currentTarget.style.backgroundColor = "transparent";
                    }}
                    onMouseDown={e => e.currentTarget.style.transform = "scale(0.97)"}
                  >
                    <IconHeart />
                    Add to Favorites
                  </button>
                  <p style={S.deliveryNote}>Free white-glove delivery in 4–6 weeks</p>
                </div>

                {cartMsg && (
                  <div style={cartMsg.startsWith("Failed") ? S.errorPill : S.successPill}>
                    {cartMsg}
                  </div>
                )}
                {favMsg && (
                  <div style={favMsg.startsWith("Failed") ? S.errorPill : S.successPill}>
                    {favMsg}
                  </div>
                )}
              </div>

              {/* Roomie teaser */}
              <div style={S.roomieBox}>
                <div style={S.roomieIcon}><IconRobot /></div>
                <div>
                  <p style={{ fontWeight: "700", color: "#6448b2", fontSize: "0.9rem", margin: "0 0 0.2rem" }}>
                    Need styling advice?
                  </p>
                  <p style={{ fontSize: "0.8rem", color: "#5b5b5d", margin: 0 }}>
                    Roomie is online and ready to help you match your decor.
                  </p>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* ── Why it's magical ── */}
      <section style={S.magicSection}>
        <h2 style={S.magicH2}>Why it's magical</h2>
        <div style={{
          ...S.magicGrid,
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
        }}>
          <div style={{ ...S.magicCard1, gridColumn: "span 2" }}>
            <div style={{
              position: "absolute", top: 0, right: 0,
              width: "240px", height: "240px",
              borderRadius: "9999px",
              backgroundColor: "rgba(171,143,254,0.15)",
              filter: "blur(48px)",
              transform: "translate(50%, -50%)",
              pointerEvents: "none",
            }} />
            <div style={{ position: "relative", zIndex: 1, maxWidth: "480px" }}>
              <h3 style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontWeight: "700", fontSize: "1.25rem",
                color: "#2d2f30", marginBottom: "0.75rem",
              }}>
                Ergonomic Cloud-Tech
              </h3>
              <p style={{ color: "#5b5b5d", lineHeight: "1.7", fontSize: "0.95rem" }}>
                Our patented internal structure mimics the buoyancy of water without
                the mess. It adapts to your body's pressure points instantly.
              </p>
            </div>
          </div>

          <div style={S.magicCard2}>
            <div style={{ color: "#433500", marginBottom: "1rem" }}>
              <IconAward />
            </div>
            <h3 style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: "700", fontSize: "1.1rem",
              color: "#433500", marginBottom: "0.5rem",
            }}>
              Lifetime Warranty
            </h3>
            <p style={{ fontSize: "0.85rem", color: "rgba(67,53,0,0.75)", lineHeight: "1.6" }}>
              We believe in clouds that last forever. Guaranteed frame & foam.
            </p>
          </div>

          {[
            { icon: "📐", title: "AR Preview", body: "See it in your room before buying" },
            { icon: "🎨", title: "Custom Colors", body: `${product.variants?.length ?? 4} color options available` },
            { icon: "🚚", title: "Free Delivery", body: "Arrives in 5–7 business days" },
          ].map((f) => (
            <div key={f.title} style={{
              backgroundColor: "#ffffff",
              borderRadius: "1.25rem",
              padding: "1.5rem",
              display: "flex", alignItems: "flex-start", gap: "1rem",
              boxShadow: "0 4px 20px rgba(45,47,48,0.05)",
            }}>
              <span style={{ fontSize: "1.5rem" }}>{f.icon}</span>
              <div>
                <p style={{ fontWeight: "700", color: "#2d2f30", marginBottom: "0.25rem", fontSize: "0.95rem" }}>
                  {f.title}
                </p>
                <p style={{ fontSize: "0.85rem", color: "#5b5b5d", margin: 0 }}>
                  {f.body}
                </p>
              </div>
            </div>
          ))}

        </div>
      </section>

    </div>
  );
}