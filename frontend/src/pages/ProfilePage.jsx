import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";

function getInitials(name = "") {
  return name.split(/[\s_@]+/).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("");
}

export function ProfilePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get("/profile");
        setUser(response.data);
      } catch {
        localStorage.removeItem("token");
        navigate("/login", { replace: true });
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login", { replace: true });
  };

  if (loading) return (
    <div className="min-h-screen bg-cream flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-2 border-accent2 border-t-transparent rounded-full animate-spin" />
        <p className="text-muted text-sm">Loading profile...</p>
      </div>
    </div>
  );

  const initials = getInitials(user?.username);

  return (
    <div className="min-h-screen bg-cream text-text pb-32">
      <main className="max-w-3xl mx-auto px-6 pt-36">

        {/* Profile Header */}
        <div className="flex items-center gap-8 mb-16">
          <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-3xl font-bold text-white font-serif">
              {initials || "?"}
            </span>
          </div>
          <div>
            <h1 className="font-serif font-bold text-3xl tracking-tight">
              {user?.username ?? "Anonymous"}
            </h1>
            <p className="text-muted text-sm mt-1">{user?.email}</p>
            <p className="text-muted text-xs mt-1 capitalize">{user?.role ?? "Member"}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="flex gap-12 mb-16 pb-16 border-b border-surface">
          {[
            { value: "12", label: "Orders" },
            { value: "4", label: "Saved" },
            { value: "1,240", label: "Points" },
          ].map((stat) => (
            <div key={stat.label}>
              <p className="font-serif font-bold text-2xl">{stat.value}</p>
              <p className="text-muted text-xs mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Orders */}
        <section className="mb-16">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-serif font-bold text-xl">My Orders</h2>
            <button onClick={() => navigate("/order")}
              className="text-[0.8125rem] text-muted hover:text-primary transition-colors duration-300 font-semibold">
              See all &rarr;
            </button>
          </div>
          <div className="space-y-0 border-t border-surface">
            {[
              { name: "Velvet Cloud Stool", status: "In Transit" },
              { name: "Obsidian Glow Lamp", status: "Delivered" },
            ].map((order) => (
              <div key={order.name} className="flex items-center justify-between py-5 border-b border-surface">
                <span className="text-sm">{order.name}</span>
                <span className="text-muted text-sm">{order.status}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Saved Items */}
        <section className="mb-16">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-serif font-bold text-xl">Saved Items</h2>
            <Link to="/favorite"
              className="text-[0.8125rem] text-muted hover:text-primary transition-colors duration-300 font-semibold">
              View all &rarr;
            </Link>
          </div>
          <div className="space-y-0 border-t border-surface">
            {[
              { name: "Asymmetric Table", price: "$245" },
              { name: "Oak Nightstand", price: "$380" },
            ].map((item) => (
              <div key={item.name} className="flex items-center justify-between py-5 border-b border-surface">
                <span className="text-sm">{item.name}</span>
                <span className="text-primary text-sm font-serif font-semibold">{item.price}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Account Actions */}
        <section>
          <h2 className="font-serif font-bold text-xl mb-6">Account</h2>
          <div className="space-y-0 border-t border-surface">
            {[
              { label: "Edit Profile", onClick: null },
              { label: "Notifications", onClick: null },
              { label: "Privacy", onClick: null },
            ].map((action) => (
              <button key={action.label}
                onClick={action.onClick}
                className="w-full flex items-center justify-between py-5 border-b border-surface
                  text-sm text-left text-muted hover:text-primary transition-colors duration-300">
                {action.label}
                <span className="material-symbols-outlined text-[18px]">chevron_right</span>
              </button>
            ))}
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-between py-5 border-b border-surface
                text-sm text-left text-danger hover:opacity-70 transition-opacity duration-300">
              Logout
              <span className="material-symbols-outlined text-[18px]">logout</span>
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
