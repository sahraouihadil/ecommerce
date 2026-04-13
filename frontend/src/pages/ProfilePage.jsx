/**
 * ProfilePage.jsx - User Profile Page
 * ======================================
 * Displays the current user's profile information:
 *   - Username, email, phone number, role
 *
 * Fetches from GET /profile (requires valid JWT token).
 * If the token is invalid/expired, the user is redirected to /login.
 */

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export function ProfilePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get("/profile");
        setUser(response.data);
      } catch (error) {
        localStorage.removeItem("token");
        navigate("/login", { replace: true });
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [navigate]);

  if (loading) return <div className="text-center mt-10">Loading...</div>;

  return (
    <div className="max-w-md mx-auto mt-10 bg-white shadow-xl rounded-2xl p-8">
      <h1 className="text-3xl font-bold mb-6">Profile</h1>
      {user && (
        <div className="space-y-3">
          <p><span className="font-semibold">Username:</span> {user.username}</p>
          <p><span className="font-semibold">Email:</span> {user.email}</p>
          <p><span className="font-semibold">Phone:</span> {user.phoneNum || "Not set"}</p>
          <p><span className="font-semibold">Role:</span> {user.role}</p>
        </div>
      )}
    </div>
  );
}
