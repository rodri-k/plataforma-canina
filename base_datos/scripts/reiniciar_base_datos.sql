-- ============================================================
-- REINICIAR BASE DE DATOS COMPLETA
-- ============================================================

-- Eliminar todas las tablas en orden (respetando dependencias)
DROP TABLE IF EXISTS acciones_municipales CASCADE;
DROP TABLE IF EXISTS incidencias CASCADE;
DROP TABLE IF EXISTS barrios CASCADE;
DROP TABLE IF EXISTS categorias CASCADE;
DROP TABLE IF EXISTS estados CASCADE;
DROP TABLE IF EXISTS usuarios CASCADE;

-- Eliminar vistas
DROP VIEW IF EXISTS vw_incidencias_completas CASCADE;

-- Eliminar funciones y triggers
DROP FUNCTION IF EXISTS actualizar_fecha_actualizacion() CASCADE;
DROP FUNCTION IF EXISTS generar_codigo_denuncia() CASCADE;

-- Recrear todo
\i crear_tablas.sql
\i insertar_datos.sql

SELECT ' Base de datos reiniciada exitosamente' as estado;