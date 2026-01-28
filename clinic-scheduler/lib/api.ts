// API Base URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Helper: Get Token
const getToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

// HELPER: Fetch Wrapper
async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = getToken();
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${url}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'An error occurred');
  }

  return data;
}

// 1. Auth API
export const authAPI = {
  // ✅ FIX: Expects a single object { email, password }
  login: async (credentials: any) => {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials), // Correctly stringifies the object
    });

    const data = await response.json();

    if (!response.ok) throw new Error(data.message || 'Login failed');
    if (data.data?.token) localStorage.setItem('token', data.data.token);

    return data;
  },

  // ✅ FIX: Expects a single object
  register: async (userData: any) => {
    const response = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });

    const data = await response.json();

    if (!response.ok) throw new Error(data.message || 'Registration failed');
    if (data.data?.token) localStorage.setItem('token', data.data.token);

    return data;
  },

  getCurrentUser: async () => fetchWithAuth('/api/auth/me'),
  logout: () => localStorage.removeItem('token'),
};

// 2. Appointments API
export const appointmentsAPI = {
  getAll: async (params?: { patientId?: number; providerId?: number; status?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.patientId) queryParams.append('patientId', params.patientId.toString());
    if (params?.providerId) queryParams.append('providerId', params.providerId.toString());
    if (params?.status) queryParams.append('status', params.status);
    return fetchWithAuth(`/api/appointments?${queryParams.toString()}`);
  },

  getById: async (id: number) => fetchWithAuth(`/api/appointments/${id}`),

  create: async (data: any) => fetchWithAuth('/api/appointments', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  update: async (id: number, data: any) => fetchWithAuth(`/api/appointments/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),

  delete: async (id: number) => fetchWithAuth(`/api/appointments/${id}`, { method: 'DELETE' }),
};

// 3. Admin API
export const adminAPI = {
  getStats: () => fetchWithAuth('/api/admin/stats'),
  getUsers: () => fetchWithAuth('/api/admin/users'),
};

// 4. Users API
export const usersAPI = {
  getProviders: async () => fetchWithAuth('/api/users/providers'),
  getAll: async () => fetchWithAuth('/api/users'),
  getById: async (id: number) => fetchWithAuth(`/api/users/${id}`),
};

// 5. Patient API (Metrics & Notes)
export const patientAPI = {
  getMetrics: () => fetchWithAuth('/api/patient/metrics'),
  getNotes: () => fetchWithAuth('/api/patient/notes'),
  addNote: (data: any) => fetchWithAuth('/api/patient/notes', {
      method: 'POST',
      body: JSON.stringify(data)
  }),
};

// 6. Provider API (Patient Details)
export const providerAPI = {
  getPatientDetails: (id: string) => fetchWithAuth(`/api/provider/patients/${id}`),
};