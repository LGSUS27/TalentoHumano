// src/shared/utils/response.js
import { HTTP_STATUS } from '../constants/httpCodes.js';

/**
 * Utilidades para respuestas HTTP estandarizadas
 */
export class ApiResponse {
/**
   * Respuesta exitosa
   */
static success(res, data = null, message = 'Operación exitosa', statusCode = HTTP_STATUS.OK) {
    return res.status(statusCode).json({
    success: true,
    message,
    data,
    });
}

/**
   * Respuesta exitosa de creación
   */
static created(res, data = null, message = 'Recurso creado exitosamente') {
    return res.status(HTTP_STATUS.CREATED).json({
    success: true,
    message,
    data,
    });
}

/**
   * Respuesta de error
   */
static error(res, message = 'Error en la operación', statusCode = HTTP_STATUS.BAD_REQUEST, errors = null) {
    const response = {
    success: false,
    message,
    };

    if (errors) {
    response.errors = errors;
    }

    return res.status(statusCode).json(response);
}

/**
   * Respuesta de validación fallida
   */
static validationError(res, errors, message = 'Error de validación') {
    return res.status(HTTP_STATUS.UNPROCESSABLE_ENTITY).json({
    success: false,
    message,
    errors,
    });
}

/**
   * Respuesta de no autorizado
   */
static unauthorized(res, message = 'No autorizado') {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({
    success: false,
    message,
    });
}

/**
   * Respuesta de recurso no encontrado
   */
static notFound(res, message = 'Recurso no encontrado') {
    return res.status(HTTP_STATUS.NOT_FOUND).json({
    success: false,
    message,
    });
}

/**
   * Respuesta de conflicto (duplicado)
   */
static conflict(res, message = 'El recurso ya existe') {
    return res.status(HTTP_STATUS.CONFLICT).json({
    success: false,
    message,
    });
}

/**
   * Respuesta de error interno del servidor
   */
static internalError(res, message = 'Error interno del servidor', error = null) {
    const response = {
    success: false,
    message,
    };

    // Solo incluir detalles del error en desarrollo
    if (process.env.NODE_ENV === 'development' && error) {
    response.error = error.message;
    response.stack = error.stack;
    }

    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(response);
}
}

export default ApiResponse;
