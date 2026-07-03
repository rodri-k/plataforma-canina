const { query } = require('../configuracion/conexion_postgresql');

async function verificarEstructura() {
    console.log('========================================');
    console.log('🔍 Verificando estructura de incidencias');
    console.log('========================================');

    try {
        const result = await query(`
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns
            WHERE table_name = 'incidencias'
            ORDER BY ordinal_position;
        `);

        console.log('📋 Columnas de la tabla incidencias:');
        result.rows.forEach(row => {
            console.log(`   ${row.column_name}: ${row.data_type} ${row.is_nullable === 'YES' ? '(nullable)' : '(NOT NULL)'}`);
        });

        console.log('========================================');
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

verificarEstructura();