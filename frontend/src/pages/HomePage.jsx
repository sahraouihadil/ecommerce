import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Section, Divider } from '../components/ui';
import api from '../services/api';

const steps = [
  { num: '01', title: 'Browse', desc: 'Explore the full furniture catalog — filter by category, style, or room.' },
  { num: '02', title: 'Preview in AR', desc: "Place any piece in your real room using your phone's camera. See exactly how it fits." },
  { num: '03', title: 'Ask Roomie', desc: 'Get AI-powered styling advice, color matching, and layout recommendations.' },
];

const FONTS = `
  @import url('https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@400;700&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,500&display=swap');
  .font-cinzel    { font-family: 'Cinzel Decorative', serif !important; }
  .font-cormorant { font-family: 'Cormorant Garamond', Georgia, serif !important; }
  .font-serif     { font-family: 'Cormorant Garamond', Georgia, serif !important; }

  @keyframes promoSlide {
    from { opacity: 0; transform: translateY(-8px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes promoPulse {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0.6; }
  }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(36px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeFromLeft {
    from { opacity: 0; transform: translateX(40px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  .hero-eyebrow { animation: fadeUp       0.4s  cubic-bezier(0.16,1,0.3,1) 0.02s both; }
  .hero-title   { animation: fadeUp       0.45s cubic-bezier(0.16,1,0.3,1) 0.1s  both; }
  .hero-sub     { animation: fadeUp       0.45s cubic-bezier(0.16,1,0.3,1) 0.18s both; }
  .hero-cta     { animation: fadeUp       0.4s  cubic-bezier(0.16,1,0.3,1) 0.26s both; }
  .hero-img     { animation: fadeFromLeft 0.5s  cubic-bezier(0.16,1,0.3,1) 0.15s both; }

  .sr {
    opacity: 0;
    transform: translateY(40px);
    transition: opacity 0.35s cubic-bezier(0.16,1,0.3,1),
                transform 0.35s cubic-bezier(0.16,1,0.3,1);
  }
  .sr.sr-left  { transform: translateX(-40px); }
  .sr.sr-right { transform: translateX(40px); }
  .sr.sr-scale { transform: scale(0.93) translateY(20px); }
  .sr.visible  { opacity: 1 !important; transform: none !important; }

  .sr-d1 { transition-delay: 0.04s; }
  .sr-d2 { transition-delay: 0.08s; }
  .sr-d3 { transition-delay: 0.12s; }
  .sr-d4 { transition-delay: 0.16s; }
  .sr-d5 { transition-delay: 0.20s; }
  .sr-d6 { transition-delay: 0.24s; }

  .product-card {
    transition: box-shadow 0.3s ease, transform 0.35s cubic-bezier(0.16,1,0.3,1) !important;
  }
  .product-card:hover { transform: translateY(-6px) !important; }
`;

function useScrollReveal(deps = []) {
  const ref = useRef(null);
  useEffect(() => {
    const container = ref.current;
    if (!container) return;
    const targets = container.querySelectorAll('.sr');
    if (!targets.length) return;
    const io = new IntersectionObserver(
      (entries) => entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
      }),
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );
    targets.forEach(t => io.observe(t));
    return () => io.disconnect();
  }, deps);
  return ref;
}

function formatDiscount(discount, type) {
  if (type === 'percentage') return `-${discount}%`;
  return `-${Number(discount).toLocaleString()} DA`;
}

function isExpiringSoon(expiry) {
  if (!expiry) return false;
  const diff = new Date(expiry) - new Date();
  return diff > 0 && diff < 3 * 24 * 60 * 60 * 1000;
}
function isExpired(expiry) {
  if (!expiry) return false;
  return new Date(expiry) < new Date();
}

// ─── FIX 1: localStorage keyed by promo IDs so new promos always show ─────────
function getAnnouncementDismissedKey(promotions) {
  const ids = promotions
    .filter(p => p.status === 'active' && !isExpired(p.expiry))
    .map(p => p.id)
    .sort()
    .join('-');
  return `announcementDismissed_${ids}`;
}

/* ── AnnouncementBar with dismissible ────────────────── */
function AnnouncementBar({ promotions }) {
  const [idx, setIdx] = useState(0);
  const [dismissed, setDismissed] = useState(false);
  const active = promotions.filter(p => p.status === 'active' && !isExpired(p.expiry));

  // FIX 1: Use a key based on active promo IDs — new promos always show even if user dismissed old ones
  const storageKey = getAnnouncementDismissedKey(promotions);

  useEffect(() => {
    if (active.length === 0) return;
    const saved = localStorage.getItem(storageKey);
    setDismissed(saved === 'true');
  }, [storageKey]);

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem(storageKey, 'true');
  };

  useEffect(() => {
    if (active.length <= 1 || dismissed) return;
    const t = setInterval(() => setIdx(i => (i + 1) % active.length), 4000);
    return () => clearInterval(t);
  }, [active.length, dismissed]);

  if (active.length === 0 || dismissed) return null;
  const promo = active[idx % active.length];

  return (
    // FIX 2: Removed duplicate `position` property — only `sticky` remains
    <div style={{
      background: "#877a6fff",
      color: "#C8A96A",
      textAlign: "center",
      padding: "0.85rem 2.5rem 0.85rem 1rem",
      position: "sticky",   // ← was overwritten by "relative" before, now fixed
      top: 0,
      zIndex: 50,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "1.5rem",
      animation: "promoSlide 0.4s ease",
    }}>
      <span style={{ fontFamily: "sans-serif", fontSize: "0.8rem", letterSpacing: "0.25em", textTransform: "uppercase", fontWeight: 500 }}>
        {promo.title}
        {promo.discount && (
          <span style={{ marginLeft: "0.6rem", color: "#FAF8F4", fontWeight: 700 }}>
            {formatDiscount(promo.discount, promo.discount_type)}
          </span>
        )}
      </span>
      {promo.code && (
        <span style={{ fontFamily: "sans-serif", fontSize: "0.75rem", letterSpacing: "0.2em", textTransform: "uppercase", border: "1px solid rgba(200,169,106,0.6)", padding: "0.25rem 0.9rem", borderRadius: "2rem", color: "#C8A96A" }}>
          Code: <strong>{promo.code}</strong>
        </span>
      )}
      {isExpiringSoon(promo.expiry) && (
        <span style={{ fontFamily: "sans-serif", fontSize: "0.7rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "#e07b54", animation: "promoPulse 1.5s ease infinite" }}>
          ⏳ Ends soon
        </span>
      )}
      {active.length > 1 && (
        <div style={{ display: "flex", gap: "5px" }}>
          {active.map((_, i) => (
            <div key={i} onClick={() => setIdx(i)} style={{ width: "6px", height: "6px", borderRadius: "50%", background: i === idx ? "#C8A96A" : "rgba(200,169,106,0.3)", cursor: "pointer", transition: "background 0.3s" }} />
          ))}
        </div>
      )}
      <button
        onClick={handleDismiss}
        style={{
          position: "absolute", right: "1rem", top: "50%", transform: "translateY(-50%)",
          background: "transparent", border: "none", color: "#C8A96A", cursor: "pointer",
          fontSize: "1.2rem", fontWeight: "bold", padding: "0 0.5rem", opacity: 0.7,
          transition: "opacity 0.2s"
        }}
        onMouseEnter={e => e.currentTarget.style.opacity = "1"}
        onMouseLeave={e => e.currentTarget.style.opacity = "0.7"}
      >✕</button>
    </div>
  );
}

/* ── PromotionsBanner ─────────────────── */
function PromotionsBanner({ promotions }) {
  const ref = useScrollReveal([promotions]);
  const active = promotions.filter(p => p.status === 'active' && !isExpired(p.expiry));
  if (active.length === 0) return null;

  return (
    <section style={{ background: "#696a6aff", padding: "4rem 1.5rem", margin: "3rem 0" }}>
      <div style={{ maxWidth: "1280px", margin: "0 auto" }} ref={ref}>
        <div className="sr" style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "2.5rem", justifyContent: "center" }}>
          <div style={{ height: "1px", flex: 1, maxWidth: "80px", background: "#C8A96A", opacity: 0.4 }} />
          <span style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: "1.1rem", letterSpacing: "0.3em", textTransform: "uppercase", color: "#C8A96A" }}>
            Current Offers
          </span>
          <div style={{ height: "1px", flex: 1, maxWidth: "80px", background: "#C8A96A", opacity: 0.4 }} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1.5rem" }}>
          {active.map((promo, i) => (
            <div key={promo.id} className={`sr sr-scale sr-d${Math.min(i + 1, 6)}`} style={{
              background: "rgba(255,255,255,0.04)", border: "1px solid rgba(200,169,106,0.3)",
              borderRadius: "20px", padding: "2rem 2.25rem", position: "relative", overflow: "hidden",
            }}>
              <div style={{ position: "absolute", top: "-40px", right: "-40px", width: "130px", height: "130px", borderRadius: "50%", background: "rgba(200,169,106,0.06)", pointerEvents: "none" }} />
              {isExpiringSoon(promo.expiry) && (
                <p style={{ fontFamily: "sans-serif", fontSize: "0.7rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "#e07b54", marginBottom: "0.75rem", animation: "promoPulse 1.5s ease infinite" }}>⏳ Ends soon</p>
              )}
              <p style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: "1rem", fontWeight: 700, color: "#C8A96A", marginBottom: "0.75rem", lineHeight: 1.4 }}>{promo.title}</p>
              {promo.discount && (
                <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "3rem", fontWeight: 300, color: "#FAF8F4", lineHeight: 1, marginBottom: "1.25rem" }}>
                  {formatDiscount(promo.discount, promo.discount_type)}
                  <span style={{ fontSize: "1.2rem", marginLeft: "6px", opacity: 0.4 }}>off</span>
                </p>
              )}
              {promo.code && (
                <div style={{ display: "inline-flex", alignItems: "center", border: "1px dashed rgba(200,169,106,0.5)", borderRadius: "8px", padding: "0.5rem 1rem", marginBottom: "1rem" }}>
                  <span style={{ fontFamily: "monospace", fontSize: "1rem", letterSpacing: "0.2em", color: "#C8A96A", fontWeight: 700 }}>{promo.code}</span>
                </div>
              )}
              {promo.expiry && (
                <p style={{ fontFamily: "sans-serif", fontSize: "0.7rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(158,142,122,0.6)", marginTop: "0.5rem" }}>
                  Until {new Date(promo.expiry).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Inline Promo Card ─────────── */
function InlinePromoCard({ promotion }) {
  if (!promotion) return null;
  return (
    <div style={{
      background: "#2c2a28",
      borderRadius: "28px",
      padding: "2rem 1.5rem",
      textAlign: "center",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "380px",
      boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
    }}>
      <span style={{ fontFamily: "sans-serif", fontSize: "0.7rem", letterSpacing: "0.3em", textTransform: "uppercase", color: "#C8A96A", marginBottom: "1rem" }}>
        Limited Offer
      </span>
      <p style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: "1.6rem", fontWeight: 700, color: "#fff", marginBottom: "1rem", lineHeight: 1.2 }}>
        {promotion.title}
      </p>
      {promotion.discount && (
        <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "2.8rem", fontWeight: 300, color: "#C8A96A", marginBottom: "0.5rem" }}>
          {formatDiscount(promotion.discount, promotion.discount_type)}
        </p>
      )}
      {promotion.code && (
        <div style={{ background: "rgba(200,169,106,0.15)", padding: "0.5rem 1rem", borderRadius: "2rem", margin: "1rem 0" }}>
          <span style={{ fontFamily: "monospace", fontSize: "1rem", letterSpacing: "0.1em", color: "#C8A96A", fontWeight: "bold" }}>{promotion.code}</span>
        </div>
      )}
      <button
        onClick={() => { const element = document.getElementById('shop'); if (element) element.scrollIntoView({ behavior: 'smooth' }); }}
        style={{ marginTop: "1rem", background: "#C8A96A", border: "none", padding: "0.6rem 1.8rem", borderRadius: "2rem", color: "#1C1916", fontFamily: "sans-serif", fontSize: "0.7rem", letterSpacing: "0.2em", textTransform: "uppercase", cursor: "pointer", fontWeight: "bold" }}
      >
        Shop Now
      </button>
    </div>
  );
}

// ─── FIX 3: ExitPopup localStorage keyed with expiry date so it resets after 7 days ──
function getExitPopupKey() {
  const now = new Date();
  // Key resets every 7 days — user sees the popup again after a week
  const week = Math.floor(now.getTime() / (7 * 24 * 60 * 60 * 1000));
  return `exitPopupShown_w${week}`;
}

/* ── Exit Intent Popup ── */
function ExitPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const hasShown = useRef(false);
  const mouseLeaveTimer = useRef(null);
  const fallbackTimer = useRef(null);

  useEffect(() => {
    const storageKey = getExitPopupKey();

    const clearTimers = () => {
      if (mouseLeaveTimer.current) clearTimeout(mouseLeaveTimer.current);
      if (fallbackTimer.current) clearTimeout(fallbackTimer.current);
    };

    const show = () => {
      if (hasShown.current || localStorage.getItem(storageKey)) return;
      hasShown.current = true;
      setIsOpen(true);
      localStorage.setItem(storageKey, 'true');
    };

    const handleMouseLeave = (e) => {
      if (e.clientY <= 0) {
        clearTimers();
        mouseLeaveTimer.current = setTimeout(show, 150);
      }
    };

    const handleDocumentMouseOut = (e) => {
      if (!e.relatedTarget) {
        clearTimers();
        mouseLeaveTimer.current = setTimeout(show, 150);
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);
    document.documentElement.addEventListener('mouseout', handleDocumentMouseOut);
    fallbackTimer.current = setTimeout(show, 20000);

    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.documentElement.removeEventListener('mouseout', handleDocumentMouseOut);
      clearTimers();
    };
  }, []);

  const handleSubscribe = async () => {
    if (!email || !email.includes('@')) {
      setStatus('Please enter a valid email');
      setTimeout(() => setStatus(''), 3000);
      return;
    }
    setLoading(true);
    try {
      await api.post('/api/newsletters/', {
        name: '',
        email: email,
        status: 'subscribed',
        tags: [],
      });
      setStatus(`✅ 5% off code sent to ${email}! Use SAVED5 at checkout.`);
      setTimeout(() => setIsOpen(false), 2500);
    } catch (err) {
      if (err.response?.status === 400 && err.response?.data?.detail?.includes('already subscribed')) {
        setStatus('You\'re already subscribed! Check your inbox for your discount code.');
      } else {
        setStatus('Something went wrong. Please try again later.');
      }
    } finally {
      setLoading(false);
      setTimeout(() => setStatus(''), 4000);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 1000,
      display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)"
    }}>
      <div style={{
        background: "#F5F0E8", maxWidth: "500px", width: "90%", borderRadius: "32px",
        padding: "2rem", textAlign: "center", position: "relative", boxShadow: "0 20px 50px rgba(0,0,0,0.3)"
      }}>
        <button onClick={() => setIsOpen(false)} style={{
          position: "absolute", top: "1rem", right: "1.2rem", background: "transparent", border: "none",
          fontSize: "1.5rem", cursor: "pointer", color: "#8B7A6B"
        }}>✕</button>
        <h3 style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: "1.6rem", marginTop: "0.5rem", marginBottom: "0.5rem" }}>
          Wait! Don't leave empty-handed 🪑
        </h3>
        <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.1rem", fontStyle: "italic", marginBottom: "1.5rem" }}>
          Get <strong style={{ color: "#C8A96A" }}>5% off</strong> your first order – just drop your email.
        </p>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", justifyContent: "center" }}>
          <input
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubscribe()}
            style={{ flex: 1, minWidth: "180px", padding: "0.75rem 1rem", borderRadius: "40px", border: "1px solid #ddd", fontFamily: "'Cormorant Garamond', serif", fontSize: "1rem" }}
          />
          <button onClick={handleSubscribe} disabled={loading} style={{
            background: "#1C1916", color: "white", border: "none", padding: "0.75rem 1.5rem", borderRadius: "40px", fontFamily: "sans-serif", fontWeight: "bold", letterSpacing: "0.05em", cursor: "pointer"
          }}>{loading ? "..." : "Get 5% off"}</button>
        </div>
        {status && <p style={{ marginTop: "1rem", fontSize: "0.85rem", color: status.includes("✅") ? "#2b6e3c" : "#b95c3a" }}>{status}</p>}
        <p style={{ fontSize: "0.7rem", marginTop: "1.2rem", color: "#9a8a7a" }}>No spam, only beautiful furniture.</p>
      </div>
    </div>
  );
}

/* ── FIX 4: getImageUrl uses a local grey SVG fallback instead of via.placeholder.com ── */
const PLACEHOLDER_SVG = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 400 400'%3E%3Crect width='400' height='400' fill='%23e8e2da'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='14' fill='%23a89880'%3ENo Image%3C/text%3E%3C/svg%3E`;

function getImageUrl(product) {
  if (!product || !product.image_url) return PLACEHOLDER_SVG;
  if (product.image_url.startsWith('http')) return product.image_url;
  return `http://127.0.0.1:8000/${product.image_url}`;
}

/* ── HomePage (main) ── */
export function HomePage() {
  const [activeCategory, setActiveCategory] = useState('all');
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [email, setEmail] = useState('');
  const [subMsg, setSubMsg] = useState('');
  const [subLoading, setSubLoading] = useState(false);

  const shopRef = useScrollReveal([products]);
  const videoRef = useScrollReveal([products]);
  const stepsRef = useScrollReveal([products]);
  const quoteRef = useScrollReveal([products]);
  const newsletterRef = useScrollReveal([products]);

  useEffect(() => {
    api.get("/api/products").then(res => setProducts(res.data)).catch(console.error);
    api.get("/api/promotions/").then(res => setPromotions(res.data)).catch(console.error);
  }, []);

  const categories = ['all', ...new Set(products.map(p => p.category))];
  const filtered = activeCategory === 'all' ? products : products.filter(p => p.category === activeCategory);

  const handleSubscribe = async () => {
    if (!email || !email.includes('@')) {
      setSubMsg('Please enter a valid email.');
      setTimeout(() => setSubMsg(''), 3000);
      return;
    }
    setSubLoading(true);
    try {
      await api.post('/api/newsletters/', {
        name: '',
        email: email,
        status: 'subscribed',
        tags: [],
      });
      setSubMsg("You're in! Welcome to the family 🤍");
      setEmail('');
    } catch (err) {
      if (err.response?.status === 400 && err.response?.data?.detail?.includes('already subscribed')) {
        setSubMsg('You are already subscribed!');
      } else {
        setSubMsg('Something went wrong. Please try again.');
      }
    } finally {
      setSubLoading(false);
      setTimeout(() => setSubMsg(''), 4000);
    }
  };

  if (!products || products.length === 0) {
    return (
      <>
        <style>{FONTS}</style>
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
          <div className="animate-pulse">
            <div className="w-24 h-24 rounded-full bg-gray-200 mb-6"></div>
          </div>
          <h2 className="font-cinzel text-xl font-semibold text-charcoal mb-2">Loading furniture...</h2>
          <p className="font-cormorant italic text-muted text-lg max-w-xs">We're bringing beautiful pieces to your space ✨</p>
        </div>
      </>
    );
  }

  const featuredProduct = products[0] || null;
  if (!featuredProduct) return null;

  const activePromo = promotions.find(p => p.status === 'active' && !isExpired(p.expiry));

  return (
    <div className="bg-cream text-charcoal min-h-screen">
      <style>{FONTS}</style>

      {/* Hero section */}
      <section className="min-h-[90vh] flex items-center overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 w-full py-20 md:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div className="order-1">
              <p className="hero-eyebrow font-cormorant italic text-muted text-lg font-light uppercase tracking-[0.2em] mb-8">
                AR-Powered Furniture Shopping
              </p>
              <h1 className="hero-title font-cinzel text-[clamp(3rem,6vw,5.5rem)] font-bold leading-[0.95] tracking-tight mb-8">
                Seeing is<br />Believing
              </h1>
              <p className="hero-sub font-cormorant italic text-muted text-xl font-light max-w-md mb-12 leading-relaxed">
                Preview any piece of furniture in your actual room with AR before you buy. Plus AI styling help from Roomie.
              </p>
              <div className="hero-cta">
                <Button as="a" href="#shop" variant="black" size="lg">Start Shopping</Button>
              </div>
            </div>
            <div className="hero-img order-2 relative flex justify-center lg:justify-end">
              <div className="relative w-full max-w-[480px]">
                <div className="rounded-3xl overflow-hidden aspect-[3/4] bg-surface shadow-[0_8px_40px_rgba(26,26,26,0.06)]">
                  <img
                    src={getImageUrl(featuredProduct)}
                    onError={(e) => { e.target.src = PLACEHOLDER_SVG; }}
                    alt={featuredProduct.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                {featuredProduct.badge && (
                  <span className="font-cormorant absolute top-6 right-6 bg-white text-charcoal text-sm uppercase tracking-[0.1em] font-semibold px-4 py-2 rounded-full shadow-sm">
                    {featuredProduct.badge}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <AnnouncementBar promotions={promotions} />
      <Divider variant="diamond" className="max-w-7xl mx-auto px-6" />
      <PromotionsBanner promotions={promotions} />

      {/* Shop section with inline promo cards */}
      <Section size="lg" id="shop">
        <div ref={shopRef}>
          <h2 className="sr sr-left font-cinzel text-[clamp(2.5rem,5vw,3.5rem)] font-bold leading-[0.95] tracking-tight mb-8">
            Shop Furniture
          </h2>

          <div className="sr sr-d1 flex flex-wrap gap-3 mb-16">
            {categories.map((cat) => (
              <Button key={cat} variant={activeCategory === cat ? 'black' : 'blush'} size="sm" onClick={() => setActiveCategory(cat)}>
                <span className="font-cormorant font-semibold tracking-widest uppercase text-sm">
                  {cat === 'all' ? 'All' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                </span>
              </Button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
            {filtered.map((product, i) => {
              const shouldShowPromo = (i + 1) % 3 === 0 && activePromo && i !== filtered.length - 1;
              return (
                <React.Fragment key={product.id}>
                  <div
                    className={`sr sr-scale sr-d${Math.min((i % 3) + 1, 6)} product-card group relative cursor-pointer flex flex-col items-center text-center bg-white rounded-3xl pt-10 pb-8 px-6 shadow-[0_4px_24px_rgba(26,26,26,0.04)] hover:shadow-[0_8px_32px_rgba(26,26,26,0.08)]`}
                    onClick={() => navigate(`/product/${product.id}`)}
                  >
                    {product.badge && (
                      <span className="font-cormorant absolute top-4 right-4 z-10 bg-charcoal text-cream text-xs uppercase tracking-[0.1em] font-semibold px-3 py-1 rounded-full shadow-sm">
                        {product.badge}
                      </span>
                    )}
                    <div className="relative mb-8">
                      <div className="w-[220px] h-[220px] md:w-[260px] md:h-[260px] rounded-full overflow-hidden bg-surface shadow-[0_4px_24px_rgba(26,26,26,0.05)] transition-transform duration-500 ease-out group-hover:scale-[1.03]">
                        <img
                          src={getImageUrl(product)}
                          onError={(e) => { e.target.src = PLACEHOLDER_SVG; }}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span className="font-cormorant absolute left-1/2 bottom-0 -translate-x-1/2 translate-y-1/2 bg-charcoal text-cream text-base font-semibold tracking-wide px-5 py-2 rounded-full shadow-md whitespace-nowrap">
                        {product.price.toLocaleString()} DA
                      </span>
                    </div>
                    <h3 className="font-cormorant text-xl font-semibold mt-8 mb-1 group-hover:text-rose transition-colors duration-300">
                      {product.name}
                    </h3>
                    <p className="font-cormorant italic text-muted text-base leading-relaxed max-w-[220px]">
                      {product.description}
                    </p>
                  </div>
                  {shouldShowPromo && <InlinePromoCard promotion={activePromo} />}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </Section>

      {/* Video section */}
      <section style={{ position: "relative", height: "560px", overflow: "hidden" }}>
        <video autoPlay muted loop playsInline style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" }}>
          <source src="/video/room.mp4" type="video/mp4" />
        </video>
        <div style={{ position: "absolute", inset: 0, background: "rgba(26,20,14,0.35)" }} />
        <div ref={videoRef} style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "2rem", gap: "20px" }}>
          <p className="sr" style={{ fontFamily: "sans-serif", fontSize: "10px", letterSpacing: "0.28em", textTransform: "uppercase", color: "#b89a7e" }}>
            Your space, your story
          </p>
          <h2 className="sr sr-d1" style={{ fontFamily: "'Cinzel Decorative', cursive", fontSize: "clamp(1.8rem, 4vw, 3rem)", color: "#fff", lineHeight: 1.2, maxWidth: "600px", margin: 0 }}>
            Furniture that feels like home
          </h2>
          <p className="sr sr-d2" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontStyle: "italic", fontWeight: 300, fontSize: "1.15rem", color: "rgba(255,255,255,0.6)", maxWidth: "420px", lineHeight: 1.8, margin: 0 }}>
            We built ARoom because buying furniture online felt like a gamble. We fixed that.
          </p>
          <div className="sr sr-d3">
            <button onClick={() => navigate("/aboutus")} style={{ marginTop: "12px", padding: "14px 36px", background: "transparent", border: "1px solid rgba(255,255,255,0.4)", borderRadius: "2rem", color: "#fff", fontFamily: "sans-serif", fontSize: "10px", letterSpacing: "0.22em", textTransform: "uppercase", cursor: "pointer", transition: "all 0.35s ease" }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(184,154,126,0.25)"; e.currentTarget.style.borderColor = "#b89a7e"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.4)"; }}>
              Discover our story
            </button>
          </div>
        </div>
      </section>

      <Divider className="max-w-7xl mx-auto" />

      {/* How It Works */}
      <Section size="lg">
        <div ref={stepsRef}>
          <h2 className="sr font-cinzel text-[2.5rem] font-bold tracking-tight text-center mb-24">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-12 max-w-4xl mx-auto">
            {steps.map((step, i) => (
              <div key={step.num} className={`sr sr-scale sr-d${i + 1}`}>
                <Card variant="surface" className="text-center">
                  <p className="font-cinzel text-5xl font-bold text-blush mb-6">{step.num}</p>
                  <h3 className="font-cormorant text-2xl font-semibold mb-3">{step.title}</h3>
                  <p className="font-cormorant italic text-muted text-lg leading-relaxed">{step.desc}</p>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </Section>

      <Divider variant="diamond" className="max-w-3xl mx-auto" />

      {/* Quote */}
      <Section size="md" maxWidth="3xl">
        <div ref={quoteRef}>
          <blockquote className="sr text-center">
            <p className="font-cormorant text-[clamp(1.5rem,3vw,2.5rem)] font-light leading-[1.6] italic text-charcoal/80">
              "Try it in your room before you commit. That's the ARoom difference."
            </p>
          </blockquote>
        </div>
      </Section>

      {/* Newsletter footer */}
      <section className="bg-charcoal w-full">
        <div className="max-w-xl mx-auto px-6 py-20 md:py-28 text-center" ref={newsletterRef}>
          <h2 className="sr font-cinzel text-cream text-[2.5rem] font-bold tracking-tight mb-4">Stay in touch</h2>
          <p className="sr sr-d1 font-cormorant italic text-cream/50 text-xl mb-12">
            New arrivals, AR features, and exclusive drops — straight to your inbox.
          </p>
          <div className="sr sr-d2 flex max-w-md mx-auto">
            <input
              className="flex-1 bg-transparent border-b border-cream/20 px-0 py-4 text-cream placeholder:text-cream/25 focus:border-rose focus:ring-0 outline-none transition-colors duration-300 font-cormorant italic text-lg"
              placeholder="your@email.com"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubscribe()}
            />
            <Button
              variant="outline"
              size="sm"
              className="ml-6 border-cream/40 text-cream/80 hover:bg-cream hover:text-charcoal hover:border-cream flex-shrink-0"
              onClick={handleSubscribe}
              disabled={subLoading}
            >
              <span className="font-cormorant font-semibold tracking-widest uppercase">{subLoading ? 'Sending...' : 'Subscribe'}</span>
            </Button>
          </div>
          {subMsg && <p className="font-cormorant italic mt-6 text-lg text-cream/70 tracking-wide">{subMsg}</p>}
          <p className="sr sr-d3 font-cinzel mt-16 text-[0.55rem] tracking-[0.5em] uppercase text-cream/20">Aroom is your sanctuary.</p>
        </div>
      </section>

      <ExitPopup />
    </div>
  );
}

export default HomePage;