// components/AuthProvider.jsx
import { useEffect, useState, createContext, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../services/api";

// ── Context so any component can trigger a logout ──────────────────────────
const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

// Public routes that should never trigger a redirect to /login
const PUBLIC_PATHS = [
  "/login",
  "/register",
  "/verify-code",
  "/set-password",
  "/",
  "/furniture",
  "/journal",
  "/contactus",
  "/aboutus",
  "/product",
  "/search",
  "/faq",
  "/terms",
  "/privacy"
];

const isPublicPath = (pathname) =>
  PUBLIC_PATHS.some((p) =>
    p === "/" ? pathname === "/" : pathname.startsWith(p)
  );

export default function AuthProvider({ children }) {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  // ── Core verify function (reusable) ──────────────────────────────────────
  const verifyToken = async (options = {}) => {
    const token = localStorage.getItem("token");

    // No token at all — clean up and redirect if on a protected page
    if (!token) {
      localStorage.removeItem("role");
      if (!isPublicPath(location.pathname)) {
        navigate("/login", { replace: true });
      }
      return false;
    }

    try {
      const res = await api.get("/me");
      localStorage.setItem("role", res.data.role);
      return true;
    } catch (err) {
      // 401 = expired / invalid token → log out
      if (err?.response?.status === 401 || err?.response?.status === 403) {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        if (!isPublicPath(location.pathname)) {
          navigate("/login", { replace: true, state: { expired: true } });
        }
      }
      return false;
    }
  };

  // ── On every route change: re-verify ─────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      setLoading(true);
      await verifyToken();
      if (!cancelled) setLoading(false);
    };

    run();

    return () => { cancelled = true; };
  }, [location.pathname]); // ← re-runs on every navigation

  // ── Periodic background check every 3 minutes ────────────────────────────
  useEffect(() => {
    const interval = setInterval(() => {
      verifyToken();
    }, 3 * 60 * 1000);

    return () => clearInterval(interval);
  }, [location.pathname]);

  // ── Logout helper exposed via context ────────────────────────────────────
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login", { replace: true });
  };

  if (loading) {
    return (
      <div style={{
        minHeight: "100dvh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#F5F0E8",
        fontFamily: "'Cormorant Garamond', Georgia, serif",
        fontSize: "1rem",
        color: "#9E8E7A",
        letterSpacing: "0.15em",
      }}>
        <span>Loading…</span>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ logout, verifyToken }}>
      {children}
    </AuthContext.Provider>
  );
}