// src/modules/auth/services/auth.service.js
import pool from '../../../shared/config/database.js';
import jwt from 'jsonwebtoken';
import { config } from '../../../shared/config/env.js';
import Logger from '../../../shared/utils/logger.js';

/**
 * Servicio de autenticación
 * Maneja la lógica de negocio para login y validación de usuarios
 */
class AuthService {
/**
   * Autenticar usuario con username y password
   */
async login(username, password) {
    try {
    Logger.debug(`Intento de login para usuario: ${username}`);
    
    const result = await pool.query(
        'SELECT * FROM usuarios WHERE username = $1 AND password = $2',
        [username, password]
    );

    if (result.rows.length === 0) {
        Logger.warn(`Login fallido para usuario: ${username}`);
        return { success: false, message: 'Credenciales incorrectas' };
    }

    const user = result.rows[0];
    
      // Generar token JWT con rol y empleado_id
    const token = jwt.sign(
        {
        id: user.id,
        username: user.username,
        rol: user.rol || 'supervisor',
        empleado_id: user.empleado_id || null
        },
        config.jwtSecret,
        { expiresIn: config.jwtExpiresIn }
    );

    Logger.success(`Login exitoso para usuario: ${username} (rol: ${user.rol})`);
    
    return {
        success: true,
        token,
        user: {
        id: user.id,
        username: user.username,
        rol: user.rol || 'supervisor',
        empleado_id: user.empleado_id || null,
        },
    };
    } catch (error) {
    Logger.error('Error en AuthService.login:', error);
    throw error;
    }
}

/**
   * Validar token JWT
   */
validateToken(token) {
    try {
    const decoded = jwt.verify(token, config.jwtSecret);
    return { success: true, user: decoded };
    } catch (error) {
    Logger.warn('Token inválido o expirado:', error.message);
    return { success: false, message: 'Token inválido o expirado' };
    }
}

/**
   * Obtener usuario por ID
   */
async getUserById(userId) {
    try {
    const result = await pool.query(
        'SELECT id, username, rol, empleado_id, created_at FROM usuarios WHERE id = $1',
        [userId]
    );

    if (result.rows.length === 0) {
        return null;
    }

    return result.rows[0];
    } catch (error) {
    Logger.error('Error en AuthService.getUserById:', error);
    throw error;
    }
}
}

export default new AuthService();
