const { query } = require('./conexion_postgresql');

async function probarConexion() {
    console.log('========================================');
    console.log('🔍 Probando conexión a PostgreSQL remoto');
    console.log('========================================');

    try {
        // Consulta simple para verificar conexión
        const resultado = await query('SELECT NOW() as fecha_hora, version() as version_postgres');

        console.log('✅ Conexión exitosa');
        console.log('📅 Fecha/Hora del servidor:', resultado.rows[0].fecha_hora);
        console.log('📦 Versión PostgreSQL:', resultado.rows[0].version_postgres);
        console.log('========================================');
        console.log('✅ Base de datos lista para usar');
        console.log('========================================');

        return true;
    } catch (error) {
        console.error('❌ Error al probar conexión:', error.message);
        console.log('========================================');
        console.log('📌 Recomendaciones:');
        console.log('   1. Verifica que .env tenga las credenciales correctas');
        console.log('   2. Asegúrate que la base de datos remota esté activa');
        console.log('   3. Revisa que no haya firewall bloqueando la conexión');
        console.log('========================================');
        return false;
    }
}

// Ejecutar prueba si se llama directamente
if (require.main === module) {
    probarConexion();
}

module.exports = { probarConexion };