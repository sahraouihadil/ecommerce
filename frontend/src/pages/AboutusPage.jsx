/**
 * AboutusPage.jsx - About Us Page
 */

// Inline SVG replacements for Material Icons
const IconAutoAwesome = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="56" height="56">
    <path d="M12 2l1.5 4.5L18 8l-4.5 1.5L12 14l-1.5-4.5L6 8l4.5-1.5L12 2zm6 12l.75 2.25L21 17l-2.25.75L18 20l-.75-2.25L15 17l2.25-.75L18 14zM5 17l.5 1.5L7 19l-1.5.5L5 21l-.5-1.5L3 19l1.5-.5L5 17z" />
  </svg>
);

const IconMood = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="48" height="48">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />
  </svg>
);

export function AboutusPage() {
  return (
    <div style={{ overflowX: "hidden", paddingBottom: "8rem" }}>

      {/* ── Hero Section ── */}
      <section style={{ padding: "4rem 1.5rem 3rem", maxWidth: "1280px", margin: "0 auto" }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "3rem",
          alignItems: "center",
        }}>

          {/* Left copy */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <span style={{
              display: "inline-block",
              padding: "0.25rem 1rem",
              borderRadius: "9999px",
              backgroundColor: "#fed01b",
              color: "#433500",
              fontSize: "11px",
              fontWeight: "700",
              letterSpacing: "0.2em",
              alignSelf: "flex-start",
            }}>
              OUR ORIGIN STORY
            </span>

            <h1 style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: "800",
              fontSize: "clamp(2.5rem, 6vw, 4.5rem)",
              lineHeight: "1.1",
              letterSpacing: "-0.03em",
              color: "#6448b2",
              margin: 0,
            }}>
              Designing for the{" "}
              <span style={{ color: "#6f5900", fontStyle: "italic" }}>Weirdly</span>{" "}
              Wonderful.
            </h1>

            <p style={{
              fontSize: "clamp(1rem, 2vw, 1.25rem)",
              color: "#5b5b5d",
              lineHeight: "1.7",
              maxWidth: "560px",
              margin: 0,
            }}>
              We started ARoomX because we were tired of "standard." We believe
              your home should be a curated playground, not a showroom catalog.
            </p>
          </div>

          {/* Right image card */}
          <div style={{ position: "relative" }}>
            <div style={{
              position: "absolute",
              inset: "-1rem",
              zIndex: 0,
              borderRadius: "40% 60% 70% 30% / 40% 50% 60% 50%",
              backgroundColor: "rgba(171,143,254,0.15)",
            }} />
            <div style={{
              position: "relative",
              zIndex: 1,
              backgroundColor: "#ffffff",
              borderRadius: "1rem",
              overflow: "hidden",
              boxShadow: "0 25px 50px rgba(0,0,0,0.15)",
              transform: "rotate(2deg)",
              padding: "0.75rem",
            }}>
              <img
                alt="Quirky furniture design"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuA2gyqcgzSNriw4OUPA4wGTTJu_8N6WAaOhqQ30c68zvKqKwzFWxQehIKWkPvPYmsvXi4Z8zCR4i_Asxe1G7tHcQ94uWB601zCHR2dwxnS5zNAxIjMtmla5Fl4SIh23MdRfBfQNoL06d7u7JTefmYMYp3EXTVum0IpsGDXrPS4ysP7vcRrY2OwhThlHWecLYVVHM1kjYi8V9aSZ8xU3My4ogsXdGiuXM011cgIVL-TtPWsFe_yIPiEQAFWS6jaePaTGWVSil9QaXNA"
                style={{ width: "100%", height: "380px", objectFit: "cover", borderRadius: "0.75rem", display: "block" }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Philosophy Bento Grid ── */}
      <section style={{
        padding: "4rem 1.5rem",
        margin: "0 1rem",
        backgroundColor: "#f1f0f3",
        borderRadius: "3rem",
      }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "1.25rem",
          }}>

            {/* Card 1 – wide (spans 2 cols) */}
            <div style={{
              gridColumn: "span 2",
              backgroundColor: "#ffffff",
              borderRadius: "1rem",
              padding: "2.5rem",
              boxShadow: "0 20px 40px rgba(45,47,48,0.06)",
              position: "relative",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              minHeight: "260px",
            }}>
              <div style={{ maxWidth: "420px", position: "relative", zIndex: 1 }}>
                <h3 style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontSize: "1.75rem",
                  fontWeight: "700",
                  color: "#6448b2",
                  marginBottom: "1rem",
                }}>
                  The Curated Playground
                </h3>
                <p style={{ fontSize: "1.05rem", color: "#5b5b5d", lineHeight: "1.7" }}>
                  Our design DNA rejects clinical structures. We embrace intentional
                  whitespace, tactile "bouncy" shapes, and furniture that asks to be
                  touched.
                </p>
              </div>
              {/* Glow blob */}
              <div style={{
                position: "absolute",
                right: "-5rem",
                bottom: "-5rem",
                width: "16rem",
                height: "16rem",
                borderRadius: "9999px",
                backgroundColor: "rgba(254,208,27,0.25)",
                filter: "blur(48px)",
              }} />
              <img
                alt="Sculptural chair"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCEX93E1eqVYtQQdJ-NeJnE2isev8AfULxo9L2wOCPcHx_7J947s562679jM3SaXtNlvKlGt0b6AYnNoR7IkqEFta2XfHeK5UwfBFkpy09OfOuDI-UTHnBIviRR3yij6r49a8j11Kfb1l1VeBnPlL3ernOxrw8oIAt_b6hxHn31VwVAV_2Eswo-kwSvVF3FL0uFC3HJOlwwJOcg1-jeKBuPEnG1-g0tHGik5CzQDLSPzGltz5OY9ByX-Op_lPAXiePelzz5Q1hCPDI"
                style={{
                  width: "160px",
                  height: "160px",
                  objectFit: "contain",
                  position: "absolute",
                  bottom: "1rem",
                  right: "1rem",
                  transform: "rotate(12deg)",
                  filter: "drop-shadow(0 20px 20px rgba(0,0,0,0.15))",
                }}
              />
            </div>

            {/* Card 2 – primary accent */}
            <div style={{
              backgroundColor: "#6448b2",
              borderRadius: "1rem",
              padding: "2.5rem",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              textAlign: "center",
              boxShadow: "0 10px 30px rgba(100,72,178,0.3)",
            }}>
              <div style={{ color: "#f7f0ff", marginBottom: "1.25rem" }}>
                <IconAutoAwesome />
              </div>
              <h3 style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: "1.25rem",
                fontWeight: "700",
                color: "#f7f0ff",
                marginBottom: "0.75rem",
              }}>
                Joyful Asymmetry
              </h3>
              <p style={{ color: "rgba(247,240,255,0.8)", lineHeight: "1.6", fontSize: "0.95rem" }}>
                Perfect balance is boring. We find beauty in the off-kilter and
                the unexpected.
              </p>
            </div>

            {/* Card 3 – secondary yellow */}
            <div style={{
              backgroundColor: "#fed01b",
              borderRadius: "1rem",
              padding: "2.5rem",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}>
              <p style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: "2.5rem",
                fontWeight: "900",
                color: "#433500",
                lineHeight: 1,
                margin: 0,
              }}>
                01.
              </p>
              <div>
                <h4 style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontSize: "1.1rem",
                  fontWeight: "700",
                  color: "#433500",
                  marginBottom: "0.4rem",
                }}>
                  Touchably Soft
                </h4>
                <p style={{ color: "rgba(67,53,0,0.7)", fontSize: "0.95rem", lineHeight: "1.6" }}>
                  Every edge is rounded, every fabric is chosen for a tactile
                  high-five.
                </p>
              </div>
            </div>

            {/* Card 4 – wide gray */}
            <div style={{
              gridColumn: "span 2",
              backgroundColor: "#e2e2e5",
              borderRadius: "1rem",
              padding: "2rem",
              display: "flex",
              alignItems: "center",
              gap: "2rem",
            }}>
              <div style={{
                flexShrink: 0,
                width: "80px",
                height: "80px",
                borderRadius: "9999px",
                backgroundColor: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                color: "#6448b2",
              }}>
                <IconMood />
              </div>
              <div>
                <h3 style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontSize: "1.25rem",
                  fontWeight: "700",
                  color: "#6448b2",
                  marginBottom: "0.4rem",
                }}>
                  Unconventional Roots
                </h3>
                <p style={{ color: "#5b5b5d", lineHeight: "1.6", fontSize: "0.95rem" }}>
                  Founded in a small garage in 2022, ARoomX was born from a collection
                  of three wobbly chairs and a dream of better living.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── Editorial Section ── */}
      <section style={{ padding: "5rem 1.5rem", maxWidth: "900px", margin: "0 auto" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "3.5rem" }}>

          {/* DNA label + copy */}
          <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
            <div style={{ display: "flex", gap: "0 2rem", flexWrap: "wrap" }}>
              <div style={{ minWidth: "180px" }}>
                <h2 style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontSize: "0.85rem",
                  fontWeight: "700",
                  color: "#6f5900",
                  textTransform: "uppercase",
                  letterSpacing: "0.2em",
                  borderLeft: "4px solid #6f5900",
                  paddingLeft: "1rem",
                  margin: 0,
                }}>
                  Our DNA
                </h2>
              </div>
              <div style={{ flex: 1, minWidth: "260px" }}>
                <p style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontSize: "clamp(1.5rem, 3vw, 2.25rem)",
                  fontWeight: "700",
                  lineHeight: "1.3",
                  marginBottom: "1.5rem",
                  color: "#2d2f30",
                }}>
                  We don't sell furniture. We sell{" "}
                  <span style={{
                    color: "#6448b2",
                    fontStyle: "italic",
                    textDecoration: "underline",
                    textDecorationColor: "#ab8ffe",
                    textDecorationThickness: "6px",
                    textUnderlineOffset: "4px",
                  }}>
                    conversations
                  </span>
                  .
                </p>
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                  gap: "1.5rem",
                  color: "#5b5b5d",
                  lineHeight: "1.7",
                }}>
                  <p style={{ margin: 0 }}>
                    Traditional e-commerce is built on efficiency and sameness.
                    It's clinical. It's safe. It's… fine. But who wants "fine" when
                    you can have "weirdly wonderful"?
                  </p>
                  <p style={{ margin: 0 }}>
                    We handpick every piece in our collection not for its utility,
                    but for its personality. A lamp that looks like a cloud. A rug
                    that feels like moss. A table that refuses to be rectangular.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Hero image + quote */}
          <div style={{ position: "relative", borderRadius: "1rem", overflow: "hidden", height: "460px" }}>
            <img
              alt="Playful living room"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuA96Fspj7Sz5WJYXCEKfAIHEybnswa_FKHOA8XBOTsg8KfpU2b_9ilsQCRwAs_nPqabZZhKrpXHZQcLY7uD3EfnWx01Z9rL0R35eos1OvWodPRRjAGvqS1blccLZrMyDOXVOf4a1MYwIdFbO_DJ6UoFIR4c5fmzJmgioFyYWQxNmycEzilINyDGq-T3r8CkBaP6pfxckZEkNaTNLi-yio7GlBJDkFPUVVpeTb8NF-WFu9wdqBBnn7xnoC1NkRu0Mx4LJV5c7auJ3m8"
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            />
            {/* gradient overlay */}
            <div style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(to top, rgba(100,72,178,0.65) 0%, transparent 55%)",
            }} />
            {/* glass quote */}
            <div style={{
              position: "absolute",
              bottom: "2rem",
              left: "2rem",
              right: "2rem",
              maxWidth: "600px",
            }}>
              <div style={{
                background: "rgba(255,255,255,0.35)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                borderRadius: "1rem",
                padding: "1.75rem 2rem",
              }}>
                <p style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontSize: "1.2rem",
                  fontWeight: "700",
                  color: "#ffffff",
                  margin: "0 0 0.5rem",
                  lineHeight: "1.5",
                }}>
                  "If your home doesn't make you smile when you walk in, you're
                  doing it wrong."
                </p>
                <p style={{ color: "rgba(255,255,255,0.8)", margin: 0, fontSize: "0.9rem" }}>
                  — The ARoomX Founders
                </p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ── CTA Section ── */}
      <section style={{ padding: "3rem 1.5rem", textAlign: "center" }}>
        <div style={{
          maxWidth: "680px",
          margin: "0 auto",
          padding: "4rem 2.5rem",
          backgroundColor: "rgba(171,143,254,0.15)",
          borderRadius: "3rem",
          border: "2px solid rgba(100,72,178,0.1)",
        }}>
          <h2 style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
            fontWeight: "800",
            color: "#6448b2",
            marginBottom: "1rem",
          }}>
            Ready to get weird?
          </h2>
          <p style={{ color: "#5b5b5d", fontSize: "1.1rem", marginBottom: "2.5rem" }}>
            Explore our latest collection of wonderfully unconventional pieces.
          </p>
          <button style={{
            backgroundColor: "#6448b2",
            color: "#f7f0ff",
            padding: "1rem 2.5rem",
            borderRadius: "9999px",
            fontWeight: "700",
            fontSize: "1rem",
            border: "none",
            cursor: "pointer",
            boxShadow: "0 8px 24px rgba(100,72,178,0.35)",
            transition: "transform 0.2s",
          }}
            onMouseEnter={e => e.currentTarget.style.transform = "scale(1.05)"}
            onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
          >
            Browse the Collection
          </button>
        </div>
      </section>

    </div>
  );
}