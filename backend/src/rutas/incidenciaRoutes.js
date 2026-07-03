const express = require('express');
const router = express.Router();
const { Incidencia, Categoria, Estado, Barrio } = require('../modelos');

// Obtener categorías (público)
router.get('/categorias', async (req, res) => {
    try {
        const categorias = await Categoria.listar();
        res.json({ success: true, data: categorias });
    } catch (error) {
        console.error('Error al obtener categorías:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener categorías'
        });
    }
});

// Obtener estados (público)
router.get('/estados', async (req, res) => {
    try {
        const estados = await Estado.listar();
        res.json({ success: true, data: estados });
    } catch (error) {
        console.error('Error al obtener estados:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener estados'
        });
    }
});

// Obtener barrios (público)
router.get('/barrios', async (req, res) => {
    try {
        const barrios = await Barrio.listar();
        res.json({ success: true, data: barrios });
    } catch (error) {
        console.error('Error al obtener barrios:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener barrios'
        });
    }
});

// Obtener incidencias públicas (para mapa público)
router.get('/publicas', async (req, res) => {
    try {
        const incidencias = await Incidencia.listar({});
        // Filtrar solo datos públicos (sin información sensible)
        const publicas = incidencias.map(i => ({
            id_incidencia: i.id_incidencia,
            codigo_denuncia: i.codigo_denuncia,
            titulo: i.titulo,
            descripcion: i.descripcion,
            latitud: i.latitud,
            longitud: i.longitud,
            categoria_nombre: i.categoria_nombre,
            categoria_color: i.categoria_color,
            estado_nombre: i.estado_nombre,
            estado_color: i.estado_color,
            barrio_nombre: i.barrio_nombre,
            fecha_reporte: i.fecha_reporte,
            imagen_url: i.imagen_url
        }));
        res.json({ success: true, data: publicas });
    } catch (error) {
        console.error('Error al obtener incidencias públicas:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener incidencias públicas'
        });
    }
});

// Obtener incidencia pública por ID
router.get('/publicas/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const incidencia = await Incidencia.findById(parseInt(id));
        if (!incidencia) {
            return res.status(404).json({
                success: false,
                message: 'Incidencia no encontrada'
            });
        }
        // Filtrar datos públicos
        const publica = {
            id_incidencia: incidencia.id_incidencia,
            codigo_denuncia: incidencia.codigo_denuncia,
            titulo: incidencia.titulo,
            descripcion: incidencia.descripcion,
            latitud: incidencia.latitud,
            longitud: incidencia.longitud,
            categoria_nombre: incidencia.categoria_nombre,
            categoria_color: incidencia.categoria_color,
            estado_nombre: incidencia.estado_nombre,
            estado_color: incidencia.estado_color,
            barrio_nombre: incidencia.barrio_nombre,
            fecha_reporte: incidencia.fecha_reporte,
            imagen_url: incidencia.imagen_url
        };
        res.json({ success: true, data: publica });
    } catch (error) {
        console.error('Error al obtener incidencia pública:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener incidencia pública'
        });
    }
});

module.exports = router;