const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

// Usar DATABASE_URL directamente con SSL forzado
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false // Necesario para Render
    },
    connectionTimeoutMillis: 10000,
    idleTimeoutMillis: 30000,
    max: 20,
});

// Probar conexión al iniciar
pool.connect((err, client, release) => {
    if (err) {
        console.error('❌ Error al conectar a PostgreSQL remoto:');
        console.error(`   ${err.message}`);
        console.log('========================================');
        console.log('📌 Verifica que:');
        console.log('   1. Las credenciales en .env son correctas');
        console.log('   2. La base de datos remota está activa');
        console.log('   3. La IP de tu red está permitida (si aplica)');
        console.log('========================================');
    } else {
        console.log('✅ Conexión exitosa a PostgreSQL remoto');
        console.log(`   📍 Host: ${process.env.DB_HOST}`);
        console.log(`   📍 Base de datos: ${process.env.DB_NAME}`);
        release();
    }
});

const query = async (text, params) => {
    const start = Date.now();
    try {
        const res = await pool.query(text, params);
        const duration = Date.now() - start;
        console.log('📊 Consulta ejecutada:', { text, duration, rows: res.rowCount });
        return res;
    } catch (error) {
        console.error('❌ Error en consulta:', error.message);
        throw error;
    }
};

const getClient = async () => {
    return await pool.connect();
};

module.exports = {
    pool,
    query,
    getClient
};