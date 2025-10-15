// src/services/auth.service.js
import apiClient from './api.js';

/**
 * Servicio de autenticación
 * Maneja todas las operaciones relacionadas con auth
 */
class AuthService {
/**
   * Iniciar sesión
   */
async login(username, password) {
    const response = await apiClient.post('/login', { username, password });
    return response.data;
}

/**
   * Obtener información del usuario actual
   */
async getMe() {
    const response = await apiClient.get('/me');
    return response.data;
}

/**
   * Verificar si el usuario está autenticado
   */
isAuthenticated() {
    return !!(localStorage.getItem('token') || sessionStorage.getItem('token'));
}

/**
   * Obtener token actual
   */
getToken() {
    return localStorage.getItem('token') || sessionStorage.getItem('token');
}

/**
   * Cerrar sesión
   */
logout() {
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    localStorage.removeItem('rememberMe');
}

/**
   * Guardar token
   */
saveToken(token, rememberMe = false) {
    // Limpiar tokens anteriores
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');

    if (rememberMe) {
    localStorage.setItem('token', token);
    localStorage.setItem('rememberMe', 'true');
    } else {
    sessionStorage.setItem('token', token);
    localStorage.removeItem('rememberMe');
    }
}
}

export default new AuthService();
