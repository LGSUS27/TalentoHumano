// src/modules/evaluaciones/services/evaluaciones.service.js
import periodoModel from '../models/periodo-evaluacion.model.js';
import evaluacionModel from '../models/evaluacion.model.js';
import metaModel from '../models/meta.model.js';
import Logger from '../../../shared/utils/logger.js';

/**
 * Servicio de Evaluaciones de Desempeño
 * Lógica de negocio para evaluaciones, períodos y metas
 */
class EvaluacionesService {
  // ===== PERÍODOS DE EVALUACIÓN =====

  /**
   * Obtener todos los períodos
   */
  async obtenerPeriodos(filtros = {}) {
    try {
      const periodos = await periodoModel.findAll(filtros);
      Logger.debug(`Se obtuvieron ${periodos.length} períodos de evaluación`);
      return periodos;
    } catch (error) {
      Logger.error('Error en EvaluacionesService.obtenerPeriodos:', error);
      throw error;
    }
  }

  /**
   * Obtener período por ID
   */
  async obtenerPeriodoPorId(id) {
    try {
      const periodo = await periodoModel.findById(id);
      if (!periodo) {
        return { found: false };
      }
      return { found: true, periodo };
    } catch (error) {
      Logger.error('Error en EvaluacionesService.obtenerPeriodoPorId:', error);
      throw error;
    }
  }

  /**
   * Crear nuevo período
   */
  async crearPeriodo(data) {
    try {
      // Validar fechas
      const fechaInicio = new Date(data.fecha_inicio);
      const fechaFin = new Date(data.fecha_fin);

      if (fechaFin <= fechaInicio) {
        return {
          success: false,
          message: 'La fecha de fin debe ser posterior a la fecha de inicio'
        };
      }

      // Verificar traslape de fechas (opcional, puede desactivarse si se permite)
      const hayTraslape = await periodoModel.verificarTraslape(
        data.fecha_inicio,
        data.fecha_fin
      );

      if (hayTraslape) {
        Logger.warn('Intento de crear período con fechas traslapadas');
        return {
          success: false,
          message: 'Ya existe un período con fechas que se traslapan con las especificadas'
        };
      }

      const periodo = await periodoModel.create(data);
      Logger.success(`Período creado: ${periodo.nombre} (ID: ${periodo.id})`);
      
      return { success: true, periodo };
    } catch (error) {
      Logger.error('Error en EvaluacionesService.crearPeriodo:', error);
      throw error;
    }
  }

  /**
   * Actualizar período
   */
  async actualizarPeriodo(id, data) {
    try {
      const periodoExistente = await periodoModel.findById(id);
      if (!periodoExistente) {
        return { success: false, notFound: true };
      }

      // Validar fechas
      const fechaInicio = new Date(data.fecha_inicio);
      const fechaFin = new Date(data.fecha_fin);

      if (fechaFin <= fechaInicio) {
        return {
          success: false,
          message: 'La fecha de fin debe ser posterior a la fecha de inicio'
        };
      }

      // Verificar traslape excluyendo el período actual
      const hayTraslape = await periodoModel.verificarTraslape(
        data.fecha_inicio,
        data.fecha_fin,
        id
      );

      if (hayTraslape) {
        return {
          success: false,
          message: 'Las fechas se traslapan con otro período existente'
        };
      }

      const periodo = await periodoModel.update(id, data);
      Logger.success(`Período actualizado: ${periodo.nombre} (ID: ${periodo.id})`);
      
      return { success: true, periodo };
    } catch (error) {
      Logger.error('Error en EvaluacionesService.actualizarPeriodo:', error);
      throw error;
    }
  }

  /**
   * Eliminar período
   */
  async eliminarPeriodo(id) {
    try {
      const periodo = await periodoModel.findById(id);
      if (!periodo) {
        return { success: false, notFound: true };
      }

      await periodoModel.delete(id);
      Logger.success(`Período eliminado: ${periodo.nombre} (ID: ${id})`);
      
      return { success: true, periodo };
    } catch (error) {
      Logger.error('Error en EvaluacionesService.eliminarPeriodo:', error);
      throw error;
    }
  }

  /**
   * Activar/desactivar período
   */
  async cambiarEstadoPeriodo(id, activo) {
    try {
      const periodo = await periodoModel.findById(id);
      if (!periodo) {
        return { success: false, notFound: true };
      }

      const periodoActualizado = await periodoModel.cambiarEstado(id, activo);
      Logger.success(
        `Período ${activo ? 'activado' : 'desactivado'}: ${periodoActualizado.nombre}`
      );
      
      return { success: true, periodo: periodoActualizado };
    } catch (error) {
      Logger.error('Error en EvaluacionesService.cambiarEstadoPeriodo:', error);
      throw error;
    }
  }

  // ===== EVALUACIONES =====

  /**
   * Obtener todas las evaluaciones
   */
  async obtenerEvaluaciones(filtros = {}) {
    try {
      const evaluaciones = await evaluacionModel.findAll(filtros);
      Logger.debug(`Se obtuvieron ${evaluaciones.length} evaluaciones`);
      return evaluaciones;
    } catch (error) {
      Logger.error('Error en EvaluacionesService.obtenerEvaluaciones:', error);
      throw error;
    }
  }

  /**
   * Obtener evaluación por ID
   */
  async obtenerEvaluacionPorId(id) {
    try {
      const evaluacion = await evaluacionModel.findById(id);
      if (!evaluacion) {
        return { found: false };
      }
      return { found: true, evaluacion };
    } catch (error) {
      Logger.error('Error en EvaluacionesService.obtenerEvaluacionPorId:', error);
      throw error;
    }
  }

  /**
   * Crear nueva evaluación
   */
  async crearEvaluacion(data, evaluadorId) {
    try {
      // Validar puntuaciones
      const categorias = [
        'calidad_trabajo', 'productividad', 'conocimiento_tecnico',
        'trabajo_equipo', 'comunicacion', 'liderazgo',
        'responsabilidad', 'iniciativa'
      ];

      for (const categoria of categorias) {
        const valor = data[categoria];
        if (valor !== undefined && valor !== null) {
          if (valor < 1 || valor > 5) {
            return {
              success: false,
              message: `La puntuación de ${categoria} debe estar entre 1 y 5`
            };
          }
        }
      }

      // Verificar si ya existe evaluación para este empleado/período/tipo
      if (data.periodo_id) {
        const existe = await evaluacionModel.existeEvaluacion(
          data.empleado_id,
          data.periodo_id,
          data.tipo_evaluacion || ''
        );

        if (existe) {
          return {
            success: false,
            message: 'Ya existe una evaluación de este tipo para el empleado en este período',
            evaluacionExistente: existe
          };
        }
      }

      // Agregar evaluador_id
      data.evaluador_id = evaluadorId;

      const evaluacion = await evaluacionModel.create(data);
      Logger.success(
        `Evaluación creada para empleado ${data.empleado_id} (ID: ${evaluacion.id})`
      );
      
      return { success: true, evaluacion };
    } catch (error) {
      // Manejar error de duplicado
      if (error.code === '23505') {
        return {
          success: false,
          message: 'Ya existe una evaluación de este tipo para el empleado en este período'
        };
      }

      Logger.error('Error en EvaluacionesService.crearEvaluacion:', error);
      throw error;
    }
  }

  /**
   * Actualizar evaluación
   */
  async actualizarEvaluacion(id, data) {
    try {
      const evaluacionExistente = await evaluacionModel.findById(id);
      if (!evaluacionExistente) {
        return { success: false, notFound: true };
      }

      // Validar puntuaciones
      const categorias = [
        'calidad_trabajo', 'productividad', 'conocimiento_tecnico',
        'trabajo_equipo', 'comunicacion', 'liderazgo',
        'responsabilidad', 'iniciativa'
      ];

      for (const categoria of categorias) {
        const valor = data[categoria];
        if (valor !== undefined && valor !== null) {
          if (valor < 1 || valor > 5) {
            return {
              success: false,
              message: `La puntuación de ${categoria} debe estar entre 1 y 5`
            };
          }
        }
      }

      const evaluacion = await evaluacionModel.update(id, data);
      Logger.success(`Evaluación actualizada (ID: ${id})`);
      
      return { success: true, evaluacion };
    } catch (error) {
      Logger.error('Error en EvaluacionesService.actualizarEvaluacion:', error);
      throw error;
    }
  }

  /**
   * Aprobar evaluación
   */
  async aprobarEvaluacion(id) {
    try {
      const evaluacion = await evaluacionModel.findById(id);
      if (!evaluacion) {
        return { success: false, notFound: true };
      }

      const evaluacionAprobada = await evaluacionModel.cambiarEstado(id, 'aprobada');
      Logger.success(`Evaluación aprobada (ID: ${id})`);
      
      return { success: true, evaluacion: evaluacionAprobada };
    } catch (error) {
      Logger.error('Error en EvaluacionesService.aprobarEvaluacion:', error);
      throw error;
    }
  }

  /**
   * Eliminar evaluación
   */
  async eliminarEvaluacion(id) {
    try {
      const evaluacion = await evaluacionModel.findById(id);
      if (!evaluacion) {
        return { success: false, notFound: true };
      }

      await evaluacionModel.delete(id);
      Logger.success(`Evaluación eliminada (ID: ${id})`);
      
      return { success: true, evaluacion };
    } catch (error) {
      Logger.error('Error en EvaluacionesService.eliminarEvaluacion:', error);
      throw error;
    }
  }

  /**
   * Obtener historial de evaluaciones de un empleado
   */
  async obtenerHistorialEmpleado(empleadoId) {
    try {
      const historial = await evaluacionModel.obtenerHistorialEmpleado(empleadoId);
      const estadisticas = await evaluacionModel.obtenerEstadisticasEmpleado(empleadoId);
      
      return {
        historial,
        estadisticas
      };
    } catch (error) {
      Logger.error('Error en EvaluacionesService.obtenerHistorialEmpleado:', error);
      throw error;
    }
  }

  // ===== METAS =====

  /**
   * Obtener todas las metas
   */
  async obtenerMetas(filtros = {}) {
    try {
      const metas = await metaModel.findAll(filtros);
      Logger.debug(`Se obtuvieron ${metas.length} metas`);
      return metas;
    } catch (error) {
      Logger.error('Error en EvaluacionesService.obtenerMetas:', error);
      throw error;
    }
  }

  /**
   * Obtener meta por ID
   */
  async obtenerMetaPorId(id) {
    try {
      const meta = await metaModel.findById(id);
      if (!meta) {
        return { found: false };
      }
      return { found: true, meta };
    } catch (error) {
      Logger.error('Error en EvaluacionesService.obtenerMetaPorId:', error);
      throw error;
    }
  }

  /**
   * Crear nueva meta
   */
  async crearMeta(data, creadoPorId) {
    try {
      // Validar peso porcentaje
      if (data.peso_porcentaje && (data.peso_porcentaje < 0 || data.peso_porcentaje > 100)) {
        return {
          success: false,
          message: 'El peso porcentaje debe estar entre 0 y 100'
        };
      }

      data.creado_por = creadoPorId;

      const meta = await metaModel.create(data);
      Logger.success(`Meta creada para empleado ${data.empleado_id} (ID: ${meta.id})`);
      
      return { success: true, meta };
    } catch (error) {
      Logger.error('Error en EvaluacionesService.crearMeta:', error);
      throw error;
    }
  }

  /**
   * Actualizar meta
   */
  async actualizarMeta(id, data) {
    try {
      const metaExistente = await metaModel.findById(id);
      if (!metaExistente) {
        return { success: false, notFound: true };
      }

      // Validar peso porcentaje
      if (data.peso_porcentaje && (data.peso_porcentaje < 0 || data.peso_porcentaje > 100)) {
        return {
          success: false,
          message: 'El peso porcentaje debe estar entre 0 y 100'
        };
      }

      // Validar porcentaje de cumplimiento
      if (data.porcentaje_cumplimiento && (data.porcentaje_cumplimiento < 0 || data.porcentaje_cumplimiento > 100)) {
        return {
          success: false,
          message: 'El porcentaje de cumplimiento debe estar entre 0 y 100'
        };
      }

      const meta = await metaModel.update(id, data);
      Logger.success(`Meta actualizada (ID: ${id})`);
      
      return { success: true, meta };
    } catch (error) {
      Logger.error('Error en EvaluacionesService.actualizarMeta:', error);
      throw error;
    }
  }

  /**
   * Cambiar estado de meta
   */
  async cambiarEstadoMeta(id, estado, porcentaje_cumplimiento) {
    try {
      const meta = await metaModel.findById(id);
      if (!meta) {
        return { success: false, notFound: true };
      }

      const metaActualizada = await metaModel.cambiarEstado(
        id,
        estado,
        porcentaje_cumplimiento
      );
      Logger.success(`Estado de meta actualizado (ID: ${id}): ${estado}`);
      
      return { success: true, meta: metaActualizada };
    } catch (error) {
      Logger.error('Error en EvaluacionesService.cambiarEstadoMeta:', error);
      throw error;
    }
  }

  /**
   * Eliminar meta
   */
  async eliminarMeta(id) {
    try {
      const meta = await metaModel.findById(id);
      if (!meta) {
        return { success: false, notFound: true };
      }

      await metaModel.delete(id);
      Logger.success(`Meta eliminada (ID: ${id})`);
      
      return { success: true, meta };
    } catch (error) {
      Logger.error('Error en EvaluacionesService.eliminarMeta:', error);
      throw error;
    }
  }

  /**
   * Obtener metas de un empleado por período
   */
  async obtenerMetasEmpleadoPeriodo(empleadoId, periodoId) {
    try {
      const metas = await metaModel.obtenerPorEmpleadoYPeriodo(empleadoId, periodoId);
      const porcentajeLogro = await metaModel.calcularPorcentajeLogroTotal(
        empleadoId,
        periodoId
      );
      
      return {
        metas,
        resumen: porcentajeLogro
      };
    } catch (error) {
      Logger.error('Error en EvaluacionesService.obtenerMetasEmpleadoPeriodo:', error);
      throw error;
    }
  }

  /**
   * Calcular y actualizar porcentaje de logro en evaluación
   */
  async actualizarPorcentajeLogroEvaluacion(empleadoId, periodoId, evaluacionId) {
    try {
      const { porcentaje_logro } = await metaModel.calcularPorcentajeLogroTotal(
        empleadoId,
        periodoId
      );

      await evaluacionModel.update(evaluacionId, { porcentaje_logro });
      
      Logger.success(
        `Porcentaje de logro actualizado en evaluación ${evaluacionId}: ${porcentaje_logro}%`
      );
      
      return { success: true, porcentaje_logro };
    } catch (error) {
      Logger.error('Error en EvaluacionesService.actualizarPorcentajeLogroEvaluacion:', error);
      throw error;
    }
  }
}

export default new EvaluacionesService();

