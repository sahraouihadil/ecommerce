import { useState } from "react";
import { useLocation,useNavigate } from "react-router-dom";
import api from "../services/api";

export function SetPassword(){
  const [password, setPassword] = useState("");
  const [message,setMessage] = useState("");

  const location = useLocation();
  const navigate = useNavigate();

  const userName = location.state?.userName;
  const handleSetPassword = async () => {
    try{
      const res = await api.post("/set-password",{
        user_name: userName,
        password: password,
      });

      if (res.data.msg){
        setMessage(res.data.msg);

        setTimeout(()=>{
          navigate("/login");
        },1500);
      }else{
        setMessage(res.data.error);
      }
    } catch(err){
       setMessage("Server Error");
    }

    if(!userName){
      return(
        <p className="text-red-500 text-center mt-10">
          No user found. Please register again.
        </p>
      )
    }
  }
  return(
       <div className="flex flex-col items-center gap-4 mt-10">
      <h1 className="text-3xl font-bold underline">
        Set Your Password
      </h1>

      <input
        type="password"
        placeholder="Enter new password"
        className="border p-2"
        onChange={(e) => setPassword(e.target.value)}
      />

      <button
        onClick={handleSetPassword}
        className="bg-green-500 text-white px-4 py-2"
      >
        Save Password
      </button>

      {message && <p>{message}</p>}
    </div>
  )
}