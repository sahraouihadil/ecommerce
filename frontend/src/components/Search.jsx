/**
 * Search.jsx - Product Search Component
 * Redesigned to match ARoom luxury aesthetic
 */

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const BASE = "http://127.0.0.1:8000";
const img = (path) => (path ? `${BASE}/${path}` : null);

export function Search() {
  const [keyword, setKeyword] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [focused, setFocused] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!keyword.trim()) return;
    setLoading(true);
    setSearched(false);
    try {
      const response = await api.get("/search", { params: { keyword } });
      setResults(response.data);
    } catch (error) {
      console.error("Error during search:", error);
      setResults([]);
    } finally {
      setLoading(false);
      setSearched(true);
    }
  };

  // search on Enter
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Enter" && focused) handleSearch();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [keyword, focused]);

  return (
    <div style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", color: "#1C1916" }}>

      {/* ── Google Fonts ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@400;700&family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&display=swap');

        .search-input::placeholder {
          color: rgba(158,142,122,0.45);
          font-style: italic;
        }
        .search-input:focus {
          outline: none;
        }
        .result-card {
          transition: all 0.25s ease;
        }
        .result-card:hover {
          background: #E8E2D6 !important;
          transform: translateY(-2px);
        }
        .result-card:hover .result-arrow {
          transform: translateX(5px);
          opacity: 1;
        }
        .result-arrow {
          transition: all 0.25s ease;
          opacity: 0;
        }
        .search-btn {
          transition: all 0.25s ease;
        }
        .search-btn:hover {
          background: #3D2F1F !important;
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: none; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .fade-up {
          animation: fadeUp 0.4s ease both;
        }
      `}</style>

      {/* ── Search bar ── */}
      <form onSubmit={handleSearch} style={{ marginBottom: "2.5rem" }}>

        <p style={{
          fontFamily: "sans-serif", fontSize: "0.55rem", letterSpacing: "0.38em",
          textTransform: "uppercase", color: "#9E8E7A", marginBottom: "1.25rem",
        }}>
          Find Your Piece
        </p>

        <div style={{
          display: "flex", alignItems: "center",
          borderBottom: `1.5px solid ${focused ? "#C8A96A" : "rgba(200,169,106,0.35)"}`,
          paddingBottom: "0.65rem",
          transition: "border-color 0.25s ease",
          gap: "12px",
        }}>
          {/* Search icon */}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke={focused ? "#C8A96A" : "rgba(200,169,106,0.5)"} strokeWidth="1.5"
            style={{ flexShrink: 0, transition: "stroke 0.25s ease" }}>
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
          </svg>

          <input
            ref={inputRef}
            className="search-input"
            type="text"
            placeholder="Search sofas, tables, lamps…"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            style={{
              flex: 1, background: "transparent", border: "none",
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "1.1rem", fontStyle: "italic", fontWeight: 300,
              color: "#1C1916", caretColor: "#C8A96A",
            }}
          />

          {/* Clear button */}
          {keyword && (
            <button type="button" onClick={() => { setKeyword(""); setResults([]); setSearched(false); inputRef.current?.focus(); }}
              style={{
                background: "none", border: "none", cursor: "pointer", padding: "0 4px",
                color: "rgba(158,142,122,0.5)", fontSize: "1rem", lineHeight: 1
              }}>
              ×
            </button>
          )}

          {/* Submit button */}
          <button
            type="submit"
            className="search-btn"
            style={{
              display: "inline-flex", alignItems: "center", gap: "6px",
              padding: "0 1.5rem", height: "40px",
              background: "#1C1916", border: "1px solid #1C1916", borderRadius: 0,
              fontFamily: "sans-serif", fontSize: "0.55rem", fontWeight: 600,
              letterSpacing: "0.28em", textTransform: "uppercase",
              color: "#F5F0E8", cursor: "pointer", flexShrink: 0,
            }}
          >
            Search
            <span style={{ fontSize: "0.8rem" }}>→</span>
          </button>
        </div>
      </form>

      {/* ── Loading ── */}
      {loading && (
        <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "1.5rem 0" }}>
          <div style={{
            width: "20px", height: "20px", borderRadius: "50%",
            border: "1px solid #C8A96A", borderTopColor: "transparent",
            animation: "spin 0.8s linear infinite",
          }} />
          <span style={{
            fontFamily: "sans-serif", fontSize: "0.52rem", letterSpacing: "0.3em",
            textTransform: "uppercase", color: "#9E8E7A",
          }}>
            Searching collection…
          </span>
        </div>
      )}

      {/* ── Results ── */}
      {!loading && searched && (
        <div className="fade-up">

          {/* Result count */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "1.75rem" }}>
            <div style={{ height: "1px", width: "2rem", background: "rgba(200,169,106,0.4)" }} />
            <span style={{
              fontFamily: "sans-serif", fontSize: "0.52rem", letterSpacing: "0.3em",
              textTransform: "uppercase", color: "#9E8E7A",
            }}>
              {results.length === 0
                ? "No results"
                : `${results.length} ${results.length === 1 ? "piece" : "pieces"} found`}
            </span>
            <div style={{ height: "1px", flex: 1, background: "rgba(200,169,106,0.2)" }} />
          </div>

          {/* No results state */}
          {results.length === 0 && (
            <div style={{
              textAlign: "center", padding: "3rem 2rem",
              background: "#EDE7D9", border: "1px solid rgba(200,169,106,0.2)",
              borderRadius: "16px",
            }}>
              <div style={{ width: "4px", height: "2.5rem", background: "linear-gradient(to bottom, transparent, rgba(200,169,106,0.5))", margin: "0 auto 1.25rem" }} />
              <p style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: "0.8rem", color: "#1C1916", marginBottom: "0.5rem" }}>
                Nothing Found
              </p>
              <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1rem", fontStyle: "italic", fontWeight: 300, color: "#6B5F52" }}>
                Try a different keyword — sofa, lamp, oak…
              </p>
            </div>
          )}

          {/* Results grid */}
          {results.length > 0 && (
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
              gap: "1rem",
            }}>
              {results.map((product, i) => {
                const imageUrl = product.images?.[0] ?? product.image_url ?? null;
                return (
                  <div
                    key={product.id}
                    className="result-card"
                    onClick={() => navigate(`/product/${product.id}`)}
                    style={{
                      background: "#EDE7D9",
                      border: "1px solid rgba(200,169,106,0.22)",
                      borderRadius: "16px",
                      overflow: "hidden",
                      cursor: "pointer",
                      animation: `fadeUp 0.4s ease ${i * 0.06}s both`,
                    }}
                  >
                    {/* Image */}
                    <div style={{ position: "relative", aspectRatio: "4/3", overflow: "hidden" }}>
                      {imageUrl ? (
                        <img
                          src={img(imageUrl)}
                          alt={product.name}
                          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                        />
                      ) : (
                        <div style={{
                          width: "100%", height: "100%", background: "#E0D9CC",
                          display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(200,169,106,0.4)" strokeWidth="1">
                            <rect x="3" y="3" width="18" height="18" rx="2" />
                            <circle cx="8.5" cy="8.5" r="1.5" />
                            <path d="M21 15l-5-5L5 21" />
                          </svg>
                        </div>
                      )}
                      {product.best_seller && (
                        <div style={{
                          position: "absolute", top: "10px", left: "10px",
                          padding: "0.25rem 0.75rem", background: "rgba(245,240,232,0.92)",
                          borderRadius: "2rem", border: "1px solid rgba(200,169,106,0.35)",
                          fontFamily: "sans-serif", fontSize: "0.48rem", letterSpacing: "0.22em",
                          textTransform: "uppercase", color: "#9A7D4A",
                        }}>
                          Best Seller
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div style={{ padding: "1.25rem 1.5rem" }}>
                      <p style={{
                        fontFamily: "sans-serif", fontSize: "0.5rem", letterSpacing: "0.28em",
                        textTransform: "uppercase", color: "#9E8E7A", marginBottom: "0.4rem",
                      }}>
                        {product.category || "Furniture"}
                      </p>

                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                        <div>
                          <h3 style={{
                            fontFamily: "'Cinzel Decorative', serif", fontSize: "0.8rem",
                            fontWeight: 700, color: "#1C1916", marginBottom: "0.5rem", lineHeight: 1.3,
                          }}>
                            {product.name}
                          </h3>
                          <span style={{
                            fontFamily: "'Cinzel Decorative', serif", fontSize: "0.85rem",
                            fontWeight: 700, color: "#9A7D4A",
                          }}>
                            {Number(product.price).toLocaleString()} DA
                          </span>
                        </div>
                        <span className="result-arrow" style={{ color: "#C8A96A", fontSize: "1.1rem" }}>→</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}