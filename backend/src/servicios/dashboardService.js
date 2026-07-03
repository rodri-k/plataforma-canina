const { Incidencia, Usuario } = require('../modelos');

class DashboardService {
    static async getDashboardCiudadano(usuarioId) {
        const incidencias = await Incidencia.listar({ id_usuario: usuarioId });
        const total = incidencias.length;
        const pendientes = incidencias.filter(i => i.id_estado === 1).length;
        const enRevision = incidencias.filter(i => i.id_estado === 2).length;
        const enCurso = incidencias.filter(i => i.id_estado === 3).length;
        const cerradas = incidencias.filter(i => i.id_estado === 4).length;

        return {
            total,
            pendientes,
            enRevision,
            enCurso,
            cerradas,
            ultimasIncidencias: incidencias.slice(0, 5)
        };
    }

    static async getDashboardOperador() {
        const generales = await Incidencia.obtenerEstadisticas();
        const porCategoria = await Incidencia.obtenerEstadisticasPorCategoria();
        const porBarrio = await Incidencia.obtenerEstadisticasPorBarrio();
        const totalUsuarios = await Usuario.listar();

        return {
            generales,
            porCategoria,
            porBarrio,
            totalUsuarios: totalUsuarios.length,
            ciudadanos: totalUsuarios.filter(u => u.tipo_usuario === 'ciudadano').length,
            operadores: totalUsuarios.filter(u => u.tipo_usuario === 'operador').length
        };
    }

    static async getEstadisticasCompletas() {
        const generales = await Incidencia.obtenerEstadisticas();
        const porCategoria = await Incidencia.obtenerEstadisticasPorCategoria();
        const porBarrio = await Incidencia.obtenerEstadisticasPorBarrio();
        const porEstado = await this.getEstadisticasPorEstado();
        const porPrioridad = await this.getEstadisticasPorPrioridad();
        const tendenciaMensual = await this.getTendenciaMensual();

        return {
            generales,
            porCategoria,
            porBarrio,
            porEstado,
            porPrioridad,
            tendenciaMensual
        };
    }

    static async getEstadisticasPorEstado() {
        const sql = `
            SELECT 
                e.nombre as estado,
                e.color,
                COUNT(i.id_incidencia) as cantidad
            FROM estados e
            LEFT JOIN incidencias i ON e.id_estado = i.id_estado AND i.activo = true
            GROUP BY e.id_estado, e.nombre, e.color, e.orden
            ORDER BY e.orden
        `;
        const { query } = require('../configuracion/conexion_postgresql');
        const result = await query(sql);
        return result.rows;
    }

    static async getEstadisticasPorPrioridad() {
        const sql = `
            SELECT 
                prioridad,
                COUNT(*) as cantidad
            FROM incidencias
            WHERE activo = true AND prioridad IS NOT NULL
            GROUP BY prioridad
            ORDER BY 
                CASE prioridad
                    WHEN 'critica' THEN 1
                    WHEN 'alta' THEN 2
                    WHEN 'media' THEN 3
                    WHEN 'baja' THEN 4
                    ELSE 5
                END
        `;
        const { query } = require('../configuracion/conexion_postgresql');
        const result = await query(sql);
        return result.rows;
    }

    static async getTendenciaMensual() {
        const sql = `
            SELECT 
                TO_CHAR(fecha_reporte, 'YYYY-MM') as mes,
                COUNT(*) as cantidad
            FROM incidencias
            WHERE activo = true
            GROUP BY TO_CHAR(fecha_reporte, 'YYYY-MM')
            ORDER BY mes DESC
            LIMIT 6
        `;
        const { query } = require('../configuracion/conexion_postgresql');
        const result = await query(sql);
        return result.rows.reverse();
    }

    static async getTiempoPromedioRespuesta() {
        const sql = `
            SELECT 
                AVG(EXTRACT(EPOCH FROM (fecha_cierre - fecha_reporte)) / 3600) as horas_promedio
            FROM incidencias
            WHERE activo = true AND fecha_cierre IS NOT NULL
        `;
        const { query } = require('../configuracion/conexion_postgresql');
        const result = await query(sql);
        return result.rows[0]?.horas_promedio || 0;
    }

    static async getIncidenciasPorDia() {
        const sql = `
            SELECT 
                TO_CHAR(fecha_reporte, 'YYYY-MM-DD') as dia,
                COUNT(*) as cantidad
            FROM incidencias
            WHERE activo = true AND fecha_reporte >= CURRENT_DATE - INTERVAL '7 days'
            GROUP BY TO_CHAR(fecha_reporte, 'YYYY-MM-DD')
            ORDER BY dia
        `;
        const { query } = require('../configuracion/conexion_postgresql');
        const result = await query(sql);
        return result.rows;
    }
}

module.exports = DashboardService;