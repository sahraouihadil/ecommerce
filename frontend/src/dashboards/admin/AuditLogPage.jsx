/**
 * AuditLogPage.jsx - Admin Audit Log
 * =====================================
 * Shows a chronological record of all administrative actions.
 * Each log entry includes: title, description, type (INFO/WARNING),
 * category, timestamp, and the admin who performed the action.
 *
 * FEATURES:
 *   - Filter by category: User Management, Complaint, Validation
 *   - Stat badges: Total Events, Critical, Warnings, Info counts
 *
 * NOTE: Currently uses hardcoded sample data.
 *       Connect to an audit log API for real tracking.
 */

import Header from "./ui/Header"
import Sidebar from "./ui/Sidebar"
import { useState } from "react";

export default function AuditLogPage(){
  const [openBar,setOpenBar] = useState(window.innerWidth >= 600);
  const [activeFilter,setActiveFilter] = useState("All");

  const logs = [{
    title: "Resolved Complaint",
    subtitle: "Complaint C-003 - Incorrect Dimensions",
    desc: "Complaint marked as resolved. Customer notified via email.",
    type: "INFO",
    category: "Complaint",
    date: "2023-10-25 11:42 AM",
},
  {
    title: "Approved Submission",
    subtitle: "V-006 - AR Model Oak Desk",
    desc: "AR model submission approved and set to live status.",
    type: "INFO",
    category: "Validation",
    date: "2023-10-25 10:58 AM",
},
{
    title: "Created User Account",
    subtitle: "Emily Davis - AR Developer",
    desc: "New AR developer account created.",
    type: "INFO",
    category: "User Management",
    date: "2023-10-24 03:15 PM",
},
{
    title: "Rejected Submission",
    subtitle: "V-005 - Rattan Accent Chair",
    desc: "Submission rejected due to missing data.",
    type: "WARNING",
    category: "Validation",
    date: "2023-10-24 01:30 PM",
}];

  const filters=[
    "All",
    "User Management",
    "Complaint",
    "Validation",
  ]
 const filteredLogs = activeFilter === "All" ? logs : logs.filter((u)=> u.category === activeFilter);
  return(
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar openBar={openBar} setOpenBar={setOpenBar}/>

      <main className="flex-1 p-6 space-y-6">
        <Header concept="Audit Log" openBar={openBar} setOpenBar={setOpenBar}/>
        {/* Title */}
        <div>
        
          <p className="text-gray-500 text-sm"> Complete record of all administrative actions.</p>
        </div>
        {/* Stats */}
        <div className="flex gap-3 flex-wrap">
          <span className="px-3 py-1 bg-gray-200 rounded-full text-sm">
            Total Events: 10
          </span>
          <span className="px-3 py-1 bg-red-100 text-red-600 rounded-full text-sm"> Critical: 2</span>
          <span className="px-3 py-1 bg-yellow-100 text-yellow-600 rounded-full text-sm">Warnings: 2</span>
          <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-sm">Info: 6</span>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
         {filters.map((f)=>(
          <button key={f} onClick={()=>setActiveFilter(f)} className={`px-3 py-1 rounded-full  text-sm cursor-pointer ${activeFilter === f ? "bg-black text-white hover:bg-gray-200 hover:text-black" : "hover:bg-black hover:text-white bg-gray-200"}`}>{f}</button>
         ))}
        </div>

        {/* Logs */}
        <div className="bg-white rounded-2xl shadow divide-y">
          {filteredLogs.map((log,i)=>(
            <div key={i}  className="p-4 flex gap-4 items-start">
              {/* Icon */}
              <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">📄</div>

              {/* Content */}
              <div className="flex-1">
                <div className="flex gap-2 items-center flex-wrap">
                  <p className="font-semibold">{log.title}</p>
                  <span className="text-xs px-2 py-1 bg-blue-100 text-blue-600 rounded-full">{log.type}</span>
                  <span className="text-xs px-2 py-1 bg-gray-200 rounded-full">{log.category}</span>
                </div>
                <p className="text-sm text-gray-600">{log.subtitle}</p>
                <p className="text-xs text-gray-400 mt-2">{log.desc}</p>
                <p className="text-xs text-gray-400 mt-2">
                   🕒 {log.date} • Admin User • 192.168.1.101
                </p>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}