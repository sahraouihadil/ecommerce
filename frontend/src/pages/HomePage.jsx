import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Section, Divider } from '../components/ui';
import api from '../services/api';

const steps = [
  { num: '01', title: 'Browse', desc: 'Explore the full furniture catalog — filter by category, style, or room.' },
  { num: '02', title: 'Preview in AR', desc: "Place any piece in your real room using your phone's camera. See exactly how it fits." },
  { num: '03', title: 'Ask Roomie', desc: 'Get AI-powered styling advice, color matching, and layout recommendations.' },
];

// ── Cycling hero headlines ───────────────────────────────────────────────────
const HERO_LINES = [
  { line1: 'Seeing is', line2: 'Believing' },
  { line1: 'Your Room,', line2: 'Reimagined' },
  { line1: 'Style Meets', line2: 'Space' },
  { line1: 'Try Before', line2: 'You Buy' },
  { line1: 'Design', line2: 'Without Doubt' },
];

const FONTS = `
  @import url('https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@400;700&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,500&display=swap');
  .font-cinzel    { font-family: 'Cinzel Decorative', serif !important; }
  .font-cormorant { font-family: 'Cormorant Garamond', Georgia, serif !important; }
  .font-serif     { font-family: 'Cormorant Garamond', Georgia, serif !important; }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(36px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeFromLeft {
    from { opacity: 0; transform: translateX(40px); }
    to   { opacity: 1; transform: translateX(0); }
  }

  /* ── Hero headline cycling animations ── */
  @keyframes heroLineIn {
    from { opacity: 0; transform: translateY(48px) skewY(2deg); }
    to   { opacity: 1; transform: translateY(0)    skewY(0deg); }
  }
  @keyframes heroLineOut {
    from { opacity: 1; transform: translateY(0)    skewY(0deg); }
    to   { opacity: 0; transform: translateY(-40px) skewY(-1.5deg); }
  }

  .hero-line-enter {
    animation: heroLineIn 0.6s cubic-bezier(0.16,1,0.3,1) both;
  }
  .hero-line-enter-delay {
    animation: heroLineIn 0.6s cubic-bezier(0.16,1,0.3,1) 0.08s both;
  }
  .hero-line-exit {
    animation: heroLineOut 0.45s cubic-bezier(0.4,0,0.6,1) both;
  }
  .hero-line-exit-delay {
    animation: heroLineOut 0.45s cubic-bezier(0.4,0,0.6,1) 0.06s both;
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

  .mini-card {
    transition: box-shadow 0.3s ease, transform 0.3s cubic-bezier(0.16,1,0.3,1);
  }
  .mini-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 28px rgba(26,26,26,0.15) !important;
  }
`;

const BASE = "http://127.0.0.1:8000";

function isLoggedIn() {
  return !!localStorage.getItem('token');
}

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

// ── Cycling hero headline component ─────────────────────────────────────────
function CyclingHeroTitle() {
  const [current, setCurrent] = useState(0);
  const [phase, setPhase] = useState('idle'); // 'idle' | 'exiting' | 'entering'
  const [displayed, setDisplayed] = useState(0);

  useEffect(() => {
    // Each headline shows for 3.2 s, then fades out (0.5 s), swaps, fades in (0.65 s)
    const interval = setInterval(() => {
      // Start exit
      setPhase('exiting');

      setTimeout(() => {
        // Swap text while invisible
        setCurrent(prev => {
          const next = (prev + 1) % HERO_LINES.length;
          setDisplayed(next);
          return next;
        });
        setPhase('entering');

        setTimeout(() => {
          setPhase('idle');
        }, 650);
      }, 500);
    }, 3200);

    return () => clearInterval(interval);
  }, []);

  const { line1, line2 } = HERO_LINES[displayed];

  const line1Class =
    phase === 'exiting' ? 'hero-line-exit'
      : phase === 'entering' ? 'hero-line-enter'
        : '';

  const line2Class =
    phase === 'exiting' ? 'hero-line-exit-delay'
      : phase === 'entering' ? 'hero-line-enter-delay'
        : '';

  return (
    <h1
      className="hero-title font-cinzel font-bold leading-[0.95] tracking-tight mb-8"
      style={{
        fontSize: 'clamp(3rem,6vw,5.5rem)',
        minHeight: '2em',          // prevent layout shift
        overflow: 'hidden',
      }}
    >
      <span key={`l1-${displayed}`} className={`block ${line1Class}`}>{line1}</span>
      <span key={`l2-${displayed}`} className={`block ${line2Class}`}>{line2}</span>
    </h1>
  );
}

function getExitPopupKey() {
  const week = Math.floor(new Date().getTime() / (7 * 24 * 60 * 60 * 1000));
  return `exitPopupShown_w${week}`;
}

function ExitPopup() {
  const navigate = useNavigate();
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
      if (e.clientY <= 0) { clearTimers(); mouseLeaveTimer.current = setTimeout(show, 150); }
    };
    const handleDocumentMouseOut = (e) => {
      if (!e.relatedTarget) { clearTimers(); mouseLeaveTimer.current = setTimeout(show, 150); }
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
    if (!isLoggedIn()) {
      setIsOpen(false);
      navigate('/login');
      return;
    }
    setLoading(true);
    try {
      await api.post('/api/newsletters', { email, tags: [] });
      setStatus("✅ You're subscribed! Check your inbox for your discount code.");
      setTimeout(() => setIsOpen(false), 2500);
    } catch (err) {
      if (err.response?.status === 400) {
        setStatus("You're already subscribed! Check your inbox for your discount code.");
      } else if (err.response?.status === 403) {
        setStatus('Only customers can subscribe.');
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
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)" }}>
      <div style={{ background: "#F5F0E8", maxWidth: "500px", width: "90%", borderRadius: "32px", padding: "2rem", textAlign: "center", position: "relative", boxShadow: "0 20px 50px rgba(0,0,0,0.3)" }}>
        <button onClick={() => setIsOpen(false)} style={{ position: "absolute", top: "1rem", right: "1.2rem", background: "transparent", border: "none", fontSize: "1.5rem", cursor: "pointer", color: "#8B7A6B" }}>✕</button>
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
          <button onClick={handleSubscribe} disabled={loading} style={{ background: "#1C1916", color: "white", border: "none", padding: "0.75rem 1.5rem", borderRadius: "40px", fontFamily: "sans-serif", fontWeight: "bold", letterSpacing: "0.05em", cursor: "pointer" }}>
            {loading ? "..." : "Get 5% off"}
          </button>
        </div>
        {status && <p style={{ marginTop: "1rem", fontSize: "0.85rem", color: status.includes("✅") ? "#2b6e3c" : "#b95c3a" }}>{status}</p>}
        <p style={{ fontSize: "0.7rem", marginTop: "1.2rem", color: "#9a8a7a" }}>No spam, only beautiful furniture.</p>
      </div>
    </div>
  );
}

const PLACEHOLDER_SVG = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 400 400'%3E%3Crect width='400' height='400' fill='%23e8e2da'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='14' fill='%23a89880'%3ENo Image%3C/text%3E%3C/svg%3E`;

function getImageUrl(product) {
  if (!product || !product.image_url) return PLACEHOLDER_SVG;
  if (product.image_url.startsWith('http')) return product.image_url;
  return `${BASE}/${product.image_url}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// CAMPAIGNS SECTION
// ─────────────────────────────────────────────────────────────────────────────
function CampaignsSection() {
  const navigate = useNavigate();
  const ref = useRef(null);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
  api.get('/api/campaigns/active')
    .then(res => {
      const data = res.data;
      setCampaigns(Array.isArray(data) ? data : data.items ?? []);
    })
    .catch(err => { setError(err.message); setCampaigns([]); })
    .finally(() => setLoading(false));
}, []);

  useEffect(() => {
    if (campaigns.length === 0) return;
    const container = ref.current;
    if (!container) return;
    setTimeout(() => {
      container.querySelectorAll('.sr').forEach(t => t.classList.add('visible'));
    }, 50);
  }, [campaigns]);

  if (loading) return (
    <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12 text-center">
      <p className="font-cormorant italic text-muted">Loading campaigns...</p>
    </div>
  );

  if (error) return (
    <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12 text-center">
      <p className="font-cormorant italic" style={{ color: '#b95c3a' }}>Failed to load campaigns: {error}</p>
    </div>
  );

  if (campaigns.length === 0) return (
    <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12 text-center">
      <p className="font-cormorant italic text-muted">No active campaigns at the moment.</p>
    </div>
  );

  const handleCampaignClick = (camp) => {
    navigate(camp.campaign_type ? `/furniture?campaign=${camp.campaign_type}` : '/furniture');
  };

  const discountLabel = (camp) => {
    if (!camp.discount) return null;
    return camp.discount_type === 'percentage'
      ? `${camp.discount}% OFF selected items`
      : `${camp.discount} DA off selected items`;
  };

  const ctaLabel = (camp) => {
    if (camp.campaign_type === 'sale') return 'SHOP THE SALE';
    if (camp.campaign_type === 'new') return 'DISCOVER NOW';
    return 'SHOP NOW';
  };

  return (
    <div ref={ref} className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
      <div className="sr sr-left text-center mb-8">
        <p className="font-cinzel text-sm uppercase tracking-[0.2em] text-blush">🔥 Limited Time Offers</p>
        <h2 className="font-cinzel text-3xl md:text-4xl font-bold mt-2">CURRENT CAMPAIGNS</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {campaigns.map((camp, idx) => (
          <div
            key={camp.id}
            className={`sr sr-scale sr-d${Math.min(idx + 1, 6)}`}
            style={{
              background: 'rgba(200,169,106,0.06)',
              border: '1px solid rgba(200,169,106,0.25)',
              borderRadius: '1.5rem',
              padding: '2rem',
              textAlign: 'center',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.1)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
          >
            <p style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: '0.7rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#C8A96A', marginBottom: '0.5rem' }}>
              ✨ Campaign
            </p>
            <h3 style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: 'clamp(1.25rem, 3vw, 1.75rem)', fontWeight: 700, color: '#1C1916', marginBottom: '0.5rem' }}>
              {camp.title || camp.name}
            </h3>

            {camp.image_url && (
              <img
                src={`${BASE}${camp.image_url}`}
                alt={camp.title}
                style={{ width: '100%', maxHeight: '160px', objectFit: 'cover', borderRadius: '1rem', margin: '1rem 0' }}
                onError={e => { e.target.style.display = 'none'; }}
              />
            )}

            {discountLabel(camp) && (
              <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', fontSize: '1.1rem', color: '#6B5F52', marginTop: '0.5rem' }}>
                {discountLabel(camp)}
              </p>
            )}

            {camp.code && (
              <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1rem', marginTop: '0.75rem', color: '#1C1916' }}>
                Use code:{' '}
                <span style={{ fontWeight: 700, background: 'rgba(255,255,255,0.6)', padding: '2px 10px', borderRadius: '6px', letterSpacing: '0.08em' }}>
                  {camp.code}
                </span>
              </p>
            )}

            {camp.usage_max > 0 && (
              <p style={{ fontFamily: 'sans-serif', fontSize: '0.6rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#B0A090', marginTop: '0.5rem' }}>
                {camp.usage_max - camp.usage_current} uses remaining
              </p>
            )}

            <button
              onClick={() => handleCampaignClick(camp)}
              style={{
                marginTop: '1.5rem', background: '#1C1916', color: '#FAF8F4',
                border: 'none', padding: '0.75rem 2rem', borderRadius: '2rem',
                fontFamily: "'Cormorant Garamond', serif", fontSize: '0.875rem',
                fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase',
                cursor: 'pointer', transition: 'background 0.25s ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#C8A96A'; e.currentTarget.style.color = '#1C1916'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#1C1916'; e.currentTarget.style.color = '#FAF8F4'; }}
            >
              {ctaLabel(camp)}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// HOME PAGE
// ─────────────────────────────────────────────────────────────────────────────
export function HomePage() {
  const [activeCategory, setActiveCategory] = useState('all');
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [email, setEmail] = useState('');
  const [subMsg, setSubMsg] = useState('');
  const [subLoading, setSubLoading] = useState(false);

  const shopRef = useScrollReveal([products]);
  const videoRef = useScrollReveal([products]);
  const stepsRef = useScrollReveal([products]);
  const quoteRef = useScrollReveal([products]);
  const newsletterRef = useScrollReveal([products]);

  useEffect(() => {
  api.get("/api/products").then(res => {
    const data = res.data;
    setProducts(Array.isArray(data) ? data : data.items ?? data.products ?? []);
  }).catch(console.error);
}, []);

  const categories = ['all', ...new Set(products.map(p => p.category))];
  const filtered = activeCategory === 'all' ? products : products.filter(p => p.category === activeCategory);

  const handleSubscribe = async () => {
    if (!isLoggedIn()) {
      setSubMsg('Please log in first to subscribe.');
      setTimeout(() => { setSubMsg(''); navigate('/login'); }, 1500);
      return;
    }
    setSubLoading(true);
    try {
      await api.post('/api/newsletters', { email, tags: [] });
      setSubMsg("You're in! Welcome to the family 🤍");
      setEmail('');
    } catch (err) {
      if (err.response?.status === 400) {
        setSubMsg('You are already subscribed!');
      } else if (err.response?.status === 403) {
        const msg = err.response?.data?.detail;
        if (msg?.includes("Only customers")) setSubMsg('Only customers can subscribe.');
        else if (msg?.includes("Email does not match")) setSubMsg('Email does not match your account.');
        else setSubMsg('Access denied.');
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

  return (
    <div className="bg-cream text-charcoal min-h-screen">
      <style>{FONTS}</style>

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="min-h-[90vh] flex items-center overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 w-full py-20 md:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div className="order-1">
              <p className="hero-eyebrow font-cormorant italic text-muted text-lg font-light uppercase tracking-[0.2em] mb-8">
                AR-Powered Furniture Shopping
              </p>

              {/* ── Animated cycling headline ── */}
              <CyclingHeroTitle />

              <p className="hero-sub font-cormorant italic text-muted text-xl font-light max-w-md mb-12 leading-relaxed">
                Preview any piece of furniture in your actual room with AR before you buy. Plus AI styling help from Roomie.
              </p>
              <div className="hero-cta">
                <Button as="a" href="#shop" variant="black" size="lg">START SHOPPING</Button>
              </div>

              <button
                onClick={() => {
                  const token = localStorage.getItem('token');
                  if (!token) navigate('/login', { state: { message: 'Sign in to personalize your furniture' } });
                  else navigate('/furniture/customize');
                }}
                style={{
                  marginTop: '1rem',
                  display: 'inline-flex', alignItems: 'center', gap: '0.6rem',
                  padding: '1rem 2.25rem',
                  fontFamily: 'sans-serif', fontSize: '0.625rem', letterSpacing: '0.28em',
                  textTransform: 'uppercase', fontWeight: 600,
                  color: '#1C1916',
                  background: 'transparent',
                  border: '1.5px solid #1C1916',
                  borderRadius: '2rem',
                  cursor: 'pointer',
                  transition: 'all 0.25s ease',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#1C1916'; e.currentTarget.style.color = '#F5F0E8'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#1C1916'; }}
              >
                ✦ Personalize Your Furniture
              </button>
            </div>

            <div className="hero-img order-2 relative flex justify-center lg:justify-end">
              <div className="relative w-full max-w-[540px] flex gap-4 items-stretch">
                <div className="flex-1 relative">
                  <div className="rounded-3xl overflow-hidden aspect-[3/4] bg-surface shadow-[0_8px_40px_rgba(26,26,26,0.06)]">
                    <img
                      src={getImageUrl(featuredProduct)}
                      onError={(e) => { e.target.src = PLACEHOLDER_SVG; }}
                      alt={featuredProduct.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {featuredProduct.badge && (
                    <span className="font-cormorant absolute top-6 left-6 bg-white text-charcoal text-sm uppercase tracking-[0.1em] font-semibold px-4 py-2 rounded-full shadow-sm">
                      {featuredProduct.badge}
                    </span>
                  )}
                </div>

                <div className="flex flex-col justify-center gap-3" style={{ width: "130px", flexShrink: 0 }}>
                  {products.slice(1, 4).map((product, i) => (
                    <div
                      key={product.id}
                      className="mini-card cursor-pointer rounded-2xl overflow-hidden bg-white shadow-[0_4px_16px_rgba(26,26,26,0.08)]"
                      style={{ animation: `fadeUp 0.45s cubic-bezier(0.16,1,0.3,1) ${0.2 + i * 0.09}s both` }}
                      onClick={() => navigate(`/product/${product.id}`)}
                    >
                      <div className="relative" style={{ height: "100px", background: "#f5f0e8", overflow: "hidden" }}>
                        <img
                          src={getImageUrl(product)}
                          onError={(e) => { e.target.src = PLACEHOLDER_SVG; }}
                          alt={product.name}
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                        {product.badge && (
                          <span style={{ position: "absolute", top: "7px", left: "7px", background: "#C8A96A", color: "#1C1916", fontSize: "0.52rem", letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 700, padding: "2px 7px", borderRadius: "2rem", fontFamily: "sans-serif" }}>
                            {product.badge}
                          </span>
                        )}
                      </div>
                      <div style={{ padding: "8px 10px 10px" }}>
                        <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "0.82rem", fontWeight: 600, color: "#1C1916", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {product.name}
                        </p>
                        <p style={{ fontFamily: "sans-serif", fontSize: "0.62rem", color: "#9e8e7a", margin: "2px 0 0", letterSpacing: "0.04em" }}>
                          {Number(product.price).toLocaleString()} DA
                        </p>
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={() => { const el = document.getElementById('shop'); if (el) el.scrollIntoView({ behavior: 'smooth' }); }}
                    style={{ marginTop: "4px", background: "#1C1916", color: "#FAF8F4", border: "none", borderRadius: "2rem", padding: "10px 0", width: "100%", fontFamily: "sans-serif", fontSize: "0.58rem", letterSpacing: "0.18em", textTransform: "uppercase", fontWeight: 700, cursor: "pointer", transition: "background 0.25s ease", animation: "fadeUp 0.45s cubic-bezier(0.16,1,0.3,1) 0.42s both" }}
                    onMouseEnter={e => e.currentTarget.style.background = "#C8A96A"}
                    onMouseLeave={e => e.currentTarget.style.background = "#1C1916"}
                  >
                    MORE PIECES
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Divider className="max-w-7xl mx-auto px-6" />

      {/* ── Campaigns ─────────────────────────────────────────── */}
      <CampaignsSection />
      <Divider className="max-w-7xl mx-auto px-6" />

      {/* ── Shop ─────────────────────────────────────────────── */}
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
            {filtered.map((product, i) => (
              <div
                key={product.id}
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
                  {product.on_sale && product.discount_price && (
                    <span style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", background: "#C8A96A", color: "#1C1916", fontSize: "0.55rem", letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 700, padding: "3px 10px", borderRadius: "2rem", fontFamily: "sans-serif", whiteSpace: "nowrap" }}>
                      Sale
                    </span>
                  )}
                  <span className="font-cormorant absolute left-1/2 bottom-0 -translate-x-1/2 translate-y-1/2 bg-charcoal text-cream text-base font-semibold tracking-wide px-5 py-2 rounded-full shadow-md whitespace-nowrap">
                    {product.on_sale && product.discount_price
                      ? <>{Number(product.discount_price).toLocaleString()} DA <s style={{ opacity: 0.5, fontSize: '0.8em' }}>{Number(product.price).toLocaleString()}</s></>
                      : <>{Number(product.price).toLocaleString()} DA</>
                    }
                  </span>
                </div>
                <h3 className="font-cormorant text-xl font-semibold mt-8 mb-1 group-hover:text-rose transition-colors duration-300">
                  {product.name}
                </h3>
                <p className="font-cormorant italic text-muted text-base leading-relaxed max-w-[220px]">
                  {product.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ── Video ────────────────────────────────────────────── */}
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
            <button
              onClick={() => navigate("/aboutus")}
              style={{ marginTop: "12px", padding: "14px 36px", background: "transparent", border: "1px solid rgba(255,255,255,0.4)", borderRadius: "2rem", color: "#fff", fontFamily: "sans-serif", fontSize: "10px", letterSpacing: "0.22em", textTransform: "uppercase", cursor: "pointer", transition: "all 0.35s ease" }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(184,154,126,0.25)"; e.currentTarget.style.borderColor = "#b89a7e"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.4)"; }}
            >
              Discover our story
            </button>
          </div>
        </div>
      </section>

      <Divider className="max-w-7xl mx-auto" />

      {/* ── How It Works ─────────────────────────────────────── */}
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

      {/* ── Quote ────────────────────────────────────────────── */}
      <Section size="md" maxWidth="3xl">
        <div ref={quoteRef}>
          <blockquote className="sr text-center">
            <p className="font-cormorant text-[clamp(1.5rem,3vw,2.5rem)] font-light leading-[1.6] italic text-charcoal/80">
              "Try it in your room before you commit. That's the ARoom difference."
            </p>
          </blockquote>
        </div>
      </Section>

      {/* ── Newsletter ───────────────────────────────────────── */}
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
              <span className="font-cormorant font-semibold tracking-widest uppercase">
                {subLoading ? 'Sending...' : 'Subscribe'}
              </span>
            </Button>
          </div>
          {subMsg && (
            <p className="font-cormorant italic mt-6 text-lg tracking-wide"
              style={{ color: subMsg.includes('log in') ? '#e07b54' : 'rgba(255,255,255,0.7)' }}>
              {subMsg}
            </p>
          )}
          <p className="sr sr-d3 font-cinzel mt-16 text-[0.55rem] tracking-[0.5em] uppercase text-cream/20">Aroom is your sanctuary.</p>
        </div>
      </section>

      <ExitPopup />
    </div>
  );
}

export default HomePage;