/**
 * ReportPage.jsx - Sales & Analytics Reports (Admin)
 * =====================================================
 * Admin reporting page with charts and statistics:
 *
 *   - Revenue Overview: bar chart of daily revenue
 *   - AR Model Activity: line chart of AR feature usage
 *   - Detailed Sales Statistics: avg order value, conversion rate, return rate, margin
 *
 * NOTE: Currently uses hardcoded sample data.
 *       Connect to an analytics API for real data.
 */

import Header from "../ui/Header";
import Sidebar from "../ui/Sidebar";
import { useState } from "react";
import {
  Chart as ChartJS,
  BarElement,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from "chart.js";

import {Bar,Line} from "react-chartjs-2";

ChartJS.register(
  BarElement,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
);

export default function ReportPage(){
     {/* sidebar (Mobile)*/}
     const [openBar,setOpenBar] = useState(window.innerWidth>=600);

  return(
    <div className="flex min-h-screen bg-gray-100">
     {/* Sidebar */}
    <Sidebar openBar={openBar} setOpenBar={setOpenBar}/>
                    
     {/* Main */}
      <main className="flex-1 p-6 space-y-6">

      {/*Header*/}
    <Header concept="Reports" setOpenBar={setOpenBar} openBar={openBar}/>
         {/* Top Charts */}
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Revenue Overview */}
          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="font-semibold mb-4">Revenue Overview</h2>
            {/* Chart Bars */}
           <div className="h-64">
            <Bar 
            data={{
              labels : ["Sat" , "Sun" , "Mon","Tue","Wed","Thu","Fri"],
              datasets:[
                {
                  label:"Revenue",
                  data:[4000,3000,2000,2800,1900,2400,3500],
                  backgroundColor: "#6366f1",
                  borderRadius:8,
                }
              ]
            }}
            options={{
              responsive:true,
              plugins:{legend:{display: false}},
            }}
            />
           </div>
          </div>

          {/* AR Model Activity */}
          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="font-semibold mb-4">AR Model Activity</h2>

            {/* Fike Line Chart */}
            <div className="h-64">
              <Line
              data={{
                labels: ["Sat" , "Sun" , "Mon","Tue","Wed","Thu","Fri"],
                datasets:[
                  {
                    label: "AR Activity",
                    data: [150,170,40,120,100,130,110],
                    borderColor:"#10b981",
                    backgroundColor: "rgba(16,185,129,0.2)",
                    tension:0.4,
                    fill: true,
                  }
                ]
              }}
              options={{
                responsive: true,
                plugins:{
                  legend:{display:false},
                }
              }}
              />
            </div>
          </div>

         </div>

         {/* Stats Section */}
         <div className="bg-white rounded-2xl shadow p-6">
          <div className="flex justify-between mb-6">
            <h2 className="font-semibold">Detailed Sales Statistics</h2>
            <button className="text-sm text-gray-500 hover:text-black">Export CSV</button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

            <div className="bg-gray-100 p-4 rounded-xl text-center">
              <p className="text-xs text-gray-500">AVG ORDER VALUE</p>
              <p className="font-bold text-lg">10000DA</p>
            </div>

              <div className="bg-gray-100 p-4 rounded-xl text-center">
              <p className="text-xs text-gray-500">CONVERSION RATE</p>
              <p className="font-bold text-lg">3.2%</p>
            </div>

              <div className="bg-gray-100 p-4 rounded-xl text-center">
              <p className="text-xs text-gray-500">RETURN RATE</p>
              <p className="font-bold text-lg">1.4%</p>
            </div>

              <div className="bg-gray-100 p-4 rounded-xl text-center">
              <p className="text-xs text-gray-500">GROSS MARGIN</p>
              <p className="font-bold text-lg"></p>
            </div>

          </div>

         </div>
      </main>
    </div>
  )
}