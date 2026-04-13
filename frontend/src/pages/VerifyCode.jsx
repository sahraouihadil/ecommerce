/**
 * VerifyCode.jsx - Email Verification Page
 * ===========================================
 * Part of the signup flow. After registration, the user receives a
 * 6-digit code by email. They enter it here to verify their email address.
 *
 * FLOW:
 *   SignupPage -> (email sent) -> VerifyCode -> SetPassword -> LoginPage
 *
 * API: GET /verify-code?email=...&code=...
 * On success: redirects to /set-password with the userName
 * If no email in state: redirects back to /register
 */

import { useState } from "react";
import api from "../services/api";
import { useLocation, useNavigate, Navigate } from "react-router-dom";

export function VerifyCode(){
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");

  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email;

  if (!email) {
    return <Navigate to="/register" replace />;
  }

  const handleVerify = async () => {
    try {
      const res = await api.get("/verify-code", {
        params: { email, code },
      });
      if (res.data.msg) {
        setMessage(res.data.msg);
        navigate("/set-password", {
          state: { userName: res.data.user_name },
        });
      }
    } catch (err) {
      setMessage(err?.response?.data?.detail || "Server error");
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 mt-10">
      <h1 className="text-3xl font-bold underline">Verify code</h1>

      <p className="text-sm text-gray-500">{email}</p>

      <input type="text" placeholder="Enter code" className="border p-2" onChange={(e) => setCode(e.target.value)} />

      <button onClick={handleVerify} className="bg-blue-500 text-white px-4 py-2">
        Verify
      </button>
      {message && <p>{message}</p>}
    </div>
  );
}