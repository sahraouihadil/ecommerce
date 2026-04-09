import Header from "./ui/Header";
import Sidebar from "./ui/Sidebar";
import { useState } from "react";

export default function EngagementPage(){
     {/* sidebar (Mobile)*/}
     const [openBar,setOpenBar] = useState(window.innerWidth>=600);

  return(
    <div className="flex min-h-screen bg-gray-100">
    {/* Sidebar */}
  <Sidebar openBar={openBar} setOpenBar={setOpenBar}/>
                   
     {/* Main */}
      <main className="flex-1 p-6 space-y-6">
              {/*Header*/}
            <Header concept="Engagement" setOpenBar={setOpenBar} openBar={openBar}/>
         {/* Top Section */}
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Website Traffic */}
          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="font-semibold mb-4">Website Traffic (Visitor Sessions)</h2>
            {/* Fake Line Chart */}
            <div className="relative h-56">
              <svg className="w-full h-full">
               <polyline fill="none" stroke="#10b981" strokeWidth="3" points="0,160 60,180 120,40,180,120 240,100 300,130 360,110">
               </polyline>
              </svg>
              {/* Labels */}
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map((d)=>(
                  <span key={d}>{d}</span>
                ))}
              </div>
            </div>
          </div>
          {/* Engagement Overview */}
          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="font-semibold mb-4">Engagement Overview</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Visitors */}
            <div className="bg-blue-50 p-4 rounded-xl">
              <p className="text-sm text-gray-500">Total Visitors</p>
              <h3 className="text-2xl font-bold text-blue-600 mt-1">123,334</h3>
              <p className="text-xs text-blue-500 mt-1">+12,5 vs last month</p>
            </div>
            {/* Session Time */}
            <div className="bg-green-50 p-4 rounded-xl">
              <p className="text-sm text-gray-500">Avg. Session Time</p>
              <h3 className="text-2xl font-bold text-green-600 mt-1">4m 32s</h3>
              <p className="text-xs text-gray-500 mt-1"> +0.8% vs last month</p>
            </div>
            {/* Conversion */}
            <div className="bg-purple-50 p-4 rounded-xl">
              <p className="text-sm text-gray-500">AR Conversion Rate</p>
              <h3 className="text-2xl font-bold text-purple-600 mt-1">8.4%</h3>
              <p className="text-xs text-purple-500 mt-1">+2.1% vs last month</p>
            </div>
            </div>
          </div>
         </div>
      </main>
    </div>
  )
}