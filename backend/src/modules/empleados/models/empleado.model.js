// src/modules/empleados/models/empleado.model.js
import pool from '../../../shared/config/database.js';
import Logger from '../../../shared/utils/logger.js';

/**
 * Modelo de Empleado
 * Interacción directa con la base de datos para la tabla empleados
 */
class EmpleadoModel {
/**
   * Obtener todos los empleados
   */
async findAll() {
    try {
    const result = await pool.query(
        'SELECT * FROM empleados ORDER BY created_at DESC'
    );
    return result.rows;
    } catch (error) {
    Logger.error('Error en EmpleadoModel.findAll:', error);
    throw error;
    }
}

/**
   * Obtener empleado por ID
   */
async findById(id) {
    try {
    const result = await pool.query(
        'SELECT * FROM empleados WHERE id = $1',
        [id]
    );
    return result.rows[0] || null;
    } catch (error) {
    Logger.error('Error en EmpleadoModel.findById:', error);
    throw error;
    }
}

/**
   * Obtener empleado por número de identificación
   */
async findByNumeroIdentificacion(numeroIdentificacion) {
    try {
    const result = await pool.query(
        'SELECT * FROM empleados WHERE numeroIdentificacion = $1',
        [numeroIdentificacion]
    );
    return result.rows[0] || null;
    } catch (error) {
    Logger.error('Error en EmpleadoModel.findByNumeroIdentificacion:', error);
    throw error;
    }
}

/**
   * Crear nuevo empleado
   */
async create(empleadoData) {
    try {
    const result = await pool.query(
        `INSERT INTO empleados (
        nombre, numeroIdentificacion, contrato, fecha_inicio, fecha_fin, 
        sueldo, tipo_contrato, cargo, estado
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'activo')
        RETURNING *`,
        [
        empleadoData.nombre,
        empleadoData.numeroIdentificacion,
        empleadoData.contrato,
        empleadoData.fecha_inicio,
        empleadoData.fecha_fin,
        empleadoData.sueldo,
        empleadoData.tipo_contrato,
        empleadoData.cargo,
        ]
    );
    return result.rows[0];
    } catch (error) {
    Logger.error('Error en EmpleadoModel.create:', error);
    throw error;
    }
}

/**
   * Actualizar empleado
   */
async update(id, empleadoData) {
    try {
    const result = await pool.query(
        `UPDATE empleados
        SET nombre = $1, numeroIdentificacion = $2, contrato = $3, 
            fecha_inicio = $4, fecha_fin = $5, sueldo = $6, 
            tipo_contrato = $7, cargo = $8
        WHERE id = $9
        RETURNING *`,
        [
        empleadoData.nombre,
        empleadoData.numeroIdentificacion,
        empleadoData.contrato,
        empleadoData.fecha_inicio,
        empleadoData.fecha_fin,
        empleadoData.sueldo,
        empleadoData.tipo_contrato,
        empleadoData.cargo,
        id,
        ]
    );
    return result.rows[0] || null;
    } catch (error) {
    Logger.error('Error en EmpleadoModel.update:', error);
    throw error;
    }
}

/**
   * Eliminar empleado
   */
async delete(id) {
    try {
    const result = await pool.query(
        'DELETE FROM empleados WHERE id = $1 RETURNING *',
        [id]
    );
    return result.rows[0] || null;
    } catch (error) {
    Logger.error('Error en EmpleadoModel.delete:', error);
    throw error;
    }
}

/**
   * Cambiar estado del empleado
   */
async updateEstado(id, estado) {
    try {
    const result = await pool.query(
        'UPDATE empleados SET estado = $1 WHERE id = $2 RETURNING *',
        [estado, id]
    );
    return result.rows[0] || null;
    } catch (error) {
    Logger.error('Error en EmpleadoModel.updateEstado:', error);
    throw error;
    }
}

/**
   * Crear registro básico en información personal
   */
async createInformacionPersonalBasica(empleadoId, numeroIdentificacion) {
    try {
    await pool.query(
        `INSERT INTO informacion_personal (empleado_id, numero_identificacion)
        VALUES ($1, $2)`,
        [empleadoId, numeroIdentificacion]
    );
    } catch (error) {
    Logger.error('Error en EmpleadoModel.createInformacionPersonalBasica:', error);
    throw error;
    }
}

/**
   * Obtener todos los archivos asociados a un empleado
   * Retorna un objeto con arrays de archivos categorizados
   */
async getAllFilesForEmpleado(empleadoId) {
    try {
    const files = {
        informacionPersonal: [],
        formacion: [],
        experiencia: [],
        otrosDocumentos: []
    };

    // Archivos de información personal
    const infoPersResult = await pool.query(
        `SELECT documento_pdf, imagen_personal
        FROM informacion_personal
        WHERE empleado_id = $1`,
        [empleadoId]
    );
    
    if (infoPersResult.rows.length > 0) {
        const row = infoPersResult.rows[0];
        if (row.documento_pdf) files.informacionPersonal.push({ file: row.documento_pdf, subFolder: '' });
        if (row.imagen_personal) files.informacionPersonal.push({ file: row.imagen_personal, subFolder: '' });
    }

    // Archivos de formación
    const formacionResult = await pool.query(
        `SELECT archivo FROM formacion WHERE empleado_id = $1 AND archivo IS NOT NULL`,
        [empleadoId]
    );
    formacionResult.rows.forEach(row => {
        files.formacion.push({ file: row.archivo, subFolder: '' });
    });

    // Archivos de experiencia
    const experienciaResult = await pool.query(
        `SELECT soporte FROM experiencia WHERE empleado_id = $1 AND soporte IS NOT NULL`,
        [empleadoId]
    );
    experienciaResult.rows.forEach(row => {
        files.experiencia.push({ file: row.soporte, subFolder: '' });
    });

    // Archivos de otros documentos
    const otrosDocsResult = await pool.query(
        `SELECT contrato, libreta_militar, antecedentes_disciplinarios, rut, rethus,
                arl, eps, afp, caja_compensacion, examen_ingreso, examen_periodico,
                examen_egreso, documentos_seleccion, contratos_otrosis
        FROM otros_documentos
        WHERE empleado_id = $1`,
        [empleadoId]
    );

    if (otrosDocsResult.rows.length > 0) {
        const row = otrosDocsResult.rows[0];
        const campos = [
        'contrato', 'libreta_militar', 'antecedentes_disciplinarios', 'rut', 'rethus',
        'arl', 'eps', 'afp', 'caja_compensacion', 'examen_ingreso', 'examen_periodico',
        'examen_egreso', 'documentos_seleccion'
        ];
        
        campos.forEach(campo => {
        if (row[campo]) {
            files.otrosDocumentos.push({ file: row[campo], subFolder: 'otros-documentos' });
        }
        });

        // Manejar contratos_otrosis (array JSON)
        if (row.contratos_otrosis) {
        try {
            const contratos = typeof row.contratos_otrosis === 'string'
            ? JSON.parse(row.contratos_otrosis)
            : row.contratos_otrosis;
            
            if (Array.isArray(contratos)) {
            contratos.forEach(contrato => {
                if (contrato.filename) {
                files.otrosDocumentos.push({
                    file: contrato.filename,
                    subFolder: 'otros-documentos'
                });
                }
            });
            }
        } catch (e) {
            Logger.warn(`Error al parsear contratos_otrosis para empleado ${empleadoId}:`, e);
        }
        }
    }

    return files;
    } catch (error) {
    Logger.error('Error en EmpleadoModel.getAllFilesForEmpleado:', error);
    throw error;
    }
}
}

export default new EmpleadoModel();
