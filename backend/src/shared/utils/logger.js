// src/shared/utils/logger.js

/**
 * Logger simple para desarrollo
 * En producción se puede reemplazar por Winston, Morgan, etc.
 */
class Logger {
static info(message, ...args) {
    console.log(`ℹ️  [INFO] ${new Date().toISOString()} - ${message}`, ...args);
}

static success(message, ...args) {
    console.log(`✅ [SUCCESS] ${new Date().toISOString()} - ${message}`, ...args);
}

static warn(message, ...args) {
    console.warn(`⚠️  [WARN] ${new Date().toISOString()} - ${message}`, ...args);
}

static error(message, error, ...args) {
    console.error(`❌ [ERROR] ${new Date().toISOString()} - ${message}`, error, ...args);
}

static debug(message, ...args) {
    if (process.env.NODE_ENV === 'development') {
    console.log(`🔍 [DEBUG] ${new Date().toISOString()} - ${message}`, ...args);
    }
}
}

export default Logger;
