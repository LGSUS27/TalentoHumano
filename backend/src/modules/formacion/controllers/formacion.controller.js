// src/modules/formacion/controllers/formacion.controller.js
import formacionService from '../services/formacion.service.js';
import ApiResponse from '../../../shared/utils/response.js';
import { ERROR_MESSAGES } from '../../../shared/constants/httpCodes.js';
import Logger from '../../../shared/utils/logger.js';

class FormacionController {
async crear(req, res) {
    try {
    const { empleado_id, institucion, programa, tipo, nivel, graduado, fecha } = req.body;
    const archivo = req.file?.filename;

    if (!empleado_id || !institucion || !programa || !tipo || !nivel || !graduado || !fecha || !archivo) {
        return ApiResponse.error(res, 'Todos los campos son obligatorios, incluyendo empleado_id');
    }

    const formacion = await formacionService.crear(req.body, archivo);
    return ApiResponse.created(res, formacion, 'Formación creada exitosamente');
    } catch (error) {
    Logger.error('Error en FormacionController.crear:', error);
    return ApiResponse.internalError(res, ERROR_MESSAGES.INTERNAL_ERROR, error);
    }
}

async obtenerPorEmpleado(req, res) {
    try {
    const { empleado_id } = req.params;
    const formaciones = await formacionService.obtenerPorEmpleado(empleado_id);
    return ApiResponse.success(res, formaciones);
    } catch (error) {
    Logger.error('Error en FormacionController.obtenerPorEmpleado:', error);
    return ApiResponse.internalError(res, ERROR_MESSAGES.INTERNAL_ERROR, error);
    }
}

async listar(req, res) {
    try {
    const formaciones = await formacionService.obtenerTodos();
    return ApiResponse.success(res, formaciones);
    } catch (error) {
    Logger.error('Error en FormacionController.listar:', error);
    return ApiResponse.internalError(res, ERROR_MESSAGES.INTERNAL_ERROR, error);
    }
}

async actualizar(req, res) {
    try {
    const { id } = req.params;
    const { empleado_id } = req.body;
    const archivo = req.file?.filename;

    if (!empleado_id) {
        return ApiResponse.error(res, 'empleado_id es requerido');
    }

    const formacion = await formacionService.actualizar(id, req.body, archivo);

    if (!formacion) {
        return ApiResponse.notFound(res, 'Formación no encontrada');
    }

    return ApiResponse.success(res, formacion, 'Formación actualizada exitosamente');
    } catch (error) {
    Logger.error('Error en FormacionController.actualizar:', error);
    return ApiResponse.internalError(res, ERROR_MESSAGES.INTERNAL_ERROR, error);
    }
}
}

export default new FormacionController();
