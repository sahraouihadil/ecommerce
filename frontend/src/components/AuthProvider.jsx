// components/AuthProvider.jsx

import { useEffect, useState, createContext} from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../services/api";

// ───────────────── CONTEXT ─────────────────
const AuthContext = createContext(null);

// ───────────────── PUBLIC ROUTES ─────────────────
const PUBLIC_PATHS = [
  "/login",
  "/register",
  "/verify-code",
  "/set-password",
  "/",
  "/furniture",
  "/journal",
  "/aboutus",
  "/product",
  "/search",
  "/faq",
  "/terms",
  "/privacy",
];

// routes allowed for each role
const ROLE_ROUTES = {
  admin: ["/admin-dash"],

  marketing_manager: ["/marketing-manager-dash"],

  stock_manager: ["/stock-manager-dash"],

  deliveryman: ["/deliveryman-dash"],

  customer: [
    "/cart",
    "/checkout",
    "/profile",
    "/favorite",
    "/order",
    "/contactus"
  ],
};

// ───────────────── HELPERS ─────────────────

const isPublicPath = (pathname) => {
  return PUBLIC_PATHS.some((p) =>
    p === "/" ? pathname === "/" : pathname.startsWith(p)
  );
};

const isAllowedForRole = (pathname, role) => {
  // public always allowed
  if (isPublicPath(pathname)) return true;

  // no role
  if (!role) return false;

  const allowedRoutes = ROLE_ROUTES[role] || [];

  return allowedRoutes.some((route) =>
    pathname.startsWith(route)
  );
};

const getDashboardByRole = (role) => {
  switch (role) {
    case "admin":
      return "/admin-dash";

    case "marketing_manager":
      return "/marketing-manager-dash";

    case "stock_manager":
      return "/stock-manager-dash";

    case "deliveryman":
      return "/deliveryman-dash";

    case "customer":
    default:
      return "/";
  }
};

// ───────────────── PROVIDER ─────────────────

export default function AuthProvider({ children }) {
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const location = useLocation();

  // ───────────────── VERIFY TOKEN ─────────────────
  const verifyToken = async () => {
    const token = localStorage.getItem("token");

    // no token
    if (!token) {
      localStorage.removeItem("role");

      if (!isPublicPath(location.pathname)) {
        navigate("/login", { replace: true });
      }

      return false;
    }

    try {
      const res = await api.get("/me");

      const role = res.data.role;

      // save role
      localStorage.setItem("role", role);

      // role trying to access forbidden area
      if (!isAllowedForRole(location.pathname, role)) {
        navigate(getDashboardByRole(role), {
          replace: true,
        });
      }

      return true;

    } catch (err) {

      if (
        err?.response?.status === 401 ||
        err?.response?.status === 403
      ) {
        localStorage.removeItem("token");
        localStorage.removeItem("role");

        if (!isPublicPath(location.pathname)) {
          navigate("/login", {
            replace: true,
            state: { expired: true },
          });
        }
      }

      return false;
    }
  };

  // ───────────────── ROUTE CHANGE VERIFY ─────────────────
  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      setLoading(true);

      await verifyToken();

      if (!cancelled) {
        setLoading(false);
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [location.pathname]);

  // ───────────────── BACKGROUND VERIFY ─────────────────
  useEffect(() => {
    const interval = setInterval(() => {
      verifyToken();
    }, 3 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  // ───────────────── LOGOUT ─────────────────
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");

    navigate("/login", { replace: true });
  };

  // ───────────────── LOADING ─────────────────
  if (loading) {
    return (
      <div
        style={{
          minHeight: "100dvh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#F5F0E8",
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontSize: "1rem",
          color: "#9E8E7A",
          letterSpacing: "0.15em",
        }}
      >
        <span>Loading…</span>
      </div>
    );
  }

  // ───────────────── PROVIDER ─────────────────
  return (
    <AuthContext.Provider
      value={{
        logout,
        verifyToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}