const express = require('express');
const router = express.Router();

const autenticacionRoutes = require('./autenticacionRoutes');
const ciudadanoRoutes = require('./ciudadanoRoutes');
const operadorRoutes = require('./operadorRoutes');
const incidenciaRoutes = require('./incidenciaRoutes');
const dashboardRoutes = require('./dashboardRoutes');

// Rutas públicas
router.use('/auth', autenticacionRoutes);
router.use('/incidencias', incidenciaRoutes);
router.use('/dashboard', dashboardRoutes);

// Rutas protegidas (requieren autenticación según rol)
router.use('/ciudadano', ciudadanoRoutes);
router.use('/operador', operadorRoutes);

// Ruta de prueba
router.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'API funcionando correctamente',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

module.exports = router;