/**
 * Search.jsx - Product Search Component
 * Redesigned to match ARoom warm luxury aesthetic
 */

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const BASE = "http://127.0.0.1:8000";
const img = (path) => (path ? `${BASE}/${path}` : null);

const SEARCH_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@400;700&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,500&display=swap');

  .aroom-search-wrap * { box-sizing: border-box; }

  /* Input */
  .aroom-search-input {
    flex: 1;
    background: transparent;
    border: none;
    font-family: 'Cormorant Garamond', Georgia, serif;
    font-size: 1.15rem;
    font-style: italic;
    font-weight: 300;
    color: #1C1916;
    caret-color: #C8A96A;
    padding: 0;
  }
  .aroom-search-input::placeholder {
    color: rgba(158,142,122,0.4);
    font-style: italic;
  }
  .aroom-search-input:focus { outline: none; }

  /* Submit button */
  .aroom-search-btn {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    padding: 0 1.4rem;
    height: 42px;
    background: #1C1916;
    border: 1px solid #1C1916;
    border-radius: 100px;
    font-family: 'Cormorant Garamond', serif;
    font-size: 0.75rem;
    font-weight: 600;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: #F5F0E8;
    cursor: pointer;
    flex-shrink: 0;
    transition: background 0.22s ease, color 0.22s ease;
  }
  .aroom-search-btn:hover {
    background: #3D2F1F;
  }

  /* Clear button */
  .aroom-clear-btn {
    background: none;
    border: none;
    cursor: pointer;
    color: rgba(158,142,122,0.5);
    font-size: 1.1rem;
    line-height: 1;
    padding: 0 4px;
    transition: color 0.2s;
  }
  .aroom-clear-btn:hover { color: #9E8E7A; }

  /* Result card */
  .aroom-result-card {
    background: rgba(255,253,248,0.7);
    border: 1px solid rgba(200,169,106,0.18);
    border-radius: 20px;
    overflow: hidden;
    cursor: pointer;
    transition: background 0.25s ease, transform 0.25s ease, box-shadow 0.25s ease;
  }
  .aroom-result-card:hover {
    background: #FFF9F0;
    transform: translateY(-3px);
    box-shadow: 0 12px 36px rgba(26,25,22,0.08);
  }
  .aroom-result-card:hover .aroom-card-arrow {
    opacity: 1;
    transform: translateX(4px);
  }
  .aroom-card-arrow {
    opacity: 0;
    transition: opacity 0.25s ease, transform 0.25s ease;
    color: #C8A96A;
    font-size: 1rem;
  }

  /* Image zoom on hover */
  .aroom-result-card:hover .aroom-card-img {
    transform: scale(1.04);
  }
  .aroom-card-img {
    transition: transform 0.55s cubic-bezier(0.25,0.46,0.45,0.94);
    width: 100%; height: 100%; object-fit: cover; display: block;
  }

  /* Badge */
  .aroom-bestseller-badge {
    position: absolute;
    top: 10px; left: 10px;
    padding: 0.25rem 0.8rem;
    background: rgba(245,240,232,0.92);
    border-radius: 100px;
    border: 1px solid rgba(200,169,106,0.35);
    font-family: 'Cormorant Garamond', serif;
    font-size: 0.62rem;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: #9A7D4A;
    font-weight: 600;
  }

  /* Spinner */
  @keyframes aroom-spin {
    to { transform: rotate(360deg); }
  }
  .aroom-spinner {
    width: 18px; height: 18px; border-radius: 50%;
    border: 1.5px solid #C8A96A;
    border-top-color: transparent;
    animation: aroom-spin 0.75s linear infinite;
  }

  /* Fade-up animation */
  @keyframes aroom-fadeUp {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: none; }
  }
  .aroom-fade-up { animation: aroom-fadeUp 0.38s ease both; }
  .aroom-card-stagger { animation: aroom-fadeUp 0.4s ease both; }

  /* Divider line */
  .aroom-divider {
    height: 1px;
    background: linear-gradient(to right, transparent, rgba(200,169,106,0.35), transparent);
    margin: 2rem 0;
  }
`;

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

  const handleClear = () => {
    setKeyword("");
    setResults([]);
    setSearched(false);
    inputRef.current?.focus();
  };

  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Enter" && focused) handleSearch();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [keyword, focused]);

  return (
    <div
      className="aroom-search-wrap"
      style={{
        fontFamily: "'Cormorant Garamond', Georgia, serif",
        color: "#1C1916",
      }}
    >
      <style>{SEARCH_STYLES}</style>

      {/* ── Label ── */}
      <p style={{
        fontFamily: "'Cormorant Garamond', serif",
        fontSize: "0.65rem",
        fontWeight: 600,
        letterSpacing: "0.32em",
        textTransform: "uppercase",
        color: "#9E8E7A",
        marginBottom: "1rem",
      }}>
        Find Your Piece
      </p>

      {/* ── Search bar ── */}
      <form onSubmit={handleSearch}>
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          background: "rgba(255,253,248,0.65)",
          border: `1.5px solid ${focused ? "#C8A96A" : "rgba(200,169,106,0.28)"}`,
          borderRadius: "100px",
          padding: "6px 6px 6px 20px",
          transition: "border-color 0.25s ease, box-shadow 0.25s ease",
          boxShadow: focused
            ? "0 0 0 3px rgba(200,169,106,0.1), 0 4px 20px rgba(26,25,22,0.05)"
            : "0 2px 12px rgba(26,25,22,0.04)",
        }}>
          {/* Search icon */}
          <svg
            width="15" height="15" viewBox="0 0 24 24" fill="none"
            stroke={focused ? "#C8A96A" : "rgba(200,169,106,0.55)"}
            strokeWidth="1.8"
            style={{ flexShrink: 0, transition: "stroke 0.25s ease" }}
          >
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
          </svg>

          <input
            ref={inputRef}
            className="aroom-search-input"
            type="text"
            placeholder="Search sofas, tables, lamps…"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
          />

          {keyword && (
            <button
              type="button"
              className="aroom-clear-btn"
              onClick={handleClear}
              aria-label="Clear search"
            >
              ×
            </button>
          )}

          <button type="submit" className="aroom-search-btn">
            Search
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </form>

      {/* ── Loading ── */}
      {loading && (
        <div style={{
          display: "flex", alignItems: "center", gap: "14px",
          padding: "2rem 0",
        }}>
          <div className="aroom-spinner" />
          <span style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "0.88rem",
            fontStyle: "italic",
            fontWeight: 300,
            letterSpacing: "0.06em",
            color: "#9E8E7A",
          }}>
            Searching the collection…
          </span>
        </div>
      )}

      {/* ── Results ── */}
      {!loading && searched && (
        <div className="aroom-fade-up">
          <div className="aroom-divider" />

          {/* Result count */}
          <div style={{
            display: "flex", alignItems: "center", gap: "12px",
            marginBottom: "1.75rem",
          }}>
            <span style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "0.65rem",
              fontWeight: 600,
              letterSpacing: "0.28em",
              textTransform: "uppercase",
              color: "#9E8E7A",
            }}>
              {results.length === 0
                ? "No results found"
                : `${results.length} ${results.length === 1 ? "piece" : "pieces"} found`}
            </span>
            <div style={{
              height: "1px", flex: 1,
              background: "linear-gradient(to right, rgba(200,169,106,0.25), transparent)",
            }} />
          </div>

          {/* ── Empty state ── */}
          {results.length === 0 && (
            <div style={{
              textAlign: "center",
              padding: "3.5rem 2rem",
              background: "rgba(255,253,248,0.5)",
              border: "1px solid rgba(200,169,106,0.2)",
              borderRadius: "24px",
            }}>
              {/* Decorative diamond */}
              <div style={{
                width: "32px", height: "32px",
                border: "1px solid rgba(200,169,106,0.35)",
                transform: "rotate(45deg)",
                margin: "0 auto 1.5rem",
              }} />
              <p style={{
                fontFamily: "'Cinzel Decorative', serif",
                fontSize: "0.78rem",
                color: "#1C1916",
                marginBottom: "0.6rem",
              }}>
                Nothing Found
              </p>
              <p style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "1.05rem",
                fontStyle: "italic",
                fontWeight: 300,
                color: "#6B5F52",
              }}>
                Try a different keyword — sofa, lamp, oak…
              </p>
            </div>
          )}

          {/* ── Results grid ── */}
          {results.length > 0 && (
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
              gap: "1.25rem",
            }}>
              {results.map((product, i) => {
                const imageUrl = product.images?.[0] ?? product.image_url ?? null;
                return (
                  <div
                    key={product.id}
                    className="aroom-result-card aroom-card-stagger"
                    onClick={() => navigate(`/product/${product.id}`)}
                    style={{ animationDelay: `${i * 0.06}s` }}
                  >
                    {/* Image container */}
                    <div style={{
                      position: "relative",
                      aspectRatio: "4/3",
                      overflow: "hidden",
                      background: "#EDE7D9",
                    }}>
                      {imageUrl ? (
                        <img
                          className="aroom-card-img"
                          src={img(imageUrl)}
                          alt={product.name}
                        />
                      ) : (
                        <div style={{
                          width: "100%", height: "100%",
                          display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                          <svg width="30" height="30" viewBox="0 0 24 24" fill="none"
                            stroke="rgba(200,169,106,0.35)" strokeWidth="1">
                            <rect x="3" y="3" width="18" height="18" rx="2"/>
                            <circle cx="8.5" cy="8.5" r="1.5"/>
                            <path d="M21 15l-5-5L5 21"/>
                          </svg>
                        </div>
                      )}

                      {product.best_seller && (
                        <span className="aroom-bestseller-badge">Best Seller</span>
                      )}
                    </div>

                    {/* Info */}
                    <div style={{ padding: "1.1rem 1.4rem 1.25rem" }}>
                      {/* Category */}
                      <p style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        fontSize: "0.62rem",
                        fontWeight: 600,
                        letterSpacing: "0.22em",
                        textTransform: "uppercase",
                        color: "#9E8E7A",
                        marginBottom: "0.35rem",
                      }}>
                        {product.category || "Furniture"}
                      </p>

                      <div style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-end",
                        gap: "8px",
                      }}>
                        <div>
                          <h3 style={{
                            fontFamily: "'Cormorant Garamond', serif",
                            fontSize: "1.1rem",
                            fontWeight: 600,
                            color: "#1C1916",
                            marginBottom: "0.3rem",
                            lineHeight: 1.3,
                          }}>
                            {product.name}
                          </h3>
                          <span style={{
                            fontFamily: "'Cinzel Decorative', serif",
                            fontSize: "0.8rem",
                            fontWeight: 700,
                            color: "#9A7D4A",
                            letterSpacing: "0.04em",
                          }}>
                            {Number(product.price).toLocaleString()} DA
                          </span>
                        </div>
                        <span className="aroom-card-arrow">→</span>
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

export default Search;