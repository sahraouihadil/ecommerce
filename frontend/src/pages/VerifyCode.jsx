import { useState } from "react";
import api from "../services/api";
import { useLocation, useNavigate } from "react-router-dom";

export function VerifyCode(){
  const [code,setCode] = useState("");
  const [message,setMessage] = useState("");

  const location = useLocation();
  const navigate = useNavigate();
//get the email from SignupPage
  const email = location.state?.email;

  const handleVerify = async () => {
    try{
      const res = await api.get("/verify-code", {
        params:{
          email,code,
        },
      });
      if(res.data.msg){
         setMessage(res.data.msg);
         console.log(res.data);
         navigate("/set-password",{
          state:{
            userName: res.data.user_name,
          },
         });
      }else{
        setMessage(res.data.error)
      }
      
    }catch(err) {
      setMessage("Server error")
    }
  };

  return(
    <div className="flex flex-col items-center gap-4 mt-10">
      <h1 className="text-3xl font-bold underline">Verify code</h1>

        {email && <p className="text-sm text-gray-500">{email}</p>}

      <input type="text" placeholder="Enter code" className="border p-2" onChange={(e)=> setCode(e.target.value)}/>

      <button onClick={handleVerify} className="bg-blue-500 text-white px-4 py-2">
        Verify
      </button>
      {message && <p>{message}</p>}
    </div>
  );
}