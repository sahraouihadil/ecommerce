import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login, isAuthenticated } from "../services/auth";

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

export function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
          admin: "/admin-dash",
          accountant: "/accountant-dash",
          marketing_manager: "/marketing-manager-dash",
          stock_manager: "/stock-manager-dash",
          deliveryman: "/deliveryman-dash",
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

  const labelStyle = {
    fontFamily: "sans-serif",
    fontSize: "0.55rem",
    letterSpacing: "0.28em",
    textTransform: "uppercase",
    color: "#9E8E7A",
    display: "block",
    marginBottom: "0.4rem",
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
          <p style={{ fontFamily: "sans-serif", fontSize: "0.55rem", letterSpacing: "0.38em", textTransform: "uppercase", color: "#9E8E7A", marginBottom: "0.7rem" }}>
            Welcome back
          </p>
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
              fontSize: "clamp(1.5rem, 5vw, 2.25rem)",
              fontWeight: 700,
              letterSpacing: "0.04em",
              color: "#1C1916",
              lineHeight: 1.1,
              marginBottom: "0.6rem",
            }}
          >
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
                style={{ ...inputStyle, "::placeholder": { color: "rgba(158,142,122,0.4)", fontStyle: "italic" } }}
              />
            </FieldWrap>
          </div>

          {/* Password */}
          <div>
            <div style={{ display: "flex", alignItems: "center", marginBottom: "0.4rem" }}>
              <span style={labelStyle}>Password</span>
              <a
                href="#"
                style={{
                  marginLeft: "auto",
                  fontFamily: "sans-serif",
                  fontSize: "0.52rem",
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  color: "#9A7D4A",
                  textDecoration: "none",
                }}
              >
                Forgot?
              </a>
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
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                style={{ background: "none", border: "none", cursor: "pointer", padding: 0, flexShrink: 0 }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9E8E7A" strokeWidth="1.5">
                  {showPassword
                    ? <><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></>
                    : <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></>
                  }
                </svg>
              </button>
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
              padding: "0.9rem",
              transition: "background 0.2s",
            }}
          >
            {loading ? "Signing in..." : "Sign In"}
            {!loading && (
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            )}
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