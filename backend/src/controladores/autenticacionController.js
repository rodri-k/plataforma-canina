const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Usuario } = require('../modelos');
const { MENSAJES, TIPOS_USUARIO } = require('../utilidades/constantes');

const autenticacionController = {
    // Registro de usuario
    async registrar(req, res) {
        try {
            const { nombre, apellido, email, telefono, password, tipo_usuario = TIPOS_USUARIO.CIUDADANO } = req.body;

            // Verificar si el email ya existe
            const usuarioExistente = await Usuario.findByEmail(email);
            if (usuarioExistente) {
                return res.status(400).json({
                    success: false,
                    message: 'El email ya está registrado'
                });
            }

            // Hash de la contraseña
            const salt = await bcrypt.genSalt(10);
            const password_hash = await bcrypt.hash(password, salt);

            // Crear usuario
            const nuevoUsuario = await Usuario.crear({
                nombre,
                apellido,
                email,
                telefono,
                password_hash,
                tipo_usuario
            });

            res.status(201).json({
                success: true,
                message: MENSAJES.REGISTRO_EXITOSO,
                data: nuevoUsuario
            });
        } catch (error) {
            console.error('Error en registro:', error);
            res.status(500).json({
                success: false,
                message: 'Error al registrar usuario',
                error: error.message
            });
        }
    },

    // Inicio de sesión
    async login(req, res) {
        try {
            const { email, password } = req.body;

            // Buscar usuario por email
            const usuario = await Usuario.findByEmail(email);
            if (!usuario) {
                return res.status(401).json({
                    success: false,
                    message: MENSAJES.LOGIN_FALLIDO
                });
            }

            // Verificar si el usuario está activo
            if (!usuario.estado) {
                return res.status(401).json({
                    success: false,
                    message: MENSAJES.USUARIO_INACTIVO
                });
            }

            // Verificar contraseña
            const passwordValido = await bcrypt.compare(password, usuario.password_hash);
            if (!passwordValido) {
                return res.status(401).json({
                    success: false,
                    message: MENSAJES.LOGIN_FALLIDO
                });
            }

            // Actualizar último acceso
            await Usuario.actualizarUltimoAcceso(usuario.id_usuario);

            // Generar token JWT
            const token = jwt.sign(
                {
                    id: usuario.id_usuario,
                    email: usuario.email,
                    tipo_usuario: usuario.tipo_usuario
                },
                process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
            );

            // Remover password_hash del objeto de respuesta
            const { password_hash, ...usuarioData } = usuario;

            res.json({
                success: true,
                message: MENSAJES.LOGIN_EXITOSO,
                data: {
                    usuario: usuarioData,
                    token
                }
            });
        } catch (error) {
            console.error('Error en login:', error);
            res.status(500).json({
                success: false,
                message: 'Error al iniciar sesión',
                error: error.message
            });
        }
    },

    // Verificar token (para mantener sesión)
    async verificarToken(req, res) {
        try {
            const usuario = await Usuario.findById(req.usuarioId);
            if (!usuario) {
                return res.status(401).json({
                    success: false,
                    message: 'Usuario no encontrado'
                });
            }

            res.json({
                success: true,
                data: usuario
            });
        } catch (error) {
            console.error('Error al verificar token:', error);
            res.status(500).json({
                success: false,
                message: 'Error al verificar token',
                error: error.message
            });
        }
    }
};

module.exports = autenticacionController;