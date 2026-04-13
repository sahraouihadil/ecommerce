/**
 * LoginPage.jsx - User Login Page
 * ==================================
 * Shows a login form where users enter their username and password.
 *
 * FLOW:
 *   1. User fills in username + password and clicks "Login"
 *   2. Calls the login() function from auth.js -> POST /login
 *   3. On success: saves JWT token + role to localStorage
 *   4. Redirects to the correct dashboard based on user role:
 *      - admin -> /admin-dash
 *      - customer -> / (homepage)
 *      - accountant, marketing manager, etc. -> their own dashboards
 *   5. On error: shows error message
 *
 * NOTE: If user is already logged in, they get redirected to homepage.
 */

import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login, isAuthenticated } from "../services/auth";

// ── Inline SVG Icons ─────────────────────────────────────────────
const IconEmail = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
    <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z" />
  </svg>
);

const IconLock = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
    <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
  </svg>
);

const IconEyeOn = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
    <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
  </svg>
);

const IconEyeOff = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
    <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78 3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z" />
  </svg>
);

const IconArrow = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
    <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8-8-8z" />
  </svg>
);

const IconStar = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
    <path d="M12 2l1.5 4.5L18 8l-4.5 1.5L12 14l-1.5-4.5L6 8l4.5-1.5L12 2zm6 12l.75 2.25L21 17l-2.25.75L18 20l-.75-2.25L15 17l2.25-.75L18 14zM5 17l.5 1.5L7 19l-1.5.5L5 21l-.5-1.5L3 19l1.5-.5L5 17z" />
  </svg>
);

// ── Reusable Input Field ──────────────────────────────────────────
function InputField({ icon, type, placeholder, value, onChange, suffix }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: "0.75rem",
      backgroundColor: focused ? "rgba(100,72,178,0.06)" : "#f1f0f3",
      border: `2px solid ${focused ? "#6448b2" : "transparent"}`,
      borderRadius: "9999px",
      padding: "0 1.25rem",
      boxShadow: focused ? "0 0 0 4px rgba(100,72,178,0.1)" : "none",
      transition: "all 0.15s ease",
    }}>
      <span style={{ color: focused ? "#6448b2" : "#767779", flexShrink: 0, display: "flex" }}>
        {icon}
      </span>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          flex: 1,
          padding: "1rem 0",
          backgroundColor: "transparent",
          border: "none",
          outline: "none",
          fontSize: "0.95rem",
          fontFamily: "'Be Vietnam Pro', sans-serif",
          color: "#2d2f30",
        }}
      />
      {suffix && (
        <span style={{ flexShrink: 0, display: "flex", color: "#767779", cursor: "pointer" }}>
          {suffix}
        </span>
      )}
    </div>
  );
}

// ── Component ─────────────────────────────────────────────────────
export function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const validateForm = () => {
    if (!username || !password) {
      setError("Username and password are required.");
      return false;
    }
    setError("");
    return true;
  };

  useEffect(() => {
    if (isAuthenticated()) navigate("/");
  }, [navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    try {
      const data = await login(username, password);
      setLoading(false);
      if (data && data.access_token) {
        localStorage.setItem("token", data.access_token);
        localStorage.setItem("role", data.role);
        if (data.role === "admin") navigate("/admin-dash");
        else if (data.role === "accountant") navigate("/accountant-dash");
        else if (data.role === "marketing manager") navigate("/marketing-manager-dash");
        else if (data.role === "stock manager") navigate("/stock-manager-dash");
        else if (data.role === "deliveryman") navigate("/deliveryman-dash");
        else navigate("/");
      } else {
        setError("Authentication failed!");
      }
    } catch (err) {
      setLoading(false);
      setError(err?.response?.data?.detail || "An error occurred. Please try again later.");
    }
  };

  // ── Styles ──────────────────────────────────────────────────────
  const S = {
    page: {
      minHeight: "100dvh",
      backgroundColor: "#f7f6f8",
      fontFamily: "'Be Vietnam Pro', sans-serif",
      color: "#2d2f30",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "1.5rem",
      position: "relative",
      overflow: "hidden",
    },
    // Background blobs
    blob1: {
      position: "fixed", top: "-10%", right: "-5%",
      width: "400px", height: "400px",
      borderRadius: "9999px",
      backgroundColor: "rgba(254,208,27,0.12)",
      filter: "blur(80px)", pointerEvents: "none", zIndex: 0,
    },
    blob2: {
      position: "fixed", bottom: "-10%", left: "-5%",
      width: "500px", height: "500px",
      borderRadius: "9999px",
      backgroundColor: "rgba(100,72,178,0.06)",
      filter: "blur(80px)", pointerEvents: "none", zIndex: 0,
    },
    // Two-column grid
    grid: {
      position: "relative", zIndex: 1,
      width: "100%", maxWidth: "1000px",
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "2rem",
      alignItems: "center",
    },
    // ── Left editorial panel ──
    leftPanel: {
      position: "relative",
      minHeight: "680px",
      borderRadius: "1.5rem",
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
      justifyContent: "flex-end",
      padding: "2.5rem",
    },
    leftBg: {
      position: "absolute", inset: 0,
      objectFit: "cover",
      width: "100%", height: "100%",
      opacity: 0.85,
      mixBlendMode: "multiply",
      filter: "grayscale(20%)",
    },
    leftGradient: {
      position: "absolute", inset: 0,
      background: "linear-gradient(135deg, rgba(100,72,178,0.45) 0%, rgba(254,208,27,0.15) 100%)",
    },
    leftContent: { position: "relative", zIndex: 1 },
    brandMark: {
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      fontWeight: "900", fontSize: "2rem",
      letterSpacing: "-0.04em", fontStyle: "italic",
      color: "#6448b2", marginBottom: "1.5rem", display: "block",
    },
    leftH1: {
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      fontWeight: "800", fontSize: "clamp(2rem, 3.5vw, 3rem)",
      lineHeight: "1.1", color: "#2d2f30",
      marginBottom: "1rem",
    },
    leftSub: {
      fontSize: "1rem", color: "#5b5b5d",
      lineHeight: "1.7", maxWidth: "340px",
      marginBottom: "2rem",
    },
    glassCard: {
      background: "rgba(255,255,255,0.7)",
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
      border: "1px solid rgba(255,255,255,0.3)",
      borderRadius: "1rem",
      padding: "1.25rem 1.5rem",
      display: "inline-flex",
      alignItems: "center",
      gap: "1rem",
      boxShadow: "0 20px 40px rgba(45,47,48,0.06)",
    },
    glassIcon: {
      width: "44px", height: "44px",
      borderRadius: "9999px",
      backgroundColor: "#fed01b",
      display: "flex", alignItems: "center", justifyContent: "center",
      color: "#433500", flexShrink: 0,
    },
    // ── Right form panel ──
    rightPanel: {
      display: "flex",
      flexDirection: "column",
      padding: "1rem",
    },
    formHeader: { marginBottom: "2.5rem" },
    formH2: {
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      fontWeight: "800", fontSize: "2rem",
      letterSpacing: "-0.02em", color: "#2d2f30",
      marginBottom: "0.4rem",
    },
    formSubtitle: { color: "#5b5b5d", fontSize: "1rem" },
    // Field label row
    labelRow: {
      display: "flex", justifyContent: "space-between",
      alignItems: "center",
      padding: "0 0.25rem",
      marginBottom: "0.5rem",
    },
    label: {
      fontSize: "0.75rem", fontWeight: "700",
      textTransform: "uppercase", letterSpacing: "0.1em",
      color: "#5b5b5d",
    },
    forgotLink: {
      fontSize: "0.8rem", fontWeight: "700",
      color: "#6448b2", textDecoration: "none",
    },
    fieldWrap: { marginBottom: "1.25rem" },
    // Divider
    divider: {
      display: "flex", alignItems: "center",
      gap: "1rem", margin: "1.5rem 0",
    },
    dividerLine: { flex: 1, height: "1px", backgroundColor: "#e2e2e5" },
    dividerText: {
      fontSize: "0.7rem", fontWeight: "700",
      textTransform: "uppercase", letterSpacing: "0.15em",
      color: "#adadaf",
    },
    // Buttons
    submitBtn: {
      width: "100%", padding: "1.1rem",
      backgroundColor: "#6448b2", color: "#f7f0ff",
      border: "none", borderRadius: "9999px",
      fontSize: "1rem",
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      fontWeight: "700", cursor: "pointer",
      boxShadow: "0 10px 30px -8px rgba(100,72,178,0.5)",
      display: "flex", alignItems: "center",
      justifyContent: "center", gap: "0.5rem",
      transition: "transform 0.15s ease, opacity 0.15s ease",
      marginBottom: "0",
    },
    secondaryBtn: {
      width: "100%", padding: "1.1rem",
      backgroundColor: "#fed01b", color: "#433500",
      border: "none", borderRadius: "9999px",
      fontSize: "1rem",
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      fontWeight: "700", cursor: "pointer",
      transition: "transform 0.15s ease",
    },
    // Error
    errorPill: {
      padding: "0.75rem 1rem",
      borderRadius: "0.875rem",
      backgroundColor: "rgba(180,19,64,0.08)",
      color: "#b41340", fontSize: "0.9rem",
      textAlign: "center", fontWeight: "500",
      marginTop: "1rem",
    },
    // Footer
    footer: { marginTop: "2.5rem" },
    footerLegal: {
      fontSize: "0.8rem", color: "#5b5b5d",
      lineHeight: "1.6", marginBottom: "1.25rem",
    },
    footerLink: { color: "#6448b2", textDecoration: "underline", fontWeight: "500" },
    socialRow: { display: "flex", alignItems: "center", gap: "1rem" },
    avatarStack: { display: "flex" },
    avatar: {
      width: "36px", height: "36px",
      borderRadius: "9999px",
      border: "3px solid #ffffff",
      objectFit: "cover",
      marginRight: "-10px",
    },
    socialText: { paddingLeft: "18px" },
    signupRow: {
      textAlign: "center", marginTop: "1.5rem",
      fontSize: "0.9rem", color: "#5b5b5d",
    },
    signupLink: {
      color: "#6448b2", fontWeight: "700",
      textDecoration: "none", marginLeft: "0.3rem",
    },
  };

  return (
    <div style={S.page}>
      <div style={S.blob1} /><div style={S.blob2} />

      <div style={S.grid}>

        {/* ── Left editorial panel ── */}
        <section style={S.leftPanel}>
          <img
            alt="Dreamy surrealist interior"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBaA3WeZO7mwqELSynXuaQbR9UASR8o2Lm4gC6ZLcpayEbbfVp0jLxjCy1UnhksvNj2juWcvLREUfetNLBpKmw5sY_p8QuY1MB9vUta0DIyxEUDIP_ZkchbB4e1oxo7ZDWo9XTrtjO4Wry46duYJZY_jiIYTHDMGljwPkGQv_w9whlRcv476ThX8-z5s5qirs6WNwDVwBmpNzBgfEUbmNRtHvsCTWzGHDXDzaAFXQ60qTGu2Rzcj9Br15VX9aJpmhfBRSiVeZoADRU"
            style={S.leftBg}
          />
          <div style={S.leftGradient} />

          <div style={S.leftContent}>
            <span style={S.brandMark}>ARoomX</span>
            <h1 style={S.leftH1}>
              Welcome back to the{" "}
              <span style={{ color: "#6448b2", fontStyle: "italic" }}>Wonderland</span>
            </h1>
            <p style={S.leftSub}>
              Curating the weird, the wonderful, and the utterly unconventional
              for your personal sanctuary.
            </p>

            {/* Glass card */}
            <div style={S.glassCard}>
              <div style={S.glassIcon}><IconStar /></div>
              <div>
                <p style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontWeight: "700", color: "#2d2f30",
                  fontSize: "0.9rem", marginBottom: "0.1rem",
                }}>
                  Oddity of the Day
                </p>
                <p style={{ fontSize: "0.8rem", color: "#5b5b5d" }}>
                  The Asymmetric Velvet Cloud
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Right form panel ── */}
        <section style={S.rightPanel}>
          <header style={S.formHeader}>
            <h2 style={S.formH2}>Sign In</h2>
            <p style={S.formSubtitle}>Enter your portal to the unusual.</p>
          </header>

          <form onSubmit={handleSubmit}>

            {/* Username */}
            <div style={S.fieldWrap}>
              <div style={S.labelRow}>
                <span style={S.label}>Username</span>
              </div>
              <InputField
                icon={<IconEmail />}
                type="text"
                placeholder="dreamer@wonderland.com"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            {/* Password */}
            <div style={S.fieldWrap}>
              <div style={S.labelRow}>
                <span style={S.label}>Magic Word</span>
                <a href="#" style={S.forgotLink}>Forgot Magic Word?</a>
              </div>
              <InputField
                icon={<IconLock />}
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                suffix={
                  <span
                    onClick={() => setShowPassword(p => !p)}
                    style={{ color: "#767779", display: "flex", cursor: "pointer" }}
                  >
                    {showPassword ? <IconEyeOff /> : <IconEyeOn />}
                  </span>
                }
              />
            </div>

            {/* Error */}
            {error && <div style={S.errorPill}>{error}</div>}

            {/* Submit */}
            <div style={{ marginTop: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
              <button
                type="submit"
                disabled={loading}
                style={{ ...S.submitBtn, opacity: loading ? 0.7 : 1 }}
                onMouseEnter={e => !loading && (e.currentTarget.style.transform = "scale(1.02)")}
                onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
                onMouseDown={e => (e.currentTarget.style.transform = "scale(0.97)")}
              >
                {loading ? "Signing in…" : "Enter the Realm"}
                {!loading && <IconArrow />}
              </button>

              {/* Divider */}
              <div style={S.divider}>
                <div style={S.dividerLine} />
                <span style={S.dividerText}>or</span>
                <div style={S.dividerLine} />
              </div>

              <button
                type="button"
                style={S.secondaryBtn}
                onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.02)")}
                onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
                onMouseDown={e => (e.currentTarget.style.transform = "scale(0.97)")}
              >
                Join the Circle of Odd
              </button>
            </div>
          </form>

          {/* Footer */}
          <footer style={S.footer}>
            <p style={S.footerLegal}>
              By entering, you agree to our{" "}
              <a href="#" style={S.footerLink}>Curator's Agreement</a> and{" "}
              <a href="#" style={S.footerLink}>Soul Privacy Policy</a>.
            </p>

            {/* Social proof */}
            <div style={S.socialRow}>
              <div style={S.avatarStack}>
                {[
                  "https://lh3.googleusercontent.com/aida-public/AB6AXuDLnxakZE7gHW0rYE7hJkav3sarTt6bYenDqAenbk-G2U8Koj-OKmoy6oR8j80GXUwBBsK4AbDRInFMWazMBqgU2G1O8KUTj97TZcwZpzRVPCuxs5hXzQbJ8jQ8eBzUQq9e1tQ1X2WvBeMucVPOtdLdr1JG-_WTtbVHu3S-7LzqSoZDqSJQlx6K0vU_01G3eSB1k40vjsDnQUDg0bfOqBHiNYBR43IL36QLzFxv4g9_2mvSSgzasBxGl_oaAwLBmWtfitN9NilKLIM",
                  "https://lh3.googleusercontent.com/aida-public/AB6AXuCEefnC7scqnEE2Nlu7k53leKApwbFQ0NKDaZHqiTI_mnIwwCL6yMrZUD0KTddLPNT0v-j-Rxs1ys_HoQxF9lZml0VIHCDEkyT00cPHCux-tlS36wCMdE9I-BZYW_Xsrwytlgv8VFNFFS94RPtolNWNqemSyCX8lP1hU0VAgyju6HV1SA3tLVMmmVrlrkFTkJdLAMbT75o49c4298RChIWb1WoekKpAb-AgHAhCAmHYJASzCHVQGt-mM4hI4I_VWFe47UhI6eHezRg",
                  "https://lh3.googleusercontent.com/aida-public/AB6AXuDwQVd8RojFpTnVjL-hHjdLFE4RAGLuTAL7RVsvOwMVvA2MyXuTlYk0wtrb3ftQCoAfuUR_w4USA1xj1XxppMthVPtmJSo1AagHuPfplBAr5pjnB3wPc0vgBu8mWHXg-oPTLwmRq74MAql16BuQgUnVd1EIA9RLL-J2ou4Fj2Bm_kv822yjIgNp7gasbOnJrbJn7C39LtFRH6PsTtFxIU-KPnK_S1icU_WhkVdci-AQbcmTeYots7BGJn3RcFQNlXFzyZVkN6mOocM",
                ].map((src, i) => (
                  <img key={i} src={src} alt="community member" style={S.avatar} />
                ))}
              </div>
              <div style={S.socialText}>
                <p style={{ fontWeight: "700", fontSize: "0.85rem", color: "#2d2f30", margin: 0 }}>
                  12k+ Oddities Found
                </p>
                <p style={{ fontSize: "0.75rem", color: "#5b5b5d", margin: 0 }}>
                  Join our growing community of curators
                </p>
              </div>
            </div>

            {/* Signup link */}
            <p style={S.signupRow}>
              Don't have an account?
              <Link to="/register" style={S.signupLink}>Sign up</Link>
            </p>
          </footer>
        </section>

      </div>
    </div>
  );
}