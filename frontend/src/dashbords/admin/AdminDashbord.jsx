import { useEffect} from "react";
import { useNavigate, NavLink  } from "react-router-dom";
import { Card,CardContent,Button,StatCard } from "./ui/dashbordComp";
import Header from "./ui/Header";
import Sidebar from "./ui/Sidebar";
import { useState } from "react";
import { FaUserCheck,FaBox} from "react-icons/fa";
import { Chart as ChartJS,LineElement,CategoryScale,LinearScale,PointElement,Tooltip,Legend} from "chart.js";
import {Line} from "react-chartjs-2";

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend
);

export function AdminDashboard(){
   const navigate = useNavigate();
   // sidebar (Mobile)
   const [openBar,setOpenBar] = useState(window.innerWidth>=600);

   const data = {
  labels: ["Jan", "Feb", "Mar", "Apr"],
  datasets: [
    {
      label: "Users",
      data: [400, 800, 1200, 900],
      borderColor: "black",
      backgroundColor: "rgba(0,0,0,0.1)",
      tension: 0.4,
    },
        {
      label: "Orders",
      data: [200, 600, 900, 700],
      borderColor: "green",
      backgroundColor: "rgba(0,255,0,0.1)",
      tension: 0.4,
    },
  ],
};

const options = {
  responsive: true,
  plugins: {
    legend: {
      position: "top",
    },
  },
};

useEffect(() => {
   const verifyToken = async () =>{
    const token = localStorage.getItem('token');
    console.log(token)

    if(!token){
      navigate("/login", { replace: true });
      return;
    }
    try{
      const response =await fetch('http://localhost:8000/admin-dash',{
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
    
      if(!response.ok){
        throw new Error('Token invalid');
      }
    }catch(error){
      localStorage.removeItem('token');
      navigate('/');
    }
   };
   verifyToken();
   }, [navigate]);

  return(
         <>
         <div className="flex min-h-screen bg-gray-100">

               {/* Sidebar */}
            <Sidebar openBar={openBar} setOpenBar={setOpenBar}/>
                
         {/* Main */}
         <main className="flex-1 p-4 sm:p-6 space-y-6">
          {/*Header*/}
    <Header concept="Dashboard" setOpenBar={setOpenBar} openBar={openBar}/>
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Revenue" value="123.93DA" icon="+12.5%"></StatCard>
        <StatCard title="Active Users" value="24,543" icon="+18.2%"></StatCard>
        <StatCard title="AR Sessions" value="5,324" icon="-2.4%"></StatCard>
        <StatCard title="Bot Interactions" value="14,234" icon="+5.7%"></StatCard>
          </div>

       {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         {/* Chart Placeholder */}
         <Card className="lg:col-span-2 shadow rounded-2xl">
           <CardContent className="p-6">
              <h2 className="font-semibold mb-4">Platform Growth</h2>

      <div className="w-full h-[300px]">
        <Line data={data} options={options} />
        </div>


           </CardContent>
         </Card>

        {/*Activity*/}
        <Card className="shadow rounded-2xl">
          <CardContent className="p-6">
            <h2 className="font-semibold mb-4">Recent Activity</h2>
            <ul className="space-y-4">

              <li className="flex items-center gap-3">
                <FaUserCheck className="text-purple-500"/>
                <div>
                  <p className="text-sm font-medium">Developer account verified</p>
                  <span className="text-xs text-gray-400">
                    15 minutes ago
                  </span>
                </div>
              </li>
              
              <li className="flex items-center gap-3">
                <FaUserCheck className="text-purple-500"/>
                <div>
                  <p className="text-sm font-medium">New order processed</p>
                  <span className="text-xs text-gray-400">
                    30 minutes ago
                  </span>
                </div>
              </li>

              <li className="flex items-center gap-3">
                <FaUserCheck className="text-purple-500"/>
                <div>
                  <p className="text-sm font-medium">Developer account verified</p>
                  <span className="text-xs text-gray-400">
                    45 minutes ago
                  </span>
                </div>
              </li>

                   <li className="flex items-center gap-3">
                <FaUserCheck className="text-purple-500"/>
                <div>
                  <p className="text-sm font-medium">Developer account verified</p>
                  <span className="text-xs text-gray-400">
                    15 minutes ago
                  </span>
                </div>
              </li>

              
            </ul>
            <NavLink to="/admin-dash/audit-log">
                  <Button className="w-full mt-4">View Audit Log</Button>
            </NavLink>
        
          </CardContent>
        </Card>

        </div>

         </main>

         </div>
    </>
  )
}