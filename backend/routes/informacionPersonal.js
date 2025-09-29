// routes/informacion-personal.js
import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import pool from "../db.js";

const router = express.Router();

/* =======================
  Configuración de Multer
   ======================= */
const UPLOAD_DIR = path.join(process.cwd(), "uploads");

// Asegura que exista la carpeta uploads/
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const uniqueName = `${Date.now()}-${(file.originalname || "documento").replace(/\s+/g, "_")}`;
    cb(null, uniqueName);
  },
});

const fileFilter = (_req, file, cb) => {
  if (file.mimetype !== "application/pdf") {
    return cb(new Error("Solo se permiten archivos PDF"));
  }
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
});

/* =========================================
  POST /api/informacion-personal
  Crea un registro de información personal
   ========================================= */
router.post("/", upload.single("documentoPdf"), async (req, res) => {
  // Campos que llegan desde el frontend (camelCase)
  const {
    empleado_id,
    tipoDocumento,
    numeroIdentificacion,
    fechaExpedicion,
    nombres,
    apellidos,
    genero,
    fechaNacimiento,
    departamentoNacimiento,
    ciudadNacimiento,
    email,
    direccion,
    telefono,
    rh,
  } = req.body;

  const documentoPdf = req.file?.filename || null;

  // Validar que se proporcione empleado_id
  if (!empleado_id) {
    return res.status(400).json({
      success: false,
      message: "empleado_id es requerido",
    });
  }

  // Validaciones mínimas de requeridos (PDF no es obligatorio si ya existe uno)
  if (
    !tipoDocumento ||
    !numeroIdentificacion ||
    !fechaExpedicion ||
    !nombres ||
    !apellidos ||
    !genero ||
    !fechaNacimiento ||
    !departamentoNacimiento ||
    !ciudadNacimiento
  ) {
    return res.status(400).json({
      success: false,
      message: "Faltan campos obligatorios.",
    });
  }

  // Verificar si se necesita PDF (solo si no existe uno previo)
  let needsPdf = false;
  if (!documentoPdf) {
    const existingQuery = await pool.query(
      "SELECT documento_pdf FROM informacion_personal WHERE empleado_id = $1",
      [empleado_id]
    );
    needsPdf = existingQuery.rows.length === 0 || !existingQuery.rows[0].documento_pdf;
  }

  if (needsPdf && !documentoPdf) {
    return res.status(400).json({
      success: false,
      message: "Debe adjuntar un documento PDF.",
    });
  }

  try {
    // Verificar si ya existe información personal para este empleado
    const existingQuery = await pool.query(
      "SELECT id FROM informacion_personal WHERE empleado_id = $1",
      [empleado_id]
    );

    let result;
    if (existingQuery.rows.length > 0) {
      // Actualizar registro existente
      result = await pool.query(
        `UPDATE informacion_personal SET
          tipo_documento = $1,
          numero_identificacion = $2,
          fecha_expedicion = $3,
          documento_pdf = COALESCE($4, documento_pdf),
          nombres = $5,
          apellidos = $6,
          genero = $7,
          fecha_nacimiento = $8,
          departamento_nacimiento = $9,
          ciudad_nacimiento = $10,
          email = $11,
          direccion = $12,
          telefono = $13,
          rh = $14
        WHERE empleado_id = $15
        RETURNING *`,
        [
          tipoDocumento,
          numeroIdentificacion,
          fechaExpedicion,
          documentoPdf,
          nombres,
          apellidos,
          genero,
          fechaNacimiento,
          departamentoNacimiento,
          ciudadNacimiento,
          email || null,
          direccion || null,
          telefono || null,
          rh || null,
          empleado_id,
        ]
      );
    } else {
      // Crear nuevo registro
      result = await pool.query(
        `INSERT INTO informacion_personal (
          empleado_id,
          tipo_documento,
          numero_identificacion,
          fecha_expedicion,
          documento_pdf,
          nombres,
          apellidos,
          genero,
          fecha_nacimiento,
          departamento_nacimiento,
          ciudad_nacimiento,
          email,
          direccion,
          telefono,
          rh
        )
        VALUES (
          $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15
        )
        RETURNING *`,
        [
          empleado_id,
          tipoDocumento,
          numeroIdentificacion,
          fechaExpedicion,
          documentoPdf,
          nombres,
          apellidos,
          genero,
          fechaNacimiento,
          departamentoNacimiento,
          ciudadNacimiento,
          email || null,
          direccion || null,
          telefono || null,
          rh || null,
        ]
      );
    }

    return res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error("Error al guardar información personal:", error);
    return res
      .status(500)
      .json({ success: false, message: "Error interno del servidor" });
  }
});

/* ===========================================================
   GET /api/informacion-personal/empleado/:empleadoId
   Obtener información personal de un empleado específico
   =========================================================== */
router.get("/empleado/:empleadoId", async (req, res) => {
  try {
    const { empleadoId } = req.params;
    const { rows } = await pool.query(
      `SELECT *
      FROM informacion_personal
      WHERE empleado_id = $1`,
      [empleadoId]
    );
    
    if (rows.length === 0) {
      return res.json({ success: true, data: null });
    }
    
    res.json({ success: true, data: rows[0] });
  } catch (error) {
    console.error("Error al obtener información personal:", error);
    res.status(500).json({ success: false, message: "Error interno del servidor" });
  }
});

/* ===========================================================
  GET /api/informacion-personal
  Listar todos (útil para verificar rápidamente desde el front)
   =========================================================== */
router.get("/", async (_req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT *
      FROM informacion_personal
      ORDER BY id DESC`
    );
    res.json({ success: true, data: rows });
  } catch (e) {
    console.error("Error al listar informacion_personal:", e);
    res.status(500).json({ success: false, message: "Error interno del servidor" });
  }
});

export default router;