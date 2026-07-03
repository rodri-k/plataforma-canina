const { DashboardService } = require('../servicios');

const dashboardController = {
    // Dashboard según rol del usuario
    async obtenerDashboard(req, res) {
        try {
            if (req.tipoUsuario === 'operador') {
                const data = await DashboardService.getDashboardOperador();
                return res.json({
                    success: true,
                    rol: 'operador',
                    data
                });
            } else {
                const data = await DashboardService.getDashboardCiudadano(req.usuarioId);
                return res.json({
                    success: true,
                    rol: 'ciudadano',
                    data
                });
            }
        } catch (error) {
            console.error('Error al obtener dashboard:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener dashboard',
                error: error.message
            });
        }
    },

    // Estadísticas generales (públicas)
    async obtenerEstadisticasPublicas(req, res) {
        try {
            const estadisticas = await DashboardService.getDashboardOperador();
            // Filtrar solo datos públicos
            res.json({
                success: true,
                data: {
                    total_incidencias: estadisticas.generales.total,
                    cerradas: estadisticas.generales.cerradas,
                    porCategoria: estadisticas.porCategoria,
                    porBarrio: estadisticas.porBarrio.slice(0, 5) // Top 5 barrios
                }
            });
        } catch (error) {
            console.error('Error al obtener estadísticas públicas:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener estadísticas públicas'
            });
        }
    }
};

module.exports = dashboardController;