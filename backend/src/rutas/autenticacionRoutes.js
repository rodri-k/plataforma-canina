const express = require('express');
const router = express.Router();
const { autenticacionController } = require('../controladores');
const { validacion } = require('../middleware');
const { autenticacionMiddleware } = require('../middleware/autenticacionMiddleware');

// Registro de usuario
router.post(
    '/registrar',
    validacion.validarRegistro,
    validacion.verificarValidacion,
    autenticacionController.registrar
);

// Inicio de sesión
router.post(
    '/login',
    validacion.validarLogin,
    validacion.verificarValidacion,
    autenticacionController.login
);

// Verificar token (sesión)
router.get(
    '/verificar',
    autenticacionMiddleware,
    autenticacionController.verificarToken
);

module.exports = router;