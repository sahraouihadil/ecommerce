import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const BASE = "http://127.0.0.1:8000";
const img = (path) => {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${BASE}/${path}`;
};

const FONTS = `
  @import url('https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@400;700&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,500&display=swap');
`;

const GoldRule = () => (
  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
    <div style={{ height: "1px", flex: 1, background: "linear-gradient(to right, transparent, rgba(200,169,106,0.5))" }} />
    <div style={{ width: "5px", height: "5px", background: "#C8A96A", transform: "rotate(45deg)", flexShrink: 0 }} />
    <div style={{ height: "1px", flex: 1, background: "linear-gradient(to left, transparent, rgba(200,169,106,0.5))" }} />
  </div>
);

export function SearchPage() {
  const [keyword, setKeyword]   = useState("");
  const [results, setResults]   = useState([]);
  const [loading, setLoading]   = useState(false);
  const [searched, setSearched] = useState(false);
  const [focused, setFocused]   = useState(false);
  const [hovered, setHovered]   = useState(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  // auto-focus on mount
  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 300);
  }, []);

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!keyword.trim()) return;
    setLoading(true);
    setSearched(false);
    try {
      const res = await api.get("/search", { params: { keyword } });
      setResults(res.data);
    } catch (err) {
      console.error("Search error:", err);
      setResults([]);
    } finally {
      setLoading(false);
      setSearched(true);
    }
  };

  const handleClear = () => {
    setKeyword("");
    setResults([]);
    setSearched(false);
    inputRef.current?.focus();
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#F5F0E8",
      color: "#1C1916",
      fontFamily: "'Cormorant Garamond', Georgia, serif",
    }}>
      <style>{FONTS}</style>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .search-card {
          background: #FAF7F2;
          border: 1px solid rgba(200,169,106,0.18);
          border-radius: 4px;
          overflow: hidden;
          cursor: pointer;
          transition: box-shadow 0.35s ease, transform 0.35s cubic-bezier(0.16,1,0.3,1);
        }
        .search-card:hover {
          box-shadow: 0 20px 48px rgba(28,25,22,0.1);
          transform: translateY(-5px);
        }
        .search-card:hover .card-img {
          transform: scale(1.05);
        }
        .card-img {
          width: 100%; height: 100%; object-fit: cover;
          transition: transform 0.7s cubic-bezier(0.16,1,0.3,1);
        }
        .search-card:hover .card-arrow {
          transform: translateX(5px);
          color: #C8A96A;
        }
        .card-arrow {
          font-family: sans-serif;
          font-size: 0.55rem;
          letter-spacing: 0.28em;
          text-transform: uppercase;
          color: #9E8E7A;
          transition: transform 0.3s, color 0.3s;
          display: inline-block;
        }
        .search-input-field {
          flex: 1;
          background: transparent;
          border: none;
          outline: none;
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-size: clamp(1.1rem, 3vw, 1.6rem);
          font-style: italic;
          font-weight: 300;
          color: #1C1916;
          caret-color: #C8A96A;
          padding: 0;
        }
        .search-input-field::placeholder {
          color: rgba(158,142,122,0.35);
        }
        .spinner {
          width: 20px; height: 20px;
          border-radius: 50%;
          border: 1.5px solid rgba(200,169,106,0.3);
          border-top-color: #C8A96A;
          animation: spin 0.8s linear infinite;
        }
        .result-fade {
          animation: fadeUp 0.5s ease both;
        }
      `}</style>

      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "clamp(6rem, 12vw, 9rem) 1.5rem 6rem" }}>

        {/* ── HEADER ── */}
        <div style={{ marginBottom: "4rem" }}>
          <p style={{
            fontFamily: "sans-serif",
            fontSize: "0.575rem",
            letterSpacing: "0.38em",
            textTransform: "uppercase",
            color: "#9E8E7A",
            marginBottom: "1.25rem",
          }}>
            Discover
          </p>

          <h1 style={{
            fontFamily: "'Cinzel Decorative', serif",
            fontSize: "clamp(2rem, 6vw, 4.5rem)",
            fontWeight: 700,
            letterSpacing: "0.03em",
            lineHeight: 1.05,
            color: "#1C1916",
            marginBottom: "1.5rem",
          }}>
            Find Your Piece
          </h1>

          <div style={{ maxWidth: "14rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <div style={{ height: "1px", flex: 1, background: "#C8A96A", opacity: 0.55 }} />
              <div style={{ width: "4px", height: "4px", background: "#C8A96A", transform: "rotate(45deg)", opacity: 0.7, flexShrink: 0 }} />
              <div style={{ height: "1px", flex: 1, background: "#C8A96A", opacity: 0.55 }} />
            </div>
          </div>

          <p style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "1.15rem",
            fontStyle: "italic",
            fontWeight: 300,
            color: "#6B5F52",
            marginTop: "1.25rem",
            maxWidth: "32rem",
            lineHeight: 1.85,
          }}>
            Search our full collection by name, style, or category.
          </p>
        </div>

        {/* ── DIVIDER ── */}
        <GoldRule />

        {/* ── SEARCH BAR ── */}
        <div style={{ padding: "3rem 0 2rem" }}>
          <form onSubmit={handleSearch}>
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "1rem",
              borderBottom: `2px solid ${focused ? "#C8A96A" : "rgba(200,169,106,0.3)"}`,
              paddingBottom: "1rem",
              transition: "border-color 0.3s ease",
            }}>
              {/* Search icon */}
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                stroke={focused ? "#C8A96A" : "rgba(200,169,106,0.5)"}
                strokeWidth="1.5"
                style={{ flexShrink: 0, transition: "stroke 0.3s" }}
              >
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
              </svg>

              <input
                ref={inputRef}
                className="search-input-field"
                type="text"
                placeholder="sofas, oak tables, floor lamps…"
                value={keyword}
                onChange={e => setKeyword(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
              />

              {keyword && (
                <button
                  type="button"
                  onClick={handleClear}
                  style={{
                    background: "none", border: "none", cursor: "pointer",
                    color: "rgba(158,142,122,0.5)", fontSize: "1.3rem",
                    lineHeight: 1, padding: "0 4px", transition: "color 0.2s",
                    flexShrink: 0,
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = "#9E8E7A"}
                  onMouseLeave={e => e.currentTarget.style.color = "rgba(158,142,122,0.5)"}
                >
                  ×
                </button>
              )}

              <button
                type="submit"
                style={{
                  flexShrink: 0,
                  background: "#1C1916",
                  border: "1px solid #1C1916",
                  borderRadius: "2rem",
                  padding: "0.75rem 2rem",
                  fontFamily: "sans-serif",
                  fontSize: "0.575rem",
                  letterSpacing: "0.28em",
                  textTransform: "uppercase",
                  color: "#F5F0E8",
                  cursor: "pointer",
                  transition: "background 0.2s",
                }}
                onMouseEnter={e => e.currentTarget.style.background = "#3D2F1F"}
                onMouseLeave={e => e.currentTarget.style.background = "#1C1916"}
              >
                Search
              </button>
            </div>
          </form>
        </div>

        {/* ── LOADING ── */}
        {loading && (
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "2rem 0" }}>
            <div className="spinner" />
            <span style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "1rem",
              fontStyle: "italic",
              fontWeight: 300,
              color: "#9E8E7A",
            }}>
              Searching the collection…
            </span>
          </div>
        )}

        {/* ── RESULTS ── */}
        {!loading && searched && (
          <div className="result-fade">

            <GoldRule />

            {/* Count */}
            <div style={{ padding: "1.75rem 0 2.5rem", display: "flex", alignItems: "center", gap: "1rem" }}>
              <p style={{
                fontFamily: "sans-serif",
                fontSize: "0.575rem",
                letterSpacing: "0.32em",
                textTransform: "uppercase",
                color: "#9E8E7A",
              }}>
                {results.length === 0
                  ? "No results found"
                  : `${results.length} ${results.length === 1 ? "piece" : "pieces"} found`}
              </p>
              {results.length > 0 && (
                <div style={{ height: "1px", flex: 1, background: "linear-gradient(to right, rgba(200,169,106,0.25), transparent)" }} />
              )}
            </div>

            {/* Empty state */}
            {results.length === 0 && (
              <div style={{
                textAlign: "center",
                padding: "5rem 2rem",
                border: "1px solid rgba(200,169,106,0.18)",
                borderRadius: "4px",
                background: "#FAF7F2",
              }}>
                <div style={{
                  width: "40px", height: "40px",
                  border: "1px solid rgba(200,169,106,0.35)",
                  transform: "rotate(45deg)",
                  margin: "0 auto 2rem",
                }} />
                <p style={{
                  fontFamily: "'Cinzel Decorative', serif",
                  fontSize: "0.85rem",
                  color: "#1C1916",
                  marginBottom: "0.75rem",
                }}>
                  Nothing Found
                </p>
                <p style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: "1.1rem",
                  fontStyle: "italic",
                  fontWeight: 300,
                  color: "#6B5F52",
                }}>
                  Try a different keyword — sofa, lamp, walnut…
                </p>
              </div>
            )}

            {/* Results grid */}
            {results.length > 0 && (
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                gap: "2rem",
              }}>
                {results.map((product, i) => (
                  <div
                    key={product.id}
                    className="search-card"
                    onClick={() => navigate(`/product/${product.id}`)}
                    style={{ animationDelay: `${i * 0.07}s` }}
                    onMouseEnter={() => setHovered(product.id)}
                    onMouseLeave={() => setHovered(null)}
                  >
                    {/* Image */}
                    <div style={{ overflow: "hidden", aspectRatio: "4/3", background: "#EDE7D9" }}>
                      {product.image_url ? (
                        <img className="card-img" src={img(product.image_url)} alt={product.name} />
                      ) : (
                        <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="rgba(200,169,106,0.3)" strokeWidth="1">
                            <rect x="3" y="3" width="18" height="18" rx="2" />
                            <circle cx="8.5" cy="8.5" r="1.5" />
                            <path d="M21 15l-5-5L5 21" />
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div style={{
                      padding: "1.5rem 1.75rem",
                      borderTop: "1px solid rgba(200,169,106,0.15)",
                    }}>
                      {product.category && (
                        <p style={{
                          fontFamily: "sans-serif",
                          fontSize: "0.52rem",
                          letterSpacing: "0.28em",
                          textTransform: "uppercase",
                          color: "#9E8E7A",
                          marginBottom: "0.5rem",
                        }}>
                          {product.category}
                        </p>
                      )}

                      <h3 style={{
                        fontFamily: "'Cinzel Decorative', serif",
                        fontSize: "0.9rem",
                        fontWeight: 700,
                        letterSpacing: "0.025em",
                        color: hovered === product.id ? "#9E6E20" : "#1C1916",
                        marginBottom: "0.75rem",
                        lineHeight: 1.3,
                        transition: "color 0.2s",
                      }}>
                        {product.name}
                      </h3>

                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <span style={{
                          fontFamily: "'Cormorant Garamond', serif",
                          fontSize: "1.15rem",
                          fontWeight: 500,
                          color: "#9A7D4A",
                          letterSpacing: "0.02em",
                        }}>
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

        {/* ── INITIAL STATE — suggestions ── */}
        {!searched && !loading && (
          <div style={{ paddingTop: "1rem" }}>
            <p style={{
              fontFamily: "sans-serif",
              fontSize: "0.52rem",
              letterSpacing: "0.28em",
              textTransform: "uppercase",
              color: "#9E8E7A",
              marginBottom: "1rem",
            }}>
              Popular searches
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
              {["Sofa", "Table", "Lamp", "Chair", "Shelf", "Bed"].map(term => (
                <button
                  key={term}
                  onClick={() => { setKeyword(term); setTimeout(() => handleSearch(), 50); }}
                  style={{
                    background: "none",
                    border: "1px solid rgba(200,169,106,0.3)",
                    borderRadius: "2rem",
                    padding: "0.5rem 1.25rem",
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: "0.95rem",
                    fontStyle: "italic",
                    fontWeight: 300,
                    color: "#6B5F52",
                    cursor: "pointer",
                    transition: "border-color 0.2s, color 0.2s, background 0.2s",
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = "#C8A96A";
                    e.currentTarget.style.color = "#1C1916";
                    e.currentTarget.style.background = "rgba(200,169,106,0.06)";
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = "rgba(200,169,106,0.3)";
                    e.currentTarget.style.color = "#6B5F52";
                    e.currentTarget.style.background = "none";
                  }}
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Footer ornament */}
      <div style={{ padding: "0 1.5rem 5rem", maxWidth: "1100px", margin: "0 auto" }}>
        <GoldRule />
        <div style={{ display: "flex", justifyContent: "center", marginTop: "2.5rem" }}>
          <span style={{
            fontFamily: "'Cinzel Decorative', serif",
            fontSize: "0.575rem",
            letterSpacing: "0.5em",
            textTransform: "uppercase",
            color: "rgba(200,169,106,0.35)",
          }}>
            enter your sanctuary
          </span>
        </div>
      </div>

    </div>
  );
}

export default SearchPage;