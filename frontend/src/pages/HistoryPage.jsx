/**
 * HistoryPage.jsx - Order History Page
 * =======================================
 * Shows a timeline of all past orders for the logged-in user.
 * Each order displays: order ID, status badge, date, and total amount.
 *
 * API: GET /profile/history
 * ROUTE: /profile/history
 */

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export function HistoryPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await api.get("/profile/history");
        setOrders(response.data);
      } catch (error) {
        localStorage.removeItem("token");
        navigate("/login", { replace: true });
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [navigate]);

  if (loading) return <div className="text-center mt-10">Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto mt-10">
      <h1 className="text-3xl font-bold mb-6">Order History</h1>
      {orders.length === 0 ? (
        <p className="text-gray-500">No orders yet.</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-white shadow rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold">Order #{order.id}</span>
                <span className={`px-2 py-1 rounded text-sm ${order.status === 'delivered' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                  {order.status}
                </span>
              </div>
              <p className="text-sm text-gray-500">Date: {new Date(order.orderdate).toLocaleDateString()}</p>
              <p className="font-semibold mt-1">Total: {order.totalamount} DA</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
