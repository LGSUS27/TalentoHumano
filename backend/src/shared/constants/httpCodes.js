// src/shared/constants/httpCodes.js

/**
 * Códigos de estado HTTP estandarizados
 */
export const HTTP_STATUS = {
  // Success
OK: 200,
CREATED: 201,
NO_CONTENT: 204,

  // Client Errors
BAD_REQUEST: 400,
UNAUTHORIZED: 401,
FORBIDDEN: 403,
NOT_FOUND: 404,
CONFLICT: 409,
UNPROCESSABLE_ENTITY: 422,

  // Server Errors
INTERNAL_SERVER_ERROR: 500,
SERVICE_UNAVAILABLE: 503,
};

/**
 * Mensajes de error comunes
 */
export const ERROR_MESSAGES = {
  // Autenticación
TOKEN_NOT_PROVIDED: 'Token no proporcionado',
TOKEN_INVALID: 'Token no válido',
TOKEN_EXPIRED: 'Token inválido o expirado',
INVALID_CREDENTIALS: 'Credenciales incorrectas',
UNAUTHORIZED: 'No autorizado',

  // Validación
MISSING_FIELDS: 'Faltan campos obligatorios',
INVALID_FORMAT: 'Formato inválido',
INVALID_ID: 'ID inválido',

  // Recursos
NOT_FOUND: 'Recurso no encontrado',
ALREADY_EXISTS: 'El recurso ya existe',

  // Archivos
FILE_TOO_LARGE: 'Archivo demasiado grande',
INVALID_FILE_TYPE: 'Tipo de archivo no permitido',
FILE_UPLOAD_ERROR: 'Error al subir archivo',

  // General
INTERNAL_ERROR: 'Error interno del servidor',
DATABASE_ERROR: 'Error en la base de datos',
};

export default { HTTP_STATUS, ERROR_MESSAGES };
