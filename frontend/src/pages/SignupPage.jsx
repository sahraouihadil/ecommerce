import { Link } from "react-router-dom";
import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { register } from "../services/auth";

// ── Shared animation CSS ───────────────────────────────────────────
const AUTH_ANIM_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@400;700;900&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&display=swap');

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(24px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes slideUp {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes watermarkDrift {
    0%   { transform: translateX(0) translateY(0) rotate(-2deg); }
    50%  { transform: translateX(6px) translateY(-4px) rotate(-2deg); }
    100% { transform: translateX(0) translateY(0) rotate(-2deg); }
  }
  @keyframes lineGrow {
    from { transform: scaleX(0); opacity: 0; }
    to   { transform: scaleX(1); opacity: 1; }
  }
  @keyframes shimmer {
    0%   { background-position: -200% center; }
    100% { background-position: 200% center; }
  }

  /* stagger classes */
  .au-d1 { animation: fadeUp 0.45s cubic-bezier(0.16,1,0.3,1) 0.05s both; }
  .au-d2 { animation: fadeUp 0.45s cubic-bezier(0.16,1,0.3,1) 0.13s both; }
  .au-d3 { animation: fadeUp 0.45s cubic-bezier(0.16,1,0.3,1) 0.21s both; }
  .au-d4 { animation: fadeUp 0.45s cubic-bezier(0.16,1,0.3,1) 0.29s both; }
  .au-d5 { animation: fadeUp 0.45s cubic-bezier(0.16,1,0.3,1) 0.37s both; }
  .au-d6 { animation: fadeUp 0.45s cubic-bezier(0.16,1,0.3,1) 0.45s both; }
  .au-d7 { animation: fadeUp 0.45s cubic-bezier(0.16,1,0.3,1) 0.53s both; }
  .au-d8 { animation: fadeUp 0.45s cubic-bezier(0.16,1,0.3,1) 0.61s both; }

  .au-rule {
    animation: lineGrow 0.55s cubic-bezier(0.16,1,0.3,1) 0.25s both;
    transform-origin: left;
  }

  /* field hover glow */
  .auth-field:focus-within {
    border-color: rgba(200,169,106,0.65) !important;
    box-shadow: 0 0 0 3px rgba(200,169,106,0.08);
  }

  /* submit button shimmer on hover */
  .auth-submit:hover {
    background: linear-gradient(90deg, #1C1916, #3D2F1F, #1C1916) !important;
    background-size: 200% !important;
    animation: shimmer 1.2s ease infinite !important;
  }

  /* watermark slow drift */
  .auth-watermark {
    animation: watermarkDrift 8s ease-in-out infinite;
  }
`;

// ── Shared helpers ─────────────────────────────────────────────────
const GoldRule = ({ maxWidth = "12rem" }) => (
  <div className="au-rule" style={{ display: "flex", alignItems: "center", gap: "6px", margin: "0 auto 1.75rem", maxWidth }}>
    <div style={{ flex: 1, height: "1px", background: "rgba(200,169,106,0.45)" }} />
    <div style={{ width: "4px", height: "4px", background: "#C8A96A", transform: "rotate(45deg)", flexShrink: 0 }} />
    <div style={{ flex: 1, height: "1px", background: "rgba(200,169,106,0.45)" }} />
  </div>
);

const FieldWrap = ({ children }) => (
  <div
    className="auth-field"
    style={{
      display: "flex", alignItems: "center", gap: "10px",
      background: "#EDE7D9",
      border: "1.5px solid rgba(200,169,106,0.22)",
      borderRadius: "14px",
      padding: "0.9rem 1.15rem",
      transition: "border-color 0.25s, box-shadow 0.25s",
    }}
  >
    {children}
  </div>
);

const inputStyle = {
  flex: 1, background: "transparent", border: "none", outline: "none",
  fontFamily: "'Cormorant Garamond', Georgia, serif",
  fontSize: "1.1rem", color: "#3D2F1F", lineHeight: 1,
};

const labelStyle = {
  fontFamily: "sans-serif", fontSize: "0.55rem",
  letterSpacing: "0.28em", textTransform: "uppercase",
  color: "#9E8E7A", display: "block", marginBottom: "0.4rem",
};

const ErrorBox = ({ message }) => (
  <div style={{
    background: "rgba(200,80,80,0.07)", border: "1px solid rgba(200,80,80,0.22)",
    borderRadius: "12px", padding: "0.65rem 0.85rem",
    fontFamily: "sans-serif", fontSize: "0.6rem", letterSpacing: "0.15em",
    color: "#993333", textAlign: "center",
    animation: "fadeIn 0.25s ease",
  }}>
    {message}
  </div>
);

const ArrowIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
);

const EyeToggle = ({ show, onToggle }) => (
  <button type="button" onClick={onToggle} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, flexShrink: 0 }}>
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9E8E7A" strokeWidth="1.5">
      {show
        ? <><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></>
        : <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></>
      }
    </svg>
  </button>
);

// ── Shared page shell ──────────────────────────────────────────────
function AuthShell({ children }) {
  return (
    <div style={{
      minHeight: "100dvh", background: "#F5F0E8",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "7rem 1.5rem 4rem",
      fontFamily: "'Cormorant Garamond', Georgia, serif",
      position: "relative", overflow: "hidden",
    }}>
      <style>{AUTH_ANIM_CSS}</style>

      {/* Animated ghost watermark */}
      <div aria-hidden="true" className="auth-watermark" style={{
        position: "absolute", inset: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
        pointerEvents: "none", userSelect: "none",
      }}>
        <span style={{
          fontFamily: "'Cinzel Decorative', serif",
          fontSize: "clamp(5rem, 22vw, 16rem)", fontWeight: 900,
          color: "transparent",
          WebkitTextStroke: "1px rgba(180,148,90,0.05)",
          letterSpacing: "0.12em", whiteSpace: "nowrap",
        }}>
          AROOM
        </span>
      </div>

      {/* Subtle radial glow */}
      <div aria-hidden="true" style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(200,169,106,0.04) 0%, transparent 70%)",
        animation: "fadeIn 1.2s ease 0.1s both",
      }} />

      <div style={{ width: "100%", maxWidth: "420px", position: "relative", zIndex: 1 }}>
        {children}
      </div>
    </div>
  );
}

// ── Forgot Password Modal ──────────────────────────────────────────
import api from "../services/api";

function ForgotPasswordModal({ onClose }) {
  const [step, setStep] = useState("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const codeRefs = useRef([]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const handleSendCode = async () => {
    setError("");
    if (!email.trim()) { setError("Please enter your email address."); return; }
    if (!/\S+@\S+\.\S+/.test(email)) { setError("Please enter a valid email address."); return; }
    setLoading(true);
    try {
      await api.post("/forgot-password", { email });
      setStep("verify");
    } catch (err) {
      setError(err?.response?.data?.detail || "Failed to send code. Please try again.");
    } finally { setLoading(false); }
  };

  const handleCodeChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const next = [...code];
    next[index] = value.slice(-1);
    setCode(next);
    if (value && index < 5) codeRefs.current[index + 1]?.focus();
  };

  const handleCodeKeyDown = (index, e) => {
    if (e.key === "Backspace" && !code[index] && index > 0) codeRefs.current[index - 1]?.focus();
  };

  const handleVerifyCode = async () => {
    setError("");
    const fullCode = code.join("");
    if (fullCode.length < 6) { setError("Please enter the complete 6-digit code."); return; }
    setLoading(true);
    try {
      await api.post("/verify-reset-code", { email, code: fullCode });
      setStep("reset");
    } catch (err) {
      setError(err?.response?.data?.detail || "Invalid or expired code.");
    } finally { setLoading(false); }
  };

  const handleResetPassword = async () => {
    setError("");
    if (!newPassword) { setError("Please enter a new password."); return; }
    if (newPassword.length < 8) { setError("Password must be at least 8 characters."); return; }
    if (newPassword !== confirmPassword) { setError("Passwords do not match."); return; }
    setLoading(true);
    try {
      await api.post("/reset-password", { email, code: code.join(""), new_password: newPassword });
      setStep("success");
    } catch (err) {
      setError(err?.response?.data?.detail || "Failed to reset password.");
    } finally { setLoading(false); }
  };

  const primaryBtn = (disabled) => ({
    width: "100%", padding: "0.9rem", marginTop: "0.4rem",
    background: disabled ? "rgba(28,25,22,0.5)" : "#1C1916",
    border: "1px solid #1C1916", borderRadius: "14px",
    fontFamily: "sans-serif", fontSize: "0.57rem",
    letterSpacing: "0.28em", textTransform: "uppercase",
    color: "#F5F0E8", cursor: disabled ? "not-allowed" : "pointer",
    display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
    transition: "background 0.2s",
  });

  const renderContent = () => {
    if (step === "email") return (
      <>
        <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1rem", fontStyle: "italic", fontWeight: 300, color: "#7A6B5A", lineHeight: 1.7, textAlign: "center", marginBottom: "1.5rem" }}>
          Enter the email linked to your account and we'll send you a verification code.
        </p>
        <GoldRule maxWidth="8rem" />
        <div style={{ marginBottom: "1.1rem" }}>
          <label style={labelStyle}>Email Address</label>
          <FieldWrap>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9E8E7A" strokeWidth="1.5" style={{ flexShrink: 0 }}>
              <rect x="2" y="4" width="20" height="16" rx="2" /><path d="M2 7l10 7 10-7" />
            </svg>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSendCode()} placeholder="your@email.com" style={inputStyle} autoFocus />
          </FieldWrap>
        </div>
        {error && <ErrorBox message={error} />}
        <button onClick={handleSendCode} disabled={loading} style={primaryBtn(loading)}>
          {loading ? "Sending..." : "Send Code"}{!loading && <ArrowIcon />}
        </button>
      </>
    );

    if (step === "verify") return (
      <>
        <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1rem", fontStyle: "italic", fontWeight: 300, color: "#7A6B5A", lineHeight: 1.7, textAlign: "center", marginBottom: "0.4rem" }}>
          A 6-digit code was sent to
        </p>
        <p style={{ fontFamily: "sans-serif", fontSize: "0.6rem", letterSpacing: "0.15em", color: "#9A7D4A", textAlign: "center", marginBottom: "1.5rem" }}>{email}</p>
        <GoldRule maxWidth="8rem" />
        <div style={{ display: "flex", gap: "8px", justifyContent: "center", marginBottom: "1.4rem" }}>
          {code.map((digit, i) => (
            <input key={i} ref={el => (codeRefs.current[i] = el)} type="text" inputMode="numeric" maxLength={1} value={digit}
              onChange={e => handleCodeChange(i, e.target.value)}
              onKeyDown={e => handleCodeKeyDown(i, e)}
              style={{ width: "42px", height: "52px", textAlign: "center", background: "#EDE7D9", border: `1.5px solid ${digit ? "rgba(200,169,106,0.65)" : "rgba(200,169,106,0.22)"}`, borderRadius: "12px", fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "1.4rem", fontWeight: 500, color: "#3D2F1F", outline: "none", transition: "border-color 0.2s" }}
            />
          ))}
        </div>
        {error && <ErrorBox message={error} />}
        <button onClick={handleVerifyCode} disabled={loading} style={primaryBtn(loading)}>
          {loading ? "Verifying..." : "Verify Code"}{!loading && <ArrowIcon />}
        </button>
        <button onClick={handleSendCode} disabled={loading} style={{ ...primaryBtn(false), marginTop: "0.6rem", background: "transparent", color: "#9A7D4A", border: "1px solid rgba(200,169,106,0.4)" }}>
          Resend Code
        </button>
      </>
    );

    if (step === "reset") return (
      <>
        <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1rem", fontStyle: "italic", fontWeight: 300, color: "#7A6B5A", lineHeight: 1.7, textAlign: "center", marginBottom: "1.5rem" }}>
          Choose a new password for your account.
        </p>
        <GoldRule maxWidth="8rem" />
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "1rem" }}>
          <div>
            <label style={labelStyle}>New Password</label>
            <FieldWrap>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9E8E7A" strokeWidth="1.5" style={{ flexShrink: 0 }}><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V7a4 4 0 018 0v4" /></svg>
              <input type={showNew ? "text" : "password"} value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="••••••••" style={inputStyle} />
              <EyeToggle show={showNew} onToggle={() => setShowNew(p => !p)} />
            </FieldWrap>
          </div>
          <div>
            <label style={labelStyle}>Confirm Password</label>
            <FieldWrap>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9E8E7A" strokeWidth="1.5" style={{ flexShrink: 0 }}><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V7a4 4 0 018 0v4" /></svg>
              <input type={showConfirm ? "text" : "password"} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="••••••••" style={inputStyle} />
              <EyeToggle show={showConfirm} onToggle={() => setShowConfirm(p => !p)} />
            </FieldWrap>
          </div>
        </div>
        {error && <ErrorBox message={error} />}
        <button onClick={handleResetPassword} disabled={loading} style={primaryBtn(loading)}>
          {loading ? "Saving..." : "Reset Password"}{!loading && <ArrowIcon />}
        </button>
      </>
    );

    if (step === "success") return (
      <div style={{ textAlign: "center" }}>
        <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: "rgba(200,169,106,0.12)", border: "1.5px solid rgba(200,169,106,0.5)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.25rem", animation: "fadeIn 0.5s ease" }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#C8A96A" strokeWidth="2"><path d="M20 6L9 17l-5-5" /></svg>
        </div>
        <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.05rem", fontStyle: "italic", fontWeight: 300, color: "#7A6B5A", lineHeight: 1.7, marginBottom: "1.5rem" }}>
          Your password has been successfully updated. You may now sign in.
        </p>
        <GoldRule maxWidth="8rem" />
        <button onClick={onClose} style={primaryBtn(false)}>Back to Sign In<ArrowIcon /></button>
      </div>
    );
  };

  const steps = ["email", "verify", "reset", "success"];
  const stepIdx = steps.indexOf(step);

  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(28,20,10,0.55)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "1.5rem", animation: "fadeIn 0.25s ease" }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{ width: "100%", maxWidth: "400px", background: "#F5F0E8", borderRadius: "20px", padding: "2rem 1.8rem", position: "relative", boxShadow: "0 24px 60px rgba(0,0,0,0.22), 0 0 0 1px rgba(200,169,106,0.15)", animation: "slideUp 0.3s ease" }}>
        <button onClick={onClose} style={{ position: "absolute", top: "1rem", right: "1rem", background: "none", border: "none", cursor: "pointer", color: "#9E8E7A", padding: "4px", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
        </button>
        <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
          <p style={{ fontFamily: "sans-serif", fontSize: "0.5rem", letterSpacing: "0.38em", textTransform: "uppercase", color: "#9E8E7A", marginBottom: "0.6rem" }}>Account Recovery</p>
          <h2 style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: "clamp(1.1rem, 4vw, 1.5rem)", fontWeight: 700, letterSpacing: "0.04em", color: "#1C1916", lineHeight: 1.1 }}>
            {step === "email" && "Forgot Password"}
            {step === "verify" && "Enter Code"}
            {step === "reset" && "New Password"}
            {step === "success" && "All Done"}
          </h2>
        </div>
        {step !== "success" && (
          <div style={{ display: "flex", justifyContent: "center", gap: "6px", marginBottom: "1.5rem" }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{ width: i === stepIdx ? "20px" : "6px", height: "6px", borderRadius: "3px", background: i <= stepIdx ? "#C8A96A" : "rgba(200,169,106,0.25)", transition: "all 0.3s ease" }} />
            ))}
          </div>
        )}
        {renderContent()}
      </div>
    </div>
  );
}

// ── SignupPage ─────────────────────────────────────────────────────
export function SignupPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNum, setPhoneNum] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validateForm = () => {
    if (!username || !password || !email) { setError("Full name, email and password are required."); return false; }
    setError(""); return true;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    try {
      const data = await register(username, password, email, phoneNum);
      setLoading(false);
      if (data.action === "verify") { navigate("/verify-code", { state: { email } }); return; }
      if (data.access_token) {
        localStorage.setItem("token", data.access_token);
        localStorage.setItem("role", data.role || "customer");
        navigate("/");
      }
    } catch (err) {
      setLoading(false);
      setError(err?.response?.data?.detail || "An error occurred. Please try again later.");
    }
  };

  return (
    <AuthShell>
      {/* Header */}
      <div className="au-d1" style={{ textAlign: "center", marginBottom: "2.25rem" }}>
        <Link to="/" style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: "1.1rem", fontWeight: 700, letterSpacing: "0.06em", color: "#1C1916", textDecoration: "none", display: "block", marginBottom: "1.5rem" }}>
          ARoom
        </Link>
        <h1 style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: "clamp(1.4rem, 5vw, 2.1rem)", fontWeight: 700, letterSpacing: "0.04em", color: "#1C1916", lineHeight: 1.1, marginBottom: "0.6rem" }}>
          Create Account
        </h1>
        <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.05rem", fontStyle: "italic", fontWeight: 300, color: "#7A6B5A", lineHeight: 1.7 }}>
          Preview furniture in your room with AR.
        </p>
      </div>

      <GoldRule />

      {/* Form fields — each staggered */}
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.05rem" }}>
        <div className="au-d2">
          <label style={labelStyle}>Full name</label>
          <FieldWrap>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9E8E7A" strokeWidth="1.5" style={{ flexShrink: 0 }}><circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" /></svg>
            <input type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder="your full name" style={inputStyle} />
          </FieldWrap>
        </div>

        <div className="au-d3">
          <label style={labelStyle}>Email</label>
          <FieldWrap>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9E8E7A" strokeWidth="1.5" style={{ flexShrink: 0 }}><rect x="2" y="4" width="20" height="16" rx="2" /><path d="M2 7l10 7 10-7" /></svg>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" style={inputStyle} />
          </FieldWrap>
        </div>

        <div className="au-d4">
          <label style={labelStyle}>Password</label>
          <FieldWrap>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9E8E7A" strokeWidth="1.5" style={{ flexShrink: 0 }}><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V7a4 4 0 018 0v4" /></svg>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" style={inputStyle} />
          </FieldWrap>
        </div>

        <div className="au-d5">
          <label style={labelStyle}>
            Phone{" "}
            <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "0.85rem", fontStyle: "italic", letterSpacing: 0, textTransform: "none", color: "rgba(158,142,122,0.55)" }}>— optional</span>
          </label>
          <FieldWrap>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9E8E7A" strokeWidth="1.5" style={{ flexShrink: 0 }}><path d="M22 16.9v3a2 2 0 01-2.2 2A19.8 19.8 0 013.1 4.2 2 2 0 015.1 2h3a2 2 0 012 1.7c.1.9.4 1.8.7 2.6a2 2 0 01-.5 2.1L9.1 9.6a16 16 0 006.3 6.3l1.2-1.2a2 2 0 012.1-.5c.8.3 1.7.6 2.6.7A2 2 0 0122 16.9z" /></svg>
            <input type="text" value={phoneNum} onChange={e => setPhoneNum(e.target.value)} placeholder="+213 ..." style={inputStyle} />
          </FieldWrap>
        </div>

        {error && <div className="au-d6"><ErrorBox message={error} /></div>}

        <div className="au-d6">
          <button type="submit" disabled={loading} className="auth-submit"
            style={{ width: "100%", padding: "0.9rem", marginTop: "0.3rem", background: loading ? "rgba(28,25,22,0.6)" : "#1C1916", border: "1px solid #1C1916", borderRadius: "14px", fontFamily: "sans-serif", fontSize: "0.57rem", letterSpacing: "0.28em", textTransform: "uppercase", color: "#F5F0E8", cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", transition: "background 0.2s" }}>
            {loading ? "Creating account..." : <><span>Create Account</span><ArrowIcon /></>}
          </button>
        </div>
      </form>

      <p className="au-d7" style={{ textAlign: "center", marginTop: "1.5rem", fontFamily: "sans-serif", fontSize: "0.52rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "#9E8E7A" }}>
        Already a member?{" "}
        <Link to="/login" style={{ color: "#9A7D4A", textDecoration: "none" }}>Sign in</Link>
      </p>

      <div className="au-d8" style={{ display: "flex", justifyContent: "center", marginTop: "1.75rem" }}>
        <span style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: "0.5rem", letterSpacing: "0.45em", textTransform: "uppercase", color: "rgba(200,169,106,0.3)" }}>
          enter your sanctuary
        </span>
      </div>
    </AuthShell>
  );
}