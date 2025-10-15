// src/modules/otros-documentos/controllers/otros-documentos.controller.js
import otrosDocumentosService from '../services/otros-documentos.service.js';
import ApiResponse from '../../../shared/utils/response.js';
import { ERROR_MESSAGES } from '../../../shared/constants/httpCodes.js';
import Logger from '../../../shared/utils/logger.js';

class OtrosDocumentosController {
async guardar(req, res) {
    try {
    const empleadoId = Number(req.body.empleado_id);

    if (!empleadoId) {
        return ApiResponse.error(res, 'empleado_id es requerido');
    }

    const result = await otrosDocumentosService.guardar(empleadoId, req.files);

    if (!result.success) {
        return ApiResponse.error(res, result.message);
    }

    return ApiResponse.success(res, result.data, 'Documentos guardados exitosamente');
    } catch (error) {
    Logger.error('Error en OtrosDocumentosController.guardar:', error);
    return ApiResponse.internalError(res, ERROR_MESSAGES.INTERNAL_ERROR, error);
    }
}

async obtenerPorEmpleado(req, res) {
    try {
    const empleadoId = Number(req.params.empleadoId);
    const data = await otrosDocumentosService.obtenerPorEmpleado(empleadoId);

    return ApiResponse.success(res, data, 'Documentos obtenidos exitosamente');
    } catch (error) {
    Logger.error('Error en OtrosDocumentosController.obtenerPorEmpleado:', error);
    return ApiResponse.internalError(res, ERROR_MESSAGES.INTERNAL_ERROR, error);
    }
}

async eliminarCampo(req, res) {
    try {
    const empleadoId = Number(req.params.empleadoId);
    const campo = String(req.params.campo);

    const result = await otrosDocumentosService.eliminarCampo(empleadoId, campo);

    if (!result.success) {
        return ApiResponse.error(res, result.message);
    }

    return ApiResponse.success(res, null, result.message || 'Campo eliminado exitosamente');
    } catch (error) {
    Logger.error('Error en OtrosDocumentosController.eliminarCampo:', error);
    return ApiResponse.internalError(res, ERROR_MESSAGES.INTERNAL_ERROR, error);
    }
}

async eliminarContratoOtrosis(req, res) {
    try {
    const empleadoId = Number(req.params.empleadoId);
    const filename = String(req.params.filename);

    const result = await otrosDocumentosService.eliminarContratoOtrosis(empleadoId, filename);

    if (!result.success) {
        return ApiResponse.error(res, result.message);
    }

    return ApiResponse.success(res, null, result.message || 'Contrato eliminado exitosamente');
    } catch (error) {
    Logger.error('Error en OtrosDocumentosController.eliminarContratoOtrosis:', error);
    return ApiResponse.internalError(res, ERROR_MESSAGES.INTERNAL_ERROR, error);
    }
}
}

export default new OtrosDocumentosController();
