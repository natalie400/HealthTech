'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@/lib/types';
import { authAPI } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Load user from token on mount
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      
      if (token) {
        try {
          const response = await authAPI.getCurrentUser();
          if (response.success && response.data) {
            setUser(response.data);
          }
        } catch (error) {
          console.error('Error loading user:', error);
          localStorage.removeItem('token');
        }
      }
      
      setIsLoading(false);
    };

    loadUser();
  }, []);

  // Login function - calls real API and handles Redirects
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await authAPI.login(email, password);
      
      if (response.success && response.data?.user) {
        // 1. Save Token (Critical for persistence)
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
        }

        // 2. Set User State
        const userData = response.data.user;
        setUser(userData);

        // 3. Traffic Cop Redirect Logic 🚦
        if (userData.role === 'admin') {
          router.push('/admin/dashboard');
        } else if (userData.role === 'provider') {
          router.push('/provider/schedule');
        } else {
          router.push('/dashboard'); // Patient
        }

        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  // Logout function
  const logout = () => {
    setUser(null);
    localStorage.removeItem('token'); // Ensure token is cleared
    authAPI.logout();
    router.push('/login'); // Redirect to login on logout
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}