import Header from "./ui/Header";
import Sidebar from "./ui/Sidebar";
import { useState } from "react";

export default function ValidationPage(){
     {/* sidebar (Mobile)*/}
     const [openBar,setOpenBar] = useState(window.innerWidth>=600);
     const [selected,setSelected] = useState(null);

  const items =[
{
      title: "Scandinavian Bookshelf Pro",
      type: "PRODUCTS",
      user: "Mike Ross",
      status: "Pending",
    },
    {
      title: "AR Model — Lounge Chair v2",
      type: "AR",
      user: "Elena Vance",
      status: "Pending",
    },
    {
      title: "Black Friday Mega Sale",
      type: "CAMPAIGNS",
      user: "Sarah Miller",
      status: "Pending",
    },
    {
      title: "15% Off — New Arrivals",
      type: "PROMOTIONS",
      user: "Sarah Miller",
      status: "Approved",
    },
    {
      title: "Rattan Accent Chair",
      type: "PRODUCTS",
      user: "Mike Ross",
      status: "Rejected",
    },
    {
      title: "AR Model — Oak Desk",
      type: "AR",
      user: "Elena Vance",
      status: "Approved",
    }
  ]
  return(
    <div className="flex min-h-screen bg-gray-100">
    {/* Sidebar */}
  <Sidebar openBar={openBar} setOpenBar={setOpenBar}/>
                    
     {/* Main */}
      <main className="flex-1 p-6 space-y-6">
            {/*Header*/}
          <Header concept="Validation" setOpenBar={setOpenBar} openBar={openBar}/>
         {/* Top Stats */}
         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl shadow p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">⏳</div>
            <div>
              <p className="text-sm text-gray-500">Pending Review</p>
              <p className="font-bold text-lg">3</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">✅</div>
           <div>
            <p className="text-sm text-gray-500">Approved</p>
            <p className="font-bold text-lg">3</p>
           </div>
          </div>

          <div className="bg-white rounded-xl shadow p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              ❌
            </div>
            <div>
              <p className="text-sm text-gray-500">Rejected</p>
              <p className="font-bold text-lg">2</p>
            </div>
          </div>
         </div>
         {/* Content */}
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-200px)]">
          {/* LEFT PANEL */}
          <div className="bg-white rounded-2xl shadow p-4 flex flex-col h-full">
            {/* Filters */}
             <div className="flex gap-2 flex-wrap mb-4">
              {["All","Products","AR","Campaigns","Promotions"].map((f)=>(
                <button key={f} className="px-3 py-1 rounded-full bg-gray-200 text-sm hover:bg-black hover:text-white" >{f}</button>
              ))}
             </div>

             {/* List */}
             <div className="space-y-3 overflow-y-auto pr-2 flex-1">
              {items.map((item,i)=>(
                <div key={i} onClick={()=>setSelected(item)} className="flex justify-between items-center p-3 rounded-xl border hover:bg-gray-50 cursor-pointer">
                  {/* Left Info */}
                  <div>
                    <span className="text-xs px-2 py-1 bg-blue-100 text-blue-600 rounded-full ">{item.type}</span>

                    <p className="font-medium mt-1">{item.title}</p>
                    <p className="text-xs text-gray-500">Submitted by {item.user}</p>
                  </div>

                  {/* Status */}
                  <span className={`text-xs ${item.status === "Pending" ?"text-yellow-500" : item.status === "Approved" ? "text-green-600" : "text-red-500"}`}> ● {item.status}</span>
                </div>
              ))}
             </div>
          </div>

          {/* RIGHT PANEL */}
          <div className="bg-white rounded-2xl shadow flex flex-col items-center justify-center text-center p-6 h-full">
            
            {selected ? (
              <div className="bg-white rounded-2xl shadow flex flex-col h-full">
                 <div className="p-6 space-y-6 flex-1 overflow-y-auto">
                  <div className="flex justify-between items-start gap-4 flex-wrap">
                    <div className="flex gap-3 items-center">
                      <img src="https://via.placeholder.com/50" className="w-12 h-12 rounded-lg object-cover"/>
                      <div>
                        <h2 className="font-semibold text-lg">
                          {selected.title}
                        </h2>
                        <p className="text-sm text-gray-500">
                          V-001 • Submitted by {selected.user}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs px-3 py-1 bg-yellow-100 text-yellow-600 rounded-full">
                      ⏳ {selected.status}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                    <div className="bg-gray-50 p-4 rounded-xl">
                      <p className="text-xs text-gray-500">Category</p>
                      <p className="font-semibold">📦{selected.type}</p>
                    </div>

                        <div className="bg-gray-50 p-4 rounded-xl">
                      <p className="text-xs text-gray-500">Submitted</p>
                      <p className="font-semibold">2023-10-25 09:00 AM</p>
                    </div>
                  </div>

                  {/* Submission */}
                  <div>
                    <p className="text-xs font-semibold text-gray-500 mb-2">SUBMISSION DETAILS</p>
                    <div className="bg-gray-100 p-4 rounded-xl text-sm break-words">
                      New bookshelf listing with 6 color variants, dimensions and material specs included.
                    </div>
                  </div>
                  {/* Notes */}
                  <div>
                    <p className="text-xs font-semibold text-gray-500 mb-2">
                      REJECTION NOTE ( show to submitter )
                    </p>
                    <textarea placeholder="Describe why this was rejected or what needs to be correcte..." className="w-full p-3 border rounded-xl outline-none min-h-[120px]"/>

                  </div>
                 </div>

                 {/* Buttons */}
                 <div className="p-4 border-t flex flex-col sm:flex-row gap-3">
                  <button className="flex-1 bg-green-500 text-white py-3 rounded-xl">
                    ✔ Approve
                  </button>
                  <button className="flex-1 border py-3 rounded-xl text-red-500 border-gray-300">
                    ✖ Reject
                  </button>
                 </div>
              </div>
            ):(
              <div>
                 <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center text-3xl mb-4">
               📄
            </div>
            <h3 className="font-semibold text-lg">Select an Item to Review </h3>
            <p className="text-gray-500 text-sm mt-2">
              Choose a submission from the queue to view details,approve  or reject it.
            </p>
              </div>  
            )}
       
          </div>

         </div>
      </main>
    </div>
  )
}