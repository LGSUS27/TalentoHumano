// src/services/empleados.service.js
import apiClient from './api.js';

/**
 * Servicio de empleados
 * Maneja todas las operaciones CRUD de empleados
 */
class EmpleadosService {
/**
   * Obtener todos los empleados
   */
async getAll() {
    const response = await apiClient.get('/empleados');
    return response.data;
}

/**
   * Obtener empleado por ID
   */
async getById(id) {
    const response = await apiClient.get(`/empleados/${id}`);
    return response.data;
}

/**
   * Crear nuevo empleado
   */
async create(empleadoData) {
    const response = await apiClient.post('/empleados', empleadoData);
    return response.data;
}

/**
   * Actualizar empleado
   */
async update(id, empleadoData) {
    const response = await apiClient.put(`/empleados/${id}`, empleadoData);
    return response.data;
}

/**
   * Eliminar empleado
   */
async delete(id) {
    const response = await apiClient.delete(`/empleados/${id}`);
    return response.data;
}

/**
   * Cambiar estado del empleado
   */
async cambiarEstado(id, estado) {
    const response = await apiClient.patch(`/empleados/${id}/estado`, { estado });
    return response.data;
}
}

export default new EmpleadosService();
