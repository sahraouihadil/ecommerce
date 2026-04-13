/**
 * VerifyCode.jsx - Email Verification Page
 * ===========================================
 * Part of the signup flow. After registration, the user receives a
 * 6-digit code by email. They enter it here to verify their email address.
 *
 * FLOW:
 *   SignupPage -> (email sent) -> VerifyCode -> SetPassword -> LoginPage
 *
 * API: GET /verify-code?email=...&code=...
 * On success: redirects to /set-password with the userName
 * If no email in state: redirects back to /register
 */

import { useState, useRef } from "react";
import api from "../services/api";
import { useLocation, useNavigate, Navigate } from "react-router-dom";

// ── Inline SVG Icons ────────────────────────────────────────────
const IconWand = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="36" height="36">
    <path d="M7.5 5.6 10 7 8.6 4.5 10 2 7.5 3.4 5 2l1.4 2.5L5 7zm12 9.8L17 14l1.4 2.5L17 19l2.5-1.4L22 19l-1.4-2.5L22 14zM22 2l-2.5 1.4L17 2l1.4 2.5L17 7l2.5-1.4L22 7l-1.4-2.5zm-7.63 5.29a1 1 0 0 0-1.41 0L1.29 18.96a1 1 0 0 0 0 1.41l2.34 2.34c.39.39 1.02.39 1.41 0L16.7 11.05a1 1 0 0 0 0-1.41l-2.33-2.35zm-1.03 5.49-2.12-2.12 2.44-2.44 2.12 2.12-2.44 2.44z" />
  </svg>
);

const IconRefresh = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
    <path d="M17.65 6.35A7.958 7.958 0 0 0 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0 1 12 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" />
  </svg>
);

const IconLock = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
    <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
  </svg>
);

// ── Component ────────────────────────────────────────────────────
const DIGITS = 6;

export function VerifyCode() {
  const [digits, setDigits] = useState(Array(DIGITS).fill(""));
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef([]);

  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email;

  if (!email) return <Navigate to="/register" replace />;

  // ── Input handlers ────────────────────────────────────────────
  const handleChange = (index, value) => {
    const char = value.replace(/\D/g, "").slice(-1); // digits only
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

  // ── API call ──────────────────────────────────────────────────
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
        setMessage(res.data.msg);
        navigate("/set-password", { state: { userName: res.data.user_name } });
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

  // ── Styles ────────────────────────────────────────────────────
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
      width: "400px", height: "400px",
      borderRadius: "9999px",
      backgroundColor: "rgba(171,143,254,0.15)",
      filter: "blur(80px)",
      pointerEvents: "none",
    },
    blob2: {
      position: "absolute", bottom: "-5%", left: "-5%",
      width: "300px", height: "300px",
      borderRadius: "9999px",
      backgroundColor: "rgba(254,208,27,0.15)",
      filter: "blur(60px)",
      pointerEvents: "none",
    },
    card: {
      position: "relative", zIndex: 1,
      width: "100%", maxWidth: "440px",
      display: "flex", flexDirection: "column", gap: "0",
    },
    // Header
    headerWrap: { textAlign: "center", marginBottom: "2.5rem" },
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
      fontWeight: "800", fontSize: "2.25rem",
      letterSpacing: "-0.02em", color: "#2d2f30",
      marginBottom: "0.75rem",
    },
    subtitle: {
      color: "#5b5b5d", fontSize: "1rem", lineHeight: "1.6",
      marginBottom: "0.25rem",
    },
    emailPill: {
      display: "inline-block",
      padding: "0.2rem 0.85rem",
      backgroundColor: "rgba(100,72,178,0.1)",
      borderRadius: "9999px",
      color: "#6448b2",
      fontSize: "0.85rem",
      fontWeight: "600",
      marginTop: "0.5rem",
    },
    // Form box
    formBox: {
      backgroundColor: "#ffffff",
      borderRadius: "1.5rem",
      padding: "2.5rem 2rem",
      boxShadow: "0 20px 60px rgba(45,47,48,0.08)",
    },
    // Digit inputs
    digitsRow: {
      display: "flex", justifyContent: "center",
      gap: "0.6rem", marginBottom: "2rem",
    },
    digitInput: {
      width: "52px", height: "64px",
      textAlign: "center",
      fontSize: "1.75rem",
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      fontWeight: "700",
      backgroundColor: "#f1f0f3",
      border: "2px solid transparent",
      borderRadius: "0.875rem",
      outline: "none",
      color: "#2d2f30",
      transition: "all 0.15s ease",
      caretColor: "#6448b2",
    },
    digitInputFilled: {
      backgroundColor: "rgba(100,72,178,0.08)",
      borderColor: "rgba(100,72,178,0.35)",
    },
    // Submit button
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
      marginBottom: "1.25rem",
      transition: "transform 0.15s ease, opacity 0.15s ease",
    },
    // Resend
    resendBtn: {
      display: "flex", alignItems: "center",
      justifyContent: "center", gap: "0.4rem",
      margin: "0 auto",
      background: "none", border: "none",
      color: "#6448b2", fontWeight: "600",
      fontSize: "0.95rem", cursor: "pointer",
      fontFamily: "'Be Vietnam Pro', sans-serif",
    },
    // Message
    messagePill: (error) => ({
      marginTop: "1.25rem",
      padding: "0.75rem 1rem",
      borderRadius: "0.875rem",
      backgroundColor: error ? "rgba(180,19,64,0.08)" : "rgba(0,103,92,0.08)",
      color: error ? "#b41340" : "#00675c",
      fontSize: "0.9rem",
      textAlign: "center",
      fontWeight: "500",
    }),
    // Footer tag
    footer: { textAlign: "center", marginTop: "2rem" },
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
            <IconWand />
          </div>
          <h1 style={S.h1}>Verify Code</h1>
          <p style={S.subtitle}>
            Enter the {DIGITS}-digit magic code sent to
          </p>
          <span style={S.emailPill}>{email}</span>
        </div>

        {/* Form box */}
        <div style={S.formBox}>

          {/* Digit inputs */}
          <div style={S.digitsRow} onPaste={handlePaste}>
            {digits.map((d, i) => (
              <input
                key={i}
                ref={el => inputRefs.current[i] = el}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={d}
                placeholder="•"
                onChange={e => handleChange(i, e.target.value)}
                onKeyDown={e => handleKeyDown(i, e)}
                onFocus={e => {
                  e.target.style.borderColor = "#6448b2";
                  e.target.style.backgroundColor = "rgba(100,72,178,0.06)";
                  e.target.style.boxShadow = "0 0 0 4px rgba(100,72,178,0.12)";
                }}
                onBlur={e => {
                  e.target.style.borderColor = d ? "rgba(100,72,178,0.35)" : "transparent";
                  e.target.style.backgroundColor = d ? "rgba(100,72,178,0.08)" : "#f1f0f3";
                  e.target.style.boxShadow = "none";
                }}
                style={{
                  ...S.digitInput,
                  ...(d ? S.digitInputFilled : {}),
                }}
              />
            ))}
          </div>

          {/* Submit */}
          <button
            onClick={handleVerify}
            disabled={loading}
            style={{ ...S.submitBtn, opacity: loading ? 0.7 : 1 }}
            onMouseEnter={e => !loading && (e.currentTarget.style.transform = "scale(1.02)")}
            onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
            onMouseDown={e => (e.currentTarget.style.transform = "scale(0.97)")}
          >
            {loading ? "Verifying…" : "Complete Portal Access"}
          </button>

          {/* Resend */}
          <button
            style={S.resendBtn}
            onClick={handleResend}
            onMouseEnter={e => e.currentTarget.style.color = "#583ba5"}
            onMouseLeave={e => e.currentTarget.style.color = "#6448b2"}
          >
            <IconRefresh />
            <span>Resend Spell</span>
          </button>

          {/* Message */}
          {message && (
            <div style={S.messagePill(isError)}>
              {message}
            </div>
          )}
        </div>

        {/* Footer badge */}
        <div style={S.footer}>
          <span style={S.footerPill}>
            <IconLock />
            Encrypted Magic Session
          </span>
        </div>

      </div>
    </div>
  );
}