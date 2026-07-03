const express = require('express');
const router = express.Router();
const { operadorController } = require('../controladores');
const { autenticacionMiddleware, verificarOperador } = require('../middleware/autenticacionMiddleware');
const { uploadSingle } = require('../middleware/uploadMiddleware');
const { validacion } = require('../middleware');

// Todas las rutas requieren autenticación y rol operador
router.use(autenticacionMiddleware);
router.use(verificarOperador);

// Dashboard del operador
router.get('/dashboard', operadorController.dashboard);

// Listar todas las incidencias (con filtros)
router.get('/incidencias', operadorController.listarIncidencias);

// Detalle de incidencia
router.get('/incidencias/:id', operadorController.detalleIncidencia);

// Cambiar estado de incidencia
router.put(
    '/incidencias/:id/estado',
    validacion.validarCambioEstado,
    validacion.verificarValidacion,
    operadorController.cambiarEstado
);

// Actualizar prioridad
router.put(
    '/incidencias/:id/prioridad',
    operadorController.actualizarPrioridad
);

// Registrar acción municipal
router.post(
    '/acciones',
    uploadSingle,
    validacion.validarAccionMunicipal,
    validacion.verificarValidacion,
    operadorController.registrarAccion
);

// Listar acciones de una incidencia
router.get('/incidencias/:id/acciones', operadorController.listarAcciones);

// Estadísticas
router.get('/estadisticas', operadorController.obtenerEstadisticas);

// Mapa de calor
router.get('/mapa-calor', operadorController.obtenerMapaCalor);

// Estadisticas completas para dashboard estadistico
router.get('/estadisticas/completas', operadorController.obtenerEstadisticasCompletas);

module.exports = router;