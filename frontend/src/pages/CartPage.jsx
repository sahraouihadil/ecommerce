/**
 * CartPage.jsx - Shopping Cart Page
 * ====================================
 * Displays the user's shopping cart with:
 *   - List of items (product name, price, quantity controls)
 *   - Remove button for each item
 *   - Total price calculation
 *   - "Proceed to Checkout" button
 *
 * API ENDPOINTS USED:
 *   GET    /api/cart          - Fetch all cart items
 *   PUT    /api/cart/:itemId  - Update item quantity
 *   DELETE /api/cart/:itemId  - Remove item from cart
 *
 * NOTE: Requires authentication. Redirects to /login if not logged in.
 */

import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";

export function CartPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchCart = async () => {
    try {
      const res = await api.get("/api/cart");
      setItems(res.data);
    } catch (err) {
      if (err.response?.status === 401) navigate("/login");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCart(); }, []);

  const updateQty = async (itemId, qty) => {
    try {
      await api.put(`/api/cart/${itemId}`, null, { params: { quantity: qty } });
      fetchCart();
    } catch (err) {
      console.error(err);
    }
  };

  const removeItem = async (itemId) => {
    try {
      await api.delete(`/api/cart/${itemId}`);
      fetchCart();
    } catch (err) {
      console.error(err);
    }
  };

  const total = items.reduce((sum, i) => sum + (i.product?.price || 0) * i.quantity, 0);

  if (loading) return <div className="text-center mt-10">Loading cart...</div>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Shopping Cart</h1>

      {items.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">Your cart is empty</p>
          <Link to="/furniture" className="bg-black text-white px-6 py-2 rounded-lg">Browse Furniture</Link>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.id} className="flex items-center justify-between bg-white shadow rounded-lg p-4">
                <div>
                  <h3 className="font-semibold">{item.product?.name || "Product"}</h3>
                  <p className="text-gray-500">{item.product?.price} DA</p>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={() => updateQty(item.id, item.quantity - 1)} className="px-2 py-1 border rounded">-</button>
                  <span className="font-semibold">{item.quantity}</span>
                  <button onClick={() => updateQty(item.id, item.quantity + 1)} className="px-2 py-1 border rounded">+</button>
                  <button onClick={() => removeItem(item.id)} className="text-red-500 ml-4">Remove</button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 bg-white shadow rounded-lg p-4 flex justify-between items-center">
            <span className="text-xl font-bold">Total: {total.toFixed(2)} DA</span>
            <Link to="/checkout" className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition">
              Proceed to Checkout
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
