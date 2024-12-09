import React, { createContext, useState, useContext, useEffect } from 'react';
import axiosInstance from '../utils/axios.config';
import axios from 'axios';

const AuthContext = createContext(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAuthStatus = async () => {
    try {
      if (!axiosInstance.defaults.headers.common['CSRF-Token']) {
        const csrfResponse = await axios.get(
          'http://localhost:5000/api/csrf-token',
          {
            withCredentials: true,
          }
        );
        axiosInstance.defaults.headers.common['CSRF-Token'] =
          csrfResponse.data.csrfToken;
      }

      const response = await axiosInstance.get('/auth/check-auth');
      setUser(response.data.user);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const login = async (credentials) => {
    try {
      const response = await axiosInstance.post('/auth/login', credentials);
      setUser(response.data.user);
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await axiosInstance.post('/auth/logout');
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
