import { useState, useEffect } from "react";
import api from "../services/api";

// ── Google Fonts loader ───────────────────────────────────────────
function useLuxuryFonts() {
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@400;700;900&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&display=swap";
    document.head.appendChild(link);
    return () => document.head.removeChild(link);
  }, []);
}

// ── Ornamental dividers ───────────────────────────────────────────
const GoldRule = () => (
  <div style={{ display: "flex", alignItems: "center", gap: "8px", margin: "0" }}>
    <div style={{ height: "1px", flex: 1, background: "linear-gradient(to right, transparent, rgba(200,169,106,0.5))" }} />
    <div style={{ width: "5px", height: "5px", background: "#C8A96A", transform: "rotate(45deg)", flexShrink: 0 }} />
    <div style={{ height: "1px", flex: 1, background: "linear-gradient(to left, transparent, rgba(200,169,106,0.5))" }} />
  </div>
);

const GoldRuleShort = ({ maxWidth = "14rem" }) => (
  <div style={{ display: "flex", alignItems: "center", gap: "6px", maxWidth }}>
    <div style={{ height: "1px", flex: 1, background: "#C8A96A", opacity: 0.55 }} />
    <div style={{ width: "4px", height: "4px", background: "#C8A96A", transform: "rotate(45deg)", opacity: 0.7, flexShrink: 0 }} />
    <div style={{ height: "1px", flex: 1, background: "#C8A96A", opacity: 0.55 }} />
  </div>
);

// ── Tag colour map ────────────────────────────────────────────────
const TAG_STYLES = {
  Technology: { bg: "rgba(59,130,246,0.08)",   color: "#2563eb", border: "rgba(59,130,246,0.2)" },
  Insight:    { bg: "rgba(200,169,106,0.12)",  color: "#9E6E20", border: "rgba(200,169,106,0.35)" },
  Design:     { bg: "rgba(92,74,58,0.08)",     color: "#5c4a3a", border: "rgba(92,74,58,0.2)" },
};

function TagPill({ tag, small }) {
  const s = TAG_STYLES[tag] || TAG_STYLES.Insight;
  return (
    <span style={{
      background: s.bg,
      color: s.color,
      border: `1px solid ${s.border}`,
      fontSize: small ? "0.55rem" : "0.575rem",
      fontFamily: "sans-serif",
      fontWeight: "700",
      letterSpacing: "0.3em",
      textTransform: "uppercase",
      padding: small ? "3px 10px" : "4px 13px",
      borderRadius: "999px",
    }}>
      {tag}
    </span>
  );
}

// ── Fade-up entry ────────────────────────────────────────────────
function FadeUp({ children, delay = 0 }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);
  return (
    <div style={{
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(20px)",
      transition: `opacity 0.7s cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 0.7s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
    }}>
      {children}
    </div>
  );
}

// ── Empty state ──────────────────────────────────────────────────
function EmptyJournal() {
  return (
    <div style={{
      maxWidth: "1200px", margin: "0 auto",
      padding: "4rem 1.5rem 8rem",
      display: "flex", flexDirection: "column", alignItems: "center", gap: "1.5rem",
    }}>
      <GoldRuleShort maxWidth="10rem" />
      <p style={{
        fontFamily: "'Cormorant Garamond', serif",
        fontSize: "1.2rem",
        fontStyle: "italic",
        fontWeight: 300,
        color: "#9E8E7A",
        textAlign: "center",
        lineHeight: 1.9,
      }}>
        No stories have been published yet.<br />
        Check back soon for our first reflections.
      </p>
      <GoldRuleShort maxWidth="10rem" />
    </div>
  );
}

// ── Main Journal listing ──────────────────────────────────────────
export function JournalPage() {
  useLuxuryFonts();

  const [activeBlog, setActiveBlog] = useState(null);
  const [hoveredId,  setHoveredId]  = useState(null);
  const [blogs,      setBlogs]      = useState([]);
  const [loading,    setLoading]    = useState(true);

  useEffect(() => {
    // ← Only fetch published posts; drafts / pending are hidden from visitors
    api.get("/api/blogs/published")
      .then(res => setBlogs(res.data))
      .catch(err => console.error("Failed to load journal:", err))
      .finally(() => setLoading(false));
  }, []);

  if (activeBlog) {
    return <ArticleView blog={activeBlog} onBack={() => setActiveBlog(null)} />;
  }

  const featured = blogs[0];
  const rest     = blogs.slice(1);

  return (
    <div style={{
      background: "#F5F0E8",
      color: "#1C1916",
      fontFamily: "'Cormorant Garamond', Georgia, serif",
      overflowX: "hidden",
    }}>

      {/* ── HERO HEADER ── */}
      <section style={{ maxWidth: "1200px", margin: "0 auto", padding: "clamp(7rem, 14vw, 10rem) 1.5rem 5rem" }}>
        <FadeUp delay={0}>
          <p style={{
            fontFamily: "sans-serif", fontSize: "0.575rem",
            letterSpacing: "0.38em", textTransform: "uppercase",
            color: "#9E8E7A", marginBottom: "1.25rem",
          }}>
            Stories &amp; Perspectives
          </p>
        </FadeUp>

        <FadeUp delay={80}>
          <h1 style={{
            fontFamily: "'Cinzel Decorative', serif",
            fontSize: "clamp(2rem, 7vw, 5rem)",
            fontWeight: 700,
            letterSpacing: "0.035em",
            lineHeight: 1.05,
            color: "#1C1916",
            marginBottom: "1.5rem",
          }}>
            The Journal
          </h1>
        </FadeUp>

        <FadeUp delay={140}>
          <GoldRuleShort maxWidth="16rem" />
        </FadeUp>

        <FadeUp delay={200}>
          <p style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "1.2rem",
            fontStyle: "italic",
            fontWeight: 300,
            color: "#6B5F52",
            maxWidth: "34rem",
            lineHeight: 1.9,
            marginTop: "1.5rem",
          }}>
            Reflections on design, craftsmanship, and the art of creating spaces that tell your story.
          </p>
        </FadeUp>
      </section>

      {/* ── DIVIDER ── */}
      <div style={{ padding: "0 1.5rem" }}>
        <GoldRule />
      </div>

      {/* Loading spinner */}
      {loading && (
        <div style={{ display: "flex", justifyContent: "center", padding: "6rem 0" }}>
          <div style={{
            width: 36, height: 36,
            border: "2px solid rgba(200,169,106,0.3)",
            borderTopColor: "#C8A96A",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
          }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {/* No published posts yet */}
      {!loading && blogs.length === 0 && <EmptyJournal />}

      {/* ── FEATURED POST ── */}
      {!loading && featured && (
        <section style={{ maxWidth: "1200px", margin: "0 auto", padding: "5rem 1.5rem" }}>
          <FadeUp delay={0}>
            <p style={{
              fontFamily: "sans-serif", fontSize: "0.575rem",
              letterSpacing: "0.38em", textTransform: "uppercase",
              color: "#9E8E7A", marginBottom: "2rem",
            }}>
              Featured
            </p>
          </FadeUp>

          <FadeUp delay={80}>
            <article
              onClick={() => setActiveBlog(featured)}
              onMouseEnter={() => setHoveredId(featured.id)}
              onMouseLeave={() => setHoveredId(null)}
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                borderRadius: "4px",
                overflow: "hidden",
                cursor: "pointer",
                border: "1px solid rgba(200,169,106,0.2)",
                boxShadow: hoveredId === featured.id
                  ? "0 24px 64px rgba(28,25,22,0.12)"
                  : "0 4px 24px rgba(28,25,22,0.06)",
                transition: "box-shadow 0.4s ease, transform 0.4s cubic-bezier(0.16,1,0.3,1)",
                transform: hoveredId === featured.id ? "translateY(-4px)" : "none",
              }}
            >
              {/* Image */}
              <div style={{ overflow: "hidden", minHeight: "340px" }}>
                <img
                  src={featured.image}
                  alt={featured.title}
                  style={{
                    width: "100%", height: "100%", objectFit: "cover",
                    transform: hoveredId === featured.id ? "scale(1.04)" : "scale(1)",
                    transition: "transform 0.8s cubic-bezier(0.16,1,0.3,1)",
                    filter: "brightness(0.92)",
                  }}
                />
              </div>

              {/* Text */}
              <div style={{
                background: "#FAF7F2",
                padding: "clamp(2rem, 5vw, 3.5rem)",
                display: "flex", flexDirection: "column", justifyContent: "center",
                gap: "1.25rem",
              }}>
                <div style={{ width: "2rem", height: "1px", background: "#C8A96A", opacity: 0.7 }} />

                <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                  <TagPill tag={featured.tag} />
                  <span style={{
                    fontFamily: "sans-serif", fontSize: "0.55rem",
                    letterSpacing: "0.2em", textTransform: "uppercase", color: "#9E8E7A",
                  }}>
                    {featured.readTime}
                  </span>
                </div>

                <h2 style={{
                  fontFamily: "'Cinzel Decorative', serif",
                  fontSize: "clamp(1.2rem, 2.8vw, 1.85rem)",
                  fontWeight: 700,
                  letterSpacing: "0.025em",
                  lineHeight: 1.15,
                  color: hoveredId === featured.id ? "#9E6E20" : "#1C1916",
                  transition: "color 0.25s",
                }}>
                  {featured.title}
                </h2>

                <GoldRuleShort maxWidth="8rem" />

                <p style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: "1.1rem",
                  fontStyle: "italic",
                  fontWeight: 300,
                  color: "#6B5F52",
                  lineHeight: 1.9,
                }}>
                  {featured.excerpt}
                </p>

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "0.5rem" }}>
                  <span style={{
                    fontFamily: "sans-serif", fontSize: "0.55rem",
                    letterSpacing: "0.2em", textTransform: "uppercase", color: "#9E8E7A",
                  }}>
                    {new Date(featured.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                  </span>
                  <span style={{
                    fontFamily: "sans-serif", fontSize: "0.55rem",
                    letterSpacing: "0.28em", textTransform: "uppercase",
                    color: "#C8A96A", fontWeight: "700",
                    transform: hoveredId === featured.id ? "translateX(5px)" : "none",
                    transition: "transform 0.3s",
                    display: "inline-block",
                  }}>
                    Read →
                  </span>
                </div>
              </div>
            </article>
          </FadeUp>
        </section>
      )}

      {/* ── DIVIDER ── */}
      {!loading && featured && (
        <div style={{ padding: "0 1.5rem" }}>
          <GoldRule />
        </div>
      )}

      {/* ── REST OF POSTS ── */}
      {!loading && rest.length > 0 && (
        <section style={{ maxWidth: "1200px", margin: "0 auto", padding: "5rem 1.5rem 6rem" }}>
          <FadeUp delay={0}>
            <p style={{
              fontFamily: "sans-serif", fontSize: "0.575rem",
              letterSpacing: "0.38em", textTransform: "uppercase",
              color: "#9E8E7A", marginBottom: "2.5rem",
            }}>
              More Stories
            </p>
          </FadeUp>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "2rem",
          }}>
            {rest.map((post, i) => (
              <FadeUp key={post.id} delay={100 + i * 80}>
                <article
                  onClick={() => setActiveBlog(post)}
                  onMouseEnter={() => setHoveredId(post.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  style={{
                    background: "#FAF7F2",
                    border: "1px solid rgba(200,169,106,0.18)",
                    borderRadius: "4px",
                    overflow: "hidden",
                    cursor: "pointer",
                    boxShadow: hoveredId === post.id
                      ? "0 20px 48px rgba(28,25,22,0.1)"
                      : "0 2px 16px rgba(28,25,22,0.05)",
                    transform: hoveredId === post.id ? "translateY(-5px)" : "none",
                    transition: "box-shadow 0.35s ease, transform 0.35s cubic-bezier(0.16,1,0.3,1)",
                    display: "flex", flexDirection: "column",
                  }}
                >
                  {/* Card image */}
                  <div style={{ overflow: "hidden", aspectRatio: "16/9" }}>
                    <img
                      src={post.image}
                      alt={post.title}
                      style={{
                        width: "100%", height: "100%", objectFit: "cover",
                        transform: hoveredId === post.id ? "scale(1.05)" : "scale(1)",
                        transition: "transform 0.7s cubic-bezier(0.16,1,0.3,1)",
                        filter: "brightness(0.9)",
                      }}
                    />
                  </div>

                  {/* Card body */}
                  <div style={{
                    padding: "1.75rem",
                    display: "flex", flexDirection: "column", gap: "0.85rem", flex: 1,
                    borderTop: "1px solid rgba(200,169,106,0.2)",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                      <TagPill tag={post.tag} small />
                      <span style={{
                        fontFamily: "sans-serif", fontSize: "0.52rem",
                        letterSpacing: "0.18em", textTransform: "uppercase", color: "#9E8E7A",
                      }}>
                        {post.readTime}
                      </span>
                    </div>

                    <h2 style={{
                      fontFamily: "'Cinzel Decorative', serif",
                      fontSize: "1rem",
                      fontWeight: 700,
                      letterSpacing: "0.025em",
                      lineHeight: 1.25,
                      color: hoveredId === post.id ? "#9E6E20" : "#1C1916",
                      transition: "color 0.2s",
                    }}>
                      {post.title}
                    </h2>

                    <p style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontSize: "1.05rem",
                      fontStyle: "italic",
                      fontWeight: 300,
                      color: "#6B5F52",
                      lineHeight: 1.85,
                      display: "-webkit-box",
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                      flex: 1,
                    }}>
                      {post.excerpt}
                    </p>

                    <div style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      paddingTop: "0.75rem",
                      borderTop: "1px solid rgba(200,169,106,0.15)",
                      marginTop: "auto",
                    }}>
                      <span style={{
                        fontFamily: "sans-serif", fontSize: "0.52rem",
                        letterSpacing: "0.18em", textTransform: "uppercase", color: "#9E8E7A",
                      }}>
                        {new Date(post.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </span>
                      <span style={{
                        fontFamily: "sans-serif", fontSize: "0.52rem",
                        letterSpacing: "0.22em", textTransform: "uppercase",
                        color: "#C8A96A", fontWeight: "700",
                        transform: hoveredId === post.id ? "translateX(4px)" : "none",
                        transition: "transform 0.3s",
                        display: "inline-block",
                      }}>
                        Read →
                      </span>
                    </div>
                  </div>
                </article>
              </FadeUp>
            ))}
          </div>
        </section>
      )}

      {/* ── FOOTER ORNAMENT ── */}
      {!loading && (
        <div style={{ padding: "0 1.5rem 5rem" }}>
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
      )}
    </div>
  );
}

// ── Article view ──────────────────────────────────────────────────
function ArticleView({ blog, onBack }) {
  useLuxuryFonts();
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 40);
    return () => clearTimeout(t);
  }, []);

  return (
    <div style={{
      background: "#F5F0E8",
      color: "#1C1916",
      fontFamily: "'Cormorant Garamond', Georgia, serif",
      minHeight: "100vh",
    }}>

      {/* Hero */}
      <div style={{
        width: "100%",
        height: "clamp(260px, 45vw, 520px)",
        overflow: "hidden",
        position: "relative",
      }}>
        <img
          src={blog.image}
          alt={blog.title}
          style={{
            width: "100%", height: "100%", objectFit: "cover",
            transform: visible ? "scale(1)" : "scale(1.04)",
            transition: "transform 1.2s cubic-bezier(0.16,1,0.3,1)",
            filter: "brightness(0.78)",
          }}
        />
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to bottom, transparent 40%, rgba(245,240,232,0.97) 100%)",
        }} />
      </div>

      {/* Content */}
      <div style={{ maxWidth: "680px", margin: "0 auto", padding: "0 1.5rem 7rem" }}>
        <div style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(20px)",
          transition: "opacity 0.6s ease 0.2s, transform 0.6s ease 0.2s",
        }}>

          {/* Meta */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "1.5rem", marginTop: "2.5rem", flexWrap: "wrap" }}>
            <TagPill tag={blog.tag} />
            <span style={{
              fontFamily: "sans-serif", fontSize: "0.55rem",
              letterSpacing: "0.2em", textTransform: "uppercase", color: "#9E8E7A",
            }}>
              {blog.date
                ? new Date(blog.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
                : "—"}
            </span>
            <span style={{ color: "#C8A96A", opacity: 0.6 }}>·</span>
            <span style={{
              fontFamily: "sans-serif", fontSize: "0.55rem",
              letterSpacing: "0.2em", textTransform: "uppercase", color: "#9E8E7A",
            }}>
              {blog.readTime}
            </span>
          </div>

          {/* Title */}
          <h1 style={{
            fontFamily: "'Cinzel Decorative', serif",
            fontSize: "clamp(1.6rem, 5vw, 2.8rem)",
            fontWeight: 700,
            letterSpacing: "0.03em",
            lineHeight: 1.1,
            color: "#1C1916",
            marginBottom: "1.5rem",
          }}>
            {blog.title}
          </h1>

          <GoldRuleShort maxWidth="12rem" />

          {/* Excerpt */}
          <p style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "1.2rem",
            fontStyle: "italic",
            fontWeight: 300,
            color: "#6B5F52",
            lineHeight: 1.85,
            margin: "1.75rem 0 2.5rem",
          }}>
            {blog.excerpt}
          </p>

          <GoldRule />

          {/* Body */}
          <div style={{ marginTop: "2.5rem", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {(blog.body || "No content available.").split("\n\n").filter(Boolean).map((para, i) => (
              <p key={i} style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "1.1rem",
                fontWeight: i === 0 ? 400 : 300,
                color: "#3D2F1F",
                lineHeight: 1.95,
              }}>
                {para}
              </p>
            ))}
          </div>

          {/* Back */}
          <div style={{ marginTop: "4rem", paddingTop: "2rem" }}>
            <GoldRule />
            <div style={{ marginTop: "2rem" }}>
              <button
                onClick={onBack}
                style={{
                  background: "none", border: "none", cursor: "pointer", padding: 0,
                  fontFamily: "sans-serif",
                  fontSize: "0.575rem",
                  letterSpacing: "0.28em",
                  textTransform: "uppercase",
                  color: "#9E8E7A",
                  fontWeight: "700",
                  transition: "color 0.2s",
                }}
                onMouseEnter={e => e.currentTarget.style.color = "#C8A96A"}
                onMouseLeave={e => e.currentTarget.style.color = "#9E8E7A"}
              >
                ← Back to Journal
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Footer ornament */}
      <div style={{ padding: "0 1.5rem 5rem" }}>
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

export default JournalPage;