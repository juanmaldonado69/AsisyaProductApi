import axios from 'axios';

// Asegúrate de verificar el puerto donde corre tu API .NET (ejemplo: 5066 o 5000)
const API_URL = 'http://localhost:5066/api';

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