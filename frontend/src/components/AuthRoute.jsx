/**
 * AuthRoute.jsx - Protected Route Guard
 * ========================================
 * Wraps pages that require authentication. If the user is NOT logged in,
 * they get redirected to /login. If a specific role is required (e.g. "admin")
 * and the user doesn't have it, they get redirected to the homepage.
 *
 * USAGE IN App.jsx:
 *   <Route path="/admin-dash" element={
 *     <AuthRoute requiredRole="admin">
 *       <AdminDashboard />
 *     </AuthRoute>
 *   } />
 */

import { Navigate } from "react-router-dom";
import { isAuthenticated, getRole } from "../services/auth";

const AuthRoute = ({ children, requiredRole }) => {
  // Step 1: Check if user has a valid (non-expired) token
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  // Step 2: Check if user has the required role (e.g. "admin")
  const userRole = getRole();
  if (requiredRole && userRole !== requiredRole) {
    return <Navigate to="/" replace />;
  }
  // Step 3: User is authenticated and has the right role — show the page
  return children;
};

export default AuthRoute;
