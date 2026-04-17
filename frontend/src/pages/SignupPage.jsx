import { Link } from "react-router-dom";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { register } from "../services/auth";

export function SignupPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNum, setPhoneNum] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validateForm = () => {
    if (!username || !password || !email) { setError("Username, email and password are required."); return false; }
    setError(""); return true;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    try {
      const data = await register(username, password, email, phoneNum);
      setLoading(false);
      if (data.action === "verify") { navigate("/verify-code", { state: { email } }); return; }
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
    <div className="min-h-dvh bg-cream flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-[440px]">

        <div className="text-center mb-12">
          <Link to="/" className="font-serif text-2xl font-bold text-charcoal">ARoom</Link>
          <h1 className="font-serif font-bold text-4xl tracking-tight mt-8 mb-3">
            Create Account
          </h1>
          <p className="text-muted text-sm">
            Sign up to preview furniture in your room with AR.
          </p>
        </div>

        <form onSubmit={handleSubmit}
          className="bg-surface rounded-xl p-10 space-y-5">

          <div>
            <label className="text-[0.6875rem] text-muted uppercase tracking-[0.1em] font-semibold block mb-2">Full Name</label>
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)}
              className="w-full h-14 px-4 bg-cream border-b border-muted/20 rounded-t-lg
                text-sm focus:outline-none focus:border-charcoal transition-colors" />
          </div>
          <div>
            <label className="text-[0.6875rem] text-muted uppercase tracking-[0.1em] font-semibold block mb-2">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full h-14 px-4 bg-cream border-b border-muted/20 rounded-t-lg
                text-sm focus:outline-none focus:border-charcoal transition-colors" />
          </div>
          <div>
            <label className="text-[0.6875rem] text-muted uppercase tracking-[0.1em] font-semibold block mb-2">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full h-14 px-4 bg-cream border-b border-muted/20 rounded-t-lg
                text-sm focus:outline-none focus:border-charcoal transition-colors" />
          </div>
          <div>
            <label className="text-[0.6875rem] text-muted uppercase tracking-[0.1em] font-semibold block mb-2">Phone (optional)</label>
            <input type="text" value={phoneNum} onChange={(e) => setPhoneNum(e.target.value)}
              className="w-full h-14 px-4 bg-cream border-b border-muted/20 rounded-t-lg
                text-sm focus:outline-none focus:border-charcoal transition-colors" />
          </div>

          {error && (
            <p className="text-danger text-sm text-center p-3 rounded-xl bg-danger/10">{error}</p>
          )}

          <button type="submit" disabled={loading}
            className="btn-pill btn-pill-black w-full mt-2
              disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p className="text-center mt-8 text-sm text-muted">
          Already have an account?{" "}
          <Link to="/login" className="text-charcoal font-semibold hover:text-rose transition-colors duration-300">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
