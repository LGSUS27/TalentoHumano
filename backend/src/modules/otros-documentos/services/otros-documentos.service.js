// src/modules/otros-documentos/services/otros-documentos.service.js
import pool from '../../../shared/config/database.js';
import Logger from '../../../shared/utils/logger.js';
import { deleteFile } from '../../../shared/utils/multer.js';

// Campos de otros documentos
const FIELDS = [
'contrato',
'libreta_militar',
'antecedentes_disciplinarios',
'rut',
'rethus',
'arl',
'eps',
'afp',
'caja_compensacion',
'examen_ingreso',
'examen_periodico',
'examen_egreso',
'documentos_seleccion',
'tarjeta_profesional',
'intereses_conflictos_tfo029',
'carnet_vacunacion',
'poliza_responsabilidad_civil',
'certificado_cuenta_bancaria',
'contrato_vigente',
'contrato_liquidado',
];

const CONTRATOS_OTROSIS_FIELD = 'contratos_otrosis';

class OtrosDocumentosService {
async guardar(empleadoId, files) {
    try {
      // Construir mapa de archivos
    const filesMap = {};
    for (const field of FIELDS) {
        filesMap[field] = files?.[field]?.[0]?.filename ?? null;
    }

      // Manejar contratos Otrosis
    let contratosOtrosis = [];
    const contratosOtrosisFiles = files?.[CONTRATOS_OTROSIS_FIELD] || [];
    if (contratosOtrosisFiles.length > 0) {
        contratosOtrosis = contratosOtrosisFiles.map((file) => ({
        filename: file.filename,
        originalName: file.originalname,
        uploadDate: new Date().toISOString(),
        }));
    }

      // Validar que al menos hay un archivo
    const hasFiles = Object.values(filesMap).some(Boolean) || contratosOtrosis.length > 0;
    if (!hasFiles) {
        return { success: false, message: 'No se adjuntó ningún PDF' };
    }

      // Obtener archivos anteriores
    let oldFiles = {};
    let oldContratosOtrosis = [];
    const existingQuery = await pool.query(
        `SELECT ${FIELDS.join(', ')}, ${CONTRATOS_OTROSIS_FIELD} FROM otros_documentos WHERE empleado_id = $1`,
        [empleadoId]
    );

    if (existingQuery.rows.length > 0) {
        oldFiles = existingQuery.rows[0];
        oldContratosOtrosis = oldFiles[CONTRATOS_OTROSIS_FIELD] || [];
    }

      // UPSERT
    const cols = ['empleado_id', ...FIELDS, CONTRATOS_OTROSIS_FIELD];
    const placeholders = cols.map((_, i) => `$${i + 1}`).join(', ');
    const values = [empleadoId, ...FIELDS.map((n) => filesMap[n]), JSON.stringify(contratosOtrosis)];

    const setClause = [
        ...FIELDS.map((c) => `${c} = COALESCE(EXCLUDED.${c}, otros_documentos.${c})`),
        `${CONTRATOS_OTROSIS_FIELD} = CASE
        WHEN EXCLUDED.${CONTRATOS_OTROSIS_FIELD} = '[]'::jsonb THEN otros_documentos.${CONTRATOS_OTROSIS_FIELD}
        ELSE EXCLUDED.${CONTRATOS_OTROSIS_FIELD}
        END`,
    ].join(', ');

    const sql = `
        INSERT INTO otros_documentos (${cols.join(', ')})
        VALUES (${placeholders})
        ON CONFLICT (empleado_id)
        DO UPDATE SET ${setClause}
        RETURNING *;
    `;

    const { rows } = await pool.query(sql, values);

      // Eliminar archivos anteriores
    for (const field of FIELDS) {
        const newFile = filesMap[field];
        const oldFile = oldFiles[field];

        if (newFile && oldFile && oldFile !== newFile) {
        deleteFile(oldFile, 'otros-documentos');
        }
    }

      // Eliminar contratos Otrosis antiguos
    if (contratosOtrosis.length > 0 && oldContratosOtrosis.length > 0) {
        const newFilenames = contratosOtrosis.map((c) => c.filename);
        for (const oldContract of oldContratosOtrosis) {
        if (!newFilenames.includes(oldContract.filename)) {
            deleteFile(oldContract.filename, 'otros-documentos');
        }
        }
    }

    Logger.success(`Documentos guardados para empleado ID: ${empleadoId}`);
    return { success: true, data: rows[0] };
    } catch (error) {
    Logger.error('Error en OtrosDocumentosService.guardar:', error);
    throw error;
    }
}

async obtenerPorEmpleado(empleadoId) {
    try {
    const { rows } = await pool.query(
        'SELECT * FROM otros_documentos WHERE empleado_id = $1 LIMIT 1',
        [empleadoId]
    );
    return rows[0] ?? null;
    } catch (error) {
    Logger.error('Error en OtrosDocumentosService.obtenerPorEmpleado:', error);
    throw error;
    }
}

async eliminarCampo(empleadoId, campo) {
    try {
    if (!FIELDS.includes(campo)) {
        return { success: false, message: 'Campo inválido' };
    }

    const { rows } = await pool.query(
        `SELECT ${campo} FROM otros_documentos WHERE empleado_id = $1`,
        [empleadoId]
    );

    const filename = rows?.[0]?.[campo] ?? null;
    if (!filename) {
        return { success: true, message: 'Nada que eliminar' };
    }

    await pool.query(
        `UPDATE otros_documentos SET ${campo} = NULL WHERE empleado_id = $1`,
        [empleadoId]
    );

    deleteFile(filename, 'otros-documentos');

    Logger.success(`Campo ${campo} eliminado para empleado ID: ${empleadoId}`);
    return { success: true };
    } catch (error) {
    Logger.error('Error en OtrosDocumentosService.eliminarCampo:', error);
    throw error;
    }
}

async eliminarContratoOtrosis(empleadoId, filename) {
    try {
    const { rows } = await pool.query(
        `SELECT ${CONTRATOS_OTROSIS_FIELD} FROM otros_documentos WHERE empleado_id = $1`,
        [empleadoId]
    );

    const contratosOtrosis = rows?.[0]?.[CONTRATOS_OTROSIS_FIELD] || [];

    const contratosActualizados = contratosOtrosis.filter((contrato) => contrato.filename !== filename);

    if (contratosActualizados.length === contratosOtrosis.length) {
        return { success: true, message: 'Contrato no encontrado' };
    }

    await pool.query(
        `UPDATE otros_documentos SET ${CONTRATOS_OTROSIS_FIELD} = $1 WHERE empleado_id = $2`,
        [JSON.stringify(contratosActualizados), empleadoId]
    );

    deleteFile(filename, 'otros-documentos');

    Logger.success(`Contrato Otrosis eliminado para empleado ID: ${empleadoId}`);
    return { success: true };
    } catch (error) {
    Logger.error('Error en OtrosDocumentosService.eliminarContratoOtrosis:', error);
    throw error;
    }
}
}

export default new OtrosDocumentosService();
