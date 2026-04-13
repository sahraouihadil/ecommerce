/**
 * AccountantDashboard.jsx - Accountant Role Dashboard
 * ======================================================
 * Placeholder dashboard for users with the "accountant" role.
 * On mount, verifies the user's token by calling GET /accountant-dash.
 * If not authorized, redirects to homepage.
 *
 * TODO: Add financial reports, invoice management, revenue charts.
 */

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export function AccountantDashboard() {
  const navigate = useNavigate();

  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login", { replace: true });
        return;
      }
      try {
        await api.get("/accountant-dash");
      } catch (error) {
        localStorage.removeItem("token");
        navigate("/");
      }
    };
    verifyToken();
  }, [navigate]);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold">Accountant Dashboard</h1>
      <p className="text-gray-500 mt-4">Financial reports and accounting tools will appear here.</p>
    </div>
  );
}
