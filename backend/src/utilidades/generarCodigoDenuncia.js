// Esta función solo se usa como respaldo, ya que el trigger en PostgreSQL 
// genera automáticamente el código al insertar una incidencia

const generarCodigoDenuncia = () => {
    const fecha = new Date();
    const anio = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');
    const aleatorio = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
    return `INC-${anio}${mes}${dia}-${aleatorio}`;
};

module.exports = generarCodigoDenuncia;