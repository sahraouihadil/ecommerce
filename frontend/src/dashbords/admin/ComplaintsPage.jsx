import { useState } from "react";
import Header from "./ui/Header";
import Sidebar from "./ui/Sidebar";

export default function ComplaintsPage(){
     {/* sidebar (Mobile)*/}
   const [openBar,setOpenBar] = useState(window.innerWidth>=600);
const [selected,setSelected] = useState(null);
const complaints = [
    {
      id: "C-001",
      title: "AR Model Missing Textures",
      user: "Alex Johnson",
      date: "2023-10-24",
      priority: "HIGH",
      status: "Pending",
    },
    {
      id: "C-002",
      title: "Delayed Delivery",
      user: "James Wilson",
      date: "2023-10-23",
      priority: "MEDIUM",
      status: "Pending",
    },
    {
      id: "C-003",
      title: "Incorrect Dimensions",
      user: "Linda Chen",
      date: "2023-10-22",
      priority: "LOW",
      status: "Resolved",
    },
  ];

  return(
    <div className="flex min-h-screen bg-gray-100">

      {/* Sidebar */}
      <Sidebar openBar={openBar} setOpenBar={setOpenBar}/>
                     
   
      {/* Main */}
      <main className="flex-l p-4 sm:p-6 space-y-6 w-full">
            {/*Header*/}
          <Header concept="Complaints" setOpenBar={setOpenBar} openBar={openBar}/>


      <div className="flex gap-7">
               {/* Left - Index */}
        <div className="space-y-4 w-full max-w-md">
          <div className="flex justify-between items-center">
             <h2 className="text-lg font-semibold">Inbox</h2>
             <span className="text-xs bg-gray-200 px-2 py-1 rounded-full">
              {complaints.length} Total
             </span>
          </div>
         
          {complaints.map((c)=>(
            <div key={c.id} onClick={()=> setSelected(c)} className={`p-4 rounded-xl shadow cursor-pointer border transition ${selected?.id === c.id ? "border-black bg-gray-50" : "bg-white hover:bg-gray-50"}`}
            >
               <div className="flex justify-between items-center mb-1">
                 <span className="text-xs text-gray-500">{c.id}</span>

                 <span className={`text-xs px-2 py-1 rounded-full ${
                  c.priority === "HIGH"
                  ? "bg-red-100 text-red-600"
                  : c.priority === "MEDIUM"
                  ? "bg-yellow-100 text-yellow-600"
                  : "bg-blue-100 text-blue-600"
                 }`}>{c.priority}</span>
               </div>

               <p className="font-semibold">{c.title}</p>
               <p className="text-sm text-gray-500">{c.user}</p>
               <p className="text-xs text-gray-400">{c.date}</p>

               <p className={`text-xs mt-2 ${ c.status === "Resolved" ? "text-green-500" : "text-orange-500"}`}>{c.status}</p>
            </div>
          ))}
        </div>

        {/* Right - Details */}
        <div className="lg:col-span-2 flex-1 items-center justify-center bg-white rounded-xl shadow p-4 sm:p-6 min-h-[400px]">
          {selected ? (
            <div className="w-full space-y-6">
            <h2 className="text-xl font-bold">{selected.title}</h2>
            <p className="text-sm text-gray-400">
              ID: {selected.id} • Received on {selected.date}
            </p>
            <div/>

            {/* User INfo*/}
            <div className="flex justify-between items-center flex-wrap gap-4 bg-gray-50 p-4 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center font-bold">
                  {selected.user.slice(0,2).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold">{selected.user}</p>
                  <p className="text-sm text-gray-500">email@exmple.com</p>
                </div>
              </div>

              <div className="text-sm">
                 <p className="text-gray-400">Priority</p>
                 <p className="text-red-500 font-semibold">{selected.priority}</p>
              </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-500 mb-2">
                  COPLAINT DESCRIPTION
                </h3>
                <div className="bg-gray-100 p-4 rounded-xl text-sm break-words">
                  This is a detailed description of the complaint. You can replace this with real backend data.
                </div>
              </div>

              {/* Notes */}
              <div>
                <h3 className="text-sm font-semibold text-gray-500 mb-2">
                  INTERNAL NOTES
                </h3>
                <textarea placeholder="Type internal notes..." className="w-full p-3 border rounded-xl outline-none min-h-[120px]"/>
              </div>

               {/* Buttons */}
               <div className="flex flex-col sm:flex-row gap-3">
                <button className="flex-1 bg-green-500 text-white py-3 rounded-xl">
                  Mark as Resolved
                </button>
                <button className="flex-1 border py-3 rounded-xl">
                  Dismiss
                </button>
               </div>
               </div>
           
          ):(
            <div className="text-center text-gray-400 py-20 w-full">
             <p className="text-lg font-semibold">No Complaint Selected</p>
             <p>Select a complaint to view details</p>
              </div>
          )}

        </div>
      </div>
 

      </main>
    </div>
  );
}