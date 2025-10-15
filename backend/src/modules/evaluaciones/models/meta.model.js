// src/modules/evaluaciones/models/meta.model.js
import pool from '../../../shared/config/database.js';
import Logger from '../../../shared/utils/logger.js';

/**
 * Modelo de Metas de Empleados
 * Maneja las operaciones de base de datos para metas/objetivos
 */
class MetaModel {
  /**
   * Obtener todas las metas con información relacionada
   */
  async findAll(filtros = {}) {
    try {
      let query = `
        SELECT m.*,
              emp.nombre as empleado_nombre,
              emp.numeroIdentificacion as empleado_numero,
              emp.cargo as empleado_cargo,
              per.nombre as periodo_nombre,
              per.tipo as periodo_tipo,
              u.username as creado_por_nombre
        FROM metas_empleado m
        LEFT JOIN empleados emp ON m.empleado_id = emp.id
        LEFT JOIN periodos_evaluacion per ON m.periodo_id = per.id
        LEFT JOIN usuarios u ON m.creado_por = u.id
      `;

      const conditions = [];
      const values = [];
      let paramIndex = 1;

      // Filtro por empleado
      if (filtros.empleado_id) {
        conditions.push(`m.empleado_id = $${paramIndex}`);
        values.push(filtros.empleado_id);
        paramIndex++;
      }

      // Filtro por período
      if (filtros.periodo_id) {
        conditions.push(`m.periodo_id = $${paramIndex}`);
        values.push(filtros.periodo_id);
        paramIndex++;
      }

      // Filtro por estado
      if (filtros.estado) {
        conditions.push(`m.estado = $${paramIndex}`);
        values.push(filtros.estado);
        paramIndex++;
      }

      if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
      }

      query += ' ORDER BY m.fecha_limite ASC, m.created_at DESC';

      const result = await pool.query(query, values);
      return result.rows;
    } catch (error) {
      Logger.error('Error en MetaModel.findAll:', error);
      throw error;
    }
  }

  /**
   * Obtener meta por ID
   */
  async findById(id) {
    try {
      const result = await pool.query(
        `SELECT m.*,
                emp.nombre as empleado_nombre,
                emp.numeroIdentificacion as empleado_numero,
                emp.cargo as empleado_cargo,
                per.nombre as periodo_nombre,
                u.username as creado_por_nombre
        FROM metas_empleado m
        LEFT JOIN empleados emp ON m.empleado_id = emp.id
        LEFT JOIN periodos_evaluacion per ON m.periodo_id = per.id
        LEFT JOIN usuarios u ON m.creado_por = u.id
        WHERE m.id = $1`,
        [id]
      );
      return result.rows[0] || null;
    } catch (error) {
      Logger.error('Error en MetaModel.findById:', error);
      throw error;
    }
  }

  /**
   * Crear nueva meta
   */
  async create(data) {
    try {
      const {
        empleado_id,
        periodo_id,
        descripcion,
        peso_porcentaje,
        fecha_limite,
        estado,
        porcentaje_cumplimiento,
        observaciones,
        creado_por
      } = data;

      const result = await pool.query(
        `INSERT INTO metas_empleado
        (empleado_id, periodo_id, descripcion, peso_porcentaje, fecha_limite,
          estado, porcentaje_cumplimiento, observaciones, creado_por)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING *`,
        [
          empleado_id,
          periodo_id,
          descripcion,
          peso_porcentaje || 0,
          fecha_limite,
          estado || 'pendiente',
          porcentaje_cumplimiento || 0,
          observaciones,
          creado_por
        ]
      );

      return result.rows[0];
    } catch (error) {
      Logger.error('Error en MetaModel.create:', error);
      throw error;
    }
  }

  /**
   * Actualizar meta
   */
  async update(id, data) {
    try {
      const {
        descripcion,
        peso_porcentaje,
        fecha_limite,
        estado,
        porcentaje_cumplimiento,
        observaciones
      } = data;

      const result = await pool.query(
        `UPDATE metas_empleado
        SET descripcion = $1, peso_porcentaje = $2, fecha_limite = $3,
            estado = $4, porcentaje_cumplimiento = $5, observaciones = $6,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $7
         RETURNING *`,
        [descripcion, peso_porcentaje, fecha_limite, estado, porcentaje_cumplimiento, observaciones, id]
      );

      return result.rows[0] || null;
    } catch (error) {
      Logger.error('Error en MetaModel.update:', error);
      throw error;
    }
  }

  /**
   * Cambiar estado de la meta
   */
  async cambiarEstado(id, estado, porcentaje_cumplimiento) {
    try {
      const result = await pool.query(
        `UPDATE metas_empleado
        SET estado = $1, porcentaje_cumplimiento = $2, updated_at = CURRENT_TIMESTAMP
        WHERE id = $3
        RETURNING *`,
        [estado, porcentaje_cumplimiento, id]
      );
      return result.rows[0] || null;
    } catch (error) {
      Logger.error('Error en MetaModel.cambiarEstado:', error);
      throw error;
    }
  }

  /**
   * Eliminar meta
   */
  async delete(id) {
    try {
      const result = await pool.query(
        'DELETE FROM metas_empleado WHERE id = $1 RETURNING *',
        [id]
      );
      return result.rows[0] || null;
    } catch (error) {
      Logger.error('Error en MetaModel.delete:', error);
      throw error;
    }
  }

  /**
   * Obtener metas de un empleado por período
   */
  async obtenerPorEmpleadoYPeriodo(empleadoId, periodoId) {
    try {
      const result = await pool.query(
        `SELECT m.*, per.nombre as periodo_nombre
        FROM metas_empleado m
        LEFT JOIN periodos_evaluacion per ON m.periodo_id = per.id
        WHERE m.empleado_id = $1 AND m.periodo_id = $2
        ORDER BY m.fecha_limite ASC`,
        [empleadoId, periodoId]
      );
      return result.rows;
    } catch (error) {
      Logger.error('Error en MetaModel.obtenerPorEmpleadoYPeriodo:', error);
      throw error;
    }
  }

  /**
   * Calcular porcentaje de logro total de un empleado en un período
   */
  async calcularPorcentajeLogroTotal(empleadoId, periodoId) {
    try {
      const result = await pool.query(
        `SELECT
          SUM(peso_porcentaje * porcentaje_cumplimiento / 100) as logro_ponderado,
          SUM(peso_porcentaje) as peso_total,
          COUNT(*) as total_metas,
          COUNT(CASE WHEN estado = 'completada' THEN 1 END) as metas_completadas
        FROM metas_empleado
        WHERE empleado_id = $1 AND periodo_id = $2`,
        [empleadoId, periodoId]
      );

      const stats = result.rows[0];
      
      // Calcular porcentaje de logro final
      const porcentajeLogro = stats.peso_total > 0
        ? (stats.logro_ponderado / stats.peso_total) * 100
        : 0;

      return {
        porcentaje_logro: parseFloat(porcentajeLogro.toFixed(2)),
        total_metas: parseInt(stats.total_metas),
        metas_completadas: parseInt(stats.metas_completadas),
        peso_total: parseFloat(stats.peso_total)
      };
    } catch (error) {
      Logger.error('Error en MetaModel.calcularPorcentajeLogroTotal:', error);
      throw error;
    }
  }

  /**
   * Obtener resumen de metas por empleado
   */
  async obtenerResumenEmpleado(empleadoId) {
    try {
      const result = await pool.query(
        `SELECT
          COUNT(*) as total,
          COUNT(CASE WHEN estado = 'pendiente' THEN 1 END) as pendientes,
          COUNT(CASE WHEN estado = 'en_progreso' THEN 1 END) as en_progreso,
          COUNT(CASE WHEN estado = 'completada' THEN 1 END) as completadas,
          COUNT(CASE WHEN estado = 'no_cumplida' THEN 1 END) as no_cumplidas,
          AVG(porcentaje_cumplimiento) as promedio_cumplimiento
        FROM metas_empleado
        WHERE empleado_id = $1`,
        [empleadoId]
      );
      return result.rows[0];
    } catch (error) {
      Logger.error('Error en MetaModel.obtenerResumenEmpleado:', error);
      throw error;
    }
  }
}

export default new MetaModel();
