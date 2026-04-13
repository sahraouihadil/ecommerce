/**
 * TrackingPage.jsx - Order Tracking Page
 * =========================================
 * Shows detailed tracking for a specific order, including:
 *   - Visual progress bar: Pending -> Confirmed -> Shipped -> Delivered
 *   - Order details: date, total, and list of items
 *
 * ROUTE: /order/tracking/:orderId/:productId
 * API:   GET /api/orders/:orderId
 */

import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../services/api";

export function TrackingPage() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await api.get(`/api/orders/${orderId}`);
        setOrder(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  if (loading) return <div className="text-center mt-10">Loading order...</div>;
  if (!order) return <div className="text-center mt-10 text-red-500">Order not found</div>;

  const steps = ["pending", "confirmed", "shipped", "delivered"];
  const currentStep = steps.indexOf(order.status) >= 0 ? steps.indexOf(order.status) : 0;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Link to="/order" className="text-gray-500 hover:text-black mb-4 inline-block">← Back to Orders</Link>
      <h1 className="text-3xl font-bold mb-6">Order #{order.id}</h1>

      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="font-semibold mb-4">Tracking Status</h2>
        <div className="flex justify-between mb-2">
          {steps.map((step, i) => (
            <div key={step} className={`flex-1 text-center text-sm ${i <= currentStep ? 'text-black font-semibold' : 'text-gray-300'}`}>
              <div className={`w-8 h-8 mx-auto mb-1 rounded-full flex items-center justify-center ${i <= currentStep ? 'bg-black text-white' : 'bg-gray-200'}`}>
                {i + 1}
              </div>
              {step.charAt(0).toUpperCase() + step.slice(1)}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="font-semibold mb-4">Order Details</h2>
        <p className="text-sm text-gray-500 mb-2">Date: {order.orderdate ? new Date(order.orderdate).toLocaleDateString() : "N/A"}</p>
        <p className="font-semibold mb-4">Total: {order.totalamount} DA</p>
        <div className="space-y-2">
          {order.items?.map((item) => (
            <div key={item.id} className="flex justify-between py-2 border-b">
              <span>{item.product_name || `Product #${item.product_id}`} x{item.quantity}</span>
              <span>{(item.price * item.quantity).toFixed(2)} DA</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
