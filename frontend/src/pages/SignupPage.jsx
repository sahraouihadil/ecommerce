import { Link } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { register } from "../services/auth";

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

export function SignupPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNum, setPhoneNum] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@400;700;900&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&display=swap";
    document.head.appendChild(link);
    return () => document.head.removeChild(link);
  }, []);

  const validateForm = () => {
    if (!username || !password || !email) {
      setError("Full name, email and password are required.");
      return false;
    }
    setError("");
    return true;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    try {
      const data = await register(username, password, email, phoneNum);
      setLoading(false);
      if (data.action === "verify") {
        navigate("/verify-code", { state: { email } });
        return;
      }
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
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          pointerEvents: "none",
          userSelect: "none",
        }}
      >
        <span
          style={{
            fontFamily: "'Cinzel Decorative', serif",
            fontSize: "clamp(5rem, 22vw, 16rem)",
            fontWeight: 900,
            color: "transparent",
            WebkitTextStroke: "1px rgba(180,148,90,0.05)",
            letterSpacing: "0.12em",
            whiteSpace: "nowrap",
          }}
        >
          AROOM
        </span>
      </div>

      <div style={{ width: "100%", maxWidth: "420px", position: "relative", zIndex: 1 }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "2.25rem" }}>
          <Link
            to="/"
            style={{
              fontFamily: "'Cinzel Decorative', serif",
              fontSize: "1.1rem",
              fontWeight: 700,
              letterSpacing: "0.06em",
              color: "#1C1916",
              textDecoration: "none",
              display: "block",
              marginBottom: "1.5rem",
            }}
          >
            ARoom
          </Link>
          <h1
            style={{
              fontFamily: "'Cinzel Decorative', serif",
              fontSize: "clamp(1.4rem, 5vw, 2.1rem)",
              fontWeight: 700,
              letterSpacing: "0.04em",
              color: "#1C1916",
              lineHeight: 1.1,
              marginBottom: "0.6rem",
            }}
          >
            Create Account
          </h1>
          <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.05rem", fontStyle: "italic", fontWeight: 300, color: "#7A6B5A", lineHeight: 1.7 }}>
            Preview furniture in your room with AR.
          </p>
        </div>

        <GoldRule />

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.05rem" }}>

          {/* Full Name */}
          <div>
            <label style={labelStyle}>Full name</label>
            <FieldWrap>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9E8E7A" strokeWidth="1.5" style={{ flexShrink: 0 }}>
                <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
              </svg>
              <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="your full name" style={inputStyle} />
            </FieldWrap>
          </div>

          {/* Email */}
          <div>
            <label style={labelStyle}>Email</label>
            <FieldWrap>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9E8E7A" strokeWidth="1.5" style={{ flexShrink: 0 }}>
                <rect x="2" y="4" width="20" height="16" rx="2" /><path d="M2 7l10 7 10-7" />
              </svg>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" style={inputStyle} />
            </FieldWrap>
          </div>

          {/* Password */}
          <div>
            <label style={labelStyle}>Password</label>
            <FieldWrap>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9E8E7A" strokeWidth="1.5" style={{ flexShrink: 0 }}>
                <rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V7a4 4 0 018 0v4" />
              </svg>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" style={inputStyle} />
            </FieldWrap>
          </div>

          {/* Phone */}
          <div>
            <label style={labelStyle}>
              Phone{" "}
              <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "0.85rem", fontStyle: "italic", letterSpacing: 0, textTransform: "none", color: "rgba(158,142,122,0.55)" }}>
                — optional
              </span>
            </label>
            <FieldWrap>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9E8E7A" strokeWidth="1.5" style={{ flexShrink: 0 }}>
                <path d="M22 16.9v3a2 2 0 01-2.2 2A19.8 19.8 0 013.1 4.2 2 2 0 015.1 2h3a2 2 0 012 1.7c.1.9.4 1.8.7 2.6a2 2 0 01-.5 2.1L9.1 9.6a16 16 0 006.3 6.3l1.2-1.2a2 2 0 012.1-.5c.8.3 1.7.6 2.6.7A2 2 0 0122 16.9z" />
              </svg>
              <input type="text" value={phoneNum} onChange={(e) => setPhoneNum(e.target.value)} placeholder="+213 ..." style={inputStyle} />
            </FieldWrap>
          </div>

          {/* Error */}
          {error && (
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
            }}>
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "0.8rem",
              marginTop: "0.3rem",
              background: loading ? "rgba(28,25,22,0.6)" : "#1C1916",
              border: "1px solid #1C1916",
              borderRadius: "14px",
              fontFamily: "sans-serif",
              fontSize: "0.57rem",
              letterSpacing: "0.28em",
              textTransform: "uppercase",
              color: "#F5F0E8",
              cursor: loading ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              padding: "0.9rem",
              marginTop: "0.3rem",
              transition: "background 0.2s",
            }}
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        {/* Sign in link */}
        <p style={{ textAlign: "center", marginTop: "1.5rem", fontFamily: "sans-serif", fontSize: "0.52rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "#9E8E7A" }}>
          Already a member?{" "}
          <Link to="/login" style={{ color: "#9A7D4A", textDecoration: "none" }}>Sign in</Link>
        </p>

        {/* Footer ornament */}
        <div style={{ display: "flex", justifyContent: "center", marginTop: "1.75rem" }}>
          <span style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: "0.5rem", letterSpacing: "0.45em", textTransform: "uppercase", color: "rgba(200,169,106,0.3)" }}>
            enter your sanctuary
          </span>
        </div>
      </div>
    </div>
  );
}