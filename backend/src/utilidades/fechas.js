const formatearFecha = (fecha) => {
    if (!fecha) return null;
    const d = new Date(fecha);
    return d.toLocaleDateString('es-BO', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

const formatearFechaCorta = (fecha) => {
    if (!fecha) return null;
    const d = new Date(fecha);
    return d.toLocaleDateString('es-BO', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });
};

const obtenerTiempoRelativo = (fecha) => {
    if (!fecha) return null;
    const ahora = new Date();
    const diff = ahora - new Date(fecha);
    const minutos = Math.floor(diff / 60000);
    const horas = Math.floor(diff / 3600000);
    const dias = Math.floor(diff / 86400000);

    if (minutos < 1) return 'Hace unos segundos';
    if (minutos < 60) return `Hace ${minutos} minuto${minutos !== 1 ? 's' : ''}`;
    if (horas < 24) return `Hace ${horas} hora${horas !== 1 ? 's' : ''}`;
    if (dias < 7) return `Hace ${dias} día${dias !== 1 ? 's' : ''}`;
    return formatearFechaCorta(fecha);
};

module.exports = {
    formatearFecha,
    formatearFechaCorta,
    obtenerTiempoRelativo
};