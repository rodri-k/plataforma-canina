const jwt = require('jsonwebtoken');
const { Usuario } = require('../modelos');

const autenticacionMiddleware = async (req, res, next) => {
    try {
        // Obtener token del header Authorization
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Token de autenticación no proporcionado'
            });
        }

        const token = authHeader.split(' ')[1];

        // Verificar token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Buscar usuario
        const usuario = await Usuario.findById(decoded.id);
        if (!usuario) {
            return res.status(401).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        // Verificar que el usuario esté activo
        if (!usuario.estado) {
            return res.status(401).json({
                success: false,
                message: 'Usuario inactivo. Contacte al administrador.'
            });
        }

        // Adjuntar usuario al request
        req.usuario = usuario;
        req.usuarioId = usuario.id_usuario;
        req.tipoUsuario = usuario.tipo_usuario;

        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Token inválido'
            });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token expirado. Inicie sesión nuevamente.'
            });
        }
        console.error('Error en autenticación:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al verificar autenticación'
        });
    }
};

// Middleware para verificar rol de operador
const verificarOperador = (req, res, next) => {
    if (req.tipoUsuario !== 'operador') {
        return res.status(403).json({
            success: false,
            message: 'Acceso denegado. Se requieren permisos de operador municipal.'
        });
    }
    next();
};

// Middleware para verificar rol de ciudadano
const verificarCiudadano = (req, res, next) => {
    if (req.tipoUsuario !== 'ciudadano' && req.tipoUsuario !== 'operador') {
        return res.status(403).json({
            success: false,
            message: 'Acceso denegado. Se requieren permisos de ciudadano.'
        });
    }
    next();
};

module.exports = {
    autenticacionMiddleware,
    verificarOperador,
    verificarCiudadano
};