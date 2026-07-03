const { query } = require('../configuracion/conexion_postgresql');
const fs = require('fs');
const path = require('path');

async function ejecutarScript(archivo) {
    const ruta = path.join(__dirname, '../../../base_datos/scripts', archivo);
    const sql = fs.readFileSync(ruta, 'utf8');
    console.log(` Ejecutando: ${archivo}`);
    await query(sql);
    console.log(` Completado: ${archivo}`);
}

async function crearBaseDatos() {
    console.log('========================================');
    console.log('  CREANDO ESTRUCTURA DE BASE DE DATOS');
    console.log('========================================');

    try {
        await ejecutarScript('crear_tablas.sql');
        await ejecutarScript('insertar_datos.sql');
        await ejecutarScript('verificar_estructura.sql');

        console.log('========================================');
        console.log(' BASE DE DATOS CREADA EXITOSAMENTE');
        console.log('========================================');
        console.log(' Tablas creadas: usuarios, categorias, estados, barrios, incidencias, acciones_municipales');
        console.log(' Datos insertados: categorías, estados, barrios, usuarios de prueba');
        console.log('========================================');
    } catch (error) {
        console.error(' Error al crear base de datos:', error.message);
        console.log('========================================');
        console.log(' Si hay error, verifica que:');
        console.log('   1. La conexión a PostgreSQL funciona (npm run test-db)');
        console.log('   2. Los archivos SQL existen en base_datos/scripts/');
        console.log('========================================');
    }
}

// Ejecutar si se llama directamente
if (require.main === module) {
    crearBaseDatos();
}

module.exports = { crearBaseDatos };