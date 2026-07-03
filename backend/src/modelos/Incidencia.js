const { query } = require('../configuracion/conexion_postgresql');

class Incidencia {
    // Crear nueva incidencia
    static async crear(data) {
        const {
            id_usuario, id_categoria, id_estado, id_barrio,
            descripcion, cantidad_perros,
            latitud, longitud, direccion, referencia,
            imagen_url, prioridad
        } = data;

        const sql = `
        INSERT INTO incidencias (
            id_usuario, id_categoria, id_estado, id_barrio,
            descripcion, cantidad_perros,
            latitud, longitud, direccion, referencia,
            imagen_url, prioridad
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING *
    `;
        const result = await query(sql, [
            id_usuario, id_categoria, id_estado, id_barrio,
            descripcion, cantidad_perros,
            latitud, longitud, direccion, referencia,
            imagen_url, prioridad
        ]);
        return result.rows[0];
    }

    // Listar incidencias con filtros (para operador)
    static async listar(filtros = {}) {
        let sql = `
            SELECT * FROM vw_incidencias_completas
            WHERE 1=1
        `;
        const params = [];
        let paramIndex = 1;

        if (filtros.id_estado) {
            sql += ` AND id_estado = $${paramIndex}`;
            params.push(filtros.id_estado);
            paramIndex++;
        }
        if (filtros.id_categoria) {
            sql += ` AND id_categoria = $${paramIndex}`;
            params.push(filtros.id_categoria);
            paramIndex++;
        }
        if (filtros.id_barrio) {
            sql += ` AND id_barrio = $${paramIndex}`;
            params.push(filtros.id_barrio);
            paramIndex++;
        }
        if (filtros.prioridad) {
            sql += ` AND prioridad = $${paramIndex}`;
            params.push(filtros.prioridad);
            paramIndex++;
        }
        if (filtros.id_usuario) {
            sql += ` AND id_usuario = $${paramIndex}`;
            params.push(filtros.id_usuario);
            paramIndex++;
        }

        sql += ` ORDER BY fecha_reporte DESC`;
        const result = await query(sql, params);
        return result.rows;
    }

    // Buscar incidencia por ID (con datos completos)
    static async findById(id) {
        const sql = `SELECT * FROM vw_incidencias_completas WHERE id_incidencia = $1`;
        const result = await query(sql, [id]);
        return result.rows[0] || null;
    }

    // Buscar incidencia por código de denuncia
    static async findByCodigo(codigo) {
        const sql = `SELECT * FROM vw_incidencias_completas WHERE codigo_denuncia = $1`;
        const result = await query(sql, [codigo]);
        return result.rows[0] || null;
    }

    // Actualizar estado de incidencia
    static async actualizarEstado(id, id_estado, observaciones = null) {
        let sql = `
            UPDATE incidencias 
            SET id_estado = $1, fecha_actualizacion = CURRENT_TIMESTAMP
        `;
        const params = [id_estado];
        let paramIndex = 2;

        if (observaciones) {
            sql += `, observaciones_municipales = $${paramIndex}`;
            params.push(observaciones);
            paramIndex++;
        }

        // Si el estado es "Cerrada" (id_estado = 4), actualizar fecha_cierre
        if (id_estado === 4) {
            sql += `, fecha_cierre = CURRENT_TIMESTAMP`;
        }

        sql += ` WHERE id_incidencia = $${paramIndex} RETURNING *`;
        params.push(id);

        const result = await query(sql, params);
        return result.rows[0] || null;
    }

    // Actualizar prioridad
    static async actualizarPrioridad(id, prioridad) {
        const sql = `UPDATE incidencias SET prioridad = $1, fecha_actualizacion = CURRENT_TIMESTAMP WHERE id_incidencia = $2 RETURNING *`;
        const result = await query(sql, [prioridad, id]);
        return result.rows[0] || null;
    }

    // Obtener estadísticas generales
    static async obtenerEstadisticas() {
        const sql = `
            SELECT 
                COUNT(*) as total,
                COUNT(CASE WHEN id_estado = 1 THEN 1 END) as pendientes,
                COUNT(CASE WHEN id_estado = 2 THEN 1 END) as en_revision,
                COUNT(CASE WHEN id_estado = 3 THEN 1 END) as en_curso,
                COUNT(CASE WHEN id_estado = 4 THEN 1 END) as cerradas,
                COUNT(CASE WHEN prioridad = 'alta' OR prioridad = 'critica' THEN 1 END) as criticas
            FROM incidencias
            WHERE activo = true
        `;
        const result = await query(sql);
        return result.rows[0];
    }

    // Obtener estadísticas por categoría
    static async obtenerEstadisticasPorCategoria() {
        const sql = `
            SELECT 
                c.nombre as categoria,
                c.color,
                COUNT(i.id_incidencia) as cantidad
            FROM categorias c
            LEFT JOIN incidencias i ON c.id_categoria = i.id_categoria AND i.activo = true
            GROUP BY c.id_categoria, c.nombre, c.color
            ORDER BY cantidad DESC
        `;
        const result = await query(sql);
        return result.rows;
    }

    // Obtener estadísticas por barrio
    static async obtenerEstadisticasPorBarrio() {
        const sql = `
            SELECT 
                b.nombre as barrio,
                b.zona,
                COUNT(i.id_incidencia) as cantidad
            FROM barrios b
            LEFT JOIN incidencias i ON b.id_barrio = i.id_barrio AND i.activo = true
            WHERE b.activo = true
            GROUP BY b.id_barrio, b.nombre, b.zona
            ORDER BY cantidad DESC
        `;
        const result = await query(sql);
        return result.rows;
    }

    // Obtener incidencias para mapa de calor
    static async obtenerParaMapaCalor() {
        const sql = `
            SELECT 
                latitud, 
                longitud,
                prioridad,
                id_categoria
            FROM incidencias
            WHERE activo = true AND latitud IS NOT NULL AND longitud IS NOT NULL
        `;
        const result = await query(sql);
        return result.rows;
    }
}

module.exports = Incidencia;