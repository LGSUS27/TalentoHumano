// src/modules/informacion-personal/services/informacion-personal.service.js
import pool from '../../../shared/config/database.js';
import Logger from '../../../shared/utils/logger.js';
import { deleteFile } from '../../../shared/utils/multer.js';

/**
 * Servicio de información personal
 */
class InformacionPersonalService {
/**
   * Validar datos de información personal
   */
validate(data) {
    const errors = {};

    // Validaciones de campos requeridos
    if (!data.tipoDocumento) errors.tipoDocumento = 'El tipo de documento es requerido';
    if (!data.numeroIdentificacion) errors.numeroIdentificacion = 'El número de identificación es requerido';
    if (!data.fechaExpedicion) errors.fechaExpedicion = 'La fecha de expedición es requerida';
    if (!data.nombres) errors.nombres = 'Los nombres son requeridos';
    if (!data.apellidos) errors.apellidos = 'Los apellidos son requeridos';
    if (!data.genero || data.genero === 'Seleccionar género...') errors.genero = 'El género es requerido';
    if (!data.fechaNacimiento) errors.fechaNacimiento = 'La fecha de nacimiento es requerida';
    if (!data.departamentoNacimiento) errors.departamentoNacimiento = 'El departamento de nacimiento es requerido';
    if (!data.ciudadNacimiento) errors.ciudadNacimiento = 'La ciudad de nacimiento es requerida';
    if (data.rh === 'Seleccionar RH...') errors.rh = 'El RH no es válido';

    // Validar número de identificación
    const cedulaRegex = /^\d{6,12}$/;
    if (data.numeroIdentificacion && !cedulaRegex.test(data.numeroIdentificacion)) {
    errors.numeroIdentificacion = 'El número de identificación debe contener solo números (6-12 dígitos)';
    }

    // Validar nombres
    const nombresRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
    if (data.nombres && !nombresRegex.test(data.nombres)) {
    errors.nombres = 'Los nombres solo pueden contener letras y espacios';
    }

    // Validar apellidos
    if (data.apellidos && !nombresRegex.test(data.apellidos)) {
    errors.apellidos = 'Los apellidos solo pueden contener letras y espacios';
    }

    // Validar email
    if (data.email && data.email.trim() !== '') {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(data.email)) {
        errors.email = 'El formato del email no es válido';
    }
    }

    // Validar teléfono
    if (data.telefono && data.telefono.trim() !== '') {
    const telefonoRegex = /^\d{7,15}$/;
    if (!telefonoRegex.test(data.telefono)) {
        errors.telefono = 'El teléfono debe contener solo números (7-15 dígitos)';
    }
    }

    // Validar fechas
    const fechaExpedicion = new Date(data.fechaExpedicion);
    const fechaNacimiento = new Date(data.fechaNacimiento);
    const hoy = new Date();

    if (fechaExpedicion > hoy) {
    errors.fechaExpedicion = 'La fecha de expedición no puede ser futura';
    }

    if (fechaNacimiento > hoy) {
    errors.fechaNacimiento = 'La fecha de nacimiento no puede ser futura';
    }

    if (fechaNacimiento > fechaExpedicion) {
    errors.fechaNacimiento = 'La fecha de nacimiento no puede ser posterior a la fecha de expedición';
    }

    return {
    isValid: Object.keys(errors).length === 0,
    errors,
    };
}

/**
   * Guardar información personal (crear o actualizar)
   */
async guardar(data, files) {
    try {
    const { empleado_id } = data;
    const documentoPdf = files?.documentoPdf?.[0]?.filename || null;
    const imagenPersonal = files?.imagenPersonal?.[0]?.filename || null;

      // Validar datos
    const validation = this.validate(data);
    if (!validation.isValid) {
        return { success: false, errors: validation.errors };
    }

      // Verificar si ya existe información personal
    const existingQuery = await pool.query(
        'SELECT id, documento_pdf, imagen_personal FROM informacion_personal WHERE empleado_id = $1',
        [empleado_id]
    );

    let result;
    let oldFiles = {};

    if (existingQuery.rows.length > 0) {
        // Actualizar
        oldFiles = existingQuery.rows[0];
        
        result = await pool.query(
        `UPDATE informacion_personal SET
            tipo_documento = $1,
            numero_identificacion = $2,
            fecha_expedicion = $3,
            documento_pdf = COALESCE($4, documento_pdf),
            imagen_personal = COALESCE($5, imagen_personal),
            nombres = $6,
            apellidos = $7,
            genero = $8,
            fecha_nacimiento = $9,
            departamento_nacimiento = $10,
            ciudad_nacimiento = $11,
            email = $12,
            direccion = $13,
            telefono = $14,
            rh = $15
        WHERE empleado_id = $16
          RETURNING *`,
        [
            data.tipoDocumento,
            data.numeroIdentificacion,
            data.fechaExpedicion,
            documentoPdf,
            imagenPersonal,
            data.nombres,
            data.apellidos,
            data.genero,
            data.fechaNacimiento,
            data.departamentoNacimiento,
            data.ciudadNacimiento,
            data.email || null,
            data.direccion || null,
            data.telefono || null,
            data.rh || null,
            empleado_id,
        ]
        );

        // Eliminar archivos anteriores si se subieron nuevos
        if (documentoPdf && oldFiles.documento_pdf && oldFiles.documento_pdf !== documentoPdf) {
        deleteFile(oldFiles.documento_pdf);
        }
        if (imagenPersonal && oldFiles.imagen_personal && oldFiles.imagen_personal !== imagenPersonal) {
        deleteFile(oldFiles.imagen_personal);
        }

        Logger.success(`Información personal actualizada para empleado ID: ${empleado_id}`);
    } else {
        // Crear
        result = await pool.query(
        `INSERT INTO informacion_personal (
            empleado_id, tipo_documento, numero_identificacion, fecha_expedicion,
            documento_pdf, imagen_personal, nombres, apellidos, genero,
            fecha_nacimiento, departamento_nacimiento, ciudad_nacimiento,
            email, direccion, telefono, rh
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
          RETURNING *`,
        [
            empleado_id,
            data.tipoDocumento,
            data.numeroIdentificacion,
            data.fechaExpedicion,
            documentoPdf,
            imagenPersonal,
            data.nombres,
            data.apellidos,
            data.genero,
            data.fechaNacimiento,
            data.departamentoNacimiento,
            data.ciudadNacimiento,
            data.email || null,
            data.direccion || null,
            data.telefono || null,
            data.rh || null,
        ]
        );

        Logger.success(`Información personal creada para empleado ID: ${empleado_id}`);
    }

    return { success: true, data: result.rows[0] };
    } catch (error) {
    Logger.error('Error en InformacionPersonalService.guardar:', error);
    throw error;
    }
}

/**
   * Obtener información personal por empleado ID
   */
async obtenerPorEmpleadoId(empleadoId) {
    try {
    const result = await pool.query(
        'SELECT * FROM informacion_personal WHERE empleado_id = $1',
        [empleadoId]
    );
    return result.rows[0] || null;
    } catch (error) {
    Logger.error('Error en InformacionPersonalService.obtenerPorEmpleadoId:', error);
    throw error;
    }
}

/**
   * Obtener toda la información personal
   */
async obtenerTodos() {
    try {
    const result = await pool.query(
        'SELECT * FROM informacion_personal ORDER BY id DESC'
    );
    return result.rows;
    } catch (error) {
    Logger.error('Error en InformacionPersonalService.obtenerTodos:', error);
    throw error;
    }
}
}

export default new InformacionPersonalService();
