// Delivery domain types — derived from backend schema.py & routers/deliveryman.py

export interface DeliveryOrderItem {
  id: number;
  product_id: number;
  product_name: string;
  image: string | null;
  price: number;
  quantity: number;
  status: string;
}

export interface DeliveryOrder {
  id: string;          // "ORD-001" format
  id_raw: number;      // Numeric ID
  customer: string;
  address: string;
  eta: number;         // Minutes
  km: number;
  amount: number;
  status: string;
  date: string | null;
  rating: number | null;
  problem_reason: string | null;
  problem_notes: string | null;
  items: DeliveryOrderItem[];
}

export interface TodayStats {
  total: number;
  delivered: number;
  in_transit: number;
  pending: number;
}

export interface TodayOrdersResponse {
  stats: TodayStats;
  orders: DeliveryOrder[];
  date: string;
}

export interface HistoryStats {
  total: number;
  delivered: number;
  canceled: number;
  total_earned: number;
}

export interface HistoryResponse {
  stats: HistoryStats;
  orders: DeliveryOrder[];
}

export interface ScheduleDayData {
  dot: 'delivered' | 'problem' | 'pending';
  count: number;
  orders: DeliveryOrder[];
}

export interface ScheduleResponse {
  year: number;
  month: number;
  schedule: Record<string, ScheduleDayData>;
}

export interface DriverProfile {
  id: number;
  name: string;
  phone: string | null;
  vehicle: string | null;
  member_since: string | null;
  avg_rating: number | null;
  stats: {
    total_orders: number;
    delivered: number;
    issues: number;
    total_earned: number;
  };
}

export interface StatusUpdateResponse {
  message: string;
  order_id: number;
  status: string;
}

export interface ProblemReportRequest {
  reason: string;
  notes: string;
}

export const ALLOWED_PROBLEM_REASONS = [
  'Customer not reachable',
  'Wrong address',
  'Product damaged',
  'Traffic delay',
  'Other',
] as const;

export const STATUS_TRANSITIONS: Record<string, string[]> = {
  pending: ['processing'],
  processing: ['shipped'],
  shipped: ['delivered', 'canceled', 'problem', 'partial'],
  problem: ['delivered', 'canceled', 'partial'],
  delivered: [],
  canceled: [],
  partial: [],
};
