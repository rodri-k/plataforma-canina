const { query } = require('../configuracion/conexion_postgresql');

class Categoria {
    // Listar todas las categorías
    static async listar() {
        const sql = `SELECT id_categoria, nombre, descripcion, icono, color FROM categorias ORDER BY nombre`;
        const result = await query(sql);
        return result.rows;
    }

    // Buscar categoría por ID
    static async findById(id) {
        const sql = `SELECT id_categoria, nombre, descripcion, icono, color FROM categorias WHERE id_categoria = $1`;
        const result = await query(sql, [id]);
        return result.rows[0] || null;
    }

    // Buscar categoría por nombre
    static async findByNombre(nombre) {
        const sql = `SELECT id_categoria, nombre FROM categorias WHERE nombre = $1`;
        const result = await query(sql, [nombre]);
        return result.rows[0] || null;
    }
}

module.exports = Categoria;