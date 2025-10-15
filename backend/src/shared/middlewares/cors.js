// src/shared/middlewares/cors.js
import cors from 'cors';
import { config } from '../config/env.js';

/**
 * Configuración de CORS para desarrollo
 * Permite localhost y 127.0.0.1 en cualquier puerto
 */
export const corsOptions = {
origin: (origin, callback) => {
    // Permitir requests sin origin (como Postman, curl, etc.)
    if (!origin) {
    return callback(null, true);
    }

    // En desarrollo, permitir localhost y 127.0.0.1 en cualquier puerto
    if (config.nodeEnv === 'development') {
    const isLocalhost = /^http:\/\/localhost(:\d+)?$/.test(origin);
    const is127 = /^http:\/\/127\.0\.0\.1(:\d+)?$/.test(origin);
    
    if (isLocalhost || is127) {
        return callback(null, true);
    }
    }

    // En producción, usar lista de orígenes permitidos
    if (config.allowedOrigins.includes(origin)) {
    return callback(null, true);
    }

    return callback(new Error('CORS no permitido para este origen'), false);
},
credentials: true,
methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
allowedHeaders: ['Content-Type', 'Authorization'],
};

export const corsMiddleware = cors(corsOptions);

export default corsMiddleware;
