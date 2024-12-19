import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axios.config';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const navigate = useNavigate();

  const login = async (credentials) => {
    try {
      const response = await axiosInstance.post('/auth/login', credentials);
      if (response.data.success) {
        setUser(response.data.user);
        navigate('/');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const checkAuthStatus = async () => {
    if (authChecked) return;

    try {
      const response = await axiosInstance.get('/auth/check');
      if (response.data.success) {
        console.log('Authenticated user:', response.data.user); // Debugging user data
        setUser(response.data.user);
      } else {
        console.warn('Authentication failed: User not found'); // Warn if no user is returned
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check error:', error); // Debugging errors
      setUser(null);
    } finally {
      setLoading(false);
      setAuthChecked(true);
    }
  };

  const logout = async () => {
    try {
      await axiosInstance.post('/auth/logout');
      setUser(null);
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Add interceptor to handle auth errors
  useEffect(() => {
    checkAuthStatus();

    const interceptor = axiosInstance.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.data?.isAuthError) {
          setUser(null);
          navigate('/login');
        }
        return Promise.reject(error);
      }
    );

    return () => axiosInstance.interceptors.response.eject(interceptor);
  }, [navigate]);

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        loading,
        authChecked,
        checkAuthStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
