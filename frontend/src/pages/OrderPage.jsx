/**
 * OrderPage.jsx - My Orders Page
 * ==================================
 * Lists all orders placed by the current user.
 *   - Shows a success banner if user just placed a new order
 *   - Each order card shows: order ID, status badge, date, total, item count
 *   - Clicking an order navigates to TrackingPage for detailed tracking
 *
 * API: GET /api/orders - fetches all orders for the logged-in user
 */

import { useEffect, useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import api from "../services/api";

export function OrderPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const justPlaced = location.state?.orderId;

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get("/api/orders");
        setOrders(res.data);
      } catch (err) {
        if (err.response?.status === 401) navigate("/login");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [navigate]);

  if (loading) return <div className="text-center mt-10">Loading orders...</div>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {justPlaced && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <p className="text-green-800 font-semibold">Order #{justPlaced} placed successfully!</p>
        </div>
      )}

      <h1 className="text-3xl font-bold mb-6">My Orders</h1>

      {orders.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No orders yet</p>
          <Link to="/furniture" className="bg-black text-white px-6 py-2 rounded-lg">Browse Furniture</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Link key={order.id} to={`/order/tracking/${order.id}/0`} className="block bg-white shadow rounded-lg p-4 hover:shadow-md transition">
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold">Order #{order.id}</span>
                <span className={`px-2 py-1 rounded text-sm ${order.status === 'delivered' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                  {order.status}
                </span>
              </div>
              <p className="text-sm text-gray-500">
                {order.orderdate ? new Date(order.orderdate).toLocaleDateString() : "N/A"}
              </p>
              <p className="font-semibold mt-1">{order.totalamount} DA</p>
              <p className="text-sm text-gray-400">{order.items?.length || 0} item(s)</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
