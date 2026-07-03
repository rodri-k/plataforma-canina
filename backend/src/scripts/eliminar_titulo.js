const { query } = require('../configuracion/conexion_postgresql');

async function eliminarTitulo() {
    console.log('========================================');
    console.log('🔄 Eliminando columna titulo de incidencias');
    console.log('========================================');

    try {
        // 1. Eliminar la vista que depende de la tabla
        console.log('📂 Eliminando vista vw_incidencias_completas...');
        await query('DROP VIEW IF EXISTS vw_incidencias_completas CASCADE;');
        console.log('✅ Vista eliminada');

        // 2. Eliminar la columna titulo (ya no tiene dependencias)
        console.log('📂 Eliminando columna titulo...');
        await query('ALTER TABLE incidencias DROP COLUMN titulo;');
        console.log('✅ Columna titulo eliminada');

        // 3. Crear la nueva vista SIN titulo
        console.log('📂 Creando nueva vista...');
        await query(`
            CREATE VIEW vw_incidencias_completas AS
            SELECT 
                i.id_incidencia,
                i.codigo_denuncia,
                i.descripcion,
                i.cantidad_perros,
                i.latitud,
                i.longitud,
                i.direccion,
                i.referencia,
                i.imagen_url,
                i.prioridad,
                i.fecha_reporte,
                i.fecha_actualizacion,
                i.fecha_cierre,
                i.observaciones_municipales,
                u.id_usuario,
                u.nombre || ' ' || u.apellido AS nombre_completo,
                u.email,
                u.telefono,
                c.id_categoria,
                c.nombre AS categoria_nombre,
                c.color AS categoria_color,
                e.id_estado,
                e.nombre AS estado_nombre,
                e.color AS estado_color,
                b.id_barrio,
                b.nombre AS barrio_nombre,
                b.zona
            FROM incidencias i
            LEFT JOIN usuarios u ON i.id_usuario = u.id_usuario
            LEFT JOIN categorias c ON i.id_categoria = c.id_categoria
            LEFT JOIN estados e ON i.id_estado = e.id_estado
            LEFT JOIN barrios b ON i.id_barrio = b.id_barrio
            WHERE i.activo = TRUE;
        `);
        console.log('✅ Nueva vista creada correctamente');

        // 4. Verificar la estructura actualizada
        console.log('📋 Verificando estructura actualizada:');
        const result = await query(`
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns
            WHERE table_name = 'incidencias'
            ORDER BY ordinal_position;
        `);
        console.log('✅ Columnas de la tabla incidencias:');
        result.rows.forEach(row => {
            console.log(`   ${row.column_name}: ${row.data_type} ${row.is_nullable === 'YES' ? '(nullable)' : '(NOT NULL)'}`);
        });

        console.log('========================================');
        console.log('✅ ACTUALIZACIÓN COMPLETADA');
        console.log('========================================');
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.log('========================================');
    }
}

eliminarTitulo();