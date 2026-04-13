/**
 * DeliverymanDashboard.jsx - Deliveryman Role Dashboard
 * ========================================================
 * Placeholder dashboard for users with the "deliveryman" role.
 * On mount, verifies the user's token by calling GET /deliveryman-dash.
 * If not authorized, redirects to homepage.
 *
 * TODO: Add delivery queue, route planner, delivery status updates.
 */

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export function DeliverymanDashboard() {
  const navigate = useNavigate();

  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login", { replace: true });
        return;
      }
      try {
        await api.get("/deliveryman-dash");
      } catch (error) {
        localStorage.removeItem("token");
        navigate("/");
      }
    };
    verifyToken();
  }, [navigate]);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold">Deliveryman Dashboard</h1>
      <p className="text-gray-500 mt-4">Delivery queue and tracking tools will appear here.</p>
    </div>
  );
}
