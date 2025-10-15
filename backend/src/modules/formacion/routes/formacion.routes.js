// src/modules/formacion/routes/formacion.routes.js
import express from 'express';
import formacionController from '../controllers/formacion.controller.js';
import { createStorage } from '../../../shared/utils/multer.js';
import multer from 'multer';

const router = express.Router();

const upload = multer({ storage: createStorage() });

// POST / - Crear formación
router.post('/', upload.single('archivo'), formacionController.crear.bind(formacionController));

// GET /:empleado_id - Obtener formaciones por empleado
router.get('/:empleado_id', formacionController.obtenerPorEmpleado.bind(formacionController));

// GET / - Listar todas las formaciones
router.get('/', formacionController.listar.bind(formacionController));

// PUT /:id - Actualizar formación
router.put('/:id', upload.single('archivo'), formacionController.actualizar.bind(formacionController));

export default router;
