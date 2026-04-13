/**
 * api.js -- Centralized API Client (Axios)
 *
 * PURPOSE:
 * This file creates and exports a pre-configured Axios instance that every
 * other file in the project uses to talk to the backend server.  By keeping
 * all HTTP configuration in one place we avoid repeating the base URL,
 * headers, and authentication logic in every component.
 *
 * HOW IT WORKS:
 * 1. We read the backend URL from an environment variable (VITE_API_URL).
 *    During development this usually points to http://127.0.0.1:8000 (FastAPI).
 * 2. We create an Axios "instance" with that base URL and default JSON headers.
 * 3. We register a request interceptor that automatically attaches the JWT
 *    token (if the user is logged in) to every outgoing request.
 *
 * CONNECTIONS:
 * - Used by services/auth.js for login / register calls.
 * - Used by virtually every page component (CartPage, OrderPage, etc.)
 *   whenever they need to fetch or send data to the backend.
 */

import axios from "axios";

// Read the backend URL from the Vite environment variable.
// If not set (e.g. local dev without a .env file), fall back to localhost:8000.
const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

// Create a reusable Axios instance.
// axios.create() lets us set default config (baseURL, headers) once
// so we don't have to repeat it in every API call.
const api = axios.create({
  baseURL: API_URL,             // All requests will be relative to this URL
  headers: {
    "Content-Type": "application/json",   // Tell the server we're sending JSON
  },
});

/**
 * Request Interceptor -- runs before EVERY request made with this instance.
 *
 * WHY: Most backend endpoints require authentication.  Instead of manually
 * adding the Authorization header in every component, we do it once here.
 *
 * HOW: We look for a JWT token stored in localStorage (saved at login time).
 * If it exists, we attach it as a Bearer token in the Authorization header.
 * The backend reads this header to identify the logged-in user.
 */
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");  // Retrieve saved JWT token
  if (token) {
    // Attach the token so the backend knows who is making the request.
    // "Bearer" is the standard prefix for JWT-based authentication.
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;  // Must return the config object for the request to proceed
});

export default api;
