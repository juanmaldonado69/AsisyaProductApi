import axios from 'axios';

// Vite inyecta automáticamente el valor de .env.development o .env.production según el entorno
const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5066/api';

const axiosClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adjuntar el Token JWT en cada petición
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default axiosClient;