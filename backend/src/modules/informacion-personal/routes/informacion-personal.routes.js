// src/modules/informacion-personal/routes/informacion-personal.routes.js
import express from 'express';
import informacionPersonalController from '../controllers/informacion-personal.controller.js';
import { createStorage, pdfAndImageFileFilter } from '../../../shared/utils/multer.js';
import multer from 'multer';
import { config } from '../../../shared/config/env.js';

const router = express.Router();

// Configuración de Multer para múltiples archivos
const upload = multer({
storage: createStorage(),
fileFilter: pdfAndImageFileFilter,
limits: {
    fileSize: config.maxFileSize,
    files: 2, // máximo 2 archivos (PDF e imagen)
},
});

/**
 * Rutas de información personal
 */

// POST / - Guardar información personal (crear o actualizar)
router.post(
'/',
upload.fields([
    { name: 'documentoPdf', maxCount: 1 },
    { name: 'imagenPersonal', maxCount: 1 },
]),
informacionPersonalController.guardar.bind(informacionPersonalController)
);

// GET /empleado/:empleadoId - Obtener información personal por empleado
router.get(
'/empleado/:empleadoId',
informacionPersonalController.obtenerPorEmpleado.bind(informacionPersonalController)
);

// GET / - Listar toda la información personal
router.get('/', informacionPersonalController.listar.bind(informacionPersonalController));

export default router;
