import { useEffect, useState } from 'react'
import { Eye, Pencil, Trash2, Plus, Layers, LayoutDashboard, Bot, Activity, Boxes,Truck,RotateCcw, } from 'lucide-react'
import api from '../../services/api'
import Sidebar from '../ui/Sidebar'
import Header from '../ui/Header'

const statusStyle = {
  active:   'bg-green-100 text-green-600',
  draft:    'bg-yellow-100 text-yellow-700',
  inactive: 'bg-gray-100 text-gray-500',
}

function Badge({ status }) {
  return <span className={`px-3 py-1 text-xs rounded-full font-medium ${statusStyle[status] || 'bg-gray-100 text-gray-500'}`}>{status}</span>
}

export default function ARPage() {
  const [items, setItems]     = useState([])
  const [loading, setLoading] = useState(true)
  const [openBar, setOpenBar] = useState(window.innerWidth >= 600)

  const stockManagerLinks = [
    { to: "/stock-manager-dash", label: "Dashboard", icon: <LayoutDashboard />, end: true },
    { to: "/stock-manager-dash/inventories", label: "Product's Catalog", icon: <Boxes /> },
    { to: "/stock-manager-dash/ar",          label: "AR/3D Management", icon: <Bot size={18} /> },
    { to: "/stock-manager-dash/deliveries", label: "Delivery", icon: <Truck /> },
    { to: "/stock-manager-dash/returns", label: "Returns", icon: <RotateCcw /> }
  ];

  useEffect(() => {
    api.get('/api/ar')
      .then(r => setItems(r.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const handleDelete = async (id) => {
    await api.delete(`/api/ar/${id}`)
    setItems(prev => prev.filter(i => i.id !== id))
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#F4F6FB" }}>
      <Sidebar
        openBar={openBar}
        setOpenBar={setOpenBar}
        links={stockManagerLinks}
        title="StockManagerCore"
        subtitle="Enterprise Suite"
        role="Stock Manager"
      />

      <main style={{ flex: 1, overflowY: "auto" }}>
        <Header concept="AR/3D Management" setOpenBar={setOpenBar} openBar={openBar} />

        <div style={{ padding: "28px 32px", display: "flex", flexDirection: "column", gap: 24 }}>

          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-400 mt-0.5">Manage augmented reality product models</p>
            </div>
            <button className="flex items-center gap-2 bg-[#5B47E0] text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#4a38cc] transition shadow-sm">
              <Plus size={16} /> Add AR
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-x-auto">
            <table className="w-full text-sm min-w-[700px]">
              <thead>
                <tr className="border-b border-gray-100">
                  {['Product Name','Category','Model File','Views','Status','Created','Actions'].map(h => (
                    <th key={h} className="text-left px-5 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12">
                      <div className="flex justify-center">
                        <div className="w-6 h-6 border-2 border-[#5B47E0] border-t-transparent rounded-full animate-spin" />
                      </div>
                    </td>
                  </tr>
                ) : items.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-gray-400 text-sm">No AR experiences found.</td>
                  </tr>
                ) : items.map((item) => (
                  <tr key={item.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/60 transition">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#EEF0FF] flex items-center justify-center shrink-0">
                          <Layers size={14} className="text-[#5B47E0]" />
                        </div>
                        <span className="font-medium text-gray-800">{item.product_name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-gray-500">{item.category}</td>
                    <td className="px-5 py-4">
                      <span className="font-mono text-xs bg-gray-50 border border-gray-200 px-2 py-1 rounded-md text-gray-500">{item.model_file}</span>
                    </td>
                    <td className="px-5 py-4 font-semibold text-gray-800">{item.views}</td>
                    <td className="px-5 py-4"><Badge status={item.status} /></td>
                    <td className="px-5 py-4 text-gray-400 text-xs">{item.created}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5">
                        <button className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-400 hover:text-blue-600 transition"><Eye size={15} /></button>
                        <button className="p-1.5 rounded-lg hover:bg-yellow-50 text-yellow-400 hover:text-yellow-600 transition"><Pencil size={15} /></button>
                        <button onClick={() => handleDelete(item.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 hover:text-red-600 transition"><Trash2 size={15} /></button>
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