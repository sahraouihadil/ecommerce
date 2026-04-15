/**
 * Header.jsx - Dashboard Page Header
 * =====================================
 * Shows the page title (e.g. "Dashboard", "Accounts", "Complaints")
 * and a hamburger menu button for mobile screens.
 *
 * PROPS:
 *   concept   - The page title to display (string)
 *   openBar   - Whether the sidebar is currently open (boolean)
 *   setOpenBar - Function to toggle sidebar visibility
 */

import {X,Menu,} from "lucide-react";

export default function Header({concept,setOpenBar,openBar}){
  return(
          
          <div className="flex justify-between items-center">
                      {/* mobile */}
        <div className="p-4 min-[600px]:hidden">
           <button onClick={()=>setOpenBar(!openBar)} className="p-3 min-[600px]:hidden">
          {openBar ? <X/> : <Menu/>}
        </button>
        </div>

                <h1 className="font-bold mt-8 ml-3 text-4xl">{concept}</h1>
                 
               </div>
    
  )
}