import React, { useEffect, useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login, isAuthenticated } from "../services/auth";
import api from "../services/api";   // ← your axios instance

// ─── Decorative helpers ───────────────────────────────────────────────────────

const GoldRule = ({ maxWidth = "12rem" }) => (
  <div style={{ display: "flex", alignItems: "center", gap: "6px", margin: "0 auto 1.75rem", maxWidth }}>
    <div style={{ flex: 1, height: "1px", background: "rgba(200,169,106,0.45)" }} />
    <div style={{ width: "4px", height: "4px", background: "#C8A96A", transform: "rotate(45deg)", flexShrink: 0 }} />
    <div style={{ flex: 1, height: "1px", background: "rgba(200,169,106,0.45)" }} />
  </div>
);

const FieldWrap = ({ children }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: "10px",
      background: "#EDE7D9",
      border: "1.5px solid rgba(200,169,106,0.22)",
      borderRadius: "14px",
      padding: "0.9rem 1.15rem",
      transition: "border-color 0.2s",
    }}
    onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(200,169,106,0.65)")}
    onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(200,169,106,0.22)")}
  >
    {children}
  </div>
);

const inputStyle = {
  flex: 1,
  background: "transparent",
  border: "none",
  outline: "none",
  fontFamily: "'Cormorant Garamond', Georgia, serif",
  fontSize: "1.1rem",
  color: "#3D2F1F",
  lineHeight: 1,
};

const labelStyle = {
  fontFamily: "sans-serif",
  fontSize: "0.55rem",
  letterSpacing: "0.28em",
  textTransform: "uppercase",
  color: "#9E8E7A",
  display: "block",
  marginBottom: "0.4rem",
};

// ─── Small shared components ──────────────────────────────────────────────────

const ErrorBox = ({ message }) => (
  <div style={{
    background: "rgba(200,80,80,0.07)",
    border: "1px solid rgba(200,80,80,0.22)",
    borderRadius: "12px",
    padding: "0.65rem 0.85rem",
    fontFamily: "sans-serif",
    fontSize: "0.6rem",
    letterSpacing: "0.15em",
    color: "#993333",
    textAlign: "center",
    marginBottom: "0.5rem",
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

// ─── Forgot Password Modal ────────────────────────────────────────────────────

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

  // Prevent background scroll while modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  // ── STEP 1: send code ────────────────────────────────────────────
  const handleSendCode = async () => {
    setError("");
    if (!email.trim()) { setError("Please enter your email address."); return; }
    if (!/\S+@\S+\.\S+/.test(email)) { setError("Please enter a valid email address."); return; }
    setLoading(true);
    try {
      await api.post("/forgot-password", { email });
      // api.post throws on non-2xx, so reaching here means success
      setStep("verify");
    } catch (err) {
      // axios puts the FastAPI detail inside err.response.data.detail
      setError(err?.response?.data?.detail || "Failed to send code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── STEP 2: verify code ──────────────────────────────────────────
  const handleCodeChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const next = [...code];
    next[index] = value.slice(-1);
    setCode(next);
    if (value && index < 5) codeRefs.current[index + 1]?.focus();
  };

  const handleCodeKeyDown = (index, e) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      codeRefs.current[index - 1]?.focus();
    }
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
    } finally {
      setLoading(false);
    }
  };

  // ── STEP 3: reset password ───────────────────────────────────────
  const handleResetPassword = async () => {
    setError("");
    if (!newPassword) { setError("Please enter a new password."); return; }
    if (newPassword.length < 8) { setError("Password must be at least 8 characters."); return; }
    if (newPassword !== confirmPassword) { setError("Passwords do not match."); return; }
    setLoading(true);
    try {
      await api.post("/reset-password", {
        email,
        code: code.join(""),
        new_password: newPassword,
      });
      setStep("success");
    } catch (err) {
      setError(err?.response?.data?.detail || "Failed to reset password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── Shared button style ──────────────────────────────────────────
  const primaryBtn = (disabled) => ({
    width: "100%",
    padding: "0.9rem",
    marginTop: "0.4rem",
    background: disabled ? "rgba(28,25,22,0.5)" : "#1C1916",
    border: "1px solid #1C1916",
    borderRadius: "14px",
    fontFamily: "sans-serif",
    fontSize: "0.57rem",
    letterSpacing: "0.28em",
    textTransform: "uppercase",
    color: "#F5F0E8",
    cursor: disabled ? "not-allowed" : "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    transition: "background 0.2s",
  });

  // ── Render steps ─────────────────────────────────────────────────
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
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendCode()}
              placeholder="your@email.com"
              style={inputStyle}
              autoFocus
            />
          </FieldWrap>
        </div>
        {error && <ErrorBox message={error} />}
        <button onClick={handleSendCode} disabled={loading} style={primaryBtn(loading)}>
          {loading ? "Sending..." : "Send Code"}
          {!loading && <ArrowIcon />}
        </button>
      </>
    );

    if (step === "verify") return (
      <>
        <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1rem", fontStyle: "italic", fontWeight: 300, color: "#7A6B5A", lineHeight: 1.7, textAlign: "center", marginBottom: "0.4rem" }}>
          A 6-digit code was sent to
        </p>
        <p style={{ fontFamily: "sans-serif", fontSize: "0.6rem", letterSpacing: "0.15em", color: "#9A7D4A", textAlign: "center", marginBottom: "1.5rem" }}>
          {email}
        </p>
        <GoldRule maxWidth="8rem" />

        {/* Code input boxes */}
        <div style={{ display: "flex", gap: "8px", justifyContent: "center", marginBottom: "1.4rem" }}>
          {code.map((digit, i) => (
            <input
              key={i}
              ref={(el) => (codeRefs.current[i] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleCodeChange(i, e.target.value)}
              onKeyDown={(e) => handleCodeKeyDown(i, e)}
              style={{
                width: "42px",
                height: "52px",
                textAlign: "center",
                background: "#EDE7D9",
                border: `1.5px solid ${digit ? "rgba(200,169,106,0.65)" : "rgba(200,169,106,0.22)"}`,
                borderRadius: "12px",
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: "1.4rem",
                fontWeight: 500,
                color: "#3D2F1F",
                outline: "none",
                transition: "border-color 0.2s",
              }}
            />
          ))}
        </div>

        {error && <ErrorBox message={error} />}
        <button onClick={handleVerifyCode} disabled={loading} style={primaryBtn(loading)}>
          {loading ? "Verifying..." : "Verify Code"}
          {!loading && <ArrowIcon />}
        </button>
        <button
          onClick={handleSendCode}
          disabled={loading}
          style={{ ...primaryBtn(false), marginTop: "0.6rem", background: "transparent", color: "#9A7D4A", border: "1px solid rgba(200,169,106,0.4)" }}
        >
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
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9E8E7A" strokeWidth="1.5" style={{ flexShrink: 0 }}>
                <rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V7a4 4 0 018 0v4" />
              </svg>
              <input
                type={showNew ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                style={inputStyle}
              />
              <EyeToggle show={showNew} onToggle={() => setShowNew((p) => !p)} />
            </FieldWrap>
          </div>
          <div>
            <label style={labelStyle}>Confirm Password</label>
            <FieldWrap>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9E8E7A" strokeWidth="1.5" style={{ flexShrink: 0 }}>
                <rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V7a4 4 0 018 0v4" />
              </svg>
              <input
                type={showConfirm ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                style={inputStyle}
              />
              <EyeToggle show={showConfirm} onToggle={() => setShowConfirm((p) => !p)} />
            </FieldWrap>
          </div>
        </div>
        {error && <ErrorBox message={error} />}
        <button onClick={handleResetPassword} disabled={loading} style={primaryBtn(loading)}>
          {loading ? "Saving..." : "Reset Password"}
          {!loading && <ArrowIcon />}
        </button>
      </>
    );

    if (step === "success") return (
      <div style={{ textAlign: "center" }}>
        <div style={{
          width: "56px", height: "56px", borderRadius: "50%",
          background: "rgba(200,169,106,0.12)", border: "1.5px solid rgba(200,169,106,0.5)",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 1.25rem",
        }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#C8A96A" strokeWidth="2">
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </div>
        <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.05rem", fontStyle: "italic", fontWeight: 300, color: "#7A6B5A", lineHeight: 1.7, marginBottom: "1.5rem" }}>
          Your password has been successfully updated. You may now sign in.
        </p>
        <GoldRule maxWidth="8rem" />
        <button onClick={onClose} style={primaryBtn(false)}>
          Back to Sign In
          <ArrowIcon />
        </button>
      </div>
    );
  };

  const steps = ["email", "verify", "reset", "success"];
  const stepIdx = steps.indexOf(step);

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 100,
        background: "rgba(28,20,10,0.55)",
        backdropFilter: "blur(6px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "1.5rem",
        animation: "fadeIn 0.25s ease",
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <style>{`
        @keyframes fadeIn  { from { opacity: 0; }                        to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      <div
        style={{
          width: "100%", maxWidth: "400px",
          background: "#F5F0E8",
          borderRadius: "20px",
          padding: "2rem 1.8rem",
          position: "relative",
          boxShadow: "0 24px 60px rgba(0,0,0,0.22), 0 0 0 1px rgba(200,169,106,0.15)",
          animation: "slideUp 0.3s ease",
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: "absolute", top: "1rem", right: "1rem",
            background: "none", border: "none", cursor: "pointer",
            color: "#9E8E7A", padding: "4px",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
          <p style={{ fontFamily: "sans-serif", fontSize: "0.5rem", letterSpacing: "0.38em", textTransform: "uppercase", color: "#9E8E7A", marginBottom: "0.6rem" }}>
            Account Recovery
          </p>
          <h2 style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: "clamp(1.1rem, 4vw, 1.5rem)", fontWeight: 700, letterSpacing: "0.04em", color: "#1C1916", lineHeight: 1.1 }}>
            {step === "email"   && "Forgot Password"}
            {step === "verify"  && "Enter Code"}
            {step === "reset"   && "New Password"}
            {step === "success" && "All Done"}
          </h2>
        </div>

        {/* Progress dots — hidden on success screen */}
        {step !== "success" && (
          <div style={{ display: "flex", justifyContent: "center", gap: "6px", marginBottom: "1.5rem" }}>
            {[0, 1, 2].map((i) => (
              <div key={i} style={{
                width: i === stepIdx ? "20px" : "6px",
                height: "6px",
                borderRadius: "3px",
                background: i <= stepIdx ? "#C8A96A" : "rgba(200,169,106,0.25)",
                transition: "all 0.3s ease",
              }} />
            ))}
          </div>
        )}

        {renderContent()}
      </div>
    </div>
  );
}

// ─── Login Page ───────────────────────────────────────────────────────────────

export function LoginPage() {
  const [username, setUsername]       = useState("");
  const [password, setPassword]       = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError]             = useState("");
  const [loading, setLoading]         = useState(false);
  const [showForgot, setShowForgot]   = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const link = document.createElement("link");
    link.rel  = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@400;700;900&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&display=swap";
    document.head.appendChild(link);
    return () => document.head.removeChild(link);
  }, []);

  useEffect(() => {
    if (isAuthenticated()) navigate("/");
  }, [navigate]);

  const validateForm = () => {
    if (!username || !password) { setError("Username and password are required."); return false; }
    setError(""); return true;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    try {
      const data = await login(username, password);
      setLoading(false);
      if (data?.access_token) {
        localStorage.setItem("token", data.access_token);
        localStorage.setItem("role", data.role);
        const routes = {
          admin:              "/admin-dash",
          accountant:         "/accountant-dash",
          marketing_manager:  "/marketing-manager-dash",
          stock_manager:      "/stock-manager-dash",
          deliveryman:        "/deliveryman-dash",
        };
        navigate(routes[data.role] || "/");
      } else {
        setError("Authentication failed.");
      }
    } catch (err) {
      setLoading(false);
      setError(err?.response?.data?.detail || "An error occurred. Please try again later.");
    }
  };

  return (
    <div
      style={{
        minHeight: "100dvh",
        background: "#F5F0E8",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "7rem 1.5rem 4rem",
        fontFamily: "'Cormorant Garamond', Georgia, serif",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Ghost watermark */}
      <div aria-hidden="true" style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none", userSelect: "none" }}>
        <span style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: "clamp(5rem, 22vw, 16rem)", fontWeight: 900, color: "transparent", WebkitTextStroke: "1px rgba(180,148,90,0.05)", letterSpacing: "0.12em", whiteSpace: "nowrap" }}>
          AROOM
        </span>
      </div>

      <div style={{ width: "100%", maxWidth: "420px", position: "relative", zIndex: 1 }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "2.25rem" }}>
          <p style={{ fontFamily: "sans-serif", fontSize: "0.55rem", letterSpacing: "0.38em", textTransform: "uppercase", color: "#9E8E7A", marginBottom: "0.7rem" }}>
            Welcome back
          </p>
          <Link to="/" style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: "1.1rem", fontWeight: 700, letterSpacing: "0.06em", color: "#1C1916", textDecoration: "none", display: "block", marginBottom: "1.5rem" }}>
            ARoom
          </Link>
          <h1 style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: "clamp(1.5rem, 5vw, 2.25rem)", fontWeight: 700, letterSpacing: "0.04em", color: "#1C1916", lineHeight: 1.1, marginBottom: "0.6rem" }}>
            Sign In
          </h1>
          <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.05rem", fontStyle: "italic", fontWeight: 300, color: "#7A6B5A", lineHeight: 1.7 }}>
            Your sanctuary awaits.
          </p>
        </div>

        <GoldRule />

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>

          {/* Username */}
          <div>
            <label style={labelStyle}>Username</label>
            <FieldWrap>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9E8E7A" strokeWidth="1.5" style={{ flexShrink: 0 }}>
                <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
              </svg>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="your username"
                style={inputStyle}
              />
            </FieldWrap>
          </div>

          {/* Password */}
          <div>
            <div style={{ display: "flex", alignItems: "center", marginBottom: "0.4rem" }}>
              <span style={labelStyle}>Password</span>
              <button
                type="button"
                onClick={() => setShowForgot(true)}
                style={{
                  marginLeft: "auto",
                  fontFamily: "sans-serif",
                  fontSize: "0.52rem",
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  color: "#9A7D4A",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                }}
              >
                Forgot?
              </button>
            </div>
            <FieldWrap>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9E8E7A" strokeWidth="1.5" style={{ flexShrink: 0 }}>
                <rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V7a4 4 0 018 0v4" />
              </svg>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={inputStyle}
              />
              <EyeToggle show={showPassword} onToggle={() => setShowPassword((p) => !p)} />
            </FieldWrap>
          </div>

          {error && <ErrorBox message={error} />}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "0.9rem",
              marginTop: "0.4rem",
              background: loading ? "rgba(28,25,22,0.6)" : "#1C1916",
              border: "1px solid #1C1916",
              borderRadius: "14px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              fontFamily: "sans-serif",
              fontSize: "0.57rem",
              letterSpacing: "0.28em",
              textTransform: "uppercase",
              color: "#F5F0E8",
              cursor: loading ? "not-allowed" : "pointer",
              transition: "background 0.2s",
            }}
          >
            {loading ? "Signing in..." : "Sign In"}
            {!loading && <ArrowIcon />}
          </button>

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", margin: "0.2rem 0" }}>
            <div style={{ flex: 1, height: "1px", background: "rgba(200,169,106,0.2)" }} />
            <span style={{ fontFamily: "sans-serif", fontSize: "0.5rem", letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(158,142,122,0.5)" }}>or</span>
            <div style={{ flex: 1, height: "1px", background: "rgba(200,169,106,0.2)" }} />
          </div>

          <button
            type="button"
            onClick={() => navigate("/register")}
            style={{
              width: "100%",
              padding: "0.7rem",
              background: "transparent",
              border: "1px solid rgba(200,169,106,0.4)",
              borderRadius: "14px",
              fontFamily: "sans-serif",
              fontSize: "0.57rem",
              letterSpacing: "0.28em",
              textTransform: "uppercase",
              color: "#9A7D4A",
              cursor: "pointer",
              transition: "background 0.2s",
            }}
          >
            Create Account
          </button>
        </form>

        {/* Footer */}
        <p style={{ textAlign: "center", marginTop: "1.5rem", fontFamily: "sans-serif", fontSize: "0.52rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "#9E8E7A", lineHeight: 1.9 }}>
          By signing in, you agree to our{" "}
          <a href="#" style={{ color: "#9A7D4A", textDecoration: "underline" }}>Terms</a>
          {" & "}
          <a href="#" style={{ color: "#9A7D4A", textDecoration: "underline" }}>Privacy</a>
        </p>

        <div style={{ display: "flex", justifyContent: "center", marginTop: "1.75rem" }}>
          <span style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: "0.5rem", letterSpacing: "0.45em", textTransform: "uppercase", color: "rgba(200,169,106,0.3)" }}>
            enter your sanctuary
          </span>
        </div>
      </div>

      {/* Forgot password modal */}
      {showForgot && <ForgotPasswordModal onClose={() => setShowForgot(false)} />}
    </div>
  );
}