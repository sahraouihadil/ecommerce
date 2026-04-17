import { useState, useRef } from "react";
import api from "../services/api";
import { useLocation, useNavigate, Navigate, Link } from "react-router-dom";

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

  const handleChange = (index, value) => {
    const char = value.replace(/\D/g, "").slice(-1);
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

  return (
    <div className="min-h-dvh bg-cream flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-[440px]">

        <div className="text-center mb-12">
          <Link to="/" className="font-serif text-2xl font-bold text-charcoal">ARoom</Link>
          <h1 className="font-serif font-bold text-4xl tracking-tight mt-8 mb-4">
            Verify Your Code
          </h1>
          <p className="text-muted text-sm">
            Enter the {DIGITS}-digit code sent to
          </p>
          <p className="text-charcoal text-sm font-semibold mt-1">{email}</p>
        </div>

        <div className="bg-surface rounded-xl p-10">

          <div className="flex justify-center gap-3 mb-8" onPaste={handlePaste}>
            {digits.map((d, i) => (
              <input
                key={i}
                ref={el => inputRefs.current[i] = el}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={d}
                onChange={e => handleChange(i, e.target.value)}
                onKeyDown={e => handleKeyDown(i, e)}
                className={`w-12 h-14 text-center text-xl font-serif font-bold
                  bg-cream border-b-2 rounded-t-lg outline-none transition-colors duration-300
                  focus:border-charcoal
                  ${d ? 'border-rose' : 'border-muted/20'}`}
              />
            ))}
          </div>

          <button onClick={handleVerify} disabled={loading}
            className="btn-pill btn-pill-black w-full mb-5
              disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? "Verifying..." : "Verify Code"}
          </button>

          <button onClick={handleResend}
            className="block mx-auto text-muted text-sm hover:text-charcoal transition-colors duration-300 font-semibold">
            Resend Code
          </button>

          {message && (
            <p className={`mt-5 text-center text-sm font-medium ${isError ? 'text-danger' : 'text-success'}`}>
              {message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
