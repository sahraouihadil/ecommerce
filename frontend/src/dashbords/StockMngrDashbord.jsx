import { useEffect} from "react";
import { useNavigate } from "react-router-dom";

export function StockMngrDashboard(){
   const navigate = useNavigate();

useEffect(() => {
   const verifyToken = async () =>{
    const token = localStorage.getItem('token');
    console.log(token)

    if(!token){
      navigate("/login", { replace: true });
      return;
    }
    try{
      const response =await fetch('http://localhost:8000/stock-manager-dash',{
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
     console.log(response);
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
     <h1 class="text-3xl font-bold underline">
    Stock Manager Dashbord
  </h1>
    </>
  )
}