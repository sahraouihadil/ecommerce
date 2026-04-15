/**
 * SetPassword.jsx - Set Password Page
 * ======================================
 * Final step of the signup flow. After email verification, the user
 * sets their password here.
 *
 * FLOW:
 *   SignupPage -> VerifyCode -> SetPassword -> LoginPage
 *
 * FEATURES:
 *   - Two password fields (password + confirm) to avoid typos
 *   - Password is validated on the backend (strength requirements)
 *   - On success: redirects to /login after 1.5 seconds
 *
 * API: POST /set-password { user_name, password }
 */

import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../services/api";

// ── Tailwind config is assumed to be loaded globally with the ARoomX theme ──

export function SetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" }); // type: "error" | "success"

  const location = useLocation();
  const navigate = useNavigate();

  const userName = location.state?.userName;

  // ── Password requirement checks ──────────────────────────────────────────
  const checks = {
    length: password.length >= 12,
    mixedCase: /[A-Z]/.test(password) && /[a-z]/.test(password),
    numbersSymbols: /[\d!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/.test(password),
    noCommon: !["password", "123456", "qwerty", "letmein"].some((w) =>
      password.toLowerCase().includes(w)
    ),
  };

  const allPassed = Object.values(checks).every(Boolean);

  // ── Guard: no userName in state ──────────────────────────────────────────
  if (!userName) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center px-6">
        <div className="text-center space-y-4">
          <span className="material-symbols-outlined text-5xl text-error">
            error
          </span>
          <p className="text-on-surface-variant font-body text-lg">
            No user found. Please{" "}
            <a href="/register" className="text-primary underline font-bold">
              register again
            </a>
            .
          </p>
        </div>
      </div>
    );
  }

  // ── Submit handler ────────────────────────────────────────────────────────
  const handleSetPassword = async () => {
    setMessage({ text: "", type: "" });

    if (password !== confirmPassword) {
      setMessage({ text: "Passwords do not match.", type: "error" });
      return;
    }

    try {
      const res = await api.post("/set-password", {
        user_name: userName,
        password,
      });

      if (res.data.msg) {
        setMessage({ text: res.data.msg, type: "success" });
        setTimeout(() => navigate("/login"), 1500);
      }
    } catch (err) {
      setMessage({
        text: err?.response?.data?.detail || "Server Error",
        type: "error",
      });
    }
  };

  // ── Requirement row component ─────────────────────────────────────────────
  const Requirement = ({ icon, iconColor, bgColor, title, desc, met }) => (
    <div className="flex items-start gap-4 group">
      <div
        className={`w-12 h-12 rounded-2xl ${bgColor} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}
      >
        <span className={`material-symbols-outlined ${iconColor}`}>{icon}</span>
      </div>
      <div className="space-y-1 flex-1">
        <p className="font-headline font-bold text-on-surface">{title}</p>
        <p className="text-sm text-on-surface-variant">{desc}</p>
      </div>
      <div className="ml-auto shrink-0">
        {met ? (
          <span
            className="material-symbols-outlined text-tertiary"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            check_circle
          </span>
        ) : (
          <span className="material-symbols-outlined text-outline-variant">
            radio_button_unchecked
          </span>
        )}
      </div>
    </div>
  );

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="bg-surface font-body text-on-surface min-h-screen selection:bg-primary-container selection:text-on-primary-container">

      {/* ── TopAppBar ── */}
      <header className="w-full sticky top-0 z-50 bg-[#f7f6f8] dark:bg-zinc-950 flex justify-between items-center px-6 py-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[#e2e2e5] dark:hover:bg-zinc-800 transition-colors active:scale-95 duration-200 text-[#6448b2] dark:text-[#a78bfa]"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <span className="text-2xl font-black tracking-tighter text-[#6448b2] dark:text-[#a78bfa] font-headline">
            ARoomX
          </span>
        </div>
        <div className="h-10 w-10 rounded-full bg-surface-container-highest overflow-hidden">
          <img
            alt="User Profile"
            className="w-full h-full object-cover"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCzMHY-lPV9Xu9EfW5ogPPqsCCMRzRHab7k8vGoUXfSBN2IDJtVTrshQ36v6dkItF6bfLBhUSLLg2OtWz3d3LqrjJhaBTtMdw52lDN-ogtWCwSv3H7BfIr9u7754bXMROrNmSTRtJk5kx8BEZo-_ab-zShWIyM_YbAfjUlNF6S6jkiA1D1AP9GLjP_j_yUTFo3Up45FZ0lsnYKlFeq9OyzTX8eSfvnDj-dII9dTNe-W-qRb5BgpY6igMVhYUUgtjRCj0lrr24nS_TQ"
          />
        </div>
      </header>

      {/* ── Main ── */}
      <main className="min-h-[calc(100vh-80px)] flex items-center justify-center px-6 py-12">
        <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          {/* ── Left: Form ── */}
          <div className="space-y-8 lg:pr-12">
            <div className="space-y-4">
              <span className="inline-block px-4 py-1.5 rounded-full bg-secondary-container text-on-secondary-fixed font-label text-xs font-bold tracking-widest uppercase">
                Security First
              </span>
              <h1 className="text-5xl lg:text-6xl font-headline font-extrabold text-on-surface tracking-tight leading-[1.1]">
                Set Password
              </h1>
              <p className="text-xl text-on-surface-variant font-medium leading-relaxed">
                Defining Your Magic Word. Make it strong enough to guard your
                weirdest furniture finds.
              </p>
            </div>

            {/* Card */}
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary to-secondary-container rounded-xl blur opacity-10 group-hover:opacity-20 transition duration-1000 group-hover:duration-200" />
              <div className="relative bg-surface-container-lowest p-8 rounded-xl shadow-[0px_20px_40px_rgba(45,47,48,0.06)] space-y-6">

                {/* New Password */}
                <div className="space-y-2">
                  <label className="block text-sm font-bold font-headline text-on-surface ml-4">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full h-14 px-6 rounded-full bg-surface-container-low border-none focus:ring-2 focus:ring-primary/40 placeholder:text-outline-variant transition-all outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors"
                    >
                      <span className="material-symbols-outlined">
                        {showPassword ? "visibility_off" : "visibility"}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <label className="block text-sm font-bold font-headline text-on-surface ml-4">
                    Confirm Magic Word
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirm ? "text" : "password"}
                      placeholder="••••••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full h-14 px-6 rounded-full bg-surface-container-low border-none focus:ring-2 focus:ring-primary/40 placeholder:text-outline-variant transition-all outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm((v) => !v)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors"
                    >
                      <span className="material-symbols-outlined">
                        {showConfirm ? "visibility_off" : "visibility"}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Feedback message */}
                {message.text && (
                  <p
                    className={`text-sm font-medium text-center px-4 py-2 rounded-full ${
                      message.type === "success"
                        ? "bg-tertiary-container/30 text-tertiary"
                        : "bg-error-container/20 text-error"
                    }`}
                  >
                    {message.text}
                  </p>
                )}

                {/* Submit */}
                <button
                  onClick={handleSetPassword}
                  className="w-full bg-primary text-on-primary h-14 rounded-full font-headline font-bold text-lg hover:shadow-lg hover:shadow-primary/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group/btn disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Secure My Account
                  <span className="material-symbols-outlined group-hover/btn:translate-x-1 transition-transform">
                    key
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* ── Right: Requirements ── */}
          <div className="relative">
            {/* Decorative blobs */}
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-secondary-container rounded-full blur-3xl opacity-30 animate-pulse" />
            <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-tertiary-container rounded-full blur-3xl opacity-20" />

            <div
              className="relative p-8 lg:p-10 rounded-xl border border-outline-variant/15 space-y-8"
              style={{
                background: "rgba(255,255,255,0.7)",
                backdropFilter: "blur(16px)",
                WebkitBackdropFilter: "blur(16px)",
              }}
            >
              <h3 className="text-2xl font-headline font-bold text-on-surface">
                The Magic Recipe
              </h3>

              <div className="space-y-6">
                <Requirement
                  icon="straighten"
                  iconColor="text-primary"
                  bgColor="bg-primary-container/20"
                  title="At least 12 characters"
                  desc="Longer is stronger. Think of a short sentence or a weird phrase."
                  met={checks.length}
                />
                <Requirement
                  icon="match_case"
                  iconColor="text-secondary"
                  bgColor="bg-secondary-container/20"
                  title="Mix of Upper & Lower"
                  desc="Shake it up! Variety makes your magic word harder to guess."
                  met={checks.mixedCase}
                />
                <Requirement
                  icon="123"
                  iconColor="text-tertiary"
                  bgColor="bg-tertiary-container/20"
                  title="Numbers & Symbols"
                  desc="Add some seasoning. A # or a 7 goes a long way."
                  met={checks.numbersSymbols}
                />
                <Requirement
                  icon="block"
                  iconColor="text-error"
                  bgColor="bg-error-container/20"
                  title="No Common Words"
                  desc='Avoid "password123" or your dog\s name. Be unpredictable!'
                  met={checks.noCommon && password.length > 0}
                />
              </div>

              {/* Pro Tip */}
              <div className="mt-8 p-6 rounded-lg bg-surface-container-low/50 border border-outline-variant/10 flex items-center gap-6">
                <div className="shrink-0">
                  <span className="material-symbols-outlined text-4xl text-primary/40">
                    shield_lock
                  </span>
                </div>
                <p className="text-xs font-medium text-on-surface-variant leading-relaxed">
                  <strong className="text-on-surface block mb-1">
                    Pro Tip:
                  </strong>
                  Use a passphrase like "VelvetPandaTable42!" to make it
                  impossible for robots but easy for you.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ── Roomie Chat Bubble ── */}
      <div className="fixed bottom-8 right-8 z-40">
        <button
          className="w-16 h-16 rounded-full border border-white/30 shadow-xl flex items-center justify-center group hover:scale-110 transition-transform"
          style={{
            background: "rgba(255,255,255,0.7)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
          }}
        >
          <span className="material-symbols-outlined text-primary text-3xl group-hover:rotate-12 transition-transform">
            face
          </span>
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-secondary-container rounded-full border-4 border-surface flex items-center justify-center text-[10px] font-bold">
            1
          </span>
        </button>
      </div>

      {/* ── Background decoration ── */}
      <div className="fixed top-0 left-0 w-full h-full -z-10 pointer-events-none overflow-hidden">
        <div className="absolute top-[10%] left-[-5%] w-[40%] h-[40%] bg-primary-container/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[10%] right-[-5%] w-[40%] h-[40%] bg-secondary-container/5 rounded-full blur-[120px]" />
      </div>
    </div>
  );
}