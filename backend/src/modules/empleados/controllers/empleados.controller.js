// src/modules/empleados/controllers/empleados.controller.js
import empleadosService from '../services/empleados.service.js';
import ApiResponse from '../../../shared/utils/response.js';
import { ERROR_MESSAGES } from '../../../shared/constants/httpCodes.js';
import Logger from '../../../shared/utils/logger.js';

/**
 * Controlador de empleados
 * Maneja las peticiones HTTP para el módulo de empleados
 */
class EmpleadosController {
/**
   * GET /empleados - Obtener todos los empleados
   */
async getAll(req, res) {
    try {
    const empleados = await empleadosService.getAllEmpleados();
    return ApiResponse.success(res, { empleados }, 'Empleados obtenidos exitosamente');
    } catch (error) {
    Logger.error('Error en EmpleadosController.getAll:', error);
    return ApiResponse.internalError(res, ERROR_MESSAGES.INTERNAL_ERROR, error);
    }
}

/**
   * GET /empleados/:id - Obtener empleado por ID
   */
async getById(req, res) {
    try {
    const { id } = req.params;
    const result = await empleadosService.getEmpleadoById(id);

    if (!result.found) {
        return ApiResponse.notFound(res, 'Empleado no encontrado');
    }

    return ApiResponse.success(res, { empleado: result.empleado }, 'Empleado obtenido exitosamente');
    } catch (error) {
    Logger.error('Error en EmpleadosController.getById:', error);
    return ApiResponse.internalError(res, ERROR_MESSAGES.INTERNAL_ERROR, error);
    }
}

/**
   * POST /empleados - Crear nuevo empleado
   */
async create(req, res) {
    try {
    const empleadoData = req.body;
    const result = await empleadosService.createEmpleado(empleadoData);

    if (!result.success) {
        if (result.errors) {
        return ApiResponse.validationError(res, result.errors, 'Error de validación');
        }
        return ApiResponse.error(res, result.message);
    }

    return ApiResponse.created(res, { empleado: result.empleado }, 'Empleado creado exitosamente');
    } catch (error) {
    Logger.error('Error en EmpleadosController.create:', error);
    return ApiResponse.internalError(res, ERROR_MESSAGES.INTERNAL_ERROR, error);
    }
}

/**
   * PUT /empleados/:id - Actualizar empleado
   */
async update(req, res) {
    try {
    const { id } = req.params;
    const empleadoData = req.body;
    const result = await empleadosService.updateEmpleado(id, empleadoData);

    if (!result.success) {
        if (result.notFound) {
        return ApiResponse.notFound(res, 'Empleado no encontrado');
        }
        if (result.errors) {
        return ApiResponse.validationError(res, result.errors, 'Error de validación');
        }
        return ApiResponse.error(res, result.message);
    }

    return ApiResponse.success(res, { empleado: result.empleado }, 'Empleado actualizado exitosamente');
    } catch (error) {
    Logger.error('Error en EmpleadosController.update:', error);
    return ApiResponse.internalError(res, ERROR_MESSAGES.INTERNAL_ERROR, error);
    }
}

/**
   * DELETE /empleados/:id - Eliminar empleado
   */
async delete(req, res) {
    try {
    const { id } = req.params;
    const result = await empleadosService.deleteEmpleado(id);

    if (!result.success) {
        if (result.notFound) {
        return ApiResponse.notFound(res, 'Empleado no encontrado');
        }
        return ApiResponse.error(res, result.message);
    }

    return ApiResponse.success(res, { empleado: result.empleado }, 'Empleado eliminado exitosamente');
    } catch (error) {
    Logger.error('Error en EmpleadosController.delete:', error);
    return ApiResponse.internalError(res, ERROR_MESSAGES.INTERNAL_ERROR, error);
    }
}

/**
   * PATCH /empleados/:id/estado - Cambiar estado del empleado
   */
async cambiarEstado(req, res) {
    try {
    const { id } = req.params;
    const { estado } = req.body;
    const result = await empleadosService.cambiarEstado(id, estado);

    if (!result.success) {
        if (result.notFound) {
        return ApiResponse.notFound(res, 'Empleado no encontrado');
        }
        return ApiResponse.error(res, result.message);
    }

    return ApiResponse.success(res, { empleado: result.empleado }, result.message);
    } catch (error) {
    Logger.error('Error en EmpleadosController.cambiarEstado:', error);
    return ApiResponse.internalError(res, ERROR_MESSAGES.INTERNAL_ERROR, error);
    }
}
}

export default new EmpleadosController();
