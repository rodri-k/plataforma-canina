-- ============================================================
-- VERIFICACIÓN DE ESTRUCTURA DE BASE DE DATOS
-- ============================================================

-- 1. Verificar tablas existentes
SELECT 
    ' Tablas existentes:' as seccion,
    table_name,
    (SELECT COUNT(*) FROM information_schema.columns 
     WHERE table_name = t.table_name) as columnas
FROM information_schema.tables t
WHERE table_schema = 'public' 
    AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- 2. Verificar relaciones (claves foráneas)
SELECT 
    ' Relaciones:' as seccion,
    conname as nombre,
    conrelid::regclass as tabla,
    pg_get_constraintdef(oid) as definicion
FROM pg_constraint
WHERE contype = 'f' 
    AND connamespace = 'public'::regnamespace;

-- 3. Verificar datos insertados
SELECT ' Datos insertados:' as seccion;
SELECT 'Categorías' as tabla, COUNT(*) as registros FROM categorias
UNION ALL
SELECT 'Estados', COUNT(*) FROM estados
UNION ALL
SELECT 'Barrios', COUNT(*) FROM barrios
UNION ALL
SELECT 'Usuarios', COUNT(*) FROM usuarios;

-- 4. Verificar vistas
SELECT ' Vistas:' as seccion;
SELECT table_name FROM information_schema.views
WHERE table_schema = 'public'
ORDER BY table_name;

-- 5. Verificar triggers
SELECT ' Triggers:' as seccion;
SELECT 
    trigger_name,
    event_manipulation as evento,
    event_object_table as tabla
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;

SELECT ' Verificación completada' as estado_final;