import { useEffect, useState, useRef } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import api from '../services/api';

const CATEGORIES = ["All", "Chairs", "Tables", "Lamps", "Sofas"];
const BASE = "http://127.0.0.1:8000";
const img = (path) => (path ? `${BASE}/${path}` : null);

const KEYFRAMES = `
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(28px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeDown {
    from { opacity: 0; transform: translateY(-18px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes revealWidth {
    from { width: 0; }
    to   { width: 100%; }
  }
  @keyframes scaleIn {
    from { opacity: 0; transform: scale(0.92) translateY(22px); }
    to   { opacity: 1; transform: scale(1)   translateY(0); }
  }
  @keyframes goldLineDraw {
    from { transform: scaleX(0); }
    to   { transform: scaleX(1); }
  }
  @keyframes diamondPop {
    from { opacity: 0; transform: rotate(45deg) scale(0); }
    to   { opacity: 0.7; transform: rotate(45deg) scale(1); }
  }
  @keyframes spin { to { transform: rotate(360deg); } }
`;

function Appear({ children, delay = 0, animation = 'fadeUp', duration = 0.7, style = {} }) {
  const [go, setGo] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setGo(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  const easing = 'cubic-bezier(0.16, 1, 0.3, 1)';
  return (
    <div style={{
      animation: go ? `${animation} ${duration}s ${easing} both` : 'none',
      opacity: go ? undefined : 0,
      ...style,
    }}>
      {children}
    </div>
  );
}

function ScrollCard({ children, delay = 0 }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold: 0.12 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0) scale(1)' : 'translateY(32px) scale(0.97)',
      transition: `opacity 0.65s cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 0.65s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
    }}>
      {children}
    </div>
  );
}

const CartIcon = () => (
  <svg viewBox="0 0 24 24" style={{ width: '0.72rem', height: '0.72rem', stroke: '#9A7D4A', fill: 'none', strokeWidth: 1.9, flexShrink: 0 }}>
    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <path d="M16 10a4 4 0 01-8 0" />
  </svg>
);

const HeartIcon = ({ filled }) => (
  <svg viewBox="0 0 24 24" style={{ width: '0.82rem', height: '0.82rem', stroke: filled ? '#C8A96A' : '#B89B5E', fill: filled ? '#C8A96A' : 'none', strokeWidth: 1.9, transition: 'fill .22s ease, stroke .22s ease' }}>
    <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
  </svg>
);

function Toast({ message, visible }) {
  return (
    <div style={{
      position: 'fixed', bottom: '1.75rem', left: '50%',
      transform: `translateX(-50%) translateY(${visible ? '0' : '5rem'})`,
      opacity: visible ? 1 : 0,
      transition: 'transform 0.42s cubic-bezier(0.34,1.56,0.64,1), opacity 0.3s ease',
      background: 'rgba(248,244,238,0.96)',
      border: '1px solid rgba(200,169,106,0.35)',
      borderRadius: '2rem', padding: '0.5rem 1.35rem',
      display: 'flex', alignItems: 'center', gap: '0.55rem',
      backdropFilter: 'blur(10px)',
      boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
      pointerEvents: 'none', whiteSpace: 'nowrap', zIndex: 1000,
    }}>
      <div style={{ width: '0.42rem', height: '0.42rem', borderRadius: '50%', background: '#C8A96A', flexShrink: 0 }} />
      <span style={{ fontFamily: 'sans-serif', fontSize: '0.58rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: '#7A6540' }}>
        {message}
      </span>
    </div>
  );
}

function ProductCard({ product, index, onCartClick, onFavClick, favSet }) {
  const [hovered, setHovered] = useState(false);
  const isFav = favSet.has(product.id);
  const showFav = hovered || isFav;
  const isOnSale = product.on_sale && product.discount_price && Number(product.discount_price) < Number(product.price);

  return (
    <ScrollCard delay={index * 80}>
      <div
        style={{ position: 'relative' }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div style={{ position: 'relative', aspectRatio: '3/4', overflow: 'hidden', background: '#EDE8DF', borderRadius: '3px' }}>
          <Link to={`/product/${product.id}`} style={{ display: 'block', width: '100%', height: '100%' }}>
            {product.image_url ? (
              <img
                src={img(product.image_url)}
                alt={product.name}
                style={{
                  width: '100%', height: '100%', objectFit: 'cover', display: 'block',
                  transform: hovered ? 'scale(1.06)' : 'scale(1)',
                  transition: 'transform 0.7s cubic-bezier(0.25,0.46,0.45,0.94)',
                }}
              />
            ) : (
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontFamily: 'sans-serif', fontSize: '0.5rem', letterSpacing: '0.28em', textTransform: 'uppercase', color: 'rgba(158,142,122,0.4)' }}>No image</span>
              </div>
            )}
          </Link>

          <div style={{ position: 'absolute', inset: 0, background: hovered ? 'linear-gradient(to bottom, transparent 35%, rgba(15,11,8,0.48) 100%)' : 'transparent', transition: 'background 0.35s ease', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', top: '0.55rem', left: '0.55rem', width: '1rem', height: '1rem', borderTop: '1px solid rgba(200,169,106,0.65)', borderLeft: '1px solid rgba(200,169,106,0.65)', opacity: hovered ? 1 : 0, transition: 'opacity 0.4s ease', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: '0.55rem', right: '0.55rem', width: '1rem', height: '1rem', borderBottom: '1px solid rgba(200,169,106,0.65)', borderRight: '1px solid rgba(200,169,106,0.65)', opacity: hovered ? 1 : 0, transition: 'opacity 0.4s ease', pointerEvents: 'none' }} />

          {product.best_seller && (
            <div style={{ position: 'absolute', top: '0.75rem', left: '0.75rem', padding: '0.3rem 0.9rem', background: 'rgba(245,240,232,0.92)', borderRadius: '2rem', fontFamily: 'sans-serif', fontSize: '0.48rem', letterSpacing: '0.25em', textTransform: 'uppercase', color: '#9A7D4A', border: '1px solid rgba(200,169,106,0.3)', pointerEvents: 'none' }}>
              Best Seller
            </div>
          )}

          {isOnSale && (
            <div style={{ position: 'absolute', top: product.best_seller ? '2.8rem' : '0.75rem', left: '0.75rem', padding: '0.3rem 0.9rem', background: 'rgba(200,169,106,0.92)', borderRadius: '2rem', fontFamily: 'sans-serif', fontSize: '0.48rem', letterSpacing: '0.25em', textTransform: 'uppercase', color: '#1C1916', border: '1px solid rgba(200,169,106,0.5)', pointerEvents: 'none' }}>
              Sale
            </div>
          )}

          {product.new_arrival && (
            <div style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', padding: '0.3rem 0.9rem', background: 'rgba(28,25,22,0.85)', borderRadius: '2rem', fontFamily: 'sans-serif', fontSize: '0.48rem', letterSpacing: '0.25em', textTransform: 'uppercase', color: '#F5F0E8', border: '1px solid rgba(200,169,106,0.3)', pointerEvents: 'none' }}>
              New
            </div>
          )}

          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onFavClick(product); }}
            title="Save to favourites"
            style={{
              position: 'absolute', bottom: '0.9rem', left: '0.9rem', zIndex: 10,
              width: '2rem', height: '2rem', borderRadius: '50%',
              background: 'rgba(248,244,238,0.82)',
              border: `1px solid ${isFav ? 'rgba(200,169,106,0.65)' : 'rgba(200,169,106,0.28)'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', backdropFilter: 'blur(6px)',
              opacity: showFav ? 1 : 0,
              transform: showFav ? 'translateY(0) scale(1)' : 'translateY(8px) scale(0.84)',
              transition: 'opacity 0.38s ease 0.05s, transform 0.42s cubic-bezier(0.34,1.56,0.64,1) 0.05s, border 0.2s ease',
            }}
          >
            <HeartIcon filled={isFav} />
          </button>

          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onCartClick(product); }}
            style={{
              position: 'absolute', bottom: '0.9rem', right: '0.9rem', zIndex: 10,
              display: 'flex', alignItems: 'center', gap: '0.42rem',
              padding: '0.48rem 1.1rem',
              background: 'rgba(248,244,238,0.88)',
              border: '1px solid rgba(200,169,106,0.35)',
              borderRadius: '2rem', cursor: 'pointer',
              fontFamily: 'sans-serif', fontSize: '0.52rem', letterSpacing: '0.22em',
              textTransform: 'uppercase', color: '#7A6540', fontWeight: 600,
              backdropFilter: 'blur(6px)',
              opacity: hovered ? 1 : 0,
              transform: hovered ? 'translateY(0)' : 'translateY(8px)',
              transition: 'opacity 0.35s ease 0.08s, transform 0.42s cubic-bezier(0.34,1.56,0.64,1) 0.08s, background 0.2s ease',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(200,169,106,0.22)'; e.currentTarget.style.borderColor = 'rgba(200,169,106,0.6)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(248,244,238,0.88)'; e.currentTarget.style.borderColor = 'rgba(200,169,106,0.35)'; }}
          >
            <CartIcon />
            Add to cart
          </button>
        </div>

        <Link to={`/product/${product.id}`} style={{ display: 'block', textDecoration: 'none', paddingTop: '0.85rem' }}>
          <p style={{ fontFamily: 'sans-serif', fontSize: '0.5rem', letterSpacing: '0.28em', textTransform: 'uppercase', color: '#B0A090', marginBottom: '0.25rem' }}>
            {product.category}
          </p>
          <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.1rem', fontWeight: 500, color: '#1C1916', letterSpacing: '0.02em', marginBottom: '0.3rem' }}>
            {product.name}
          </p>
          <div style={{ height: '1px', background: 'linear-gradient(to right, rgba(200,169,106,0.5), transparent)', width: hovered ? '65%' : '0', transition: 'width 0.42s ease', marginBottom: '0.3rem' }} />
          {isOnSale ? (
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
              <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '0.95rem', fontStyle: 'italic', fontWeight: 300, color: '#9A7D4A' }}>
                {Number(product.discount_price).toLocaleString()} DA
              </p>
              <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '0.8rem', fontStyle: 'italic', fontWeight: 300, color: '#B0A090', textDecoration: 'line-through' }}>
                {Number(product.price).toLocaleString()} DA
              </p>
            </div>
          ) : (
            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '0.95rem', fontStyle: 'italic', fontWeight: 300, color: '#9A7D4A' }}>
              {Number(product.price).toLocaleString()} DA
            </p>
          )}
        </Link>
      </div>
    </ScrollCard>
  );
}

const GoldRule = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
    <div style={{ height: '1px', flex: 1, background: 'linear-gradient(to right, transparent, #C8A96A)' }} />
    <div style={{ width: '5px', height: '5px', background: '#C8A96A', transform: 'rotate(45deg)' }} />
    <div style={{ height: '1px', flex: 1, background: 'linear-gradient(to left, transparent, #C8A96A)' }} />
  </div>
);

export function FurniturePage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState("All");
  const [favSet, setFavSet] = useState(new Set());
  const [toast, setToast] = useState({ visible: false, message: '' });
  const toastTimer = useRef(null);

  const campaignParam = searchParams.get('campaign');
  const isCampaignActive = !!campaignParam;

  useEffect(() => {
    const style = document.createElement('style');
    style.id = '__furniture-kf__';
    style.textContent = KEYFRAMES;
    if (!document.getElementById('__furniture-kf__')) document.head.appendChild(style);

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@400;700;900&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&display=swap';
    document.head.appendChild(link);
    return () => { try { document.head.removeChild(link); } catch { } };
  }, []);

  useEffect(() => {
    api.get('/api/products')
      .then(r => setProducts(r.data))
      .catch(() => setError('Failed to load products'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!campaignParam) { setCampaign(null); return; }
    api.get('/api/campaigns/active')
      .then(r => {
        const match = r.data.find(c => c.campaign_type === campaignParam);
        setCampaign(match || null);
      })
      .catch(() => setCampaign(null));
  }, [campaignParam]);

  // ✅ FIX: لا تكول /api/favorites إلا كي يكون token موجود
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    api.get('/api/favorites')
      .then(r => setFavSet(new Set(r.data.map(f => f.product_id))))
      .catch(() => { });
  }, []);

  const showToast = (message) => {
    clearTimeout(toastTimer.current);
    setToast({ visible: true, message });
    toastTimer.current = setTimeout(() => setToast(t => ({ ...t, visible: false })), 2400);
  };

  const handleCartClick = async (product) => {
    try {
      await api.post('/api/cart', null, { params: { product_id: product.id, quantity: 1 } });
      showToast(`${product.name} added to cart`);
      window.dispatchEvent(new CustomEvent('aroom:counts', { detail: { cart: true } }));
    } catch (err) {
      if (err.response?.status === 401) navigate('/login');
      else showToast('Failed to add to cart');
    }
  };

  const handleFavClick = async (product) => {
    const token = localStorage.getItem('token');
    if (!token) { navigate('/login'); return; }

    const isFav = favSet.has(product.id);
    try {
      if (isFav) {
        const res = await api.get('/api/favorites');
        const fav = res.data.find(f => f.product_id === product.id);
        if (fav) await api.delete(`/api/favorites/${fav.id}`);
        setFavSet(prev => { const n = new Set(prev); n.delete(product.id); return n; });
        showToast('Removed from favourites');
      } else {
        await api.post('/api/favorites', null, { params: { product_id: product.id } });
        setFavSet(prev => new Set([...prev, product.id]));
        showToast(`${product.name} saved to favourites`);
        window.dispatchEvent(new CustomEvent('aroom:counts', { detail: { fav: true } }));
      }
    } catch (err) {
      if (err.response?.status === 401) navigate('/login');
      else showToast('Something went wrong');
    }
  };

  const isProductOnSale = (product) =>
    product.on_sale === true ||
    (product.discount_price != null && Number(product.discount_price) < Number(product.price));

  const isProductNew = (product) => {
    if (product.new_arrival === true) return true;
    if (product.created_at) {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return new Date(product.created_at) > thirtyDaysAgo;
    }
    return false;
  };

  let filteredByCampaign = products;
  if (campaignParam === 'sale') filteredByCampaign = products.filter(isProductOnSale);
  else if (campaignParam === 'new') filteredByCampaign = products.filter(isProductNew);

  const filtered = activeCategory === 'All'
    ? filteredByCampaign
    : filteredByCampaign.filter(p => p.category?.toLowerCase() === activeCategory.toLowerCase());

  const clearCampaign = () => setSearchParams({});

  const campaignTitle = campaign?.title
    || (campaignParam === 'sale' ? 'Summer Sale' : campaignParam === 'new' ? 'New Arrivals' : '');

  const campaignSubtitle = campaign
    ? (campaign.discount
      ? `${campaign.discount_type === 'percent' ? campaign.discount + '%' : campaign.discount + ' DA'} off selected items.`
      : '')
    : (campaignParam === 'sale'
      ? 'Up to 20% off selected items. Limited time, timeless design.'
      : 'Fresh from the workshop – the latest pieces to arrive this season.');

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#F5F0E8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
        <div style={{ position: 'relative', width: '48px', height: '48px' }}>
          <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '1px solid #C8A96A', borderTopColor: 'transparent', animation: 'spin 1s linear infinite' }} />
          <div style={{ position: 'absolute', inset: '5px', borderRadius: '50%', border: '1px solid rgba(200,169,106,0.25)' }} />
        </div>
        <p style={{ fontFamily: 'sans-serif', fontSize: '0.625rem', letterSpacing: '0.45em', textTransform: 'uppercase', color: '#9E8E7A' }}>Curating the collection</p>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    </div>
  );

  if (error) return (
    <div style={{ minHeight: '100vh', background: '#F5F0E8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ fontFamily: 'sans-serif', fontSize: '0.6875rem', letterSpacing: '0.3em', textTransform: 'uppercase', color: '#9E8E7A' }}>{error}</p>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#F5F0E8', overflowX: 'hidden', fontFamily: "'Cormorant Garamond', Georgia, serif" }}>

      {/* HERO */}
      <div style={{ position: 'relative', paddingTop: 'clamp(7rem,14vw,14rem)', paddingBottom: '5rem', paddingLeft: 'clamp(1.5rem,6vw,6rem)', paddingRight: 'clamp(1.5rem,6vw,6rem)', overflow: 'hidden' }}>

        <Appear delay={0} animation="fadeIn" duration={1.4} style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', userSelect: 'none' }}>
          <span aria-hidden="true" style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: 'clamp(5rem, 22vw, 18rem)', fontWeight: 900, color: 'transparent', WebkitTextStroke: '1px rgba(180,148,90,0.055)', letterSpacing: '0.12em', whiteSpace: 'nowrap' }}>
            ATELIER
          </span>
        </Appear>

        <Appear delay={80} animation="fadeDown" duration={0.7}>
          <p style={{ fontFamily: 'sans-serif', fontSize: '0.625rem', letterSpacing: '0.38em', textTransform: 'uppercase', color: '#9E8E7A', marginBottom: '1.25rem', position: 'relative' }}>
            {isCampaignActive ? `Limited Campaign • ${campaignTitle}` : 'The Full Catalogue'}
          </p>
        </Appear>

        <Appear delay={200} animation="fadeUp" duration={0.9}>
          <h1 style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: 'clamp(2rem, 5.5vw, 5.25rem)', fontWeight: 700, letterSpacing: '0.035em', lineHeight: 1.08, color: '#1C1916', marginBottom: '1.75rem', position: 'relative' }}>
            {isCampaignActive ? campaignTitle : 'Shop Furniture'}
          </h1>
        </Appear>

        <Appear delay={400} animation="fadeIn" duration={0.8}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', maxWidth: '14rem', marginBottom: '2.25rem' }}>
            <div style={{ height: '1px', flex: 1, background: '#C8A96A', opacity: 0.55, transformOrigin: 'left', animation: 'goldLineDraw 0.7s cubic-bezier(0.16,1,0.3,1) 0.4s both' }} />
            <div style={{ width: '4px', height: '4px', background: '#C8A96A', animation: 'diamondPop 0.5s cubic-bezier(0.34,1.56,0.64,1) 0.7s both' }} />
            <div style={{ height: '1px', flex: 1, background: '#C8A96A', opacity: 0.55, transformOrigin: 'right', animation: 'goldLineDraw 0.7s cubic-bezier(0.16,1,0.3,1) 0.5s both' }} />
          </div>
        </Appear>

        {campaign?.code && (
          <Appear delay={320} animation="fadeUp" duration={0.6}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', background: 'rgba(200,169,106,0.1)', border: '1px solid rgba(200,169,106,0.35)', borderRadius: '2rem', padding: '0.4rem 1.2rem', marginBottom: '1.25rem' }}>
              <span style={{ fontFamily: 'sans-serif', fontSize: '0.52rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: '#9A7D4A' }}>Code</span>
              <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1rem', fontWeight: 600, letterSpacing: '0.12em', color: '#1C1916' }}>{campaign.code}</span>
              {campaign.discount && (
                <span style={{ fontFamily: 'sans-serif', fontSize: '0.52rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#C8A96A' }}>
                  {campaign.discount_type === 'percent' ? `${campaign.discount}% off` : `${campaign.discount} DA off`}
                </span>
              )}
            </div>
          </Appear>
        )}

        <Appear delay={500} animation="fadeUp" duration={0.8}>
          <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.25rem', fontStyle: 'italic', fontWeight: 300, color: '#6B5F52', maxWidth: '34rem', lineHeight: 1.85, position: 'relative' }}>
            {isCampaignActive
              ? campaignSubtitle
              : 'Every piece can be previewed in your room with AR before you buy. Crafted for those who refuse to compromise on beauty.'}
          </p>
        </Appear>

        {isCampaignActive && (
          <Appear delay={650} animation="fadeUp" duration={0.5}>
            <button
              onClick={clearCampaign}
              style={{
                marginTop: '2rem', background: 'transparent',
                border: '1px solid rgba(200,169,106,0.4)', padding: '0.5rem 1.5rem',
                borderRadius: '2rem', fontSize: '0.55rem', letterSpacing: '0.22em',
                textTransform: 'uppercase', color: '#9A7D4A', cursor: 'pointer',
                fontFamily: 'sans-serif', transition: 'all 0.25s ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(200,169,106,0.1)'; e.currentTarget.style.borderColor = '#C8A96A'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(200,169,106,0.4)'; }}
            >
              ← Browse all furniture
            </button>
          </Appear>
        )}
      </div>

<<<<<<< HEAD
=======
      {/* Personalize button */}
<Appear delay={650} animation="fadeUp" duration={0.8} style={{ display: 'flex', justifyContent: 'center' }}>
  <button
    onClick={() => navigate('/furniture/customize')}
    style={{
      marginTop: '2.5rem',
      display: 'inline-flex', alignItems: 'center', gap: '0.75rem',
      padding: '1rem 2.5rem',
      fontFamily: 'sans-serif', fontSize: '0.625rem', letterSpacing: '0.3em',
      textTransform: 'uppercase', fontWeight: 600,
      color: '#F5F0E8',
      background: 'linear-gradient(135deg, #C8A96A 0%, #9A7D4A 100%)',
      border: 'none',
      borderRadius: '3px',
      cursor: 'pointer',
      boxShadow: '0 8px 32px rgba(200,169,106,0.35)',
      transition: 'all 0.3s ease',
      position: 'relative',
    }}
    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(200,169,106,0.5)' }}
    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(200,169,106,0.35)' }}
  >
    <span style={{ fontSize: '0.75rem' }}>✦</span>
    Personalize Your Furniture
    <span style={{ fontSize: '0.85rem', opacity: 0.8 }}>→</span>
  </button>
</Appear>

      {/* ── Gold divider (draws in) ── */}
>>>>>>> b4b9f20 (new feature: furniture personalizer with 3D configurator, door animation, cart integration)
      <Appear delay={620} animation="fadeIn" duration={0.6} style={{ padding: '0 clamp(1.5rem,6vw,6rem)' }}>
        <GoldRule />
      </Appear>

      {/* CATEGORY FILTER */}
      <Appear delay={700} animation="fadeUp" duration={0.6} style={{ padding: '3rem clamp(1.5rem,6vw,6rem) 1rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.5rem' }}>
          {CATEGORIES.map((cat, ci) => {
            const isActive = activeCategory === cat;
            return (
              <button key={cat} onClick={() => setActiveCategory(cat)}
                style={{
                  padding: '0.5rem 1.5rem',
                  fontFamily: 'sans-serif', fontSize: '0.625rem', letterSpacing: '0.22em', textTransform: 'uppercase', fontWeight: 500,
                  border: `1px solid ${isActive ? 'rgba(200,169,106,0.55)' : 'rgba(200,169,106,0.2)'}`,
                  background: isActive ? 'rgba(200,169,106,0.12)' : 'transparent',
                  color: isActive ? '#9A7D4A' : '#B0A090',
                  cursor: 'pointer', transition: 'all 0.22s ease', borderRadius: '2rem', outline: 'none',
                  animation: `fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) ${700 + ci * 60}ms both`,
                }}
                onMouseEnter={e => { if (!isActive) { e.currentTarget.style.borderColor = 'rgba(200,169,106,0.4)'; e.currentTarget.style.color = '#9A7D4A'; } }}
                onMouseLeave={e => { if (!isActive) { e.currentTarget.style.borderColor = 'rgba(200,169,106,0.2)'; e.currentTarget.style.color = '#B0A090'; } }}
              >
                {cat}
              </button>
            );
          })}
          <span style={{ marginLeft: 'auto', fontFamily: 'sans-serif', fontSize: '0.6rem', letterSpacing: '0.3em', textTransform: 'uppercase', color: '#B0A090', animation: 'fadeIn 0.6s ease 1s both' }}>
            {filtered.length} piece{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>
      </Appear>

      <div style={{ padding: '1rem clamp(1.5rem,6vw,6rem) 0' }}>
        <div style={{ height: '1px', background: 'rgba(200,169,106,0.18)' }} />
      </div>

      {/* PRODUCT GRID */}
      <div style={{ padding: '3.5rem clamp(1.5rem,6vw,6rem) 6rem' }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '9rem 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem' }}>
            <div style={{ width: '1px', height: '3.5rem', background: 'linear-gradient(to bottom, transparent, #C8A96A)' }} />
            <p style={{ fontFamily: 'sans-serif', fontSize: '0.625rem', letterSpacing: '0.35em', textTransform: 'uppercase', color: '#9E8E7A' }}>
              {isCampaignActive ? `No products in ${campaignTitle} campaign` : 'No pieces in this category'}
            </p>
            {isCampaignActive && (
              <button onClick={clearCampaign} style={{ background: 'none', border: '1px solid rgba(200,169,106,0.3)', padding: '0.5rem 1.2rem', borderRadius: '2rem', fontSize: '0.55rem', letterSpacing: '0.2em', fontFamily: 'sans-serif', color: '#9A7D4A', cursor: 'pointer' }}>
                View all furniture
              </button>
            )}
            <div style={{ width: '1px', height: '3.5rem', background: 'linear-gradient(to bottom, #C8A96A, transparent)' }} />
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))', gap: '2rem 2rem' }}>
            {filtered.map((p, i) => (
              <ProductCard
                key={p.id}
                product={p}
                index={i}
                onCartClick={handleCartClick}
                onFavClick={handleFavClick}
                favSet={favSet}
              />
            ))}
          </div>
        )}
      </div>

      {/* FOOTER */}
      <div style={{ padding: '0 clamp(1.5rem,6vw,6rem) 5rem' }}>
        <GoldRule />
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2.5rem' }}>
          <span style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: '0.625rem', letterSpacing: '0.5em', textTransform: 'uppercase', color: 'rgba(200,169,106,0.35)' }}>
            enter your sanctuary
          </span>
        </div>
      </div>

      <Toast visible={toast.visible} message={toast.message} />
    </div>
  );
}