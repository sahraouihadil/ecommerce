/**
 * AProfilePage.jsx - Admin Profile Page
 * ========================================
 * Shows the admin user's detailed profile including:
 *
 *   - Profile card with avatar, name, role, and key stats
 *   - Contact information (email, phone, location, timezone)
 *   - Security settings (change password, 2FA, active sessions)
 *   - Permissions & Access overview (what this admin can do)
 *   - Recent activity feed
 *   - Danger zone (sign out all devices, deactivate account)
 *
 * NOTE: Currently uses hardcoded profile data.
 *       Connect to a profile API to show real user data.
 */

import Header from "./ui/Header";
import Sidebar from "./ui/Sidebar";
import { useState } from "react";

export default function AProfilePage(){
     {/* sidebar (Mobile)*/}
     const [openBar,setOpenBar] = useState(window.innerWidth>=600);
  return(
    <div className="flex min-h-screen bg-gray-100">

       {/* Sidebar */}
      <Sidebar openBar={openBar} setOpenBar={setOpenBar}/>
                      
      {/* Main */}
      <main className="flex-1 p-4 sm:p-6 space-y-6">
              {/*Header*/}
            <Header concept="My Profile" setOpenBar={setOpenBar} openBar={openBar}/>

        {/* TOP PROFILE CARD */}
        <div className="bg-white rounded-2xl shadow overflow-hidden">
          {/* Banner */}
          <div className="h-32 bg-gradient-to-r from-black via-indigo-600 to-purple-500"/>

          {/* Content */}
          <div className="p-6 relative">

          {/* Avatar */}
          <img src="https://i.pravatar.cc/100" alt="" 
          className="w-20 h-20 md:w-24 md:h-24 rounded-xl rounded-xl border-4 border-white absolute -top-10 md:-top-12 left-1/2 md:left-6 -translate-x-1/2 md:translate-x-0"/>    
          {/* Info */}
          <div className="mt-16 md:mt-0 md:ml-32">
            <div className="flex justify-between items-center flex-wrap gap-4">
              <div>
                <h2 className="text-xl font-bold">
                  Admin User 
                  <span className="ml-2 text-xs bg-gray-200 px-2 py-1 rounded-full m-4">
                    Super Admin
                  </span>
                </h2>

                <p className="text-gray-500 text-sm">admin@admincore.io</p>
              </div>
              <button className="bg-black text-white px-4 py-2 rounded-xl text-sm">✏️ Edit Profile</button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-6">

              <div className="bg-gray-100 p4 rounded-xl p-3">
                <p className="text-xs text-gray-500">Role</p>
                <p className="font-semibold">Super Admin</p>
              </div>

               <div className="bg-gray-100 p4 rounded-xl p-3">
                <p className="text-xs text-gray-500">Member Since</p>
                <p className="font-semibold">Jan 2022</p>
              </div>


               <div className="bg-gray-100 p4 rounded-xl p-3">
                <p className="text-xs text-gray-500">Last Login</p>
                <p className="font-semibold">Just now</p>
              </div>

                <div className="bg-gray-100 p4 rounded-xl p-3">
                <p className="text-xs text-gray-500">Sessions</p>
                <p className="font-semibold">1,234</p>
              </div>


            </div>
          </div>
          </div>
        </div>

        {/* LOWER GRID */}
      <div className="columns-1  md:columns-2 gap-6 space-y-6">
        {/* Contact Info */}
        <div className="bg-white rounded-2xl shadow p-6 break-inside-avoid">
          <h3 className="font-semibold mb-4">Contact Information</h3>
          <div className="space-y-4 text-sm">

            <div>
              <p className="text-gray-500">Email</p>
              <p className="font-medium">admin@admincore.io</p>
            </div>

   <div>
              <p className="text-gray-500">Phone</p>
              <p className="font-medium">0502372645</p>
            </div>

               <div>
              <p className="text-gray-500">Location</p>
              <p className="font-medium">Constantine</p>
            </div>

               <div>
              <p className="text-gray-500">Timezone</p>
              <p className="font-medium">UTC-8 (PST)</p>
            </div>

          </div>
        </div>
        {/* Security */}
        <div className="bg-white rounded-2xl shadow p-6 break-inside-avoid">
          <h3 className="font-semibold mb-4">Security</h3>

          <div className="bg-gray-100 p-4 rounded-xl flex justify-between items-center m-2">
            <div>
              <p className="font-medium">Change Password</p>
              <p className="text-xs text-gray-500">Last changed 30 days ago</p>
            </div>
            <span>›</span>
          </div>

          <div className="bg-gray-100 p-4 rounded-xl flex justify-between items-center m-2">
            <div>
              <p className="font-medium">Two-Factor Actor</p>
              <p className="text-xs text-gray-500">Enabled via Authenticator</p>
            </div>
            <span>›</span>
          </div>

           <div className="bg-gray-100 p-4 rounded-xl flex justify-between items-center m-2">
            <div>
              <p className="font-medium">Active Sessions</p>
              <p className="text-xs text-gray-500">1 device currently active</p>
            </div>
            <span>›</span>
          </div>

        </div>
        
        {/* Permissions */}
        <div className="bg-white rounded-2xl shadow p-6 break-inside-avoid">
          <div className="flex justify-between mb-4">
            <h3 className="font-semibold">Permissions & Access</h3>
            <span className="text-xs bg-gray-200 py-1 px-2 rounded-4xl text-center md:rounded-full ">Full Access</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2  gap-3 text-sm">
             
            {[
              {title:"User Management",
              des:"Create,edit,delete accounts"},
              {title:"Complaints Resolution",
              des:"Resolve and dismiss complaints"},
              {title:"Financial Reports",
              des:"Access revenue & sales data"},
              {title:"AR Configration",
              des:"Toggle AR on prducts"},
              {title:"System Settings",
              des:"Modify global configurations"},
              {title:"Audit Log Access",
              des:"View all admin actions"}
            ].map((p)=>(
              
                  <div className="grid grid-cols-[auto_1fr] bg-gray-100 p-3 rounded-xl gap-1">
              
                    <span className="text-green-500 ">✔</span>
                <div>
                  <p className="font-semibold">{p.title}</p>
                <p className="text-gray-500 text-xs">{p.des}</p>
                </div>

              </div>
            ))}
          </div>

        </div>

    {/* Recent Activity */}
       <div className="bg-white rounded-2xl shadow p-6 break-inside-avoid">
                <div className="flex justify-between mb-4">
                  <h3 className="font-semibold">Recent Activity</h3>
                  <span className="text-sm text-gray-500 cursor-pointer">View all</span>
                </div>

                <div className="space-y-4 text-sm">
                  <div className="flex items-center gap-3">
                    <span className="text-green-500">✔</span>
                    <div>
                      <p> Resolved complaint C-003</p>
                      <p className="text-xs text-gray-500">2 hours ago</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-blue-500">👤</span>
                    <div>
                      <p>Added new user Emily Davis</p>
                      <p className="text-xs text-gray-500">1 day ago</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-orange-500">📦</span>
                    <div>
                      <p>Disabled AR on Oak Desk</p>
                      <p className="text-xs text-gray-500">2 days ago</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-purple-500">📊</span>
                    <div>
                      <p>Reviewed platform reports</p>
                      <p className="text-xs text-gray-500">3 days ago</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-gray-500">⚙️</span>
                    <div>
                      <p>Updated system configrations</p>
                      <p className="text-xs text-gray-500">5 days ago</p>
                    </div>
                  </div>

                </div>
              </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
          

            </div>

       
          </div>
               {/* Danger zone */}
            <div className="bg-red-50 border border-red-200 rounded-2xl p-6 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <div>
                <h3 className="font-semibold text-red-600">⚠ Danger Zone</h3>
                <p className="text-sm text-red-500">
                  These actions are irreversible. Proceed with caution.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <button className="px-4 py-2 rounded-xl border border-red-300 text-red-600 hover:bg-red-100">
                  Sign Out of All Devices
                </button>

                <button className="px-4 py-2 rounded-xl border bg-red-600 text-white hover:bg-red-700">
                  Deactivate Account
                </button>
              </div>
            </div>
      </main>
    </div>
  )
}