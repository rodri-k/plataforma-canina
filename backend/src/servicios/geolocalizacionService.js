class GeolocalizacionService {
    // Calcular distancia entre dos puntos (fórmula de Haversine)
    static calcularDistancia(lat1, lon1, lat2, lon2) {
        const R = 6371; // Radio de la Tierra en km
        const dLat = this._toRad(lat2 - lat1);
        const dLon = this._toRad(lon2 - lon1);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this._toRad(lat1)) * Math.cos(this._toRad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    static _toRad(deg) {
        return deg * (Math.PI / 180);
    }

    // Verificar si una coordenada está dentro de un radio
    static estaDentroDeRadio(lat, lon, centroLat, centroLon, radioKm) {
        const distancia = this.calcularDistancia(lat, lon, centroLat, centroLon);
        return distancia <= radioKm;
    }

    // Validar coordenadas
    static validarCoordenadas(lat, lon) {
        return lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180;
    }

    // Formatear coordenadas para Leaflet
    static formatearParaMapa(lat, lon) {
        return [lat, lon];
    }

    static async asignarBarrioAutomatico(lat, lng) {
        const { query } = require('../configuracion/conexion_postgresql');

        const result = await query(`
        SELECT id_barrio, nombre, 
        (6371 * acos(cos(radians($1)) * cos(radians(latitud)) * cos(radians(longitud) - radians($2)) + sin(radians($1)) * sin(radians(latitud)))) AS distancia
        FROM barrios
        WHERE activo = true
        ORDER BY distancia ASC
        LIMIT 1
    `, [lat, lng]);

        return result.rows[0] || null;
    }
}

module.exports = GeolocalizacionService;