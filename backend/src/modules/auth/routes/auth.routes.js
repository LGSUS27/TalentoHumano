// src/modules/auth/routes/auth.routes.js
import express from 'express';
import authController from '../controllers/auth.controller.js';
import { verificarToken } from '../../../shared/middlewares/auth.middleware.js';

const router = express.Router();

/**
 * Rutas de autenticación
 */

// POST /login - Iniciar sesión (público)
router.post('/login', authController.login.bind(authController));

// GET /protected - Ruta de prueba protegida (requiere token)
router.get('/protected', verificarToken, authController.protected.bind(authController));

// GET /me - Obtener información del usuario actual (requiere token)
router.get('/me', verificarToken, authController.me.bind(authController));

export default router;
