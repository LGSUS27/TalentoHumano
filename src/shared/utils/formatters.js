// src/shared/utils/formatters.js

/**
 * Utilidades de formateo
 * Funciones para formatear datos de visualización
 */

/**
 * Formatear fecha en formato local
 */
export const formatDate = (dateString) => {
if (!dateString) return '';
const date = new Date(dateString);
return date.toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
});
};

/**
 * Formatear fecha corta (DD/MM/YYYY)
 */
export const formatDateShort = (dateString) => {
if (!dateString) return '';
const date = new Date(dateString);
return date.toLocaleDateString('es-CO');
};

/**
 * Formatear moneda (pesos colombianos)
 */
export const formatCurrency = (amount) => {
if (!amount && amount !== 0) return '';
return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
}).format(amount);
};

/**
 * Formatear número con separadores de miles
 */
export const formatNumber = (number) => {
if (!number && number !== 0) return '';
return new Intl.NumberFormat('es-CO').format(number);
};

/**
 * Capitalizar primera letra
 */
export const capitalize = (text) => {
if (!text) return '';
return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

/**
 * Formatear nombre completo
 */
export const formatFullName = (firstName, lastName) => {
return `${firstName || ''} ${lastName || ''}`.trim();
};

export default {
formatDate,
formatDateShort,
formatCurrency,
formatNumber,
capitalize,
formatFullName,
};
