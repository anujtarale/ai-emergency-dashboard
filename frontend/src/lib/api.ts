const API_BASE_URL = import.meta.env.VITE_API_BASE_URL as string;
if (!API_BASE_URL) {
  throw new Error('[api.ts] VITE_API_BASE_URL is not defined. Check your .env file.');
}


class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    // Attach stored access token if available
    const token = typeof localStorage !== 'undefined' ? localStorage.getItem('accessToken') : null;

    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
      credentials: 'include',
    };

    try {
      const response = await fetch(url, config);

      const contentType = response.headers.get('content-type') || '';

      // If the response is not JSON, throw a meaningful error immediately
      if (!contentType.includes('application/json')) {
        throw new Error(`Server error: HTTP ${response.status} ${response.statusText} (non-JSON response from ${url})`);
      }

      let data: any;
      try {
        data = await response.json();
      } catch {
        throw new Error(`Invalid JSON response from server (${response.status} ${response.statusText})`);
      }

      if (!response.ok) {
        const errorMessage = data.message || data.error || `HTTP ${response.status}: ${response.statusText}`;
        const error = new Error(errorMessage);
        (error as any).status = response.status;
        (error as any).response = data;
        throw error;
      }

      return data;
    } catch (error: any) {
      throw error;
    }
  }

  async register(data: { name: string; email: string; password: string }) {
    return this.request<{ user: { _id: string; name: string; email: string; role: string; avatar?: string }; accessToken?: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async login(data: { email: string; password: string }) {
    return this.request<{ user: { _id: string; name: string; email: string; role: string; avatar?: string }; accessToken?: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async logout() {
    return this.request<{ success: boolean; message?: string }>('/auth/logout', {
      method: 'POST',
    });
  }

  async getMe() {
    return this.request<{ user: { _id: string; name: string; email: string; role: string; avatar?: string } }>('/auth/me');
  }

  async getNearbyServices(lat: number, lng: number, type?: string, maxDistance?: number) {
    let url = `/services/nearby?lat=${lat}&lng=${lng}`;
    if (type && type !== 'all') {
      url += `&type=${type}`;
    }
    if (maxDistance) {
      url += `&maxDistance=${maxDistance}`;
    }
    return this.request<{ success: boolean; count: number; data: EmergencyService[] }>(url);
  }

  async getContacts() {
    return this.request<{ success: boolean; data: any[] }>('/contacts');
  }

  async addContact(data: { name: string; phone: string; relation?: string; email?: string }) {
    return this.request<{ success: boolean; data: any }>('/contacts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateContact(id: string, data: { name: string; phone: string; relation?: string; email?: string }) {
    return this.request<{ success: boolean; data: any }>(`/contacts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteContact(id: string) {
    return this.request<{ success: boolean; message: string }>(`/contacts/${id}`, {
      method: 'DELETE',
    });
  }

  async createSOS(data: { latitude: number; longitude: number; address?: string; emergencyType?: string; description?: string }) {
    return this.request<{ success: boolean; data: any }>('/sos', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async createReport(data: { type: string; title: string; description: string; latitude: number; longitude: number; address?: string; severity?: string; images?: string[] }) {
    return this.request<{ success: boolean; data: EmergencyReport }>('/reports', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getAllReports() {
    return this.request<{ success: boolean; data: EmergencyReport[] }>('/reports');
  }

  async getNearbyReports(lat: number, lng: number, maxDistance?: number) {
    let url = `/reports/nearby?lat=${lat}&lng=${lng}`;
    if (maxDistance) {
      url += `&maxDistance=${maxDistance}`;
    }
    return this.request<{ success: boolean; count: number; data: EmergencyReport[] }>(url);
  }

  async getFeatures() {
    return this.request<{ success: boolean; data: any[] }>('/features');
  }

  async adminGetStats() {
    return this.request<{ success: boolean; data: any }>('/admin/stats');
  }

  async adminGetUsers() {
    return this.request<{ success: boolean; data: any[] }>('/admin/users');
  }

  async adminUpdateUserRole(userId: string, role: string) {
    return this.request<{ success: boolean; data: any }>('/admin/users/role', {
      method: 'PUT',
      body: JSON.stringify({ userId, role })
    });
  }

  async adminGetFeatures() {
    return this.request<{ success: boolean; data: any[] }>('/admin/features');
  }

  async adminToggleFeature(name: string, isEnabled: boolean) {
    return this.request<{ success: boolean; data: any }>(`/admin/features/${name}`, {
      method: 'PUT',
      body: JSON.stringify({ isEnabled })
    });
  }

  async adminGetSettings() {
    return this.request<{ success: boolean; data: any }>('/admin/settings');
  }

  async adminUpdateSettings(data: any) {
    return this.request<{ success: boolean; data: any }>('/admin/settings', {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  // Services Management
  async adminGetServices() {
    return this.request<{ success: boolean; data: EmergencyService[] }>('/services');
  }

  async adminCreateService(data: Omit<EmergencyService, '_id'>) {
    return this.request<{ success: boolean; data: EmergencyService }>('/services', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async adminUpdateService(id: string, data: Partial<EmergencyService>) {
    return this.request<{ success: boolean; data: EmergencyService }>(`/services/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async adminDeleteService(id: string) {
    return this.request<{ success: boolean; message: string }>(`/services/${id}`, {
      method: 'DELETE'
    });
  }

  // System Settings - Public
  async getSystemSettings() {
    return this.request<{ success: boolean; maintenanceMode: boolean }>('/settings/maintenance');
  }

  // Alerts - Public
  async getActiveAlerts() {
    return this.request<{ success: boolean; data: Alert[] }>('/alerts/active');
  }

  // Alerts Management
  async adminGetAlerts() {
    return this.request<{ success: boolean; data: Alert[] }>('/alerts');
  }

  async adminCreateAlert(data: any) {
    return this.request<{ success: boolean; data: Alert }>('/alerts', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async adminUpdateAlert(id: string, data: any) {
    return this.request<{ success: boolean; data: Alert }>(`/alerts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async adminDeleteAlert(id: string) {
    return this.request<{ success: boolean; message: string }>(`/alerts/${id}`, {
      method: 'DELETE'
    });
  }

  // SOS Monitoring
  async adminGetAllSOS() {
    return this.request<{ success: boolean; count: number; data: SOSRequest[] }>('/sos/admin/all');
  }

  async adminUpdateSOSStatus(id: string, status: string, responderId?: string) {
    return this.request<{ success: boolean; data: any }>(`/sos/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status, responderId })
    });
  }

  // Reports Verification
  async adminGetReports() {
    return this.request<{ success: boolean; data: EmergencyReport[] }>('/reports/all');
  }

  async adminUpdateReportStatus(id: string, status: string) {
    return this.request<{ success: boolean; data: any }>(`/reports/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    });
  }

  async adminGetActivityLogs(params?: { userId?: string; action?: string; limit?: number; skip?: number }) {
    let url = '/admin/activity-logs';
    const searchParams = new URLSearchParams();
    if (params?.userId) searchParams.append('userId', params.userId);
    if (params?.action) searchParams.append('action', params.action);
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.skip) searchParams.append('skip', params.skip.toString());
    const queryString = searchParams.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
    return this.request<{ success: boolean; data: any[] }>(url);
  }
}

export interface EmergencyService {
  _id: string;
  type: 'hospital' | 'police' | 'fire' | 'pharmacy' | 'shelter';
  name: string;
  address: string;
  phone: string;
  location: {
    type: 'Point';
    coordinates: [number, number]; // [lng, lat]
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface EmergencyReport {
  _id: string;
  userId?: string | any;
  type: string;
  title: string;
  description: string;
  location: {
    type: 'Point';
    coordinates: [number, number]; // [lng, lat]
  };
  address?: string;
  images?: string[];
  status: string;
  severity?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Alert {
  _id: string;
  type: string;
  title: string;
  description: string;
  location?: {
    type: 'Point';
    coordinates: [number, number];
  };
  severity: 'low' | 'medium' | 'high' | 'critical';
  active: boolean;
  expiresAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SOSRequest {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
  } | string | any;
  location: {
    type: 'Point';
    coordinates: [number, number];
  };
  address?: string;
  status: 'pending' | 'active' | 'resolved' | 'cancelled';
  emergencyType?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export const apiClient = new ApiClient(API_BASE_URL);
