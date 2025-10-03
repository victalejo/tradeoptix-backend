import { 
  User, 
  LoginRequest, 
  LoginResponse, 
  RegisterRequest, 
  KYCDocument, 
  MarketNews,
  Notification,
  ApiResponse 
} from '../types';

// Configuración de la URL del API
// Para desarrollo local en emulador Android: 'http://10.0.2.2:8080/api/v1'
// Para desarrollo local en emulador iOS: 'http://localhost:8080/api/v1'  
// Para dispositivo físico: 'http://TU_IP_LOCAL:8080/api/v1' (ej: http://192.168.1.100:8080/api/v1)
// Para producción: 'https://api.tradeoptix.app/api/v1'

const DEV_MODE = true; // Cambiar a false para producción
const LOCAL_IP = '10.0.2.2'; // Para Android Emulator. Cambiar según tu configuración

const API_BASE_URL = DEV_MODE 
  ? `http://${LOCAL_IP}:8080/api/v1`  // Desarrollo
  : 'https://api.tradeoptix.app/api/v1';  // Producción

console.log('🌐 API Base URL:', API_BASE_URL);

class ApiService {
  private baseURL: string;

  constructor() {
    this.baseURL = API_BASE_URL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers: defaultHeaders,
      });

      // Verificar si la respuesta es JSON válido
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const textResponse = await response.text();
        throw new Error(`Server returned non-JSON response: ${textResponse.substring(0, 100)}...`);
      }

      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        const textResponse = await response.text();
        throw new Error(`JSON Parse error. Server response: ${textResponse.substring(0, 100)}...`);
      }

      // Manejar respuestas null o undefined
      if (data === null || data === undefined) {
        data = {};
      }

      if (!response.ok) {
        throw new Error(data.error || data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API Request failed:', error);
      throw error;
    }
  }

  private async authenticatedRequest<T>(
    endpoint: string,
    token: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${token}`,
      },
    });
  }

  // Auth endpoints
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await this.request<LoginResponse>('/users/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    return response as LoginResponse;
  }

  async register(userData: RegisterRequest): Promise<ApiResponse<User>> {
    return this.request<User>('/users/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  // User endpoints
  async getProfile(token: string): Promise<User> {
    const response = await this.authenticatedRequest<User>('/users/profile', token, {
      method: 'GET',
    });
    return response as User;
  }

  // KYC endpoints
  async uploadKYCDocument(
    token: string,
    documentType: string,
    imageUri: string,
    fileName: string
  ): Promise<ApiResponse<KYCDocument>> {
    const formData = new FormData();
    formData.append('document_type', documentType);
    formData.append('file', {
      uri: imageUri,
      type: 'image/jpeg',
      name: fileName,
    } as any);

    const response = await fetch(`${this.baseURL}/kyc/upload`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `HTTP error! status: ${response.status}`);
    }

    return data;
  }

  async getKYCDocuments(token: string): Promise<KYCDocument[]> {
    const response = await this.authenticatedRequest<KYCDocument[]>('/kyc/documents', token, {
      method: 'GET',
    });
    // Asegurar que siempre devolvamos un array
    const data = response as any;
    if (data && Array.isArray(data)) {
      return data;
    } else if (data && data.data && Array.isArray(data.data)) {
      return data.data;
    }
    return [];
  }

  async downloadKYCDocument(token: string, documentId: string): Promise<Blob> {
    const response = await fetch(`${this.baseURL}/kyc/documents/${documentId}/download`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.blob();
  }

  // News methods
  async getLatestNews(token: string, limit: number = 5): Promise<MarketNews[]> {
    const response = await this.request<MarketNews[]>(`/news/latest?limit=${limit}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data || [];
  }

  async getNewsById(token: string, newsId: string): Promise<MarketNews> {
    const response = await this.request<MarketNews>(`/news/${newsId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.data) {
      throw new Error('Noticia no encontrada');
    }
    return response.data;
  }

  // Notification methods
  async getUserNotifications(
    token: string, 
    page: number = 1, 
    limit: number = 20,
    unreadOnly: boolean = false
  ): Promise<{ data: Notification[]; total: number; page: number; total_pages: number }> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      unread_only: unreadOnly.toString(),
    });
    
    const url = `/notifications/?${params.toString()}`;
    console.log('🌐 API Call: GET', `${this.baseURL}${url}`);
    console.log('🔑 Token presente:', token ? 'Sí' : 'No');
    
    const response = await this.request<{
      data: Notification[];
      total: number;
      page: number;
      total_pages: number;
    }>(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    
    console.log('📥 API Response:', response);
    
    return response.data || { data: [], total: 0, page: 1, total_pages: 0 };
  }

  async getUnreadNotificationCount(token: string): Promise<number> {
    const response = await this.request<{ unread_count: number }>('/notifications/unread-count', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data?.unread_count || 0;
  }

  async markNotificationAsRead(token: string, notificationId: string): Promise<void> {
    await this.request(`/notifications/${notificationId}/read`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  async markAllNotificationsAsRead(token: string): Promise<void> {
    await this.request('/notifications/mark-all-read', {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  async deleteNotification(token: string, notificationId: string): Promise<void> {
    await this.request(`/notifications/${notificationId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  // Health check
  async healthCheck(): Promise<{ status: string; message: string }> {
    const response = await fetch(`${this.baseURL.replace('/api/v1', '')}/health`);
    return response.json();
  }
}

export default new ApiService();