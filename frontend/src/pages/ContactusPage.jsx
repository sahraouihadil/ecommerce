import { useState, useEffect } from "react";

function AnimatedItem({ children, delay = 0, style = {} }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);
  return (
    <div
      style={{
        transition: "opacity 0.7s cubic-bezier(0.16,1,0.3,1), transform 0.7s cubic-bezier(0.16,1,0.3,1)",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(24px)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

const GOLD = "#C8A96A";
const CHARCOAL = "#1C1916";
const MUTED = "#9E8E7A";
const CREAM = "#FAF8F4";

export function ContactusPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [focused, setFocused] = useState(null);

  const handleSubmit = () => {
    if (!name || !email || !message) return;
    setSent(true);
  };

  const inputStyle = (key) => ({
    width: "100%",
    background: "transparent",
    border: "none",
    borderBottom: `1px solid ${focused === key ? GOLD : "rgba(200,169,106,0.3)"}`,
    padding: "12px 0",
    fontSize: "0.9375rem",
    fontFamily: "'Cormorant Garamond', Georgia, serif",
    color: CHARCOAL,
    outline: "none",
    transition: "border-color 0.25s ease",
    boxSizing: "border-box",
  });

  const labelStyle = (key) => ({
    display: "block",
    fontFamily: "sans-serif",
    fontSize: "0.5875rem",
    letterSpacing: "0.3em",
    textTransform: "uppercase",
    fontWeight: 600,
    color: focused === key ? GOLD : MUTED,
    marginBottom: "6px",
    transition: "color 0.25s ease",
  });

  return (
    <div style={{
      fontFamily: "'Cormorant Garamond', Georgia, serif",
      minHeight: "100vh",
      background: CREAM,
      color: CHARCOAL,
    }}>

      {/* ── Load Google Fonts ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@400;700&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&display=swap');
        ::placeholder { color: rgba(158,142,122,0.45); font-style: italic; }
        @keyframes popIn {
          from { transform: scale(0.5); opacity: 0; }
          to   { transform: scale(1);   opacity: 1; }
        }
        @keyframes checkDraw {
          from { stroke-dashoffset: 40; }
          to   { stroke-dashoffset: 0; }
        }
      `}</style>

      <div style={{
        maxWidth: "1100px",
        margin: "0 auto",
        padding: "0 2rem",
        minHeight: "100vh",
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "0",
        alignItems: "stretch",
      }}
        className="contact-grid"
      >

        {/* ── LEFT PANEL ── */}
        <div style={{
          padding: "8rem 4rem 6rem 1rem",
          borderRight: "1px solid rgba(200,169,106,0.2)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}>

          {/* Eyebrow */}
          <AnimatedItem delay={0}>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "2rem" }}>
              <div style={{ height: "1px", width: "2rem", background: GOLD, opacity: 0.6 }} />
              <span style={{
                fontFamily: "sans-serif",
                fontSize: "0.575rem",
                letterSpacing: "0.45em",
                textTransform: "uppercase",
                color: GOLD,
              }}>
                Reach out
              </span>
            </div>
          </AnimatedItem>

          {/* Heading */}
          <AnimatedItem delay={80}>
            <h1 style={{
              fontFamily: "'Cinzel Decorative', serif",
              fontSize: "clamp(2.25rem, 4vw, 3.5rem)",
              fontWeight: 700,
              lineHeight: 1.08,
              letterSpacing: "0.02em",
              color: CHARCOAL,
              marginBottom: "1.75rem",
            }}>
              Let's Talk
            </h1>
          </AnimatedItem>

          {/* Gold ornament */}
          <AnimatedItem delay={140}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "2rem", maxWidth: "12rem" }}>
              <div style={{ height: "1px", flex: 1, background: GOLD, opacity: 0.45 }} />
              <div style={{ width: "4px", height: "4px", background: GOLD, transform: "rotate(45deg)", opacity: 0.6 }} />
              <div style={{ height: "1px", flex: 1, background: GOLD, opacity: 0.45 }} />
            </div>
          </AnimatedItem>

          {/* Subtitle */}
          <AnimatedItem delay={200}>
            <p style={{
              fontSize: "1.125rem",
              fontStyle: "italic",
              fontWeight: 300,
              color: MUTED,
              lineHeight: 1.85,
              maxWidth: "22rem",
              marginBottom: "3.5rem",
            }}>
              Questions about AR preview, delivery, or styling advice? Our team responds within 24 hours.
            </p>
          </AnimatedItem>

          {/* Contact info list */}
          {[
            { label: "Email", value: "hello@aroom.com" },
            { label: "Location", value: "Algiers, Algeria" },
            { label: "Hours", value: "Mon–Fri, 9am–6pm" },
          ].map(({ label, value }, i) => (
            <AnimatedItem key={label} delay={280 + i * 70}>
              <div style={{
                display: "flex",
                alignItems: "baseline",
                gap: "1.25rem",
                marginBottom: "1.25rem",
                paddingBottom: "1.25rem",
                borderBottom: "1px solid rgba(200,169,106,0.12)",
              }}>
                <span style={{
                  fontFamily: "sans-serif",
                  fontSize: "0.55rem",
                  letterSpacing: "0.3em",
                  textTransform: "uppercase",
                  color: GOLD,
                  minWidth: "5rem",
                }}>
                  {label}
                </span>
                <span style={{ fontSize: "0.9375rem", color: CHARCOAL, fontWeight: 400 }}>
                  {value}
                </span>
              </div>
            </AnimatedItem>
          ))}

          {/* Bottom ornament */}
          <AnimatedItem delay={560}>
            <div style={{ marginTop: "2rem" }}>
              <span style={{
                fontFamily: "'Cinzel Decorative', serif",
                fontSize: "0.55rem",
                letterSpacing: "0.5em",
                textTransform: "uppercase",
                color: `rgba(200,169,106,0.3)`,
              }}>
                Aroom · Est. MMXV
              </span>
            </div>
          </AnimatedItem>
        </div>

        {/* ── RIGHT PANEL — FORM ── */}
        <div style={{
          padding: "8rem 1rem 6rem 4rem",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}>

          {sent ? (
            <AnimatedItem delay={0}>
              <div style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                padding: "5rem 2rem",
                gap: "1.5rem",
              }}>
                {/* Animated check circle */}
                <div style={{
                  width: "72px",
                  height: "72px",
                  borderRadius: "50%",
                  border: `1px solid rgba(200,169,106,0.4)`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  animation: "popIn 0.6s cubic-bezier(0.34,1.56,0.64,1) both",
                }}>
                  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                    <polyline
                      points="5,14 11,20 23,8"
                      stroke={GOLD}
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeDasharray="40"
                      strokeDashoffset="0"
                      style={{ animation: "checkDraw 0.5s ease 0.3s both" }}
                    />
                  </svg>
                </div>

                <div>
                  <h2 style={{
                    fontFamily: "'Cinzel Decorative', serif",
                    fontSize: "1.75rem",
                    fontWeight: 700,
                    color: CHARCOAL,
                    marginBottom: "0.75rem",
                  }}>
                    Thank You
                  </h2>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", justifyContent: "center", marginBottom: "1.25rem" }}>
                    <div style={{ height: "1px", width: "2rem", background: GOLD, opacity: 0.4 }} />
                    <div style={{ width: "4px", height: "4px", background: GOLD, transform: "rotate(45deg)", opacity: 0.5 }} />
                    <div style={{ height: "1px", width: "2rem", background: GOLD, opacity: 0.4 }} />
                  </div>
                  <p style={{ color: MUTED, fontSize: "1rem", fontStyle: "italic", fontWeight: 300, lineHeight: 1.8 }}>
                    We'll get back to you within 24 hours.
                  </p>
                </div>
              </div>
            </AnimatedItem>
          ) : (
            <>
              <AnimatedItem delay={100}>
                <p style={{
                  fontFamily: "sans-serif",
                  fontSize: "0.575rem",
                  letterSpacing: "0.35em",
                  textTransform: "uppercase",
                  color: MUTED,
                  marginBottom: "2.5rem",
                }}>
                  Send a message
                </p>
              </AnimatedItem>

              {/* Name + Email row */}
              <AnimatedItem delay={180}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem", marginBottom: "2.5rem" }}>
                  <div>
                    <label style={labelStyle("name")}>Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      onFocus={() => setFocused("name")}
                      onBlur={() => setFocused(null)}
                      placeholder="Your name"
                      style={inputStyle("name")}
                    />
                  </div>
                  <div>
                    <label style={labelStyle("email")}>Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      onFocus={() => setFocused("email")}
                      onBlur={() => setFocused(null)}
                      placeholder="your@email.com"
                      style={inputStyle("email")}
                    />
                  </div>
                </div>
              </AnimatedItem>

              {/* Message */}
              <AnimatedItem delay={260}>
                <div style={{ marginBottom: "3rem" }}>
                  <label style={labelStyle("message")}>Message</label>
                  <textarea
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    onFocus={() => setFocused("message")}
                    onBlur={() => setFocused(null)}
                    rows={5}
                    placeholder="Tell us how we can help..."
                    style={{
                      ...inputStyle("message"),
                      resize: "none",
                      lineHeight: 1.75,
                      paddingTop: "12px",
                    }}
                  />
                </div>
              </AnimatedItem>

              {/* Submit */}
              <AnimatedItem delay={340}>
                <SendButton onClick={handleSubmit} disabled={!name || !email || !message} />
              </AnimatedItem>
            </>
          )}
        </div>
      </div>

      {/* Responsive styles */}
      <style>{`
        @media (max-width: 768px) {
          .contact-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}

function SendButton({ onClick, disabled }) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.75rem",
        padding: "0 2.25rem",
        height: "52px",
        background: disabled ? "transparent" : "transparent",
        color: disabled ? "rgba(200,169,106,0.35)" : hovered ? "#1C1916" : GOLD,
        border: `1px solid ${disabled ? "rgba(200,169,106,0.2)" : hovered ? "#1C1916" : "rgba(200,169,106,0.55)"}`,
        borderRadius: 0,
        fontFamily: "sans-serif",
        fontSize: "0.6rem",
        fontWeight: 600,
        letterSpacing: "0.3em",
        textTransform: "uppercase",
        cursor: disabled ? "not-allowed" : "pointer",
        transition: "all 0.25s ease",
        outline: "none",
      }}
    >
      Send Message
      <span style={{
        display: "inline-block",
        transition: "transform 0.3s ease",
        transform: hovered && !disabled ? "translateX(5px)" : "none",
        fontSize: "0.875rem",
      }}>
        →
      </span>
    </button>
  );
}

export default ContactusPage;