// src/modules/evaluaciones/models/evaluacion.model.js
import pool from '../../../shared/config/database.js';
import Logger from '../../../shared/utils/logger.js';

/**
 * Modelo de Evaluaciones de Desempeño
 * Maneja las operaciones de base de datos para evaluaciones
 */
class EvaluacionModel {
  /**
   * Obtener todas las evaluaciones con información del empleado
   */
  async findAll(filtros = {}) {
    try {
      let query = `
        SELECT e.*,
              emp.nombre as empleado_nombre,
              emp.numeroIdentificacion as empleado_numero,
              emp.cargo as empleado_cargo,
              per.nombre as periodo_nombre,
              per.tipo as periodo_tipo,
              u.username as evaluador_nombre
        FROM evaluaciones_desempeno e
        LEFT JOIN empleados emp ON e.empleado_id = emp.id
        LEFT JOIN periodos_evaluacion per ON e.periodo_id = per.id
        LEFT JOIN usuarios u ON e.evaluador_id = u.id
      `;

      const conditions = [];
      const values = [];
      let paramIndex = 1;

      // Filtro por empleado
      if (filtros.empleado_id) {
        conditions.push(`e.empleado_id = $${paramIndex}`);
        values.push(filtros.empleado_id);
        paramIndex++;
      }

      // Filtro por período
      if (filtros.periodo_id) {
        conditions.push(`e.periodo_id = $${paramIndex}`);
        values.push(filtros.periodo_id);
        paramIndex++;
      }

      // Filtro por estado
      if (filtros.estado) {
        conditions.push(`e.estado = $${paramIndex}`);
        values.push(filtros.estado);
        paramIndex++;
      }

      // Filtro por tipo de evaluación
      if (filtros.tipo_evaluacion) {
        conditions.push(`e.tipo_evaluacion = $${paramIndex}`);
        values.push(filtros.tipo_evaluacion);
        paramIndex++;
      }

      if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
      }

      query += ' ORDER BY e.fecha_evaluacion DESC, e.created_at DESC';

      const result = await pool.query(query, values);
      return result.rows;
    } catch (error) {
      Logger.error('Error en EvaluacionModel.findAll:', error);
      throw error;
    }
  }

  /**
   * Obtener evaluación por ID
   */
  async findById(id) {
    try {
      const result = await pool.query(
        `SELECT e.*,
                emp.nombre as empleado_nombre,
                emp.numeroIdentificacion as empleado_numero,
                emp.cargo as empleado_cargo,
                per.nombre as periodo_nombre,
                u.username as evaluador_nombre
        FROM evaluaciones_desempeno e
        LEFT JOIN empleados emp ON e.empleado_id = emp.id
        LEFT JOIN periodos_evaluacion per ON e.periodo_id = per.id
        LEFT JOIN usuarios u ON e.evaluador_id = u.id
        WHERE e.id = $1`,
        [id]
      );
      return result.rows[0] || null;
    } catch (error) {
      Logger.error('Error en EvaluacionModel.findById:', error);
      throw error;
    }
  }

  /**
   * Crear nueva evaluación
   */
  async create(data) {
    try {
      const {
        empleado_id,
        periodo_id,
        evaluador_id,
        tipo_evaluacion,
        fecha_evaluacion,
        calidad_trabajo,
        productividad,
        conocimiento_tecnico,
        trabajo_equipo,
        comunicacion,
        liderazgo,
        responsabilidad,
        iniciativa,
        porcentaje_logro,
        fortalezas,
        oportunidades_mejora,
        comentarios_generales,
        requiere_plan_mejora,
        plan_mejora,
        fecha_seguimiento,
        estado
      } = data;

      const result = await pool.query(
        `INSERT INTO evaluaciones_desempeno
        (empleado_id, periodo_id, evaluador_id, tipo_evaluacion, fecha_evaluacion,
          calidad_trabajo, productividad, conocimiento_tecnico, trabajo_equipo,
          comunicacion, liderazgo, responsabilidad, iniciativa, porcentaje_logro,
          fortalezas, oportunidades_mejora, comentarios_generales,
          requiere_plan_mejora, plan_mejora, fecha_seguimiento, estado)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)
         RETURNING *`,
        [
          empleado_id, periodo_id, evaluador_id, tipo_evaluacion || 'por competencias y habilidades funcionarios',
          fecha_evaluacion || new Date(),
          calidad_trabajo, productividad, conocimiento_tecnico, trabajo_equipo,
          comunicacion, liderazgo, responsabilidad, iniciativa,
          porcentaje_logro || 0,
          fortalezas, oportunidades_mejora, comentarios_generales,
          requiere_plan_mejora || false, plan_mejora, fecha_seguimiento,
          estado || 'completada'
        ]
      );

      return result.rows[0];
    } catch (error) {
      Logger.error('Error en EvaluacionModel.create:', error);
      throw error;
    }
  }

  /**
   * Actualizar evaluación
   */
  async update(id, data) {
    try {
      const {
        calidad_trabajo,
        productividad,
        conocimiento_tecnico,
        trabajo_equipo,
        comunicacion,
        liderazgo,
        responsabilidad,
        iniciativa,
        porcentaje_logro,
        fortalezas,
        oportunidades_mejora,
        comentarios_generales,
        requiere_plan_mejora,
        plan_mejora,
        fecha_seguimiento,
        estado
      } = data;

      const result = await pool.query(
        `UPDATE evaluaciones_desempeno 
         SET calidad_trabajo = $1, productividad = $2, conocimiento_tecnico = $3,
             trabajo_equipo = $4, comunicacion = $5, liderazgo = $6,
             responsabilidad = $7, iniciativa = $8, porcentaje_logro = $9,
             fortalezas = $10, oportunidades_mejora = $11, comentarios_generales = $12,
             requiere_plan_mejora = $13, plan_mejora = $14, fecha_seguimiento = $15,
             estado = $16, updated_at = CURRENT_TIMESTAMP
         WHERE id = $17 
         RETURNING *`,
        [
          calidad_trabajo, productividad, conocimiento_tecnico, trabajo_equipo,
          comunicacion, liderazgo, responsabilidad, iniciativa, porcentaje_logro,
          fortalezas, oportunidades_mejora, comentarios_generales,
          requiere_plan_mejora, plan_mejora, fecha_seguimiento, estado, id
        ]
      );

      return result.rows[0] || null;
    } catch (error) {
      Logger.error('Error en EvaluacionModel.update:', error);
      throw error;
    }
  }

  /**
   * Cambiar estado de la evaluación
   */
  async cambiarEstado(id, estado) {
    try {
      const result = await pool.query(
        'UPDATE evaluaciones_desempeno SET estado = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
        [estado, id]
      );
      return result.rows[0] || null;
    } catch (error) {
      Logger.error('Error en EvaluacionModel.cambiarEstado:', error);
      throw error;
    }
  }

  /**
   * Eliminar evaluación
   */
  async delete(id) {
    try {
      const result = await pool.query(
        'DELETE FROM evaluaciones_desempeno WHERE id = $1 RETURNING *',
        [id]
      );
      return result.rows[0] || null;
    } catch (error) {
      Logger.error('Error en EvaluacionModel.delete:', error);
      throw error;
    }
  }

  /**
   * Obtener historial de evaluaciones de un empleado
   */
  async obtenerHistorialEmpleado(empleadoId) {
    try {
      const result = await pool.query(
        `SELECT e.*, 
                per.nombre as periodo_nombre,
                per.tipo as periodo_tipo,
                per.fecha_inicio as periodo_inicio,
                per.fecha_fin as periodo_fin,
                u.username as evaluador_nombre
         FROM evaluaciones_desempeno e
         LEFT JOIN periodos_evaluacion per ON e.periodo_id = per.id
         LEFT JOIN usuarios u ON e.evaluador_id = u.id
         WHERE e.empleado_id = $1
         ORDER BY e.fecha_evaluacion DESC, e.created_at DESC`,
        [empleadoId]
      );
      return result.rows;
    } catch (error) {
      Logger.error('Error en EvaluacionModel.obtenerHistorialEmpleado:', error);
      throw error;
    }
  }

  /**
   * Obtener estadísticas de evaluaciones de un empleado
   */
  async obtenerEstadisticasEmpleado(empleadoId) {
    try {
      const result = await pool.query(
        `SELECT 
           COUNT(*) as total_evaluaciones,
           AVG(puntuacion_total) as promedio_general,
           MAX(puntuacion_total) as mejor_puntuacion,
           MIN(puntuacion_total) as peor_puntuacion,
           AVG(porcentaje_logro) as promedio_logro
         FROM evaluaciones_desempeno
         WHERE empleado_id = $1 AND estado = 'aprobada'`,
        [empleadoId]
      );
      return result.rows[0];
    } catch (error) {
      Logger.error('Error en EvaluacionModel.obtenerEstadisticasEmpleado:', error);
      throw error;
    }
  }

  /**
   * Verificar si ya existe una evaluación para empleado/período/tipo
   */
  async existeEvaluacion(empleadoId, periodoId, tipoEvaluacion) {
    try {
      const result = await pool.query(
        `SELECT id FROM evaluaciones_desempeno 
         WHERE empleado_id = $1 AND periodo_id = $2 AND tipo_evaluacion = $3`,
        [empleadoId, periodoId, tipoEvaluacion]
      );
      return result.rows.length > 0 ? result.rows[0] : null;
    } catch (error) {
      Logger.error('Error en EvaluacionModel.existeEvaluacion:', error);
      throw error;
    }
  }
}

export default new EvaluacionModel();

