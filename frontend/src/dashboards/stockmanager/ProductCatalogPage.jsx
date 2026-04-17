import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Boxes,
  Truck,
  RotateCcw,
  Search,
  Plus,
  Pencil,
  Trash2
} from "lucide-react";

import Header from "../ui/Header";
import Sidebar from "../ui/Sidebar";
import api from "../../services/api";

export function ProductCatalogPage() {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [openBar, setOpenBar] = useState(window.innerWidth >= 600);

  // AUTH
  useEffect(() => {
    const verify = async () => {
      if (!localStorage.getItem("token")) {
        navigate("/login");
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
  }, [navigate]);

  // FETCH
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await api.get("/api/products");
        setProducts(res.data || []);
      } catch (err) {
        console.error(err);
      }
    };

    fetchProducts();
  }, []);

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const getStatus = (qty) => {
    if (qty === 0) return "Out of Stock";
    if (qty < 10) return "Low Stock";
    return "In Stock";
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "In Stock":
        return "bg-green-100 text-green-600";
      case "Low Stock":
        return "bg-yellow-100 text-yellow-600";
      default:
        return "bg-red-100 text-red-600";
    }
  };

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
        title="StockFlow"
        subtitle="Enterprise Suite"
        role="Manager"
      />

      {/* MAIN */}
      <main className="flex-1">
        <Header concept="Inventory" />

        <div className="p-7 space-y-6">

          {/* TITLE */}
          <div>
            <h2 className="text-2xl font-semibold text-gray-800">
              Products Dashboard
            </h2>
            <p className="text-gray-400">
              Welcome back, manager. Here's what's happening today.
            </p>
          </div>

          {/* TOP BAR */}
          <div className="flex justify-between items-center">
            
            {/* SEARCH */}
            <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border w-72">
              <Search size={16} className="text-gray-400" />
              <input
                className="outline-none w-full text-sm"
                placeholder="Search inventory..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* ADD BUTTON */}
            <button className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl hover:bg-indigo-700 transition">
              <Plus size={16} /> Add Product
            </button>
          </div>

          {/* TABLE */}
          <div className="bg-white rounded-2xl shadow-sm p-5">
            
            {/* HEADER */}
            <div className="grid grid-cols-7 text-xs font-semibold text-gray-400 pb-3 border-b">
              <span>PRODUCT</span>
              <span>CATEGORY</span>
              <span>SKU</span>
              <span>STOCK LEVEL</span>
              <span>PRICE</span>
              <span>STATUS</span>
              <span>ACTIONS</span>
            </div>

            {/* ROWS */}
            {filtered.map((p) => {
              const status = getStatus(p.quantity);

              return (
                <div
                  key={p.id}
                  className="grid grid-cols-7 items-center py-4 border-b last:border-none"
                >
                  {/* PRODUCT */}
                  <div className="flex items-center gap-3">
                    <img
                      src={p.image_url}
                      alt=""
                      className="w-10 h-10 rounded-lg object-cover"
                    />
                    <span className="font-medium text-gray-700">
                      {p.name}
                    </span>
                  </div>

                  <span className="text-gray-500">{p.category}</span>
                  <span className="text-gray-400 text-sm">{p.sku || "—"}</span>

                  {/* STOCK + BAR */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-700">
                      {p.quantity}
                    </span>
                    <div className="w-20 h-2 bg-gray-200 rounded-full">
                      <div
                        className="h-2 bg-green-500 rounded-full"
                        style={{
                          width: `${Math.min(p.quantity * 5, 100)}%`
                        }}
                      />
                    </div>
                  </div>

                  <span className="text-gray-700 font-medium">
                    ${p.price}
                  </span>

                  {/* STATUS */}
                  <span
                    className={`text-xs px-3 py-1 rounded-full w-fit ${getStatusStyle(
                      status
                    )}`}
                  >
                    {status}
                  </span>

                  {/* ACTIONS */}
                  <div className="flex gap-3 text-gray-400">
                    <Pencil
                      size={16}
                      className="cursor-pointer hover:text-indigo-500"
                    />
                    <Trash2
                      size={16}
                      className="cursor-pointer hover:text-red-500"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}