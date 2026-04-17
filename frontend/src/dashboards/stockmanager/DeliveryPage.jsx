import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Boxes,
  Truck,
  RotateCcw
} from "lucide-react";

import Header from "../ui/Header";
import Sidebar from "../ui/Sidebar";
import api from "../../services/api";

export function DeliveryPage() {
  const navigate = useNavigate();

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

  const stockManagerLinks = [
    { to: "/stock-manager-dash", label: "Dashboard", icon: <LayoutDashboard />, end: true },
    { to: "/stock-manager-dash/inventories", label: "Inventory", icon: <Boxes /> },
    { to: "/stock-manager-dash/deliveries", label: "Delivery", icon: <Truck /> },
    { to: "/stock-manager-dash/returns", label: "Returns", icon: <RotateCcw /> }
  ];

  // FAKE DATA (same UI as image)
  const deliverymen = [
    { name: "Marcus Rivera", status: "On Route", rating: 4.9 },
    { name: "Aisha Johnson", status: "Available", rating: 4.8 },
    { name: "Leo Chen", status: "On Route", rating: 4.7 },
    { name: "Sofia Petrov", status: "Available", rating: 4.9 },
    { name: "Dante Okafor", status: "On Route", rating: 4.6 },
    { name: "Yuki Tanaka", status: "Off Duty", rating: 4.8 }
  ];

  const orders = [
    {
      id: "ORD-7721",
      place: "Brooklyn Warehouse",
      zone: "Near",
      status: "In Transit",
      assigned: "Marcus Rivera"
    },
    {
      id: "ORD-7722",
      place: "Sunset Strip HQ",
      zone: "Far",
      status: "Pending"
    },
    {
      id: "ORD-7723",
      place: "Navy Pier Office",
      zone: "Mid",
      status: "Delivered",
      assigned: "Leo Chen"
    }
  ];

  const zoneColor = (z) =>
    z === "Near"
      ? "bg-green-100 text-green-600"
      : z === "Mid"
      ? "bg-yellow-100 text-yellow-600"
      : "bg-red-100 text-red-600";

  const statusColor = (s) =>
    s === "Delivered"
      ? "bg-green-100 text-green-600"
      : s === "In Transit"
      ? "bg-blue-100 text-blue-600"
      : "bg-gray-200 text-gray-600";

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
        <Header concept="Deliveries" />

        <div className="p-7 space-y-6">

          {/* TITLE */}
          <div>
            <h2 className="text-2xl font-semibold text-gray-800">
              Deliveries Dashboard
            </h2>
            <p className="text-gray-400">
              Welcome back, manager. Here's what's happening today.
            </p>
          </div>

          {/* GRID */}
          <div className="grid grid-cols-3 gap-6">

            {/* LEFT SIDE */}
            <div className="space-y-6">

              {/* ZONES */}
              <div className="bg-white p-5 rounded-xl shadow-sm">
                <h3 className="font-semibold mb-4">Delivery Zones</h3>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-green-600">● Near Zone</span>
                    <span className="text-gray-400">0 - 30 km</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-yellow-600">● Mid Zone</span>
                    <span className="text-gray-400">30 - 70 km</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-red-500">● Far Zone</span>
                    <span className="text-gray-400">70 km+</span>
                  </div>
                </div>
              </div>

              {/* DELIVERYMEN */}
              <div className="bg-white p-5 rounded-xl shadow-sm">
                <div className="flex justify-between mb-4">
                  <h3 className="font-semibold">Deliverymen</h3>
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                    {deliverymen.length} agents
                  </span>
                </div>

                <div className="space-y-4">
                  {deliverymen.map((d, i) => (
                    <div key={i} className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium">{d.name}</p>
                        <span className="text-xs text-gray-400">
                          {d.status}
                        </span>
                      </div>

                      <span className="text-orange-500 text-sm">
                        ⭐ {d.rating}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT SIDE */}
            <div className="col-span-2 bg-white p-5 rounded-xl shadow-sm">

              <div className="flex justify-between mb-4">
                <h3 className="font-semibold">All Orders</h3>
                <button className="text-sm bg-indigo-100 text-indigo-600 px-3 py-1 rounded">
                  + New Order
                </button>
              </div>

              <div className="space-y-4">
                {orders.map((o, i) => (
                  <div key={i} className="border-b pb-4">

                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-medium text-indigo-600">
                        {o.id}
                      </span>

                      <span className={`text-xs px-2 py-1 rounded ${zoneColor(o.zone)}`}>
                        {o.zone} Zone
                      </span>

                      <span className={`text-xs px-2 py-1 rounded ${statusColor(o.status)}`}>
                        {o.status}
                      </span>
                    </div>

                    <p className="text-gray-700 font-medium">
                      {o.place}
                    </p>

                    {o.assigned ? (
                      <div className="mt-2 text-sm text-gray-500">
                        Assigned to: {o.assigned}
                      </div>
                    ) : (
                      <button className="mt-2 text-sm border px-3 py-1 rounded text-gray-500 hover:bg-gray-50">
                        Assign Delivery
                      </button>
                    )}
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