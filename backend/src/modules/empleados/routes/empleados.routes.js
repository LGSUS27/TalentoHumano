// src/modules/empleados/routes/empleados.routes.js
import express from 'express';
import empleadosController from '../controllers/empleados.controller.js';
import { verificarToken } from '../../../shared/middlewares/auth.middleware.js';

const router = express.Router();

/**
 * Rutas de empleados
 * Todas las rutas requieren autenticación (verificarToken)
 */

// GET /empleados - Listar todos los empleados
router.get('/', verificarToken, empleadosController.getAll.bind(empleadosController));

// GET /empleados/:id - Obtener empleado por ID
router.get('/:id', verificarToken, empleadosController.getById.bind(empleadosController));

// POST /empleados - Crear nuevo empleado
router.post('/', verificarToken, empleadosController.create.bind(empleadosController));

// PUT /empleados/:id - Actualizar empleado
router.put('/:id', verificarToken, empleadosController.update.bind(empleadosController));

// DELETE /empleados/:id - Eliminar empleado
router.delete('/:id', verificarToken, empleadosController.delete.bind(empleadosController));

// PATCH /empleados/:id/estado - Cambiar estado del empleado
router.patch('/:id/estado', verificarToken, empleadosController.cambiarEstado.bind(empleadosController));

export default router;
