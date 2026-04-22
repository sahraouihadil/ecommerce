import { useState, useEffect } from "react";

const fadeUp = {
  hidden: { opacity: 0, transform: "translateY(28px)" },
  visible: { opacity: 1, transform: "translateY(0)" },
};

function AnimatedItem({ children, delay = 0, style = {} }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);
  return (
    <div
      style={{
        transition: "opacity 0.6s cubic-bezier(0.16,1,0.3,1), transform 0.6s cubic-bezier(0.16,1,0.3,1)",
        ...(visible ? fadeUp.visible : fadeUp.hidden),
        ...style,
      }}
    >
      {children}
    </div>
  );
}

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

  return (
    <div
      style={{
        fontFamily: "'Georgia', 'Times New Roman', serif",
        minHeight: "100vh",
        background: "linear-gradient(160deg, #faf8f4 0%, #f2ece3 60%, #ede4d8 100%)",
        color: "#1a1a1a",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* ── AMBIENT BLOBS ── */}
      <div
        style={{
          position: "fixed",
          top: "-120px",
          right: "-80px",
          width: "480px",
          height: "480px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(139,111,94,0.12) 0%, transparent 70%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: "fixed",
          bottom: "-100px",
          left: "-60px",
          width: "360px",
          height: "360px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(92,74,58,0.08) 0%, transparent 70%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      <main
        style={{
          maxWidth: "680px",
          margin: "0 auto",
          padding: "96px 28px 80px",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* EYEBROW */}
        <AnimatedItem delay={0}>
          <p
            style={{
              fontSize: "0.7rem",
              letterSpacing: "0.22em",
              fontWeight: "700",
              textTransform: "uppercase",
              color: "#8b6f5e",
              marginBottom: "14px",
              fontFamily: "'Georgia', serif",
            }}
          >
            Get in touch
          </p>
        </AnimatedItem>

        {/* HEADING */}
        <AnimatedItem delay={80}>
          <h1
            style={{
              fontSize: "clamp(2.4rem, 6vw, 3.6rem)",
              fontWeight: "800",
              letterSpacing: "-0.025em",
              lineHeight: 1.08,
              marginBottom: "18px",
              color: "#1a1a1a",
            }}
          >
            Contact
          </h1>
        </AnimatedItem>

        {/* SUBTITLE */}
        <AnimatedItem delay={150}>
          <p
            style={{
              color: "#7a6b5d",
              fontSize: "1.05rem",
              lineHeight: 1.7,
              maxWidth: "440px",
              marginBottom: "52px",
            }}
          >
            Have a question about AR preview, delivery, or styling? Our team is here to help.
          </p>
        </AnimatedItem>

        {/* ── FORM / SUCCESS ── */}
        <AnimatedItem delay={240}>
          {sent ? (
            <div
              style={{
                textAlign: "center",
                padding: "64px 32px",
                background: "rgba(255,255,255,0.7)",
                borderRadius: "24px",
                border: "1px solid rgba(139,111,94,0.18)",
                boxShadow: "0 20px 60px rgba(92,74,58,0.10), 0 2px 8px rgba(92,74,58,0.06)",
                backdropFilter: "blur(12px)",
              }}
            >
              {/* Animated checkmark */}
              <div
                style={{
                  width: "64px",
                  height: "64px",
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #16a34a22, #16a34a11)",
                  border: "1.5px solid #16a34a44",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 20px",
                  fontSize: "28px",
                  animation: "popIn 0.5s cubic-bezier(0.34,1.56,0.64,1) both",
                }}
              >
                ✓
              </div>
              <p
                style={{
                  fontSize: "1.5rem",
                  fontWeight: "800",
                  color: "#16a34a",
                  marginBottom: "10px",
                }}
              >
                Thank you!
              </p>
              <p style={{ color: "#7a6b5d", fontSize: "0.9rem" }}>
                We'll get back to you within 24 hours.
              </p>
              <style>{`
                @keyframes popIn {
                  from { transform: scale(0.4); opacity: 0; }
                  to   { transform: scale(1);   opacity: 1; }
                }
              `}</style>
            </div>
          ) : (
            <div
              style={{
                background: "rgba(255,255,255,0.72)",
                borderRadius: "24px",
                border: "1px solid rgba(210,196,182,0.55)",
                boxShadow:
                  "0 32px 80px rgba(92,74,58,0.12), 0 8px 24px rgba(92,74,58,0.07), 0 1px 3px rgba(92,74,58,0.05)",
                backdropFilter: "blur(14px)",
                padding: "40px 36px",
                marginBottom: "48px",
              }}
            >
              {/* Name + Email row */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "20px",
                  marginBottom: "20px",
                }}
              >
                {[
                  { label: "Name", key: "name", type: "text", val: name, set: setName },
                  { label: "Email", key: "email", type: "email", val: email, set: setEmail },
                ].map(({ label, key, type, val, set }) => (
                  <div key={key}>
                    <label
                      style={{
                        display: "block",
                        fontSize: "0.65rem",
                        letterSpacing: "0.12em",
                        textTransform: "uppercase",
                        fontWeight: "700",
                        color: focused === key ? "#5c4a3a" : "#a89585",
                        marginBottom: "8px",
                        transition: "color 0.2s",
                      }}
                    >
                      {label}
                    </label>
                    <input
                      type={type}
                      value={val}
                      onChange={(e) => set(e.target.value)}
                      onFocus={() => setFocused(key)}
                      onBlur={() => setFocused(null)}
                      required
                      style={{
                        width: "100%",
                        height: "52px",
                        padding: "0 16px",
                        background: focused === key ? "rgba(255,255,255,0.95)" : "rgba(250,248,244,0.8)",
                        border: `1.5px solid ${focused === key ? "#5c4a3a" : "rgba(210,196,182,0.6)"}`,
                        borderRadius: "12px",
                        fontSize: "0.9rem",
                        color: "#1a1a1a",
                        outline: "none",
                        transition: "all 0.25s",
                        boxShadow: focused === key
                          ? "0 0 0 3px rgba(92,74,58,0.08), 0 4px 16px rgba(92,74,58,0.1)"
                          : "0 2px 6px rgba(92,74,58,0.04)",
                        boxSizing: "border-box",
                        fontFamily: "inherit",
                      }}
                    />
                  </div>
                ))}
              </div>

              {/* Message */}
              <div style={{ marginBottom: "28px" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.65rem",
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    fontWeight: "700",
                    color: focused === "message" ? "#5c4a3a" : "#a89585",
                    marginBottom: "8px",
                    transition: "color 0.2s",
                  }}
                >
                  Message
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onFocus={() => setFocused("message")}
                  onBlur={() => setFocused(null)}
                  rows={5}
                  required
                  style={{
                    width: "100%",
                    padding: "14px 16px",
                    background: focused === "message" ? "rgba(255,255,255,0.95)" : "rgba(250,248,244,0.8)",
                    border: `1.5px solid ${focused === "message" ? "#5c4a3a" : "rgba(210,196,182,0.6)"}`,
                    borderRadius: "12px",
                    fontSize: "0.9rem",
                    color: "#1a1a1a",
                    outline: "none",
                    resize: "none",
                    transition: "all 0.25s",
                    boxShadow: focused === "message"
                      ? "0 0 0 3px rgba(92,74,58,0.08), 0 4px 16px rgba(92,74,58,0.1)"
                      : "0 2px 6px rgba(92,74,58,0.04)",
                    boxSizing: "border-box",
                    fontFamily: "inherit",
                    lineHeight: 1.6,
                  }}
                />
              </div>

              {/* Submit button */}
              <SendButton onClick={handleSubmit} />
            </div>
          )}
        </AnimatedItem>

        {/* ── CONTACT INFO CARDS ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "16px",
          }}
        >
          {[
            { icon: "✉", label: "Email", value: "hello@aroom.com", delay: 320 },
            { icon: "📍", label: "Location", value: "Algiers, Algeria", delay: 400 },
            { icon: "🕐", label: "Hours", value: "Mon–Fri, 9am–6pm", delay: 480 },
          ].map(({ icon, label, value, delay }) => (
            <AnimatedItem key={label} delay={delay}>
              <InfoCard icon={icon} label={label} value={value} />
            </AnimatedItem>
          ))}
        </div>
      </main>
    </div>
  );
}

function SendButton({ onClick }) {
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setPressed(false); }}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "10px",
        padding: "0 32px",
        height: "52px",
        background: hovered
          ? "linear-gradient(135deg, #3d2f22, #5c4a3a)"
          : "linear-gradient(135deg, #5c4a3a, #7a5f4e)",
        color: "white",
        border: "none",
        borderRadius: "999px",
        fontSize: "0.82rem",
        fontWeight: "700",
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        cursor: "pointer",
        transition: "all 0.25s cubic-bezier(0.16,1,0.3,1)",
        boxShadow: hovered
          ? "0 12px 32px rgba(92,74,58,0.35), 0 4px 12px rgba(92,74,58,0.2)"
          : "0 4px 16px rgba(92,74,58,0.2), 0 1px 4px rgba(92,74,58,0.1)",
        transform: pressed ? "scale(0.97) translateY(1px)" : hovered ? "translateY(-2px)" : "none",
        fontFamily: "inherit",
      }}
    >
      Send Message
      <span
        style={{
          display: "inline-block",
          transition: "transform 0.3s cubic-bezier(0.16,1,0.3,1)",
          transform: hovered ? "translateX(4px)" : "none",
          fontSize: "1rem",
        }}
      >
        →
      </span>
    </button>
  );
}

function InfoCard({ icon, label, value }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.55)",
        borderRadius: "16px",
        border: `1px solid ${hovered ? "rgba(139,111,94,0.3)" : "rgba(210,196,182,0.45)"}`,
        padding: "20px 18px",
        transition: "all 0.3s cubic-bezier(0.16,1,0.3,1)",
        boxShadow: hovered
          ? "0 16px 40px rgba(92,74,58,0.14), 0 4px 12px rgba(92,74,58,0.08)"
          : "0 4px 16px rgba(92,74,58,0.06), 0 1px 3px rgba(92,74,58,0.04)",
        transform: hovered ? "translateY(-4px)" : "none",
        cursor: "default",
        backdropFilter: "blur(8px)",
      }}
    >
      <div
        style={{
          width: "38px",
          height: "38px",
          borderRadius: "10px",
          background: "linear-gradient(135deg, rgba(139,111,94,0.15), rgba(92,74,58,0.1))",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "17px",
          marginBottom: "12px",
          transition: "transform 0.3s",
          transform: hovered ? "scale(1.1)" : "none",
        }}
      >
        {icon}
      </div>
      <p
        style={{
          fontSize: "0.62rem",
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          fontWeight: "700",
          color: "#a89585",
          marginBottom: "4px",
        }}
      >
        {label}
      </p>
      <p style={{ fontSize: "0.85rem", color: "#3d2f22", fontWeight: "500" }}>{value}</p>
    </div>
  );
}

export default ContactusPage;