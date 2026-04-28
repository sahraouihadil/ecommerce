import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

import ProductViewer from "../components/ProductViewer/ProductViewer";
import api from "../services/api";
import { Button, Card, Section, Divider } from "../components/ui";
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

export function ProductPage() {
  const { productId } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [cartMsg, setCartMsg] = useState("");
  const [favMsg, setFavMsg] = useState("");
  const [activeColor, setActiveColor] = useState(null);
  const [thumbHover, setThumbHover] = useState(null);
  const [activeImg, setActiveImg] = useState(null);
  const [showViewer, setShowViewer] = useState(false);

  useEffect(() => {
    api.get(`/api/products/${productId}`)
      .then((res) => {
        const p = res.data;
        setProduct(p);
        if (p.colors?.length) setActiveColor(p.colors[0]);
        setActiveImg(p.images?.[0] ?? p.image_url ?? null);
      })
      .catch(() => navigate("/furniture"));
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
  const allImages = product.images ?? (product.image_url ? [product.image_url] : []);
  const thumbnails = allImages.filter((src) => src !== activeImg);

  return (
    <div className="min-h-screen bg-cream text-charcoal pb-32">

      <div style={{ paddingTop: '4rem' }}>

        {/* ── Back to collection ── */}
        <Section size="sm" maxWidth="7xl">
          <button
            onClick={() => navigate("/furniture")}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontFamily: 'sans-serif',
              fontSize: '0.6875rem',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: '#9E8E7A',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '0',
              marginBottom: '2rem',
              transition: 'color 0.2s ease',
            }}
            onMouseEnter={e => e.currentTarget.style.color = '#1C1916'}
            onMouseLeave={e => e.currentTarget.style.color = '#9E8E7A'}
          >
            <span style={{ fontSize: '1rem', lineHeight: 1 }}>←</span>
            Back to Collection
          </button>
        </Section>

        {/* ── Main product grid ── */}
        <Section size="sm" maxWidth="7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">

            {/* ── Left: Visuals ── */}
            <div>
              <div className="relative">

                {!showViewer && (
                  <Card variant="surface" className="relative overflow-hidden aspect-[4/3] p-0">
                    {activeImg ? (
                      <img
                        src={img(activeImg)}
                        alt={product.name}
                        className="w-full h-full object-cover rounded-3xl"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100 rounded-3xl flex items-center justify-center">
                        <span className="material-symbols-outlined text-[48px] text-gray-300">image</span>
                      </div>
                    )}

                    {product.best_seller && (
                      <span className="absolute top-5 left-5 bg-white text-charcoal text-[0.6875rem] uppercase tracking-[0.15em] font-semibold px-4 py-2 rounded-full z-[2] shadow-sm">
                        Best Seller
                      </span>
                    )}

                    <div className="absolute bottom-5 right-5 flex gap-3 z-[2]">
                      {IS_MOBILE && product.ios_src && (
                        <Button
                          variant="blush"
                          size="sm"
                          className="gap-1.5 shadow-md backdrop-blur-md"
                          onClick={() => {
                            setShowViewer(true);
                            setTimeout(() => {
                              document.querySelector("model-viewer")?.activateAR?.();
                            }, 300);
                          }}
                        >
                          <span className="material-symbols-outlined text-[18px]">view_in_ar</span>
                          View in AR
                        </Button>
                      )}

                      {product.model_src && (
                        <Button
                          variant="black"
                          size="sm"
                          className="gap-1.5 shadow-lg"
                          onClick={() => setShowViewer(true)}
                        >
                          <span className="material-symbols-outlined text-[18px]">3d_rotation</span>
                          View in 3D
                        </Button>
                      )}
                    </div>
                  </Card>
                )}

                {showViewer && (
                  <div className="relative">
                    <ProductViewer
                      modelSrc={product.model_src}
                      iosSrc={product.ios_src}
                      productName={product.name}
                      price={product.price}
                    />
                    <Button
                      variant="blush"
                      size="sm"
                      className="absolute top-4 left-4 z-10 gap-1.5 shadow-md backdrop-blur-md"
                      onClick={() => setShowViewer(false)}
                    >
                      <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                      Photo
                    </Button>
                  </div>
                )}
              </div>

              {/* ── Thumbnails ── */}
              <div className="grid grid-cols-3 gap-3 mt-5">
                {thumbnails.slice(0, 2).map((src, i) => (
                  <div
                    key={i}
                    onClick={() => setActiveImg(src)}
                    className={`rounded-2xl overflow-hidden bg-surface aspect-square cursor-pointer transition-all duration-200 ring-2 ${activeImg === src
                      ? "ring-charcoal opacity-100"
                      : "ring-transparent opacity-60 hover:opacity-90"
                      }`}
                    onMouseEnter={() => setThumbHover(i)}
                    onMouseLeave={() => setThumbHover(null)}
                  >
                    <img
                      src={img(src)}
                      alt={`${product.name} view ${i + 2}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}

                <div className="rounded-2xl bg-surface aspect-square flex flex-col items-center justify-center border-2 border-dashed border-blush/40 gap-1.5">
                  <span className="material-symbols-outlined text-[24px] text-rose">videocam</span>
                  <span className="text-[0.5625rem] font-semibold text-muted uppercase tracking-[0.08em]">
                    Fabric Story
                  </span>
                </div>
              </div>
            </div>

            {/* ── Right: Details ── */}
            <div className="lg:sticky lg:top-24">
              <div className="flex flex-col gap-8">

                <div>
                  <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.25em] text-muted">
                    {product.category}
                  </span>
                  <h1
                    style={{ fontFamily: "'Cinzel Decorative', cursive" }}
                    className="text-[clamp(2rem,5vw,3rem)] font-bold leading-[1.05] tracking-tight text-charcoal mt-3"
                  >
                    {product.name}
                  </h1>
                  <div className="flex items-baseline gap-3 mt-4">
                    <span className="font-serif text-[1.75rem] font-bold text-charcoal">${product.price}</span>
                    {originalPrice && (
                      <span className="text-muted/40 text-lg line-through font-light">${originalPrice}</span>
                    )}
                  </div>
                </div>

                <Divider variant="line" />

                <div>
                  <p className="text-muted leading-[1.8] font-light">{product.description}</p>
                  <div className="flex flex-wrap gap-2 mt-5">
                    <span className="inline-flex items-center gap-1.5 bg-surface px-4 py-2 rounded-full text-[0.6875rem] font-semibold text-muted">
                      <span className="material-symbols-outlined text-[16px] text-success">eco</span>
                      Sustainably Sourced
                    </span>
                    <span className="inline-flex items-center gap-1.5 bg-surface px-4 py-2 rounded-full text-[0.6875rem] font-semibold text-muted">
                      <span className="material-symbols-outlined text-[16px] text-charcoal">auto_awesome</span>
                      Stain Resistant
                    </span>
                  </div>
                </div>

                {/* ── Color swatches ── */}
                <Card variant="surface" className="p-8">
                  <span className="block text-[0.6875rem] font-semibold uppercase tracking-[0.25em] text-muted mb-5">
                    Select Color
                  </span>

                  {product.colors?.length > 0 ? (
                    <div className="flex flex-wrap gap-4 mb-7">
                      {product.colors.map((colorName) => {
                        const hex =
                          COLOR_HEX[colorName] ||
                          COLOR_HEX[colorName?.trim()] ||
                          COLOR_HEX[Object.keys(COLOR_HEX).find(k => k.toLowerCase() === colorName?.toLowerCase())] ||
                          "#d1d5db";
                        const isLight = LIGHT_COLORS.has(colorName);
                        const isActive = activeColor === colorName;
                        return (
                          <button
                            key={colorName}
                            title={colorName}
                            onClick={() => setActiveColor(colorName)}
                            className="w-10 h-10 rounded-full transition-all duration-200 hover:scale-110 focus:outline-none"
                            style={{
                              backgroundColor: hex,
                              outline: isActive
                                ? `3px solid ${isLight ? "#374151" : hex}`
                                : "3px solid transparent",
                              outlineOffset: "3px",
                              boxShadow: isLight
                                ? "inset 0 0 0 1px #d1d5db"
                                : "inset 0 2px 4px rgba(0,0,0,0.12)",
                              transform: isActive ? "scale(1.12)" : undefined,
                            }}
                          />
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-muted text-sm font-light mb-7">No color options available</p>
                  )}

                  {activeColor && (
                    <p className="text-xs text-muted font-medium mb-5 -mt-3">
                      Selected: <span className="text-charcoal font-semibold">{activeColor}</span>
                    </p>
                  )}

                  <Divider variant="line" className="mb-7" />

                  <div className="flex flex-col gap-3">
                    <Button variant="black" size="lg" className="w-full gap-2" onClick={handleAddToCart}>
                      <span className="material-symbols-outlined text-[20px]">shopping_bag</span>
                      Add to Cart
                    </Button>
                    <Button variant="outline" size="lg" className="w-full gap-2" onClick={handleAddToFavorites}>
                      <span className="material-symbols-outlined text-[20px]">favorite</span>
                      Add to Favorites
                    </Button>
                    <p className="text-center text-[0.6875rem] font-light tracking-[0.12em] text-muted/50 uppercase mt-3">
                      Free white-glove delivery in 4–6 weeks
                    </p>
                  </div>

                  {cartMsg && (
                    <div className={`mt-4 p-3 rounded-2xl text-sm font-semibold text-center ${cartMsg.startsWith("Failed") ? "bg-danger/10 text-danger" : "bg-success/10 text-success"}`}>
                      {cartMsg}
                    </div>
                  )}
                  {favMsg && (
                    <div className={`mt-4 p-3 rounded-2xl text-sm font-semibold text-center ${favMsg.startsWith("Failed") ? "bg-danger/10 text-danger" : "bg-success/10 text-success"}`}>
                      {favMsg}
                    </div>
                  )}
                </Card>

                {/* Roomie teaser */}
                <Card variant="cream" className="border-2 border-blush/40 p-6 flex items-center gap-5 bg-blush/15">
                  <div className="w-14 h-14 flex-shrink-0 rounded-full bg-charcoal flex items-center justify-center shadow-md">
                    <span className="material-symbols-outlined text-[24px] text-cream">smart_toy</span>
                  </div>
                  <div>
                    <p className="font-serif font-bold text-charcoal text-[1rem] mb-1">Need styling advice?</p>
                    <p className="text-muted text-[0.85rem] font-light leading-relaxed">
                      Roomie is online and ready to help you match your decor.
                    </p>
                  </div>
                </Card>

              </div>
            </div>
          </div>
        </Section>
      </div>

      {/* ── Why it's magical ── */}
      <Section size="sm" maxWidth="7xl" className="mt-8">
        <Divider variant="diamond" className="mb-12" />

        <h2 className="font-serif text-[1.75rem] font-bold text-charcoal mb-10">Why it's magical</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card variant="surface" className="md:col-span-2 p-10 relative overflow-hidden min-h-[240px] flex flex-col justify-end">
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-blush/40 blur-[56px] translate-x-1/2 -translate-y-1/2 pointer-events-none" />
            <div className="relative z-[1] max-w-md">
              <h3 className="font-serif text-xl font-bold text-charcoal mb-3">Ergonomic Cloud-Tech</h3>
              <p className="text-muted leading-[1.75] text-[0.9375rem] font-light">
                Our patented internal structure mimics the buoyancy of water without the mess.
                It adapts to your body's pressure points instantly.
              </p>
            </div>
          </Card>

          <Card variant="cream" className="p-10 flex flex-col items-center justify-center text-center bg-blush/30">
            <span className="material-symbols-outlined text-[48px] text-charcoal mb-4">workspace_premium</span>
            <h3 className="font-serif text-lg font-bold text-charcoal mb-2">Lifetime Warranty</h3>
            <p className="text-muted text-[0.85rem] leading-[1.65] font-light">
              We believe in clouds that last forever. Guaranteed frame & foam.
            </p>
          </Card>

          {[
            { icon: "view_in_ar", title: "AR Preview", body: "See it in your room before buying" },
            { icon: "palette", title: "Custom Colors", body: `${product.colors?.length ?? 0} color option${product.colors?.length !== 1 ? "s" : ""} available` },
            { icon: "local_shipping", title: "Free Delivery", body: "Arrives in 5–7 business days" },
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

    </div>
  );
}