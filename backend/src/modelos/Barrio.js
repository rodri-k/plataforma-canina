const { query } = require('../configuracion/conexion_postgresql');

class Barrio {
    // Listar todos los barrios activos
    static async listar() {
        const sql = `SELECT id_barrio, nombre, descripcion, zona, latitud, longitud FROM barrios WHERE activo = true ORDER BY nombre`;
        const result = await query(sql);
        return result.rows;
    }

    // Buscar barrio por ID
    static async findById(id) {
        const sql = `SELECT id_barrio, nombre, descripcion, zona, latitud, longitud FROM barrios WHERE id_barrio = $1 AND activo = true`;
        const result = await query(sql, [id]);
        return result.rows[0] || null;
    }

    // Buscar barrio por nombre
    static async findByNombre(nombre) {
        const sql = `SELECT id_barrio, nombre FROM barrios WHERE nombre ILIKE $1 AND activo = true`;
        const result = await query(sql, [`%${nombre}%`]);
        return result.rows;
    }
}

module.exports = Barrio;