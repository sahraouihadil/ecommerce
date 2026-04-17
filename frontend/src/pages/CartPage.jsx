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
  const shipping = 0;
  const taxes = subtotal * 0.08;
  const total = subtotal + taxes;

  if (loading) return (
    <div className="min-h-screen bg-cream flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-2 border-accent2 border-t-transparent rounded-full animate-spin" />
        <p className="text-muted text-sm">Loading cart...</p>
      </div>
    </div>
  );

  return (
    <div className="bg-cream text-text min-h-screen">
      <main className="max-w-7xl mx-auto px-6 pt-36 pb-32">

        <div className="mb-16">
          <p className="text-[0.8125rem] uppercase tracking-[0.2em] font-semibold text-muted mb-4">Shopping</p>
          <h1 className="font-serif font-bold text-5xl tracking-tight">
            Cart
          </h1>
          {items.length > 0 && (
            <p className="text-muted text-sm mt-3">{items.length} item{items.length !== 1 ? 's' : ''}</p>
          )}
        </div>

        {items.length === 0 ? (
          <div className="text-center py-24">
            <span className="material-symbols-outlined text-[48px] text-accent2/50 mb-4 block">shopping_bag</span>
            <p className="text-muted text-lg mb-6">Your cart is empty.</p>
            <Link to="/furniture" className="btn-pill btn-pill-black">
              Browse the Collection
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">

            {/* Cart Items */}
            <div className="lg:col-span-8 space-y-0">
              <div className="border-t border-surface">
                {items.map((item) => (
                  <div key={item.id}
                    className="flex items-center gap-6 py-8 border-b border-surface">

                    {/* Image */}
                    <div className="w-24 h-24 bg-surface rounded-lg flex-shrink-0 overflow-hidden">
                      {item.product?.image ? (
                        <img src={item.product.image} alt={item.product?.name}
                          className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="material-symbols-outlined text-[24px] text-muted/20">image</span>
                        </div>
                      )}
                    </div>

                    {/* Name + Category */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-serif font-semibold text-base">
                        {item.product?.name || "Product"}
                      </h3>
                      {item.product?.category && (
                        <p className="text-muted text-xs mt-1">{item.product.category}</p>
                      )}
                    </div>

                    {/* Quantity */}
                    <div className="flex items-center gap-0 border border-surface rounded-full">
                      <button
                        onClick={() => updateQty(item.id, item.quantity - 1)}
                        className="w-9 h-9 flex items-center justify-center text-muted hover:text-primary transition-colors text-lg"
                      >
                        &minus;
                      </button>
                      <span className="text-sm font-semibold w-8 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQty(item.id, item.quantity + 1)}
                        className="w-9 h-9 flex items-center justify-center text-muted hover:text-primary transition-colors text-lg"
                      >
                        +
                      </button>
                    </div>

                    {/* Price */}
                    <p className="font-serif font-semibold text-primary text-lg w-28 text-right">
                      {item.product?.price} DA
                    </p>

                    {/* Remove */}
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-muted hover:text-danger transition-colors"
                      aria-label="Remove item"
                    >
                      <span className="material-symbols-outlined text-[20px]">close</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Summary */}
            <div className="lg:col-span-4 lg:sticky lg:top-28">
              <div className="bg-surface rounded-xl p-8">
                <h3 className="font-serif font-bold text-xl mb-8">
                  Order Summary
                </h3>

                <div className="space-y-4 mb-8">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted">Subtotal</span>
                    <span>{subtotal.toFixed(2)} DA</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted">Shipping</span>
                    <span className="text-success text-xs uppercase tracking-wide font-semibold">Free</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted">Taxes (8%)</span>
                    <span>{taxes.toFixed(2)} DA</span>
                  </div>
                </div>

                <div className="pt-6 border-t border-accent/40 flex justify-between items-baseline mb-8">
                  <span className="font-serif font-bold text-lg">Total</span>
                  <span className="font-serif font-bold text-2xl text-primary">
                    {total.toFixed(2)} DA
                  </span>
                </div>

                <Link to="/checkout"
                  className="btn-pill btn-pill-black w-full text-center">
                  Proceed to Checkout
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
