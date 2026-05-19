/**
 * Customer API service — products, cart, orders, favorites, profile
 */

import api, { getImageUrl } from './client';
import type { Product, CartItem, Order, FavoriteItem, ProfileData, SearchResult, OrderCreateRequest, Review, ReviewCreate } from '../types/customer.types';

export const customerApi = {
  // ── Products ──
  getProducts: async (): Promise<Product[]> => {
    const res = await api.get('/api/products');
    return res.data;
  },

  getProduct: async (id: number): Promise<Product> => {
    const res = await api.get(`/api/products/${id}`);
    return res.data;
  },

  searchProducts: async (keyword: string): Promise<SearchResult[]> => {
    const res = await api.get('/search', { params: { keyword } });
    return res.data;
  },

  // ── Cart ──
  getCart: async (): Promise<CartItem[]> => {
    const res = await api.get('/api/cart');
    return res.data;
  },

  addToCart: async (productId: number, quantity: number = 1) => {
    const res = await api.post('/api/cart', { product_id: productId, quantity });
    return res.data;
  },

  updateCartItem: async (itemId: number, quantity: number) => {
    const res = await api.put(`/api/cart/${itemId}`, { quantity });
    return res.data;
  },

  removeFromCart: async (itemId: number) => {
    const res = await api.delete(`/api/cart/${itemId}`);
    return res.data;
  },

  // ── Orders ──
  createOrder: async (data: OrderCreateRequest) => {
    const res = await api.post('/api/orders', data);
    return res.data;
  },

  getOrders: async (): Promise<Order[]> => {
    const res = await api.get('/api/orders');
    return res.data;
  },

  getOrder: async (orderId: number): Promise<Order> => {
    const res = await api.get(`/api/orders/${orderId}`);
    return res.data;
  },

  // ── Favorites ──
  getFavorites: async (): Promise<FavoriteItem[]> => {
    const res = await api.get('/api/favorites');
    return res.data;
  },

  addFavorite: async (productId: number) => {
    const res = await api.post('/api/favorites', { product_id: productId });
    return res.data;
  },

  removeFavorite: async (favoriteId: number) => {
    const res = await api.delete(`/api/favorites/${favoriteId}`);
    return res.data;
  },

  // ── Profile ──
  getProfile: async (): Promise<ProfileData> => {
    const res = await api.get('/api/profile');
    return res.data;
  },

  updateProfile: async (data: FormData) => {
    const res = await api.put('/api/profile', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  // ── Reviews ──
  getProductReviews: async (productId: number): Promise<Review[]> => {
    const res = await api.get(`/api/reviews/${productId}`);
    return res.data;
  },

  createReview: async (productId: number, data: ReviewCreate) => {
    const res = await api.post(`/api/reviews/${productId}`, data);
    return res.data;
  },
};

export { getImageUrl };
