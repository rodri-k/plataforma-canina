const { query } = require('../configuracion/conexion_postgresql');

class Estado {
    // Listar todos los estados
    static async listar() {
        const sql = `SELECT id_estado, nombre, descripcion, color, orden FROM estados ORDER BY orden`;
        const result = await query(sql);
        return result.rows;
    }

    // Buscar estado por ID
    static async findById(id) {
        const sql = `SELECT id_estado, nombre, descripcion, color, orden FROM estados WHERE id_estado = $1`;
        const result = await query(sql, [id]);
        return result.rows[0] || null;
    }

    // Buscar estado por nombre
    static async findByNombre(nombre) {
        const sql = `SELECT id_estado, nombre FROM estados WHERE nombre = $1`;
        const result = await query(sql, [nombre]);
        return result.rows[0] || null;
    }
}

module.exports = Estado;