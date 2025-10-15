// src/shared/utils/multer.js
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config/env.js';

/**
 * Configuración base de Multer para subida de archivos
 */

// Directorio de uploads
const UPLOAD_ROOT = path.join(process.cwd(), config.uploadDir);

// Asegurar que exista el directorio de uploads
if (!fs.existsSync(UPLOAD_ROOT)) {
fs.mkdirSync(UPLOAD_ROOT, { recursive: true });
}

/**
 * Crear configuración de storage para Multer
 * @param {string} subFolder - Subcarpeta opcional dentro de uploads
 */
export const createStorage = (subFolder = '') => {
const uploadDir = subFolder ? path.join(UPLOAD_ROOT, subFolder) : UPLOAD_ROOT;

  // Crear subcarpeta si no existe
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

return multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadDir),
    filename: (_req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`;
    cb(null, uniqueName);
    },
});
};

/**
 * Crear configuración de storage con UUID
 * @param {string} subFolder - Subcarpeta opcional dentro de uploads
 */
export const createStorageWithUUID = (subFolder = '') => {
const uploadDir = subFolder ? path.join(UPLOAD_ROOT, subFolder) : UPLOAD_ROOT;

  // Crear subcarpeta si no existe
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

return multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadDir),
    filename: (_req, file, cb) => {
    cb(null, `${uuidv4()}${path.extname(file.originalname).toLowerCase()}`);
    },
});
};

/**
 * Filtro para validar tipos de archivo
 * @param {Array<string>} allowedMimes - Array de tipos MIME permitidos
 */
export const createFileFilter = (allowedMimes = config.allowedFileTypes) => {
return (req, file, cb) => {
    if (!allowedMimes.includes(file.mimetype)) {
    return cb(new Error(`Solo se permiten archivos de tipo: ${allowedMimes.join(', ')}`));
    }
    cb(null, true);
};
};

/**
 * Filtro solo para PDFs
 */
export const pdfFileFilter = (req, file, cb) => {
if (file.mimetype !== 'application/pdf') {
    return cb(new Error('Solo se permiten archivos PDF'));
}
cb(null, true);
};

/**
 * Filtro para PDFs e imágenes
 */
export const pdfAndImageFileFilter = (req, file, cb) => {
const allowedMimes = [
    'application/pdf',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
];

if (!allowedMimes.includes(file.mimetype)) {
    return cb(new Error('Solo se permiten archivos PDF e imágenes (JPG, PNG, GIF, WebP)'));
}
cb(null, true);
};

/**
 * Crear instancia de Multer con configuración personalizada
 */
export const createMulterInstance = (options = {}) => {
const {
    storage = createStorage(),
    fileFilter = createFileFilter(),
    limits = { fileSize: config.maxFileSize },
} = options;

return multer({
    storage,
    fileFilter,
    limits,
});
};

/**
 * Eliminar archivo del sistema de archivos
 * @param {string} filename - Nombre del archivo
 * @param {string} subFolder - Subcarpeta opcional
 */
export const deleteFile = (filename, subFolder = '') => {
try {
    const filePath = subFolder
    ? path.join(UPLOAD_ROOT, subFolder, filename)
    : path.join(UPLOAD_ROOT, filename);

    if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    return true;
    }
    return false;
} catch (error) {
    console.error(`Error al eliminar archivo ${filename}:`, error.message);
    return false;
}
};

export default {
createStorage,
createStorageWithUUID,
createFileFilter,
pdfFileFilter,
pdfAndImageFileFilter,
createMulterInstance,
deleteFile,
UPLOAD_ROOT,
};
