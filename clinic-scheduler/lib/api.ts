// API Base URL - use local backend for now
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Helper function to get token from localStorage
const getToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

// Helper function to make authenticated requests
async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = getToken();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
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

// Auth API
export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Login failed');
    }

    // Store token
    if (data.data?.token) {
      localStorage.setItem('token', data.data.token);
    }

    return data;
  },

  register: async (email: string, password: string, name: string, role: string) => {
    const response = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name, role }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Registration failed');
    }

    // Store token
    if (data.data?.token) {
      localStorage.setItem('token', data.data.token);
    }

    return data;
  },

  getCurrentUser: async () => {
    return fetchWithAuth('/api/auth/me');
  },

  logout: () => {
    localStorage.removeItem('token');
  },
};

// Appointments API
export const appointmentsAPI = {
  getAll: async (params?: { patientId?: number; providerId?: number; status?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.patientId) queryParams.append('patientId', params.patientId.toString());
    if (params?.providerId) queryParams.append('providerId', params.providerId.toString());
    if (params?.status) queryParams.append('status', params.status);

    const queryString = queryParams.toString();
    const url = `/api/appointments${queryString ? `?${queryString}` : ''}`;

    return fetchWithAuth(url);
  },

  getById: async (id: number) => {
    return fetchWithAuth(`/api/appointments/${id}`);
  },

  create: async (data: {
    patientId: number;
    providerId: number;
    date: string;
    time: string;
    reason: string;
  }) => {
    return fetchWithAuth('/api/appointments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: number, data: {
    date?: string;
    time?: string;
    status?: string;
    reason?: string;
  }) => {
    return fetchWithAuth(`/api/appointments/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: number) => {
    return fetchWithAuth(`/api/appointments/${id}`, {
      method: 'DELETE',
    });
  },
};

// Users API
export const usersAPI = {
  getProviders: async () => {
    const response = await fetch(`${API_URL}/api/users/providers`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch providers');
    }

    return data;
  },

  getAll: async () => {
    return fetchWithAuth('/api/users');
  },

  getById: async (id: number) => {
    return fetchWithAuth(`/api/users/${id}`);
  },
};
