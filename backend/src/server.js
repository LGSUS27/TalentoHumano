// src/server.js
import app from './app.js';
import { config } from './shared/config/env.js';
import Logger from './shared/utils/logger.js';

/**
 * Iniciar servidor
 * Punto de entrada principal del backend
 */
const PORT = config.port;

const server = app.listen(PORT, () => {
Logger.success(`Backend en http://localhost:${PORT}`);
Logger.info(`Entorno: ${config.nodeEnv}`);
Logger.info(`Arquitectura: Modular (Vertical Slices)`);
});

// Manejo de señales de terminación
process.on('SIGTERM', () => {
Logger.info('SIGTERM recibido. Cerrando servidor...');
server.close(() => {
    Logger.info('Servidor cerrado');
    process.exit(0);
});
});

process.on('SIGINT', () => {
Logger.info('SIGINT recibido. Cerrando servidor...');
server.close(() => {
    Logger.info('Servidor cerrado');
    process.exit(0);
});
});

// Manejo de errores no capturados
process.on('unhandledRejection', (reason, promise) => {
Logger.error('Unhandled Rejection at:', promise, reason);
  // Opcionalmente cerrar el servidor
process.exit(1);
});

process.on('uncaughtException', (error) => {
Logger.error('Uncaught Exception:', error);
process.exit(1);
});

export default server;
