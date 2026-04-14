/**
 * AccountsPage.jsx - User Account Management (Admin)
 * =====================================================
 * Admin page for managing all user accounts in the system.
 *
 * FEATURES:
 *   - View all users in a table (name, email, role, status, last active)
 *   - Filter by role (Admin, Customer, Accountant, etc.)
 *   - Search users by name or email (real-time search via API)
 *   - Add new user (modal form -> POST /api/users)
 *   - Edit user (modal form -> PUT /api/users/:id)
 *   - Delete user (DELETE /api/users/:id)
 *
 * API ENDPOINTS:
 *   GET    /api/users          - Fetch all users
 *   GET    /api/users/:id      - Fetch single user for editing
 *   POST   /api/users          - Create new user
 *   PUT    /api/users/:id      - Update user
 *   DELETE /api/users/:id      - Delete user
 *   GET    /search-users       - Search by keyword
 */

import { useState,useEffect } from "react";
import Header from "../ui/Header";
import Sidebar from "../ui/Sidebar";
import api from "../../services/api";

export default function AccountsPage() {
   {/* sidebar (Mobile)*/}
   const [openBar,setOpenBar] = useState(window.innerWidth>=600);
   const [activeFilter,setActiveFilter] = useState("All");

  const [users,setUsers] = useState([]);

     useEffect(()=>{
    api.get("/api/users").then((res)=>{
      setUsers(res.data);
    }).catch((err)=>{
      console.log("Error:",err)
    });
   },[]);


  const [open,setOpen] = useState(false);
  const [form,setForm] = useState({
    username:"",
    email:"",
    role:"Admin",
  });

  const handleCreate = async () => {
    if (!form.username || !form.email){
      console.log("Username and email required");
         return;
    } 

try {

    const res = await api.post("/api/users", {
      username: form.username,
      email: form.email,
      role: form.role.toLowerCase(),
    });
    const newUser = res.data;
    setUsers((prev) => [...prev, newUser]);

    setForm({
      username: "",
      email: "",
      role: "Customer",
    });

    setOpen(false);

  } catch (err) {
    console.log("Error:", err.response?.data || err.message);
  }
};

     // Edit user 
   const [selectedUser,setSelectedUser] = useState(null);
   const [showModel,setShowModel] = useState(false);
   const [editForm,setEditForm] = useState({
    username:"",
    email:"",
    role:"Customer",
   });

   const handleEdit = async(user) => {
  try {
    const res = await api.get(`/api/users/${user.id}`);
    setSelectedUser(res.data);
    setEditForm(res.data);
    setShowModel(true);
  } catch (err) {
    console.log(err);
  }
   }

const handleSaveEdit = async () => {
  try {
    const dataToSend = {
      username: editForm.username,
      email: editForm.email,
      role: editForm.role.toLowerCase(),
    };

    const res = await api.put(
      `/api/users/${selectedUser.id}`,
      dataToSend
    );

    const updatedUser = res.data;

    setUsers((prev) =>
      prev.map((u) =>
        u.id === selectedUser.id ? updatedUser : u
      )
    );

    setShowModel(false);
  } catch (err) {
    console.log("Error:", err);
  }
};
   
   // remove user
   const handleRemoveUser =async(user) =>{
    try{
      await api.delete(`/api/users/${user.id}`)

      setUsers((prev)=>
        prev.filter((u)=>u.id !== user.id)
      )
    }catch(err){
       console.log("Error:", err);
    }
 
   }

  const filters = [
    "All",
    "Admin",
    "Customer",
    "Accountant",
    "Marketing Manager",
    "Stock Manager",
    "Deliveryman"
  ];
    
  const filteredUsers = activeFilter === "All" ? users : users.filter((u)=> String(u.role).toLowerCase() === activeFilter.toLowerCase());

  const [keyword,setKeyword] = useState("");
  const [results,setResults] = useState([]);

const handleSearch = async (event) =>{

  if (event) event.preventDefault();

  try{
    const response = await api.get(`/search-users?keyword=${keyword}`);
    console.log("Searching for:",keyword);

    setResults(response.data);
    console.log(response)
  }catch(error){
    console.error("Error during search:",error);
  }
};

useEffect(() => {
  if (keyword.trim() === "") return;

  handleSearch();
}, [keyword]);

  console.log(keyword)
  console.log(results)
  
  const displayedUsers = keyword ? results : filteredUsers;
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
              <i className="fa-solid fa-magnifying-glass text-black"></i>
                  <input type="text" placeholder="Search users by name or email..." className="outline-none w-full text-sm" onChange={(u)=>{setKeyword(u.target.value)}}/>
               </div>

               {/* Table */}
               <div className="bg-white rounded-2xl shadow overflow-x-auto">
                <table className="w-full min-w-[800px] text-sm">
                  <thead className="bg-gray-100 text-gray-500 text-xs uppercase">
                    <tr>
                      <th className="p-4 text-left">User</th>
                      <th className="text-left">Role</th>
                      <th className="text-left" >Status</th>
                      <th className="text-center">Last Active</th>
                      <th className="text-right pr-6">Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    
                    {displayedUsers?.map((u,i) => (
                     
                      <tr key={i} className="border-t hover:bg-gray-50 transition">
                        {/* User */}
                         
                        <td className="p-4 flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-semibold uppercase">
                         
                         {(u.username || "In").split(" ").map(n=>n[0]).join("")}
                          </div>

                          <div>
                            <p className="font-semibold">{u.username}</p>
                            <p className="text-xs text-gray-500">{u.email}</p>
                          </div>
                        </td>

                        <td className="text-gray-700">{u.role}</td>

                        <td>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${u.active === true ? "bg-green-100 text-green-900" : "bg-gray-200 text-gray-500"}`}>
                            {u.active ?"Active":"Inactive"}
                          </span>
                        </td>

                        <td className="text-gray-500 text-xs text-center">{u.last || "-"}</td>

                        <td className="text-right pr-6">
                          <div className="flex justify-end gap-3 text-gray-600">
                            <button onClick={()=> handleEdit(u)} className="hover:text-blue-500 transition">✏️</button>
                            <button onClick={()=>handleRemoveUser(u)} className="hover:text-red-500 transition">🗑</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
               </div>

              </main>

              {/* add user Model */}
              
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
                        value={form.username}
                        onChange={(e)=>setForm({...form,username:e.target.value})}
                        className="w-full p-2 border rounded-lg" />
                    
                        <input type="email"
                        placeholder="Email"
                        value={form.email}
                        onChange={(e)=>setForm({...form,email:e.target.value})}
                        className="w-full p-2 border rounded-lg" />
         
               
                        <select value={form.role} onChange={(e)=> setForm ({...form,role: e.target.value})} className="w-full p-2 border rounded-lg">
                        <option value="admin">Admin</option>
                        <option value="customer">Customer</option>
                        <option value="marketing_manager">Marketing Manager</option>
                        <option value="stock_manager">Stock Manager</option>
                        <option value="deliveryman">Deliveryman</option>
                        </select>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex justify-end gap-3 mt-6">
                      <button onClick={()=> setOpen(false)} className="px-4 py-2 rounded-lg bg-gray-200">Cancel</button>

                      <button onClick={handleCreate} className="px-4 py-2 rounded-lg bg-black text-white cursor-pointer">
                     Create Account
                      </button>
                    </div>

                  </div>
                </div>
              )}
              
              {/* edit user Model */}
              {showModel && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                  <div className="bg-white rounded-2xl w-full max-w-md p-6 relative shadow-lg">
                    {/* Close */}
                    <button onClick={() => setShowModel(false)} className="absolute top-4 right-4 text-gray-500">  ✕</button>
                    <h2 className="text-lg font-semibold mb-6">Edit Account</h2>

                    {/* Form */}
                  <div className="space-y-4">
                    {/* Name */}
                    <div>
                      <label className="text-sm text-gray-600">Full Name</label>
                      <input type="text" value={editForm.username} onChange={(e)=> setEditForm({...editForm,username:e.target.value})} className="w-full p-2 border rounded-lg mt-1"/>
                    </div>

                    {/* Email */}
                    <div>
                      <label className="text-sm text-gray-600">Email</label>
                      <input type="text" value={editForm.email} onChange={(e)=> setEditForm({...editForm,email:e.target.value})} className="w-full p-2 border rounded-lg mt-1"/>
                    </div>

                    {/* Role */}
                    <div>
                      <label className="text-sm text-gray-600">Role</label>
                      <select type="text" value={editForm.role} onChange={(e)=> setEditForm({...editForm,role:e.target.value})} className="w-full p-2 border rounded-lg mt-1">

                        <option value="admin">Admin</option>
                        <option value="customer">Customer</option>
                        <option value="marketing_manager">Marketing Manager</option>
                        <option value="stock_manager">Stock Manager</option>
                        <option value="deliveryman">Deliveryman</option>
                       </select>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end gap-3 mt-6">
                    <button onClick={() => setShowModel(false)} className="px-4 py-2 rounded-lg bg-gray-200">
                      Cancel
                    </button>

                    <button onClick={handleSaveEdit} className="px-4 py-2 rounded-lg bg-black text-white">
                      Save Changes
                    </button>
                  </div>
                  </div> 
                </div>
              )}
    </div>
  )

}