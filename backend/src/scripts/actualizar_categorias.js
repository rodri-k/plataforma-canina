const { query } = require('../configuracion/conexion_postgresql');

async function actualizarCategorias() {
    console.log('========================================');
    console.log('🔄 Actualizando categorías...');
    console.log('========================================');

    try {
        // 1. Eliminar categorías existentes
        console.log('📂 Eliminando categorías antiguas...');
        await query('DELETE FROM categorias;');
        console.log('✅ Categorías eliminadas');

        // 2. Insertar las 7 categorías correctas
        const categorias = [
            ['Perro abandonado', 'Perros en situación de abandono en la vía pública', 'fa-dog', '#FF6B35'],
            ['Perro herido', 'Perros con signos de enfermedad o lesiones visibles', 'fa-heartbeat', '#E74C3C'],
            ['Perro agresivo', 'Perros que representan peligro para la comunidad', 'fa-exclamation-triangle', '#F39C12'],
            ['Perro en situación de riesgo', 'Perros en peligro inmediato (tráfico, maltrato, etc.)', 'fa-shield-alt', '#3498DB'],
            ['Jauría de perros', 'Grupos de perros en zonas específicas', 'fa-users', '#9B59B6'],
            ['Camada abandonada', 'Cachorros recién nacidos abandonados', 'fa-baby', '#E67E22'],
            ['Perro en celo', 'Perros en período de celo', 'fa-heart', '#E74C3C']
        ];

        console.log('📂 Insertando nuevas categorías...');
        for (const cat of categorias) {
            await query(
                `INSERT INTO categorias (nombre, descripcion, icono, color) VALUES ($1, $2, $3, $4)`,
                cat
            );
            console.log(`   ✅ ${cat[0]}`);
        }
        console.log(`✅ ${categorias.length} categorías insertadas`);

        // 3. Verificar
        console.log('📋 Verificando categorías actuales:');
        const result = await query('SELECT id_categoria, nombre FROM categorias ORDER BY id_categoria');
        result.rows.forEach(row => {
            console.log(`   ${row.id_categoria}: ${row.nombre}`);
        });

        console.log('========================================');
        console.log('✅ ACTUALIZACIÓN COMPLETADA');
        console.log('========================================');
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.log('========================================');
    }
}

actualizarCategorias();