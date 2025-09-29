// Tipos para la API de TradeOptix Backend

export interface User {
  id: string;
  first_name: string;
  last_name: string;
  document_type: 'cedula' | 'pasaporte';
  document_number: string;
  email: string;
  phone_number: string;
  address: string;
  facebook_profile?: string;
  instagram_profile?: string;
  twitter_profile?: string;
  linkedin_profile?: string;
  role: 'user' | 'admin';
  kyc_status: 'pending' | 'approved' | 'rejected';
  email_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface KYCDocument {
  id: string;
  user_id: string;
  document_type: 'cedula_front' | 'cedula_back' | 'face_photo';
  file_path: string;
  original_name: string;
  file_size: number;
  mime_type: string;
  status: 'pending' | 'approved' | 'rejected';
  rejection_reason?: string;
  created_at: string;
  updated_at: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
  expires_at: string;
}

export interface ApiResponse<T = Record<string, unknown>> {
  success?: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface DashboardStats {
  total_users: number;
  pending_kyc: number;
  approved_kyc: number;
  rejected_kyc: number;
  new_users_today: number;
  new_users_this_week: number;
  new_users_this_month: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface MarketNews {
  id: string;
  title: string;
  content: string;
  summary?: string;
  image_url?: string;
  category: 'general' | 'markets' | 'crypto' | 'analysis' | 'regulation';
  priority: number;
  is_active: boolean;
  published_at: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  user_id?: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  category: 'general' | 'kyc' | 'market' | 'system';
  data?: string;
  is_read: boolean;
  is_push_sent: boolean;
  push_sent_at?: string;
  created_at: string;
  expires_at?: string;
}

export interface NewsStats {
  total_news: number;
  active_news: number;
  today_news: number;
  news_by_category: Record<string, number>;
}

export interface NotificationStats {
  total_notifications: number;
  unread_notifications: number;
  today_notifications: number;
  push_notifications_sent: number;
}

// Tipos para formularios
export interface LoginFormData {
  email: string;
  password: string;
}

export interface KYCReviewData {
  action: 'approve' | 'reject';
  reason?: string;
}