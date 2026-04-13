/**
 * SetPassword.jsx - Set Password Page
 * ======================================
 * Final step of the signup flow. After email verification, the user
 * sets their password here.
 *
 * FLOW:
 *   SignupPage -> VerifyCode -> SetPassword -> LoginPage
 *
 * FEATURES:
 *   - Two password fields (password + confirm) to avoid typos
 *   - Password is validated on the backend (strength requirements)
 *   - On success: redirects to /login after 1.5 seconds
 *
 * API: POST /set-password { user_name, password }
 */

import { useState } from "react";
import { useLocation, useNavigate, Navigate } from "react-router-dom";
import api from "../services/api";

export function SetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");

  const location = useLocation();
  const navigate = useNavigate();

  const userName = location.state?.userName;

  if (!userName) {
    return (
      <p className="text-red-500 text-center mt-10">
        No user found. Please <a href="/register" className="underline">register again</a>.
      </p>
    );
  }

  const handleSetPassword = async () => {
    if (password !== confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }
    try {
      const res = await api.post("/set-password", {
        user_name: userName,
        password: password,
      });

      if (res.data.msg) {
        setMessage(res.data.msg);
        setTimeout(() => {
          navigate("/login");
        }, 1500);
      }
    } catch (err) {
      setMessage(err?.response?.data?.detail || "Server Error");
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 mt-10">
      <h1 className="text-3xl font-bold underline">Set Your Password</h1>

      <input
        type="password"
        placeholder="Enter new password"
        className="border p-2"
        onChange={(e) => setPassword(e.target.value)}
      />

      <input
        type="password"
        placeholder="Confirm password"
        className="border p-2"
        onChange={(e) => setConfirmPassword(e.target.value)}
      />

      <button
        onClick={handleSetPassword}
        className="bg-green-500 text-white px-4 py-2"
      >
        Save Password
      </button>

      {message && <p>{message}</p>}
    </div>
  );
}
