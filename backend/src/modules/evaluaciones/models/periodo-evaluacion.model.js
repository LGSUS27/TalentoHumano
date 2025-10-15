// src/modules/evaluaciones/models/periodo-evaluacion.model.js
import pool from '../../../shared/config/database.js';
import Logger from '../../../shared/utils/logger.js';

/**
 * Modelo de Períodos de Evaluación
 * Maneja las operaciones de base de datos para períodos de evaluación
 */
class PeriodoEvaluacionModel {
  /**
   * Obtener todos los períodos de evaluación
   */
  async findAll(filtros = {}) {
    try {
      let query = 'SELECT * FROM periodos_evaluacion';
      const conditions = [];
      const values = [];
      let paramIndex = 1;

      // Filtro por activo
      if (filtros.activo !== undefined) {
        conditions.push(`activo = $${paramIndex}`);
        values.push(filtros.activo);
        paramIndex++;
      }

      // Filtro por tipo
      if (filtros.tipo) {
        conditions.push(`tipo = $${paramIndex}`);
        values.push(filtros.tipo);
        paramIndex++;
      }

      if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
      }

      query += ' ORDER BY fecha_inicio DESC';

      const result = await pool.query(query, values);
      return result.rows;
    } catch (error) {
      Logger.error('Error en PeriodoEvaluacionModel.findAll:', error);
      throw error;
    }
  }

  /**
   * Obtener período por ID
   */
  async findById(id) {
    try {
      const result = await pool.query(
        'SELECT * FROM periodos_evaluacion WHERE id = $1',
        [id]
      );
      return result.rows[0] || null;
    } catch (error) {
      Logger.error('Error en PeriodoEvaluacionModel.findById:', error);
      throw error;
    }
  }

  /**
   * Crear nuevo período de evaluación
   */
  async create(data) {
    try {
      const { nombre, tipo, fecha_inicio, fecha_fin, descripcion, activo } = data;

      const result = await pool.query(
        `INSERT INTO periodos_evaluacion
        (nombre, tipo, fecha_inicio, fecha_fin, descripcion, activo)
        VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [nombre, tipo, fecha_inicio, fecha_fin, descripcion, activo !== undefined ? activo : true]
      );

      return result.rows[0];
    } catch (error) {
      Logger.error('Error en PeriodoEvaluacionModel.create:', error);
      throw error;
    }
  }

  /**
   * Actualizar período de evaluación
   */
  async update(id, data) {
    try {
      const { nombre, tipo, fecha_inicio, fecha_fin, descripcion, activo } = data;

      const result = await pool.query(
        `UPDATE periodos_evaluacion
        SET nombre = $1, tipo = $2, fecha_inicio = $3, fecha_fin = $4,
            descripcion = $5, activo = $6, updated_at = CURRENT_TIMESTAMP
        WHERE id = $7
         RETURNING *`,
        [nombre, tipo, fecha_inicio, fecha_fin, descripcion, activo, id]
      );

      return result.rows[0] || null;
    } catch (error) {
      Logger.error('Error en PeriodoEvaluacionModel.update:', error);
      throw error;
    }
  }

  /**
   * Eliminar período de evaluación
   */
  async delete(id) {
    try {
      const result = await pool.query(
        'DELETE FROM periodos_evaluacion WHERE id = $1 RETURNING *',
        [id]
      );
      return result.rows[0] || null;
    } catch (error) {
      Logger.error('Error en PeriodoEvaluacionModel.delete:', error);
      throw error;
    }
  }

  /**
   * Activar/desactivar período
   */
  async cambiarEstado(id, activo) {
    try {
      const result = await pool.query(
        'UPDATE periodos_evaluacion SET activo = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
        [activo, id]
      );
      return result.rows[0] || null;
    } catch (error) {
      Logger.error('Error en PeriodoEvaluacionModel.cambiarEstado:', error);
      throw error;
    }
  }

  /**
   * Obtener período activo actual
   */
  async obtenerActivo() {
    try {
      const result = await pool.query(
        `SELECT * FROM periodos_evaluacion 
         WHERE activo = true 
         AND CURRENT_DATE BETWEEN fecha_inicio AND fecha_fin
         ORDER BY fecha_inicio DESC
         LIMIT 1`
      );
      return result.rows[0] || null;
    } catch (error) {
      Logger.error('Error en PeriodoEvaluacionModel.obtenerActivo:', error);
      throw error;
    }
  }

  /**
   * Verificar si hay traslape de fechas
   */
  async verificarTraslape(fecha_inicio, fecha_fin, excluirId = null) {
    try {
      let query = `
        SELECT * FROM periodos_evaluacion 
        WHERE (
          (fecha_inicio <= $1 AND fecha_fin >= $1) OR
          (fecha_inicio <= $2 AND fecha_fin >= $2) OR
          (fecha_inicio >= $1 AND fecha_fin <= $2)
        )
      `;
      const values = [fecha_inicio, fecha_fin];

      if (excluirId) {
        query += ' AND id != $3';
        values.push(excluirId);
      }

      const result = await pool.query(query, values);
      return result.rows.length > 0;
    } catch (error) {
      Logger.error('Error en PeriodoEvaluacionModel.verificarTraslape:', error);
      throw error;
    }
  }
}

export default new PeriodoEvaluacionModel();

