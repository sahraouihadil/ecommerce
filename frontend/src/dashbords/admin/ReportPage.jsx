import Header from "./ui/Header";
import Sidebar from "./ui/Sidebar";
import { useState } from "react";

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
            {/* Fake Chart Bars */}
            <div className="flex items-end gap-4 h-48">
              {[4000,3000,2000,2800,1900,2400,3500].map((v,i)=>(
                <div key={i} className="flex-1 flex flex-col items-center">
                  <div className="w-full bg-indigo-500 rounded-t-lg" style={{height:`${v / 50}px`}}/>

                <span className="text-xs mt-2 text-gray-500">
                  {["Sat","Sun","Mon","Tue","Wed","Thu","Fri"][i]}
                </span>
                </div>
              ))}
            </div>
          </div>

          {/* AR Model Activity */}
          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="font-semibold mb-4">AR Model Activity</h2>

            {/* Fike Line Chart */}
            <div className="relative h-48 flex items-end">
              <svg className="w-full h-full">
               <polyline fill="none" stroke="#10b981" strockWidth="3" points="0,150 60,170 120,40 180,120 240,100 300,130 360,110">
                </polyline></svg>
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