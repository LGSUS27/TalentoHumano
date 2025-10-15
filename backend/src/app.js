// src/app.js
import express from 'express';
import path from 'path';
import { config } from './shared/config/env.js';
import { corsMiddleware } from './shared/middlewares/cors.js';
import { errorHandler, notFoundHandler } from './shared/middlewares/errorHandler.js';
import Logger from './shared/utils/logger.js';

// Importar rutas de módulos
import authRoutes from './modules/auth/routes/auth.routes.js';
import empleadosRoutes from './modules/empleados/routes/empleados.routes.js';
import informacionPersonalRoutes from './modules/informacion-personal/routes/informacion-personal.routes.js';
import formacionRoutes from './modules/formacion/routes/formacion.routes.js';
import experienciaRoutes from './modules/experiencia/routes/experiencia.routes.js';
import otrosDocumentosRoutes from './modules/otros-documentos/routes/otros-documentos.routes.js';
import evaluacionesRoutes from './modules/evaluaciones/routes/evaluaciones.routes.js';

/**
 * Configuración principal de la aplicación Express
 * Arquitectura modular con separación de responsabilidades
 */
const app = express();

// ========== Middlewares globales ==========

// CORS
app.use(corsMiddleware);

// Responder OPTIONS global (preflight)
app.options('*', corsMiddleware);

// Parser de JSON
app.use(express.json());

// Parser de URL-encoded
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos (uploads)
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// ========== Rutas ==========

// Ruta de salud
app.get('/', (_req, res) => {
res.json({
    success: true,
    message: '✅ Backend OK - Arquitectura Modular',
    version: '2.0.0',
    architecture: 'Modular (Vertical Slices)',
});
});

// Rutas de módulos
app.use('/', authRoutes); // /login, /protected, /me
app.use('/api/login', authRoutes); // Alias para /login
app.use('/empleados', empleadosRoutes);
app.use('/api/informacion-personal', informacionPersonalRoutes);
app.use('/api/formacion', formacionRoutes);
app.use('/api/experiencia', experienciaRoutes);
app.use('/api/otros-documentos', otrosDocumentosRoutes);
app.use('/api', evaluacionesRoutes); // Evaluaciones de desempeño

// ========== Manejo de errores ==========

// Ruta no encontrada (debe estar después de todas las rutas)
app.use(notFoundHandler);

// Middleware global de manejo de errores (debe estar al final)
app.use(errorHandler);

// ========== Exportar app ==========

export default app;
