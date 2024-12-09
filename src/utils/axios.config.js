import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  maxBodyLength: Infinity,
  maxContentLength: Infinity,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
  retryDelay: 3000,
  retry: 3,
});

axiosInstance.interceptors.request.use(async (config) => {
  if (!axiosInstance.defaults.headers.common['CSRF-Token']) {
    try {
      const response = await axios.get(`${API_URL}/csrf-token`, {
        withCredentials: true,
      });
      axiosInstance.defaults.headers.common['CSRF-Token'] = response.data.csrfToken;
    } catch (error) {
      console.error('Error fetching CSRF token:', error);
    }
  }
  return config;
});

// Add response interceptor for error handling
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 403 && error.response?.data?.message?.includes('CSRF')) {
      // CSRF token expired or invalid, retry getting a new one
      delete axiosInstance.defaults.headers.common['CSRF-Token'];
    }
    if (error.response?.status === 429) {
      // Rate limit exceeded
      const retryAfter = error.response.headers['retry-after'] || 15;
      return new Promise(resolve => {
        setTimeout(() => {
          resolve(axiosInstance(error.config));
        }, retryAfter * 1000);
      });
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
