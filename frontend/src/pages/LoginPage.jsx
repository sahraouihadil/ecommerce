import React, { useEffect, useState, useRef } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { login, isAuthenticated } from "../services/auth";
import api from "../services/api";

const KEYFRAMES = `
  @keyframes fadeUp       { from { opacity:0; transform:translateY(22px);    } to { opacity:1; transform:none;           } }
  @keyframes fadeIn       { from { opacity:0;                                } to { opacity:1;                           } }
  @keyframes slideInLeft  { from { opacity:0; transform:translateX(-18px);   } to { opacity:1; transform:none;           } }
  @keyframes scaleIn      { from { opacity:0; transform:scale(0.88);         } to { opacity:1; transform:scale(1);       } }
  @keyframes shake        { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-6px)} 40%{transform:translateX(6px)} 60%{transform:translateX(-4px)} 80%{transform:translateX(4px)} }
  @keyframes drawRule     { from { transform:scaleX(0); opacity:0; }           to { transform:scaleX(1); opacity:1;      } }
  @keyframes floatY       { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-14px)} }
  @keyframes goldShimmer  { 0%{background-position:200% center} 100%{background-position:-200% center} }
  @keyframes spin         { to { transform:rotate(360deg); } }
  @keyframes slideUp      { from { opacity:0; transform:translateY(20px); }    to { opacity:1; transform:translateY(0);  } }
  @keyframes pulseRing    { 0%  { box-shadow:0 0 0 0   rgba(200,169,106,0.35); }
                            70% { box-shadow:0 0 0 10px rgba(200,169,106,0);   }
                            100%{ box-shadow:0 0 0 0   rgba(200,169,106,0);    } }
  @keyframes dotExpand    { from { width:6px; } to { width:20px; } }
`;

const GoldRule = ({ maxWidth = "12rem", delay = 0 }) => (
  <div style={{
    display: "flex", alignItems: "center", gap: "6px",
    margin: "0 auto 1.75rem", maxWidth,
    transformOrigin: "left center",
    animation: `drawRule 0.7s cubic-bezier(0.22,1,0.36,1) ${delay}ms both`,
  }}>
    <div style={{ flex: 1, height: "1px", background: "rgba(200,169,106,0.45)" }} />
    <div style={{ width: "4px", height: "4px", background: "#C8A96A", transform: "rotate(45deg)", flexShrink: 0 }} />
    <div style={{ flex: 1, height: "1px", background: "rgba(200,169,106,0.45)" }} />
  </div>
);

const FieldWrap = ({ children, delay = 0 }) => (
  <div
    style={{
      display: "flex", alignItems: "center", gap: "10px",
      background: "#EDE7D9",
      border: "1.5px solid rgba(200,169,106,0.22)",
      borderRadius: "14px", padding: "0.9rem 1.15rem",
      transition: "border-color 0.2s, box-shadow 0.2s",
      animation: `fadeUp 0.55s ease ${delay}ms both`,
    }}
    onFocus={e => {
      e.currentTarget.style.borderColor = "rgba(200,169,106,0.65)";
      e.currentTarget.style.boxShadow   = "0 0 0 3px rgba(200,169,106,0.1)";
    }}
    onBlur={e => {
      e.currentTarget.style.borderColor = "rgba(200,169,106,0.22)";
      e.currentTarget.style.boxShadow   = "none";
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
    fontFamily: "sans-serif", fontSize: "0.6rem",
    letterSpacing: "0.15em", color: "#993333", textAlign: "center",
    marginBottom: "0.5rem",
    animation: "shake 0.4s ease both",
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
  <button type="button" onClick={onToggle}
    style={{ background: "none", border: "none", cursor: "pointer", padding: 0, flexShrink: 0, transition: "opacity 0.2s" }}
    onMouseEnter={e => e.currentTarget.style.opacity = "0.7"}
    onMouseLeave={e => e.currentTarget.style.opacity = "1"}
  >
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9E8E7A" strokeWidth="1.5">
      {show
        ? <><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></>
        : <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></>
      }
    </svg>
  </button>
);

// ─── Shared error extractor ───────────────────────────────────────────────────
const extractError = (err, fallback) => {
  const detail = err?.response?.data?.detail;
  if (Array.isArray(detail))                         return detail.map(e => e.msg || JSON.stringify(e)).join(", ");
  if (typeof detail === "object" && detail !== null) return detail.msg || JSON.stringify(detail);
  return detail || fallback;
};

// ─── Forgot Password Modal ────────────────────────────────────────────────────

function ForgotPasswordModal({ onClose }) {
  const [step, setStep]                           = useState("email");
  const [username, setUsername]                   = useState("");
  const [email, setEmail]                         = useState("");
  const [code, setCode]                           = useState(["", "", "", "", "", ""]);
  const codeRefs                                  = useRef([]);
  const [newPassword, setNewPassword]             = useState("");
  const [confirmPassword, setConfirmPassword]     = useState("");
  const [showNew, setShowNew]                     = useState(false);
  const [showConfirm, setShowConfirm]             = useState(false);
  const [loading, setLoading]                     = useState(false);
  const [error, setError]                         = useState("");

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  // ── Send code ──────────────────────────────────────────────────────────────
  const handleSendCode = async () => {
    setError("");
    if (!username.trim())             { setError("Please enter your username.");         return; }
    if (!email.trim())                { setError("Please enter your email address.");    return; }
    if (!/\S+@\S+\.\S+/.test(email)) { setError("Please enter a valid email address."); return; }
    setLoading(true);
    try {
      await api.post("/forgot-password", { username: username.trim(), email: email.trim() });
      setStep("verify");
    } catch (err) {
      setError(extractError(err, "Failed to send code. Please try again."));
    } finally { setLoading(false); }
  };

  // ── Code input helpers ─────────────────────────────────────────────────────
  const handleCodeChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const next = [...code]; next[index] = value.slice(-1); setCode(next);
    if (value && index < 5) codeRefs.current[index + 1]?.focus();
  };
  const handleCodeKeyDown = (index, e) => {
    if (e.key === "Backspace" && !code[index] && index > 0)
      codeRefs.current[index - 1]?.focus();
  };

  // ── Verify code ────────────────────────────────────────────────────────────
  const handleVerifyCode = async () => {
    setError("");
    const fullCode = code.join("");
    if (fullCode.length < 6) { setError("Please enter the complete 6-digit code."); return; }
    setLoading(true);
    try {
      await api.post("/verify-reset-code", { email: email.trim(), code: fullCode });
      setStep("reset");
    } catch (err) {
      setError(extractError(err, "Invalid or expired code."));
    } finally { setLoading(false); }
  };

  // ── Reset password ─────────────────────────────────────────────────────────
  const handleResetPassword = async () => {
    setError("");
    if (!newPassword)                    { setError("Please enter a new password.");            return; }
    if (newPassword.length < 8)          { setError("Password must be at least 8 characters."); return; }
    if (newPassword !== confirmPassword) { setError("Passwords do not match.");                  return; }
    setLoading(true);
    try {
      await api.post("/reset-password", {
        email:        email.trim(),
        code:         code.join(""),
        new_password: newPassword,
      });
      setStep("success");
    } catch (err) {
      setError(extractError(err, "Failed to reset password. Please try again."));
    } finally { setLoading(false); }
  };

  const primaryBtn = (disabled) => ({
    width: "100%", padding: "0.9rem", marginTop: "0.4rem",
    background: disabled ? "rgba(28,25,22,0.5)" : "#1C1916",
    border: "1px solid #1C1916", borderRadius: "14px",
    fontFamily: "sans-serif", fontSize: "0.57rem",
    letterSpacing: "0.28em", textTransform: "uppercase", color: "#F5F0E8",
    cursor: disabled ? "not-allowed" : "pointer",
    display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
    transition: "background 0.2s, transform 0.1s",
  });

  const renderContent = () => {

    // ── Step: email + username ───────────────────────────────────────────────
    if (step === "email") return (
      <>
        <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1rem", fontStyle: "italic", fontWeight: 300, color: "#7A6B5A", lineHeight: 1.7, textAlign: "center", marginBottom: "1.5rem", animation: "fadeUp 0.4s ease 0.1s both" }}>
          Enter the username and email linked to your account and we'll send you a verification code.
        </p>
        <GoldRule maxWidth="8rem" delay={200} />

        <div style={{ marginBottom: "1rem", animation: "fadeUp 0.4s ease 0.2s both" }}>
          <label style={labelStyle}>Username</label>
          <FieldWrap>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9E8E7A" strokeWidth="1.5" style={{ flexShrink: 0 }}>
              <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
            </svg>
            <input type="text" value={username} onChange={e => setUsername(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSendCode()}
              placeholder="your username" style={inputStyle} autoFocus />
          </FieldWrap>
        </div>

        <div style={{ marginBottom: "1.1rem", animation: "fadeUp 0.4s ease 0.3s both" }}>
          <label style={labelStyle}>Email Address</label>
          <FieldWrap>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9E8E7A" strokeWidth="1.5" style={{ flexShrink: 0 }}>
              <rect x="2" y="4" width="20" height="16" rx="2" /><path d="M2 7l10 7 10-7" />
            </svg>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSendCode()}
              placeholder="your@email.com" style={inputStyle} />
          </FieldWrap>
        </div>

        {error && <ErrorBox message={error} />}

        <button onClick={handleSendCode} disabled={loading}
          style={{ ...primaryBtn(loading), animation: "fadeUp 0.4s ease 0.4s both" }}
          onMouseEnter={e => { if (!loading) { e.currentTarget.style.background = "#3D2F1F"; e.currentTarget.style.transform = "translateY(-1px)"; }}}
          onMouseLeave={e => { e.currentTarget.style.background = "#1C1916"; e.currentTarget.style.transform = "none"; }}
          onMouseDown={e => { e.currentTarget.style.transform = "scale(0.98)"; }}
          onMouseUp={e => { e.currentTarget.style.transform = "translateY(-1px)"; }}
        >
          {loading ? "Sending..." : "Send Code"} {!loading && <ArrowIcon />}
        </button>
      </>
    );

    // ── Step: verify code ────────────────────────────────────────────────────
    if (step === "verify") return (
      <>
        <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1rem", fontStyle: "italic", fontWeight: 300, color: "#7A6B5A", lineHeight: 1.7, textAlign: "center", marginBottom: "0.4rem", animation: "fadeUp 0.4s ease both" }}>
          A 6-digit code was sent to
        </p>
        <p style={{ fontFamily: "sans-serif", fontSize: "0.6rem", letterSpacing: "0.15em", color: "#9A7D4A", textAlign: "center", marginBottom: "1.5rem", animation: "fadeUp 0.4s ease 0.1s both" }}>
          {email}
        </p>
        <GoldRule maxWidth="8rem" delay={200} />
        <div style={{ display: "flex", gap: "8px", justifyContent: "center", marginBottom: "1.4rem" }}>
          {code.map((digit, i) => (
            <input key={i} ref={el => (codeRefs.current[i] = el)}
              type="text" inputMode="numeric" maxLength={1} value={digit}
              onChange={e => handleCodeChange(i, e.target.value)}
              onKeyDown={e => handleCodeKeyDown(i, e)}
              style={{
                width: "42px", height: "52px", textAlign: "center",
                background: "#EDE7D9",
                border: `1.5px solid ${digit ? "rgba(200,169,106,0.65)" : "rgba(200,169,106,0.22)"}`,
                borderRadius: "12px",
                fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "1.4rem", fontWeight: 500, color: "#3D2F1F",
                outline: "none", transition: "border-color 0.2s, transform 0.15s",
                transform: digit ? "scale(1.06)" : "scale(1)",
                animation: `scaleIn 0.3s cubic-bezier(0.34,1.56,0.64,1) ${i * 60}ms both`,
              }}
            />
          ))}
        </div>
        {error && <ErrorBox message={error} />}
        <button onClick={handleVerifyCode} disabled={loading}
          style={{ ...primaryBtn(loading), animation: "fadeUp 0.4s ease 0.5s both" }}
          onMouseEnter={e => { if (!loading) { e.currentTarget.style.background = "#3D2F1F"; e.currentTarget.style.transform = "translateY(-1px)"; }}}
          onMouseLeave={e => { e.currentTarget.style.background = "#1C1916"; e.currentTarget.style.transform = "none"; }}
        >
          {loading ? "Verifying..." : "Verify Code"} {!loading && <ArrowIcon />}
        </button>
        <button onClick={handleSendCode} disabled={loading}
          style={{ ...primaryBtn(false), marginTop: "0.6rem", background: "transparent", color: "#9A7D4A", border: "1px solid rgba(200,169,106,0.4)", animation: "fadeUp 0.4s ease 0.6s both" }}
        >
          Resend Code
        </button>
      </>
    );

    // ── Step: reset password ─────────────────────────────────────────────────
    if (step === "reset") return (
      <>
        <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1rem", fontStyle: "italic", fontWeight: 300, color: "#7A6B5A", lineHeight: 1.7, textAlign: "center", marginBottom: "1.5rem", animation: "fadeUp 0.4s ease both" }}>
          Choose a new password for your account.
        </p>
        <GoldRule maxWidth="8rem" delay={100} />
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "1rem" }}>
          <div style={{ animation: "fadeUp 0.4s ease 0.2s both" }}>
            <label style={labelStyle}>New Password</label>
            <FieldWrap>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9E8E7A" strokeWidth="1.5" style={{ flexShrink: 0 }}><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V7a4 4 0 018 0v4" /></svg>
              <input type={showNew ? "text" : "password"} value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="••••••••" style={inputStyle} />
              <EyeToggle show={showNew} onToggle={() => setShowNew(p => !p)} />
            </FieldWrap>
          </div>
          <div style={{ animation: "fadeUp 0.4s ease 0.3s both" }}>
            <label style={labelStyle}>Confirm Password</label>
            <FieldWrap>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9E8E7A" strokeWidth="1.5" style={{ flexShrink: 0 }}><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V7a4 4 0 018 0v4" /></svg>
              <input type={showConfirm ? "text" : "password"} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="••••••••" style={inputStyle} />
              <EyeToggle show={showConfirm} onToggle={() => setShowConfirm(p => !p)} />
            </FieldWrap>
          </div>
        </div>
        {error && <ErrorBox message={error} />}
        <button onClick={handleResetPassword} disabled={loading}
          style={{ ...primaryBtn(loading), animation: "fadeUp 0.4s ease 0.4s both" }}
          onMouseEnter={e => { if (!loading) { e.currentTarget.style.background = "#3D2F1F"; e.currentTarget.style.transform = "translateY(-1px)"; }}}
          onMouseLeave={e => { e.currentTarget.style.background = "#1C1916"; e.currentTarget.style.transform = "none"; }}
        >
          {loading ? "Saving..." : "Reset Password"} {!loading && <ArrowIcon />}
        </button>
      </>
    );

    // ── Step: success ────────────────────────────────────────────────────────
    if (step === "success") return (
      <div style={{ textAlign: "center" }}>
        <div style={{
          width: "56px", height: "56px", borderRadius: "50%",
          background: "rgba(200,169,106,0.12)", border: "1.5px solid rgba(200,169,106,0.5)",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 1.25rem",
          animation: "scaleIn 0.5s cubic-bezier(0.34,1.56,0.64,1) both, pulseRing 2s 0.6s infinite",
        }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#C8A96A" strokeWidth="2" style={{ animation: "fadeIn 0.3s ease 0.4s both" }}>
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </div>
        <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.05rem", fontStyle: "italic", fontWeight: 300, color: "#7A6B5A", lineHeight: 1.7, marginBottom: "1.5rem", animation: "fadeUp 0.4s ease 0.3s both" }}>
          Your password has been successfully updated. You may now sign in.
        </p>
        <GoldRule maxWidth="8rem" delay={500} />
        <button onClick={onClose}
          style={{ ...primaryBtn(false), animation: "fadeUp 0.4s ease 0.6s both" }}
          onMouseEnter={e => { e.currentTarget.style.background = "#3D2F1F"; e.currentTarget.style.transform = "translateY(-1px)"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "#1C1916"; e.currentTarget.style.transform = "none"; }}
        >
          Back to Sign In <ArrowIcon />
        </button>
      </div>
    );
  };

  const steps   = ["email", "verify", "reset", "success"];
  const stepIdx = steps.indexOf(step);

  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(28,20,10,0.55)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "1.5rem", animation: "fadeIn 0.25s ease" }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{ width: "100%", maxWidth: "400px", background: "#F5F0E8", borderRadius: "20px", padding: "2rem 1.8rem", position: "relative", boxShadow: "0 24px 60px rgba(0,0,0,0.22), 0 0 0 1px rgba(200,169,106,0.15)", animation: "slideUp 0.3s ease" }}>
        <button onClick={onClose}
          style={{ position: "absolute", top: "1rem", right: "1rem", background: "none", border: "none", cursor: "pointer", color: "#9E8E7A", padding: "4px", display: "flex", alignItems: "center", justifyContent: "center", transition: "color 0.2s, transform 0.2s" }}
          onMouseEnter={e => { e.currentTarget.style.color = "#1C1916"; e.currentTarget.style.transform = "rotate(90deg)"; }}
          onMouseLeave={e => { e.currentTarget.style.color = "#9E8E7A"; e.currentTarget.style.transform = "rotate(0deg)"; }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
        </button>

        <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
          <p style={{ fontFamily: "sans-serif", fontSize: "0.5rem", letterSpacing: "0.38em", textTransform: "uppercase", color: "#9E8E7A", marginBottom: "0.6rem" }}>Account Recovery</p>
          <h2 style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: "clamp(1.1rem, 4vw, 1.5rem)", fontWeight: 700, letterSpacing: "0.04em", color: "#1C1916", lineHeight: 1.1 }}>
            {step === "email"   && "Forgot Password"}
            {step === "verify"  && "Enter Code"}
            {step === "reset"   && "New Password"}
            {step === "success" && "All Done"}
          </h2>
        </div>

        {step !== "success" && (
          <div style={{ display: "flex", justifyContent: "center", gap: "6px", marginBottom: "1.5rem" }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{
                width: i === stepIdx ? "20px" : "6px", height: "6px", borderRadius: "3px",
                background: i <= stepIdx ? "#C8A96A" : "rgba(200,169,106,0.25)",
                transition: "all 0.4s cubic-bezier(0.34,1.56,0.64,1)",
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
  const [username, setUsername]         = useState("");
  const [password, setPassword]         = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError]               = useState("");
  const [loading, setLoading]           = useState(false);
  const [showForgot, setShowForgot]     = useState(false);
  const [mounted, setMounted]           = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const message  = location.state?.message;

  useEffect(() => {
    const link = document.createElement("link");
    link.rel  = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@400;700;900&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&display=swap";
    document.head.appendChild(link);
    return () => document.head.removeChild(link);
  }, []);

  useEffect(() => { setTimeout(() => setMounted(true), 60); }, []);
  useEffect(() => { if (isAuthenticated()) navigate("/"); }, [navigate]);

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
        const routes = { admin: "/admin-dash", accountant: "/accountant-dash", marketing_manager: "/marketing-manager-dash", stock_manager: "/stock-manager-dash", deliveryman: "/deliveryman-dash" };
        navigate(routes[data.role] || "/");
      } else { setError("Authentication failed."); }
    } catch (err) {
      setLoading(false);
      setError(extractError(err, "An error occurred. Please try again later."));
    }
  };

  return (
    <div style={{
      minHeight: "100dvh", background: "#F5F0E8",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "7rem 1.5rem 4rem",
      fontFamily: "'Cormorant Garamond', Georgia, serif",
      position: "relative", overflow: "hidden",
    }}>
      <style>{KEYFRAMES}</style>

      <div aria-hidden="true" style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none", userSelect: "none" }}>
        <span style={{
          fontFamily: "'Cinzel Decorative', serif",
          fontSize: "clamp(5rem, 22vw, 16rem)", fontWeight: 900,
          color: "transparent", WebkitTextStroke: "1px rgba(180,148,90,0.05)",
          letterSpacing: "0.12em", whiteSpace: "nowrap",
          animation: "floatY 8s ease-in-out infinite",
        }}>AROOM</span>
      </div>

      <div aria-hidden="true" style={{ position: "absolute", top: "2rem", left: "2rem", width: "40px", height: "40px", borderTop: "1px solid rgba(200,169,106,0.18)", borderLeft: "1px solid rgba(200,169,106,0.18)", animation: "fadeIn 1s ease 0.8s both" }} />
      <div aria-hidden="true" style={{ position: "absolute", bottom: "2rem", right: "2rem", width: "40px", height: "40px", borderBottom: "1px solid rgba(200,169,106,0.18)", borderRight: "1px solid rgba(200,169,106,0.18)", animation: "fadeIn 1s ease 0.9s both" }} />

      <div style={{ width: "100%", maxWidth: "420px", position: "relative", zIndex: 1 }}>
        <div style={{ textAlign: "center", marginBottom: "2.25rem" }}>
          <p style={{ fontFamily: "sans-serif", fontSize: "0.55rem", letterSpacing: "0.38em", textTransform: "uppercase", color: "#9E8E7A", marginBottom: "0.7rem", animation: "fadeUp 0.6s ease 0ms both" }}>
            Welcome back
          </p>
          <Link to="/" style={{
            fontFamily: "'Cinzel Decorative', serif", fontSize: "1.1rem", fontWeight: 700,
            letterSpacing: "0.06em", textDecoration: "none", display: "block", marginBottom: "1.5rem",
            background: "linear-gradient(90deg, #9A7D4A 0%, #C8A96A 40%, #E8D49A 50%, #C8A96A 60%, #9A7D4A 100%)",
            backgroundSize: "200% auto",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            animation: "fadeUp 0.6s ease 80ms both, goldShimmer 3s linear 1s infinite",
          }}>ARoom</Link>
          <h1 style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: "clamp(1.5rem, 5vw, 2.25rem)", fontWeight: 700, letterSpacing: "0.04em", color: "#1C1916", lineHeight: 1.1, marginBottom: "0.6rem", animation: "fadeUp 0.6s ease 160ms both" }}>
            Sign In
          </h1>
          <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.05rem", fontStyle: "italic", fontWeight: 300, color: "#7A6B5A", lineHeight: 1.7, animation: "fadeUp 0.6s ease 240ms both" }}>
            Your sanctuary awaits.
          </p>
        </div>

        <GoldRule delay={320} />

        {message && (
          <div style={{
            background: "rgba(200,169,106,0.1)", border: "1px solid rgba(200,169,106,0.4)",
            borderRadius: "12px", padding: "0.75rem 1.25rem", marginBottom: "1rem",
            fontFamily: "sans-serif", fontSize: "0.62rem", letterSpacing: "0.12em",
            color: "#9A7D4A", textAlign: "center",
            animation: "fadeUp 0.5s ease both",
          }}>
            ✦ {message}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>
          <div style={{ animation: "fadeUp 0.55s ease 400ms both" }}>
            <label style={labelStyle}>Username</label>
            <FieldWrap>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9E8E7A" strokeWidth="1.5" style={{ flexShrink: 0 }}><circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" /></svg>
              <input type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder="your username" style={inputStyle} />
            </FieldWrap>
          </div>

          <div style={{ animation: "fadeUp 0.55s ease 480ms both" }}>
            <div style={{ display: "flex", alignItems: "center", marginBottom: "0.4rem" }}>
              <span style={labelStyle}>Password</span>
              <button type="button" onClick={() => setShowForgot(true)} style={{
                marginLeft: "auto", fontFamily: "sans-serif", fontSize: "0.52rem",
                letterSpacing: "0.2em", textTransform: "uppercase", color: "#9A7D4A",
                background: "none", border: "none", cursor: "pointer", padding: 0,
                transition: "color 0.2s, letter-spacing 0.2s",
              }}
                onMouseEnter={e => { e.currentTarget.style.color = "#C8A96A"; e.currentTarget.style.letterSpacing = "0.28em"; }}
                onMouseLeave={e => { e.currentTarget.style.color = "#9A7D4A"; e.currentTarget.style.letterSpacing = "0.2em"; }}
              >
                Forgot?
              </button>
            </div>
            <FieldWrap>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9E8E7A" strokeWidth="1.5" style={{ flexShrink: 0 }}><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V7a4 4 0 018 0v4" /></svg>
              <input type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" style={inputStyle} />
              <EyeToggle show={showPassword} onToggle={() => setShowPassword(p => !p)} />
            </FieldWrap>
          </div>

          {error && <ErrorBox message={error} />}

          <button type="submit" disabled={loading} style={{
            width: "100%", padding: "0.9rem", marginTop: "0.4rem",
            background: loading ? "rgba(28,25,22,0.6)" : "#1C1916",
            border: "1px solid #1C1916", borderRadius: "14px",
            display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
            fontFamily: "sans-serif", fontSize: "0.57rem",
            letterSpacing: "0.28em", textTransform: "uppercase", color: "#F5F0E8",
            cursor: loading ? "not-allowed" : "pointer",
            transition: "background 0.2s, transform 0.1s, box-shadow 0.2s",
            animation: "fadeUp 0.55s ease 560ms both",
          }}
            onMouseEnter={e => { if (!loading) { e.currentTarget.style.background = "#3D2F1F"; e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 20px rgba(28,25,22,0.25)"; }}}
            onMouseLeave={e => { e.currentTarget.style.background = "#1C1916"; e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}
            onMouseDown={e => { if (!loading) e.currentTarget.style.transform = "translateY(0) scale(0.98)"; }}
            onMouseUp={e => { if (!loading) e.currentTarget.style.transform = "translateY(-2px)"; }}
          >
            {loading
              ? <><div style={{ width: "12px", height: "12px", border: "1.5px solid rgba(245,240,232,0.4)", borderTopColor: "#F5F0E8", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} /> Signing in...</>
              : <> Sign In <ArrowIcon /></>
            }
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: "10px", margin: "0.2rem 0", animation: "fadeIn 0.5s ease 640ms both" }}>
            <div style={{ flex: 1, height: "1px", background: "rgba(200,169,106,0.2)" }} />
            <span style={{ fontFamily: "sans-serif", fontSize: "0.5rem", letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(158,142,122,0.5)" }}>or</span>
            <div style={{ flex: 1, height: "1px", background: "rgba(200,169,106,0.2)" }} />
          </div>

          <button type="button" onClick={() => navigate("/register")} style={{
            width: "100%", padding: "0.7rem", background: "transparent",
            border: "1px solid rgba(200,169,106,0.4)", borderRadius: "14px",
            fontFamily: "sans-serif", fontSize: "0.57rem", letterSpacing: "0.28em",
            textTransform: "uppercase", color: "#9A7D4A", cursor: "pointer",
            transition: "background 0.2s, border-color 0.2s, transform 0.1s",
            animation: "fadeUp 0.55s ease 700ms both",
          }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(200,169,106,0.1)"; e.currentTarget.style.borderColor = "rgba(200,169,106,0.65)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "rgba(200,169,106,0.4)"; e.currentTarget.style.transform = "none"; }}
          >
            Create Account
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: "1.5rem", fontFamily: "sans-serif", fontSize: "0.52rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "#9E8E7A", lineHeight: 1.9, animation: "fadeIn 0.6s ease 800ms both" }}>
          By signing in, you agree to our{" "}
          <a href="#" style={{ color: "#9A7D4A", textDecoration: "underline", transition: "color 0.2s" }} onMouseEnter={e => e.currentTarget.style.color = "#C8A96A"} onMouseLeave={e => e.currentTarget.style.color = "#9A7D4A"}>Terms</a>
          {" & "}
          <a href="#" style={{ color: "#9A7D4A", textDecoration: "underline", transition: "color 0.2s" }} onMouseEnter={e => e.currentTarget.style.color = "#C8A96A"} onMouseLeave={e => e.currentTarget.style.color = "#9A7D4A"}>Privacy</a>
        </p>
        <div style={{ display: "flex", justifyContent: "center", marginTop: "1.75rem", animation: "fadeIn 0.6s ease 900ms both" }}>
          <span style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: "0.5rem", letterSpacing: "0.45em", textTransform: "uppercase", color: "rgba(200,169,106,0.3)" }}>
            enter your sanctuary
          </span>
        </div>
      </div>

      {showForgot && <ForgotPasswordModal onClose={() => setShowForgot(false)} />}
    </div>
  );
}