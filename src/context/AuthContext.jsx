import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axios.config';
import LoadingScreen from '../components/LoadingScreen';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const navigate = useNavigate();

  const login = async (credentials) => {
    try {
      setLoading(true);
      const response = await axiosInstance.post('/auth/login', credentials, {
        withCredentials: true, // Ensure cookies are received
      });

      if (response.data.success && response.data.user) {
        setUser(response.data.user);
        navigate('/');
        return { success: true };
      }
      return {
        success: false,
        message: response.data.message || 'Login failed',
      };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Invalid credentials',
      };
    } finally {
      setLoading(false);
    }
  };

  const checkAuthStatus = async () => {
    if (authChecked) return;

    try {
      const response = await axiosInstance.get('/auth/check', {
        withCredentials: true,
      });

      if (response.data.success && response.data.isAuthenticated) {
        setUser(response.data.user);
      } else {
        // This is a normal case for unauthenticated users
        setUser(null);
        if (window.location.pathname !== '/login') {
          navigate('/login');
        }
      }
    } catch (error) {
      console.error(
        'Auth check failed:',
        error.response?.data?.message || error.message
      );
      setUser(null);
      if (window.location.pathname !== '/login') {
        navigate('/login');
      }
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
      // Continue with logout even if the server request fails
    } finally {
      // Clear cookie and user state
      document.cookie =
        'token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
      setUser(null);
      navigate('/login');
    }
  };

  const handleAuthError = useCallback(() => {
    setUser(null);
    // Debounce navigation to prevent multiple redirects
    const timeoutId = setTimeout(() => {
      if (window.location.pathname !== '/login') {
        navigate('/login');
      }
    }, 100);
    return () => clearTimeout(timeoutId);
  }, [navigate]);

  useEffect(() => {
    checkAuthStatus();
  }, [navigate, handleAuthError]);

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
