// src/modules/experiencia/controllers/experiencia.controller.js
import experienciaService from '../services/experiencia.service.js';
import ApiResponse from '../../../shared/utils/response.js';
import { ERROR_MESSAGES } from '../../../shared/constants/httpCodes.js';
import Logger from '../../../shared/utils/logger.js';

class ExperienciaController {
async crear(req, res) {
    try {
    const { empleado_id, empresa, cargo, tipoVinculacion, fechaInicio, fechaFin, funciones } = req.body;
    const soporte = req.file?.filename;

    if (!empleado_id || !empresa || !cargo || !tipoVinculacion || !fechaInicio || !fechaFin || !funciones || !soporte) {
        return ApiResponse.error(res, 'Todos los campos son obligatorios, incluyendo empleado_id');
    }

    const experiencia = await experienciaService.crear(req.body, soporte);
    return ApiResponse.created(res, experiencia, 'Experiencia creada exitosamente');
    } catch (error) {
    Logger.error('Error en ExperienciaController.crear:', error);
    return ApiResponse.internalError(res, ERROR_MESSAGES.INTERNAL_ERROR, error);
    }
}

async obtenerPorEmpleado(req, res) {
    try {
    const { empleado_id } = req.params;
    const experiencias = await experienciaService.obtenerPorEmpleado(empleado_id);
    return ApiResponse.success(res, experiencias);
    } catch (error) {
    Logger.error('Error en ExperienciaController.obtenerPorEmpleado:', error);
    return ApiResponse.internalError(res, ERROR_MESSAGES.INTERNAL_ERROR, error);
    }
}

async listar(req, res) {
    try {
    const experiencias = await experienciaService.obtenerTodos();
    return ApiResponse.success(res, experiencias);
    } catch (error) {
    Logger.error('Error en ExperienciaController.listar:', error);
    return ApiResponse.internalError(res, ERROR_MESSAGES.INTERNAL_ERROR, error);
    }
}

async actualizar(req, res) {
    try {
    const { id } = req.params;
    const { empleado_id } = req.body;
    const soporte = req.file?.filename;

    if (!empleado_id) {
        return ApiResponse.error(res, 'empleado_id es requerido');
    }

    const experiencia = await experienciaService.actualizar(id, req.body, soporte);

    if (!experiencia) {
        return ApiResponse.notFound(res, 'Experiencia no encontrada');
    }

    return ApiResponse.success(res, experiencia, 'Experiencia actualizada exitosamente');
    } catch (error) {
    Logger.error('Error en ExperienciaController.actualizar:', error);
    return ApiResponse.internalError(res, ERROR_MESSAGES.INTERNAL_ERROR, error);
    }
}
}

export default new ExperienciaController();
