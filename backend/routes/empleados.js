import express from 'express';
import pool from '../db.js';

const router = express.Router();

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

  // Aquí deberías verificar el JWT, por ahora lo omitimos para simplificar
  // En producción debes implementar la verificación completa
next();
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
    cedula,
    contrato,
    fecha_inicio,
    fecha_fin,
    sueldo,
    tipo_contrato,
    cargo
    } = req.body;

    // Validar campos requeridos
    if (!nombre || !cedula || !contrato || !fecha_inicio || !fecha_fin || !sueldo || !tipo_contrato || !cargo) {
    return res.status(400).json({
        success: false,
        message: 'Todos los campos son obligatorios'
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
    `INSERT INTO empleados (nombre, cedula, contrato, fecha_inicio, fecha_fin, sueldo, tipo_contrato, cargo)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *`,
    [nombre, cedula, contrato, fecha_inicio, fecha_fin, sueldo, tipo_contrato, cargo]
    );

    res.status(201).json({
    success: true,
    empleado: rows[0],
    message: 'Empleado creado exitosamente'
    });
} catch (error) {
    console.error('Error al crear empleado:', error);
    
    // Error de duplicado de cédula
    if (error.code === '23505' && error.constraint === 'empleados_cedula_key') {
    return res.status(400).json({
        success: false,
        message: 'Ya existe un empleado con esta cédula'
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
    cedula,
    contrato,
    fecha_inicio,
    fecha_fin,
    sueldo,
    tipo_contrato,
    cargo
    } = req.body;

    // Validar campos requeridos
    if (!nombre || !cedula || !contrato || !fecha_inicio || !fecha_fin || !sueldo || !tipo_contrato || !cargo) {
    return res.status(400).json({
        success: false,
        message: 'Todos los campos son obligatorios'
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
    SET nombre = $1, cedula = $2, contrato = $3, fecha_inicio = $4,
        fecha_fin = $5, sueldo = $6, tipo_contrato = $7, cargo = $8
    WHERE id = $9
       RETURNING *`,
    [nombre, cedula, contrato, fecha_inicio, fecha_fin, sueldo, tipo_contrato, cargo, id]
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
    const { rows } = await pool.query(
      'DELETE FROM empleados WHERE id = $1 RETURNING *',
    [id]
    );

    if (rows.length === 0) {
    return res.status(404).json({
        success: false,
        message: 'Empleado no encontrado'
    });
    }

    res.json({ success: true, message: 'Empleado eliminado exitosamente' });
} catch (error) {
    console.error('Error al eliminar empleado:', error);
    res.status(500).json({ success: false, message: 'Error al eliminar empleado' });
}
});

export default router;