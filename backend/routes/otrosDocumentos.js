// routes/otrosDocumentos.js
import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import pool from "../db.js";

const router = express.Router();

// === Config ===
const UPLOAD_ROOT = path.join(process.cwd(), "uploads");
const SUBFOLDER = "otros-documentos";
const UPLOAD_DIR = path.join(UPLOAD_ROOT, SUBFOLDER);

// Crea carpetas si no existen
if (!fs.existsSync(UPLOAD_ROOT)) fs.mkdirSync(UPLOAD_ROOT);
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR);

// Campos EXACTOS de la BD (campos simples)
const FIELDS = [
  "contrato",
  "libreta_militar",
  "antecedentes_disciplinarios",
  "rut",
  "rethus",
  "arl",
  "eps",
  "afp",
  "caja_compensacion",
  "examen_ingreso",
  "examen_periodico",
  "examen_egreso",
  "documentos_seleccion",
  // Nuevos campos agregados
  "tarjeta_profesional",
  "intereses_conflictos_tfo029",
  "carnet_vacunacion",
  "poliza_responsabilidad_civil",
  "certificado_cuenta_bancaria",
  "contrato_vigente",
  "contrato_liquidado",
];

// Campo especial para múltiples contratos Otrosis
const CONTRATOS_OTROSIS_FIELD = "contratos_otrosis";

// === Multer ===
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => cb(null, `${uuidv4()}${path.extname(file.originalname).toLowerCase()}`),
});

const fileFilter = (_req, file, cb) => {
  if (file.mimetype !== "application/pdf") {
    return cb(new Error("Sólo se permiten PDFs"));
  }
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB por archivo
    files: 30,                   // hasta 30 PDFs (campos individuales + contratos Otrosis)
    fields: 100,                 // hasta 100 campos text/form
  },
});

// Mapeo para upload.fields
const multerFields = [
  ...FIELDS.map((name) => ({ name, maxCount: 1 })),
  { name: CONTRATOS_OTROSIS_FIELD, maxCount: 10 } // Permitir hasta 10 contratos Otrosis
];

// Middleware para manejar errores de multer
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    console.error("Error de Multer:", err.code, err.message);
    
    switch (err.code) {
      case 'LIMIT_FILE_COUNT':
        return res.status(400).json({
          success: false,
          message: "Demasiados archivos. Máximo 30 archivos permitidos."
        });
      case 'LIMIT_FILE_SIZE':
        return res.status(400).json({
          success: false,
          message: "Archivo demasiado grande. Máximo 10MB por archivo."
        });
      case 'LIMIT_FIELD_COUNT':
        return res.status(400).json({
          success: false,
          message: "Demasiados campos. Límite excedido."
        });
      case 'LIMIT_UNEXPECTED_FILE':
        return res.status(400).json({
          success: false,
          message: "Campo de archivo no esperado."
        });
      default:
        return res.status(400).json({
          success: false,
          message: `Error de archivo: ${err.message}`
        });
    }
  }
  
  if (err.message && err.message.includes('Sólo se permiten PDFs')) {
    return res.status(400).json({
      success: false,
      message: "Solo se permiten archivos PDF."
    });
  }
  
  next(err);
};

// =============== Crear/Actualizar (UPSERT) ===============
router.post("/", upload.fields(multerFields), handleMulterError, async (req, res) => {
  try {
    const empleado_id = Number(req.body.empleado_id);
    if (!empleado_id) {
      return res.status(400).json({ success: false, message: "empleado_id es requerido" });
    }

    // Log para debugging
    console.log(`Procesando documentos para empleado ${empleado_id}`);
    console.log(`Archivos recibidos:`, Object.keys(req.files || {}).map(key => ({
      campo: key,
      cantidad: req.files[key]?.length || 0
    })));

    // Construye el mapa de nombres de archivo (o null)
    const filesMap = {};
    for (const f of FIELDS) {
      filesMap[f] = req.files?.[f]?.[0]?.filename ?? null;
    }

    // Manejar contratos Otrosis como array JSON
    let contratosOtrosis = [];
    const contratosOtrosisFiles = req.files?.[CONTRATOS_OTROSIS_FIELD] || [];
    
    if (contratosOtrosisFiles.length > 0) {
      contratosOtrosis = contratosOtrosisFiles.map(file => ({
        filename: file.filename,
        originalName: file.originalname,
        uploadDate: new Date().toISOString()
      }));
    }

    // al menos 1 archivo (incluyendo contratos Otrosis)
    const hasFiles = Object.values(filesMap).some(Boolean) || contratosOtrosis.length > 0;
    if (!hasFiles) {
      return res.status(400).json({ success: false, message: "No se adjuntó ningún PDF" });
    }

    // Obtener archivos anteriores para eliminarlos después (solo si es una actualización)
    let oldFiles = {};
    let oldContratosOtrosis = [];
    const existingQuery = await pool.query(
      `SELECT ${FIELDS.join(", ")}, ${CONTRATOS_OTROSIS_FIELD} FROM otros_documentos WHERE empleado_id = $1`,
      [empleado_id]
    );
    
    if (existingQuery.rows.length > 0) {
      oldFiles = existingQuery.rows[0];
      oldContratosOtrosis = oldFiles[CONTRATOS_OTROSIS_FIELD] || [];
    }

    // UPSERT:
    // - Insertamos NULL en los que no llegaron
    // - ON CONFLICT por empleado_id
    // - En el UPDATE usamos COALESCE(EXCLUDED.col, otros_documentos.col)
    //   => sólo sustituye los que llegaron (no sobreescribe con null)
    const cols = ["empleado_id", ...FIELDS, CONTRATOS_OTROSIS_FIELD];
    const placeholders = cols.map((_, i) => `$${i + 1}`).join(", ");
    const values = [empleado_id, ...FIELDS.map((n) => filesMap[n]), JSON.stringify(contratosOtrosis)];

    const setClause = [
      ...FIELDS.map((c) => `${c} = COALESCE(EXCLUDED.${c}, otros_documentos.${c})`),
      `${CONTRATOS_OTROSIS_FIELD} = CASE 
        WHEN EXCLUDED.${CONTRATOS_OTROSIS_FIELD} = '[]'::jsonb THEN otros_documentos.${CONTRATOS_OTROSIS_FIELD}
        ELSE EXCLUDED.${CONTRATOS_OTROSIS_FIELD}
       END`
    ].join(", ");

    const sql = `
      INSERT INTO otros_documentos (${cols.join(", ")})
      VALUES (${placeholders})
      ON CONFLICT (empleado_id)
      DO UPDATE SET ${setClause}
      RETURNING *;
    `;

    const { rows } = await pool.query(sql, values);

    // Eliminar archivos anteriores si se subieron nuevos
    for (const field of FIELDS) {
      const newFile = filesMap[field];
      const oldFile = oldFiles[field];
      
      if (newFile && oldFile && oldFile !== newFile) {
        try {
          const oldFilePath = path.join(UPLOAD_DIR, oldFile);
          if (fs.existsSync(oldFilePath)) {
            fs.unlinkSync(oldFilePath);
            console.log(`Archivo anterior eliminado (${field}): ${oldFile}`);
          }
        } catch (error) {
          console.warn(`No se pudo eliminar el archivo anterior ${oldFile} (${field}):`, error.message);
        }
      }
    }

    // Eliminar archivos anteriores de contratos Otrosis si se subieron nuevos
    if (contratosOtrosis.length > 0 && oldContratosOtrosis.length > 0) {
      // Obtener filenames de los nuevos contratos
      const newFilenames = contratosOtrosis.map(c => c.filename);
      
      // Eliminar archivos que ya no están en la nueva lista
      for (const oldContract of oldContratosOtrosis) {
        if (!newFilenames.includes(oldContract.filename)) {
          try {
            const oldFilePath = path.join(UPLOAD_DIR, oldContract.filename);
            if (fs.existsSync(oldFilePath)) {
              fs.unlinkSync(oldFilePath);
              console.log(`Contrato Otrosis anterior eliminado: ${oldContract.filename}`);
            }
          } catch (error) {
            console.warn(`No se pudo eliminar el contrato Otrosis anterior ${oldContract.filename}:`, error.message);
          }
        }
      }
    }

    return res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error("Error POST /api/otros-documentos:", err);
    
    // Manejo específico de errores de multer
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ 
        success: false, 
        message: "Demasiados archivos. Máximo 30 archivos permitidos." 
      });
    }
    
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ 
        success: false, 
        message: "Archivo demasiado grande. Máximo 10MB por archivo." 
      });
    }
    
    if (err.code === 'LIMIT_FIELD_COUNT') {
      return res.status(400).json({ 
        success: false, 
        message: "Demasiados campos. Límite excedido." 
      });
    }
    
    if (err.message && err.message.includes('Sólo se permiten PDFs')) {
      return res.status(400).json({ 
        success: false, 
        message: "Solo se permiten archivos PDF." 
      });
    }
    
    return res.status(500).json({ 
      success: false, 
      message: "Error interno al guardar documentos",
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// =============== Obtener por empleado ===============
router.get("/empleado/:empleadoId", async (req, res) => {
  try {
    const empleadoId = Number(req.params.empleadoId);
    const { rows } = await pool.query(
      `SELECT * FROM otros_documentos WHERE empleado_id = $1 LIMIT 1`,
      [empleadoId]
    );
    return res.json({ success: true, data: rows[0] ?? null });
  } catch (err) {
    console.error("Error GET /api/otros-documentos:", err);
    return res.status(500).json({ success: false, message: "Error interno" });
  }
});

// =============== Eliminar un campo/archivo ===============
router.delete("/empleado/:empleadoId/campo/:campo", async (req, res) => {
  const empleadoId = Number(req.params.empleadoId);
  const campo = String(req.params.campo);

  if (!FIELDS.includes(campo)) {
    return res.status(400).json({ success: false, message: "Campo inválido" });
  }

  try {
    const { rows } = await pool.query(
      `SELECT ${campo} FROM otros_documentos WHERE empleado_id = $1`,
      [empleadoId]
    );

    const filename = rows?.[0]?.[campo] ?? null;
    if (!filename) {
      return res.json({ success: true, message: "Nada que eliminar" });
    }

    await pool.query(
      `UPDATE otros_documentos SET ${campo} = NULL WHERE empleado_id = $1`,
      [empleadoId]
    );

    // Borra el archivo físico (si existe)
    try {
      fs.unlinkSync(path.join(UPLOAD_DIR, filename));
    } catch (e) {
      if (e.code !== "ENOENT") console.warn("No se pudo borrar el archivo:", e.message);
    }

    return res.json({ success: true });
  } catch (err) {
    console.error("Error DELETE /api/otros-documentos:", err);
    return res.status(500).json({ success: false, message: "Error interno al eliminar" });
  }
});

// =============== Eliminar un contrato Otrosis específico ===============
router.delete("/empleado/:empleadoId/contrato-otrosis/:filename", async (req, res) => {
  const empleadoId = Number(req.params.empleadoId);
  const filename = String(req.params.filename);

  try {
    const { rows } = await pool.query(
      `SELECT ${CONTRATOS_OTROSIS_FIELD} FROM otros_documentos WHERE empleado_id = $1`,
      [empleadoId]
    );

    const contratosOtrosis = rows?.[0]?.[CONTRATOS_OTROSIS_FIELD] || [];
    
    // Filtrar el contrato a eliminar
    const contratosActualizados = contratosOtrosis.filter(contrato => contrato.filename !== filename);
    
    if (contratosActualizados.length === contratosOtrosis.length) {
      return res.json({ success: true, message: "Contrato no encontrado" });
    }

    // Actualizar la base de datos
    await pool.query(
      `UPDATE otros_documentos SET ${CONTRATOS_OTROSIS_FIELD} = $1 WHERE empleado_id = $2`,
      [JSON.stringify(contratosActualizados), empleadoId]
    );

    // Borra el archivo físico (si existe)
    try {
      fs.unlinkSync(path.join(UPLOAD_DIR, filename));
    } catch (e) {
      if (e.code !== "ENOENT") console.warn("No se pudo borrar el archivo:", e.message);
    }

    return res.json({ success: true });
  } catch (err) {
    console.error("Error DELETE contrato Otrosis:", err);
    return res.status(500).json({ success: false, message: "Error interno al eliminar" });
  }
});

export default router;