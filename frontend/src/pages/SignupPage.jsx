import { Link } from "react-router-dom";
import React,{useState} from 'react'
import { useNavigate} from "react-router-dom";

export function SignupPage() {
  const [username,setUsername] = useState('');
  const [password,setPassword] = useState('');
  const [email,setEmail] = useState('');
  const [phoneNum,setPhoneNum] = useState('');
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
  
  const handleSubmit = async (event) => {
    event.preventDefault();
    if(!validateForm()) return;
    setLoading(true);
  
  
   try{
     const bodyData = {
      username,
      password,
      email,
      phoneNum
        };
    const response = await fetch('http://localhost:8000/register',{
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bodyData),
    });
    setLoading(false);
  
    if(response.ok){
      const data = await response.json();
      localStorage.setItem('token',data.access_token);
      navigate('/');
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
        <h2 className="text-2xl font-bold text-center mb-6">Sign Up</h2>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Full Name"
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
            value={username}
            onChange={(e)=> setUsername(e.target.value)}
          />

          <input
            type="email"
            placeholder="Email"
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
            value={email}
            onChange={(e)=> setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
            value={password}
            onChange={(e)=> setPassword(e.target.value)}
          />

             <input
            type="text"
            placeholder="Phone Number"
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
            value={phoneNum}
            onChange={(e)=> setPhoneNum(e.target.value)}
          />
          <button
            type="submit"
            className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition"
            disabled={loading}
          >
           {loading ? 'Loading in...' : 'Create an account'}
          </button>
           {error && <p style={{ color: 'red'}}>{error}</p>}
        </form>

        <p className="text-center mt-4 text-sm">
          you have an account?
          <Link to="/auth/login" className="ml-1 font-semibold underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}