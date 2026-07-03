const express = require('express');
const router = express.Router();
const { ciudadanoController } = require('../controladores');
const { autenticacionMiddleware, verificarCiudadano } = require('../middleware/autenticacionMiddleware');
const { uploadSingle } = require('../middleware/uploadMiddleware');
const { validacion } = require('../middleware');

// Todas las rutas requieren autenticación y rol ciudadano (o superior)
router.use(autenticacionMiddleware);
router.use(verificarCiudadano);

// Dashboard del ciudadano
router.get('/dashboard', ciudadanoController.dashboard);

// Registrar incidencia (con imagen)
router.post(
    '/incidencias',
    uploadSingle,
    validacion.validarIncidencia,
    validacion.verificarValidacion,
    ciudadanoController.registrarIncidencia
);

// Listar mis incidencias
router.get('/incidencias', ciudadanoController.listarIncidencias);

// Detalle de incidencia
router.get('/incidencias/:id', ciudadanoController.detalleIncidencia);

module.exports = router;