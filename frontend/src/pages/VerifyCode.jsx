import { useState, useRef, useEffect } from "react";
import api from "../services/api";
import { useLocation, useNavigate, Navigate, Link } from "react-router-dom";

const DIGITS = 6;
const GOLD = "#C8A96A";
const CHARCOAL = "#1C1916";
const MUTED = "#9E8E7A";
const CREAM = "#FAF8F4";

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@400;700&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&display=swap');

  .digit-input::-webkit-inner-spin-button,
  .digit-input::-webkit-outer-spin-button { -webkit-appearance: none; }
  .digit-input { -moz-appearance: textfield; }

  /* ── entrance ── */
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(28px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes digitDrop {
    0%   { opacity: 0; transform: translateY(-18px) scale(0.8); }
    60%  { transform: translateY(4px) scale(1.05); }
    100% { opacity: 1; transform: translateY(0) scale(1); }
  }

  /* ── interaction ── */
  @keyframes digitPop {
    0%   { transform: scale(1); }
    40%  { transform: scale(1.22); }
    70%  { transform: scale(0.92); }
    100% { transform: scale(1); }
  }
  @keyframes shake {
    0%,100% { transform: translateX(0); }
    18%     { transform: translateX(-9px); }
    36%     { transform: translateX(8px); }
    54%     { transform: translateX(-6px); }
    72%     { transform: translateX(5px); }
    90%     { transform: translateX(-2px); }
  }

  /* ── success ── */
  @keyframes popIn {
    from { transform: scale(0.3) rotate(-15deg); opacity: 0; }
    60%  { transform: scale(1.15) rotate(3deg); opacity: 1; }
    100% { transform: scale(1) rotate(0deg); opacity: 1; }
  }
  @keyframes checkDraw {
    from { stroke-dashoffset: 40; }
    to   { stroke-dashoffset: 0; }
  }
  @keyframes ringExpand {
    0%   { transform: scale(0.7); opacity: 0.8; }
    100% { transform: scale(1.7); opacity: 0; }
  }

  /* ── progress bar shimmer ── */
  @keyframes shimmer {
    0%   { background-position: -200% center; }
    100% { background-position:  200% center; }
  }

  /* ── ornament float ── */
  @keyframes float {
    0%,100% { transform: translateY(0px); }
    50%     { transform: translateY(-6px); }
  }

  /* ── logo reveal ── */
  @keyframes logoReveal {
    0%   { opacity: 0; letter-spacing: 0.25em; }
    100% { opacity: 1; letter-spacing: 0.08em; }
  }

  /* ── gold line draw ── */
  @keyframes lineDraw {
    from { width: 0; opacity: 0; }
    to   { opacity: 1; }
  }

  .verify-logo {
    animation: logoReveal 1s cubic-bezier(0.16,1,0.3,1) both;
  }
  .verify-line {
    animation: lineDraw 0.8s cubic-bezier(0.16,1,0.3,1) both;
  }
`;

function AnimatedItem({ children, delay = 0, style = {} }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);
  return (
    <div style={{
      transition: "opacity 0.7s cubic-bezier(0.16,1,0.3,1), transform 0.7s cubic-bezier(0.16,1,0.3,1)",
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(24px)",
      ...style,
    }}>
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
  const [resending, setResending] = useState(false);
  const [shaking, setShaking] = useState(false);
  const [poppedIndex, setPoppedIndex] = useState(null);
  const inputRefs = useRef([]);

  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email;

  if (!email) return <Navigate to="/register" replace />;

  const triggerShake = () => {
    setShaking(true);
    setTimeout(() => setShaking(false), 600);
  };

  const handleChange = (index, value) => {
    const char = value.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[index] = char;
    setDigits(next);
    if (char) {
      setPoppedIndex(index);
      setTimeout(() => setPoppedIndex(null), 380);
      if (index < DIGITS - 1) inputRefs.current[index + 1]?.focus();
    }
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
      triggerShake();
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
        }, 1400);
      }
    } catch (err) {
      setIsError(true);
      triggerShake();
      setMessage(err?.response?.data?.detail || "Server error");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resending) return;
    setResending(true);
    setMessage("");
    setIsError(false);
    try {
      await api.post("/resend-code", { email });
      setDigits(Array(DIGITS).fill(""));
      setIsError(false);
      setMessage("A new code has been sent to your email.");
      inputRefs.current[0]?.focus();
    } catch (err) {
      setIsError(true);
      setMessage(err?.response?.data?.detail || "Failed to resend code. Please try again.");
    } finally {
      setResending(false);
    }
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
      <style>{STYLES}</style>

      <div style={{ width: "100%", maxWidth: "480px" }}>

        {/* Logo */}
        <AnimatedItem delay={0} style={{ textAlign: "center", marginBottom: "3.5rem" }}>
          <Link to="/" className="verify-logo" style={{
            fontFamily: "'Cinzel Decorative', serif",
            fontSize: "1.375rem",
            fontWeight: 700,
            color: CHARCOAL,
            textDecoration: "none",
            letterSpacing: "0.08em",
            display: "inline-block",
          }}>
            ARoom
          </Link>
        </AnimatedItem>

        {/* Header */}
        <AnimatedItem delay={80} style={{ textAlign: "center", marginBottom: "3rem" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.875rem", marginBottom: "1.5rem" }}>
            <div className="verify-line" style={{ height: "1px", width: "2rem", background: GOLD, opacity: 0.55, animationDelay: "0.3s" }} />
            <span style={{ fontFamily: "sans-serif", fontSize: "0.5625rem", letterSpacing: "0.4em", textTransform: "uppercase", color: GOLD }}>
              Verification
            </span>
            <div className="verify-line" style={{ height: "1px", width: "2rem", background: GOLD, opacity: 0.55, animationDelay: "0.5s" }} />
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

          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.625rem", marginBottom: "1.25rem" }}>
            <div style={{ height: "1px", width: "1.75rem", background: GOLD, opacity: 0.35 }} />
            <div style={{
              width: "5px", height: "5px", background: GOLD, transform: "rotate(45deg)", opacity: 0.6,
              animation: "float 3s ease-in-out infinite",
            }} />
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
        <div
          onPaste={handlePaste}
          style={{
            display: "flex", justifyContent: "center", gap: "0.875rem", marginBottom: "3rem",
            animation: shaking ? "shake 0.55s cubic-bezier(0.36,0.07,0.19,0.97) both" : "none",
          }}
        >
          {digits.map((d, i) => (
            <div key={i} style={{
              opacity: 0,
              animation: `digitDrop 0.55s cubic-bezier(0.16,1,0.3,1) ${120 + i * 60}ms both`,
            }}>
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
                  color: success ? GOLD : CHARCOAL,
                  background: "transparent",
                  border: "none",
                  borderBottom: `2px solid ${success
                      ? `rgba(200,169,106,0.8)`
                      : isError && shaking
                        ? `rgba(192,57,43,0.6)`
                        : focusedIndex === i
                          ? GOLD
                          : d
                            ? `rgba(200,169,106,0.7)`
                            : `rgba(158,142,122,0.2)`
                    }`,
                  outline: "none",
                  transition: "border-color 0.25s ease, color 0.3s ease",
                  caretColor: GOLD,
                  animation: poppedIndex === i ? "digitPop 0.35s cubic-bezier(0.36,1.56,0.64,1)" : "none",
                }}
              />
            </div>
          ))}
        </div>

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
                background: filledCount === DIGITS
                  ? `linear-gradient(90deg, ${GOLD}, #e8c97a, ${GOLD})`
                  : GOLD,
                backgroundSize: "200% auto",
                animation: filledCount === DIGITS ? "shimmer 1.5s linear infinite" : "none",
                transition: "width 0.3s cubic-bezier(0.16,1,0.3,1)",
                opacity: 0.8,
              }} />
            </div>
            <div style={{
              display: "flex", justifyContent: "flex-end", marginTop: "6px",
              fontFamily: "sans-serif", fontSize: "0.5rem", letterSpacing: "0.2em",
              textTransform: "uppercase", color: `rgba(200,169,106,${filledCount > 0 ? 0.5 : 0.2})`,
              transition: "color 0.3s ease",
            }}>
              {filledCount}/{DIGITS}
            </div>
          </div>
        </AnimatedItem>

        {/* Verify Button */}
        <AnimatedItem delay={320}>
          {success ? (
            <SuccessState />
          ) : (
            <VerifyButton onClick={handleVerify} loading={loading} success={success} />
          )}
        </AnimatedItem>

        {/* Resend */}
        <AnimatedItem delay={400} style={{ textAlign: "center", marginTop: "1.75rem" }}>
          <button
            onClick={handleResend}
            disabled={resending}
            style={{
              background: "none", border: "none",
              cursor: resending ? "not-allowed" : "pointer",
              fontFamily: "sans-serif", fontSize: "0.5625rem",
              letterSpacing: "0.3em", textTransform: "uppercase",
              color: resending ? `rgba(200,169,106,0.4)` : MUTED,
              padding: "0.5rem 0",
              transition: "color 0.25s ease",
            }}
            onMouseEnter={e => { if (!resending) e.target.style.color = GOLD; }}
            onMouseLeave={e => { if (!resending) e.target.style.color = MUTED; }}
          >
            {resending ? "Sending…" : "Resend Code"}
          </button>
        </AnimatedItem>

        {/* Message */}
        {message && (
          <AnimatedItem delay={0}>
            <p style={{
              marginTop: "1.5rem", textAlign: "center",
              fontSize: "0.875rem", fontStyle: "italic",
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
            fontSize: "0.5rem", letterSpacing: "0.5em",
            textTransform: "uppercase",
            color: `rgba(200,169,106,0.25)`,
            animation: "float 4s ease-in-out infinite",
            display: "inline-block",
          }}>
            Aroom
          </span>
        </AnimatedItem>
      </div>
    </div>
  );
}

function SuccessState() {
  return (
    <div style={{ textAlign: "center", padding: "1rem 0 2rem" }}>
      {/* Rings */}
      <div style={{ position: "relative", width: "80px", height: "80px", margin: "0 auto 1.5rem" }}>
        {[0, 1].map(i => (
          <div key={i} style={{
            position: "absolute", inset: 0, borderRadius: "50%",
            border: `1px solid rgba(200,169,106,0.4)`,
            animation: `ringExpand 1.4s ease-out ${i * 0.35}s infinite`,
          }} />
        ))}
        <div style={{
          position: "absolute", inset: 0,
          borderRadius: "50%", border: `1px solid rgba(200,169,106,0.5)`,
          display: "flex", alignItems: "center", justifyContent: "center",
          animation: "popIn 0.6s cubic-bezier(0.34,1.56,0.64,1) both",
        }}>
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <polyline
              points="5,14 11,20 23,8"
              stroke={GOLD} strokeWidth="1.5"
              strokeLinecap="round" strokeLinejoin="round"
              strokeDasharray="40" strokeDashoffset="0"
              style={{ animation: "checkDraw 0.5s ease 0.3s both" }}
            />
          </svg>
        </div>
      </div>
      <h2 style={{
        fontFamily: "'Cinzel Decorative', serif",
        fontSize: "1.25rem", fontWeight: 700,
        color: CHARCOAL, marginBottom: "0.5rem",
      }}>Verified</h2>
      <p style={{ color: MUTED, fontSize: "0.9rem", fontStyle: "italic", fontWeight: 300 }}>
        Redirecting…
      </p>
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
        display: "flex", alignItems: "center", justifyContent: "center",
        gap: "0.75rem", width: "100%", height: "56px",
        background: hovered ? CHARCOAL : "transparent",
        color: loading ? `rgba(200,169,106,0.5)` : hovered ? CREAM : GOLD,
        border: `1px solid ${loading ? `rgba(200,169,106,0.2)` : hovered ? CHARCOAL : `rgba(200,169,106,0.55)`}`,
        borderRadius: 0,
        fontFamily: "sans-serif", fontSize: "0.6rem",
        fontWeight: 600, letterSpacing: "0.3em", textTransform: "uppercase",
        cursor: loading ? "not-allowed" : "pointer",
        transition: "all 0.25s ease", outline: "none",
      }}
    >
      {loading ? "Verifying…" : (
        <>
          Verify Code
          <span style={{
            display: "inline-block",
            transition: "transform 0.3s ease",
            transform: hovered ? "translateX(5px)" : "none",
            fontSize: "0.875rem",
          }}>→</span>
        </>
      )}
    </button>
  );
}