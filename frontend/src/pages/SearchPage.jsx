import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const BASE = "http://127.0.0.1:8000";
const img = (path) => {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${BASE}/${path}`;
};

const ANIM_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@400;700&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,500&display=swap');

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(28px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes lineGrow {
    from { transform: scaleX(0); opacity: 0; }
    to   { transform: scaleX(1); opacity: 1; }
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes cardIn {
    from { opacity: 0; transform: translateY(24px) scale(0.97); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }
  @keyframes panelOpen {
    from { opacity: 0; transform: translateY(-8px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .sp-eyebrow  { animation: fadeUp 0.4s cubic-bezier(0.16,1,0.3,1) 0.05s both; }
  .sp-title    { animation: fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) 0.13s both; }
  .sp-rule     { animation: lineGrow 0.55s cubic-bezier(0.16,1,0.3,1) 0.22s both; transform-origin: left; }
  .sp-sub      { animation: fadeUp 0.45s cubic-bezier(0.16,1,0.3,1) 0.28s both; }
  .sp-divider  { animation: fadeIn 0.4s ease 0.35s both; }
  .sp-bar      { animation: fadeUp 0.45s cubic-bezier(0.16,1,0.3,1) 0.42s both; }
  .sp-tags     { animation: fadeUp 0.4s cubic-bezier(0.16,1,0.3,1) 0.52s both; }

  .search-card {
    background: #FAF7F2;
    border: 1px solid rgba(200,169,106,0.18);
    border-radius: 4px; overflow: hidden; cursor: pointer;
    transition: box-shadow 0.35s ease, transform 0.35s cubic-bezier(0.16,1,0.3,1);
    animation: cardIn 0.5s cubic-bezier(0.16,1,0.3,1) both;
  }
  .search-card:hover {
    box-shadow: 0 20px 48px rgba(28,25,22,0.1);
    transform: translateY(-5px);
  }
  .search-card:hover .card-img { transform: scale(1.05); }
  .card-img {
    width: 100%; height: 100%; object-fit: cover;
    transition: transform 0.7s cubic-bezier(0.16,1,0.3,1);
  }
  .search-card:hover .card-arrow { transform: translateX(5px); color: #C8A96A; }
  .card-arrow {
    font-family: sans-serif; font-size: 0.55rem;
    letter-spacing: 0.28em; text-transform: uppercase;
    color: #9E8E7A; transition: transform 0.3s, color 0.3s; display: inline-block;
  }
  .search-input-field {
    flex: 1; background: transparent; border: none; outline: none;
    font-family: 'Cormorant Garamond', Georgia, serif;
    font-size: clamp(1.1rem, 3vw, 1.6rem);
    font-style: italic; font-weight: 300;
    color: #1C1916; caret-color: #C8A96A; padding: 0;
  }
  .search-input-field::placeholder { color: rgba(158,142,122,0.35); }
  .spinner {
    width: 20px; height: 20px; border-radius: 50%;
    border: 1.5px solid rgba(200,169,106,0.3); border-top-color: #C8A96A;
    animation: spin 0.8s linear infinite;
  }
  .result-fade { animation: fadeUp 0.45s cubic-bezier(0.16,1,0.3,1) both; }

  /* ── Filter styles ── */
  .sp-filter-chip {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 0.4rem 1.1rem; border-radius: 2rem; cursor: pointer;
    font-family: 'Cormorant Garamond', serif; font-size: 0.88rem;
    font-style: italic; font-weight: 400;
    border: 1px solid rgba(200,169,106,0.3);
    background: transparent; color: #9E8E7A;
    transition: all 0.2s ease; white-space: nowrap;
  }
  .sp-filter-chip:hover { border-color: #C8A96A; color: #1C1916; background: rgba(200,169,106,0.05); }
  .sp-filter-chip.active { background: #1C1916; border-color: #1C1916; color: #F5F0E8; font-style: normal; }

  .sp-sort-select {
    appearance: none;
    font-family: 'Cormorant Garamond', serif; font-size: 0.88rem;
    font-style: italic; font-weight: 400;
    color: #9E8E7A; background: transparent;
    border: 1px solid rgba(200,169,106,0.3); border-radius: 2rem;
    padding: 0.4rem 2.2rem 0.4rem 1rem;
    cursor: pointer; outline: none;
    transition: border-color 0.2s, color 0.2s;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%239E8E7A' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
    background-repeat: no-repeat; background-position: right 0.75rem center;
  }
  .sp-sort-select:hover, .sp-sort-select:focus { border-color: #C8A96A; color: #1C1916; }

  .sp-filter-panel {
    border: 1px solid rgba(200,169,106,0.2);
    border-radius: 4px; padding: 2rem 2.25rem;
    margin-bottom: 1.5rem; background: #FAF7F2;
    animation: panelOpen 0.28s cubic-bezier(0.16,1,0.3,1) both;
  }

  .sp-price-track {
    position: relative; height: 2px; background: rgba(200,169,106,0.2); border-radius: 2px;
  }
  .sp-price-fill {
    position: absolute; height: 100%; background: #C8A96A; border-radius: 2px; pointer-events: none;
  }
  .sp-range-input {
    position: absolute; width: 100%; height: 100%;
    appearance: none; background: transparent; outline: none;
    cursor: pointer; pointer-events: none; top: 0; left: 0; margin: 0;
  }
  .sp-range-input::-webkit-slider-thumb {
    appearance: none; width: 16px; height: 16px; border-radius: 50%;
    background: #F5F0E8; border: 2px solid #C8A96A;
    box-shadow: 0 1px 6px rgba(200,169,106,0.35);
    pointer-events: all; cursor: pointer; transition: transform 0.15s;
  }
  .sp-range-input::-webkit-slider-thumb:hover { transform: scale(1.25); }
  .sp-range-input::-moz-range-thumb {
    width: 16px; height: 16px; border-radius: 50%;
    background: #F5F0E8; border: 2px solid #C8A96A;
    pointer-events: all; cursor: pointer;
  }

  .sp-active-tag {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 0.2rem 0.75rem; border-radius: 2rem;
    background: rgba(200,169,106,0.1); border: 1px solid rgba(200,169,106,0.28);
    font-family: 'Cormorant Garamond', serif; font-size: 0.82rem;
    font-style: italic; color: #9A7D4A;
  }
  .sp-active-tag button {
    background: none; border: none; cursor: pointer; color: #C8A96A;
    font-size: 0.9rem; line-height: 1; padding: 0; margin-left: 2px; transition: color 0.15s;
  }
  .sp-active-tag button:hover { color: #9A7D4A; }
`;

const SORT_OPTIONS = [
  { value: 'default', label: 'Relevance' },
  { value: 'price_asc', label: 'Price: Low → High' },
  { value: 'price_desc', label: 'Price: High → Low' },
  { value: 'name_asc', label: 'Name: A → Z' },
  { value: 'name_desc', label: 'Name: Z → A' },
];

const MAX_PRICE = 500000;

function applyFiltersAndSort(results, { categories, minPrice, maxPrice, sortBy }) {
  let out = [...results];
  if (categories.length > 0)
    out = out.filter(p => categories.includes((p.category || '').toLowerCase()));
  out = out.filter(p => { const price = Number(p.price) || 0; return price >= minPrice && price <= maxPrice; });
  switch (sortBy) {
    case 'price_asc': out.sort((a, b) => Number(a.price) - Number(b.price)); break;
    case 'price_desc': out.sort((a, b) => Number(b.price) - Number(a.price)); break;
    case 'name_asc': out.sort((a, b) => a.name.localeCompare(b.name)); break;
    case 'name_desc': out.sort((a, b) => b.name.localeCompare(a.name)); break;
    default: break;
  }
  return out;
}

const GoldRule = () => (
  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
    <div style={{ height: "1px", flex: 1, background: "linear-gradient(to right, transparent, rgba(200,169,106,0.5))" }} />
    <div style={{ width: "5px", height: "5px", background: "#C8A96A", transform: "rotate(45deg)", flexShrink: 0 }} />
    <div style={{ height: "1px", flex: 1, background: "linear-gradient(to left, transparent, rgba(200,169,106,0.5))" }} />
  </div>
);

export function SearchPage() {
  const [keyword, setKeyword] = useState("");
  const [results, setResults] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [focused, setFocused] = useState(false);
  const [hovered, setHovered] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  // filter state
  const [allCategories, setAllCategories] = useState([]);
  const [selCategories, setSelCategories] = useState([]);
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(MAX_PRICE);
  const [sortBy, setSortBy] = useState('default');

  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => { setTimeout(() => inputRef.current?.focus(), 500); }, []);

  // re-apply filters on any change
  useEffect(() => {
    setFiltered(applyFiltersAndSort(results, { categories: selCategories, minPrice, maxPrice, sortBy }));
  }, [results, selCategories, minPrice, maxPrice, sortBy]);

  // extract categories from results
  useEffect(() => {
    if (!results.length) { setAllCategories([]); return; }
    setAllCategories([...new Set(results.map(p => (p.category || '').toLowerCase()).filter(Boolean))]);
  }, [results]);

  const handleSearch = async (e, term) => {
    if (e) e.preventDefault();
    const q = term ?? keyword;
    if (!q.trim()) return;
    if (term) setKeyword(term);
    setLoading(true); setSearched(false);
    setSelCategories([]); setMinPrice(0); setMaxPrice(MAX_PRICE); setSortBy('default');
    try {
      const res = await api.get("/search", { params: { keyword: q } });
      setResults(res.data);
    } catch (err) {
      console.error("Search error:", err); setResults([]);
    } finally {
      setLoading(false); setSearched(true);
    }
  };

  const handleClear = () => {
    setKeyword(""); setResults([]); setFiltered([]); setSearched(false);
    setSelCategories([]); setMinPrice(0); setMaxPrice(MAX_PRICE); setSortBy('default');
    inputRef.current?.focus();
  };

  const toggleCategory = (cat) =>
    setSelCategories(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]);

  const resetFilters = () => {
    setSelCategories([]); setMinPrice(0); setMaxPrice(MAX_PRICE); setSortBy('default');
  };

  const hasActiveFilters = selCategories.length > 0 || minPrice > 0 || maxPrice < MAX_PRICE || sortBy !== 'default';
  const fillLeft = (minPrice / MAX_PRICE) * 100;
  const fillRight = (maxPrice / MAX_PRICE) * 100;

  return (
    <div style={{ minHeight: "100vh", background: "#F5F0E8", color: "#1C1916", fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
      <style>{ANIM_CSS}</style>

      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "clamp(6rem, 12vw, 9rem) 1.5rem 6rem" }}>

        {/* ── HEADER ── */}
        <div style={{ marginBottom: "4rem" }}>
          <p className="sp-eyebrow" style={{ fontFamily: "sans-serif", fontSize: "0.575rem", letterSpacing: "0.38em", textTransform: "uppercase", color: "#9E8E7A", marginBottom: "1.25rem" }}>Discover</p>
          <h1 className="sp-title" style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: "clamp(2rem, 6vw, 4.5rem)", fontWeight: 700, letterSpacing: "0.03em", lineHeight: 1.05, color: "#1C1916", marginBottom: "1.5rem" }}>Find Your Piece</h1>
          <div className="sp-rule" style={{ maxWidth: "14rem", marginBottom: "1.25rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <div style={{ height: "1px", flex: 1, background: "#C8A96A", opacity: 0.55 }} />
              <div style={{ width: "4px", height: "4px", background: "#C8A96A", transform: "rotate(45deg)", opacity: 0.7, flexShrink: 0 }} />
              <div style={{ height: "1px", flex: 1, background: "#C8A96A", opacity: 0.55 }} />
            </div>
          </div>
          <p className="sp-sub" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.15rem", fontStyle: "italic", fontWeight: 300, color: "#6B5F52", maxWidth: "32rem", lineHeight: 1.85 }}>
            Search our full collection by name, style, or category.
          </p>
        </div>

        {/* ── DIVIDER ── */}
        <div className="sp-divider"><GoldRule /></div>

        {/* ── SEARCH BAR ── */}
        <div className="sp-bar" style={{ padding: "3rem 0 2rem" }}>
          <form onSubmit={handleSearch}>
            <div style={{
              display: "flex", alignItems: "center", gap: "1rem",
              borderBottom: `2px solid ${focused ? "#C8A96A" : "rgba(200,169,106,0.3)"}`,
              paddingBottom: "1rem", transition: "border-color 0.3s ease",
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                stroke={focused ? "#C8A96A" : "rgba(200,169,106,0.5)"}
                strokeWidth="1.5" style={{ flexShrink: 0, transition: "stroke 0.3s" }}>
                <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" strokeLinecap="round" />
              </svg>
              <input
                ref={inputRef} className="search-input-field" type="text"
                placeholder="sofas, oak tables, floor lamps…"
                value={keyword}
                onChange={e => setKeyword(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
              />
              {keyword && (
                <button type="button" onClick={handleClear} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(158,142,122,0.5)", fontSize: "1.3rem", lineHeight: 1, padding: "0 4px", transition: "color 0.2s", flexShrink: 0 }}
                  onMouseEnter={e => e.currentTarget.style.color = "#9E8E7A"}
                  onMouseLeave={e => e.currentTarget.style.color = "rgba(158,142,122,0.5)"}>×</button>
              )}
              <button type="submit" style={{ flexShrink: 0, background: "#1C1916", border: "1px solid #1C1916", borderRadius: "2rem", padding: "0.75rem 2rem", fontFamily: "sans-serif", fontSize: "0.575rem", letterSpacing: "0.28em", textTransform: "uppercase", color: "#F5F0E8", cursor: "pointer", transition: "background 0.2s" }}
                onMouseEnter={e => e.currentTarget.style.background = "#3D2F1F"}
                onMouseLeave={e => e.currentTarget.style.background = "#1C1916"}>Search</button>
            </div>
          </form>
        </div>

        {/* ── LOADING ── */}
        {loading && (
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "2rem 0", animation: "fadeIn 0.3s ease" }}>
            <div className="spinner" />
            <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1rem", fontStyle: "italic", fontWeight: 300, color: "#9E8E7A" }}>Searching the collection…</span>
          </div>
        )}

        {/* ── RESULTS ── */}
        {!loading && searched && (
          <div className="result-fade">
            <GoldRule />

            {/* Toolbar */}
            <div style={{ padding: "1.75rem 0 1.25rem", display: "flex", alignItems: "center", flexWrap: "wrap", gap: "0.75rem" }}>
              {/* Filter toggle */}
              <button
                onClick={() => setShowFilters(v => !v)}
                className={`sp-filter-chip ${showFilters ? 'active' : ''}`}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="4" y1="6" x2="20" y2="6" /><line x1="8" y1="12" x2="16" y2="12" /><line x1="11" y1="18" x2="13" y2="18" />
                </svg>
                Filters
                {hasActiveFilters && (
                  <span style={{ background: '#C8A96A', color: '#fff', borderRadius: '50%', width: 15, height: 15, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.55rem', fontWeight: 700, fontStyle: 'normal' }}>!</span>
                )}
              </button>

              {/* Sort */}
              <select className="sp-sort-select" value={sortBy} onChange={e => setSortBy(e.target.value)}>
                {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>

              {/* Count */}
              <span style={{ marginLeft: 'auto', fontFamily: "sans-serif", fontSize: "0.575rem", letterSpacing: "0.32em", textTransform: "uppercase", color: "#9E8E7A" }}>
                {filtered.length} {filtered.length === 1 ? 'piece' : 'pieces'} found
              </span>

              {/* Reset */}
              {hasActiveFilters && (
                <button onClick={resetFilters} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'Cormorant Garamond', serif", fontSize: "0.85rem", fontStyle: 'italic', color: "#C8A96A", textDecoration: "underline", textUnderlineOffset: 3 }}>
                  Reset filters
                </button>
              )}
            </div>

            {/* Filter Panel */}
            {showFilters && (
              <div className="sp-filter-panel">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '2rem' }}>

                  {/* Categories */}
                  {allCategories.length > 0 && (
                    <div>
                      <p style={{ fontFamily: "sans-serif", fontSize: "0.52rem", letterSpacing: "0.28em", textTransform: "uppercase", color: "#9E8E7A", marginBottom: "1rem" }}>Category</p>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                        {allCategories.map(cat => (
                          <button key={cat} className={`sp-filter-chip ${selCategories.includes(cat) ? 'active' : ''}`} onClick={() => toggleCategory(cat)}>
                            {cat}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Price range */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: "1rem" }}>
                      <p style={{ fontFamily: "sans-serif", fontSize: "0.52rem", letterSpacing: "0.28em", textTransform: "uppercase", color: "#9E8E7A", margin: 0 }}>Price Range</p>
                      <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "0.95rem", fontStyle: "italic", color: "#9A7D4A" }}>
                        {minPrice.toLocaleString()} — {maxPrice === MAX_PRICE ? `${MAX_PRICE.toLocaleString()}+` : maxPrice.toLocaleString()} DA
                      </span>
                    </div>
                    <div style={{ padding: "8px 0 4px" }}>
                      <div className="sp-price-track" style={{ margin: "12px 0" }}>
                        <div className="sp-price-fill" style={{ left: `${fillLeft}%`, right: `${100 - fillRight}%` }} />
                        <input type="range" className="sp-range-input"
                          min={0} max={MAX_PRICE} step={5000} value={minPrice}
                          onChange={e => { const v = Number(e.target.value); if (v < maxPrice) setMinPrice(v); }}
                          style={{ zIndex: minPrice > MAX_PRICE - 10000 ? 5 : 3 }}
                        />
                        <input type="range" className="sp-range-input"
                          min={0} max={MAX_PRICE} step={5000} value={maxPrice}
                          onChange={e => { const v = Number(e.target.value); if (v > minPrice) setMaxPrice(v); }}
                          style={{ zIndex: 4 }}
                        />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "0.75rem", fontStyle: "italic", color: "rgba(158,142,122,0.5)" }}>0 DA</span>
                        <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "0.75rem", fontStyle: "italic", color: "rgba(158,142,122,0.5)" }}>{MAX_PRICE.toLocaleString()} DA</span>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* Active filter tags */}
            {hasActiveFilters && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '1.5rem' }}>
                {selCategories.map(cat => (
                  <span key={cat} className="sp-active-tag">{cat}<button onClick={() => toggleCategory(cat)}>×</button></span>
                ))}
                {(minPrice > 0 || maxPrice < MAX_PRICE) && (
                  <span className="sp-active-tag">
                    {minPrice.toLocaleString()} – {maxPrice === MAX_PRICE ? `${MAX_PRICE.toLocaleString()}+` : maxPrice.toLocaleString()} DA
                    <button onClick={() => { setMinPrice(0); setMaxPrice(MAX_PRICE); }}>×</button>
                  </span>
                )}
                {sortBy !== 'default' && (
                  <span className="sp-active-tag">
                    {SORT_OPTIONS.find(o => o.value === sortBy)?.label}
                    <button onClick={() => setSortBy('default')}>×</button>
                  </span>
                )}
              </div>
            )}

            {/* Empty state */}
            {filtered.length === 0 && (
              <div style={{ textAlign: "center", padding: "5rem 2rem", border: "1px solid rgba(200,169,106,0.18)", borderRadius: "4px", background: "#FAF7F2" }}>
                <div style={{ width: "40px", height: "40px", border: "1px solid rgba(200,169,106,0.35)", transform: "rotate(45deg)", margin: "0 auto 2rem" }} />
                <p style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: "0.85rem", color: "#1C1916", marginBottom: "0.75rem" }}>Nothing Found</p>
                <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.1rem", fontStyle: "italic", fontWeight: 300, color: "#6B5F52" }}>
                  {results.length > 0 ? "Try adjusting your filters." : "Try a different keyword — sofa, lamp, walnut…"}
                </p>
                {hasActiveFilters && (
                  <button onClick={resetFilters} style={{ marginTop: "1.25rem", background: "none", border: "1px solid rgba(200,169,106,0.35)", borderRadius: "2rem", padding: "0.5rem 1.5rem", fontFamily: "'Cormorant Garamond', serif", fontSize: "0.9rem", fontStyle: "italic", color: "#9A7D4A", cursor: "pointer" }}>
                    Clear filters
                  </button>
                )}
              </div>
            )}

            {/* Cards */}
            {filtered.length > 0 && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "2rem" }}>
                {filtered.map((product, i) => (
                  <div
                    key={product.id}
                    className="search-card"
                    onClick={() => navigate(`/product/${product.id}`)}
                    style={{ animationDelay: `${i * 0.07}s` }}
                    onMouseEnter={() => setHovered(product.id)}
                    onMouseLeave={() => setHovered(null)}
                  >
                    <div style={{ overflow: "hidden", aspectRatio: "4/3", background: "#EDE7D9" }}>
                      {product.image_url ? (
                        <img className="card-img" src={img(product.image_url)} alt={product.name} />
                      ) : (
                        <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="rgba(200,169,106,0.3)" strokeWidth="1">
                            <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div style={{ padding: "1.5rem 1.75rem", borderTop: "1px solid rgba(200,169,106,0.15)" }}>
                      {product.category && (
                        <p style={{ fontFamily: "sans-serif", fontSize: "0.52rem", letterSpacing: "0.28em", textTransform: "uppercase", color: "#9E8E7A", marginBottom: "0.5rem" }}>
                          {product.category}
                        </p>
                      )}
                      <h3 style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: "0.9rem", fontWeight: 700, letterSpacing: "0.025em", color: hovered === product.id ? "#9E6E20" : "#1C1916", marginBottom: "0.75rem", lineHeight: 1.3, transition: "color 0.2s" }}>
                        {product.name}
                      </h3>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.15rem", fontWeight: 500, color: "#9A7D4A", letterSpacing: "0.02em" }}>
                          {Number(product.price).toLocaleString()} DA
                        </span>
                        <span className="card-arrow">View →</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── INITIAL STATE ── */}
        {!searched && !loading && (
          <div className="sp-tags" style={{ paddingTop: "1rem" }}>
            <p style={{ fontFamily: "sans-serif", fontSize: "0.52rem", letterSpacing: "0.28em", textTransform: "uppercase", color: "#9E8E7A", marginBottom: "1rem" }}>
              Popular searches
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
              {["Sofa", "Table", "Lamp", "Chair", "Shelf", "Bed"].map((term, i) => (
                <button key={term} onClick={() => handleSearch(null, term)}
                  style={{
                    background: "none", border: "1px solid rgba(200,169,106,0.3)", borderRadius: "2rem",
                    padding: "0.5rem 1.25rem",
                    fontFamily: "'Cormorant Garamond', serif", fontSize: "0.95rem", fontStyle: "italic", fontWeight: 300, color: "#6B5F52",
                    cursor: "pointer", transition: "border-color 0.2s, color 0.2s, background 0.2s",
                    animation: `fadeUp 0.4s cubic-bezier(0.16,1,0.3,1) ${0.55 + i * 0.06}s both`,
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "#C8A96A"; e.currentTarget.style.color = "#1C1916"; e.currentTarget.style.background = "rgba(200,169,106,0.06)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(200,169,106,0.3)"; e.currentTarget.style.color = "#6B5F52"; e.currentTarget.style.background = "none"; }}
                >{term}</button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer ornament */}
      <div style={{ padding: "0 1.5rem 5rem", maxWidth: "1100px", margin: "0 auto" }}>
        <GoldRule />
        <div style={{ display: "flex", justifyContent: "center", marginTop: "2.5rem" }}>
          <span style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: "0.575rem", letterSpacing: "0.5em", textTransform: "uppercase", color: "rgba(200,169,106,0.35)" }}>
            enter your sanctuary
          </span>
        </div>
      </div>
    </div>
  );
}

export default SearchPage;