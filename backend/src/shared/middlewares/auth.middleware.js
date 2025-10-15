// src/shared/middlewares/auth.middleware.js
import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import { HTTP_STATUS, ERROR_MESSAGES } from '../constants/httpCodes.js';

/**
 * Middleware para verificar token JWT
 * Protege las rutas que requieren autenticación
 */
export const verificarToken = (req, res, next) => {
const authHeader = req.headers['authorization'];

if (!authHeader) {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({
    success: false,
    message: ERROR_MESSAGES.TOKEN_NOT_PROVIDED
    });
}

const token = authHeader.split(' ')[1];

if (!token) {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({
    success: false,
    message: ERROR_MESSAGES.TOKEN_INVALID
    });
}

jwt.verify(token, config.jwtSecret, (err, decoded) => {
    if (err) {
    return res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        message: ERROR_MESSAGES.TOKEN_EXPIRED
    });
    }
    
    req.user = decoded;
    next();
});
};

export default verificarToken;
