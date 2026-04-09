import { useEffect} from "react";
import { useNavigate } from "react-router-dom";

export function HistoryPage(){
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
      const response =await fetch('http://localhost:8000/profile/history',{
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
return (
   <div>This is a history page, Only visibole to authenticted users.</div>
  );
}