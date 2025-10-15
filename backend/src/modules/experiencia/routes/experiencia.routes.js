// src/modules/experiencia/routes/experiencia.routes.js
import express from 'express';
import experienciaController from '../controllers/experiencia.controller.js';
import { createStorage } from '../../../shared/utils/multer.js';
import multer from 'multer';

const router = express.Router();

const upload = multer({ storage: createStorage() });

// POST / - Crear experiencia
router.post('/', upload.single('archivo'), experienciaController.crear.bind(experienciaController));

// GET /:empleado_id - Obtener experiencias por empleado
router.get('/:empleado_id', experienciaController.obtenerPorEmpleado.bind(experienciaController));

// GET / - Listar todas las experiencias
router.get('/', experienciaController.listar.bind(experienciaController));

// PUT /:id - Actualizar experiencia
router.put('/:id', upload.single('archivo'), experienciaController.actualizar.bind(experienciaController));

export default router;
