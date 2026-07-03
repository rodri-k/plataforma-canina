const app = require('./src/app');
const dotenv = require('dotenv');

// Cargar variables de entorno
dotenv.config();

const PORT = process.env.PORT || 5000;

// Iniciar servidor
app.listen(PORT, () => {
    console.log('========================================');
    console.log('🐕 PLATAFORMA DE INCIDENCIAS CANINAS');
    console.log('========================================');
    console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
    console.log('========================================');
    console.log('📌 Presiona CTRL+C para detener');
    console.log('========================================');
});