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

  if (loading) return (
    <div className="min-h-screen bg-cream flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-2 border-accent2 border-t-transparent rounded-full animate-spin" />
        <p className="text-muted text-sm">Loading order...</p>
      </div>
    </div>
  );

  if (!order) return (
    <div className="min-h-screen bg-cream flex items-center justify-center">
      <div className="text-center">
        <span className="material-symbols-outlined text-[48px] text-accent2/50 mb-4 block">search_off</span>
        <p className="text-muted text-lg mb-4">Order not found</p>
        <Link to="/order" className="btn-pill btn-pill-black">
          Back to Orders
        </Link>
      </div>
    </div>
  );

  const steps = ["pending", "confirmed", "shipped", "delivered"];
  const currentStep = steps.indexOf(order.status) >= 0 ? steps.indexOf(order.status) : 0;

  return (
    <div className="min-h-screen bg-cream text-text">
      <div className="max-w-3xl mx-auto px-6 pt-36 pb-32">

        <Link to="/order"
          className="inline-flex items-center gap-2 text-muted text-sm hover:text-primary transition-colors duration-300 mb-12 font-semibold">
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Back to Orders
        </Link>

        <h1 className="font-serif font-bold text-4xl tracking-tight mb-16">
          Order #{order.id}
        </h1>

        {/* Progress */}
        <div className="mb-16">
          <div className="relative flex items-center justify-between mb-4">
            <div className="absolute top-3 left-0 right-0 h-px bg-surface" />
            <div className="absolute top-3 left-0 h-px bg-primary transition-all duration-500"
              style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }} />

            {steps.map((step, i) => (
              <div key={step} className="relative z-10 flex flex-col items-center">
                <div className={`w-6 h-6 rounded-full border-2 transition-all duration-300 flex items-center justify-center
                  ${i <= currentStep
                    ? 'bg-primary border-primary'
                    : 'bg-cream border-surface'}`}
                >
                  {i <= currentStep && (
                    <span className="material-symbols-outlined text-[14px] text-white">check</span>
                  )}
                </div>
                <span className={`text-[0.6875rem] mt-3 capitalize font-semibold
                  ${i <= currentStep ? 'text-primary' : 'text-muted/40'}`}>
                  {step}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Order Details */}
        <div className="bg-surface rounded-xl p-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <p className="text-[0.6875rem] text-muted uppercase tracking-[0.1em] font-semibold mb-1">Order Date</p>
              <p className="text-sm">
                {order.orderdate ? new Date(order.orderdate).toLocaleDateString('en-US', {
                  month: 'long', day: 'numeric', year: 'numeric'
                }) : "N/A"}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[0.6875rem] text-muted uppercase tracking-[0.1em] font-semibold mb-1">Total</p>
              <p className="font-serif font-bold text-2xl text-primary">
                {order.totalamount} DA
              </p>
            </div>
          </div>

          <div className="border-t border-accent/40 pt-6">
            <p className="text-[0.6875rem] text-muted uppercase tracking-[0.1em] font-semibold mb-4">Items</p>
            {order.items?.map((item) => (
              <div key={item.id} className="flex justify-between py-4 border-b border-surface/60 last:border-b-0">
                <div>
                  <span className="text-sm">{item.product_name || `Product #${item.product_id}`}</span>
                  <span className="text-muted text-xs ml-2">x{item.quantity}</span>
                </div>
                <span className="font-serif font-semibold text-primary">
                  {(item.price * item.quantity).toFixed(2)} DA
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
