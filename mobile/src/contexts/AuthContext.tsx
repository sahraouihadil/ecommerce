/**
 * AuthContext — Global authentication state with SecureStore persistence
 *
 * Mobile equivalent of frontend/src/components/AuthProvider.jsx
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../api/auth';
import type { UserRole } from '../types/auth.types';

interface AuthContextType {
  token: string | null;
  role: UserRole | null;
  username: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<{ role: UserRole }>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check stored credentials on mount
  const refreshAuth = useCallback(async () => {
    try {
      const storedToken = await authApi.getToken();
      if (!storedToken) {
        setToken(null);
        setRole(null);
        setUsername(null);
        setIsLoading(false);
        return;
      }

      // Verify token is still valid with the backend
      const isValid = await authApi.isAuthenticated();
      if (!isValid) {
        setToken(null);
        setRole(null);
        setUsername(null);
        setIsLoading(false);
        return;
      }

      // Get role from /me endpoint
      try {
        const me = await authApi.verifyToken();
        setToken(storedToken);
        setRole(me.role);
        setUsername(me.sub);
        await authApi.saveRole(me.role);
      } catch {
        // Token invalid on backend side
        await authApi.logout();
        setToken(null);
        setRole(null);
        setUsername(null);
      }
    } catch {
      setToken(null);
      setRole(null);
      setUsername(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshAuth();
  }, [refreshAuth]);

  const login = useCallback(async (user: string, pass: string) => {
    const data = await authApi.login(user, pass);
    await authApi.saveToken(data.access_token);
    await authApi.saveRole(data.role);
    setToken(data.access_token);
    setRole(data.role);
    setUsername(user);
    return { role: data.role };
  }, []);

  const logout = useCallback(async () => {
    await authApi.logout();
    setToken(null);
    setRole(null);
    setUsername(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        token,
        role,
        username,
        isLoading,
        isAuthenticated: !!token,
        login,
        logout,
        refreshAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
