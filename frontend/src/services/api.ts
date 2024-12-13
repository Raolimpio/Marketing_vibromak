import axios from 'axios';
import { authService } from './authService';

const api = axios.create({
  baseURL: '/api', // Usando o proxy configurado no Vite
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para adicionar token de autenticação
api.interceptors.request.use(
  (config) => {
    const token = authService.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratamento de erros
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expirado ou inválido
      await authService.logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
