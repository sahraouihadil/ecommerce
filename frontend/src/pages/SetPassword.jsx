import { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import api from "../services/api";

const GOLD = "#C8A96A";
const CHARCOAL = "#1C1916";
const MUTED = "#9E8E7A";
const CREAM = "#FAF8F4";

// === Common animations & styles (mirroring VerifyCode) ===
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@400;700&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&display=swap');

  .digit-input::-webkit-inner-spin-button,
  .digit-input::-webkit-outer-spin-button { -webkit-appearance: none; }
  .digit-input { -moz-appearance: textfield; }

  /* ── entrance animations ── */
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(28px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  @keyframes logoReveal {
    0%   { opacity: 0; letter-spacing: 0.25em; }
    100% { opacity: 1; letter-spacing: 0.08em; }
  }

  @keyframes lineDraw {
    from { width: 0; opacity: 0; }
    to   { width: 2rem; opacity: 1; }
  }

  @keyframes float {
    0%,100% { transform: translateY(0px); }
    50%     { transform: translateY(-6px); }
  }

  /* ── success animations ── */
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

  /* ── error shake ── */
  @keyframes shake {
    0%,100% { transform: translateX(0); }
    18%     { transform: translateX(-9px); }
    36%     { transform: translateX(8px); }
    54%     { transform: translateX(-6px); }
    72%     { transform: translateX(5px); }
    90%     { transform: translateX(-2px); }
  }

  /* ── button shimmer (full code progress style) ── */
  @keyframes shimmer {
    0%   { background-position: -200% center; }
    100% { background-position: 200% center; }
  }

  .verify-logo {
    animation: logoReveal 1s cubic-bezier(0.16,1,0.3,1) both;
  }

  .verify-line {
    animation: lineDraw 0.8s cubic-bezier(0.16,1,0.3,1) both;
  }
`;

// Animated entrance wrapper (identical to VerifyCode)
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

// Password strength indicator (stays elegant)
function PasswordStrength({ password }) {
  const getStrength = (pw) => {
    if (!pw) return { level: 0, label: "", color: "transparent" };
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    if (score <= 1) return { level: 1, label: "Weak", color: "#c0392b" };
    if (score === 2) return { level: 2, label: "Fair", color: "#d4a017" };
    if (score === 3) return { level: 3, label: "Good", color: "#6a8f6a" };
    return { level: 4, label: "Strong", color: GOLD };
  };
  const { level, label, color } = getStrength(password);

  if (!password) return null;

  return (
    <div style={{ marginTop: "0.875rem" }}>
      <div style={{ display: "flex", gap: "4px", marginBottom: "5px" }}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} style={{
            flex: 1,
            height: "2px",
            background: i <= level ? color : `rgba(158,142,122,0.2)`,
            transition: "background 0.3s ease",
          }} />
        ))}
      </div>
      <span style={{
        fontFamily: "sans-serif",
        fontSize: "0.55rem",
        letterSpacing: "0.25em",
        textTransform: "uppercase",
        color: color,
        transition: "color 0.3s ease",
      }}>
        {label}
      </span>
    </div>
  );
}

// Success state component - identical ring + check animation from VerifyCode
function SuccessStateDisplay() {
  return (
    <div style={{ textAlign: "center", padding: "1rem 0 2rem" }}>
      {/* Expanding rings */}
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
        fontSize: "1.5rem", fontWeight: 700,
        color: CHARCOAL, marginBottom: "0.75rem"
      }}>All Set</h2>
      <p style={{ color: MUTED, fontSize: "1rem", fontStyle: "italic", fontWeight: 300 }}>
        Redirecting you to login…
      </p>
    </div>
  );
}

// Main component
export function SetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [focused, setFocused] = useState(null);
  const [shaking, setShaking] = useState(false);   // new: shake animation on error

  const location = useLocation();
  const navigate = useNavigate();
  const userName = location.state?.userName;

  const triggerShake = () => {
    setShaking(true);
    setTimeout(() => setShaking(false), 600);
  };

  const inputStyle = (key) => ({
    width: "100%",
    background: "transparent",
    border: "none",
    borderBottom: `1px solid ${focused === key ? GOLD : "rgba(200,169,106,0.3)"}`,
    padding: "12px 2.5rem 12px 0",
    fontSize: "0.9375rem",
    fontFamily: "'Cormorant Garamond', Georgia, serif",
    color: CHARCOAL,
    outline: "none",
    transition: "border-color 0.25s ease",
    boxSizing: "border-box",
    caretColor: GOLD,
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

  if (!userName) {
    return (
      <div style={{
        fontFamily: "'Cormorant Garamond', Georgia, serif",
        minHeight: "100vh",
        background: CREAM,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
      }}>
        <style>{STYLES}</style>
        <div style={{ textAlign: "center" }}>
          <div style={{
            width: "52px", height: "52px", border: `1px solid rgba(200,169,106,0.3)`,
            borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 1.5rem",
          }}>
            <span style={{ color: GOLD, fontSize: "1.25rem" }}>✕</span>
          </div>
          <p style={{ color: MUTED, fontSize: "1rem", fontStyle: "italic", fontWeight: 300 }}>
            No session found. Please{" "}
            <Link to="/register" style={{ color: CHARCOAL, textDecoration: "underline", textUnderlineOffset: "4px" }}>
              register again
            </Link>.
          </p>
        </div>
      </div>
    );
  }

  const handleSetPassword = async () => {
    if (password !== confirmPassword) {
      setIsError(true);
      setMessage("Passwords do not match.");
      triggerShake();
      return;
    }
    if (password.length < 6) {
      setIsError(true);
      setMessage("Password must be at least 6 characters.");
      triggerShake();
      return;
    }
    try {
      setLoading(true);
      setMessage("");
      const res = await api.post("/set-password", { user_name: userName, password });
      if (res.data.msg) {
        setIsError(false);
        setSuccess(true);
        setMessage(res.data.msg);
        setTimeout(() => navigate("/login"), 1800);
      }
    } catch (err) {
      setIsError(true);
      triggerShake();
      setMessage(err?.response?.data?.detail || "Server Error");
    } finally {
      setLoading(false);
    }
  };

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

        {/* Logo with reveal animation */}
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

        {/* Header with animated gold lines (identical to VerifyCode) */}
        <AnimatedItem delay={80} style={{ textAlign: "center", marginBottom: "3rem" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.875rem", marginBottom: "1.5rem" }}>
            <div className="verify-line" style={{ height: "1px", width: "2rem", background: GOLD, opacity: 0.55, animationDelay: "0.3s" }} />
            <span style={{ fontFamily: "sans-serif", fontSize: "0.5625rem", letterSpacing: "0.4em", textTransform: "uppercase", color: GOLD }}>
              Security
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
            Set Password
          </h1>

          {/* Floating diamond ornament (mirrors VerifyCode) */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.625rem", marginBottom: "1.25rem" }}>
            <div style={{ height: "1px", width: "1.75rem", background: GOLD, opacity: 0.35 }} />
            <div style={{
              width: "5px", height: "5px", background: GOLD, transform: "rotate(45deg)", opacity: 0.6,
              animation: "float 3s ease-in-out infinite",
            }} />
            <div style={{ height: "1px", width: "1.75rem", background: GOLD, opacity: 0.35 }} />
          </div>

          <p style={{ color: MUTED, fontSize: "1rem", fontStyle: "italic", fontWeight: 300, lineHeight: 1.8 }}>
            Choose a strong password to secure your account.
          </p>
        </AnimatedItem>

        {/* Form area with error shake effect */}
        <div style={{
          animation: shaking ? "shake 0.55s cubic-bezier(0.36,0.07,0.19,0.97) both" : "none"
        }}>
          {success ? (
            <SuccessStateDisplay />
          ) : (
            <>
              {/* New Password Field */}
              <AnimatedItem delay={160} style={{ marginBottom: "2.5rem" }}>
                <label style={labelStyle("password")}>New Password</label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showPass ? "text" : "password"}
                    placeholder="Enter password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    onFocus={() => setFocused("password")}
                    onBlur={() => setFocused(null)}
                    style={inputStyle("password")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    style={{
                      position: "absolute",
                      right: 0,
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: MUTED,
                      padding: 0,
                      display: "flex",
                      alignItems: "center",
                      transition: "color 0.2s ease",
                    }}
                    onMouseEnter={e => e.currentTarget.style.color = GOLD}
                    onMouseLeave={e => e.currentTarget.style.color = MUTED}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>
                      {showPass ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                </div>
                <PasswordStrength password={password} />
              </AnimatedItem>

              {/* Confirm Password Field */}
              <AnimatedItem delay={240} style={{ marginBottom: "2.5rem" }}>
                <label style={labelStyle("confirm")}>Confirm Password</label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showConfirm ? "text" : "password"}
                    placeholder="Confirm password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    onFocus={() => setFocused("confirm")}
                    onBlur={() => setFocused(null)}
                    style={{
                      ...inputStyle("confirm"),
                      borderColor: confirmPassword && password !== confirmPassword
                        ? "rgba(192,57,43,0.5)"
                        : confirmPassword && password === confirmPassword
                          ? "rgba(90,138,106,0.5)"
                          : focused === "confirm" ? GOLD : "rgba(200,169,106,0.3)",
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    style={{
                      position: "absolute",
                      right: 0,
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: MUTED,
                      padding: 0,
                      display: "flex",
                      alignItems: "center",
                      transition: "color 0.2s ease",
                    }}
                    onMouseEnter={e => e.currentTarget.style.color = GOLD}
                    onMouseLeave={e => e.currentTarget.style.color = MUTED}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>
                      {showConfirm ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                </div>
                {confirmPassword && (
                  <div style={{ marginTop: "0.5rem" }}>
                    <span style={{
                      fontFamily: "sans-serif",
                      fontSize: "0.55rem",
                      letterSpacing: "0.25em",
                      textTransform: "uppercase",
                      color: password === confirmPassword ? "#5a8a6a" : "#c0392b",
                      transition: "color 0.25s ease",
                    }}>
                      {password === confirmPassword ? "Passwords match" : "Passwords do not match"}
                    </span>
                  </div>
                )}
              </AnimatedItem>

              {/* Error / info message */}
              {message && !success && (
                <AnimatedItem delay={0} style={{ marginBottom: "1.75rem" }}>
                  <p style={{
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

              {/* Submit Button (style matches VerifyButton) */}
              <AnimatedItem delay={320}>
                <SetPasswordButton
                  onClick={handleSetPassword}
                  loading={loading}
                  disabled={!password || !confirmPassword || loading}
                />
              </AnimatedItem>

              {/* Hint text */}
              <AnimatedItem delay={400} style={{ textAlign: "center", marginTop: "1.75rem" }}>
                <p style={{
                  fontFamily: "sans-serif",
                  fontSize: "0.55rem",
                  letterSpacing: "0.25em",
                  textTransform: "uppercase",
                  color: `rgba(158,142,122,0.5)`,
                }}>
                  Use letters, numbers &amp; symbols for best security
                </p>
              </AnimatedItem>
            </>
          )}
        </div>

        {/* Bottom ornament with float animation */}
        <AnimatedItem delay={480} style={{ textAlign: "center", marginTop: "3rem" }}>
          <span style={{
            fontFamily: "'Cinzel Decorative', serif",
            fontSize: "0.5rem",
            letterSpacing: "0.5em",
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

// Button component – exactly mirrors VerifyButton styling + hover/arrow transition
function SetPasswordButton({ onClick, loading, disabled }) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "0.75rem",
        width: "100%",
        height: "56px",
        background: disabled ? "transparent" : hovered ? CHARCOAL : "transparent",
        color: disabled
          ? `rgba(200,169,106,0.3)`
          : loading
            ? `rgba(200,169,106,0.5)`
            : hovered
              ? CREAM
              : GOLD,
        border: `1px solid ${disabled
            ? `rgba(200,169,106,0.15)`
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
        cursor: disabled ? "not-allowed" : "pointer",
        transition: "all 0.25s ease",
        outline: "none",
      }}
    >
      {loading ? "Saving…" : (
        <>
          Set Password
          <span style={{
            display: "inline-block",
            transition: "transform 0.3s ease",
            transform: hovered && !disabled ? "translateX(5px)" : "none",
            fontSize: "0.875rem",
          }}>
            →
          </span>
        </>
      )}
    </button>
  );
}