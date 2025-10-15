// src/services/api.js
import axios from 'axios';

/**
 * Configuración centralizada de Axios
 * Cliente HTTP para comunicarse con el backend
 */

// URL base del API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Crear instancia de Axios
const apiClient = axios.create({
baseURL: API_BASE_URL,
headers: {
    'Content-Type': 'application/json',
},
});

/**
 * Interceptor de requests
 * Agrega automáticamente el token JWT a todas las peticiones
 */
apiClient.interceptors.request.use(
(config) => {
    // Obtener token (primero de localStorage, luego de sessionStorage)
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    
    if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
},
(error) => {
    return Promise.reject(error);
}
);

/**
 * Interceptor de responses
 * Maneja errores globales y tokens expirados
 */
apiClient.interceptors.response.use(
(response) => response,
(error) => {
    // Si el token está expirado, redirigir al login
    if (error.response?.status === 401 || error.response?.status === 403) {
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    
      // Solo redirigir si no estamos ya en la página de login
    if (window.location.pathname !== '/') {
        window.location.href = '/';
    }
    }
    
    return Promise.reject(error);
}
);

export default apiClient;
export { API_BASE_URL };
