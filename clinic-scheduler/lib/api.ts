// API Base URL - The address of the kitchen
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Helper: Check pocket for the VIP Pass (Token)
const getToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

// THE MAIN CONNECTOR FUNCTION
async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = getToken();
  
  // FIX: We tell TypeScript this is a simple Key-Value object
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  // If we have a pass, staple it to the order
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Make the actual call
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

// Auth API - Login/Register
export const authAPI = {
  login: async (email: string, password: string) => {
    // This is the specific call to the 'Login Station'
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Login failed');
    }

    // Save the token for future use
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

// Appointments API - Managed requests using our connector
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

export const adminAPI = {
  getStats: () => fetchWithAuth('/api/admin/stats'),
  getUsers: () => fetchWithAuth('/api/admin/users'),
};
export const usersAPI = {
  getProviders: async () => {
    const response = await fetch(`${API_URL}/api/users/providers`);
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to fetch providers');
    return data;
  },
  getAll: async () => { return fetchWithAuth('/api/users'); },
  getById: async (id: number) => { return fetchWithAuth(`/api/users/${id}`); },
};