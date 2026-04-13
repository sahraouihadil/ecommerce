/**
 * SignupPage.jsx - User Registration Page
 * ==========================================
 * Shows a registration form for new users.
 *
 * FLOW:
 *   1. User fills in: username, email, password, phone number
 *   2. Calls register() -> POST /register
 *   3. Backend sends a verification code to the user's email
 *   4. User is redirected to /verify-code to enter the code
 *   5. After verification -> /set-password to finalize the account
 *
 * The full signup flow is: SignupPage -> VerifyCode -> SetPassword -> LoginPage
 */

import { Link } from "react-router-dom";
import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { register } from '../services/auth';

export function SignupPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNum, setPhoneNum] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const validateForm = () => {
    if (!username || !password || !email) {
      setError('Username, email and password are required');
      return false;
    }
    setError('');
    return true;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateForm()) return;
    setLoading(true);

    try {
      const data = await register(username, password, email, phoneNum);
      setLoading(false);

      if (data.action === "verify") {
        navigate("/verify-code", { state: { email } });
        return;
      }

      if (data.access_token) {
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('role', data.role || 'customer');
        navigate('/');
      }
    } catch (error) {
      setLoading(false);
      setError(error?.response?.data?.detail || 'An error occurred. Please try again later.');
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
            onChange={(e) => setUsername(e.target.value)}
          />

          <input
            type="email"
            placeholder="Email"
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <input
            type="text"
            placeholder="Phone Number"
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
            value={phoneNum}
            onChange={(e) => setPhoneNum(e.target.value)}
          />
          <button
            type="submit"
            className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition"
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Create an account'}
          </button>
          {error && <p style={{ color: 'red' }}>{error}</p>}
        </form>

        <p className="text-center mt-4 text-sm">
          Already have an account?
          <Link to="/login" className="ml-1 font-semibold underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
