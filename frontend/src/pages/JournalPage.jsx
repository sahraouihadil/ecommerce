import { useState, useEffect } from "react";
import api from "../services/api";

// ── Tag colour map ────────────────────────────────────────────────
const TAG_STYLES = {
  Technology: { bg: "rgba(59,130,246,0.1)", color: "#2563eb" },
  Insight: { bg: "rgba(16,185,129,0.1)", color: "#059669" },
  Design: { bg: "rgba(245,158,11,0.1)", color: "#d97706" },
};

// ── Animated entry wrapper ────────────────────────────────────────
function FadeUp({ children, delay = 0 }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);
  return (
    <div style={{
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(24px)",
      transition: `opacity 0.7s cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 0.7s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
    }}>
      {children}
    </div>
  );
}

// ── Main Journal listing ──────────────────────────────────────────
export function JournalPage() {
  const [activeBlog, setActiveBlog] = useState(null);
  const [hoveredId, setHoveredId] = useState(null);
  const [listVisible, setListVisible] = useState(false);
  const [blogs, setBlogs] = useState([]);

  useEffect(() => {
    setTimeout(() => setListVisible(true), 40);
  }, []);

  useEffect(() => {
    api.get("/api/blogs")
      .then((res) => {
        setBlogs(res.data);
      })
      .catch((err) => {
        console.error("FAILED:", err);
      });
  }, []);

  // ── Article view ─────────────────────────────────────────────────
  if (activeBlog) {
    return <ArticleView blog={activeBlog} onBack={() => setActiveBlog(null)} />;
  }

  const featured = blogs[0];
  const rest = blogs.slice(1);

  return (
    <div style={{
      opacity: listVisible ? 1 : 0,
      transform: listVisible ? "translateY(0)" : "translateY(20px)",
      transition: "all 0.6s ease"
    }}>
      <div style={{
        fontFamily: "Georgia, 'Times New Roman', serif",
        minHeight: "100vh",
        background: "#FAF8F4",
        color: "#1a1a1a",
      }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "96px 28px 96px" }}>

          {/* ── HEADER ── */}
          <FadeUp delay={0}>
            <p style={{
              fontSize: "0.72rem", letterSpacing: "0.22em", textTransform: "uppercase",
              fontWeight: "700", color: "#8b6f5e", marginBottom: "14px",
            }}>
              Stories
            </p>
          </FadeUp>

          <FadeUp delay={80}>
            <h1 style={{
              fontSize: "clamp(3rem, 9vw, 6rem)",
              fontWeight: "800", letterSpacing: "-0.035em", lineHeight: 0.95,
              marginBottom: "20px", color: "#1a1a1a",
            }}>
              Journal
            </h1>
          </FadeUp>

          <FadeUp delay={160}>
            <p style={{
              color: "#7a6b5d", fontSize: "1.05rem", lineHeight: 1.7,
              maxWidth: "480px", marginBottom: "96px",
            }}>
              Reflections on design, craftsmanship, and the art of creating spaces that tell your story.
            </p>
          </FadeUp>

          {/* ── FEATURED POST ── */}
          {featured && (
            <FadeUp delay={240}>
              <article
                onClick={() => setActiveBlog(featured)}
                onMouseEnter={() => setHoveredId(featured.id)}
                onMouseLeave={() => setHoveredId(null)}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "0",
                  borderRadius: "24px",
                  overflow: "hidden",
                  cursor: "pointer",
                  marginBottom: "48px",
                  boxShadow: hoveredId === featured.id
                    ? "0 24px 64px rgba(92,74,58,0.18)"
                    : "0 8px 32px rgba(92,74,58,0.10)",
                  transition: "box-shadow 0.4s ease, transform 0.4s cubic-bezier(0.16,1,0.3,1)",
                  transform: hoveredId === featured.id ? "translateY(-4px)" : "none",
                }}
              >
                {/* Image side */}
                <div style={{ overflow: "hidden", aspectRatio: "4/3" }}>
                  <img
                    src={featured.image}
                    alt={featured.title}
                    style={{
                      width: "100%", height: "100%", objectFit: "cover",
                      transform: hoveredId === featured.id ? "scale(1.05)" : "scale(1)",
                      transition: "transform 0.7s cubic-bezier(0.16,1,0.3,1)",
                    }}
                  />
                </div>

                {/* Text side */}
                <div style={{
                  background: "#ffffff",
                  padding: "48px 44px",
                  display: "flex", flexDirection: "column", justifyContent: "center",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px", flexWrap: "wrap" }}>
                    <span style={{
                      ...TAG_STYLES[featured.tag],
                      fontSize: "0.65rem", fontWeight: "700", letterSpacing: "0.12em",
                      textTransform: "uppercase", padding: "4px 12px", borderRadius: "999px",
                    }}>
                      {featured.tag}
                    </span>
                    <span style={{ fontSize: "0.72rem", color: "#b5a898" }}>{featured.readTime}</span>
                  </div>

                  <h2 style={{
                    fontSize: "clamp(1.3rem, 2.5vw, 1.9rem)",
                    fontWeight: "800", lineHeight: 1.15, letterSpacing: "-0.015em",
                    marginBottom: "16px",
                    color: hoveredId === featured.id ? "#8b6f5e" : "#1a1a1a",
                    transition: "color 0.2s",
                  }}>
                    {featured.title}
                  </h2>

                  <p style={{
                    fontSize: "0.92rem", lineHeight: 1.75, color: "#7a6b5d",
                    marginBottom: "28px", fontWeight: "300",
                  }}>
                    {featured.excerpt}
                  </p>

                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontSize: "0.72rem", color: "#b5a898" }}>
                      {new Date(featured.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                    </span>
                    <span style={{
                      fontSize: "0.78rem", fontWeight: "700", color: "#8b6f5e",
                      letterSpacing: "0.04em",
                      transform: hoveredId === featured.id ? "translateX(4px)" : "none",
                      transition: "transform 0.3s",
                      display: "inline-block",
                    }}>
                      Read →
                    </span>
                  </div>
                </div>
              </article>
            </FadeUp>
          )}

          {/* ── REST OF blogs ── */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "24px",
          }}>
            {rest.map((post, i) => (
              <FadeUp key={post.id} delay={320 + i * 100}>
                <article
                  onClick={() => setActiveBlog(post)}
                  onMouseEnter={() => setHoveredId(post.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  style={{
                    borderRadius: "20px",
                    overflow: "hidden",
                    background: "#ffffff",
                    cursor: "pointer",
                    boxShadow: hoveredId === post.id
                      ? "0 20px 48px rgba(92,74,58,0.16)"
                      : "0 4px 20px rgba(92,74,58,0.08)",
                    transform: hoveredId === post.id ? "translateY(-5px)" : "none",
                    transition: "box-shadow 0.35s ease, transform 0.35s cubic-bezier(0.16,1,0.3,1)",
                  }}
                >
                  {/* Card image */}
                  <div style={{ overflow: "hidden", aspectRatio: "16/9" }}>
                    <img
                      src={post.image}
                      alt={post.title}
                      style={{
                        width: "100%", height: "100%", objectFit: "cover",
                        transform: hoveredId === post.id ? "scale(1.06)" : "scale(1)",
                        transition: "transform 0.6s cubic-bezier(0.16,1,0.3,1)",
                      }}
                    />
                  </div>

                  {/* Card body */}
                  <div style={{ padding: "28px 28px 32px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
                      <span style={{
                        ...TAG_STYLES[post.tag],
                        fontSize: "0.62rem", fontWeight: "700", letterSpacing: "0.1em",
                        textTransform: "uppercase", padding: "3px 10px", borderRadius: "999px",
                      }}>
                        {post.tag}
                      </span>
                      <span style={{ fontSize: "0.7rem", color: "#c4b5a8" }}>{post.readTime}</span>
                    </div>

                    <h2 style={{
                      fontSize: "1.15rem", fontWeight: "800", lineHeight: 1.25,
                      letterSpacing: "-0.01em", marginBottom: "10px",
                      color: hoveredId === post.id ? "#8b6f5e" : "#1a1a1a",
                      transition: "color 0.2s",
                    }}>
                      {post.title}
                    </h2>

                    <p style={{
                      fontSize: "0.875rem", lineHeight: 1.7, color: "#7a6b5d",
                      marginBottom: "20px", fontWeight: "300",
                      display: "-webkit-box", WebkitLineClamp: 3,
                      WebkitBoxOrient: "vertical", overflow: "hidden",
                    }}>
                      {post.excerpt}
                    </p>

                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span style={{ fontSize: "0.7rem", color: "#c4b5a8" }}>
                        {new Date(post.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </span>
                      <span style={{
                        fontSize: "0.75rem", fontWeight: "700", color: "#8b6f5e",
                        display: "inline-block",
                        transform: hoveredId === post.id ? "translateX(4px)" : "none",
                        transition: "transform 0.3s",
                      }}>
                        Read →
                      </span>
                    </div>
                  </div>
                </article>
              </FadeUp>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}

// ── Separate Article view component ──────────────────────────────
function ArticleView({ blog, onBack }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 40);
    return () => clearTimeout(t);
  }, []);

  return (
    <div style={{
      fontFamily: "Georgia, 'Times New Roman', serif",
      minHeight: "100vh",
      background: "#FAF8F4",
      color: "#1a1a1a",
    }}>
      {/* Hero image */}
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
            filter: "brightness(0.82)",
          }}
        />
        {/* Gradient overlay */}
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to bottom, transparent 40%, rgba(250,248,244,0.95) 100%)",
        }} />
      </div>

      {/* Article content */}
      <div style={{ maxWidth: "680px", margin: "0 auto", padding: "0 28px 96px" }}>
        <div style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(20px)",
          transition: "opacity 0.6s ease 0.2s, transform 0.6s ease 0.2s",
        }}>
          {/* Meta row */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px", marginTop: "32px", flexWrap: "wrap" }}>
            <span style={{
              ...TAG_STYLES[blog.tag],
              fontSize: "0.68rem", fontWeight: "700", letterSpacing: "0.1em",
              textTransform: "uppercase", padding: "4px 12px", borderRadius: "999px",
            }}>
              {blog.tag}
            </span>
            <span style={{ fontSize: "0.78rem", color: "#a89585" }}>
              {new Date(blog.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
            </span>
            <span style={{ fontSize: "0.78rem", color: "#c4b5a8" }}>·</span>
            <span style={{ fontSize: "0.78rem", color: "#a89585" }}>{blog.readTime}</span>
          </div>

          {/* Title */}
          <h1 style={{
            fontSize: "clamp(1.8rem, 5vw, 2.8rem)",
            fontWeight: "800", lineHeight: 1.1, letterSpacing: "-0.02em",
            marginBottom: "32px", color: "#1a1a1a",
          }}>
            {blog.title}
          </h1>

          {/* Excerpt / lead */}
          <p style={{
            fontSize: "1.15rem", lineHeight: 1.7, color: "#6b5d53",
            fontStyle: "italic", marginBottom: "40px",
            paddingBottom: "32px",
            borderBottom: "1px solid rgba(210,196,182,0.4)",
          }}>
            {blog.excerpt}
          </p>

          {/* Body */}
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {(blog.body || "No content available.").split("\n\n").filter(Boolean).map((para, i) => (
              <p key={i} style={{
                fontSize: "1.05rem", lineHeight: 1.85, color: "#3d2f22",
                fontWeight: i === 0 ? "500" : "300",
              }}>
                {para}
              </p>
            ))}
          </div>

          {/* Divider + back */}
          <div style={{ marginTop: "64px", paddingTop: "32px", borderTop: "1px solid rgba(210,196,182,0.4)" }}>
            <button
              onClick={onBack}
              style={{
                background: "none", border: "none", cursor: "pointer",
                fontSize: "0.82rem", fontWeight: "700", color: "#8b6f5e",
                letterSpacing: "0.06em", fontFamily: "Georgia, serif",
                transition: "color 0.2s", padding: 0,
              }}
              onMouseEnter={e => e.currentTarget.style.color = "#5c4a3a"}
              onMouseLeave={e => e.currentTarget.style.color = "#8b6f5e"}
            >
              ← Back to Journal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default JournalPage;