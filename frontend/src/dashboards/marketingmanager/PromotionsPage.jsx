import { useEffect, useState } from 'react'
import { Eye, Pencil, Trash2, Plus, LayoutDashboard, Bot, Megaphone, BadgePercent, Activity, Mail, FileText } from 'lucide-react'
import api from '../../services/api'
import Sidebar from '../ui/Sidebar'
import Header from '../ui/Header'

const statusStyle = {
  active:   'bg-green-100 text-green-600',
  upcoming: 'bg-violet-100 text-violet-600',
  expired:  'bg-red-100 text-red-500',
}

function Badge({ status }) {
  return (
    <span className={`px-3 py-1 text-xs rounded-full font-medium ${statusStyle[status] || 'bg-gray-100 text-gray-500'}`}>
      {status}
    </span>
  )
}

export default function PromotionsPage() {
  const [items, setItems]     = useState([])
  const [loading, setLoading] = useState(true)
  const [openBar, setOpenBar] = useState(window.innerWidth >= 600)

  const marketingmanagerLinks = [
    { to: "/marketing-manager-dash",              label: "Dashboard",     icon: <LayoutDashboard size={18} />, end: true },
    { to: "/marketing-manager-dash/ar",           label: "AR Management", icon: <Bot size={18} /> },
    { to: "/marketing-manager-dash/campaigns",    label: "Campaigns",     icon: <Megaphone size={18} /> },
    { to: "/marketing-manager-dash/promotions",   label: "Promotions",    icon: <BadgePercent size={18} /> },
    { to: "/marketing-manager-dash/newsletters",  label: "Newsletters",   icon: <Mail size={18} /> },
    { to: "/marketing-manager-dash/blogs",        label: "Blogs",         icon: <FileText size={18} /> },
  ]

  useEffect(() => {
    api.get('/api/promotions')
      .then(r => setItems(r.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const handleDelete = async (id) => {
    await api.delete(`/api/promotions/${id}`)
    setItems(prev => prev.filter(i => i.id !== id))
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#F4F6FB" }}>
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
        <Header concept="Promotions" setOpenBar={setOpenBar} openBar={openBar} />

        <div style={{ padding: "28px 32px", display: "flex", flexDirection: "column", gap: 24 }}>

          {/* Page header */}
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-400 mt-0.5">Manage discount codes and offers</p>
            </div>
            <button className="flex items-center gap-2 bg-[#5B47E0] text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#4a38cc] transition shadow-sm">
              <Plus size={16} /> Add Promo
            </button>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-x-auto">
            <table className="w-full text-sm min-w-[800px]">
              <thead>
                <tr className="border-b border-gray-100">
                  {['Title','Code','Discount','Type','Usage','Expiry','Status','Actions'].map(h => (
                    <th key={h} className="text-left px-5 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={8} className="text-center py-12">
                      <div className="flex justify-center">
                        <div className="w-6 h-6 border-2 border-[#5B47E0] border-t-transparent rounded-full animate-spin" />
                      </div>
                    </td>
                  </tr>
                ) : items.map((item) => {
                  const pct = item.usage_max > 0
                    ? Math.min(100, Math.round((item.usage_current / item.usage_max) * 100))
                    : 0
                  return (
                    <tr key={item.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/60 transition">
                      <td className="px-5 py-4 font-medium text-gray-800">{item.title}</td>
                      <td className="px-5 py-4">
                        <span className="bg-[#EEF0FF] text-[#5B47E0] px-2.5 py-1 rounded-md text-xs font-bold font-mono tracking-wide">
                          {item.code}
                        </span>
                      </td>
                      <td className="px-5 py-4 font-bold text-green-600">{item.discount}</td>
                      <td className="px-5 py-4 text-gray-500">{item.type}</td>
                      <td className="px-5 py-4">
                        <div className="min-w-[90px]">
                          <span className="text-xs text-gray-500 block mb-1.5">{item.usage}</span>
                          <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-[#5B47E0] rounded-full transition-all" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-gray-400 text-xs whitespace-nowrap">{item.expiry}</td>
                      <td className="px-5 py-4"><Badge status={item.status} /></td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5">
                          <button className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-400 hover:text-blue-600 transition"><Eye size={14} /></button>
                          <button className="p-1.5 rounded-lg hover:bg-yellow-50 text-yellow-400 hover:text-yellow-600 transition"><Pencil size={14} /></button>
                          <button onClick={() => handleDelete(item.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 hover:text-red-600 transition"><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

        </div>
      </main>
    </div>
  )
}