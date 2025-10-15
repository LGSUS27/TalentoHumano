// src/modules/formacion/services/formacion.service.js
import pool from '../../../shared/config/database.js';
import Logger from '../../../shared/utils/logger.js';
import { deleteFile } from '../../../shared/utils/multer.js';

class FormacionService {
async crear(data, archivo) {
    try {
    const { empleado_id, institucion, programa, tipo, nivel, graduado, fecha } = data;
    const graduadoBoolean = graduado === 'Sí';

    const result = await pool.query(
        `INSERT INTO formacion (empleado_id, institucion, programa, tipo, nivel, graduado, fecha, archivo)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *`,
        [empleado_id, institucion, programa, tipo, nivel, graduadoBoolean, fecha, archivo]
    );

    const formacion = {
        ...result.rows[0],
        graduado: result.rows[0].graduado ? 'Sí' : 'No',
    };

    Logger.success(`Formación creada para empleado ID: ${empleado_id}`);
    return formacion;
    } catch (error) {
    Logger.error('Error en FormacionService.crear:', error);
    throw error;
    }
}

async obtenerPorEmpleado(empleadoId) {
    try {
    const result = await pool.query(
        'SELECT * FROM formacion WHERE empleado_id = $1 ORDER BY id DESC',
        [empleadoId]
    );

    const formaciones = result.rows.map((f) => ({
        ...f,
        graduado: f.graduado ? 'Sí' : 'No',
    }));

    return formaciones;
    } catch (error) {
    Logger.error('Error en FormacionService.obtenerPorEmpleado:', error);
    throw error;
    }
}

async obtenerTodos() {
    try {
      const result = await pool.query('SELECT * FROM formacion ORDER BY id DESC');

    const formaciones = result.rows.map((f) => ({
        ...f,
        graduado: f.graduado ? 'Sí' : 'No',
    }));

    return formaciones;
    } catch (error) {
    Logger.error('Error en FormacionService.obtenerTodos:', error);
    throw error;
    }
}

async actualizar(id, data, archivo) {
    try {
    const { empleado_id, institucion, programa, tipo, nivel, graduado, fecha } = data;

      // Obtener datos actuales
      const currentResult = await pool.query('SELECT * FROM formacion WHERE id = $1', [id]);
    if (currentResult.rows.length === 0) {
        return null;
    }

    const current = currentResult.rows[0];
    const graduadoBoolean = (graduado || (current.graduado ? 'Sí' : 'No')) === 'Sí';

    const result = await pool.query(
        `UPDATE formacion
        SET empleado_id = $1, institucion = $2, programa = $3, tipo = $4, nivel = $5, 
            graduado = $6, fecha = $7, archivo = $8
         WHERE id = $9 RETURNING *`,
        [
        empleado_id,
        institucion || current.institucion,
        programa || current.programa,
        tipo || current.tipo,
        nivel || current.nivel,
        graduadoBoolean,
        fecha || current.fecha,
        archivo || current.archivo,
        id,
        ]
    );

      // Eliminar archivo anterior si se subió uno nuevo
    if (archivo && current.archivo && current.archivo !== archivo) {
        deleteFile(current.archivo);
    }

    const formacion = {
        ...result.rows[0],
        graduado: result.rows[0].graduado ? 'Sí' : 'No',
    };

    Logger.success(`Formación actualizada ID: ${id}`);
    return formacion;
    } catch (error) {
    Logger.error('Error en FormacionService.actualizar:', error);
    throw error;
    }
}
}

export default new FormacionService();
