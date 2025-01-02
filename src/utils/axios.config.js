import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL;

const axiosInstance = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
});

// Add request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    // Get token from cookie if exists
    const token = document.cookie
      .split('; ')
      .find(row => row.startsWith('token='))
      ?.split('=')[1];

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear cookie on auth error
      document.cookie = 'token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
      
      // Only dispatch auth-error event if it's not a check auth request
      if (!error.config.url.includes('/auth/check')) {
        window.dispatchEvent(new CustomEvent('auth-error'));
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
