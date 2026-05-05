import { useEffect, useRef, useState } from "react";
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

/* ── Scroll Reveal Hook ── */
function useScrollReveal() {
  const ref = useRef(null);
  useEffect(() => {
    const container = ref.current;
    if (!container) return;
    const targets = container.querySelectorAll(".sr");
    if (!targets.length) return;
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("visible");
            io.unobserve(e.target);
          }
        }),
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );
    targets.forEach((t) => io.observe(t));
    return () => io.disconnect();
  }, []);
  return ref;
}

/* ── Carousel slides ── */
const carouselSlides = [
  {
    photo: "https://i.pinimg.com/1200x/6a/85/46/6a854671744dcc8883bacb7fa9c2a030.jpg",
    quote: "See it in your space.\nKnow it's right.",
    cite: "The ARoom Promise",
  },
  {
    photo: "https://i.pinimg.com/1200x/49/78/67/4978671bae72360026972a2892a8166c.jpg",
    quote: "Every corner tells\na story — make it yours.",
    cite: "Design with intention",
  },
  {
    photo: "https://i.pinimg.com/1200x/de/0a/51/de0a516064ac73739163f8803748c6e8.jpg",
    quote: "A room that feels right\nis a room that feels like home.",
    cite: "Go and Start Your Journey",
  },
];

function PhotoCarousel() {
  const [idx, setIdx] = useState(0);
  const [fading, setFading] = useState(false);

  const goNext = () => {
    if (fading) return;
    setFading(true);
    setTimeout(() => {
      setIdx(i => (i + 1) % carouselSlides.length);
      setFading(false);
    }, 380);
  };

  useEffect(() => {
    const t = setInterval(goNext, 4000);
    return () => clearInterval(t);
  }, [fading]);

  const slide = carouselSlides[idx];

  return (
    <div
      onClick={goNext}
      style={{
        width: "100%",
        margin: "0 auto 3rem",
        cursor: "pointer",
      }}
    >
      {/* Quote above photo - still centered with side padding */}
      <div
        style={{
          opacity: fading ? 0 : 1,
          transform: fading ? "translateY(-8px)" : "translateY(0)",
          transition: "opacity 0.38s ease, transform 0.38s ease",
          marginBottom: "1.8rem",
          textAlign: "center",
          padding: "0 1.5rem",
        }}
      >
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "1rem" }}>
          <div style={{ width: "1px", height: "2rem", background: "linear-gradient(to bottom, transparent, #C8A96A)" }} />
        </div>

        <blockquote
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "clamp(1.3rem, 3vw, 2rem)",
            fontStyle: "italic",
            fontWeight: 300,
            color: "#3D2F1F",
            lineHeight: 1.5,
            margin: "0 0 0.8rem",
            whiteSpace: "pre-line",
          }}
        >
          "{slide.quote}"
        </blockquote>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
          <div style={{ height: "1px", width: "2rem", background: "rgba(200,169,106,0.5)" }} />
          <cite
            style={{
              fontFamily: "sans-serif",
              fontSize: "0.5rem",
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              color: "#9E8E7A",
              fontStyle: "normal",
            }}
          >
            {slide.cite}
          </cite>
          <div style={{ height: "1px", width: "2rem", background: "rgba(200,169,106,0.5)" }} />
        </div>

        <div style={{ display: "flex", justifyContent: "center", marginTop: "1rem" }}>
          <div style={{ width: "1px", height: "2rem", background: "linear-gradient(to bottom, #C8A96A, transparent)" }} />
        </div>
      </div>

      {/* Photo – full width, shorter height, no rounded corners */}
      <div
        style={{
          position: "relative",
          width: "100%",
          borderRadius: "0px",
          overflow: "hidden",
          aspectRatio: "21/9",   // ← much shorter than before
          boxShadow: "none",
        }}
      >
        <img
          src={slide.photo}
          alt="ARoom space"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            opacity: fading ? 0 : 1,
            transition: "opacity 0.38s ease",
            display: "block",
          }}
        />

        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(to top, rgba(28,25,22,0.2) 0%, transparent 50%)",
            zIndex: 1,
            pointerEvents: "none",
          }}
        />

        {/* Dots */}
        <div
          style={{
            position: "absolute",
            bottom: "0.75rem",
            left: 0,
            right: 0,
            display: "flex",
            justifyContent: "center",
            gap: "6px",
            zIndex: 3,
          }}
        >
          {carouselSlides.map((_, i) => (
            <div
              key={i}
              style={{
                width: i === idx ? "18px" : "5px",
                height: "5px",
                borderRadius: "3px",
                background: i === idx ? "#C8A96A" : "rgba(200,169,106,0.5)",
                transition: "all 0.35s ease",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Team members ── */
const members = [
  {
    name: "Merahi Ikram",
    role: "Co-Founder & Product",
    photo: null,
    initials: "MI",
  },
  {
    name: "Ferdi Oum Keltoum",
    role: "Co-Founder & Design",
    photo: null,
    initials: "FK",
  },
  {
    name: "Sahraoui Hadil",
    role: "Co-Founder & Tech",
    photo: null,
    initials: "SH",
  },
];

/* ── Member Card ── */
function MemberCard({ member, delay }) {
  return (
    <div
      className="sr sr-scale"
      style={{
        transitionDelay: `${delay}s`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "1.25rem",
      }}
    >
      <div
        style={{
          position: "relative",
          width: "160px",
          height: "160px",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: "-5px",
            borderRadius: "50%",
            border: "1px solid rgba(200,169,106,0.45)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: "-10px",
            borderRadius: "50%",
            border: "1px dashed rgba(200,169,106,0.2)",
            animation: `spin ${18 + delay * 4}s linear infinite`,
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            width: "160px",
            height: "160px",
            borderRadius: "50%",
            overflow: "hidden",
            background: "linear-gradient(135deg, #e8e0d5, #d4c9bb)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            zIndex: 1,
          }}
        >
          {member.photo ? (
            <img
              src={member.photo}
              alt={member.name}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
              loading="lazy"
            />
          ) : (
            <span
              style={{
                fontFamily: "'Cinzel Decorative', serif",
                fontSize: "1.4rem",
                fontWeight: 700,
                color: "#9E8E7A",
                letterSpacing: "0.05em",
              }}
            >
              {member.initials}
            </span>
          )}
        </div>
      </div>

      <div style={{ textAlign: "center" }}>
        <p
          style={{
            fontFamily: "'Cinzel Decorative', serif",
            fontSize: "0.75rem",
            fontWeight: 700,
            letterSpacing: "0.08em",
            color: "#1C1916",
            marginBottom: "0.4rem",
          }}
        >
          {member.name}
        </p>
        <p
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontStyle: "italic",
            fontWeight: 300,
            fontSize: "0.95rem",
            color: "#9E8E7A",
            letterSpacing: "0.03em",
          }}
        >
          {member.role}
        </p>
        <div style={{ marginTop: "0.6rem", display: "flex", justifyContent: "center" }}>
          <GoldRuleShort maxWidth="5rem" />
        </div>
      </div>
    </div>
  );
}

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@400;700;900&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&display=swap');

  @keyframes spin { to { transform: rotate(360deg); } }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(32px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .hero-enter { animation: fadeUp 0.55s cubic-bezier(0.16,1,0.3,1) both; }
  .hero-d1    { animation-delay: 0.05s; }
  .hero-d2    { animation-delay: 0.15s; }
  .hero-d3    { animation-delay: 0.25s; }
  .hero-d4    { animation-delay: 0.35s; }
  .hero-img   {
    animation: fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) 0.2s both;
  }

  .sr {
    opacity: 0;
    transform: translateY(36px);
    transition: opacity 0.45s cubic-bezier(0.16,1,0.3,1),
                transform 0.45s cubic-bezier(0.16,1,0.3,1);
  }
  .sr.sr-scale { transform: scale(0.94) translateY(20px); }
  .sr.visible  { opacity: 1 !important; transform: none !important; }
`;

export function AboutusPage() {
  const navigate = useNavigate();

  const howRef = useScrollReveal();
  const pillarsRef = useScrollReveal();
  const teamRef = useScrollReveal();
  const ctaRef = useScrollReveal();

  return (
    <div
      style={{
        background: "#F5F0E8",
        color: "#1C1916",
        fontFamily: "'Cormorant Garamond', Georgia, serif",
        overflowX: "hidden",
      }}
    >
      <style>{STYLES}</style>

      {/* ── HERO ── */}
      <section
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "clamp(7rem, 14vw, 10rem) 1.5rem 5rem",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "4rem",
            alignItems: "center",
          }}
        >
          <div>
            <p
              className="hero-enter hero-d1"
              style={{
                fontFamily: "sans-serif",
                fontSize: "0.575rem",
                letterSpacing: "0.38em",
                textTransform: "uppercase",
                color: "#9E8E7A",
                marginBottom: "1.25rem",
              }}
            >
              How It Works
            </p>
            <h1
              className="hero-enter hero-d2"
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

            <div className="hero-enter hero-d3">
              <GoldRuleShort />
            </div>

            <p
              className="hero-enter hero-d4"
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
              ARoom lets you see exactly how furniture looks in your real room
              before you buy it. Point your phone, place any piece, and know
              it's right. No guesswork, no returns.
            </p>
          </div>

          <div className="hero-img" style={{ position: "relative" }}>
            <div
              style={{
                position: "absolute",
                top: "-12px",
                right: "-12px",
                bottom: "12px",
                left: "12px",
                border: "1px solid rgba(200,169,106,0.25)",
                borderRadius: "24px",
                pointerEvents: "none",
                zIndex: 0,
              }}
            />
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

      {/* ── DIVIDER ── */}
      <div style={{ padding: "0 1.5rem" }}>
        <GoldRule />
      </div>

      {/* ── HOW IT WORKS ── */}
      <section style={{ maxWidth: "720px", margin: "0 auto", padding: "5rem 1.5rem" }}>
        <div ref={howRef}>
          <p
            className="sr"
            style={{
              fontFamily: "sans-serif",
              fontSize: "0.575rem",
              letterSpacing: "0.38em",
              textTransform: "uppercase",
              color: "#9E8E7A",
              marginBottom: "1.25rem",
            }}
          >
            The Experience
          </p>
          <h2
            className="sr"
            style={{
              fontFamily: "'Cinzel Decorative', serif",
              fontSize: "clamp(1.6rem, 4vw, 2.75rem)",
              fontWeight: 700,
              letterSpacing: "0.035em",
              lineHeight: 1.1,
              color: "#1C1916",
              marginBottom: "1.5rem",
              transitionDelay: "0.05s",
            }}
          >
            Try Before You Buy
          </h2>

          <div className="sr" style={{ transitionDelay: "0.1s" }}>
            <GoldRuleShort />
          </div>

          <div style={{ marginTop: "2.25rem", display: "flex", flexDirection: "column", gap: "1.6rem" }}>
            {[
              "Traditional furniture shopping is broken. You see a photo online, guess the dimensions, hope the color works with your walls, and cross your fingers when it arrives. ARoom fixes that.",
              "With our AR preview, you place any piece of furniture directly into your room using your phone's camera. See how that sofa fits next to your bookshelf. Check if the lamp height works with your ceiling. Know before you buy.",
              "Need help deciding? Roomie, our AI styling assistant, can suggest pieces that match your existing decor, recommend color combinations, and help you build a room layout that works.",
            ].map((text, i) => (
              <p
                key={i}
                className="sr"
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: "1.15rem",
                  fontWeight: 300,
                  color: "#6B5F52",
                  lineHeight: 1.95,
                  transitionDelay: `${0.15 + i * 0.08}s`,
                }}
              >
                {text}
              </p>
            ))}
          </div>
        </div>
      </section>

      {/* ── DIVIDER ── */}
      <div style={{ padding: "0 1.5rem" }}>
        <GoldRule />
      </div>

      {/* ── THREE PILLARS ── */}
      <section style={{ maxWidth: "1100px", margin: "0 auto", padding: "5rem 1.5rem" }}>
        <div ref={pillarsRef}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "2.5rem",
            }}
          >
            {[
              {
                num: "01",
                title: "Place It",
                body: "Use your phone camera to place any piece of furniture directly in your room at true scale.",
              },
              {
                num: "02",
                title: "Style It",
                body: "Roomie, our AI assistant, suggests pieces that harmonise with your space and existing decor.",
              },
              {
                num: "03",
                title: "Own It",
                body: "Buy with full confidence. Every piece ships with a guarantee it will look exactly as you previewed.",
              },
            ].map(({ num, title, body }, i) => (
              <div
                key={num}
                className="sr"
                style={{
                  borderTop: "1px solid rgba(200,169,106,0.3)",
                  paddingTop: "1.75rem",
                  transitionDelay: `${i * 0.1}s`,
                }}
              >
                <p
                  style={{
                    fontFamily: "sans-serif",
                    fontSize: "0.575rem",
                    letterSpacing: "0.38em",
                    textTransform: "uppercase",
                    color: "#C8A96A",
                    marginBottom: "1rem",
                  }}
                >
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
                <p
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: "1.05rem",
                    fontWeight: 300,
                    fontStyle: "italic",
                    color: "#6B5F52",
                    lineHeight: 1.85,
                  }}
                >
                  {body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DIVIDER ── */}
      <div style={{ padding: "0 1.5rem" }}>
        <GoldRule />
      </div>

      {/* ── TEAM ── */}
      <section style={{ maxWidth: "900px", margin: "0 auto", padding: "5.5rem 1.5rem" }}>
        <div ref={teamRef}>
          <div style={{ textAlign: "center", marginBottom: "4rem" }}>
            <p
              className="sr"
              style={{
                fontFamily: "sans-serif",
                fontSize: "0.575rem",
                letterSpacing: "0.38em",
                textTransform: "uppercase",
                color: "#9E8E7A",
                marginBottom: "1rem",
              }}
            >
              The People Behind It
            </p>
            <h2
              className="sr"
              style={{
                fontFamily: "'Cinzel Decorative', serif",
                fontSize: "clamp(1.5rem, 4vw, 2.5rem)",
                fontWeight: 700,
                color: "#1C1916",
                letterSpacing: "0.035em",
                lineHeight: 1.1,
                marginBottom: "1.25rem",
                transitionDelay: "0.07s",
              }}
            >
              Meet the Founders
            </h2>
            <div
              className="sr"
              style={{
                display: "flex",
                justifyContent: "center",
                transitionDelay: "0.12s",
              }}
            >
              <GoldRuleShort maxWidth="10rem" />
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: "3.5rem 5rem",
            }}
          >
            {members.map((member, i) => (
              <MemberCard key={member.name} member={member} delay={0.1 + i * 0.12} />
            ))}
          </div>
        </div>
      </section>

      {/* ── DIVIDER ── */}
      <div style={{ padding: "0 1.5rem" }}>
        <GoldRule />
      </div>

      {/* ── PHOTO CAROUSEL – FULL WIDTH, REDUCED HEIGHT ── */}
      <section style={{ width: "100%", margin: "0 auto", padding: "5rem 0" }}>
        <PhotoCarousel />
      </section>

      {/* ── DIVIDER ── */}
      <div style={{ padding: "0 1.5rem" }}>
        <GoldRule />
      </div>

      {/* ── CTA ── */}
      <section
        style={{
          maxWidth: "680px",
          margin: "0 auto",
          padding: "5.5rem 1.5rem 7rem",
          textAlign: "center",
        }}
      >
        <div ref={ctaRef}>
          <p
            className="sr"
            style={{
              fontFamily: "sans-serif",
              fontSize: "0.575rem",
              letterSpacing: "0.38em",
              textTransform: "uppercase",
              color: "#9E8E7A",
              marginBottom: "1.25rem",
            }}
          >
            Ready to begin
          </p>
          <h2
            className="sr"
            style={{
              fontFamily: "'Cinzel Decorative', serif",
              fontSize: "clamp(1.5rem, 4vw, 2.5rem)",
              fontWeight: 700,
              letterSpacing: "0.04em",
              color: "#1C1916",
              lineHeight: 1.1,
              marginBottom: "1.5rem",
              transitionDelay: "0.07s",
            }}
          >
            Enter Your Sanctuary
          </h2>
          <div className="sr" style={{ transitionDelay: "0.12s" }}>
            <GoldRuleShort maxWidth="12rem" />
          </div>
          <p
            className="sr"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "1.15rem",
              fontStyle: "italic",
              fontWeight: 300,
              color: "#6B5F52",
              lineHeight: 1.85,
              maxWidth: "28rem",
              margin: "1.75rem auto 2.5rem",
              transitionDelay: "0.17s",
            }}
          >
            Browse the catalogue and preview any piece in your room with AR.
            Crafted for those who refuse to compromise on beauty.
          </p>
          <div className="sr" style={{ transitionDelay: "0.22s" }}>
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
          </div>
        </div>
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