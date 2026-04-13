/**
 * auth.js - Authentication Helper Functions
 * ==========================================
 * Handles everything related to user login, registration, and session management.
 *
 * HOW AUTH WORKS IN THIS APP:
 *   1. User logs in  -> backend returns a JWT token
 *   2. Token is saved in localStorage
 *   3. Every API call sends the token (see api.js interceptor)
 *   4. When token expires -> user is logged out automatically
 *
 * FUNCTIONS:
 *   login()           - Send credentials to backend, get token back
 *   register()        - Create a new account
 *   logout()          - Remove token from localStorage
 *   getToken()        - Read the saved token
 *   getRole()         - Read the saved user role
 *   isAuthenticated() - Check if user is logged in (token exists + not expired)
 */

import api from "./api"
import { jwtDecode } from "jwt-decode";


// Send username + password to the backend login endpoint
export const login = async (username,password) => {
  const params = new URLSearchParams();
  params.append("username",username);
  params.append("password", password);

  const response = await api.post("/login",params,{  
     headers: {
       "Content-Type":"application/x-www-form-urlencoded",
     },
   });
  return response.data;
};

// Register a new user account (sends data as JSON)
export const register = async (username, password, email, phoneNum) => {
  const response = await api.post("/register", { username, password, email, phoneNum });
  return response.data;
};

// Clear all auth data from the browser (effectively logs out)
export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
};

// Quick helpers to read saved auth data
export const getToken =() => localStorage.getItem("token");
export const getRole = () => localStorage.getItem("role");

// Check if user is currently logged in:
// 1. Token must exist in localStorage
// 2. Token must not be expired (JWT contains an "exp" timestamp)
export const isAuthenticated = () => {
  const token = getToken();
  if (!token) return false;

  try{
    const decoded = jwtDecode(token);
    if (decoded.exp * 1000 < Date.now()){
      logout();
      return false;
    }
    return true;
  }catch (error) {
    logout();
    return false;
  }
};