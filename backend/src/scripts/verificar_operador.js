const { query } = require('../configuracion/conexion_postgresql');

async function verificarOperador() {
    console.log('========================================');
    console.log('🔍 Verificando usuario operador');
    console.log('========================================');

    try {
        const result = await query(`
            SELECT id_usuario, nombre, apellido, email, tipo_usuario 
            FROM usuarios 
            WHERE email = 'operador@tarija.bo'
        `);

        if (result.rows.length === 0) {
            console.log('❌ Usuario operador NO existe');
            console.log('📌 Creando usuario operador...');
            await crearOperador();
        } else {
            console.log('✅ Usuario operador existe:');
            console.log(`   ID: ${result.rows[0].id_usuario}`);
            console.log(`   Nombre: ${result.rows[0].nombre} ${result.rows[0].apellido}`);
            console.log(`   Email: ${result.rows[0].email}`);
            console.log(`   Tipo: ${result.rows[0].tipo_usuario}`);
        }
        console.log('========================================');
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

async function crearOperador() {
    try {
        // Hash de "123456" con bcrypt
        const passwordHash = '$2a$10$GvU5GTn8Zq7QGz6QJ1V1F.WMmYzL.kCXPYnW4K.YWZcV8kYx.szpy';

        await query(`
            INSERT INTO usuarios (
                nombre, apellido, email, telefono, password_hash,
                tipo_usuario, estado, cargo, dependencia
            ) VALUES (
                'Municipal', 'Tarija', 'operador@tarija.bo', '74642456',
                $1, 'operador', true, 'Coordinador de Bienestar Animal', 
                'Gobierno Municipal de Tarija'
            )
        `, [passwordHash]);

        console.log('✅ Usuario operador creado exitosamente');
        console.log('   Email: operador@tarija.bo');
        console.log('   Contraseña: 123456');
    } catch (error) {
        console.error('❌ Error al crear operador:', error.message);
    }
}

verificarOperador();