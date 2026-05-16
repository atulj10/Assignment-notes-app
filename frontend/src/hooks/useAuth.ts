import { useState, useEffect, useCallback } from 'react';
import api from '../api';

export default function useAuth() {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('access_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      localStorage.setItem('access_token', token);
    } else {
      localStorage.removeItem('access_token');
    }
    setLoading(false);
  }, [token]);

  const login = useCallback(async (email: string, password: string) => {
    const { data } = await api.post('/auth/login', { email, password });
    setToken(data.access_token);
    return data;
  }, []);

  const register = useCallback(async (email: string, password: string) => {
    const { data } = await api.post('/auth/register', { email, password });
    return data;
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    localStorage.removeItem('access_token');
  }, []);

  const isAuthenticated = useCallback(() => !!token, [token]);

  return { token, login, register, logout, isAuthenticated, loading };
}
