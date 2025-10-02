import express from 'express';
import multer from 'multer';
import path from 'path';
import pool from '../db.js';

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads'),
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueName + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

router.post('/', upload.single('archivo'), async (req, res) => {
  const {
    empleado_id,
    empresa,
    cargo,
    tipoVinculacion,
    fechaInicio,
    fechaFin,
    funciones
  } = req.body;

  const soporte = req.file ? req.file.filename : null;

  if (!empleado_id || !empresa || !cargo || !tipoVinculacion || !fechaInicio || !fechaFin || !funciones || !soporte) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios, incluyendo empleado_id' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO experiencia (empleado_id, empresa, cargo, tipo_vinculacion, fecha_inicio, fecha_salida, funciones, soporte)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [empleado_id, empresa, cargo, tipoVinculacion, fechaInicio, fechaFin, funciones, soporte]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error al guardar experiencia:', error);
    res.status(500).json({ error: 'Error al guardar experiencia' });
  }
});

// GET: obtener experiencias por empleado
router.get('/:empleado_id', async (req, res) => {
  const { empleado_id } = req.params;
  
  try {
    const result = await pool.query(
      'SELECT * FROM experiencia WHERE empleado_id = $1 ORDER BY id DESC',
      [empleado_id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener experiencias:', error);
    res.status(500).json({ error: 'Error al obtener datos' });
  }
});

// GET: obtener todas las experiencias (para admin)
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM experiencia ORDER BY id DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener experiencias:', error);
    res.status(500).json({ error: 'Error al obtener datos' });
  }
});

// PUT: actualizar experiencia
router.put('/:id', upload.single('archivo'), async (req, res) => {
  const { id } = req.params;
  const {
    empleado_id,
    empresa,
    cargo,
    tipoVinculacion,
    fechaInicio,
    fechaFin,
    funciones
  } = req.body;

  const soporte = req.file ? req.file.filename : null;

  if (!empleado_id) {
    return res.status(400).json({ error: 'empleado_id es requerido' });
  }

  try {
    // Primero obtener los datos actuales
    const currentResult = await pool.query('SELECT * FROM experiencia WHERE id = $1', [id]);
    if (currentResult.rows.length === 0) {
      return res.status(404).json({ error: 'Experiencia no encontrada' });
    }

    const current = currentResult.rows[0];

    // Usar valores nuevos si se proporcionan, sino mantener los existentes
    const empresaFinal = empresa || current.empresa;
    const cargoFinal = cargo || current.cargo;
    const tipoVinculacionFinal = tipoVinculacion || current.tipo_vinculacion;
    const fechaInicioFinal = fechaInicio || current.fecha_inicio;
    const fechaFinFinal = fechaFin || current.fecha_salida;
    const funcionesFinal = funciones || current.funciones;
    const soporteFinal = soporte || current.soporte;

    // Validar que los campos obligatorios no estén vacíos
    if (!empresaFinal || !cargoFinal || !tipoVinculacionFinal || !fechaInicioFinal || !fechaFinFinal || !funcionesFinal || !soporteFinal) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    const result = await pool.query(
      `UPDATE experiencia 
       SET empleado_id = $1, empresa = $2, cargo = $3, tipo_vinculacion = $4, 
           fecha_inicio = $5, fecha_salida = $6, funciones = $7, soporte = $8
       WHERE id = $9 RETURNING *`,
      [empleado_id, empresaFinal, cargoFinal, tipoVinculacionFinal, fechaInicioFinal, fechaFinFinal, funcionesFinal, soporteFinal, id]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al actualizar experiencia:', error);
    res.status(500).json({ error: 'Error al actualizar experiencia' });
  }
});

export default router;