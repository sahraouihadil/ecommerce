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
      } catch {
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
      navigate("/order", {
        state: { orderId: res.data.order_id, total: res.data.total },
      });
    } catch (err) {
      alert(err?.response?.data?.detail || "Failed to place order");
    } finally {
      setPlacing(false);
    }
  };

  const canSubmit = name && address && city && !placing;

  if (loading) return (
    <div className="min-h-screen bg-cream flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-2 border-accent2 border-t-transparent rounded-full animate-spin" />
        <p className="text-muted text-sm">Loading checkout...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-cream text-text">
      <main className="max-w-7xl mx-auto px-6 pt-36 pb-32">

        <p className="text-[0.8125rem] uppercase tracking-[0.2em] font-semibold text-muted mb-4">Complete your order</p>
        <h1 className="font-serif font-bold text-5xl tracking-tight mb-16">
          Checkout
        </h1>

        <div className="lg:flex lg:gap-16 items-start">

          {/* Left Column */}
          <div className="flex-1 space-y-12">

            {/* Items */}
            <div>
              <h2 className="font-serif font-bold text-xl mb-6">Items</h2>
              <div className="border-t border-surface">
                {items.map((item) => (
                  <div key={item.id}
                    className="flex items-center gap-5 py-6 border-b border-surface">
                    <div className="w-20 h-20 bg-surface rounded-lg overflow-hidden flex-shrink-0">
                      {item.product?.image ? (
                        <img src={item.product.image} alt={item.product.name}
                          className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="material-symbols-outlined text-[24px] text-muted/20">image</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-serif font-semibold text-sm">{item.product?.name ?? "Product"}</h3>
                      <p className="text-muted text-xs mt-1">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-serif font-semibold text-primary">
                      {((item.product?.price || 0) * item.quantity).toFixed(2)} DA
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping Form */}
            <div>
              <h2 className="font-serif font-bold text-xl mb-6">Shipping Details</h2>
              <div className="space-y-5">
                <div>
                  <label className="text-[0.6875rem] text-muted uppercase tracking-[0.1em] font-semibold block mb-2">Full Name</label>
                  <input
                    type="text" value={name} onChange={(e) => setName(e.target.value)}
                    className="w-full h-14 px-4 bg-surface/50 border-b border-muted/20 rounded-t-lg
                      text-sm focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
                <div>
                  <label className="text-[0.6875rem] text-muted uppercase tracking-[0.1em] font-semibold block mb-2">Address</label>
                  <input
                    type="text" value={address} onChange={(e) => setAddress(e.target.value)}
                    className="w-full h-14 px-4 bg-surface/50 border-b border-muted/20 rounded-t-lg
                      text-sm focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
                <div>
                  <label className="text-[0.6875rem] text-muted uppercase tracking-[0.1em] font-semibold block mb-2">City</label>
                  <input
                    type="text" value={city} onChange={(e) => setCity(e.target.value)}
                    className="w-full h-14 px-4 bg-surface/50 border-b border-muted/20 rounded-t-lg
                      text-sm focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Summary */}
          <div className="w-full lg:w-[380px] mt-12 lg:mt-0">
            <div className="sticky top-28 bg-surface rounded-xl p-8">
              <h3 className="font-serif font-bold text-xl mb-8">Order Summary</h3>

              <div className="space-y-3 mb-6">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-muted truncate mr-4">
                      {item.product?.name ?? "Item"} x{item.quantity}
                    </span>
                    <span className="whitespace-nowrap">
                      {((item.product?.price || 0) * item.quantity).toFixed(2)} DA
                    </span>
                  </div>
                ))}
                <div className="flex justify-between text-sm">
                  <span className="text-muted">Shipping</span>
                  <span className="text-success text-xs uppercase font-semibold">Free</span>
                </div>
              </div>

              <div className="pt-6 border-t border-accent/40 flex justify-between items-baseline mb-8">
                <span className="font-serif font-bold text-lg">Total</span>
                <span className="font-serif font-bold text-2xl text-primary">
                  {total.toFixed(2)} DA
                </span>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={!canSubmit}
                className="btn-pill btn-pill-black w-full disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {placing ? "Placing Order..." : "Place Order"}
              </button>

              <p className="text-center text-xs text-muted mt-6 leading-relaxed">
                By completing your purchase you agree to our{" "}
                <a href="#" className="underline text-primary hover:text-accent2 transition-colors">Terms</a> and{" "}
                <a href="#" className="underline text-primary hover:text-accent2 transition-colors">Privacy Policy</a>.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
