const { query } = require('../configuracion/conexion_postgresql');

class AccionMunicipal {
    // Crear nueva acción municipal
    static async crear(data) {
        const {
            id_incidencia, id_operador, tipo_accion,
            descripcion, costo_estimado, ubicacion,
            observaciones, evidencia_url
        } = data;

        const sql = `
            INSERT INTO acciones_municipales (
                id_incidencia, id_operador, tipo_accion,
                descripcion, costo_estimado, ubicacion,
                observaciones, evidencia_url
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *
        `;
        const result = await query(sql, [
            id_incidencia, id_operador, tipo_accion,
            descripcion, costo_estimado, ubicacion,
            observaciones, evidencia_url
        ]);
        return result.rows[0];
    }

    // Listar acciones por incidencia
    static async listarPorIncidencia(id_incidencia) {
        const sql = `
            SELECT 
                a.*,
                u.nombre || ' ' || u.apellido as operador_nombre
            FROM acciones_municipales a
            LEFT JOIN usuarios u ON a.id_operador = u.id_usuario
            WHERE a.id_incidencia = $1
            ORDER BY a.fecha_accion DESC
        `;
        const result = await query(sql, [id_incidencia]);
        return result.rows;
    }

    // Buscar acción por ID
    static async findById(id) {
        const sql = `
            SELECT 
                a.*,
                u.nombre || ' ' || u.apellido as operador_nombre
            FROM acciones_municipales a
            LEFT JOIN usuarios u ON a.id_operador = u.id_usuario
            WHERE a.id_accion = $1
        `;
        const result = await query(sql, [id]);
        return result.rows[0] || null;
    }
}

module.exports = AccionMunicipal;