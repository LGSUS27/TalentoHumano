// src/shared/middlewares/roles.middleware.js
import ApiResponse from '../utils/response.js';
import Logger from '../utils/logger.js';

/**
 * Middleware para verificar roles de usuario
 * Permite controlar el acceso a rutas basado en roles
 */

/**
 * Verificar que el usuario tenga uno de los roles permitidos
 * @param {Array<string>} rolesPermitidos - Array de roles que pueden acceder
 * @returns {Function} Middleware de Express
 */
export const verificarRol = (rolesPermitidos = []) => {
  return (req, res, next) => {
    try {
      // El usuario debe haber sido agregado por el middleware verificarToken
      if (!req.user) {
        Logger.warn('Intento de acceso sin token válido');
        return ApiResponse.unauthorized(res, 'Debe iniciar sesión para acceder a este recurso');
      }

      // Obtener el rol del usuario del token
      const userRole = req.user.rol || 'supervisor'; // Default: supervisor

      // Verificar si el rol del usuario está en los roles permitidos
      if (!rolesPermitidos.includes(userRole)) {
        Logger.warn(
          `Usuario ${req.user.username} (rol: ${userRole}) intentó acceder a un recurso que requiere roles: ${rolesPermitidos.join(', ')}`
        );
        return ApiResponse.error(
          res,
          'No tiene permisos suficientes para acceder a este recurso',
          403
        );
      }

      // El usuario tiene el rol adecuado, continuar
      Logger.debug(`Acceso autorizado para ${req.user.username} (rol: ${userRole})`);
      next();
    } catch (error) {
      Logger.error('Error en middleware verificarRol:', error);
      return ApiResponse.internalError(res, 'Error al verificar permisos');
    }
  };
};

/**
 * Middleware específico para admins
 */
export const soloAdmin = verificarRol(['admin']);

/**
 * Middleware para admins y supervisores
 */
export const adminOSupervisor = verificarRol(['admin', 'supervisor']);

/**
 * Middleware para todos los usuarios autenticados (cualquier rol)
 */
export const cualquierRol = verificarRol(['admin', 'supervisor']);

/**
 * Verificar que el usuario pueda acceder a los datos de un empleado específico
 * Los admins pueden ver cualquier empleado
 * Los supervisores pueden ver empleados de su área (por ahora todos)
 */
export const verificarAccesoEmpleado = (req, res, next) => {
  try {
    const userRole = req.user.rol || 'supervisor';

    // Admins y supervisores pueden acceder a cualquier empleado
    if (userRole === 'admin' || userRole === 'supervisor') {
      return next();
    }

    // Rol no reconocido
    return ApiResponse.error(res, 'Rol de usuario no válido', 403);
  } catch (error) {
    Logger.error('Error en middleware verificarAccesoEmpleado:', error);
    return ApiResponse.internalError(res, 'Error al verificar acceso');
  }
};

export default {
  verificarRol,
  soloAdmin,
  adminOSupervisor,
  cualquierRol,
  verificarAccesoEmpleado,
};

