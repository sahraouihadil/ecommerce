import { useEffect, useState } from 'react'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts'
import { DollarSign, Megaphone, Mail, Layers, TrendingUp, TrendingDown,LayoutDashboard,Bot,BadgePercent,Activity,FileText} from 'lucide-react'
import api from '../../services/api'
import Sidebar from '../ui/Sidebar'        // ← add
import Header from '../ui/Header'          // ← add

const COLORS = ['#5B47E0', '#22c55e', '#f59e0b', '#ef4444']
const CHANNEL_COLORS = ['#5B47E0', '#22c55e', '#f59e0b', '#ef4444', '#6366f1']

function StatCard({ icon, iconBg, title, value, change, up }) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
        {icon}
      </div>
      <div>
        <p className="text-xs text-gray-400 font-medium">{title}</p>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
        <p className={`text-xs font-medium flex items-center gap-1 mt-0.5 ${up ? 'text-green-500' : 'text-red-500'}`}>
          {up ? <TrendingUp size={12} /> : <TrendingDown size={12} />} {change}
        </p>
      </div>
    </div>
  )
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-100 rounded-xl shadow-lg p-3 text-xs">
        <p className="font-semibold text-gray-600 mb-1">{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color }}>{p.name}: {p.value.toLocaleString()}</p>
        ))}
      </div>
    )
  }
  return null
}

export default function MarketingManagerDashboard() {
  const [data, setData] = useState(null)
  const [openBar, setOpenBar] = useState(window.innerWidth >= 600);

  useEffect(() => {
    api.get('/api/overview').then(r => setData(r.data)).catch(console.error)
  }, [])


  const marketingmanagerLinks = [
    { to: "/marketing-manager-dash",             label: "Dashboard",     icon: <LayoutDashboard size={18} />, end: true },
    { to: "/marketing-manager-dash/campaigns",   label: "Campaigns",     icon: <Megaphone size={18} /> },
    { to: "/marketing-manager-dash/promotions",  label: "Promotions",    icon: <BadgePercent size={18} /> },
    { to: "/marketing-manager-dash/newsletters", label: "Newsletters",   icon: <Mail size={18} /> },
    { to: "/marketing-manager-dash/blogs",       label: "Blogs",         icon: <FileText size={18} /> },
  ]

  if (!data) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-[#5B47E0] border-t-transparent rounded-full animate-spin" />
    </div>
  )

  const pieData = [
    { name: 'Active',    value: data.campaign_status.active },
    { name: 'Draft',     value: data.campaign_status.draft },
    { name: 'Paused',    value: data.campaign_status.paused },
    { name: 'Completed', value: data.campaign_status.completed },
  ]

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#F4F6FB" }}>  {/* ← same page wrapper as AdminDashboard */}
      <Sidebar
        openBar={openBar}
        setOpenBar={setOpenBar}
        links={marketingmanagerLinks}
        title="MarketingCore"
        subtitle="Enterprise Suite"
        role="Marketing Manager"
        profilePath="/marketing-manager-dash/profile"
      />

      <main style={{ flex: 1, overflowY: "auto" }}>
        <Header concept="Dashboard" setOpenBar={setOpenBar} openBar={openBar} />  {/* ← add Header */}

        <div style={{ padding: "28px 32px", display: "flex", flexDirection: "column", gap: 20 }}>

          {/* Stat cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <StatCard icon={<DollarSign size={22} className="text-white" />} iconBg="bg-[#5B47E0]" title="Total Revenue" value={`$${(data.total_revenue / 1000).toFixed(1)}k`} change={data.revenue_change} up />
            <StatCard icon={<Megaphone size={22} className="text-white" />} iconBg="bg-green-500" title="Active Campaigns" value={data.active_campaigns} change={data.campaigns_change} up />
            <StatCard icon={<Mail size={22} className="text-white" />} iconBg="bg-violet-500" title="Newsletter Subs" value={data.newsletter_subs.toLocaleString()} change={data.subs_change} up />
            <StatCard icon={<Layers size={22} className="text-white" />} iconBg="bg-orange-400" title="AR Experiences" value={data.ar_experiences} change={data.ar_change} up={false} />
          </div>

          {/* Performance + Campaign Status */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            <div className="xl:col-span-2 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <div className="flex justify-between items-center mb-5">
                <h3 className="font-semibold text-gray-800">Performance Overview</h3>
                <span className="text-xs text-gray-400 bg-gray-50 px-3 py-1 rounded-full border border-gray-100">Last 7 months</span>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={data.performance} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
                  <defs>
                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#5B47E0" stopOpacity={0.18} />
                      <stop offset="95%" stopColor="#5B47E0" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="engGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#22c55e" stopOpacity={0.18} />
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9ca3af' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9ca3af' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="revenue"    name="Revenue"    stroke="#5B47E0" strokeWidth={2} fill="url(#revGrad)" dot={false} />
                  <Area type="monotone" dataKey="engagement" name="Engagement" stroke="#22c55e" strokeWidth={2} fill="url(#engGrad)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <h3 className="font-semibold text-gray-800 mb-4">Campaign Status</h3>
              <ResponsiveContainer width="100%" height={190}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={58} outerRadius={82} dataKey="value" paddingAngle={4}>
                    {pieData.map((_, i) => <Cell key={i} fill={COLORS[i]} strokeWidth={0} />)}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-1 justify-center">
                {pieData.map((item, i) => (
                  <div key={item.name} className="flex items-center gap-1.5 text-xs text-gray-500">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: COLORS[i] }} />
                    {item.name}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Channel Engagement */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h3 className="font-semibold text-gray-800 mb-5">Channel Engagement</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={data.channel_engagement} barSize={44} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
                <XAxis dataKey="channel" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9ca3af' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9ca3af' }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" name="Engagement" radius={[6, 6, 0, 0]}>
                  {data.channel_engagement.map((_, i) => (
                    <Cell key={i} fill={CHANNEL_COLORS[i % CHANNEL_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

        </div>
      </main>
    </div>
  )
}