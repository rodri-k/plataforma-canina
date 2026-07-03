-- ============================================================
-- ESQUEMA COMPLETO DE BASE DE DATOS
-- PLATAFORMA GEORREFERENCIADA DE INCIDENCIAS CANINAS
-- ============================================================

-- Ejecutar en orden:
\i scripts/crear_tablas.sql
\i scripts/insertar_datos.sql

-- Verificar estructura
SELECT 'Tablas creadas:' as mensaje;
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

SELECT ' Esquema completado exitosamente' as estado;