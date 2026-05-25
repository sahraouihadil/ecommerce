/**
 * Auth API service — handles login, register, token verification
 *
 * Mobile equivalent of frontend/src/services/auth.js
 * Uses SecureStore instead of localStorage
 */

import * as SecureStore from 'expo-secure-store';
import { jwtDecode } from 'jwt-decode';
import api from './client';
import type {
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  MeResponse,
  UserRole,
} from '../types/auth.types';

export const authApi = {
  /**
   * Login — sends form-urlencoded to POST /login (OAuth2 format)
   */
  login: async (username: string, password: string): Promise<LoginResponse> => {
    const params = new URLSearchParams();
    params.append('username', username);
    params.append('password', password);

    const response = await api.post<LoginResponse>('/login', params, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    return response.data;
  },

  /**
   * Register — POST /register (JSON body)
   */
  register: async (data: RegisterRequest): Promise<RegisterResponse> => {
    const response = await api.post<RegisterResponse>('/register', data);
    return response.data;
  },

  /**
   * Verify email code — POST /verify-code
   */
  verifyCode: async (email: string, code: string) => {
    const response = await api.post('/verify-code', { email, code });
    return response.data;
  },

  /**
   * Set password after verification — POST /set-password
   */
  setPassword: async (userName: string, password: string) => {
    const response = await api.post('/set-password', {
      user_name: userName,
      password,
    });
    return response.data;
  },

  /**
   * Forgot password — POST /forgot-password
   */
  forgotPassword: async (username: string, email: string) => {
    const response = await api.post('/forgot-password', { username, email });
    return response.data;
  },

  /**
   * Verify reset code — POST /verify-reset-code
   */
  verifyResetCode: async (email: string, code: string) => {
    const response = await api.post('/verify-reset-code', { email, code });
    return response.data;
  },

  /**
   * Reset password — POST /reset-password
   */
  resetPassword: async (email: string, code: string, newPassword: string) => {
    const response = await api.post('/reset-password', {
      email,
      code,
      new_password: newPassword,
    });
    return response.data;
  },

  /**
   * Verify current token — GET /me
   */
  verifyToken: async (): Promise<MeResponse> => {
    const response = await api.get<MeResponse>('/me');
    return response.data;
  },

  // ── SecureStore helpers ──

  saveToken: async (token: string) => {
    await SecureStore.setItemAsync('token', token);
  },

  saveRole: async (role: string) => {
    await SecureStore.setItemAsync('role', role);
  },

  getToken: async (): Promise<string | null> => {
    return await SecureStore.getItemAsync('token');
  },

  getRole: async (): Promise<UserRole | null> => {
    const role = await SecureStore.getItemAsync('role');
    return role as UserRole | null;
  },

  logout: async () => {
    await SecureStore.deleteItemAsync('token');
    await SecureStore.deleteItemAsync('role');
  },

  isAuthenticated: async (): Promise<boolean> => {
    const token = await SecureStore.getItemAsync('token');
    if (!token) return false;
    try {
      const decoded = jwtDecode<{ exp: number }>(token);
      if (decoded.exp * 1000 < Date.now()) {
        await SecureStore.deleteItemAsync('token');
        await SecureStore.deleteItemAsync('role');
        return false;
      }
      return true;
    } catch {
      await SecureStore.deleteItemAsync('token');
      await SecureStore.deleteItemAsync('role');
      return false;
    }
  },
};
