// src/modules/evaluaciones/controllers/evaluaciones.controller.js
import evaluacionesService from '../services/evaluaciones.service.js';
import ApiResponse from '../../../shared/utils/response.js';
import { ERROR_MESSAGES } from '../../../shared/constants/httpCodes.js';
import Logger from '../../../shared/utils/logger.js';

/**
 * Controlador de Evaluaciones de Desempeño
 * Maneja las peticiones HTTP para períodos, evaluaciones y metas
 */
class EvaluacionesController {
  // ===== PERÍODOS DE EVALUACIÓN =====

  /**
   * GET /api/periodos-evaluacion
   */
  async obtenerPeriodos(req, res) {
    try {
      const filtros = {
        activo: req.query.activo === 'true' ? true : req.query.activo === 'false' ? false : undefined,
        tipo: req.query.tipo
      };

      const periodos = await evaluacionesService.obtenerPeriodos(filtros);
      return ApiResponse.success(res, { periodos }, 'Períodos obtenidos exitosamente');
    } catch (error) {
      Logger.error('Error en EvaluacionesController.obtenerPeriodos:', error);
      return ApiResponse.internalError(res, ERROR_MESSAGES.INTERNAL_ERROR, error);
    }
  }

  /**
   * GET /api/periodos-evaluacion/:id
   */
  async obtenerPeriodoPorId(req, res) {
    try {
      const { id } = req.params;
      const result = await evaluacionesService.obtenerPeriodoPorId(id);

      if (!result.found) {
        return ApiResponse.notFound(res, 'Período de evaluación no encontrado');
      }

      return ApiResponse.success(res, { periodo: result.periodo }, 'Período obtenido exitosamente');
    } catch (error) {
      Logger.error('Error en EvaluacionesController.obtenerPeriodoPorId:', error);
      return ApiResponse.internalError(res, ERROR_MESSAGES.INTERNAL_ERROR, error);
    }
  }

  /**
   * POST /api/periodos-evaluacion
   */
  async crearPeriodo(req, res) {
    try {
      const result = await evaluacionesService.crearPeriodo(req.body);

      if (!result.success) {
        return ApiResponse.error(res, result.message);
      }

      return ApiResponse.created(res, { periodo: result.periodo }, 'Período creado exitosamente');
    } catch (error) {
      Logger.error('Error en EvaluacionesController.crearPeriodo:', error);
      return ApiResponse.internalError(res, ERROR_MESSAGES.INTERNAL_ERROR, error);
    }
  }

  /**
   * PUT /api/periodos-evaluacion/:id
   */
  async actualizarPeriodo(req, res) {
    try {
      const { id } = req.params;
      const result = await evaluacionesService.actualizarPeriodo(id, req.body);

      if (!result.success) {
        if (result.notFound) {
          return ApiResponse.notFound(res, 'Período de evaluación no encontrado');
        }
        return ApiResponse.error(res, result.message);
      }

      return ApiResponse.success(res, { periodo: result.periodo }, 'Período actualizado exitosamente');
    } catch (error) {
      Logger.error('Error en EvaluacionesController.actualizarPeriodo:', error);
      return ApiResponse.internalError(res, ERROR_MESSAGES.INTERNAL_ERROR, error);
    }
  }

  /**
   * DELETE /api/periodos-evaluacion/:id
   */
  async eliminarPeriodo(req, res) {
    try {
      const { id } = req.params;
      const result = await evaluacionesService.eliminarPeriodo(id);

      if (!result.success) {
        if (result.notFound) {
          return ApiResponse.notFound(res, 'Período de evaluación no encontrado');
        }
        return ApiResponse.error(res, result.message);
      }

      return ApiResponse.success(res, { periodo: result.periodo }, 'Período eliminado exitosamente');
    } catch (error) {
      Logger.error('Error en EvaluacionesController.eliminarPeriodo:', error);
      return ApiResponse.internalError(res, ERROR_MESSAGES.INTERNAL_ERROR, error);
    }
  }

  /**
   * PATCH /api/periodos-evaluacion/:id/estado
   */
  async cambiarEstadoPeriodo(req, res) {
    try {
      const { id } = req.params;
      const { activo } = req.body;

      if (activo === undefined) {
        return ApiResponse.error(res, 'El campo "activo" es requerido');
      }

      const result = await evaluacionesService.cambiarEstadoPeriodo(id, activo);

      if (!result.success) {
        if (result.notFound) {
          return ApiResponse.notFound(res, 'Período de evaluación no encontrado');
        }
        return ApiResponse.error(res, result.message);
      }

      return ApiResponse.success(
        res,
        { periodo: result.periodo },
        `Período ${activo ? 'activado' : 'desactivado'} exitosamente`
      );
    } catch (error) {
      Logger.error('Error en EvaluacionesController.cambiarEstadoPeriodo:', error);
      return ApiResponse.internalError(res, ERROR_MESSAGES.INTERNAL_ERROR, error);
    }
  }

  // ===== EVALUACIONES =====

  /**
   * GET /api/evaluaciones-desempeno
   */
  async obtenerEvaluaciones(req, res) {
    try {
      const filtros = {
        empleado_id: req.query.empleado_id,
        periodo_id: req.query.periodo_id,
        estado: req.query.estado,
        tipo_evaluacion: req.query.tipo_evaluacion
      };

      const evaluaciones = await evaluacionesService.obtenerEvaluaciones(filtros);
      return ApiResponse.success(res, { evaluaciones }, 'Evaluaciones obtenidas exitosamente');
    } catch (error) {
      Logger.error('Error en EvaluacionesController.obtenerEvaluaciones:', error);
      return ApiResponse.internalError(res, ERROR_MESSAGES.INTERNAL_ERROR, error);
    }
  }

  /**
   * GET /api/evaluaciones-desempeno/:id
   */
  async obtenerEvaluacionPorId(req, res) {
    try {
      const { id } = req.params;
      const result = await evaluacionesService.obtenerEvaluacionPorId(id);

      if (!result.found) {
        return ApiResponse.notFound(res, 'Evaluación no encontrada');
      }

      return ApiResponse.success(res, { evaluacion: result.evaluacion }, 'Evaluación obtenida exitosamente');
    } catch (error) {
      Logger.error('Error en EvaluacionesController.obtenerEvaluacionPorId:', error);
      return ApiResponse.internalError(res, ERROR_MESSAGES.INTERNAL_ERROR, error);
    }
  }

  /**
   * POST /api/evaluaciones-desempeno
   */
  async crearEvaluacion(req, res) {
    try {
      // El evaluador_id se obtiene del usuario autenticado
      const evaluadorId = req.user.id;

      const result = await evaluacionesService.crearEvaluacion(req.body, evaluadorId);

      if (!result.success) {
        return ApiResponse.error(res, result.message);
      }

      return ApiResponse.created(res, { evaluacion: result.evaluacion }, 'Evaluación creada exitosamente');
    } catch (error) {
      Logger.error('Error en EvaluacionesController.crearEvaluacion:', error);
      return ApiResponse.internalError(res, ERROR_MESSAGES.INTERNAL_ERROR, error);
    }
  }

  /**
   * PUT /api/evaluaciones-desempeno/:id
   */
  async actualizarEvaluacion(req, res) {
    try {
      const { id } = req.params;
      const result = await evaluacionesService.actualizarEvaluacion(id, req.body);

      if (!result.success) {
        if (result.notFound) {
          return ApiResponse.notFound(res, 'Evaluación no encontrada');
        }
        return ApiResponse.error(res, result.message);
      }

      return ApiResponse.success(res, { evaluacion: result.evaluacion }, 'Evaluación actualizada exitosamente');
    } catch (error) {
      Logger.error('Error en EvaluacionesController.actualizarEvaluacion:', error);
      return ApiResponse.internalError(res, ERROR_MESSAGES.INTERNAL_ERROR, error);
    }
  }

  /**
   * POST /api/evaluaciones-desempeno/:id/aprobar
   */
  async aprobarEvaluacion(req, res) {
    try {
      const { id } = req.params;
      const result = await evaluacionesService.aprobarEvaluacion(id);

      if (!result.success) {
        if (result.notFound) {
          return ApiResponse.notFound(res, 'Evaluación no encontrada');
        }
        return ApiResponse.error(res, result.message);
      }

      return ApiResponse.success(res, { evaluacion: result.evaluacion }, 'Evaluación aprobada exitosamente');
    } catch (error) {
      Logger.error('Error en EvaluacionesController.aprobarEvaluacion:', error);
      return ApiResponse.internalError(res, ERROR_MESSAGES.INTERNAL_ERROR, error);
    }
  }

  /**
   * DELETE /api/evaluaciones-desempeno/:id
   */
  async eliminarEvaluacion(req, res) {
    try {
      const { id } = req.params;
      const result = await evaluacionesService.eliminarEvaluacion(id);

      if (!result.success) {
        if (result.notFound) {
          return ApiResponse.notFound(res, 'Evaluación no encontrada');
        }
        return ApiResponse.error(res, result.message);
      }

      return ApiResponse.success(res, { evaluacion: result.evaluacion }, 'Evaluación eliminada exitosamente');
    } catch (error) {
      Logger.error('Error en EvaluacionesController.eliminarEvaluacion:', error);
      return ApiResponse.internalError(res, ERROR_MESSAGES.INTERNAL_ERROR, error);
    }
  }

  /**
   * GET /api/evaluaciones-desempeno/empleado/:empleadoId/historial
   */
  async obtenerHistorialEmpleado(req, res) {
    try {
      const { empleadoId } = req.params;
      const { historial, estadisticas } = await evaluacionesService.obtenerHistorialEmpleado(empleadoId);

      return ApiResponse.success(
        res,
        { historial, estadisticas },
        'Historial obtenido exitosamente'
      );
    } catch (error) {
      Logger.error('Error en EvaluacionesController.obtenerHistorialEmpleado:', error);
      return ApiResponse.internalError(res, ERROR_MESSAGES.INTERNAL_ERROR, error);
    }
  }

  // ===== METAS =====

  /**
   * GET /api/metas-empleado
   */
  async obtenerMetas(req, res) {
    try {
      const filtros = {
        empleado_id: req.query.empleado_id,
        periodo_id: req.query.periodo_id,
        estado: req.query.estado
      };

      const metas = await evaluacionesService.obtenerMetas(filtros);
      return ApiResponse.success(res, { metas }, 'Metas obtenidas exitosamente');
    } catch (error) {
      Logger.error('Error en EvaluacionesController.obtenerMetas:', error);
      return ApiResponse.internalError(res, ERROR_MESSAGES.INTERNAL_ERROR, error);
    }
  }

  /**
   * GET /api/metas-empleado/:id
   */
  async obtenerMetaPorId(req, res) {
    try {
      const { id } = req.params;
      const result = await evaluacionesService.obtenerMetaPorId(id);

      if (!result.found) {
        return ApiResponse.notFound(res, 'Meta no encontrada');
      }

      return ApiResponse.success(res, { meta: result.meta }, 'Meta obtenida exitosamente');
    } catch (error) {
      Logger.error('Error en EvaluacionesController.obtenerMetaPorId:', error);
      return ApiResponse.internalError(res, ERROR_MESSAGES.INTERNAL_ERROR, error);
    }
  }

  /**
   * POST /api/metas-empleado
   */
  async crearMeta(req, res) {
    try {
      const creadoPorId = req.user.id;
      const result = await evaluacionesService.crearMeta(req.body, creadoPorId);

      if (!result.success) {
        return ApiResponse.error(res, result.message);
      }

      return ApiResponse.created(res, { meta: result.meta }, 'Meta creada exitosamente');
    } catch (error) {
      Logger.error('Error en EvaluacionesController.crearMeta:', error);
      return ApiResponse.internalError(res, ERROR_MESSAGES.INTERNAL_ERROR, error);
    }
  }

  /**
   * PUT /api/metas-empleado/:id
   */
  async actualizarMeta(req, res) {
    try {
      const { id } = req.params;
      const result = await evaluacionesService.actualizarMeta(id, req.body);

      if (!result.success) {
        if (result.notFound) {
          return ApiResponse.notFound(res, 'Meta no encontrada');
        }
        return ApiResponse.error(res, result.message);
      }

      return ApiResponse.success(res, { meta: result.meta }, 'Meta actualizada exitosamente');
    } catch (error) {
      Logger.error('Error en EvaluacionesController.actualizarMeta:', error);
      return ApiResponse.internalError(res, ERROR_MESSAGES.INTERNAL_ERROR, error);
    }
  }

  /**
   * PATCH /api/metas-empleado/:id/estado
   */
  async cambiarEstadoMeta(req, res) {
    try {
      const { id } = req.params;
      const { estado, porcentaje_cumplimiento } = req.body;

      if (!estado) {
        return ApiResponse.error(res, 'El campo "estado" es requerido');
      }

      const result = await evaluacionesService.cambiarEstadoMeta(
        id,
        estado,
        porcentaje_cumplimiento || 0
      );

      if (!result.success) {
        if (result.notFound) {
          return ApiResponse.notFound(res, 'Meta no encontrada');
        }
        return ApiResponse.error(res, result.message);
      }

      return ApiResponse.success(res, { meta: result.meta }, 'Estado de meta actualizado exitosamente');
    } catch (error) {
      Logger.error('Error en EvaluacionesController.cambiarEstadoMeta:', error);
      return ApiResponse.internalError(res, ERROR_MESSAGES.INTERNAL_ERROR, error);
    }
  }

  /**
   * DELETE /api/metas-empleado/:id
   */
  async eliminarMeta(req, res) {
    try {
      const { id } = req.params;
      const result = await evaluacionesService.eliminarMeta(id);

      if (!result.success) {
        if (result.notFound) {
          return ApiResponse.notFound(res, 'Meta no encontrada');
        }
        return ApiResponse.error(res, result.message);
      }

      return ApiResponse.success(res, { meta: result.meta }, 'Meta eliminada exitosamente');
    } catch (error) {
      Logger.error('Error en EvaluacionesController.eliminarMeta:', error);
      return ApiResponse.internalError(res, ERROR_MESSAGES.INTERNAL_ERROR, error);
    }
  }

  /**
   * GET /api/metas-empleado/empleado/:empleadoId/periodo/:periodoId
   */
  async obtenerMetasEmpleadoPeriodo(req, res) {
    try {
      const { empleadoId, periodoId } = req.params;
      const { metas, resumen } = await evaluacionesService.obtenerMetasEmpleadoPeriodo(
        empleadoId,
        periodoId
      );

      return ApiResponse.success(
        res,
        { metas, resumen },
        'Metas del período obtenidas exitosamente'
      );
    } catch (error) {
      Logger.error('Error en EvaluacionesController.obtenerMetasEmpleadoPeriodo:', error);
      return ApiResponse.internalError(res, ERROR_MESSAGES.INTERNAL_ERROR, error);
    }
  }
}

export default new EvaluacionesController();

