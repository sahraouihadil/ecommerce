 /**
 * SetPassword.jsx - Styled ARoomX Version
 * ======================================
 */

import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../services/api";

export function SetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  const userName = location.state?.userName;

  // If no user → block access
  if (!userName) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <p className="text-red-500 text-center">
          No user found. Please{" "}
          <a href="/register" className="underline font-bold">
            register again
          </a>
          .
        </p>
      </div>
    );
  }

  const handleSetPassword = async () => {
    if (password !== confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setMessage("Password is too short");
      return;
    }

    try {
      setLoading(true);

      const res = await api.post("/set-password", {
        user_name: userName,
        password: password,
      });

      if (res.data.msg) {
        setMessage(res.data.msg);

        setTimeout(() => {
          navigate("/login");
        }, 1500);
      }
    } catch (err) {
      setMessage(err?.response?.data?.detail || "Server Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-6 py-10 font-body">
      <div className="grid grid-cols-1 lg:grid-cols-2 max-w-6xl w-full gap-12 items-center">

        {/* LEFT SIDE */}
        <div className="space-y-6">
          <span className="px-4 py-1 text-xs font-bold uppercase tracking-widest bg-secondary-container text-on-secondary-fixed rounded-full">
            Security First
          </span>

          <h1 className="text-5xl font-headline font-extrabold text-on-surface leading-tight">
            Set Password
          </h1>

          <p className="text-lg text-on-surface-variant">
            Define your magic word. Make it strong enough to protect your account.
          </p>

          {/* Message */}
          {message && (
            <div className="p-3 rounded-lg bg-surface-container-low text-sm text-on-surface">
              {message}
            </div>
          )}
        </div>

        {/* RIGHT SIDE CARD */}
        <div className="relative">
          <div className="absolute -inset-1 bg-primary/10 rounded-2xl blur-xl"></div>

          <div className="relative bg-surface-container-lowest p-8 rounded-2xl shadow-lg space-y-6">

            {/* Password */}
            <div>
              <label className="text-sm font-bold ml-2">
                New Password
              </label>

              <div className="relative mt-2">
                <input
                  type={showPass ? "text" : "password"}
                  placeholder="••••••••••"
                  className="w-full h-14 px-5 rounded-full bg-surface-container-low focus:ring-2 focus:ring-primary outline-none"
                  onChange={(e) => setPassword(e.target.value)}
                />

                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant"
                >
                  {showPass ? "🙈" : "👁"}
                </button>
              </div>
            </div>

            {/* Confirm */}
            <div>
              <label className="text-sm font-bold ml-2">
                Confirm Password
              </label><div className="relative mt-2">
                <input
                  type={showConfirm ? "text" : "password"}
                  placeholder="••••••••••"
                  className="w-full h-14 px-5 rounded-full bg-surface-container-low focus:ring-2 focus:ring-primary outline-none"
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />

                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant"
                >
                  {showConfirm ? "🙈" : "👁"}
                </button>
              </div>
            </div>

            {/* Button */}
            <button
              onClick={handleSetPassword}
              disabled={loading}
              className="w-full h-14 rounded-full bg-[#583ba5] text-white text-on-primary font-bold text-lg hover:shadow-lg transition active:scale-95 flex items-center justify-center gap-2"
            >
              {loading ? "Saving..." : "Secure My Account"}
              <span>🔑</span>
            </button>

            {/* small hint */}
            <p className="text-xs text-on-surface-variant text-center">
              Use a strong mix of letters, numbers & symbols.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}