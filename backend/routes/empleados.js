import express from 'express';
import pool from '../db.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";

// Middleware para verificar token JWT
const verificarToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(401).json({ success: false, message: 'Token no proporcionado' });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ success: false, message: 'Token no válido' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ success: false, message: 'Token inválido o expirado' });
    }
    req.user = decoded;
    next();
  });
};

// GET /empleados - Obtener todos los empleados
router.get('/', verificarToken, async (req, res) => {
try {
    const { rows } = await pool.query(
      'SELECT * FROM empleados ORDER BY created_at DESC'
    );
    res.json({ empleados: rows });
} catch (error) {
    console.error('Error al obtener empleados:', error);
    res.status(500).json({ success: false, message: 'Error al obtener empleados' });
}
});

// POST /empleados - Crear nuevo empleado
router.post('/', verificarToken, async (req, res) => {
try {
    const {
    nombre,
    numeroIdentificacion,
    contrato,
    fecha_inicio,
    fecha_fin,
    sueldo,
    tipo_contrato,
    cargo
    } = req.body;

    // Validar campos requeridos con mensajes específicos
    if (!nombre || nombre.trim() === '') {
        return res.status(400).json({
            success: false,
            message: 'El nombre es obligatorio'
        });
    }

    if (!numeroIdentificacion || numeroIdentificacion.trim() === '') {
        return res.status(400).json({
            success: false,
            message: 'El número de identificación es obligatorio'
        });
    }

    if (!contrato || contrato.trim() === '') {
        return res.status(400).json({
            success: false,
            message: 'El número de contrato es obligatorio'
        });
    }

    if (!fecha_inicio) {
        return res.status(400).json({
            success: false,
            message: 'La fecha de inicio es obligatoria'
        });
    }

    if (!fecha_fin) {
        return res.status(400).json({
            success: false,
            message: 'La fecha de fin es obligatoria'
        });
    }

    if (!sueldo || sueldo <= 0) {
        return res.status(400).json({
            success: false,
            message: 'El sueldo debe ser mayor a 0'
        });
    }

    if (!tipo_contrato || tipo_contrato.trim() === '') {
        return res.status(400).json({
            success: false,
            message: 'Debe seleccionar un tipo de contrato'
        });
    }

    if (!cargo || cargo.trim() === '') {
        return res.status(400).json({
            success: false,
            message: 'El cargo es obligatorio'
        });
    }

    // Validar formato del número de identificación
    const cedulaRegex = /^[0-9]{6,12}$/;
    if (!cedulaRegex.test(numeroIdentificacion)) {
        return res.status(400).json({
            success: false,
            message: 'El número de identificación debe contener solo números (6-12 dígitos)'
        });
    }

    // Validar formato del nombre
    const nombresRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
    if (!nombresRegex.test(nombre)) {
        return res.status(400).json({
            success: false,
            message: 'El nombre solo puede contener letras y espacios'
        });
    }

    // Validar que el cargo comience con mayúscula
    if (cargo && cargo.trim() !== "") {
        const primeraLetra = cargo.trim().charAt(0);
        if (primeraLetra !== primeraLetra.toUpperCase() || !/[a-zA-ZáéíóúÁÉÍÓÚñÑ]/.test(primeraLetra)) {
            return res.status(400).json({
                success: false,
                message: 'El cargo debe comenzar con una letra mayúscula'
            });
        }
    }

    // Validar fechas
    const fechaInicio = new Date(fecha_inicio);
    const fechaFin = new Date(fecha_fin);

    // La fecha de inicio no puede ser anterior a 2002
    const fechaMinimaInicio = new Date('2002-01-01');
    if (fechaInicio < fechaMinimaInicio) {
        return res.status(400).json({
            success: false,
            message: 'La fecha de inicio no puede ser anterior a 2002'
        });
    }

    if (fechaInicio > fechaFin) {
        return res.status(400).json({
            success: false,
            message: 'La fecha de inicio no puede ser posterior a la fecha de fin'
        });
    }

    const { rows } = await pool.query(
    `INSERT INTO empleados (nombre, numeroIdentificacion, contrato, fecha_inicio, fecha_fin, sueldo, tipo_contrato, cargo, estado)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'activo')
      RETURNING *`,
    [nombre, numeroIdentificacion, contrato, fecha_inicio, fecha_fin, sueldo, tipo_contrato, cargo]
    );

    // Crear registro básico en información personal con el número de identificación
    await pool.query(
    `INSERT INTO informacion_personal (empleado_id, numero_identificacion)
    VALUES ($1, $2)`,
    [rows[0].id, numeroIdentificacion]
    );

    res.status(201).json({
    success: true,
    empleado: rows[0],
    message: 'Empleado creado exitosamente'
    });
} catch (error) {
    console.error('Error al crear empleado:', error);
    
    // Error de duplicado de número de identificación
    if (error.code === '23505' && error.constraint === 'empleados_numeroIdentificacion_key') {
        return res.status(400).json({
            success: false,
            message: 'Ya existe un empleado con este número de identificación'
        });
    }
    
    res.status(500).json({ success: false, message: 'Error al crear empleado' });
}
});

// GET /empleados/:id - Obtener empleado por ID
router.get('/:id', verificarToken, async (req, res) => {
try {
    const { id } = req.params;
    const { rows } = await pool.query(
      'SELECT * FROM empleados WHERE id = $1',
    [id]
    );

    if (rows.length === 0) {
    return res.status(404).json({
        success: false,
        message: 'Empleado no encontrado'
    });
    }

    res.json({ success: true, empleado: rows[0] });
} catch (error) {
    console.error('Error al obtener empleado:', error);
    res.status(500).json({ success: false, message: 'Error al obtener empleado' });
}
});

// PUT /empleados/:id - Actualizar empleado
router.put('/:id', verificarToken, async (req, res) => {
try {
    const { id } = req.params;
    const {
    nombre,
    numeroIdentificacion,
    contrato,
    fecha_inicio,
    fecha_fin,
    sueldo,
    tipo_contrato,
    cargo
    } = req.body;

    // Validar campos requeridos con mensajes específicos
    if (!nombre || nombre.trim() === '') {
        return res.status(400).json({
            success: false,
            message: 'El nombre es obligatorio'
        });
    }

    if (!numeroIdentificacion || numeroIdentificacion.trim() === '') {
        return res.status(400).json({
            success: false,
            message: 'El número de identificación es obligatorio'
        });
    }

    if (!contrato || contrato.trim() === '') {
        return res.status(400).json({
            success: false,
            message: 'El número de contrato es obligatorio'
        });
    }

    if (!fecha_inicio) {
        return res.status(400).json({
            success: false,
            message: 'La fecha de inicio es obligatoria'
        });
    }

    if (!fecha_fin) {
        return res.status(400).json({
            success: false,
            message: 'La fecha de fin es obligatoria'
        });
    }

    if (!sueldo || sueldo <= 0) {
        return res.status(400).json({
            success: false,
            message: 'El sueldo debe ser mayor a 0'
        });
    }

    if (!tipo_contrato || tipo_contrato.trim() === '') {
        return res.status(400).json({
            success: false,
            message: 'Debe seleccionar un tipo de contrato'
        });
    }

    if (!cargo || cargo.trim() === '') {
        return res.status(400).json({
            success: false,
            message: 'El cargo es obligatorio'
        });
    }

    // Validar formato del número de identificación
    const cedulaRegex = /^[0-9]{6,12}$/;
    if (!cedulaRegex.test(numeroIdentificacion)) {
        return res.status(400).json({
            success: false,
            message: 'El número de identificación debe contener solo números (6-12 dígitos)'
        });
    }

    // Validar formato del nombre
    const nombresRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
    if (!nombresRegex.test(nombre)) {
        return res.status(400).json({
            success: false,
            message: 'El nombre solo puede contener letras y espacios'
        });
    }

    // Validar que el cargo comience con mayúscula
    if (cargo && cargo.trim() !== "") {
        const primeraLetra = cargo.trim().charAt(0);
        if (primeraLetra !== primeraLetra.toUpperCase() || !/[a-zA-ZáéíóúÁÉÍÓÚñÑ]/.test(primeraLetra)) {
            return res.status(400).json({
                success: false,
                message: 'El cargo debe comenzar con una letra mayúscula'
            });
        }
    }

    // Validar fechas
    const fechaInicio = new Date(fecha_inicio);
    const fechaFin = new Date(fecha_fin);

    // La fecha de inicio no puede ser anterior a 2002
    const fechaMinimaInicio = new Date('2002-01-01');
    if (fechaInicio < fechaMinimaInicio) {
        return res.status(400).json({
            success: false,
            message: 'La fecha de inicio no puede ser anterior a 2002'
        });
    }

    if (fechaInicio > fechaFin) {
        return res.status(400).json({
            success: false,
            message: 'La fecha de inicio no puede ser posterior a la fecha de fin'
        });
    }

    const { rows } = await pool.query(
    `UPDATE empleados
    SET nombre = $1, numeroIdentificacion = $2, contrato = $3, fecha_inicio = $4,
        fecha_fin = $5, sueldo = $6, tipo_contrato = $7, cargo = $8
    WHERE id = $9
       RETURNING *`,
    [nombre, numeroIdentificacion, contrato, fecha_inicio, fecha_fin, sueldo, tipo_contrato, cargo, id]
    );

    if (rows.length === 0) {
    return res.status(404).json({
        success: false,
        message: 'Empleado no encontrado'
    });
    }

    res.json({ success: true, empleado: rows[0] });
} catch (error) {
    console.error('Error al actualizar empleado:', error);
    res.status(500).json({ success: false, message: 'Error al actualizar empleado' });
}
});

// DELETE /empleados/:id - Eliminar empleado
router.delete('/:id', verificarToken, async (req, res) => {
try {
    const { id } = req.params;
    console.log(`Intentando eliminar empleado con ID: ${id}`);
    
    // Verificar que el empleado existe antes de eliminarlo
    const checkResult = await pool.query('SELECT id, nombre FROM empleados WHERE id = $1', [id]);
    
    if (checkResult.rows.length === 0) {
        console.log(`Empleado con ID ${id} no encontrado`);
        return res.status(404).json({
            success: false,
            message: 'Empleado no encontrado'
        });
    }
    
    console.log(`Empleado encontrado: ${checkResult.rows[0].nombre} (ID: ${checkResult.rows[0].id})`);
    
    // Eliminar el empleado (las tablas relacionadas se eliminarán automáticamente por CASCADE)
    const { rows } = await pool.query(
      'DELETE FROM empleados WHERE id = $1 RETURNING *',
    [id]
    );

    console.log(`Empleado eliminado exitosamente: ${rows[0].nombre} (ID: ${rows[0].id})`);
    
    res.json({
        success: true,
        message: 'Empleado eliminado exitosamente',
        empleado: rows[0]
    });
} catch (error) {
    console.error('Error al eliminar empleado:', error);
    console.error('Error details:', {
        message: error.message,
        code: error.code,
        detail: error.detail,
        constraint: error.constraint
    });
    res.status(500).json({
        success: false,
        message: 'Error al eliminar empleado',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno del servidor'
    });
}
});

// PATCH /empleados/:id/estado - Cambiar estado del empleado (activo/desvinculado)
router.patch('/:id/estado', verificarToken, async (req, res) => {
try {
    const { id } = req.params;
    const { estado } = req.body;

    // Validar que el estado sea válido
    if (!estado || !['activo', 'desvinculado'].includes(estado)) {
        return res.status(400).json({
            success: false,
            message: 'El estado debe ser "activo" o "desvinculado"'
        });
    }

    // Verificar que el empleado existe
    const checkResult = await pool.query('SELECT id, nombre, estado FROM empleados WHERE id = $1', [id]);
    
    if (checkResult.rows.length === 0) {
        return res.status(404).json({
            success: false,
            message: 'Empleado no encontrado'
        });
    }

    const empleadoActual = checkResult.rows[0];
    
    // Si ya tiene el mismo estado, no hacer nada
    if (empleadoActual.estado === estado) {
        return res.json({
            success: true,
            message: `El empleado ya tiene el estado "${estado}"`,
            empleado: empleadoActual
        });
    }

    // Actualizar el estado
    const { rows } = await pool.query(
        'UPDATE empleados SET estado = $1 WHERE id = $2 RETURNING *',
        [estado, id]
    );

    const mensaje = estado === 'activo'
        ? 'Empleado reactivado exitosamente'
        : 'Empleado desvinculado exitosamente';

    res.json({
        success: true,
        message: mensaje,
        empleado: rows[0]
    });
} catch (error) {
    console.error('Error al cambiar estado del empleado:', error);
    res.status(500).json({
        success: false,
        message: 'Error al cambiar estado del empleado'
    });
}
});

export default router;
