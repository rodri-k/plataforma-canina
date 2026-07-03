const { IncidenciaService, DashboardService } = require('../servicios');
const { Incidencia, AccionMunicipal } = require('../modelos');
const { MENSAJES } = require('../utilidades/constantes');

const operadorController = {
    // Dashboard del operador
    async dashboard(req, res) {
        try {
            const data = await DashboardService.getDashboardOperador();
            res.json({
                success: true,
                data
            });
        } catch (error) {
            console.error('Error en dashboard operador:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener dashboard',
                error: error.message
            });
        }
    },

    // Listar todas las incidencias (con filtros)
    async listarIncidencias(req, res) {
        try {
            const { estado, categoria, barrio, prioridad } = req.query;
            const filtros = {};

            if (estado) filtros.id_estado = parseInt(estado);
            if (categoria) filtros.id_categoria = parseInt(categoria);
            if (barrio) filtros.id_barrio = parseInt(barrio);
            if (prioridad) filtros.prioridad = prioridad;

            const incidencias = await Incidencia.listar(filtros);
            res.json({
                success: true,
                data: incidencias
            });
        } catch (error) {
            console.error('Error al listar incidencias:', error);
            res.status(500).json({
                success: false,
                message: 'Error al listar incidencias',
                error: error.message
            });
        }
    },

    // Ver detalle de incidencia
    async detalleIncidencia(req, res) {
        try {
            const { id } = req.params;
            const incidencia = await Incidencia.findById(parseInt(id));

            if (!incidencia) {
                return res.status(404).json({
                    success: false,
                    message: 'Incidencia no encontrada'
                });
            }

            const acciones = await AccionMunicipal.listarPorIncidencia(parseInt(id));

            res.json({
                success: true,
                data: {
                    incidencia,
                    acciones
                }
            });
        } catch (error) {
            console.error('Error al obtener detalle:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener detalle de incidencia'
            });
        }
    },

    // Cambiar estado de incidencia
    async cambiarEstado(req, res) {
        try {
            const { id } = req.params;
            const { id_estado, observaciones } = req.body;

            const incidencia = await IncidenciaService.cambiarEstado(
                parseInt(id),
                parseInt(id_estado),
                observaciones,
                req.usuario
            );

            if (!incidencia) {
                return res.status(404).json({
                    success: false,
                    message: 'Incidencia no encontrada'
                });
            }

            res.json({
                success: true,
                message: MENSAJES.INCIDENCIA_ACTUALIZADA,
                data: incidencia
            });
        } catch (error) {
            console.error('Error al cambiar estado:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Error al cambiar estado de incidencia'
            });
        }
    },

    // Actualizar prioridad
    async actualizarPrioridad(req, res) {
        try {
            const { id } = req.params;
            const { prioridad } = req.body;

            const incidencia = await IncidenciaService.actualizarPrioridad(
                parseInt(id),
                prioridad,
                req.usuario
            );

            if (!incidencia) {
                return res.status(404).json({
                    success: false,
                    message: 'Incidencia no encontrada'
                });
            }

            res.json({
                success: true,
                message: 'Prioridad actualizada exitosamente',
                data: incidencia
            });
        } catch (error) {
            console.error('Error al actualizar prioridad:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Error al actualizar prioridad'
            });
        }
    },

    // Registrar acción municipal
    async registrarAccion(req, res) {
        try {
            const { id_incidencia, tipo_accion, descripcion, costo_estimado, ubicacion, observaciones } = req.body;

            const accionData = {
                id_incidencia: parseInt(id_incidencia),
                id_operador: req.usuarioId,
                tipo_accion,
                descripcion,
                costo_estimado: costo_estimado ? parseFloat(costo_estimado) : null,
                ubicacion: ubicacion || '',
                observaciones: observaciones || '',
                evidencia_url: req.file ? `/uploads/incidencias/${req.file.filename}` : null
            };

            const nuevaAccion = await AccionMunicipal.crear(accionData);

            // Si la incidencia está en estado "Pendiente", pasarla a "En revisión"
            const incidencia = await Incidencia.findById(parseInt(id_incidencia));
            if (incidencia && incidencia.id_estado === 1) {
                await Incidencia.actualizarEstado(parseInt(id_incidencia), 2);
            }

            res.status(201).json({
                success: true,
                message: MENSAJES.ACCION_REGISTRADA,
                data: nuevaAccion
            });
        } catch (error) {
            console.error('Error al registrar acción:', error);
            res.status(500).json({
                success: false,
                message: 'Error al registrar acción municipal',
                error: error.message
            });
        }
    },

    // Obtener acciones de una incidencia
    async listarAcciones(req, res) {
        try {
            const { id } = req.params;
            const acciones = await AccionMunicipal.listarPorIncidencia(parseInt(id));
            res.json({
                success: true,
                data: acciones
            });
        } catch (error) {
            console.error('Error al listar acciones:', error);
            res.status(500).json({
                success: false,
                message: 'Error al listar acciones municipales'
            });
        }
    },

    // Obtener estadísticas
    async obtenerEstadisticas(req, res) {
        try {
            const estadisticas = await IncidenciaService.obtenerEstadisticas();
            res.json({
                success: true,
                data: estadisticas
            });
        } catch (error) {
            console.error('Error al obtener estadísticas:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener estadísticas'
            });
        }
    },

    // Obtener datos para mapa de calor
    async obtenerMapaCalor(req, res) {
        try {
            const datos = await IncidenciaService.obtenerDatosMapaCalor();
            res.json({
                success: true,
                data: datos
            });
        } catch (error) {
            console.error('Error al obtener mapa de calor:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener datos para mapa de calor'
            });
        }
    },

    // Obtener estadisticas completas para dashboard estadistico
    async obtenerEstadisticasCompletas(req, res) {
        try {
            const estadisticas = await DashboardService.getEstadisticasCompletas();
            const tiempoPromedio = await DashboardService.getTiempoPromedioRespuesta();
            const incidenciasPorDia = await DashboardService.getIncidenciasPorDia();

            res.json({
                success: true,
                data: {
                    ...estadisticas,
                    tiempoPromedioRespuesta: tiempoPromedio,
                    incidenciasPorDia
                }
            });
        } catch (error) {
            console.error('Error al obtener estadisticas completas:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener estadisticas',
                error: error.message
            });
        }
    }
};

module.exports = operadorController;