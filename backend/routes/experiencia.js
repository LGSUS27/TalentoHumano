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
    empresa,
    cargo,
    tipoVinculacion,
    fechaInicio,
    fechaFin,
    funciones
  } = req.body;

  const soporte = req.file ? req.file.filename : null;

  if (!empresa || !cargo || !tipoVinculacion || !fechaInicio || !fechaFin || !funciones || !soporte) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO experiencia (empresa, cargo, tipo_vinculacion, fecha_inicio, fecha_salida, funciones, soporte)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [empresa, cargo, tipoVinculacion, fechaInicio, fechaFin, funciones, soporte]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error al guardar experiencia:', error);
    res.status(500).json({ error: 'Error al guardar experiencia' });
  }
});

router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM experiencia ORDER BY id DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener experiencias:', error);
    res.status(500).json({ error: 'Error al obtener datos' });
  }
});

export default router;