// src/shared/config/env.js
import dotenv from 'dotenv';

dotenv.config();

/**
 * Configuración centralizada de variables de entorno
 */
export const config = {
  // Servidor
port: process.env.PORT || 3000,
nodeEnv: process.env.NODE_ENV || 'development',

  // Base de datos
databaseUrl: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/recursos_humanos',

  // JWT
jwtSecret: process.env.JWT_SECRET || 'dev-secret',
jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1h',

  // CORS
allowedOrigins: process.env.ALLOWED_ORIGINS 
    ? process.env.ALLOWED_ORIGINS.split(',')
    : ['http://localhost:5173', 'http://127.0.0.1:5173'],

  // Uploads
uploadDir: 'uploads',
  maxFileSize: 10 * 1024 * 1024, // 10MB
allowedFileTypes: ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
};

export default config;
