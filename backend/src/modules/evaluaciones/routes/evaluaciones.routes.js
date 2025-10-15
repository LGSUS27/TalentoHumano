// src/modules/evaluaciones/routes/evaluaciones.routes.js
import express from 'express';
import evaluacionesController from '../controllers/evaluaciones.controller.js';
import { verificarToken } from '../../../shared/middlewares/auth.middleware.js';
import {
  soloAdmin,
  adminOSupervisor,
  verificarAccesoEmpleado
} from '../../../shared/middlewares/roles.middleware.js';

const router = express.Router();

/**
 * Rutas de Evaluaciones de Desempeño
 * Todas las rutas requieren autenticación (verificarToken)
 * Algunas requieren roles específicos
 */

// ========== PERÍODOS DE EVALUACIÓN ==========

// GET /api/periodos-evaluacion - Listar períodos (todos los roles)
router.get(
  '/periodos-evaluacion',
  verificarToken,
  evaluacionesController.obtenerPeriodos.bind(evaluacionesController)
);

// GET /api/periodos-evaluacion/:id - Obtener período por ID (todos los roles)
router.get(
  '/periodos-evaluacion/:id',
  verificarToken,
  evaluacionesController.obtenerPeriodoPorId.bind(evaluacionesController)
);

// POST /api/periodos-evaluacion - Crear período (solo admin)
router.post(
  '/periodos-evaluacion',
  verificarToken,
  soloAdmin,
  evaluacionesController.crearPeriodo.bind(evaluacionesController)
);

// PUT /api/periodos-evaluacion/:id - Actualizar período (solo admin)
router.put(
  '/periodos-evaluacion/:id',
  verificarToken,
  soloAdmin,
  evaluacionesController.actualizarPeriodo.bind(evaluacionesController)
);

// DELETE /api/periodos-evaluacion/:id - Eliminar período (solo admin)
router.delete(
  '/periodos-evaluacion/:id',
  verificarToken,
  soloAdmin,
  evaluacionesController.eliminarPeriodo.bind(evaluacionesController)
);

// PATCH /api/periodos-evaluacion/:id/estado - Cambiar estado (solo admin)
router.patch(
  '/periodos-evaluacion/:id/estado',
  verificarToken,
  soloAdmin,
  evaluacionesController.cambiarEstadoPeriodo.bind(evaluacionesController)
);

// ========== EVALUACIONES DE DESEMPEÑO ==========

// GET /api/evaluaciones-desempeno - Listar evaluaciones (admin y supervisores ven todas)
router.get(
  '/evaluaciones-desempeno',
  verificarToken,
  evaluacionesController.obtenerEvaluaciones.bind(evaluacionesController)
);

// GET /api/evaluaciones-desempeno/:id - Obtener evaluación por ID
router.get(
  '/evaluaciones-desempeno/:id',
  verificarToken,
  evaluacionesController.obtenerEvaluacionPorId.bind(evaluacionesController)
);

// POST /api/evaluaciones-desempeno - Crear evaluación (admin y supervisores)
router.post(
  '/evaluaciones-desempeno',
  verificarToken,
  adminOSupervisor,
  evaluacionesController.crearEvaluacion.bind(evaluacionesController)
);

// PUT /api/evaluaciones-desempeno/:id - Actualizar evaluación (admin y supervisores)
router.put(
  '/evaluaciones-desempeno/:id',
  verificarToken,
  adminOSupervisor,
  evaluacionesController.actualizarEvaluacion.bind(evaluacionesController)
);

// POST /api/evaluaciones-desempeno/:id/aprobar - Aprobar evaluación (solo admin)
router.post(
  '/evaluaciones-desempeno/:id/aprobar',
  verificarToken,
  soloAdmin,
  evaluacionesController.aprobarEvaluacion.bind(evaluacionesController)
);

// DELETE /api/evaluaciones-desempeno/:id - Eliminar evaluación (solo admin)
router.delete(
  '/evaluaciones-desempeno/:id',
  verificarToken,
  soloAdmin,
  evaluacionesController.eliminarEvaluacion.bind(evaluacionesController)
);

// GET /api/evaluaciones-desempeno/empleado/:empleadoId/historial - Historial del empleado
router.get(
  '/evaluaciones-desempeno/empleado/:empleadoId/historial',
  verificarToken,
  verificarAccesoEmpleado,
  evaluacionesController.obtenerHistorialEmpleado.bind(evaluacionesController)
);

// ========== METAS DE EMPLEADOS ==========

// GET /api/metas-empleado - Listar metas
router.get(
  '/metas-empleado',
  verificarToken,
  evaluacionesController.obtenerMetas.bind(evaluacionesController)
);

// GET /api/metas-empleado/:id - Obtener meta por ID
router.get(
  '/metas-empleado/:id',
  verificarToken,
  evaluacionesController.obtenerMetaPorId.bind(evaluacionesController)
);

// POST /api/metas-empleado - Crear meta (admin y supervisores)
router.post(
  '/metas-empleado',
  verificarToken,
  adminOSupervisor,
  evaluacionesController.crearMeta.bind(evaluacionesController)
);

// PUT /api/metas-empleado/:id - Actualizar meta (admin y supervisores)
router.put(
  '/metas-empleado/:id',
  verificarToken,
  adminOSupervisor,
  evaluacionesController.actualizarMeta.bind(evaluacionesController)
);

// PATCH /api/metas-empleado/:id/estado - Cambiar estado de meta
router.patch(
  '/metas-empleado/:id/estado',
  verificarToken,
  adminOSupervisor,
  evaluacionesController.cambiarEstadoMeta.bind(evaluacionesController)
);

// DELETE /api/metas-empleado/:id - Eliminar meta (solo admin)
router.delete(
  '/metas-empleado/:id',
  verificarToken,
  soloAdmin,
  evaluacionesController.eliminarMeta.bind(evaluacionesController)
);

// GET /api/metas-empleado/empleado/:empleadoId/periodo/:periodoId - Metas por empleado y período
router.get(
  '/metas-empleado/empleado/:empleadoId/periodo/:periodoId',
  verificarToken,
  verificarAccesoEmpleado,
  evaluacionesController.obtenerMetasEmpleadoPeriodo.bind(evaluacionesController)
);

export default router;
