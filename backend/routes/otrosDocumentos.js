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

// Campos EXACTOS de la BD
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
];

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
    files: 20,                   // hasta 20 PDFs
    fields: 50,                  // hasta 50 campos text/form
  },
});

// Mapeo para upload.fields
const multerFields = FIELDS.map((name) => ({ name, maxCount: 1 }));

// =============== Crear/Actualizar (UPSERT) ===============
router.post("/", upload.fields(multerFields), async (req, res) => {
  try {
    const empleado_id = Number(req.body.empleado_id);
    if (!empleado_id) {
      return res.status(400).json({ success: false, message: "empleado_id es requerido" });
    }

    // Construye el mapa de nombres de archivo (o null)
    const filesMap = {};
    for (const f of FIELDS) {
      filesMap[f] = req.files?.[f]?.[0]?.filename ?? null;
    }

    // al menos 1 archivo
    if (!Object.values(filesMap).some(Boolean)) {
      return res.status(400).json({ success: false, message: "No se adjuntó ningún PDF" });
    }

    // UPSERT:
    // - Insertamos NULL en los que no llegaron
    // - ON CONFLICT por empleado_id
    // - En el UPDATE usamos COALESCE(EXCLUDED.col, otros_documentos.col)
    //   => sólo sustituye los que llegaron (no sobreescribe con null)
    const cols = ["empleado_id", ...FIELDS];
    const placeholders = cols.map((_, i) => `$${i + 1}`).join(", ");
    const values = [empleado_id, ...FIELDS.map((n) => filesMap[n])];

    const setClause = FIELDS
      .map((c) => `${c} = COALESCE(EXCLUDED.${c}, otros_documentos.${c})`)
      .join(", ");

    const sql = `
      INSERT INTO otros_documentos (${cols.join(", ")})
      VALUES (${placeholders})
      ON CONFLICT (empleado_id)
      DO UPDATE SET ${setClause}
      RETURNING *;
    `;

    const { rows } = await pool.query(sql, values);
    return res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error("Error POST /api/otros-documentos:", err);
    return res.status(500).json({ success: false, message: "Error interno al guardar documentos" });
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

export default router;