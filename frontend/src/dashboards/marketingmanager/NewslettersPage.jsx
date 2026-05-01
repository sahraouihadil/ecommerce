import { useEffect, useState } from 'react'
import { Eye, Pencil, Trash2, Plus, Users, CheckCircle, XCircle, LayoutDashboard, Bot, Megaphone, BadgePercent, Activity, Mail, FileText } from 'lucide-react'
import api from '../../services/api'
import Sidebar from '../ui/Sidebar'
import Header from '../ui/Header'

const tagColor = {
  'VIP':          'bg-violet-50 text-violet-600',
  'Deals':        'bg-blue-50   text-blue-600',
  'New Arrivals': 'bg-green-50  text-green-600',
  'Sales':        'bg-orange-50 text-orange-600',
}

export default function NewslettersPage() {
  const [items, setItems]     = useState([])
  const [loading, setLoading] = useState(true)
  const [openBar, setOpenBar] = useState(window.innerWidth >= 600)

  const marketingmanagerLinks = [
    { to: "/marketing-manager-dash",             label: "Dashboard",     icon: <LayoutDashboard size={18} />, end: true },
    { to: "/marketing-manager-dash/campaigns",   label: "Campaigns",     icon: <Megaphone size={18} /> },
    { to: "/marketing-manager-dash/promotions",  label: "Promotions",    icon: <BadgePercent size={18} /> },
    { to: "/marketing-manager-dash/newsletters", label: "Newsletters",   icon: <Mail size={18} /> },
    { to: "/marketing-manager-dash/blogs",       label: "Blogs",         icon: <FileText size={18} /> },
  ]


  useEffect(() => {
    api.get('/api/newsletters')
      .then(r => setItems(r.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])
  const handleDelete = async (id) => {
    await api.delete(`/api/newsletters/${id}`)
    setItems(prev => prev.filter(i => i.id !== id))
  }

  const total  = items.length
  const active = items.filter(i => i.status === 'subscribed').length
  const unsub  = items.filter(i => i.status === 'unsubscribed').length

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
        <Header concept="Newsletter Subscriptions" setOpenBar={setOpenBar} openBar={openBar} />

        <div style={{ padding: "28px 32px", display: "flex", flexDirection: "column", gap: 24 }}>

          {/* Page header */}
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-400 mt-0.5">Manage subscriber list and preferences</p>
            </div>
            <button className="flex items-center gap-2 bg-[#5B47E0] text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#4a38cc] transition shadow-sm">
              <Plus size={16} /> Add Subscriber
            </button>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { icon: <Users size={18} className="text-blue-500" />,        bg: 'bg-blue-50',  label: 'Total Subscribers', value: total  },
              { icon: <CheckCircle size={18} className="text-green-500" />, bg: 'bg-green-50', label: 'Active',            value: active },
              { icon: <XCircle size={18} className="text-red-400" />,       bg: 'bg-red-50',   label: 'Unsubscribed',      value: unsub  },
            ].map(s => (
              <div key={s.label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center shrink-0`}>{s.icon}</div>
                <div>
                  <p className="text-xs text-gray-400">{s.label}</p>
                  <p className="text-2xl font-bold text-gray-800">{s.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-x-auto">
            <table className="w-full text-sm min-w-[700px]">
              <thead>
                <tr className="border-b border-gray-100">
                  {['Name','Email','Status','Tags','Date','Actions'].map(h => (
                    <th key={h} className="text-left px-5 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12">
                      <div className="flex justify-center">
                        <div className="w-6 h-6 border-2 border-[#5B47E0] border-t-transparent rounded-full animate-spin" />
                      </div>
                    </td>
                  </tr>
                ) : items.map((item) => (
                  <tr key={item.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/60 transition">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#EEF0FF] flex items-center justify-center text-[#5B47E0] text-xs font-bold shrink-0">
                          {item.name.charAt(0)}
                        </div>
                        <span className="font-medium text-gray-800">{item.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-gray-500">{item.email}</td>
                    <td className="px-5 py-4">
                      <span className={`px-3 py-1 text-xs rounded-full font-medium ${item.status === 'subscribed' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-500'}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex gap-1.5 flex-wrap">
                      {item.tags?.split(",").map(tag => (
                         <span key={tag} className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${ tagColor[tag] || "bg-gray-100 text-gray-500"
                            }`}
                              >
                          {tag}
                             </span>
                               ))}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-gray-400 text-xs whitespace-nowrap">{item.created_at ? new Date(item.created_at).toLocaleDateString()
                      : "—"} </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5">
                        <button className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-400 hover:text-blue-600 transition"><Eye size={14} /></button>
                        <button className="p-1.5 rounded-lg hover:bg-yellow-50 text-yellow-400 hover:text-yellow-600 transition"><Pencil size={14} /></button>
                        <button onClick={() => handleDelete(item.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 hover:text-red-600 transition"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      </main>
    </div>
  )
}