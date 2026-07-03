const { body, validationResult } = require('express-validator');

// Validar registro de usuario
const validarRegistro = [
    body('nombre')
        .notEmpty().withMessage('El nombre es obligatorio')
        .isLength({ min: 2, max: 100 }).withMessage('El nombre debe tener entre 2 y 100 caracteres')
        .trim(),
    body('apellido')
        .notEmpty().withMessage('El apellido es obligatorio')
        .isLength({ min: 2, max: 100 }).withMessage('El apellido debe tener entre 2 y 100 caracteres')
        .trim(),
    body('email')
        .notEmpty().withMessage('El email es obligatorio')
        .isEmail().withMessage('Email inválido')
        .normalizeEmail(),
    body('password')
        .notEmpty().withMessage('La contraseña es obligatoria')
        .isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
    body('telefono')
        .optional()
        .isLength({ min: 7, max: 20 }).withMessage('El teléfono debe tener entre 7 y 20 caracteres')
        .trim(),
    body('tipo_usuario')
        .optional()
        .isIn(['ciudadano', 'operador']).withMessage('Tipo de usuario inválido')
];

// Validar inicio de sesión
const validarLogin = [
    body('email')
        .notEmpty().withMessage('El email es obligatorio')
        .isEmail().withMessage('Email inválido')
        .normalizeEmail(),
    body('password')
        .notEmpty().withMessage('La contraseña es obligatoria')
];

// Validar incidencia
const validarIncidencia = [
    body('id_categoria')
        .notEmpty().withMessage('La categoría es obligatoria')
        .isInt({ min: 1 }).withMessage('Categoría inválida'),
    body('descripcion')
        .notEmpty().withMessage('La descripción es obligatoria')
        .isLength({ min: 10, max: 1000 }).withMessage('La descripción debe tener entre 10 y 1000 caracteres')
        .trim(),
    body('latitud')
        .notEmpty().withMessage('La ubicación es obligatoria')
        .isFloat({ min: -90, max: 90 }).withMessage('Latitud inválida'),
    body('longitud')
        .notEmpty().withMessage('La ubicación es obligatoria')
        .isFloat({ min: -180, max: 180 }).withMessage('Longitud inválida'),
    body('cantidad_perros')
        .optional()
        .isInt({ min: 1, max: 100 }).withMessage('Cantidad de perros inválida'),
    body('id_barrio')
        .optional()
        .isInt({ min: 1 }).withMessage('Barrio inválido'),
    body('prioridad')
        .optional()
        .isIn(['baja', 'media', 'alta', 'critica']).withMessage('Prioridad inválida')
];

// Validar acción municipal
const validarAccionMunicipal = [
    body('id_incidencia')
        .notEmpty().withMessage('La incidencia es obligatoria')
        .isInt({ min: 1 }).withMessage('Incidencia inválida'),
    body('tipo_accion')
        .notEmpty().withMessage('El tipo de acción es obligatorio')
        .isIn(['vacunacion', 'esterilizacion', 'rescate', 'atencion_veterinaria', 'reubicacion', 'alimentacion', 'seguimiento', 'derivacion', 'otro'])
        .withMessage('Tipo de acción inválido'),
    body('descripcion')
        .notEmpty().withMessage('La descripción es obligatoria')
        .isLength({ min: 5, max: 500 }).withMessage('La descripción debe tener entre 5 y 500 caracteres')
        .trim(),
    body('costo_estimado')
        .optional()
        .isFloat({ min: 0 }).withMessage('Costo inválido')
];

// Validar cambio de estado
const validarCambioEstado = [
    body('id_estado')
        .notEmpty().withMessage('El estado es obligatorio')
        .isInt({ min: 1, max: 4 }).withMessage('Estado inválido'),
    body('observaciones')
        .optional()
        .isLength({ max: 500 }).withMessage('Las observaciones no pueden exceder los 500 caracteres')
        .trim()
];

// Middleware para verificar errores de validación
const verificarValidacion = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: errors.array().map(err => ({
                campo: err.path,
                mensaje: err.msg
            }))
        });
    }
    next();
};

module.exports = {
    validarRegistro,
    validarLogin,
    validarIncidencia,
    validarAccionMunicipal,
    validarCambioEstado,
    verificarValidacion
};