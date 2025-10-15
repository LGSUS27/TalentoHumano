// src/modules/auth/controllers/auth.controller.js
import authService from '../services/auth.service.js';
import ApiResponse from '../../../shared/utils/response.js';
import { HTTP_STATUS, ERROR_MESSAGES } from '../../../shared/constants/httpCodes.js';
import Logger from '../../../shared/utils/logger.js';

/**
 * Controlador de autenticación
 * Maneja las peticiones HTTP relacionadas con autenticación
 */
class AuthController {
/**
   * POST /login - Iniciar sesión
   */
async login(req, res) {
    try {
    const { username, password } = req.body || {};

      // Validar campos requeridos
    if (!username || !password) {
        return ApiResponse.validationError(
        res,
        { username: !username ? 'Username es requerido' : null, password: !password ? 'Password es requerido' : null },
        ERROR_MESSAGES.MISSING_FIELDS
        );
    }

      // Autenticar usuario
    const result = await authService.login(username, password);

    if (!result.success) {
        return ApiResponse.unauthorized(res, result.message);
    }

    return ApiResponse.success(res, { token: result.token, user: result.user }, 'Login exitoso');
    } catch (error) {
    Logger.error('Error en AuthController.login:', error);
    return ApiResponse.internalError(res, ERROR_MESSAGES.INTERNAL_ERROR, error);
    }
}

/**
   * GET /protected - Ruta de prueba protegida
   */
async protected(req, res) {
    try {
      // El middleware verificarToken ya validó el token y agregó req.user
    return ApiResponse.success(
        res,
        { user: req.user },
        'Acceso autorizado a ruta protegida'
    );
    } catch (error) {
    Logger.error('Error en AuthController.protected:', error);
    return ApiResponse.internalError(res, ERROR_MESSAGES.INTERNAL_ERROR, error);
    }
}

/**
   * GET /me - Obtener información del usuario actual
   */
async me(req, res) {
    try {
    const userId = req.user.id;
    const user = await authService.getUserById(userId);

    if (!user) {
        return ApiResponse.notFound(res, 'Usuario no encontrado');
    }

    return ApiResponse.success(res, user, 'Usuario obtenido exitosamente');
    } catch (error) {
    Logger.error('Error en AuthController.me:', error);
    return ApiResponse.internalError(res, ERROR_MESSAGES.INTERNAL_ERROR, error);
    }
}
}

export default new AuthController();
