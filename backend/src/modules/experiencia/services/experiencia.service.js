// src/modules/experiencia/services/experiencia.service.js
import pool from '../../../shared/config/database.js';
import Logger from '../../../shared/utils/logger.js';
import { deleteFile } from '../../../shared/utils/multer.js';

class ExperienciaService {
async crear(data, soporte) {
    try {
    const { empleado_id, empresa, cargo, tipoVinculacion, fechaInicio, fechaFin, funciones } = data;

    const result = await pool.query(
        `INSERT INTO experiencia (empleado_id, empresa, cargo, tipo_vinculacion, fecha_inicio, fecha_salida, funciones, soporte)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
        [empleado_id, empresa, cargo, tipoVinculacion, fechaInicio, fechaFin, funciones, soporte]
    );

    Logger.success(`Experiencia creada para empleado ID: ${empleado_id}`);
    return result.rows[0];
    } catch (error) {
    Logger.error('Error en ExperienciaService.crear:', error);
    throw error;
    }
}

async obtenerPorEmpleado(empleadoId) {
    try {
    const result = await pool.query(
        'SELECT * FROM experiencia WHERE empleado_id = $1 ORDER BY id DESC',
        [empleadoId]
    );
    return result.rows;
    } catch (error) {
    Logger.error('Error en ExperienciaService.obtenerPorEmpleado:', error);
    throw error;
    }
}

async obtenerTodos() {
    try {
      const result = await pool.query('SELECT * FROM experiencia ORDER BY id DESC');
    return result.rows;
    } catch (error) {
    Logger.error('Error en ExperienciaService.obtenerTodos:', error);
    throw error;
    }
}

async actualizar(id, data, soporte) {
    try {
    const { empleado_id, empresa, cargo, tipoVinculacion, fechaInicio, fechaFin, funciones } = data;

      // Obtener datos actuales
      const currentResult = await pool.query('SELECT * FROM experiencia WHERE id = $1', [id]);
    if (currentResult.rows.length === 0) {
        return null;
    }

    const current = currentResult.rows[0];

    const result = await pool.query(
        `UPDATE experiencia
        SET empleado_id = $1, empresa = $2, cargo = $3, tipo_vinculacion = $4,
            fecha_inicio = $5, fecha_salida = $6, funciones = $7, soporte = $8
         WHERE id = $9 RETURNING *`,
        [
        empleado_id,
        empresa || current.empresa,
        cargo || current.cargo,
        tipoVinculacion || current.tipo_vinculacion,
        fechaInicio || current.fecha_inicio,
        fechaFin || current.fecha_salida,
        funciones || current.funciones,
        soporte || current.soporte,
        id,
        ]
    );

      // Eliminar archivo anterior si se subió uno nuevo
    if (soporte && current.soporte && current.soporte !== soporte) {
        deleteFile(current.soporte);
    }

    Logger.success(`Experiencia actualizada ID: ${id}`);
    return result.rows[0];
    } catch (error) {
    Logger.error('Error en ExperienciaService.actualizar:', error);
    throw error;
    }
}
}

export default new ExperienciaService();
