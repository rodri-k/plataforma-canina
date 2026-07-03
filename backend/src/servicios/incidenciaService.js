const { Incidencia } = require('../modelos');

class IncidenciaService {
    // Registrar nueva incidencia
    static async registrar(data) {
        // Asignar estado inicial "Pendiente" (id_estado = 1)
        const incidenciaData = {
            ...data,
            id_estado: 1 // Pendiente
        };
        return await Incidencia.crear(incidenciaData);
    }

    // Listar incidencias según rol
    static async listar(filtros, usuario) {
        if (usuario.tipo_usuario === 'ciudadano') {
            // Ciudadano solo ve sus propias incidencias
            return await Incidencia.listar({ ...filtros, id_usuario: usuario.id_usuario });
        }
        // Operador ve todas
        return await Incidencia.listar(filtros);
    }

    // Obtener detalle de incidencia
    static async obtenerDetalle(id, usuario) {
        const incidencia = await Incidencia.findById(id);
        if (!incidencia) {
            throw new Error('Incidencia no encontrada');
        }
        // Verificar permisos
        if (usuario.tipo_usuario === 'ciudadano' && incidencia.id_usuario !== usuario.id_usuario) {
            throw new Error('No tienes permiso para ver esta incidencia');
        }
        return incidencia;
    }

    // Cambiar estado
    static async cambiarEstado(id, id_estado, observaciones, usuario) {
        if (usuario.tipo_usuario !== 'operador') {
            throw new Error('Solo los operadores municipales pueden cambiar estados');
        }
        return await Incidencia.actualizarEstado(id, id_estado, observaciones);
    }

    // Actualizar prioridad
    static async actualizarPrioridad(id, prioridad, usuario) {
        if (usuario.tipo_usuario !== 'operador') {
            throw new Error('Solo los operadores municipales pueden actualizar prioridades');
        }
        return await Incidencia.actualizarPrioridad(id, prioridad);
    }

    // Obtener estadísticas
    static async obtenerEstadisticas() {
        const generales = await Incidencia.obtenerEstadisticas();
        const porCategoria = await Incidencia.obtenerEstadisticasPorCategoria();
        const porBarrio = await Incidencia.obtenerEstadisticasPorBarrio();
        return {
            generales,
            porCategoria,
            porBarrio
        };
    }

    // Obtener datos para mapa de calor
    static async obtenerDatosMapaCalor() {
        return await Incidencia.obtenerParaMapaCalor();
    }
}

module.exports = IncidenciaService;