import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Line, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  ArcElement
} from "chart.js";
import {
  LayoutDashboard,
  Boxes,
  Truck,
  RotateCcw
} from "lucide-react";

import Header from "../ui/Header";
import Sidebar from "../ui/Sidebar";
import api from "../../services/api";

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  ArcElement
);

// SAME Stat component but Tailwind
const Stat = ({ title, value, change, color }) => (
  <div className="bg-white rounded-xl p-5 shadow-sm">
    <p className="text-sm text-gray-400">{title}</p>
    <h2 className="my-1 text-xl font-semibold text-gray-800">{value}</h2>
    <span style={{ color }}>{change}</span>
  </div>
);

export function OverviewPage() {
  const navigate = useNavigate();

  const [inventory, setInventory] = useState([]);
  const [chartData, setChartData] = useState({ labels: [], datasets: [] });
  const [categoryData, setCategoryData] = useState({ labels: [], datasets: [] });
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

  // FETCH DATA
  useEffect(() => {
    const fetchData = async () => {
      try {
        const inv = await api.get("/api/products");

        const products = inv.data || [];
        setInventory(products);

        const fakeMovements = products.map((p, i) => ({
          day: `Day ${i + 1}`,
          in: Math.floor(Math.random() * 20),
          out: Math.floor(Math.random() * 15)
        }));

        setChartData({
          labels: fakeMovements.map(m => m.day),
          datasets: [
            {
              label: "Stock In",
              data: fakeMovements.map(m => m.in),
              borderColor: "#22c55e"
            },
            {
              label: "Stock Out",
              data: fakeMovements.map(m => m.out),
              borderColor: "#6366f1"
            }
          ]
        });

        const categories = {};
        products.forEach(item => {
          const cat = item.category || "Unknown";
          categories[cat] = (categories[cat] || 0) + item.quantity;
        });

        setCategoryData({
          labels: Object.keys(categories),
          datasets: [
            {
              data: Object.values(categories),
              backgroundColor: ["#6366f1", "#22c55e", "#f59e0b", "#ef4444"]
            }
          ]
        });

      } catch (err) {
        console.error("Fetch error:", err);
      }
    };

    fetchData();
  }, []);

  const totalInventory = inventory.reduce((s, i) => s + (i.quantity || 0), 0);
  const lowStock = inventory.filter(i => i.quantity < 10).length;

  const stockManagerLinks = [
    { to: "/stock-manager-dash", label: "Dashboard", icon: <LayoutDashboard />, end: true },
    { to: "/stock-manager-dash/inventories", label: "Inventory", icon: <Boxes /> },
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
        subtitle="Enterprise Suite"
        role="Super Stock Manager"
      />

      {/* MAIN */}
      <main className="flex-1">
        <Header concept="Overview" />

        <div className="p-7 flex flex-col gap-6">
          
          {/* TITLE */}
          <div>
            <h2 className="text-2xl font-semibold text-gray-800">
              Overview Dashboard
            </h2>
            <p className="text-gray-400">
              Welcome back, manager. Here's what's happening today.
            </p>
          </div>

          {/* STATS */}
          <div className="grid grid-cols-4 gap-5">
            <Stat title="Total Inventory" value={totalInventory} change="+12%" color="#22c55e" />
            <Stat title="Active Shipments" value="24" change="+5%" color="#3b82f6" />
            <Stat title="Low Stock Items" value={lowStock} change="-2%" color="#ef4444" />
            <Stat title="Total Revenue" value="$42,850" change="+18%" color="#10b981" />
          </div>

          {/* CHARTS */}
          <div className="grid grid-cols-[2fr_1fr] gap-5">
            
            <div className="bg-white rounded-xl p-5 shadow-sm">
              <h3 className="mb-3 font-semibold text-gray-700">
                Inventory Movement
              </h3>
              <div className="h-[300px]">
                <Line data={chartData} />
              </div>
            </div>

            <div className="bg-white rounded-xl p-5 shadow-sm">
              <h3 className="mb-3 font-semibold text-gray-700">
                Category Distribution
              </h3>
              <div className="h-[300px]">
                <Doughnut data={categoryData} />
              </div>
            </div>

          </div>

        </div>
      </main>
    </div>
  );
}