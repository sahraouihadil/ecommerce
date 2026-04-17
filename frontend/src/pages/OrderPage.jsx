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

  if (loading) return (
    <div className="min-h-screen bg-cream flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-2 border-accent2 border-t-transparent rounded-full animate-spin" />
        <p className="text-muted text-sm">Loading orders...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-cream text-text">
      <div className="max-w-3xl mx-auto px-6 pt-36 pb-32">

        {justPlaced && (
          <div className="mb-10 p-6 bg-success/10 rounded-xl">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[24px] text-success">check_circle</span>
              <div>
                <p className="text-success font-semibold text-sm">Order #{justPlaced} placed successfully!</p>
                <p className="text-muted text-sm mt-0.5">We'll send you tracking updates via email.</p>
              </div>
            </div>
          </div>
        )}

        <p className="text-[0.8125rem] uppercase tracking-[0.2em] font-semibold text-muted mb-4">Account</p>
        <h1 className="font-serif font-bold text-5xl tracking-tight mb-16">Orders</h1>

        {orders.length === 0 ? (
          <div className="text-center py-24">
            <span className="material-symbols-outlined text-[48px] text-accent2/50 mb-4 block">receipt_long</span>
            <p className="text-muted text-lg mb-6">No orders yet.</p>
            <Link to="/furniture" className="btn-pill btn-pill-black">
              Browse the Collection
            </Link>
          </div>
        ) : (
          <div className="border-t border-surface">
            {orders.map((order) => (
              <Link key={order.id} to={`/order/tracking/${order.id}/0`}
                className="flex items-center justify-between py-6 border-b border-surface
                  hover:bg-surface/50 transition-colors duration-300 -mx-4 px-4 rounded-lg group">
                <div>
                  <span className="font-serif font-semibold text-base
                    group-hover:text-accent2 transition-colors duration-300">
                    Order #{order.id}
                  </span>
                  <p className="text-muted text-xs mt-1">
                    {order.orderdate ? new Date(order.orderdate).toLocaleDateString('en-US', {
                      month: 'long', day: 'numeric', year: 'numeric'
                    }) : "N/A"}
                  </p>
                </div>
                <div className="text-right flex items-center gap-4">
                  <div>
                    <p className="text-muted text-sm capitalize">{order.status}</p>
                    <p className="font-serif font-semibold text-primary mt-1">
                      {order.totalamount} DA
                    </p>
                  </div>
                  <span className="material-symbols-outlined text-[18px] text-muted group-hover:text-primary transition-colors">chevron_right</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
