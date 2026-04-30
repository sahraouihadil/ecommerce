import { useState, useRef, useEffect } from "react";
import api from "../services/api";
import { useLocation, useNavigate, Navigate, Link } from "react-router-dom";

const DIGITS = 6;
const GOLD = "#C8A96A";
const CHARCOAL = "#1C1916";
const MUTED = "#9E8E7A";
const CREAM = "#FAF8F4";

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

export function VerifyCode() {
  const [digits, setDigits] = useState(Array(DIGITS).fill(""));
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(null);
  const [success, setSuccess] = useState(false);
  const inputRefs = useRef([]);

  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email;

  if (!email) return <Navigate to="/register" replace />;

  const handleChange = (index, value) => {
    const char = value.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[index] = char;
    setDigits(next);
    if (char && index < DIGITS - 1) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, DIGITS);
    const next = Array(DIGITS).fill("");
    pasted.split("").forEach((c, i) => { next[i] = c; });
    setDigits(next);
    inputRefs.current[Math.min(pasted.length, DIGITS - 1)]?.focus();
  };

  const handleVerify = async () => {
    const code = digits.join("");
    if (code.length < DIGITS) {
      setIsError(true);
      setMessage("Please enter all 6 digits.");
      return;
    }
    setLoading(true);
    setMessage("");
    try {
      const res = await api.get("/verify-code", { params: { email, code } });
      if (res.data.msg) {
        setIsError(false);
        setSuccess(true);
        setMessage(res.data.msg);
        setTimeout(() => {
          navigate("/set-password", { state: { userName: res.data.user_name } });
        }, 1200);
      }
    } catch (err) {
      setIsError(true);
      setMessage(err?.response?.data?.detail || "Server error");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = () => {
    setDigits(Array(DIGITS).fill(""));
    setMessage("");
    inputRefs.current[0]?.focus();
  };

  const filledCount = digits.filter(Boolean).length;

  return (
    <div style={{
      fontFamily: "'Cormorant Garamond', Georgia, serif",
      minHeight: "100vh",
      background: CREAM,
      color: CHARCOAL,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "4rem 1.5rem",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@400;700&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&display=swap');
        .digit-input::-webkit-inner-spin-button,
        .digit-input::-webkit-outer-spin-button { -webkit-appearance: none; }
        .digit-input { -moz-appearance: textfield; }
        @keyframes popIn {
          from { transform: scale(0.5); opacity: 0; }
          to   { transform: scale(1);   opacity: 1; }
        }
        @keyframes checkDraw {
          from { stroke-dashoffset: 40; }
          to   { stroke-dashoffset: 0; }
        }
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
      `}</style>

      <div style={{ width: "100%", maxWidth: "480px" }}>

        {/* Logo */}
        <AnimatedItem delay={0} style={{ textAlign: "center", marginBottom: "3.5rem" }}>
          <Link to="/" style={{
            fontFamily: "'Cinzel Decorative', serif",
            fontSize: "1.375rem",
            fontWeight: 700,
            color: CHARCOAL,
            textDecoration: "none",
            letterSpacing: "0.08em",
          }}>
            ARoom
          </Link>
        </AnimatedItem>

        {/* Header */}
        <AnimatedItem delay={80} style={{ textAlign: "center", marginBottom: "3rem" }}>
          {/* Eyebrow */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.875rem", marginBottom: "1.5rem" }}>
            <div style={{ height: "1px", width: "2rem", background: GOLD, opacity: 0.55 }} />
            <span style={{
              fontFamily: "sans-serif",
              fontSize: "0.5625rem",
              letterSpacing: "0.4em",
              textTransform: "uppercase",
              color: GOLD,
            }}>
              Verification
            </span>
            <div style={{ height: "1px", width: "2rem", background: GOLD, opacity: 0.55 }} />
          </div>

          <h1 style={{
            fontFamily: "'Cinzel Decorative', serif",
            fontSize: "clamp(1.75rem, 5vw, 2.5rem)",
            fontWeight: 700,
            lineHeight: 1.1,
            letterSpacing: "0.02em",
            color: CHARCOAL,
            marginBottom: "1.25rem",
          }}>
            Enter Code
          </h1>

          {/* Ornament */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.625rem", marginBottom: "1.25rem" }}>
            <div style={{ height: "1px", width: "1.75rem", background: GOLD, opacity: 0.35 }} />
            <div style={{ width: "3px", height: "3px", background: GOLD, transform: "rotate(45deg)", opacity: 0.5 }} />
            <div style={{ height: "1px", width: "1.75rem", background: GOLD, opacity: 0.35 }} />
          </div>

          <p style={{ color: MUTED, fontSize: "1rem", fontStyle: "italic", fontWeight: 300, lineHeight: 1.8 }}>
            A {DIGITS}-digit code was sent to
          </p>
          <p style={{ color: CHARCOAL, fontSize: "0.9375rem", fontWeight: 500, marginTop: "0.25rem" }}>
            {email}
          </p>
        </AnimatedItem>

        {/* Digit Inputs */}
        <AnimatedItem delay={200}>
          <div
            onPaste={handlePaste}
            style={{ display: "flex", justifyContent: "center", gap: "0.875rem", marginBottom: "3rem" }}
          >
            {digits.map((d, i) => (
              <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0" }}>
                <input
                  ref={el => inputRefs.current[i] = el}
                  className="digit-input"
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={d}
                  onChange={e => handleChange(i, e.target.value)}
                  onKeyDown={e => handleKeyDown(i, e)}
                  onFocus={() => setFocusedIndex(i)}
                  onBlur={() => setFocusedIndex(null)}
                  style={{
                    width: "52px",
                    height: "64px",
                    textAlign: "center",
                    fontSize: "1.625rem",
                    fontFamily: "'Cinzel Decorative', serif",
                    fontWeight: 700,
                    color: CHARCOAL,
                    background: "transparent",
                    border: "none",
                    borderBottom: `2px solid ${focusedIndex === i
                        ? GOLD
                        : d
                          ? `rgba(200,169,106,0.7)`
                          : `rgba(158,142,122,0.2)`
                      }`,
                    outline: "none",
                    transition: "border-color 0.25s ease",
                    caretColor: GOLD,
                  }}
                />
              </div>
            ))}
          </div>
        </AnimatedItem>

        {/* Progress bar */}
        <AnimatedItem delay={260}>
          <div style={{ marginBottom: "2.5rem" }}>
            <div style={{
              height: "1px",
              background: `rgba(200,169,106,0.15)`,
              borderRadius: "1px",
              overflow: "hidden",
            }}>
              <div style={{
                height: "100%",
                width: `${(filledCount / DIGITS) * 100}%`,
                background: GOLD,
                transition: "width 0.3s ease",
                opacity: 0.7,
              }} />
            </div>
          </div>
        </AnimatedItem>

        {/* Verify Button */}
        <AnimatedItem delay={320}>
          <VerifyButton onClick={handleVerify} loading={loading} success={success} />
        </AnimatedItem>

        {/* Resend */}
        <AnimatedItem delay={400} style={{ textAlign: "center", marginTop: "1.75rem" }}>
          <button
            onClick={handleResend}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontFamily: "sans-serif",
              fontSize: "0.5625rem",
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              color: MUTED,
              padding: "0.5rem 0",
              transition: "color 0.25s ease",
            }}
            onMouseEnter={e => e.target.style.color = GOLD}
            onMouseLeave={e => e.target.style.color = MUTED}
          >
            Resend Code
          </button>
        </AnimatedItem>

        {/* Message */}
        {message && (
          <AnimatedItem delay={0}>
            <p style={{
              marginTop: "1.5rem",
              textAlign: "center",
              fontSize: "0.875rem",
              fontStyle: "italic",
              color: isError ? "#c0392b" : "#5a8a6a",
              fontWeight: 300,
            }}>
              {message}
            </p>
          </AnimatedItem>
        )}

        {/* Bottom ornament */}
        <AnimatedItem delay={480} style={{ textAlign: "center", marginTop: "3rem" }}>
          <span style={{
            fontFamily: "'Cinzel Decorative', serif",
            fontSize: "0.5rem",
            letterSpacing: "0.5em",
            textTransform: "uppercase",
            color: `rgba(200,169,106,0.25)`,
          }}>
            Aroom
          </span>
        </AnimatedItem>
      </div>
    </div>
  );
}

function VerifyButton({ onClick, loading, success }) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      disabled={loading || success}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "0.75rem",
        width: "100%",
        height: "56px",
        background: success ? "transparent" : hovered ? CHARCOAL : "transparent",
        color: success
          ? GOLD
          : loading
            ? `rgba(200,169,106,0.5)`
            : hovered
              ? CREAM
              : GOLD,
        border: `1px solid ${success
            ? `rgba(200,169,106,0.5)`
            : loading
              ? `rgba(200,169,106,0.2)`
              : hovered
                ? CHARCOAL
                : `rgba(200,169,106,0.55)`
          }`,
        borderRadius: 0,
        fontFamily: "sans-serif",
        fontSize: "0.6rem",
        fontWeight: 600,
        letterSpacing: "0.3em",
        textTransform: "uppercase",
        cursor: loading || success ? "not-allowed" : "pointer",
        transition: "all 0.25s ease",
        outline: "none",
      }}
    >
      {success ? (
        <>
          <svg width="14" height="14" viewBox="0 0 28 28" fill="none">
            <polyline
              points="5,14 11,20 23,8"
              stroke={GOLD}
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Verified
        </>
      ) : loading ? (
        "Verifying…"
      ) : (
        <>
          Verify Code
          <span style={{
            display: "inline-block",
            transition: "transform 0.3s ease",
            transform: hovered ? "translateX(5px)" : "none",
            fontSize: "0.875rem",
          }}>
            →
          </span>
        </>
      )}
    </button>
  );
}