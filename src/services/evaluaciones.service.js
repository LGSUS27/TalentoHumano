// src/services/evaluaciones.service.js
import api from './api';

/**
 * Servicio de Evaluaciones de Desempeño
 * Maneja todas las peticiones relacionadas con evaluaciones, períodos y metas
 */

// ========== PERÍODOS DE EVALUACIÓN ==========

/**
 * Obtener todos los períodos de evaluación
 * @param {Object} filtros - { activo: boolean, tipo: string }
 */
export const obtenerPeriodos = async (filtros = {}) => {
  const params = new URLSearchParams();
  if (filtros.activo !== undefined) params.append('activo', filtros.activo);
  if (filtros.tipo) params.append('tipo', filtros.tipo);
  
  const query = params.toString() ? `?${params.toString()}` : '';
  const response = await api.get(`/api/periodos-evaluacion${query}`);
  return response.data;
};

/**
 * Obtener período por ID
 */
export const obtenerPeriodoPorId = async (id) => {
  const response = await api.get(`/api/periodos-evaluacion/${id}`);
  return response.data;
};

/**
 * Crear nuevo período
 */
export const crearPeriodo = async (data) => {
  const response = await api.post('/api/periodos-evaluacion', data);
  return response.data;
};

/**
 * Actualizar período
 */
export const actualizarPeriodo = async (id, data) => {
  const response = await api.put(`/api/periodos-evaluacion/${id}`, data);
  return response.data;
};

/**
 * Eliminar período
 */
export const eliminarPeriodo = async (id) => {
  const response = await api.delete(`/api/periodos-evaluacion/${id}`);
  return response.data;
};

/**
 * Cambiar estado del período (activar/desactivar)
 */
export const cambiarEstadoPeriodo = async (id, activo) => {
  const response = await api.patch(`/api/periodos-evaluacion/${id}/estado`, { activo });
  return response.data;
};

// ========== EVALUACIONES DE DESEMPEÑO ==========

/**
 * Obtener todas las evaluaciones
 * @param {Object} filtros - { empleado_id, periodo_id, estado, tipo_evaluacion }
 */
export const obtenerEvaluaciones = async (filtros = {}) => {
  const params = new URLSearchParams();
  if (filtros.empleado_id) params.append('empleado_id', filtros.empleado_id);
  if (filtros.periodo_id) params.append('periodo_id', filtros.periodo_id);
  if (filtros.estado) params.append('estado', filtros.estado);
  if (filtros.tipo_evaluacion) params.append('tipo_evaluacion', filtros.tipo_evaluacion);
  
  const query = params.toString() ? `?${params.toString()}` : '';
  const response = await api.get(`/api/evaluaciones-desempeno${query}`);
  return response.data;
};

/**
 * Obtener evaluación por ID
 */
export const obtenerEvaluacionPorId = async (id) => {
  const response = await api.get(`/api/evaluaciones-desempeno/${id}`);
  return response.data;
};

/**
 * Crear nueva evaluación
 */
export const crearEvaluacion = async (data) => {
  const response = await api.post('/api/evaluaciones-desempeno', data);
  return response.data;
};

/**
 * Actualizar evaluación
 */
export const actualizarEvaluacion = async (id, data) => {
  const response = await api.put(`/api/evaluaciones-desempeno/${id}`, data);
  return response.data;
};

/**
 * Aprobar evaluación
 */
export const aprobarEvaluacion = async (id) => {
  const response = await api.post(`/api/evaluaciones-desempeno/${id}/aprobar`);
  return response.data;
};

/**
 * Eliminar evaluación
 */
export const eliminarEvaluacion = async (id) => {
  const response = await api.delete(`/api/evaluaciones-desempeno/${id}`);
  return response.data;
};

/**
 * Obtener historial de evaluaciones de un empleado
 */
export const obtenerHistorialEmpleado = async (empleadoId) => {
  const response = await api.get(`/api/evaluaciones-desempeno/empleado/${empleadoId}/historial`);
  return response.data;
};

// ========== METAS DE EMPLEADOS ==========

/**
 * Obtener todas las metas
 * @param {Object} filtros - { empleado_id, periodo_id, estado }
 */
export const obtenerMetas = async (filtros = {}) => {
  const params = new URLSearchParams();
  if (filtros.empleado_id) params.append('empleado_id', filtros.empleado_id);
  if (filtros.periodo_id) params.append('periodo_id', filtros.periodo_id);
  if (filtros.estado) params.append('estado', filtros.estado);
  
  const query = params.toString() ? `?${params.toString()}` : '';
  const response = await api.get(`/api/metas-empleado${query}`);
  return response.data;
};

/**
 * Obtener meta por ID
 */
export const obtenerMetaPorId = async (id) => {
  const response = await api.get(`/api/metas-empleado/${id}`);
  return response.data;
};

/**
 * Crear nueva meta
 */
export const crearMeta = async (data) => {
  const response = await api.post('/api/metas-empleado', data);
  return response.data;
};

/**
 * Actualizar meta
 */
export const actualizarMeta = async (id, data) => {
  const response = await api.put(`/api/metas-empleado/${id}`, data);
  return response.data;
};

/**
 * Cambiar estado de la meta
 */
export const cambiarEstadoMeta = async (id, estado, porcentaje_cumplimiento) => {
  const response = await api.patch(`/api/metas-empleado/${id}/estado`, {
    estado,
    porcentaje_cumplimiento
  });
  return response.data;
};

/**
 * Eliminar meta
 */
export const eliminarMeta = async (id) => {
  const response = await api.delete(`/api/metas-empleado/${id}`);
  return response.data;
};

/**
 * Obtener metas de un empleado por período
 */
export const obtenerMetasEmpleadoPeriodo = async (empleadoId, periodoId) => {
  const response = await api.get(`/api/metas-empleado/empleado/${empleadoId}/periodo/${periodoId}`);
  return response.data;
};

export default {
  // Períodos
  obtenerPeriodos,
  obtenerPeriodoPorId,
  crearPeriodo,
  actualizarPeriodo,
  eliminarPeriodo,
  cambiarEstadoPeriodo,
  // Evaluaciones
  obtenerEvaluaciones,
  obtenerEvaluacionPorId,
  crearEvaluacion,
  actualizarEvaluacion,
  aprobarEvaluacion,
  eliminarEvaluacion,
  obtenerHistorialEmpleado,
  // Metas
  obtenerMetas,
  obtenerMetaPorId,
  crearMeta,
  actualizarMeta,
  cambiarEstadoMeta,
  eliminarMeta,
  obtenerMetasEmpleadoPeriodo
};

