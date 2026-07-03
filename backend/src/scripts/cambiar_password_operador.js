const { query } = require('../configuracion/conexion_postgresql');
const bcrypt = require('bcryptjs');

async function cambiarPasswordOperador() {
    console.log('========================================');
    console.log('🔑 Cambiando contraseña del operador');
    console.log('========================================');

    try {
        // Generar hash de "123456"
        const hash = await bcrypt.hash('123456', 10);
        console.log('📦 Hash generado:', hash);

        // Actualizar la contraseña
        await query(`
            UPDATE usuarios 
            SET password_hash = $1 
            WHERE email = 'operador@tarija.bo'
        `, [hash]);

        console.log('✅ Contraseña actualizada exitosamente');
        console.log('   Email: operador@tarija.bo');
        console.log('   Contraseña: 123456');
        console.log('========================================');

        // Verificar
        const result = await query(`
            SELECT id_usuario, nombre, email, tipo_usuario 
            FROM usuarios 
            WHERE email = 'operador@tarija.bo'
        `);
        console.log('📋 Usuario:');
        console.log(`   ID: ${result.rows[0].id_usuario}`);
        console.log(`   Nombre: ${result.rows[0].nombre}`);
        console.log(`   Email: ${result.rows[0].email}`);
        console.log(`   Tipo: ${result.rows[0].tipo_usuario}`);
        console.log('========================================');
        console.log('✅ Ahora inicia sesión con:');
        console.log('   Email: operador@tarija.bo');
        console.log('   Contraseña: 123456');
        console.log('========================================');
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.log('========================================');
    }
}

cambiarPasswordOperador();