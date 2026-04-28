import { useEffect, useState } from 'react';
import ProductCard from '../components/ProductCard';
import api from '../services/api';

const CATEGORIES = ["All", "Chairs", "Tables", "Lamps", "Sofas"];

export function FurniturePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState("All");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href =
      'https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@400;700;900&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&display=swap';
    document.head.appendChild(link);
    return () => document.head.removeChild(link);
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get('/api/products');
        setProducts(response.data);
      } catch (err) {
        console.error(err);
        setError('Failed to load products');
      } finally {
        setLoading(false);
        setTimeout(() => setMounted(true), 50);
      }
    };
    fetchProducts();
  }, []);

  const filtered =
    activeCategory === 'All'
      ? products
      : products.filter(
        (p) => p.category?.toLowerCase() === activeCategory.toLowerCase()
      );

  const GoldRule = () => (
    <div className="flex items-center gap-3">
      <div style={{ height: '1px', flex: 1, background: 'linear-gradient(to right, transparent, #C8A96A)' }} />
      <div style={{ width: '5px', height: '5px', background: '#C8A96A', transform: 'rotate(45deg)' }} />
      <div style={{ height: '1px', flex: 1, background: 'linear-gradient(to left, transparent, #C8A96A)' }} />
    </div>
  );

  if (loading)
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <div className="relative w-12 h-12">
            <div
              className="absolute inset-0 rounded-full animate-spin"
              style={{ border: '1px solid #C8A96A', borderTopColor: 'transparent' }}
            />
            <div
              className="absolute inset-[5px] rounded-full"
              style={{ border: '1px solid rgba(200,169,106,0.25)' }}
            />
          </div>
          <p
            style={{
              fontFamily: 'sans-serif',
              fontSize: '0.625rem',
              letterSpacing: '0.45em',
              textTransform: 'uppercase',
              color: '#9E8E7A',
            }}
          >
            Curating the collection
          </p>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <p
          style={{
            fontFamily: 'sans-serif',
            fontSize: '0.6875rem',
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
            color: '#9E8E7A',
          }}
        >
          {error}
        </p>
      </div>
    );

  return (
    <div className="min-h-screen bg-cream overflow-x-hidden" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>

      {/* ── HERO HEADER ── */}
      <div className="relative pt-48 md:pt-56 pb-20 px-6 md:px-14 lg:px-24 overflow-hidden">

        {/* Ghosted background wordmark */}
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
          aria-hidden="true"
        >
          <span
            style={{
              fontFamily: "'Cinzel Decorative', serif",
              fontSize: 'clamp(5rem, 22vw, 18rem)',
              fontWeight: 900,
              color: 'transparent',
              WebkitTextStroke: '1px rgba(180,148,90,0.055)',
              letterSpacing: '0.12em',
              whiteSpace: 'nowrap',
            }}
          >
            ATELIER
          </span>
        </div>

        {/* Eyebrow */}
        <p
          style={{
            fontFamily: 'sans-serif',
            fontSize: '0.625rem',
            letterSpacing: '0.38em',
            textTransform: 'uppercase',
            color: '#9E8E7A',
            marginBottom: '1.25rem',
          }}
        >
          The Full Catalogue
        </p>

        {/* H1 — Cinzel Decorative */}
        <h1
          style={{
            fontFamily: "'Cinzel Decorative', serif",
            fontSize: 'clamp(2rem, 5.5vw, 5.25rem)',
            fontWeight: 700,
            letterSpacing: '0.035em',
            lineHeight: 1.08,
            color: '#1C1916',
            marginBottom: '1.75rem',
          }}
        >
          Shop Furniture
        </h1>

        {/* Gold ornament beneath heading */}
        <div className="flex items-center gap-3 mb-9" style={{ maxWidth: '14rem' }}>
          <div style={{ height: '1px', flex: 1, background: '#C8A96A', opacity: 0.55 }} />
          <div style={{ width: '4px', height: '4px', background: '#C8A96A', transform: 'rotate(45deg)', opacity: 0.7 }} />
          <div style={{ height: '1px', flex: 1, background: '#C8A96A', opacity: 0.55 }} />
        </div>

        {/* Lead copy */}
        <p
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: '1.25rem',
            fontStyle: 'italic',
            fontWeight: 300,
            color: '#6B5F52',
            maxWidth: '34rem',
            lineHeight: 1.85,
          }}
        >
          Every piece can be previewed in your room with AR before you buy.
          Crafted for those who refuse to compromise on beauty.
        </p>
      </div>

      {/* ── FULL-WIDTH GOLD DIVIDER ── */}
      <div className="px-6 md:px-14 lg:px-24">
        <GoldRule />
      </div>

      {/* ── CATEGORY FILTER ── */}
      <div className="px-6 md:px-14 lg:px-24 pt-12 pb-4">
        <div className="flex flex-wrap items-center gap-2">
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                style={{
                  padding: '0.5rem 1.5rem',
                  fontFamily: 'sans-serif',
                  fontSize: '0.625rem',
                  letterSpacing: '0.22em',
                  textTransform: 'uppercase',
                  fontWeight: 500,
                  border: `1px solid ${isActive ? 'rgba(200,169,106,0.55)' : 'rgba(200,169,106,0.2)'}`,
                  background: isActive ? 'rgba(200,169,106,0.12)' : 'transparent',
                  color: isActive ? '#9A7D4A' : '#B0A090',
                  cursor: 'pointer',
                  transition: 'all 0.22s ease',
                  borderRadius: '2rem',
                  outline: 'none',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.borderColor = 'rgba(200,169,106,0.4)';
                    e.currentTarget.style.color = '#9A7D4A';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.borderColor = 'rgba(200,169,106,0.2)';
                    e.currentTarget.style.color = '#B0A090';
                  }
                }}
              >
                {cat}
              </button>
            );
          })}

          <span
            className="hidden md:block"
            style={{
              marginLeft: 'auto',
              fontFamily: 'sans-serif',
              fontSize: '0.6rem',
              letterSpacing: '0.3em',
              textTransform: 'uppercase',
              color: '#B0A090',
            }}
          >
            {filtered.length} piece{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* ── THIN RULE ── */}
      <div className="px-6 md:px-14 lg:px-24 pt-8 pb-1">
        <div style={{ height: '1px', background: 'rgba(200,169,106,0.18)' }} />
      </div>

      {/* ── PRODUCT GRID ── */}
      <div className="px-6 md:px-14 lg:px-24 py-14">
        {filtered.length === 0 ? (
          <div className="text-center py-36 flex flex-col items-center gap-5">
            <div style={{ width: '1px', height: '3.5rem', background: 'linear-gradient(to bottom, transparent, #C8A96A)' }} />
            <p
              style={{
                fontFamily: 'sans-serif',
                fontSize: '0.625rem',
                letterSpacing: '0.35em',
                textTransform: 'uppercase',
                color: '#9E8E7A',
              }}
            >
              No pieces in this category
            </p>
            <div style={{ width: '1px', height: '3.5rem', background: 'linear-gradient(to bottom, #C8A96A, transparent)' }} />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-14">
            {filtered.map((p, i) => (
              <div
                key={p.id}
                style={{
                  opacity: mounted ? 1 : 0,
                  transform: mounted ? 'translateY(0)' : 'translateY(20px)',
                  transition: `opacity 0.55s ease ${i * 0.06}s, transform 0.55s ease ${i * 0.06}s`,
                }}
              >
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── FOOTER ORNAMENT ── */}
      <div className="px-6 md:px-14 lg:px-24 pb-20 pt-4">
        <GoldRule />
        <div className="flex justify-center mt-10">
          <span
            style={{
              fontFamily: "'Cinzel Decorative', serif",
              fontSize: '0.625rem',
              letterSpacing: '0.5em',
              textTransform: 'uppercase',
              color: 'rgba(200,169,106,0.35)',
            }}
          >
            enter your senctuary
          </span>
        </div>
      </div>

    </div>
  );
}