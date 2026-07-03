const { query } = require('../configuracion/conexion_postgresql');

class Usuario {
    // Crear nuevo usuario
    static async crear(data) {
        const { nombre, apellido, email, telefono, password_hash, tipo_usuario } = data;
        const sql = `
            INSERT INTO usuarios (nombre, apellido, email, telefono, password_hash, tipo_usuario)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING id_usuario, nombre, apellido, email, telefono, tipo_usuario, estado, fecha_registro
        `;
        const result = await query(sql, [nombre, apellido, email, telefono, password_hash, tipo_usuario]);
        return result.rows[0];
    }

    // Buscar usuario por email
    static async findByEmail(email) {
        const sql = `SELECT * FROM usuarios WHERE email = $1`;
        const result = await query(sql, [email]);
        return result.rows[0] || null;
    }

    // Buscar usuario por ID
    static async findById(id) {
        const sql = `SELECT id_usuario, nombre, apellido, email, telefono, tipo_usuario, estado, fecha_registro, ultimo_acceso FROM usuarios WHERE id_usuario = $1`;
        const result = await query(sql, [id]);
        return result.rows[0] || null;
    }

    // Actualizar último acceso
    static async actualizarUltimoAcceso(id) {
        const sql = `UPDATE usuarios SET ultimo_acceso = CURRENT_TIMESTAMP WHERE id_usuario = $1`;
        await query(sql, [id]);
    }

    // Listar todos los usuarios (solo para operadores)
    static async listar() {
        const sql = `SELECT id_usuario, nombre, apellido, email, telefono, tipo_usuario, estado, fecha_registro FROM usuarios ORDER BY fecha_registro DESC`;
        const result = await query(sql);
        return result.rows;
    }

    // Cambiar estado de usuario
    static async cambiarEstado(id, estado) {
        const sql = `UPDATE usuarios SET estado = $1 WHERE id_usuario = $2 RETURNING id_usuario, estado`;
        const result = await query(sql, [estado, id]);
        return result.rows[0] || null;
    }
}

module.exports = Usuario;