// src/modules/empleados/validators/empleados.validator.js
import { HTTP_STATUS } from '../../../shared/constants/httpCodes.js';

/**
 * Validador de empleados
 * Contiene todas las reglas de validación para el módulo de empleados
 */
class EmpleadosValidator {
/**
   * Validar datos de empleado (crear o actualizar)
   */
validate(data) {
    const errors = {};

    // Nombre
    if (!data.nombre || data.nombre.trim() === '') {
    errors.nombre = 'El nombre es obligatorio';
    } else {
    const nombresRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
    if (!nombresRegex.test(data.nombre)) {
        errors.nombre = 'El nombre solo puede contener letras y espacios';
    }
    }

    // Número de identificación
    if (!data.numeroIdentificacion || data.numeroIdentificacion.trim() === '') {
    errors.numeroIdentificacion = 'El número de identificación es obligatorio';
    } else {
    const cedulaRegex = /^[0-9]{6,12}$/;
    if (!cedulaRegex.test(data.numeroIdentificacion)) {
        errors.numeroIdentificacion = 'El número de identificación debe contener solo números (6-12 dígitos)';
    }
    }

    // Contrato
    if (!data.contrato || data.contrato.trim() === '') {
    errors.contrato = 'El número de contrato es obligatorio';
    }

    // Fecha de inicio
    if (!data.fecha_inicio) {
    errors.fecha_inicio = 'La fecha de inicio es obligatoria';
    } else {
    const fechaInicio = new Date(data.fecha_inicio);
    const fechaMinimaInicio = new Date('2002-01-01');
    
    if (fechaInicio < fechaMinimaInicio) {
        errors.fecha_inicio = 'La fecha de inicio no puede ser anterior a 2002';
    }
    }

    // Fecha de fin
    if (!data.fecha_fin) {
    errors.fecha_fin = 'La fecha de fin es obligatoria';
    }

    // Validar que fecha_inicio < fecha_fin
    if (data.fecha_inicio && data.fecha_fin) {
    const fechaInicio = new Date(data.fecha_inicio);
    const fechaFin = new Date(data.fecha_fin);
    
    if (fechaInicio > fechaFin) {
        errors.fecha_fin = 'La fecha de inicio no puede ser posterior a la fecha de fin';
    }
    }

    // Sueldo
    if (!data.sueldo || data.sueldo <= 0) {
    errors.sueldo = 'El sueldo debe ser mayor a 0';
    }

    // Tipo de contrato
    if (!data.tipo_contrato || data.tipo_contrato.trim() === '') {
    errors.tipo_contrato = 'Debe seleccionar un tipo de contrato';
    }

    // Cargo
    if (!data.cargo || data.cargo.trim() === '') {
    errors.cargo = 'El cargo es obligatorio';
    } else {
    const primeraLetra = data.cargo.trim().charAt(0);
    if (primeraLetra !== primeraLetra.toUpperCase() || !/[a-zA-ZáéíóúÁÉÍÓÚñÑ]/.test(primeraLetra)) {
        errors.cargo = 'El cargo debe comenzar con una letra mayúscula';
    }
    }

    return {
    isValid: Object.keys(errors).length === 0,
    errors,
    };
}

/**
   * Validar estado de empleado
   */
validateEstado(estado) {
    const estadosValidos = ['activo', 'desvinculado'];
    
    if (!estado || !estadosValidos.includes(estado)) {
    return {
        isValid: false,
        error: 'El estado debe ser "activo" o "desvinculado"',
    };
    }

    return { isValid: true };
}
}

export default new EmpleadosValidator();
