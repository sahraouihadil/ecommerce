import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { RotateCcw, LayoutDashboard, Boxes, Truck,Bot } from "lucide-react";

import Header from "../ui/Header";
import Sidebar from "../ui/Sidebar";
import api from "../../services/api";

// STAT CARD
const Stat = ({ title, value, subtitle, color }) => (
  <div className="bg-white rounded-xl p-5 shadow-sm border">
    <p className="text-sm text-gray-400">{title}</p>
    <h2 className="text-xl font-semibold text-gray-800">{value}</h2>
    <span className="text-xs" style={{ color }}>{subtitle}</span>
  </div>
);

// STATUS BADGE
const StatusBadge = ({ status }) => {
  const styles = {
    requested: "bg-yellow-100 text-yellow-600",
    inspecting: "bg-blue-100 text-blue-600",
    restocked: "bg-green-100 text-green-600",
    rejected: "bg-red-100 text-red-600"
  };

  return (
    <span className={`px-3 py-1 text-xs rounded-full ${styles[status]}`}>
      {status}
    </span>
  );
};

export function ReturnsPage() {
  const navigate = useNavigate();

  const [returns, setReturns] = useState([]);
  const [openBar, setOpenBar] = useState(window.innerWidth >= 600);

  // AUTH
  useEffect(() => {
    const verify = async () => {
      if (!localStorage.getItem("token")) {
        navigate("/login", { replace: true });
        return;
      }
      try {
        await api.get("/stock-manager-dash");
      } catch {
        localStorage.removeItem("token");
        navigate("/");
      }
    };

    verify();
    const id = setInterval(verify, 10000);
    return () => clearInterval(id);
  }, [navigate]);

  // FETCH RETURNS
  useEffect(() => {
    const fetchReturns = async () => {
      try {
        const res = await api.get("/api/returns"); 
        setReturns(res.data || []);
      } catch (err) {
        console.error(err);
      }
    };

    fetchReturns();
  }, []);

  // STATS
  const total = returns.length;
  const refund = returns.reduce((s, r) => s + (r.amount || 0), 0);

  const stockManagerLinks = [
    { to: "/stock-manager-dash", label: "Dashboard", icon: <LayoutDashboard />, end: true },
    { to: "/stock-manager-dash/inventories", label: "Product's Catalog", icon: <Boxes /> },
    { to: "/stock-manager-dash/ar",          label: "AR/3D Management", icon: <Bot size={18} /> },
    { to: "/stock-manager-dash/deliveries", label: "Delivery", icon: <Truck /> },
    { to: "/stock-manager-dash/returns", label: "Returns", icon: <RotateCcw /> }
  ];

  return (
    <div className="flex min-h-screen bg-[#F4F6FB]">
      
      {/* SIDEBAR */}
      <Sidebar
        openBar={openBar}
        setOpenBar={setOpenBar}
        links={stockManagerLinks}
        title="StockManagerCore"
        subtitle="Returns System"
        role="Manager"
        profilePath="/stock-manager-dash/profile"
      />

      {/* MAIN */}
      <main className="flex-1">
        <Header concept="Returns Dashboard" />

        <div className="p-7 flex flex-col gap-6">

          {/* TITLE */}
          <div>
            <p className="text-gray-400">
              Track and manage all product returns.
            </p>
          </div>

          {/* STATS */}
          <div className="grid grid-cols-4 gap-5">
            <Stat title="Total Returns" value={total} subtitle="all time" />
            <Stat title="Refund Value" value={`$${refund}`} subtitle="total refunded" color="#6366f1" />
          </div>

          {/* LIST */}
          <div className="flex flex-col gap-4">
            {returns.map((r) => (
              <div
                key={r.id}
                className="bg-white p-5 rounded-xl shadow-sm flex justify-between items-center border"
              >
                {/* LEFT */}
                <div className="flex items-center gap-4">
                  <img
                    src={r.image || "https://via.placeholder.com/50"}
                    className="w-12 h-12 rounded-md"
                  />

                  <div>
                    <p className="font-semibold text-gray-800">
                      {r.product_name}
                    </p>
                    <p className="text-sm text-gray-400">
                      Qty: {r.quantity} • {r.date}
                    </p>
                  </div>
                </div>

                {/* RIGHT */}
                <div className="flex items-center gap-5">
                  <StatusBadge status={r.status} />
                  <span className="font-semibold text-gray-800">
                    ${r.amount}
                  </span>
                </div>
              </div>
            ))}
          </div>

        </div>
      </main>
    </div>
  );
}