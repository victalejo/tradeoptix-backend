import axios, { AxiosResponse } from 'axios'
import { 
  User, 
  LoginRequest, 
  LoginResponse, 
  KYCDocument, 
  DashboardStats, 
  PaginatedResponse 
} from '@/types/api'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

// Crear instancia de axios
const api = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptor para agregar token de autorización
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  }
  return config
})

// Interceptor para manejar respuestas
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado o inválido
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token')
        localStorage.removeItem('user_data')
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

// Servicios de autenticación
export const authService = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response: AxiosResponse<LoginResponse> = await api.post('/users/login', credentials)
    return response.data
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user_data')
    }
  },

  getCurrentUser: async (): Promise<User> => {
    const response: AxiosResponse<User> = await api.get('/users/profile')
    return response.data
  },

  isAuthenticated: (): boolean => {
    if (typeof window !== 'undefined') {
      return !!localStorage.getItem('auth_token')
    }
    return false
  },

  getToken: (): string | null => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token')
    }
    return null
  },

  setToken: (token: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token)
    }
  },

  setUserData: (user: User) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('user_data', JSON.stringify(user))
    }
  },

  getUserData: (): User | null => {
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem('user_data')
      return userData ? JSON.parse(userData) : null
    }
    return null
  }
}

// Servicios de usuarios
export const userService = {
  getUsers: async (page: number = 1, limit: number = 10): Promise<PaginatedResponse<User>> => {
    const response: AxiosResponse<PaginatedResponse<User>> = await api.get(`/admin/users?page=${page}&limit=${limit}`)
    return response.data
  },

  getUserById: async (id: string): Promise<User> => {
    const response: AxiosResponse<User> = await api.get(`/admin/users/${id}`)
    return response.data
  },

  updateUserKYCStatus: async (userId: string, status: 'approved' | 'rejected', reason?: string): Promise<void> => {
    await api.put(`/admin/users/${userId}/kyc`, { status, reason })
  }
}

// Servicios de KYC
export const kycService = {
  getUserDocuments: async (userId: string): Promise<KYCDocument[]> => {
    const response: AxiosResponse<KYCDocument[]> = await api.get(`/admin/kyc/users/${userId}/documents`)
    return response.data
  },

  getAllPendingDocuments: async (): Promise<KYCDocument[]> => {
    const response: AxiosResponse<{ data: KYCDocument[] }> = await api.get('/admin/kyc/pending')
    return response.data.data || []
  },

  approveDocument: async (documentId: string): Promise<void> => {
    await api.put(`/admin/kyc/${documentId}/approve`)
  },

  rejectDocument: async (documentId: string, reason: string): Promise<void> => {
    await api.put(`/admin/kyc/${documentId}/reject`, { reason })
  },

  downloadDocument: async (documentId: string): Promise<Blob> => {
    const response: AxiosResponse<Blob> = await api.get(`/admin/kyc/documents/${documentId}/preview`, {
      responseType: 'blob'
    })
    return response.data
  },

  getDocumentPreviewUrl: (documentId: string): string => {
    const token = localStorage.getItem('auth_token')
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'
    return `${baseUrl}/api/v1/admin/kyc/documents/${documentId}/preview?token=${token}`
  }
}

// Servicios del dashboard
export const dashboardService = {
  getStats: async (): Promise<DashboardStats> => {
    const response: AxiosResponse<DashboardStats> = await api.get('/admin/dashboard/stats')
    return response.data
  },

  getRecentActivity: async (): Promise<Array<Record<string, unknown>>> => {
    const response: AxiosResponse<Array<Record<string, unknown>>> = await api.get('/admin/dashboard/activity')
    return response.data
  }
}

// Servicio de salud
export const healthService = {
  check: async (): Promise<{ status: string; message: string }> => {
    const response = await axios.get(`${API_BASE_URL}/health`)
    return response.data
  }
}

export default api