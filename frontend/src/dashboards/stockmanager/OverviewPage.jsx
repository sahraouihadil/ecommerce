import { useEffect, useState } from "react";
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
  RotateCcw,
  Bot
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
const Stat = ({ title, value, change, color, icon }) => (
  <div className="bg-white rounded-xl p-5 shadow-sm flex justify-between items-center">
    
    <div>
      <p className="text-sm text-gray-400">{title}</p>
      <h2 className="my-1 text-xl font-semibold text-gray-800">{value}</h2>
      <span style={{ color }}>{change}</span>
    </div>

    <div className="p-3 bg-gray-100 rounded-lg text-gray-600">
      {icon}
    </div>

  </div>
);

export function OverviewPage() {

  const [inventory, setInventory] = useState([]);
  const [orders,setOrders]= useState([]);
  const [chartData, setChartData] = useState({ labels: [], datasets: [] });
  const [categoryData, setCategoryData] = useState({ labels: [], datasets: [] });
  const [openBar, setOpenBar] = useState(window.innerWidth >= 600);
  const [categoryList, setCategoryList] = useState([]);

  // FETCH DATA
  useEffect(() => {
    const fetchData = async () => {
      try {
        const pRes = await api.get("/api/products");
        const oRes= await api.get("/api/orders/all");
       
        setInventory(pRes.data || []);
        setOrders(oRes.data || []);

    const ordersData = oRes.data || [];
    const products = pRes.data || [];
    const grouped = {};

products.forEach(p => {
  const date = new Date(p.created_at).toLocaleDateString();
  if (!grouped[date]) {
    grouped[date] = { in: 0, out: 0 };
  }
  
  grouped[date].in += p.quantity || 0;
});


ordersData.forEach(order => {
  const date = new Date(order.orderdate).toLocaleDateString();

  if (!grouped[date]) {
    grouped[date] = { in: 0, out: 0 };
  }

  const totalOut = (order.items || []).reduce(
    (sum, item) => sum + (item.quantity || 0),
    0
  );

  grouped[date].out += totalOut;
});

const labelss = Object.keys(grouped);
const stockIn = labelss.map(d => grouped[d].in);
const stockOut = labelss.map(d => grouped[d].out);

setChartData({
  labels:labelss,
  datasets: [
    {
      label: "Stock In",
      data: stockIn,
      borderColor: "#A4B7A1"
    },
    {
      label: "Stock Out",
      data: stockOut,
      borderColor: "#4472B7"
    }
  ]
});


        const categories = {};

pRes.data.forEach(item => {
  const cat = item.category || "Unknown";
  categories[cat] = (categories[cat] || 0) + item.quantity;
});

const labels = Object.keys(categories);
const values = Object.values(categories);

const colors = ["#96ADD0", "#EBE0C3", "#DF9797", "#A6CFA1", "#E1C4D5"];
setCategoryData({
  labels,
  datasets: [
    {
      data: values,
      backgroundColor:  labels.map((_, i) => colors[i % colors.length])
    }
  ]
});


setCategoryList(
  labels.map((label, i) => ({
    name: label,
    value: values[i],
    color: ["#96ADD0", "#EBE0C3", "#DF9797", "#A6CFA1","#E1C4D5"][i % 5]
  }))
);

      } catch (err) {
        console.error("Fetch error:", err);
      }
    };

    fetchData();
  }, []);


  const totalInventory = inventory.reduce((s, i) => s + (i.quantity || 0), 0);
  const lowStock = inventory.filter(i => i.quantity < 10).length;
  const shippedCount = orders.filter(o => o.status?.toLowerCase() === "shipped").length;
  const totalRev    = orders.reduce((s, o) => s + o.totalamount, 0);
  

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
        subtitle="Enterprise Suite"
        role="Super Stock Manager"
        profilePath="/stock-manager-dash/profile"
      />

      {/* MAIN */}
      <main className="flex-1">
        <Header concept="Overview Dashboard" />

        <div className="p-7 flex flex-col gap-6">
          
          {/* TITLE */}
          <div>
            <p className="text-gray-400">
              Welcome back, manager. Here's what's happening today.
            </p>
          </div>

          {/* STATS */}
          <div className="grid grid-cols-4 gap-5">
          <Stat 
           title="Total Products" 
            value={totalInventory} 
            change="+12%" 
    color="#22c55e"
    icon={<Boxes size={20} />}
  />
  
  <Stat 
    title="Active Shipments" 
    value={shippedCount} 
    change="+5%" 
    color="#3b82f6"
    icon={<Truck size={20} />}
  />

  <Stat 
    title="Low Stock Items" 
    value={lowStock} 
    change="-2%" 
    color="#ef4444"
    icon={<RotateCcw size={20} />}
  />

  <Stat 
    title="Total Revenue" 
    value={`${totalRev} DA`}
    change="+18%" 
    color="#10b981"
    icon={<LayoutDashboard size={20} />}
  />
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

            <div className="bg-white rounded-xl p-5 shadow-sm flex flex-col gap-4">
  
  <h3 className="font-semibold text-gray-700">
    Category Distribution
  </h3>

  {/* CHART */}
  <div className="h-[200px] flex items-center justify-center">
   <Doughnut data={categoryData} options={{ plugins: { legend: { display: false } } }} />
  </div>

  {/* LIST */}
  <div className="flex flex-col gap-2 mt-2">
    {categoryList.map((cat, i) => (
      <div key={i} className="flex justify-between items-center text-sm">
        
        <div className="flex items-center gap-2">
          <span
            className="w-3 h-3 rounded-full"
            style={{ background: cat.color }}
          />
          <span className="text-gray-600">{cat.name}</span>
        </div>

        <span className="font-medium text-gray-800">
          {cat.value}
        </span>

      </div>
    ))}
  </div>

</div>

          </div>

        </div>
      </main>
    </div>
  );
}