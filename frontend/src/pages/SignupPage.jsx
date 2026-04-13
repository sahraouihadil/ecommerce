/**
 * SignupPage.jsx - User Registration Page
 * ==========================================
 * Shows a registration form for new users.
 *
 * FLOW:
 *   1. User fills in: username, email, password, phone number
 *   2. Calls register() -> POST /register
 *   3. Backend sends a verification code to the user's email
 *   4. User is redirected to /verify-code to enter the code
 *   5. After verification -> /set-password to finalize the account
 *
 * The full signup flow is: SignupPage -> VerifyCode -> SetPassword -> LoginPage
 */

import { Link } from "react-router-dom";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { register } from "../services/auth";

// ── Inline SVG Icons ─────────────────────────────────────────────
const IconPerson = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
    <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
  </svg>
);

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

const IconPhone = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
    <path d="M6.62 10.79a15.05 15.05 0 0 0 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1C10.61 21 3 13.39 3 4c0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.24 1.02l-2.21 2.2z" />
  </svg>
);

const IconSparkle = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="32" height="32">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z" />
    <path d="M12 2l1.5 4.5L18 8l-4.5 1.5L12 14l-1.5-4.5L6 8l4.5-1.5L12 2z" />
  </svg>
);

// ── Reusable Field ────────────────────────────────────────────────
function InputField({ icon, type, placeholder, value, onChange }) {
  const [focused, setFocused] = useState(false);

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: "0.75rem",
      backgroundColor: focused ? "rgba(100,72,178,0.06)" : "#f1f0f3",
      border: `2px solid ${focused ? "#6448b2" : "transparent"}`,
      borderRadius: "0.875rem",
      padding: "0 1rem",
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
          padding: "0.9rem 0",
          backgroundColor: "transparent",
          border: "none",
          outline: "none",
          fontSize: "0.95rem",
          fontFamily: "'Be Vietnam Pro', sans-serif",
          color: "#2d2f30",
        }}
      />
    </div>
  );
}

// ── Component ─────────────────────────────────────────────────────
export function SignupPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNum, setPhoneNum] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const validateForm = () => {
    if (!username || !password || !email) {
      setError("Username, email and password are required.");
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
    blob1: {
      position: "absolute", top: "-10%", right: "-10%",
      width: "420px", height: "420px",
      borderRadius: "9999px",
      backgroundColor: "rgba(171,143,254,0.15)",
      filter: "blur(80px)",
      pointerEvents: "none",
    },
    blob2: {
      position: "absolute", bottom: "-5%", left: "-5%",
      width: "320px", height: "320px",
      borderRadius: "9999px",
      backgroundColor: "rgba(254,208,27,0.15)",
      filter: "blur(60px)",
      pointerEvents: "none",
    },
    card: {
      position: "relative", zIndex: 1,
      width: "100%", maxWidth: "440px",
    },
    headerWrap: {
      textAlign: "center",
      marginBottom: "2.5rem",
    },
    iconWrap: {
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      width: "72px", height: "72px",
      backgroundColor: "rgba(171,143,254,0.25)",
      borderRadius: "1.25rem",
      color: "#6448b2",
      marginBottom: "1.5rem",
      transform: "rotate(-3deg)",
    },
    h1: {
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      fontWeight: "800",
      fontSize: "2.25rem",
      letterSpacing: "-0.02em",
      color: "#2d2f30",
      marginBottom: "0.5rem",
    },
    subtitle: {
      color: "#5b5b5d",
      fontSize: "1rem",
      lineHeight: "1.6",
    },
    formBox: {
      backgroundColor: "#ffffff",
      borderRadius: "1.5rem",
      padding: "2.5rem 2rem",
      boxShadow: "0 20px 60px rgba(45,47,48,0.08)",
      display: "flex",
      flexDirection: "column",
      gap: "1rem",
    },
    submitBtn: {
      width: "100%",
      padding: "1rem",
      backgroundColor: "#6448b2",
      color: "#f7f0ff",
      border: "none",
      borderRadius: "9999px",
      fontSize: "1rem",
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      fontWeight: "700",
      cursor: "pointer",
      boxShadow: "0 10px 30px -8px rgba(100,72,178,0.5)",
      marginTop: "0.5rem",
      transition: "transform 0.15s ease, opacity 0.15s ease",
    },
    errorPill: {
      padding: "0.75rem 1rem",
      borderRadius: "0.875rem",
      backgroundColor: "rgba(180,19,64,0.08)",
      color: "#b41340",
      fontSize: "0.9rem",
      textAlign: "center",
      fontWeight: "500",
    },
    loginRow: {
      textAlign: "center",
      marginTop: "1.75rem",
      fontSize: "0.9rem",
      color: "#5b5b5d",
    },
    loginLink: {
      color: "#6448b2",
      fontWeight: "700",
      textDecoration: "none",
      marginLeft: "0.3rem",
    },
    footerWrap: {
      textAlign: "center",
      marginTop: "2rem",
    },
    footerPill: {
      display: "inline-flex", alignItems: "center", gap: "0.4rem",
      padding: "0.35rem 1rem",
      backgroundColor: "#f1f0f3",
      borderRadius: "9999px",
      color: "#5b5b5d",
      fontSize: "0.8rem",
      fontWeight: "500",
    },
  };

  return (
    <div style={S.page}>
      {/* Background blobs */}
      <div style={S.blob1} />
      <div style={S.blob2} />

      <div style={S.card}>

        {/* Header */}
        <div style={S.headerWrap}>
          <div style={S.iconWrap}>
            <IconSparkle />
          </div>
          <h1 style={S.h1}>Create Account</h1>
          <p style={S.subtitle}>Join ARoomX — your curated playground awaits.</p>
        </div>

        {/* Form box */}
        <form onSubmit={handleSubmit} style={S.formBox}>

          <InputField
            icon={<IconPerson />}
            type="text"
            placeholder="Full Name"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <InputField
            icon={<IconEmail />}
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <InputField
            icon={<IconLock />}
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <InputField
            icon={<IconPhone />}
            type="text"
            placeholder="Phone Number (optional)"
            value={phoneNum}
            onChange={(e) => setPhoneNum(e.target.value)}
          />

          {/* Error */}
          {error && <div style={S.errorPill}>{error}</div>}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            style={{ ...S.submitBtn, opacity: loading ? 0.7 : 1 }}
            onMouseEnter={e => !loading && (e.currentTarget.style.transform = "scale(1.02)")}
            onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
            onMouseDown={e => (e.currentTarget.style.transform = "scale(0.97)")}
          >
            {loading ? "Creating account…" : "Create Account"}
          </button>

        </form>

        {/* Login redirect */}
        <p style={S.loginRow}>
          Already have an account?
          <Link to="/login" style={S.loginLink}>Log in</Link>
        </p>

        {/* Footer badge */}
        <div style={S.footerWrap}>
          <span style={S.footerPill}>
            <IconLock />
            Encrypted Magic Session
          </span>
        </div>

      </div>
    </div>
  );
}