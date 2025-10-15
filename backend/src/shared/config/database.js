// src/shared/config/database.js
import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();

/**
 * Pool de conexiones a PostgreSQL
 * Configuración centralizada de la base de datos
 */
const pool = new Pool({
connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/recursos_humanos',
  ssl: false, // true si usas PostgreSQL en la nube con SSL
  max: 20, // Máximo de conexiones en el pool
  idleTimeoutMillis: 30000, // Tiempo de espera antes de cerrar una conexión inactiva
  connectionTimeoutMillis: 2000, // Tiempo máximo para establecer una conexión
});

// Manejar errores de conexión
pool.on('error', (err) => {
console.error('Error inesperado en el cliente PostgreSQL:', err);
process.exit(-1);
});

// Log de conexión exitosa (solo en desarrollo)
if (process.env.NODE_ENV === 'development') {
pool.on('connect', () => {
    console.log('✅ Nueva conexión establecida con PostgreSQL');
});
}

export default pool;
