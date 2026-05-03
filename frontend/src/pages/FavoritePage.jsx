import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";

const BASE = "http://127.0.0.1:8000";
const img = (path) => (path ? `${BASE}/${path}` : null);

const GoldRule = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
    <div style={{ height: '1px', flex: 1, background: 'linear-gradient(to right, transparent, #C8A96A)' }} />
    <div style={{ width: '5px', height: '5px', background: '#C8A96A', transform: 'rotate(45deg)' }} />
    <div style={{ height: '1px', flex: 1, background: 'linear-gradient(to left, transparent, #C8A96A)' }} />
  </div>
);

export function FavoritePage() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@400;700;900&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&display=swap';
    document.head.appendChild(link);
    return () => document.head.removeChild(link);
  }, []);

  const fetchFavorites = async () => {
    try {
      const res = await api.get("/api/favorites");
      setFavorites(res.data);
      window.dispatchEvent(new CustomEvent('aroom:counts', { detail: { fav: res.data.length } }));
    } catch (err) {
      if (err.response?.status === 401) navigate("/login");
    } finally {
      setLoading(false);
      setTimeout(() => setMounted(true), 50);
    }
  };

  useEffect(() => { fetchFavorites(); }, []);

  const removeFavorite = async (favId) => {
    try {
      await api.delete(`/api/favorites/${favId}`);
      fetchFavorites();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-cream flex items-center justify-center">
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
        <div style={{ position: 'relative', width: '48px', height: '48px' }}>
          <div className="animate-spin" style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '1px solid #C8A96A', borderTopColor: 'transparent' }} />
          <div style={{ position: 'absolute', inset: '5px', borderRadius: '50%', border: '1px solid rgba(200,169,106,0.25)' }} />
        </div>
        <p style={{ fontFamily: 'sans-serif', fontSize: '0.625rem', letterSpacing: '0.45em', textTransform: 'uppercase', color: '#9E8E7A' }}>
          Loading your collection
        </p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-cream overflow-x-hidden"
      style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>

      {/* ── HERO HEADER ── */}
      <div style={{ position: 'relative', paddingTop: 'clamp(7rem,14vw,14rem)', paddingBottom: '5rem', paddingLeft: 'clamp(1.5rem,6vw,6rem)', paddingRight: 'clamp(1.5rem,6vw,6rem)', overflow: 'hidden' }}>

        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', userSelect: 'none' }} aria-hidden="true">
          <span style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: 'clamp(5rem, 22vw, 18rem)', fontWeight: 900, color: 'transparent', WebkitTextStroke: '1px rgba(180,148,90,0.05)', letterSpacing: '0.12em', whiteSpace: 'nowrap' }}>
            SAVED
          </span>
        </div>

        <p style={{ fontFamily: 'sans-serif', fontSize: '0.625rem', letterSpacing: '0.38em', textTransform: 'uppercase', color: '#9E8E7A', marginBottom: '1.25rem', position: 'relative' }}>
          Your Curation
        </p>

        <h1 style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: 'clamp(2rem, 5.5vw, 5.25rem)', fontWeight: 700, letterSpacing: '0.035em', lineHeight: 1.08, color: '#1C1916', marginBottom: '1.75rem', position: 'relative' }}>
          Favourites
        </h1>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', maxWidth: '14rem', marginBottom: '2.25rem' }}>
          <div style={{ height: '1px', flex: 1, background: '#C8A96A', opacity: 0.55 }} />
          <div style={{ width: '4px', height: '4px', background: '#C8A96A', transform: 'rotate(45deg)', opacity: 0.7 }} />
          <div style={{ height: '1px', flex: 1, background: '#C8A96A', opacity: 0.55 }} />
        </div>

        <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.25rem', fontStyle: 'italic', fontWeight: 300, color: '#6B5F52', maxWidth: '32rem', lineHeight: 1.85, position: 'relative' }}>
          Pieces you've set aside — each one chosen with intention.
        </p>
      </div>

      <div style={{ padding: '0 clamp(1.5rem,6vw,6rem)' }}>
        <GoldRule />
      </div>

      {favorites.length > 0 && (
        <div style={{ padding: '1.5rem clamp(1.5rem,6vw,6rem) 0', display: 'flex', justifyContent: 'flex-end' }}>
          <span style={{ fontFamily: 'sans-serif', fontSize: '0.6rem', letterSpacing: '0.3em', textTransform: 'uppercase', color: '#B0A090' }}>
            {favorites.length} piece{favorites.length !== 1 ? 's' : ''} saved
          </span>
        </div>
      )}

      <div style={{ padding: `${favorites.length > 0 ? '1rem' : '2rem'} clamp(1.5rem,6vw,6rem) 0` }}>
        <div style={{ height: '1px', background: 'rgba(200,169,106,0.18)' }} />
      </div>

      <div style={{ padding: '3.5rem clamp(1.5rem,6vw,6rem) 6rem' }}>

        {favorites.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingTop: '6rem', paddingBottom: '6rem', gap: '1.5rem' }}>
            <div style={{ width: '1px', height: '3.5rem', background: 'linear-gradient(to bottom, transparent, #C8A96A)' }} />
            <div style={{ width: '72px', height: '72px', borderRadius: '50%', border: '1px solid rgba(200,169,106,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(200,169,106,0.04)' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '28px', color: 'rgba(200,169,106,0.5)' }}>favorite</span>
            </div>
            <p style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: '0.85rem', letterSpacing: '0.06em', color: 'rgba(28,25,22,0.45)', textAlign: 'center' }}>
              No Saved Pieces Yet
            </p>
            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', fontSize: '1.05rem', color: '#9E8E7A', textAlign: 'center' }}>
              Pieces you admire will appear here.
            </p>
            <div style={{ width: '1px', height: '3.5rem', background: 'linear-gradient(to bottom, #C8A96A, transparent)' }} />
            <Link to="/furniture" style={{ fontFamily: 'sans-serif', fontSize: '0.625rem', letterSpacing: '0.28em', textTransform: 'uppercase', color: '#9A7D4A', textDecoration: 'none', padding: '0.65rem 2rem', border: '1px solid rgba(200,169,106,0.45)', borderRadius: '999px', background: 'rgba(200,169,106,0.07)', transition: 'all 0.22s ease' }}>
              Browse the Collection
            </Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))', gap: '2rem 2rem' }}
            className="sm:grid-cols-2 lg:grid-cols-3"
          >
            {favorites.map((fav, i) => (
              <div key={fav.id}
                style={{ position: 'relative', opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(20px)', transition: `opacity 0.55s ease ${i * 0.06}s, transform 0.55s ease ${i * 0.06}s` }}
                className="group"
              >
                <button
                  onClick={() => removeFavorite(fav.id)}
                  aria-label="Remove from favourites"
                  style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', zIndex: 10, width: '2rem', height: '2rem', borderRadius: '50%', border: '1px solid rgba(200,169,106,0.35)', background: 'rgba(245,240,232,0.85)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.22s ease', color: '#9E8E7A' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(200,169,106,0.15)'; e.currentTarget.style.borderColor = '#C8A96A'; e.currentTarget.style.color = '#9A7D4A'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(245,240,232,0.85)'; e.currentTarget.style.borderColor = 'rgba(200,169,106,0.35)'; e.currentTarget.style.color = '#9E8E7A'; }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>close</span>
                </button>

                <Link to={`/product/${fav.product_id}`} style={{ display: 'block', textDecoration: 'none' }}>
                  <div style={{ aspectRatio: '3 / 4', background: '#F0EBE3', overflow: 'hidden', borderRadius: '2px' }}>
                    {fav.product?.image_url ? (
                      <img
                        src={img(fav.product.image_url)}
                        alt={fav.product?.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.7s ease' }}
                        className="group-hover:scale-[1.03]"
                        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.04)'}
                        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                      />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '48px', color: 'rgba(158,142,122,0.25)' }}>image</span>
                      </div>
                    )}
                  </div>

                  <div style={{ paddingTop: '1.1rem' }}>
                    <div style={{ height: '1px', background: 'rgba(200,169,106,0.22)', marginBottom: '1rem' }} />
                    <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.15rem', fontWeight: 400, color: '#1C1916', lineHeight: 1.35, marginBottom: '0.4rem', transition: 'color 0.25s ease' }}
                      onMouseEnter={e => e.currentTarget.style.color = '#9A7D4A'}
                      onMouseLeave={e => e.currentTarget.style.color = '#1C1916'}
                    >
                      {fav.product?.name}
                    </h3>
                    <p style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: '0.7rem', fontWeight: 400, letterSpacing: '0.05em', color: '#9A7D4A' }}>
                      {fav.product?.price} DA
                    </p>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ padding: '0 clamp(1.5rem,6vw,6rem) 5rem' }}>
        <GoldRule />
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2.5rem' }}>
          <span style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: '0.625rem', letterSpacing: '0.5em', textTransform: 'uppercase', color: 'rgba(200,169,106,0.35)' }}>
            curated with intention
          </span>
        </div>
      </div>

    </div>
  );
}