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

const fileFilter = (req, file, cb) => {
  console.log('Procesando archivo:', file.fieldname, file.mimetype, file.originalname);
  
  const allowedMimes = [
    "application/pdf",
    "image/jpeg",
    "image/jpg", 
    "image/png",
    "image/gif",
    "image/webp"
  ];
  
  if (!allowedMimes.includes(file.mimetype)) {
    console.log('Tipo de archivo no permitido:', file.mimetype);
    return cb(new Error("Solo se permiten archivos PDF e imágenes (JPG, PNG, GIF, WebP)"));
  }
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
});

// Configuración para múltiples archivos
const uploadMultiple = multer({
  storage,
  fileFilter,
  limits: { 
    fileSize: 10 * 1024 * 1024, // 10 MB por archivo
    files: 2 // máximo 2 archivos (PDF e imagen)
  },
});

/* =========================================
  POST /api/informacion-personal
  Crea un registro de información personal
   ========================================= */
router.post("/", uploadMultiple.fields([
  { name: 'documentoPdf', maxCount: 1 },
  { name: 'imagenPersonal', maxCount: 1 }
]), async (req, res) => {
  console.log('Archivos recibidos:', req.files);
  console.log('Body recibido:', req.body);
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

  const documentoPdf = req.files?.documentoPdf?.[0]?.filename || null;
  const imagenPersonal = req.files?.imagenPersonal?.[0]?.filename || null;

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
    genero === "Seleccionar género..." ||
    !fechaNacimiento ||
    !departamentoNacimiento ||
    !ciudadNacimiento ||
    (rh && rh === "Seleccionar RH...")
  ) {
    return res.status(400).json({
      success: false,
      message: "Faltan campos obligatorios.",
    });
  }

  // Validaciones específicas de formato
  const cedulaRegex = /^\d{6,12}$/;
  if (!cedulaRegex.test(numeroIdentificacion)) {
    return res.status(400).json({
      success: false,
      message: "El número de identificación debe contener solo números (6-12 dígitos).",
    });
  }

  const nombresRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
  if (!nombresRegex.test(nombres)) {
    return res.status(400).json({
      success: false,
      message: "Los nombres solo pueden contener letras y espacios.",
    });
  }

  if (!nombresRegex.test(apellidos)) {
    return res.status(400).json({
      success: false,
      message: "Los apellidos solo pueden contener letras y espacios.",
    });
  }

  // Validar email si se proporciona
  if (email && email.trim() !== "") {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "El formato del email no es válido. Debe contener @ y un dominio válido (.com, .co, .org, etc.).",
      });
    }
  }

  // Validar teléfono si se proporciona
  if (telefono && telefono.trim() !== "") {
    const telefonoRegex = /^\d{7,15}$/;
    if (!telefonoRegex.test(telefono)) {
      return res.status(400).json({
        success: false,
        message: "El teléfono debe contener solo números (7-15 dígitos).",
      });
    }
  }

  // Validar fechas
  const fechaExpedicionDate = new Date(fechaExpedicion);
  const fechaNacimientoDate = new Date(fechaNacimiento);
  const hoy = new Date();

  if (fechaExpedicionDate > hoy) {
    return res.status(400).json({
      success: false,
      message: "La fecha de expedición no puede ser futura.",
    });
  }

  if (fechaNacimientoDate > hoy) {
    return res.status(400).json({
      success: false,
      message: "La fecha de nacimiento no puede ser futura.",
    });
  }

  if (fechaNacimientoDate > fechaExpedicionDate) {
    return res.status(400).json({
      success: false,
      message: "La fecha de nacimiento no puede ser posterior a la fecha de expedición.",
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
    console.log("Datos recibidos:", {
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
      documentoPdf,
      imagenPersonal
    });

    // Verificar si ya existe información personal para este empleado
    const existingQuery = await pool.query(
      "SELECT id, documento_pdf, imagen_personal FROM informacion_personal WHERE empleado_id = $1",
      [empleado_id]
    );

    let result;
    if (existingQuery.rows.length > 0) {
      // Obtener archivos anteriores para eliminarlos después
      const oldDocumentoPdf = existingQuery.rows[0].documento_pdf;
      const oldImagenPersonal = existingQuery.rows[0].imagen_personal;

      // Actualizar registro existente
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
          tipoDocumento,
          numeroIdentificacion,
          fechaExpedicion,
          documentoPdf,
          imagenPersonal,
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

      // Eliminar archivos anteriores si se subieron nuevos
      if (documentoPdf && oldDocumentoPdf && oldDocumentoPdf !== documentoPdf) {
        try {
          const oldFilePath = path.join(UPLOAD_DIR, oldDocumentoPdf);
          if (fs.existsSync(oldFilePath)) {
            fs.unlinkSync(oldFilePath);
            console.log(`Archivo PDF anterior eliminado: ${oldDocumentoPdf}`);
          }
        } catch (error) {
          console.warn(`No se pudo eliminar el archivo PDF anterior ${oldDocumentoPdf}:`, error.message);
        }
      }

      if (imagenPersonal && oldImagenPersonal && oldImagenPersonal !== imagenPersonal) {
        try {
          const oldFilePath = path.join(UPLOAD_DIR, oldImagenPersonal);
          if (fs.existsSync(oldFilePath)) {
            fs.unlinkSync(oldFilePath);
            console.log(`Imagen anterior eliminada: ${oldImagenPersonal}`);
          }
        } catch (error) {
          console.warn(`No se pudo eliminar la imagen anterior ${oldImagenPersonal}:`, error.message);
        }
      }
    } else {
      // Crear nuevo registro
      result = await pool.query(
        `INSERT INTO informacion_personal (
          empleado_id,
          tipo_documento,
          numero_identificacion,
          fecha_expedicion,
          documento_pdf,
          imagen_personal,
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
          $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16
        )
        RETURNING *`,
        [
          empleado_id,
          tipoDocumento,
          numeroIdentificacion,
          fechaExpedicion,
          documentoPdf,
          imagenPersonal,
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