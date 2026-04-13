/**
 * CheckoutPage.jsx - Order Checkout Page
 * =========================================
 * Final step before placing an order. Shows:
 *   - Order summary (items from cart + total)
 *   - Shipping information form (name, address, city)
 *   - "Place Order" button
 *
 * FLOW:
 *   1. Loads cart items from GET /api/cart
 *   2. If cart is empty -> redirects to /cart
 *   3. User fills shipping info and clicks "Place Order"
 *   4. Sends POST /api/orders (backend converts cart into an order)
 *   5. On success -> redirects to /order with the new order ID
 */

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export function CheckoutPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const res = await api.get("/api/cart");
        setItems(res.data);
        if (res.data.length === 0) navigate("/cart");
      } catch (err) {
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };
    fetchCart();
  }, [navigate]);

  const total = items.reduce((sum, i) => sum + (i.product?.price || 0) * i.quantity, 0);

  const handlePlaceOrder = async () => {
    if (!name || !address || !city) return;
    setPlacing(true);
    try {
      const res = await api.post("/api/orders");
      navigate("/order", { state: { orderId: res.data.order_id, total: res.data.total } });
    } catch (err) {
      alert(err?.response?.data?.detail || "Failed to place order");
    } finally {
      setPlacing(false);
    }
  };

  if (loading) return <div className="text-center mt-10">Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Checkout</h1>

      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
        {items.map((item) => (
          <div key={item.id} className="flex justify-between py-2 border-b">
            <span>{item.product?.name} x{item.quantity}</span>
            <span>{((item.product?.price || 0) * item.quantity).toFixed(2)} DA</span>
          </div>
        ))}
        <div className="flex justify-between pt-4 font-bold text-lg">
          <span>Total</span>
          <span>{total.toFixed(2)} DA</span>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Shipping Information</h2>
        <div className="space-y-3">
          <input type="text" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)}
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black" />
          <input type="text" placeholder="Address" value={address} onChange={(e) => setAddress(e.target.value)}
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black" />
          <input type="text" placeholder="City" value={city} onChange={(e) => setCity(e.target.value)}
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black" />
        </div>

        <button onClick={handlePlaceOrder} disabled={placing || !name || !address || !city}
          className="w-full mt-6 bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition disabled:opacity-50">
          {placing ? "Placing Order..." : "Place Order"}
        </button>
      </div>
    </div>
  );
}
