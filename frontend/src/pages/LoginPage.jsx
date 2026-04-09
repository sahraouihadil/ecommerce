import React,{useEffect, useState} from 'react'
import { useNavigate,Link } from "react-router-dom";
import { login,isAuthenticated } from '../services/auth';

export function LoginPage() {
const [username,setUsername] = useState('');
const [password,setPassword] = useState('');
const [error,setError] = useState('');
const [loading,setLoading] = useState(false);

const navigate = useNavigate();

const validateForm = () => {
  if (!username || !password){
    setError('Username and password are required');
    return false;
  }
  setError('');
  return true;
};

// If user ias already logged in,redirect to home
useEffect(()=>{
  if(isAuthenticated()){
    navigate("/");
  }
},[navigate]);

const handleSubmit = async (event) => {
  event.preventDefault();
  if(!validateForm()) return;
  setLoading(true);

 try{
  const response = await login(username, password);
  console.log(username,password);
  console.log(response);
  setLoading(false);
//Store token and role 
  if(response){
    const data = await response;
    localStorage.setItem('token',data.access_token);
    console.log(data.access_token);
    localStorage.setItem("role", data.role);
    console.log(data.role);
    navigate('/');

    //redirect based on role
if(response.role === "admin") navigate("/admin-dash");
else if(response.role === "developer") navigate("/developer-dash")
else if (response.role === "marketing-manager") navigate("/marketing-manager-dash");
else if (response.role === "stock-manager") navigate("/stock-manager-dash");
else if (response.role === "deliveryman") navigate ("/deliveryman-dash")
else navigate ("/")
 
  }else{
    const errorData = await response.json();
    setError(errorData.detail || 'Authentication failed!');
  }
 }catch(error){
   setLoading(false);
   setError('An error occurred. Please try again later.')
 }
};

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6">Login</h2>

        <form className="space-y-4" onSubmit={handleSubmit}>


          <input
            type="text"
            placeholder="Full Name"
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
            value={username}
            onChange={(e)=> setUsername(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
             value={password}
            onChange={(e)=> setPassword(e.target.value)}
          />


          <button
            type="submit"
            className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition"
            disabled={loading}
          >
            {loading ? 'Loading in...' : 'Login'}
          </button>
          {error && <p style={{ color: 'red'}}>{error}</p>}
        </form>

        <p className="text-center mt-4 text-sm">
         don't have an account?
          <Link to="/auth/signup" className="ml-1 font-semibold underline">
            Signup
          </Link>
        </p>
      </div>
    </div>
  );
}