/**
 * MarketingManagerDashboard.jsx - Marketing Manager Role Dashboard
 * ==================================================================
 * Placeholder dashboard for users with the "marketing manager" role.
 * On mount, verifies the user's token by calling GET /marketing-manager-dash.
 * If not authorized, redirects to homepage.
 *
 * TODO: Add campaign management, engagement analytics, promotion tools.
 */

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export function MarketingMngrDashboard() {
  const navigate = useNavigate();

  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login", { replace: true });
        return;
      }
      try {
        await api.get("/marketing-manager-dash");
      } catch (error) {
        localStorage.removeItem("token");
        navigate("/");
      }
    };
    verifyToken();
  }, [navigate]);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold">Marketing Manager Dashboard</h1>
      <p className="text-gray-500 mt-4">Campaign and engagement tools will appear here.</p>
    </div>
  );
}
