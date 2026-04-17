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

  if (loading) return (
    <div className="min-h-screen bg-cream flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-2 border-accent2 border-t-transparent rounded-full animate-spin" />
        <p className="text-muted text-sm">Loading history...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-cream text-text">
      <div className="max-w-3xl mx-auto px-6 pt-36 pb-32">

        <p className="text-[0.8125rem] uppercase tracking-[0.2em] font-semibold text-muted mb-4">Account</p>
        <h1 className="font-serif font-bold text-5xl tracking-tight mb-16">
          Order History
        </h1>

        {orders.length === 0 ? (
          <div className="text-center py-24">
            <span className="material-symbols-outlined text-[48px] text-accent2/50 mb-4 block">history</span>
            <p className="text-muted text-lg">No history yet.</p>
          </div>
        ) : (
          <div className="border-t border-surface">
            {orders.map((order) => (
              <div key={order.id}
                className="flex items-center justify-between py-6 border-b border-surface">
                <div>
                  <span className="font-serif font-semibold text-base">
                    Order #{order.id}
                  </span>
                  <p className="text-muted text-xs mt-1">
                    {new Date(order.orderdate).toLocaleDateString('en-US', {
                      month: 'long', day: 'numeric', year: 'numeric'
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-muted text-sm capitalize">{order.status}</p>
                  <p className="font-serif font-semibold text-primary mt-1">
                    {order.totalamount} DA
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
