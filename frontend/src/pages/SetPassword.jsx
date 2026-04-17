import { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
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

  if (!userName) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center px-6">
        <div className="text-center">
          <span className="material-symbols-outlined text-[48px] text-rose/50 mb-4 block">error</span>
          <p className="text-muted text-lg mb-4">
            No user found. Please{" "}
            <Link to="/register" className="text-charcoal font-semibold underline underline-offset-4 hover:text-rose transition-colors">
              register again
            </Link>.
          </p>
        </div>
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
    <div className="min-h-dvh bg-cream flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-[440px]">

        <div className="text-center mb-12">
          <Link to="/" className="font-serif text-2xl font-bold text-charcoal">ARoom</Link>
          <h1 className="font-serif font-bold text-4xl tracking-tight mt-8 mb-3">
            Set Password
          </h1>
          <p className="text-muted text-sm">
            Choose a strong password to secure your account.
          </p>
        </div>

        <div className="bg-surface rounded-xl p-10 space-y-6">

          <div>
            <label className="text-[0.6875rem] text-muted uppercase tracking-[0.1em] font-semibold block mb-2">
              New Password
            </label>
            <div className="relative">
              <input
                type={showPass ? "text" : "password"}
                placeholder="Enter password"
                value={password}
                className="w-full h-14 px-4 pr-12 bg-cream border-b border-muted/20 rounded-t-lg
                  text-sm focus:outline-none focus:border-charcoal transition-colors"
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-charcoal transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">
                  {showPass ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
          </div>

          <div>
            <label className="text-[0.6875rem] text-muted uppercase tracking-[0.1em] font-semibold block mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                placeholder="Confirm password"
                value={confirmPassword}
                className="w-full h-14 px-4 pr-12 bg-cream border-b border-muted/20 rounded-t-lg
                  text-sm focus:outline-none focus:border-charcoal transition-colors"
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-charcoal transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">
                  {showConfirm ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
          </div>

          {message && (
            <div className={`p-3 rounded-xl text-sm font-medium text-center ${
              message.includes("match") || message.includes("short") || message.includes("Error")
                ? 'bg-danger/10 text-danger'
                : 'bg-success/10 text-success'
            }`}>
              {message}
            </div>
          )}

          <button
            onClick={handleSetPassword}
            disabled={loading}
            className="btn-pill btn-pill-black w-full
              disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Saving..." : "Set Password"}
          </button>

          <p className="text-[0.75rem] text-muted text-center">
            Use a strong mix of letters, numbers & symbols.
          </p>
        </div>
      </div>
    </div>
  );
}
