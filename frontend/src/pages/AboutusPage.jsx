import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

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

export function AboutusPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@400;700;900&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&display=swap";
    document.head.appendChild(link);
    return () => document.head.removeChild(link);
  }, []);

  return (
    <div
      style={{
        background: "#F5F0E8",
        color: "#1C1916",
        fontFamily: "'Cormorant Garamond', Georgia, serif",
        overflowX: "hidden",
      }}
    >

      {/* ── HERO ── */}
      <section style={{ maxWidth: "1200px", margin: "0 auto", padding: "clamp(7rem, 14vw, 10rem) 1.5rem 5rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "4rem", alignItems: "center" }}>

          <div>
            <p style={{ fontFamily: "sans-serif", fontSize: "0.575rem", letterSpacing: "0.38em", textTransform: "uppercase", color: "#9E8E7A", marginBottom: "1.25rem" }}>
              How It Works
            </p>
            <h1
              style={{
                fontFamily: "'Cinzel Decorative', serif",
                fontSize: "clamp(2rem, 5.5vw, 4rem)",
                fontWeight: 700,
                letterSpacing: "0.035em",
                lineHeight: 1.08,
                color: "#1C1916",
                marginBottom: "1.75rem",
              }}
            >
              Furniture Shopping,<br />Reimagined with AR
            </h1>

            <GoldRuleShort />

            <p
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "1.2rem",
                fontStyle: "italic",
                fontWeight: 300,
                color: "#6B5F52",
                maxWidth: "32rem",
                lineHeight: 1.9,
                marginTop: "1.5rem",
              }}
            >
              ARoom lets you see exactly how furniture looks in your real room before
              you buy it. Point your phone, place any piece, and know it's right.
              No guesswork, no returns.
            </p>
          </div>

          <div style={{ position: "relative" }}>
            {/* Gold frame accent */}
            <div style={{
              position: "absolute",
              top: "-12px",
              right: "-12px",
              bottom: "12px",
              left: "12px",
              border: "1px solid rgba(200,169,106,0.25)",
              borderRadius: "24px",
              pointerEvents: "none",
              zIndex: 0,
            }} />
            <img
              alt="ARoom AR furniture preview"
              src="https://i.pinimg.com/736x/46/ec/75/46ec759294134b6542a4a2ac3a92172c.jpg"
              style={{
                width: "100%",
                height: "420px",
                objectFit: "cover",
                borderRadius: "20px",
                position: "relative",
                zIndex: 1,
                display: "block",
              }}
            />
          </div>
        </div>
      </section>

      {/* ── FULL-WIDTH DIVIDER ── */}
      <div style={{ padding: "0 1.5rem" }}>
        <GoldRule />
      </div>

      {/* ── HOW IT WORKS ── */}
      <section style={{ maxWidth: "720px", margin: "0 auto", padding: "5rem 1.5rem" }}>

        <p style={{ fontFamily: "sans-serif", fontSize: "0.575rem", letterSpacing: "0.38em", textTransform: "uppercase", color: "#9E8E7A", marginBottom: "1.25rem" }}>
          The Experience
        </p>
        <h2
          style={{
            fontFamily: "'Cinzel Decorative', serif",
            fontSize: "clamp(1.6rem, 4vw, 2.75rem)",
            fontWeight: 700,
            letterSpacing: "0.035em",
            lineHeight: 1.1,
            color: "#1C1916",
            marginBottom: "1.5rem",
          }}
        >
          Try Before You Buy
        </h2>

        <GoldRuleShort />

        <div style={{ marginTop: "2.25rem", display: "flex", flexDirection: "column", gap: "1.6rem" }}>
          {[
            "Traditional furniture shopping is broken. You see a photo online, guess the dimensions, hope the color works with your walls, and cross your fingers when it arrives. ARoom fixes that.",
            "With our AR preview, you place any piece of furniture directly into your room using your phone's camera. See how that sofa fits next to your bookshelf. Check if the lamp height works with your ceiling. Know before you buy.",
            "Need help deciding? Roomie, our AI styling assistant, can suggest pieces that match your existing decor, recommend color combinations, and help you build a room layout that works.",
          ].map((text, i) => (
            <p
              key={i}
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "1.15rem",
                fontWeight: 300,
                color: "#6B5F52",
                lineHeight: 1.95,
              }}
            >
              {text}
            </p>
          ))}
        </div>
      </section>

      {/* ── FULL-WIDTH DIVIDER ── */}
      <div style={{ padding: "0 1.5rem" }}>
        <GoldRule />
      </div>

      {/* ── THREE PILLARS ── */}
      <section style={{ maxWidth: "1100px", margin: "0 auto", padding: "5rem 1.5rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "2.5rem" }}>
          {[
            { num: "01", title: "Place It", body: "Use your phone camera to place any piece of furniture directly in your room at true scale." },
            { num: "02", title: "Style It", body: "Roomie, our AI assistant, suggests pieces that harmonise with your space and existing decor." },
            { num: "03", title: "Own It", body: "Buy with full confidence. Every piece ships with a guarantee it will look exactly as you previewed." },
          ].map(({ num, title, body }) => (
            <div key={num} style={{ borderTop: "1px solid rgba(200,169,106,0.3)", paddingTop: "1.75rem" }}>
              <p style={{ fontFamily: "sans-serif", fontSize: "0.575rem", letterSpacing: "0.38em", textTransform: "uppercase", color: "#C8A96A", marginBottom: "1rem" }}>
                {num}
              </p>
              <h3
                style={{
                  fontFamily: "'Cinzel Decorative', serif",
                  fontSize: "1.05rem",
                  fontWeight: 700,
                  letterSpacing: "0.04em",
                  color: "#1C1916",
                  marginBottom: "0.85rem",
                }}
              >
                {title}
              </h3>
              <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.05rem", fontWeight: 300, fontStyle: "italic", color: "#6B5F52", lineHeight: 1.85 }}>
                {body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FULL-WIDTH DIVIDER ── */}
      <div style={{ padding: "0 1.5rem" }}>
        <GoldRule />
      </div>

      {/* ── QUOTE ── */}
      <section style={{ maxWidth: "680px", margin: "0 auto", padding: "5.5rem 1.5rem" }}>
        <div style={{ textAlign: "center" }}>
          {/* Top ornament */}
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "2rem" }}>
            <div style={{ width: "1px", height: "3rem", background: "linear-gradient(to bottom, transparent, #C8A96A)" }} />
          </div>

          <blockquote
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "clamp(1.4rem, 3.5vw, 2rem)",
              fontStyle: "italic",
              fontWeight: 300,
              color: "#3D2F1F",
              lineHeight: 1.6,
              marginBottom: "2rem",
            }}
          >
            "See it in your space. Know it's right.<br />Buy with confidence."
          </blockquote>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", marginBottom: "2rem" }}>
            <div style={{ height: "1px", width: "3rem", background: "rgba(200,169,106,0.5)" }} />
            <cite style={{ fontFamily: "sans-serif", fontSize: "0.575rem", letterSpacing: "0.32em", textTransform: "uppercase", color: "#9E8E7A", fontStyle: "normal" }}>
              The ARoom Team
            </cite>
            <div style={{ height: "1px", width: "3rem", background: "rgba(200,169,106,0.5)" }} />
          </div>

          {/* Bottom ornament */}
          <div style={{ display: "flex", justifyContent: "center" }}>
            <div style={{ width: "1px", height: "3rem", background: "linear-gradient(to bottom, #C8A96A, transparent)" }} />
          </div>
        </div>
      </section>

      {/* ── FULL-WIDTH DIVIDER ── */}
      <div style={{ padding: "0 1.5rem" }}>
        <GoldRule />
      </div>

      {/* ── CTA ── */}
      <section style={{ maxWidth: "680px", margin: "0 auto", padding: "5.5rem 1.5rem 7rem", textAlign: "center" }}>
        <p style={{ fontFamily: "sans-serif", fontSize: "0.575rem", letterSpacing: "0.38em", textTransform: "uppercase", color: "#9E8E7A", marginBottom: "1.25rem" }}>
          Ready to begin
        </p>
        <h2
          style={{
            fontFamily: "'Cinzel Decorative', serif",
            fontSize: "clamp(1.5rem, 4vw, 2.5rem)",
            fontWeight: 700,
            letterSpacing: "0.04em",
            color: "#1C1916",
            lineHeight: 1.1,
            marginBottom: "1.5rem",
          }}
        >
          Enter Your Sanctuary
        </h2>

        <GoldRuleShort maxWidth="12rem" />
        <div style={{ margin: "0 auto 0", maxWidth: "12rem" }} />

        <p
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "1.15rem",
            fontStyle: "italic",
            fontWeight: 300,
            color: "#6B5F52",
            lineHeight: 1.85,
            maxWidth: "28rem",
            margin: "1.75rem auto 2.5rem",
          }}
        >
          Browse the catalogue and preview any piece in your room with AR.
          Crafted for those who refuse to compromise on beauty.
        </p>

        <button
          onClick={() => navigate("/furniture")}
          style={{
            padding: "0.85rem 2.5rem",
            background: "#1C1916",
            border: "1px solid #1C1916",
            borderRadius: "2rem",
            fontFamily: "sans-serif",
            fontSize: "0.575rem",
            letterSpacing: "0.28em",
            textTransform: "uppercase",
            color: "#F5F0E8",
            cursor: "pointer",
            transition: "background 0.2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#3D2F1F")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "#1C1916")}
        >
          Start Shopping
        </button>
      </section>

      {/* ── FOOTER ORNAMENT ── */}
      <div style={{ padding: "0 1.5rem 5rem" }}>
        <GoldRule />
        <div style={{ display: "flex", justifyContent: "center", marginTop: "2.5rem" }}>
          <span
            style={{
              fontFamily: "'Cinzel Decorative', serif",
              fontSize: "0.575rem",
              letterSpacing: "0.5em",
              textTransform: "uppercase",
              color: "rgba(200,169,106,0.35)",
            }}
          >
            enter your sanctuary
          </span>
        </div>
      </div>

    </div>
  );
}