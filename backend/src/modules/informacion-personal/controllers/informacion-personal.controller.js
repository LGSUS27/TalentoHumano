// src/modules/informacion-personal/controllers/informacion-personal.controller.js
import informacionPersonalService from '../services/informacion-personal.service.js';
import ApiResponse from '../../../shared/utils/response.js';
import { ERROR_MESSAGES } from '../../../shared/constants/httpCodes.js';
import Logger from '../../../shared/utils/logger.js';

/**
 * Controlador de información personal
 */
class InformacionPersonalController {
/**
   * POST /api/informacion-personal - Guardar información personal
   */
async guardar(req, res) {
    try {
    const { empleado_id } = req.body;

      // Validar empleado_id
    if (!empleado_id) {
        return ApiResponse.error(res, 'empleado_id es requerido');
    }

    const result = await informacionPersonalService.guardar(req.body, req.files);

    if (!result.success) {
        if (result.errors) {
        return ApiResponse.validationError(res, result.errors);
        }
        return ApiResponse.error(res, result.message);
    }

    return ApiResponse.created(res, result.data, 'Información personal guardada exitosamente');
    } catch (error) {
    Logger.error('Error en InformacionPersonalController.guardar:', error);
    return ApiResponse.internalError(res, ERROR_MESSAGES.INTERNAL_ERROR, error);
    }
}

/**
   * GET /api/informacion-personal/empleado/:empleadoId - Obtener por empleado
   */
async obtenerPorEmpleado(req, res) {
    try {
    const { empleadoId } = req.params;
    const data = await informacionPersonalService.obtenerPorEmpleadoId(empleadoId);

    return ApiResponse.success(res, data, 'Información personal obtenida exitosamente');
    } catch (error) {
    Logger.error('Error en InformacionPersonalController.obtenerPorEmpleado:', error);
    return ApiResponse.internalError(res, ERROR_MESSAGES.INTERNAL_ERROR, error);
    }
}

/**
   * GET /api/informacion-personal - Listar todos
   */
async listar(req, res) {
    try {
    const data = await informacionPersonalService.obtenerTodos();
    return ApiResponse.success(res, data, 'Lista de información personal obtenida exitosamente');
    } catch (error) {
    Logger.error('Error en InformacionPersonalController.listar:', error);
    return ApiResponse.internalError(res, ERROR_MESSAGES.INTERNAL_ERROR, error);
    }
}
}

export default new InformacionPersonalController();
