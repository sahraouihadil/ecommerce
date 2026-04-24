import { useEffect, useState } from 'react'
import { Eye, Pencil, Trash2, Plus, User, Calendar, LayoutDashboard, Bot, Megaphone, BadgePercent, Activity, Mail, FileText } from 'lucide-react'
import api from '../../services/api'
import Sidebar from '../ui/Sidebar'
import Header from '../ui/Header'

const statusStyle = {
  published: 'bg-green-100 text-green-600',
  draft:     'bg-yellow-100 text-yellow-700',
  scheduled: 'bg-blue-100 text-blue-600',
}

const categoryStyle = {
  AR:         'bg-violet-50 text-violet-600',
  Email:      'bg-blue-50   text-blue-600',
  Promotions: 'bg-orange-50 text-orange-600',
  Social:     'bg-pink-50   text-pink-600',
  Branding:   'bg-teal-50   text-teal-600',
}

function StatusBadge({ status }) {
  return <span className={`px-3 py-1 text-xs rounded-full font-medium ${statusStyle[status] || 'bg-gray-100 text-gray-500'}`}>{status}</span>
}

function CategoryBadge({ category }) {
  return <span className={`px-2.5 py-1 text-xs rounded-full font-medium ${categoryStyle[category] || 'bg-gray-100 text-gray-500'}`}>{category}</span>
}

function BlogCard({ item, onDelete }) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col gap-3 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-center">
        <CategoryBadge category={item.category} />
        <StatusBadge status={item.status} />
      </div>
      <div className="flex-1">
        <h3 className="font-bold text-gray-800 leading-snug text-base">{item.title}</h3>
        <p className="text-sm text-gray-400 mt-1.5 line-clamp-2 leading-relaxed">{item.excerpt}</p>
      </div>
      <div className="flex justify-between items-center pt-2 border-t border-gray-50 mt-auto">
        <div className="flex items-center gap-3 text-xs text-gray-400 flex-wrap">
          <span className="flex items-center gap-1"><User size={11} />{item.author}</span>
          <span className="flex items-center gap-1"><Eye size={11} />{item.views}</span>
          <span className="flex items-center gap-1"><Calendar size={11} />{item.date}</span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <button className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-400 hover:text-blue-600 transition"><Eye size={14} /></button>
          <button className="p-1.5 rounded-lg hover:bg-yellow-50 text-yellow-400 hover:text-yellow-600 transition"><Pencil size={14} /></button>
          <button onClick={() => onDelete(item.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 hover:text-red-600 transition"><Trash2 size={14} /></button>
        </div>
      </div>
    </div>
  )
}

export default function BlogsPage() {
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
    api.get('/api/blogs')
      .then(r => setItems(r.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const handleDelete = async (id) => {
    await api.delete(`/api/blogs/${id}`)
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
        <Header concept="Blog Posts" setOpenBar={setOpenBar} openBar={openBar} />

        <div style={{ padding: "28px 32px", display: "flex", flexDirection: "column", gap: 24 }}>

          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-400 mt-0.5">Create and manage marketing blog content</p>
            </div>
            <button className="flex items-center gap-2 bg-[#5B47E0] text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#4a38cc] transition shadow-sm">
              <Plus size={16} /> New Post
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-2 border-[#5B47E0] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {items.map(item => (
                <BlogCard key={item.id} item={item} onDelete={handleDelete} />
              ))}
            </div>
          )}

        </div>
      </main>
    </div>
  )
}