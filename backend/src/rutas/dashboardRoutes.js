const express = require('express');
const router = express.Router();
const { dashboardController } = require('../controladores');
const { autenticacionMiddleware } = require('../middleware/autenticacionMiddleware');

// Estadísticas públicas (sin autenticación)
router.get('/publicas', dashboardController.obtenerEstadisticasPublicas);

// Dashboard del usuario autenticado
router.get('/usuario', autenticacionMiddleware, dashboardController.obtenerDashboard);

module.exports = router;