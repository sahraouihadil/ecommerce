/**
 * LoginPage.jsx - User Login Page
 * ==================================
 * Shows a login form where users enter their username and password.
 *
 * FLOW:
 *   1. User fills in username + password and clicks "Login"
 *   2. Calls the login() function from auth.js -> POST /login
 *   3. On success: saves JWT token + role to localStorage
 *   4. Redirects to the correct dashboard based on user role:
 *      - admin -> /admin-dash
 *      - customer -> / (homepage)
 *      - accountant, marketing manager, etc. -> their own dashboards
 *   5. On error: shows error message
 *
 * NOTE: If user is already logged in, they get redirected to homepage.
 */

import React,{useEffect, useState} from 'react'
import { useNavigate,Link } from "react-router-dom";
import { login,isAuthenticated } from '../services/auth';

export function LoginPage() {
  // Form state: what the user types
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
  const data = await login(username, password);
  setLoading(false);

  if(data && data.access_token){
    localStorage.setItem('token', data.access_token);
    localStorage.setItem("role", data.role);

    // Redirect based on role
    if(data.role === "admin") navigate("/admin-dash");
    else if(data.role === "accountant") navigate("/accountant-dash");
    else if(data.role === "marketing manager") navigate("/marketing-manager-dash");
    else if(data.role === "stock manager") navigate("/stock-manager-dash");
    else if(data.role === "deliveryman") navigate("/deliveryman-dash");
    else navigate("/");
  } else {
    setError('Authentication failed!');
  }
 }catch(error){
   setLoading(false);
   setError(error?.response?.data?.detail || 'An error occurred. Please try again later.');
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
          <Link to="/register" className="ml-1 font-semibold underline">
            Signup
          </Link>
        </p>
      </div>
    </div>
  );
}