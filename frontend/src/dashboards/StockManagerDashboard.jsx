/**
 * StockManagerDashboard.jsx - Stock Manager Role Dashboard
 * ===========================================================
 * Placeholder dashboard for users with the "stock manager" role.
 * On mount, verifies the user's token by calling GET /stock-manager-dash.
 * If not authorized, redirects to homepage.
 *
 * TODO: Add inventory management, stock levels, reorder alerts.
 */

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export function StockMngrDashboard() {
  const navigate = useNavigate();

  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login", { replace: true });
        return;
      }
      try {
        await api.get("/stock-manager-dash");
      } catch (error) {
        localStorage.removeItem("token");
        navigate("/");
      }
    };
    verifyToken();
  }, [navigate]);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold">Stock Manager Dashboard</h1>
      <p className="text-gray-500 mt-4">Inventory management tools will appear here.</p>
    </div>
  );
}
