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

export interface RegisterRequest {
  first_name: string;
  last_name: string;
  document_type: 'cedula' | 'pasaporte';
  document_number: string;
  email: string;
  phone_number: string;
  address: string;
  password: string;
  facebook_profile?: string;
  instagram_profile?: string;
  twitter_profile?: string;
  linkedin_profile?: string;
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

export interface ApiResponse<T = any> {
  message?: string;
  data?: T;
  error?: string;
  details?: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
}

export type RootStackParamList = {
  Splash: undefined;
  Auth: undefined;
  Main: undefined;
};

export type AuthStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Profile: undefined;
  KYC: undefined;
  Investments: undefined;
};

export type KYCStackParamList = {
  KYCStatus: undefined;
  UploadDocument: {
    documentType: 'cedula_front' | 'cedula_back' | 'face_photo';
  };
  DocumentCamera: {
    documentType: 'cedula_front' | 'cedula_back' | 'face_photo';
  };
};