// src/shared/middlewares/errorHandler.js
import { HTTP_STATUS, ERROR_MESSAGES } from '../constants/httpCodes.js';

/**
 * Middleware global de manejo de errores
 */
export const errorHandler = (err, req, res, next) => {
console.error('❌ Error:', err);

  // Error de validación de Multer
if (err.name === 'MulterError') {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
    success: false,
    message: getMulterErrorMessage(err),
    });
}

  // Error de validación personalizado
if (err.name === 'ValidationError') {
    return res.status(HTTP_STATUS.UNPROCESSABLE_ENTITY).json({
    success: false,
    message: err.message,
    errors: err.errors,
    });
}

  // Error de base de datos
if (err.code) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
    success: false,
    message: getDatabaseErrorMessage(err),
    });
}

  // Error genérico
return res.status(err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
    success: false,
    message: err.message || ERROR_MESSAGES.INTERNAL_ERROR,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
});
};

/**
 * Obtener mensaje de error de Multer
 */
const getMulterErrorMessage = (err) => {
switch (err.code) {
    case 'LIMIT_FILE_SIZE':
    return 'Archivo demasiado grande. Máximo 10MB por archivo.';
    case 'LIMIT_FILE_COUNT':
    return 'Demasiados archivos.';
    case 'LIMIT_UNEXPECTED_FILE':
    return 'Campo de archivo no esperado.';
    default:
    return `Error de archivo: ${err.message}`;
}
};

/**
 * Obtener mensaje de error de base de datos PostgreSQL
 */
const getDatabaseErrorMessage = (err) => {
switch (err.code) {
    case '23505': // unique_violation
    return 'El registro ya existe (duplicado).';
    case '23503': // foreign_key_violation
    return 'Referencia inválida a otro registro.';
    case '23502': // not_null_violation
    return 'Campo requerido faltante.';
    case '22P02': // invalid_text_representation
    return 'Formato de dato inválido.';
    default:
    return ERROR_MESSAGES.DATABASE_ERROR;
}
};

/**
 * Middleware para rutas no encontradas (404)
 */
export const notFoundHandler = (req, res) => {
res.status(HTTP_STATUS.NOT_FOUND).json({
    success: false,
    message: `Ruta no encontrada: ${req.method} ${req.path}`,
});
};

export default errorHandler;
