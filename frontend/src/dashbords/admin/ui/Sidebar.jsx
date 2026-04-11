import { Button } from "./dashbordComp";
//NavLink is smart then Link is not just about navigation + isActive feature.
import { NavLink,useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  CheckSquare,
  BarChart,
  Activity,
  Settings,
  Menu,
  X,
} from "lucide-react";
import { useEffect} from "react";
import { logout } from "../../../services/auth";


const linkStyle = ({ isActive }) =>`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${ isActive ? "bg-black text-white p-2 rounded-lg"
 : "text-gray-600"}`;


export default function Sidebar({openBar,setOpenBar}){
  const navigate = useNavigate()

  const handleLogout = ()=>{
    logout();
    navigate("/");
  }

   useEffect(()=>{
    const handleResize = () =>{
     if(window.innerWidth>= 600){
      setOpenBar(true);
    }else{
      setOpenBar(false);
    }
    };
    handleResize();
    window.addEventListener("resize",handleResize);

    return () => window.removeEventListener("resize",handleResize);
   },[]);

  return(
      <div className="flex">
        {/* Sidebar */}
        {open ?  <aside className={` fixed top-0 left-0 h-full w-64 bg-white shadow-lg  p-5 z-50 flex flex-col justify-between transition-transform duration-300 ${openBar ? "translate-x-0" : "-translate-x-full"} min-[600px]:static min-[600px]:translate-x-0`}>
            {/* Top */}
                  <div>
                    {/* Logo */}
                    <div className="flex items-center gap-3 mb-8">
                     <div className="w-10 h-10 bg-black text-white flex items-center justify-center rounded-xl">
                      🛡
                     </div>
                     <div>
                      <h2 className="font-bold">AdminCore</h2>
                      <p className="text-xs text-gray-500">Enterprise Suite</p>
                     </div>
                    </div>

                    {/* Links */}
                    
                    <nav className="space-y-2">

                      <NavLink to="/admin-dash" end className={linkStyle}
                      > 
                      <LayoutDashboard size={18}/>
                      Dashboard</NavLink>
                      
                      <NavLink className={linkStyle} to="/admin-dash/accounts">
                      <Users size={18} />
                      Accounts</NavLink>

                      <NavLink to="/admin-dash/complaints" className={linkStyle}>
                      <MessageSquare size={18} />
                      Complaints
                      </NavLink>

                      <NavLink to="/admin-dash/reports" className={linkStyle}>
                      <BarChart size={18}/>
                      Repoorts
                      </NavLink>

                      <NavLink to="/admin-dash/engagment" className={linkStyle}>
                      <Activity size={18}/>
                      Engagement
                      </NavLink>


                      <NavLink to="/admin-dash/configration" className={linkStyle}>
                      <Settings size={18}/>
                      Configration
                      </NavLink>

                      <NavLink to="/admin-dash/validation" className={linkStyle}>
                      <CheckSquare size={18}/>
                      Validation
                      </NavLink>

                    </nav>
                  </div>
      
                {/* Bottom user */}
                  <div className="bg-gray-100 p-4 rounded-2xl">
                    <div className="flex items-center gap-3 mb-3">
                      <img src="http://i.pravatar.cc/40" className="w-10 h-10 rounded-full"/>
                      <div>
                        <NavLink to="/admin-dash/profile" className="font-semibold text-sm">Admin User</NavLink>
                        <p className="text-xs text-gray-500">Super Admin</p>
                      </div>
                    </div>
                    
                    <Button onClick={handleLogout} className="w-full bg white text-black border hover:bg-gray-200">Sign Out</Button>
                  </div>
      
                </aside> : ''}
    

                {/* Overlay */}
            {openBar && (
              <div onClick={()=>setOpenBar(false)} className="fixed inset-0 bg-black/30
              z-30 min-[600px]:hidden"></div>
            )}
      </div>   
  );
}