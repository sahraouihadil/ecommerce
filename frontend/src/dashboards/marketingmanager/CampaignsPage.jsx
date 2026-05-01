import { useEffect, useState } from 'react'
import { Eye, Pencil, Trash2, Plus, Calendar, LayoutDashboard, Bot, Megaphone, BadgePercent, Activity, Mail, FileText } from 'lucide-react'
import api from '../../services/api'
import Sidebar from '../ui/Sidebar'
import Header from '../ui/Header'

const statusStyle = {
  active:    'bg-green-100 text-green-600',
  draft:     'bg-yellow-100 text-yellow-700',
  paused:    'bg-orange-100 text-orange-600',
  completed: 'bg-blue-100 text-blue-600',
}

const channelColor = {
  Email:   'bg-blue-50   text-blue-600',
  AR:      'bg-violet-50 text-violet-600',
  Social:  'bg-pink-50   text-pink-600',
  Search:  'bg-green-50  text-green-600',
  Display: 'bg-orange-50 text-orange-600',
}

function Badge({ label, styleMap }) {
  return <span className={`px-3 py-1 text-xs rounded-full font-medium ${styleMap[label] || 'bg-gray-100 text-gray-500'}`}>{label}</span>
}

function CampaignCard({ item, onDelete }) {
  const pct = item.budget > 0 ? Math.min(100, Math.round((item.spent / item.budget) * 100)) : 0
  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col gap-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start gap-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#EEF0FF] flex items-center justify-center shrink-0">
            <span className="text-[#5B47E0] text-sm font-bold">{item.channel[0]}</span>
          </div>
          <div>
            <p className="font-semibold text-gray-800 leading-tight">{item.name}</p>
            <Badge label={item.channel} styleMap={channelColor} />
          </div>
        </div>
        <Badge label={item.status} styleMap={statusStyle} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: 'Budget',      value: `$${item.budget.toLocaleString()}` },
          { label: 'Spent',       value: `$${item.spent.toLocaleString()}` },
          { label: 'Impressions', value: item.impressions },
          { label: 'Clicks',      value: item.clicks },
        ].map(m => (
          <div key={m.label} className="bg-gray-50 rounded-xl p-3">
            <p className="text-xs text-gray-400 mb-0.5">{m.label}</p>
            <p className="font-bold text-gray-800 text-sm">{m.value}</p>
          </div>
        ))}
      </div>
      <div>
        <div className="flex justify-between text-xs text-gray-400 mb-1.5">
          <span>Budget Used</span>
          <span className="font-medium text-gray-600">{pct}%</span>
        </div>
        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-[#5B47E0] rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
        </div>
      </div>
      <div className="flex justify-between items-center pt-1 border-t border-gray-50">
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <Calendar size={12} />
          <span>{item.start_date} → {item.end_date}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <button className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-400 hover:text-blue-600 transition"><Eye size={14} /></button>
          <button className="p-1.5 rounded-lg hover:bg-yellow-50 text-yellow-400 hover:text-yellow-600 transition"><Pencil size={14} /></button>
          <button onClick={() => onDelete(item.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 hover:text-red-600 transition"><Trash2 size={14} /></button>
        </div>
      </div>
    </div>
  )
}

export default function CampaignsPage() {
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
    api.get('/api/campaigns')
      .then(r => setItems(r.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const handleDelete = async (id) => {
    await api.delete(`/api/campaigns/${id}`)
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
        <Header concept="Campaigns" setOpenBar={setOpenBar} openBar={openBar} />

        <div style={{ padding: "28px 32px", display: "flex", flexDirection: "column", gap: 24 }}>

          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-400 mt-0.5">Track and manage marketing campaigns</p>
            </div>
            <button className="flex items-center gap-2 bg-[#5B47E0] text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#4a38cc] transition shadow-sm">
              <Plus size={16} /> New Campaign
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-2 border-[#5B47E0] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {items.map(item => (
                <CampaignCard key={item.id} item={item} onDelete={handleDelete} />
              ))}
            </div>
          )}

        </div>
      </main>
    </div>
  )
}