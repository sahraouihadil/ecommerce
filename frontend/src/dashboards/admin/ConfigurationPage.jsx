/**
 * ConfigurationPage.jsx - System Configuration (Admin)
 * =======================================================
 * Admin settings page with two main sections:
 *
 *   1. Global Feature Control - Toggle switches for:
 *      - AR Support (master switch for all AR features)
 *      - AI Chatbot (automated customer assistance)
 *
 *   2. Product AR Management - Per-product AR toggles:
 *      - Enable/disable AR preview for individual products
 *
 * NOTE: Toggles are currently UI-only (not connected to backend).
 *       Connect them to a settings API to make them functional.
 */

import Header from "../ui/Header";
import Sidebar from "../ui/Sidebar";
import { useState } from "react";

export default function ConfigurationPage(){
     {/* sidebar (Mobile)*/}
     const [openBar,setOpenBar] = useState(window.innerWidth>=600);

  return(
    <div className="flex min-h-screen bg-gray-100">

     {/* Sidebar */}
    <Sidebar openBar={openBar} setOpenBar={setOpenBar}/>
                
     {/* Main */}
      <main className="flex-1 p-6 space-y-6">
             {/*Header*/}
           <Header concept="Configration" setOpenBar={setOpenBar} openBar={openBar}/>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* LEFT: Global Feature Control */}
          <div>
            <h2 className="font-semibold mb-4">Global Feature Control</h2>

            <div className="bg-white rounded-2xl shadow p-6 space-y-4">

              {/* Feature 1 */}
              <div className="flex items-center justify-between bg-gray-100 p-4 rounded-xl">
                <div>
                  <p className="font-medium">Global AR Support</p>
                  <p className="text-sm text-gray-500">
                    Master switch for all AR features
                  </p>
                </div>
                {/* Toggle */}
                <div className="w-12 h-6 bg-black rounded-full relative cursor-pointer">
                  <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                </div>
              </div>

              {/* Feature 2 */}
                   <div className="flex items-center justify-between bg-gray-100 p-4 rounded-xl">
                <div>
                  <p className="font-medium">AI Support Chatbot</p>
                  <p className="text-sm text-gray-500">
                    Automated custmer assistance
                  </p>
                </div>
                {/* Toggle */}
                <div className="w-12 h-6 bg-black rounded-full relative cursor-pointer">
                  <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                </div>
              </div>
             
             </div>
             </div>

             {/* RIGHT: Product AR Management */}
             <div>
              <h2 className="font-semibold mb-4">Product AR Management</h2>

              <div className="bg-white rounded-2xl shadow overflow-hidden">
                {/* Product Item */}
                {[
                  { name:"product 1", type:"Table",active:true},
                  { name:"product 2", type:"Table",active:true},
                  { name:"product 3", type:"Table",active:true},
                  { name:"product 4", type:"Table",active:true},
                  { name:"product 5", type:"Table",active:true},
                ].map((p,i)=>(
                  <div key={i} className="flex items-center justify-between p-4 border-b last:border-none">
                    {/* Info */}
                    <div>
                      <p className="font-medium">{p.name}</p>
                      <p className="text-sm text-gray-500">{p.type}</p>
                    </div>
                    {/* Status + Toggle */}
                    <div className="flex items-center gap-3">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        p.active ? "bg-blue-100 text-blue-600" :"bg-gray-200 text-gray-500"
                      }`}>
                        {p.active ? "AR ACTIVE" : "AR HIDDEN"}
                      </span>

                      {/* Toggle */}
                      <div className={`w-12 h-6 rounded-full relative cursor-pointer ${p.active ? "bg-blue-500":"bg-gray-300"}`}>
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${p.active ? "right-1" : "left-1"}`}/>
                    </div>
                  </div>
                </div>
                ))}
                {/* Footer */}
                <div className="text-center p-4 text-sm text-gray-500 hover:text-black cursor-pointer"> + Manager All</div>
             </div>

            </div>
          </div>
      </main>
    </div>
  )
}