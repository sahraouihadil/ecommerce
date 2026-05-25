// Customer domain types — derived from backend schema.py & routers

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  discount_price?: number;
  on_sale?: boolean;
  new_arrival?: boolean;
  quantity: number;
  category: string;
  badge?: string;
  sku?: string;
  able_3d?: boolean;
  able_ar?: boolean;
  is_active?: boolean;
  images: ProductImage[];
  colors: ProductColor[];
  created_at?: string;
}

export interface ProductImage {
  id: number;
  image_url: string;
  order: number;
}

export interface ProductColor {
  id: number;
  color: string;
}

export interface CartItem {
  id: number;
  user_id: number;
  product_id: number;
  quantity: number;
  custom_order?: string;
  product?: Product;
}

export interface Order {
  id: number;
  orderdate: string | null;
  deliverydate: string | null;
  deliverydates: string[];
  delivery_type: string;
  totalamount: number;
  status: string;
  items: OrderItem[];
}

export interface OrderItem {
  id: number;
  product_id: number;
  price: number;
  quantity: number;
  product_name?: string;
  status?: string;
}

export interface OrderCreateRequest {
  fullName: string;
  phone: string;
  wilaya: string;
  city: string;
  streetAddress: string;
  notes?: string;
  paymentMethod: string;
  delivery_type: string;
  deliverydate: string | string[];
}

export interface FavoriteItem {
  id: number;
  product_id: number;
  product?: Product;
  name?: string;
  price?: number;
  image?: string;
}

export interface ProfileData {
  username: string;
  email: string;
  phone: string;
  role: string;
  avatar_url?: string;
  orders: Order[];
  favorites: FavoriteItem[];
  stats: {
    points: number;
    progress_pct: number;
    tier: { name: string; color: string };
    next_tier?: { name: string; color: string; min: number };
  };
}

export interface ReviewCreate {
  rating: number;
  comment: string;
}

export interface Review {
  id: number;
  product_id: number;
  user_name: string;
  rating: number;
  comment: string;
  created_at: string;
}

export interface SearchResult {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  badge?: string;
  image_url?: string;
}
