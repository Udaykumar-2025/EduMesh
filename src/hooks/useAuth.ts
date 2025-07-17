import { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { User } from '../types';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('edumesh_token');
      if (token) {
        try {
          const response = await apiService.getProfile();
          if (response.success && response.data) {
            const userData: User = {
              id: response.data.id,
              name: response.data.name,
              email: response.data.email,
              phone: response.data.phone,
              role: response.data.role,
              schoolId: response.data.school_id,
              avatar: response.data.avatar_url
            };
            setUser(userData);
          }
        } catch (error) {
          console.error('Failed to load user profile:', error);
          // Clear invalid token
          apiService.clearToken();
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (userData: User) => {
    setUser(userData);
    localStorage.setItem('edumesh_user', JSON.stringify(userData));
  };

  const logout = async () => {
    try {
      await apiService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      localStorage.removeItem('edumesh_user');
    }
  };

  return { user, isLoading, login, logout };
}