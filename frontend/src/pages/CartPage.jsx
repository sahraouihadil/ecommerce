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
    if (qty < 1) return;
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

  const subtotal = items.reduce((sum, i) => sum + (i.product?.price || 0) * i.quantity, 0);
  const taxes = subtotal * 0.08;
  const total = subtotal + taxes;

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-surface font-body">
      <div className="flex flex-col items-center gap-4 text-on-surface-variant">
        <span
          className="material-symbols-outlined text-5xl text-primary animate-bounce-short"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          shopping_cart
        </span>
        <p className="font-label font-medium text-lg">Loading cart...</p>
      </div>
    </div>
  );

  return (
    <div className="bg-surface font-body text-on-surface min-h-screen">

      {/* ── Top Navigation ── */}
      <header className="flex justify-between items-center px-6 py-4 w-full sticky top-0 z-50 bg-surface rounded-b-xl shadow-[0px_20px_40px_rgba(45,47,48,0.06)]">
        <div className="flex items-center gap-4">
          <button className="scale-95 active:scale-90 transition-transform duration-200 hover:bg-surface-container-high p-2 rounded-full">
            <span className="material-symbols-outlined text-primary">menu</span>
          </button>
          <h1 className="text-2xl font-black text-primary tracking-tighter italic font-headline">ARoomX</h1>
        </div>
        <div className="flex items-center gap-2">
          <button className="scale-95 active:scale-90 transition-transform duration-200 hover:bg-surface-container-high p-2 rounded-full">
            <span className="material-symbols-outlined text-primary">search</span>
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 pt-8 pb-32">

        {/* ── Editorial Header ── */}
        <div className="mb-12">
          <p className="font-label text-secondary tracking-widest text-xs font-bold uppercase mb-2">
            Review Your Finds
          </p>
          <h2 className="font-headline font-bold text-5xl text-on-surface tracking-tight">
            Your Cart{" "}
            <span className="text-primary-fixed italic font-black">Ready for Magic?</span>
          </h2>
        </div>

        {/* ── Empty State ── */}
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <span
              className="material-symbols-outlined text-8xl text-primary-container mb-6"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              shopping_cart
            </span>
            <h3 className="font-headline font-bold text-3xl text-on-surface mb-3">Your cart is empty</h3>
            <p className="text-on-surface-variant text-lg mb-8 max-w-sm">
              Discover pieces that speak to you and add them here.
            </p>
            <Link
              to="/furniture"
              className="px-10 py-4 bg-primary text-on-primary rounded-full font-semibold text-lg hover:bg-primary-dim transition-colors"
            >
              Browse Furniture
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

            {/* ── Cart Items ── */}
            <div className="lg:col-span-8 space-y-6">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="bg-surface-container-lowest rounded-xl p-6 flex flex-col md:flex-row gap-6 items-center shadow-[0px_20px_40px_rgba(45,47,48,0.06)] relative overflow-hidden group transition-all"
                >
                  {/* Product image */}
                  <div className="w-full md:w-48 h-48 bg-surface-container-low rounded-lg overflow-hidden flex items-center justify-center flex-shrink-0">
                    {item.product?.image ? (
                      <img
                        src={item.product.image}
                        alt={item.product?.name}
                        className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <span className="material-symbols-outlined text-6xl text-primary-container">chair</span>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 flex flex-col justify-between h-full w-full">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-headline font-bold text-2xl text-on-surface">
                          {item.product?.name || "Product"}
                        </h3>
                        <p className="text-on-surface-variant text-sm mt-1">
                          {item.product?.variant ?? ""}
                        </p>
                      </div>
                      <p className="font-headline font-bold text-2xl text-primary whitespace-nowrap">
                        {item.product?.price} DA
                      </p>
                    </div>
                    {/* Qty controls + Remove */}
                    <div className="mt-8 flex justify-between items-center">
                      <div className="flex items-center bg-surface-container-high rounded-full px-4 py-2 gap-4">
                        <button
                          onClick={() => updateQty(item.id, item.quantity - 1)}
                          className="text-primary hover:scale-125 transition-transform"
                          aria-label="Decrease quantity"
                        >
                          <span className="material-symbols-outlined text-lg">remove</span>
                        </button>
                        <span className="font-headline font-bold w-6 text-center">
                          {String(item.quantity).padStart(2, "0")}
                        </span>
                        <button
                          onClick={() => updateQty(item.id, item.quantity + 1)}
                          className="text-primary hover:scale-125 transition-transform"
                          aria-label="Increase quantity"
                        >
                          <span className="material-symbols-outlined text-lg">add</span>
                        </button>
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-on-surface-variant hover:text-error transition-colors flex items-center gap-1"
                        aria-label="Remove item"
                      >
                        <span className="material-symbols-outlined">delete</span>
                        <span className="font-label text-xs font-bold uppercase tracking-wider">Remove</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* ── Summary Panel ── */}
            <div className="lg:col-span-4 sticky top-32">
              <div className="bg-surface-container-low rounded-xl p-8 shadow-inner">
                <h3 className="font-headline font-bold text-2xl mb-8">Summary</h3>

                <div className="space-y-4 mb-8">
                  <div className="flex justify-between text-on-surface-variant">
                    <span>Subtotal</span>
                    <span className="font-headline font-bold text-on-surface">
                      {subtotal.toFixed(2)} DA
                    </span>
                  </div>
                  <div className="flex justify-between text-on-surface-variant">
                    <span>Magic Shipping</span>
                    <span className="font-headline font-bold text-tertiary">FREE</span>
                  </div>
                  <div className="flex justify-between text-on-surface-variant">
                    <span>Taxes (8%)</span>
                    <span className="font-headline font-bold text-on-surface">
                      {taxes.toFixed(2)} DA
                    </span>
                  </div>
                  <div className="pt-4 border-t border-outline-variant/15 flex justify-between items-baseline">
                    <span className="font-headline font-bold text-xl">Total</span>
                    <span className="font-headline font-bold text-3xl text-primary">
                      {total.toFixed(2)} DA
                    </span>
                  </div>
                </div>

                {/* Checkout CTA */}
                <Link
                  to="/checkout"
                  className="w-full bg-primary text-on-primary rounded-full py-6 font-headline font-extrabold text-lg flex items-center justify-center gap-3 hover:bg-primary-dim hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-primary/20 group"
                >
                  Continue to Magic Checkout
                  <span className="material-symbols-outlined group-hover:translate-x-2 transition-transform">
                    magic_button
                  </span>
                </Link>{/* Trust badges */}
                <div className="mt-6 flex flex-col gap-3">
                  <div className="flex items-center gap-3 p-3 bg-surface-container-lowest rounded-lg">
                    <span className="material-symbols-outlined text-tertiary">verified_user</span>
                    <span className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">
                      30-Day Bliss Guarantee
                    </span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-surface-container-lowest rounded-lg">
                    <span className="material-symbols-outlined text-secondary">local_shipping</span>
                    <span className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">
                      Eco-Neutral Delivery
                    </span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}
      </main>

      {/* ── Bottom Navigation ── */}
      <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pb-6 pt-2 bg-white/80 backdrop-blur-xl rounded-t-xl border-none shadow-[0px_-10px_40px_rgba(45,47,48,0.08)]">
        <Link
          to="/"
          className="flex flex-col items-center justify-center text-outline-variant px-4 py-2 hover:text-primary transition-all"
        >
          <span className="material-symbols-outlined">home</span>
          <span className="font-label font-medium text-[10px] uppercase tracking-widest">Home</span>
        </Link>
        <Link
          to="/furniture"
          className="flex flex-col items-center justify-center text-outline-variant px-4 py-2 hover:text-primary transition-all"
        >
          <span className="material-symbols-outlined">explore</span>
          <span className="font-label font-medium text-[10px] uppercase tracking-widest">Browse</span>
        </Link>
        <Link
          to="/roomie"
          className="flex flex-col items-center justify-center text-outline-variant px-4 py-2 hover:text-primary transition-all"
        >
          <span className="material-symbols-outlined">smart_toy</span>
          <span className="font-label font-medium text-[10px] uppercase tracking-widest">Roomie</span>
        </Link>
        {/* Active — Cart */}
        <Link
          to="/cart"
          className="flex flex-col items-center justify-center bg-primary text-on-primary rounded-full px-6 py-2 scale-105 shadow-lg animate-bounce-short"
        >
          <span
            className="material-symbols-outlined"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            shopping_cart
          </span>
          <span className="font-label font-medium text-[10px] uppercase tracking-widest">Cart</span>
        </Link>
      </nav>
    </div>
  );
}
