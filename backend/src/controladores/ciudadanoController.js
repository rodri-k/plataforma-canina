const { IncidenciaService } = require('../servicios');
const { GeolocalizacionService } = require('../servicios');
const { Incidencia } = require('../modelos');
const { MENSAJES } = require('../utilidades/constantes');

const ciudadanoController = {
    // Dashboard del ciudadano
    async dashboard(req, res) {
        try {
            const incidencias = await Incidencia.listar({ id_usuario: req.usuarioId });
            const total = incidencias.length;
            const pendientes = incidencias.filter(i => i.id_estado === 1).length;
            const enRevision = incidencias.filter(i => i.id_estado === 2).length;
            const enCurso = incidencias.filter(i => i.id_estado === 3).length;
            const cerradas = incidencias.filter(i => i.id_estado === 4).length;

            res.json({
                success: true,
                data: {
                    total,
                    pendientes,
                    enRevision,
                    enCurso,
                    cerradas,
                    ultimasIncidencias: incidencias.slice(0, 5)
                }
            });
        } catch (error) {
            console.error('Error en dashboard ciudadano:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener dashboard',
                error: error.message
            });
        }
    },

    // Registrar incidencia
    async registrarIncidencia(req, res) {
        try {
            console.log('Datos recibidos:', req.body);

            const {
                id_categoria, descripcion,
                latitud, longitud, id_barrio,
                cantidad_perros = 1, referencia,
                prioridad = 'media'
            } = req.body;

            const imagen_url = req.file ? `/uploads/incidencias/${req.file.filename}` : null;

            const barrioAsignado = await GeolocalizacionService.asignarBarrioAutomatico(
                parseFloat(latitud),
                parseFloat(longitud)
            );

            const incidenciaData = {
                id_usuario: req.usuarioId,
                id_categoria: parseInt(id_categoria),
                descripcion,
                cantidad_perros: parseInt(cantidad_perros),
                latitud: parseFloat(latitud),
                longitud: parseFloat(longitud),
                id_barrio: barrioAsignado ? barrioAsignado.id_barrio : null,
                referencia: referencia || '',
                imagen_url,
                prioridad
            };

            console.log('Datos a guardar:', incidenciaData);

            const nuevaIncidencia = await IncidenciaService.registrar(incidenciaData);

            res.status(201).json({
                success: true,
                message: MENSAJES.INCIDENCIA_CREADA,
                data: nuevaIncidencia
            });
        } catch (error) {
            console.error('Error al registrar incidencia:', error);
            res.status(500).json({
                success: false,
                message: 'Error al registrar incidencia',
                error: error.message
            });
        }
    },

    // Listar mis incidencias
    async listarIncidencias(req, res) {
        try {
            const incidencias = await Incidencia.listar({ id_usuario: req.usuarioId });
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
            const incidencia = await IncidenciaService.obtenerDetalle(parseInt(id), req.usuario);

            res.json({
                success: true,
                data: incidencia
            });
        } catch (error) {
            console.error('Error al obtener detalle:', error);
            res.status(404).json({
                success: false,
                message: error.message || 'Error al obtener detalle de incidencia'
            });
        }
    }
};

module.exports = ciudadanoController;