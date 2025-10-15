// src/shared/utils/validators.js

/**
 * Utilidades de validación
 * Funciones reutilizables para validar datos en formularios
 */

/**
 * Validar email
 */
export const isValidEmail = (email) => {
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
return emailRegex.test(email);
};

/**
 * Validar número de identificación (cédula)
 */
export const isValidCedula = (cedula) => {
const cedulaRegex = /^\d{6,12}$/;
return cedulaRegex.test(cedula);
};

/**
 * Validar teléfono
 */
export const isValidPhone = (phone) => {
const phoneRegex = /^\d{7,15}$/;
return phoneRegex.test(phone);
};

/**
 * Validar que solo contenga letras y espacios
 */
export const isOnlyLetters = (text) => {
const lettersRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
return lettersRegex.test(text);
};

/**
 * Validar fecha (no puede ser futura)
 */
export const isValidPastDate = (date) => {
const selectedDate = new Date(date);
const today = new Date();
return selectedDate <= today;
};

/**
 * Validar rango de fechas
 */
export const isValidDateRange = (startDate, endDate) => {
const start = new Date(startDate);
const end = new Date(endDate);
return start <= end;
};

/**
 * Validar usuario (alfanumérico y guiones bajos)
 */
export const isValidUsername = (username) => {
if (!username || username.length < 3) return false;
const usernameRegex = /^[a-zA-Z0-9_]+$/;
return usernameRegex.test(username);
};

/**
 * Validar contraseña (mínimo 6 caracteres)
 */
export const isValidPassword = (password) => {
return password && password.length >= 6;
};

export default {
isValidEmail,
isValidCedula,
isValidPhone,
isOnlyLetters,
isValidPastDate,
isValidDateRange,
isValidUsername,
isValidPassword,
};
