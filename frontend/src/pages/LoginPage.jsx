import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login, isAuthenticated } from "../services/auth";

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
      console.log(username,password);
      console.log(data);
      setLoading(false);
      if (data && data.access_token) {
        localStorage.setItem("token", data.access_token);
        localStorage.setItem("role", data.role);
        if (data.role === "admin") navigate("/admin-dash");
        else if (data.role === "accountant") navigate("/accountant-dash");
        else if (data.role === "marketing_manager") navigate("/marketing-manager-dash");
        else if (data.role === "stock_manager") navigate("/stock-manager-dash");
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

  return (
    <div className="min-h-dvh bg-cream flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-[440px]">

        <div className="text-center mb-12">
          <Link to="/" className="font-serif text-2xl font-bold text-charcoal">ARoom</Link>
          <h1 className="font-serif font-bold text-4xl tracking-tight mt-8 mb-3">
            Sign In
          </h1>
          <p className="text-muted text-sm">
            Welcome back. Sign in to access your account.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-surface rounded-xl p-10 space-y-5">

          {/* Username */}
          <div>
            <label className="text-[0.6875rem] font-semibold uppercase tracking-[0.1em] text-muted block mb-2">Username</label>
            <div className="flex items-center gap-3 bg-cream rounded-full px-5 border-2 border-transparent focus-within:border-charcoal focus-within:bg-blush/10 transition-all">
              <span className="material-symbols-outlined text-[18px] text-muted">person</span>
              <input
                type="text"
                placeholder="your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="flex-1 py-4 bg-transparent border-none outline-none text-[0.95rem] text-charcoal placeholder:text-muted/40"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-[0.6875rem] font-semibold uppercase tracking-[0.1em] text-muted">Password</label>
              <a href="#" className="text-[0.8rem] font-semibold text-charcoal hover:text-rose transition-colors">Forgot?</a>
            </div>
            <div className="flex items-center gap-3 bg-cream rounded-full px-5 border-2 border-transparent focus-within:border-charcoal focus-within:bg-blush/10 transition-all">
              <span className="material-symbols-outlined text-[18px] text-muted">lock</span>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="flex-1 py-4 bg-transparent border-none outline-none text-[0.95rem] text-charcoal placeholder:text-muted/40"
              />
              <button type="button" onClick={() => setShowPassword(p => !p)} className="text-muted hover:text-charcoal transition-colors">
                <span className="material-symbols-outlined text-[18px]">{showPassword ? 'visibility_off' : 'visibility'}</span>
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="p-3 rounded-xl bg-danger/10 text-danger text-sm text-center font-medium">
              {error}
            </div>
          )}

          {/* Submit */}
          <div className="pt-2 flex flex-col gap-4">
            <button
              type="submit"
              disabled={loading}
              className="btn-pill btn-pill-black w-full gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Signing in..." : "Sign In"}
              {!loading && <span className="material-symbols-outlined text-[20px]">arrow_forward</span>}
            </button>

            <div className="flex items-center gap-4">
              <div className="flex-1 h-px bg-blush" />
              <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.15em] text-muted/50">or</span>
              <div className="flex-1 h-px bg-blush" />
            </div>

            <button
              type="button"
              onClick={() => navigate("/register")}
              className="btn-pill btn-pill-outline w-full"
            >
              Create Account
            </button>
          </div>
        </form>

        <div className="mt-8 text-center">
          <p className="text-muted text-[0.8rem] leading-[1.6]">
            By signing in, you agree to our{" "}
            <a href="#" className="underline text-charcoal hover:text-rose transition-colors">Terms</a> and{" "}
            <a href="#" className="underline text-charcoal hover:text-rose transition-colors">Privacy Policy</a>.
          </p>

          <p className="mt-6 text-sm text-muted">
            Don't have an account?{" "}
            <Link to="/register" className="text-charcoal font-semibold hover:text-rose transition-colors">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
