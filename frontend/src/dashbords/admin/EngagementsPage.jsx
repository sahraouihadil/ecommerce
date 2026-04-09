import Header from "./ui/Header";
import Sidebar from "./ui/Sidebar";
import { useState } from "react";

import {
  Chart as ChartJS,
  LineElement,
  BarElement,
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from "chart.js";

import { Line, Doughnut, Bar } from "react-chartjs-2";

ChartJS.register(
  LineElement,
  BarElement,
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend
);

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

            {/* Line Chart */}
           <div className="h-56">
            <Line
            data={{
              labels : ["Sat" , "Sun" , "Mon","Tue","Wed","Thu","Fri"],
              datasets: [
                {
                  label: "Visitors",
                  data: [160,180,40,120,100,130,110],
                  borderColor:"#10b981",
                  backgroundColor: "rgba(16,185,129,0.2)",
                  tension:0.4,
                  fill: true,
                }
              ]
            }} 
            options={{
              responsive: true,
              plugins: {legend: {display:false}},
            }}
            />
           </div>
          </div>

          {/* Top Page */}
          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="font-semibold mb-4">Top Pages</h2>

            <div className="space-y-3">
              {[
                   { name: "Home Page", value: 80 },
                   { name: "Product Page", value: 65 },
                   { name: "AR View", value: 50 },
                   { name: "Checkout", value: 30 },
              ].map((item,i)=> (
                <div key={i}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{item.name}</span>
                    <span>{item.value}</span>
                  </div>
                  <div className="w-full bg-gray-200 h-2 rounded-full">
                    <div className="bg-black h-2 rounded-full"  style={{ width: `${item.value}%` }}/>
                  </div>
                </div>
              ))}
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