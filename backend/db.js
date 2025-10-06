// backend/db.js
import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/recursos_humanos',
  ssl: false // pon true si usas PostgreSQL en la nube con SSL
});

export default pool;