// Auth types — derived from backend schema.py

export interface LoginResponse {
  access_token: string;
  token_type: string;
  role: UserRole;
}

export interface RegisterRequest {
  username: string;
  password: string;
  email: string;
  phone_num: string;
}

export interface RegisterResponse {
  action: string;
  message: string;
  redirect_url: string;
  user_name: string;
  email: string;
}

export interface MeResponse {
  sub: string;
  role: UserRole;
}

export interface VerifyCodeRequest {
  email: string;
  code: string;
}

export interface SetPasswordRequest {
  user_name: string;
  password: string;
}

export interface ForgotPasswordRequest {
  username: string;
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  code: string;
  new_password: string;
}

export type UserRole =
  | 'admin'
  | 'accountant'
  | 'marketing_manager'
  | 'stock_manager'
  | 'deliveryman'
  | 'customer'
  | 'bot';

export interface AuthState {
  token: string | null;
  role: UserRole | null;
  username: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}
