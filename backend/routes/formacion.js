import express from 'express';
import multer from 'multer';
import path from 'path';
import pool from '../db.js';

const router = express.Router();

// Configuración de Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads');
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueName + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// POST: guardar formación
router.post('/', upload.single('archivo'), async (req, res) => {
  const { institucion, programa, tipo, nivel, graduado, fecha } = req.body;
  const archivo = req.file?.filename;

  if (!institucion || !programa || !tipo || !nivel || !graduado || !fecha || !archivo) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO formacion (institucion, programa, tipo, nivel, graduado, fecha, archivo)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [institucion, programa, tipo, nivel, graduado, fecha, archivo]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error al guardar formación:", err);
    res.status(500).json({ error: "Error en el servidor" });
  }
});

// GET: obtener formaciones
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM formacion ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    console.error("Error al obtener formaciones:", err);
    res.status(500).json({ error: "Error al obtener datos" });
  }
});

export default router;
