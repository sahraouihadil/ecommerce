/**
 * Delivery API service — all /api/deliveryman endpoints
 */

import api from './client';
import type {
  TodayOrdersResponse,
  HistoryResponse,
  ScheduleResponse,
  DriverProfile,
  StatusUpdateResponse,
  ProblemReportRequest,
  DeliveryOrder,
} from '../types/delivery.types';

export const deliveryApi = {
  getTodayOrders: async (): Promise<TodayOrdersResponse> => {
    const res = await api.get('/api/deliveryman/orders/today');
    return res.data;
  },

  getOrderHistory: async (dateFilter?: string): Promise<HistoryResponse> => {
    const params = dateFilter ? { date_filter: dateFilter } : {};
    const res = await api.get('/api/deliveryman/orders/history', { params });
    return res.data;
  },

  getOrder: async (orderId: number): Promise<DeliveryOrder> => {
    const res = await api.get(`/api/deliveryman/orders/${orderId}`);
    return res.data;
  },

  getSchedule: async (year: number, month: number): Promise<ScheduleResponse> => {
    const res = await api.get('/api/deliveryman/schedule', {
      params: { year, month },
    });
    return res.data;
  },

  getProfile: async (): Promise<DriverProfile> => {
    const res = await api.get('/api/deliveryman/profile');
    return res.data;
  },

  updateOrderStatus: async (orderId: number, status: string): Promise<StatusUpdateResponse> => {
    const res = await api.put(`/api/deliveryman/orders/${orderId}/status`, { status });
    return res.data;
  },

  cancelOrder: async (orderId: number): Promise<StatusUpdateResponse> => {
    const res = await api.put(`/api/deliveryman/orders/${orderId}/cancel`);
    return res.data;
  },

  updateItemStatus: async (orderId: number, itemId: number, status: string) => {
    const res = await api.put(
      `/api/deliveryman/orders/${orderId}/items/${itemId}/status`,
      { status }
    );
    return res.data;
  },

  reportProblem: async (orderId: number, data: ProblemReportRequest) => {
    const res = await api.post(`/api/deliveryman/orders/${orderId}/problem`, data);
    return res.data;
  },
};
