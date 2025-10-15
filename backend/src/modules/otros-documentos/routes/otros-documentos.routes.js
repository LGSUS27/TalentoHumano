// src/modules/otros-documentos/routes/otros-documentos.routes.js
import express from 'express';
import otrosDocumentosController from '../controllers/otros-documentos.controller.js';
import { createStorageWithUUID, pdfFileFilter } from '../../../shared/utils/multer.js';
import multer from 'multer';

const router = express.Router();

// Campos de documentos
const FIELDS = [
'contrato',
'libreta_militar',
'antecedentes_disciplinarios',
'rut',
'rethus',
'arl',
'eps',
'afp',
'caja_compensacion',
'examen_ingreso',
'examen_periodico',
'examen_egreso',
'documentos_seleccion',
'tarjeta_profesional',
'intereses_conflictos_tfo029',
'carnet_vacunacion',
'poliza_responsabilidad_civil',
'certificado_cuenta_bancaria',
'contrato_vigente',
'contrato_liquidado',
];

const CONTRATOS_OTROSIS_FIELD = 'contratos_otrosis';

const upload = multer({
storage: createStorageWithUUID('otros-documentos'),
fileFilter: pdfFileFilter,
limits: {
    fileSize: 10 * 1024 * 1024, // 10MB por archivo
    files: 30,
    fields: 100,
},
});

const multerFields = [
...FIELDS.map((name) => ({ name, maxCount: 1 })),
{ name: CONTRATOS_OTROSIS_FIELD, maxCount: 10 },
];

// POST / - Guardar documentos (crear o actualizar)
router.post('/', upload.fields(multerFields), otrosDocumentosController.guardar.bind(otrosDocumentosController));

// GET /empleado/:empleadoId - Obtener documentos por empleado
router.get('/empleado/:empleadoId', otrosDocumentosController.obtenerPorEmpleado.bind(otrosDocumentosController));

// DELETE /empleado/:empleadoId/campo/:campo - Eliminar un campo
router.delete('/empleado/:empleadoId/campo/:campo', otrosDocumentosController.eliminarCampo.bind(otrosDocumentosController));

// DELETE /empleado/:empleadoId/contrato-otrosis/:filename - Eliminar contrato Otrosis
router.delete('/empleado/:empleadoId/contrato-otrosis/:filename', otrosDocumentosController.eliminarContratoOtrosis.bind(otrosDocumentosController));

export default router;
