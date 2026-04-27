import Header from "./ui/Header";
import Sidebar from "./ui/Sidebar";
import { useState } from "react";
import { useLocation } from "react-router-dom";
import {
  LayoutDashboard, Users, MessageSquare, CheckSquare,
  BarChart, Activity, Settings,
  Boxes, Truck, RotateCcw, Bot,
  Megaphone, BadgePercent, Mail, FileText,
} from "lucide-react";

const ROLE_CONFIG = {
  "/admin-dash": {
    profilePath: "/admin-dash/profile",
    title: "AdminCore",
    subtitle: "Enterprise Suite",
    role: "Super Admin",
    badgeColor: "bg-purple-100 text-purple-700",
    links: [
      { to: "/admin-dash",               label: "Dashboard",     icon: <LayoutDashboard size={18} />, end: true },
      { to: "/admin-dash/accounts",      label: "Accounts",      icon: <Users size={18} /> },
      { to: "/admin-dash/complaints",    label: "Complaints",    icon: <MessageSquare size={18} /> },
      { to: "/admin-dash/reports",       label: "Reports",       icon: <BarChart size={18} /> },
      { to: "/admin-dash/engagement",    label: "Engagement",    icon: <Activity size={18} /> },
      { to: "/admin-dash/configuration", label: "Configuration", icon: <Settings size={18} /> },
      { to: "/admin-dash/validation",    label: "Validation",    icon: <CheckSquare size={18} /> },
    ],
  },
  "/marketing-manager-dash": {
    profilePath: "/marketing-manager-dash/profile",
    title: "MarketingCore",
    subtitle: "Enterprise Suite",
    role: "Marketing Manager",
    badgeColor: "bg-blue-100 text-blue-700",
    links: [
      { to: "/marketing-manager-dash",             label: "Dashboard",     icon: <LayoutDashboard size={18} />, end: true },
      { to: "/marketing-manager-dash/campaigns",   label: "Campaigns",     icon: <Megaphone size={18} /> },
      { to: "/marketing-manager-dash/promotions",  label: "Promotions",    icon: <BadgePercent size={18} /> },
      { to: "/marketing-manager-dash/newsletters", label: "Newsletters",   icon: <Mail size={18} /> },
      { to: "/marketing-manager-dash/blogs",       label: "Blogs",         icon: <FileText size={18} /> },
    ],
  },
  "/stock-manager-dash": {
    profilePath: "/stock-manager-dash/profile",
    title: "StockManagerCore",
    subtitle: "Enterprise Suite",
    role: "Stock Manager",
    badgeColor: "bg-green-100 text-green-700",
    links: [
      { to: "/stock-manager-dash",             label: "Dashboard",        icon: <LayoutDashboard size={18} />, end: true },
      { to: "/stock-manager-dash/inventories", label: "Product's Catalog", icon: <Boxes size={18} /> },
      { to: "/stock-manager-dash/ar",          label: "AR/3D Management", icon: <Bot size={18} /> },
      { to: "/stock-manager-dash/deliveries",  label: "Delivery",         icon: <Truck size={18} /> },
      { to: "/stock-manager-dash/returns",     label: "Returns",          icon: <RotateCcw size={18} /> },
    ],
  },
  "/deliveryman-dash": {
    profilePath: "/deliveryman-dash/profile",
    title: "DeliverPro",
    subtitle: "Driver Dashboard",
    role: "Deliveryman",
    badgeColor: "bg-orange-100 text-orange-700",
    links: [
      { to: "/deliveryman-dash", label: "Dashboard", icon: <LayoutDashboard size={18} />, end: true },
    ],
  },
};

function getRoleConfig(pathname) {
  const match = Object.keys(ROLE_CONFIG).find((key) => pathname.startsWith(key));
  return ROLE_CONFIG[match] ?? ROLE_CONFIG["/admin-dash"];
}

export default function AProfilePage() {
  const [openBar, setOpenBar] = useState(window.innerWidth >= 600);
  const location = useLocation();
  const config = getRoleConfig(location.pathname);

  return (
    <div className="flex min-h-screen bg-gray-100">

      <Sidebar
        openBar={openBar}
        setOpenBar={setOpenBar}
        links={config.links}
        title={config.title}
        subtitle={config.subtitle}
        role={config.role}
        profilePath={config.profilePath}
      />

      <main className="flex-1 p-4 sm:p-6 space-y-6">
        <Header concept="My Profile" setOpenBar={setOpenBar} openBar={openBar} />

        {/* TOP PROFILE CARD */}
        <div className="bg-white rounded-2xl shadow overflow-hidden">
          <div className="h-32 bg-gradient-to-r from-black via-indigo-600 to-purple-500" />
          <div className="p-6 relative">
            <img
              src="https://i.pravatar.cc/100"
              alt="avatar"
              className="w-20 h-20 md:w-24 md:h-24 rounded-xl border-4 border-white absolute -top-10 md:-top-12 left-1/2 md:left-6 -translate-x-1/2 md:translate-x-0"
            />
            <div className="mt-16 md:mt-0 md:ml-32">
              <div className="flex justify-between items-center flex-wrap gap-4">
                <div>
                  <h2 className="text-xl font-bold">
                    {config.role}
                    <span className={`ml-2 text-xs px-2 py-1 rounded-full m-4 ${config.badgeColor}`}>
                      {config.role}
                    </span>
                  </h2>
                  <p className="text-gray-500 text-sm">user@example.com</p>
                </div>
                <button className="bg-black text-white px-4 py-2 rounded-xl text-sm">
                  ✏️ Edit Profile
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                {[
                  { label: "Role",         value: config.role },
                  { label: "Member Since", value: "Jan 2022"  },
                  { label: "Last Login",   value: "Just now"  },
                  { label: "Sessions",     value: "1,234"     },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-gray-100 rounded-xl p-3">
                    <p className="text-xs text-gray-500">{label}</p>
                    <p className="font-semibold">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* LOWER GRID */}
        <div className="columns-1 md:columns-2 gap-6 space-y-6">

          {/* Contact Info */}
          <div className="bg-white rounded-2xl shadow p-6 break-inside-avoid">
            <h3 className="font-semibold mb-4">Contact Information</h3>
            <div className="space-y-4 text-sm">
              {[
                { label: "Email",    value: "user@example.com" },
                { label: "Phone",    value: "0502372645"       },
                { label: "Location", value: "Constantine"      },
                { label: "Timezone", value: "UTC+1 (CET)"      },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-gray-500">{label}</p>
                  <p className="font-medium">{value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Security */}
          <div className="bg-white rounded-2xl shadow p-6 break-inside-avoid">
            <h3 className="font-semibold mb-4">Security</h3>
            {[
              { title: "Change Password", sub: "Last changed 30 days ago"  },
              { title: "Two-Factor Auth", sub: "Enabled via Authenticator" },
              { title: "Active Sessions", sub: "1 device currently active" },
            ].map(({ title, sub }) => (
              <div key={title} className="bg-gray-100 p-4 rounded-xl flex justify-between items-center m-2">
                <div>
                  <p className="font-medium">{title}</p>
                  <p className="text-xs text-gray-500">{sub}</p>
                </div>
                <span>›</span>
              </div>
            ))}
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-2xl shadow p-6 break-inside-avoid">
            <div className="flex justify-between mb-4">
              <h3 className="font-semibold">Recent Activity</h3>
              <span className="text-sm text-gray-500 cursor-pointer">View all</span>
            </div>
            <div className="space-y-4 text-sm">
              {[
                { icon: "✔",  color: "text-green-500",  text: "Resolved complaint C-003",      time: "2 hours ago" },
                { icon: "👤", color: "text-blue-500",   text: "Added new user Emily Davis",    time: "1 day ago"   },
                { icon: "📦", color: "text-orange-500", text: "Disabled AR on Oak Desk",       time: "2 days ago"  },
                { icon: "📊", color: "text-purple-500", text: "Reviewed platform reports",     time: "3 days ago"  },
                { icon: "⚙️", color: "text-gray-500",   text: "Updated system configurations", time: "5 days ago"  },
              ].map(({ icon, color, text, time }) => (
                <div key={text} className="flex items-center gap-3">
                  <span className={color}>{icon}</span>
                  <div>
                    <p>{text}</p>
                    <p className="text-xs text-gray-500">{time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Danger Zone */}
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h3 className="font-semibold text-red-600">⚠ Danger Zone</h3>
            <p className="text-sm text-red-500">These actions are irreversible. Proceed with caution.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <button className="px-4 py-2 rounded-xl border border-red-300 text-red-600 hover:bg-red-100">
              Sign Out of All Devices
            </button>
            <button className="px-4 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700">
              Deactivate Account
            </button>
          </div>
        </div>

      </main>
    </div>
  );
}