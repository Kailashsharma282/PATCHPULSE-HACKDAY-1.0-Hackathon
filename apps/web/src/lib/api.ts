const BASE_URL = '/api';

export interface ApiClientResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  code?: string;
  details?: any;
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiClientResponse<T>> {
  const token = localStorage.getItem('patchpulse_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || `Request failed with status ${res.status}`);
    }
    return data;
  } catch (err: any) {
    return {
      success: false,
      message: err.message || 'Network error occurred',
    };
  }
}

export const api = {
  // Auth
  login: (credentials: { email: string; password: string }) =>
    request<{ accessToken: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),

  register: (data: { name: string; email: string; password: string; role?: string }) =>
    request<{ accessToken: string; user: any }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getMe: () => request<any>('/auth/me'),

  // Reports
  createReport: (reportData: {
    description: string;
    category?: string;
    latitude?: number;
    longitude?: number;
    locationName?: string;
    mediaUrl?: string;
    voiceUrl?: string;
  }) =>
    request<any>('/reports', {
      method: 'POST',
      body: JSON.stringify(reportData),
    }),

  getReports: (params?: { page?: number; limit?: number; status?: string; userId?: string }) => {
    const q = new URLSearchParams(params as any).toString();
    return request<any>(`/reports?${q}`);
  },

  getReport: (id: string) => request<any>(`/reports/${id}`),

  // Issues
  getIssues: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    priorityBand?: string;
    status?: string;
    sortBy?: string;
  }) => {
    const q = new URLSearchParams(params as any).toString();
    return request<any>(`/issues?${q}`);
  },

  getIssue: (id: string) => request<any>(`/issues/${id}`),

  updateIssueStatus: (id: string, status: string) =>
    request<any>(`/issues/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  recalculatePriority: (id: string) =>
    request<any>(`/issues/${id}/prioritize`, {
      method: 'POST',
    }),

  // Work Orders
  getWorkOrders: (params?: { page?: number; limit?: number; status?: string; priority?: string }) => {
    const q = new URLSearchParams(params as any).toString();
    return request<any>(`/work-orders?${q}`);
  },

  getWorkOrder: (id: string) => request<any>(`/work-orders/${id}`),

  createWorkOrder: (data: {
    issueId: string;
    summary?: string;
    priority?: string;
    recommendedAction?: string;
    requiredTeam?: string;
    suggestedEquipment?: string;
    deadline?: string;
    assignedToUserId?: string;
  }) =>
    request<any>('/work-orders', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateWorkOrderStatus: (id: string, status: string) =>
    request<any>(`/work-orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  assignWorkOrder: (id: string, assignedToUserId: string) =>
    request<any>(`/work-orders/${id}/assign`, {
      method: 'PATCH',
      body: JSON.stringify({ assignedToUserId }),
    }),

  // Verification
  verifyResolution: (
    issueId: string,
    data: {
      workOrderId?: string;
      afterImageUrl: string;
      beforeImageUrl?: string;
      operatorNotes?: string;
    }
  ) =>
    request<any>(`/issues/${issueId}/verify`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  reopenIssue: (issueId: string, reason: string) =>
    request<any>(`/issues/${issueId}/reopen`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    }),

  // Signals
  getRecentSignals: (limit = 30) => request<any[]>(`/signals/recent?limit=${limit}`),

  // Analytics
  getAnalyticsOverview: () => request<any>('/analytics/overview'),
  getAnalyticsTrends: () => request<any>('/analytics/trends'),
  getAnalyticsCategories: () => request<any>('/analytics/categories'),
  getAnalyticsPriorities: () => request<any>('/analytics/priorities'),
  getAnalyticsHotspots: () => request<any>('/analytics/hotspots'),

  // Notifications
  getNotifications: () => request<any[]>('/notifications'),
  markNotificationRead: (id: string) => request<any>(`/notifications/${id}/read`, { method: 'PATCH' }),
  markAllNotificationsRead: () => request<any>('/notifications/read-all', { method: 'POST' }),

  // Admin
  getConfig: () => request<any>('/admin/config'),
  updateConfig: (key: string, value: any, description?: string) =>
    request<any>('/admin/config', {
      method: 'POST',
      body: JSON.stringify({ key, value, description }),
    }),
  getUsers: () => request<any[]>('/admin/users'),
  updateUserRole: (userId: string, role: string) =>
    request<any>(`/admin/users/${userId}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    }),
  getLocations: () => request<any[]>('/admin/locations'),
  getCategories: () => request<any[]>('/admin/categories'),

  // Health
  getHealth: () => request<any>('/health'),

  // Flagship Demo Simulation
  getDemoState: () => request<any>('/demo/state'),
  nextDemoStep: () => request<any>('/demo/next', { method: 'POST' }),
  prevDemoStep: () => request<any>('/demo/previous', { method: 'POST' }),
  setDemoStep: (step: number) => request<any>('/demo/step', { method: 'POST', body: JSON.stringify({ step }) }),
  playDemo: () => request<any>('/demo/play', { method: 'POST' }),
  pauseDemo: () => request<any>('/demo/pause', { method: 'POST' }),
  resetDemo: () => request<any>('/demo/reset', { method: 'POST' }),
};
