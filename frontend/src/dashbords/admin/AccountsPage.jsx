import { useState } from "react";
import Header from "./ui/Header";
import Sidebar from "./ui/Sidebar";

export default function AccountsPage() {
   {/* sidebar (Mobile)*/}
   const [openBar,setOpenBar] = useState(window.innerWidth>=600);
   const [activeFilter,setActiveFilter] = useState("All");

  const [users,setUsers] = useState([
    { name: "Alex Johnson", email: "alex@example.com", role: "Customer", status: "Active",last:"2 mins ago" },
    { name: "Sarah Miller", email: "sarah@agency.com", role: "Marketing Manager", status: "Active" ,last:"19 mins ago" },
    { name: "Mike Ross", email: "mike@warehouse.com", role: "Stock Manager", status: "Active" ,last:"30 mins ago" },
    { name: "John Doe", email: "john@logistics.com", role: "Deliveryman", status: "Inactive" ,last:"2 days ago"  },
  ]);
  const [open,setOpen] = useState(false);
  const [form,setForm] = useState({
    name:"",
    email:"",
    role:"Customer",
  });

  const handleCreate = () => {
    if (!form.name || !form.email) return;

     setUsers([
      ...users,
      {...form,status: "Active",last:"Now",},
     ]);
     setForm({name:"",email:"",role:"Customer"});
     setOpen(false);
  }

  const filters = [
    "All",
    "Customer",
    "Marketing Manager",
    "Stock Manager",
    "Deliveryman"
  ];

  const filteredUsers = activeFilter === "All" ? users : users.filter((u)=> u.role === activeFilter);


  return (
    <div className="flex min-h-screen bg-gray-100">
       
           {/* Sidebar */}
          <Sidebar openBar={openBar} setOpenBar={setOpenBar}/>
                           
                {/* Main */}
              <main className="flex-1 p-4 sm:p-6 space-y-6 min-w-0">
                   {/*Header*/}
                 <Header concept="Accounts" setOpenBar={setOpenBar} openBar={openBar}/>
               {/* Filters + Actions */}
               <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                {/* Filter */}
                <div className="flex flex-wrap gap-2">
                    {filters.map((f)=>(
                  <button key={f} onClick={()=>setActiveFilter(f)} className={`px-4 py-1 rounded-full text-xs sm:text-sm transition ${activeFilter === f ? "bg-black text-white" : "bg-gray-200 hover:bg-black hover:text-white"}`}>
                    {f}
                  </button>
                ))}
               </div>
                
               <button onClick={()=>setOpen(true)} className="bg-black text-white px-4 py-2 rounded-xl text-sm w-full sm:w-auto"> + Add User</button></div>

               {/* Search */}
               <div className="bg-white p-3 py-2 rounded-xl shadow flex items-center gap-2 w-full sm:w-80">
              <i class="fa-solid fa-magnifying-glass" style="color: rgb(0, 0, 0);"></i>
                  <input type="text" placeholder="Search users by name or email..." className="outline-none w-full text-sm"/>
               </div>

               {/* Table */}
               <div className="bg-white rounded-2xl shadow overflow-x-auto">
                <table className="w-full min-w-[800px] text-sm">
                  <thead className="bg-gray-100 text-gray-500 text-xs uppercase">
                    <tr>
                      <th className="p-4 text-left">User</th>
                      <th className="text-left">Role</th>
                      <th>Status</th>
                      <th className="text-right pr-6">Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredUsers.map((u,i) => (
                      <tr key={i} className="border-t hover:bg-gray-50">
                        <td className="p-4 flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-semibold">
                         {u.name.split(" ").map(n=>n[0]).join("")}
                          </div>

                          <div>
                            <p className="font-semibold">{u.name}</p>
                            <p className="text-xs text-gray-500">{u.email}</p>
                          </div>
                        </td>

                        <td>{u.role}</td>
                        <td>
                          <span className={`px-3 py-1 rounded-full text-xs ${u.status === "Active" ? "bg-green-100 text-green-600" : "bg-gray-200 text-gray-500"}`}>
                            {u.status}
                          </span>
                        </td>

                        <td className="text-gray-500 text-xs">{u.last}</td>

                        <td className="text-right pr-6">
                          <div className="flex justify-end gap-3">
                            <button>✏️</button>
                            <button className="hover:text-red-500">🗑</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
               </div>
              </main>

              {/* Model */}

              {open && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                  <div className="bg-white rounded-2xl w-full max-w-md p-6 relative">
                    {/* Close */}
                    <button onClick={()=>setOpen(false)} className="absolute top-4 right-4">✕</button>
                    <h2 className="text-lg font-semibold mb-4">Add New Account</h2>

                    {/* Form */}
                    <div className="space-y-4">
                    
                        <input type="text"
                        placeholder="Full Name"
                        value={form.name}
                        onChange={(e)=>setForm({...form,name:e.target.value})}
                        className="w-full p-2 border rounded-lg" />
                    
                        <input type="email"
                        placeholder="Email"
                        value={form.name}
                        onChange={(e)=>setForm({...form,email:e.target.value})}
                        className="w-full p-2 border rounded-lg" />
         
               
                        <select value={form.value} onChange={(e)=> setForm ({...form,role: e.target.value})} className="w-full p-2 border rounded-lg">
                        <option>Customer</option>
                        <option>Marketing Manager</option>
                        <option>Stock Manager</option>
                        <option>Deliveryman</option>
                        </select>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex justify-end gap-3 mt-6">
                      <button onClick={()=> setOpen(false)} className="px-4 py-2 rounded-lg bg-gray-200">Cancel</button>

                      <button onClick={handleCreate} className="px-4 py-2 rounded-lg bg-black text-white">
                     Create Account
                      </button>
                    </div>

                  </div>
                </div>
              )}
    </div>
  )

}