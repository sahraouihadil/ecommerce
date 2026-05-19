/**
 * API Client — Axios instance with SecureStore token management
 *
 * Mobile equivalent of frontend/src/services/api.js
 * Uses expo-secure-store instead of localStorage for token storage
 */

import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Config } from '../constants/config';

const api = axios.create({
  baseURL: Config.API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request interceptor — attaches JWT from SecureStore
api.interceptors.request.use(async (config) => {
  try {
    const token = await SecureStore.getItemAsync('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (e) {
    // SecureStore might fail on some devices — continue without token
  }
  return config;
});

// Response interceptor — handle 401 globally
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid — clear stored credentials
      try {
        await SecureStore.deleteItemAsync('token');
        await SecureStore.deleteItemAsync('role');
      } catch (e) {
        // Ignore cleanup errors
      }
    }
    return Promise.reject(error);
  }
);

/**
 * Build full image URL from a relative path returned by the backend.
 * Backend serves static files at /static/... and uploads at /uploads/...
 */
export const getImageUrl = (path?: string | null): string | undefined => {
  if (!path) return undefined;
  if (path.startsWith('http')) return path;
  return `${Config.API_URL}/${path}`;
};

export default api;
