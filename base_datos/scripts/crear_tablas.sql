-- ============================================================
-- SPRINT 3: MODELO FÍSICO DE DATOS
-- PLATAFORMA GEORREFERENCIADA DE INCIDENCIAS CANINAS
-- ============================================================

-- Eliminar tablas si existen (para reinicio limpio)
DROP TABLE IF EXISTS acciones_municipales CASCADE;
DROP TABLE IF EXISTS incidencias CASCADE;
DROP TABLE IF EXISTS barrios CASCADE;
DROP TABLE IF EXISTS categorias CASCADE;
DROP TABLE IF EXISTS estados CASCADE;
DROP TABLE IF EXISTS usuarios CASCADE;

-- ============================================================
-- TABLA: usuarios
-- ============================================================
CREATE TABLE usuarios (
    id_usuario SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    telefono VARCHAR(20),
    password_hash VARCHAR(255) NOT NULL,
    tipo_usuario VARCHAR(20) NOT NULL CHECK (tipo_usuario IN ('ciudadano', 'operador')),
    estado BOOLEAN DEFAULT TRUE,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ultimo_acceso TIMESTAMP,
    -- Campos adicionales para operador municipal
    cargo VARCHAR(100),
    dependencia VARCHAR(150)
);

-- ============================================================
-- TABLA: categorias
-- ============================================================
CREATE TABLE categorias (
    id_categoria SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT,
    icono VARCHAR(50),
    color VARCHAR(20)
);

-- ============================================================
-- TABLA: estados
-- ============================================================
CREATE TABLE estados (
    id_estado SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    descripcion TEXT,
    color VARCHAR(20),
    orden INTEGER DEFAULT 0
);

-- ============================================================
-- TABLA: barrios
-- ============================================================
CREATE TABLE barrios (
    id_barrio SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT,
    zona VARCHAR(50),
    latitud DECIMAL(10, 8),
    longitud DECIMAL(11, 8),
    activo BOOLEAN DEFAULT TRUE
);

-- ============================================================
-- TABLA: incidencias
-- ============================================================
CREATE TABLE incidencias (
    id_incidencia SERIAL PRIMARY KEY,
    codigo_denuncia VARCHAR(20) UNIQUE NOT NULL,
    id_usuario INTEGER NOT NULL REFERENCES usuarios(id_usuario),
    id_categoria INTEGER NOT NULL REFERENCES categorias(id_categoria),
    id_estado INTEGER NOT NULL REFERENCES estados(id_estado),
    id_barrio INTEGER REFERENCES barrios(id_barrio),
    titulo VARCHAR(200) NOT NULL,
    descripcion TEXT NOT NULL,
    cantidad_perros INTEGER DEFAULT 1,
    latitud DECIMAL(10, 8) NOT NULL,
    longitud DECIMAL(11, 8) NOT NULL,
    direccion TEXT,
    referencia TEXT,
    imagen_url VARCHAR(500),
    prioridad VARCHAR(20) DEFAULT 'media' CHECK (prioridad IN ('baja', 'media', 'alta', 'critica')),
    fecha_reporte TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    -- Campos para seguimiento municipal
    fecha_asignacion TIMESTAMP,
    fecha_cierre TIMESTAMP,
    observaciones_municipales TEXT,
    activo BOOLEAN DEFAULT TRUE
);

-- ============================================================
-- TABLA: acciones_municipales
-- ============================================================
CREATE TABLE acciones_municipales (
    id_accion SERIAL PRIMARY KEY,
    id_incidencia INTEGER NOT NULL REFERENCES incidencias(id_incidencia),
    id_operador INTEGER NOT NULL REFERENCES usuarios(id_usuario),
    tipo_accion VARCHAR(50) NOT NULL CHECK (tipo_accion IN (
        'vacunacion', 'esterilizacion', 'rescate', 
        'atencion_veterinaria', 'reubicacion', 'alimentacion',
        'seguimiento', 'derivacion', 'otro'
    )),
    descripcion TEXT NOT NULL,
    fecha_accion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    -- Campos adicionales
    costo_estimado DECIMAL(10, 2),
    ubicacion TEXT,
    observaciones TEXT,
    evidencia_url VARCHAR(500)
);

-- ============================================================
-- ÍNDICES PARA OPTIMIZACIÓN
-- ============================================================

-- Índices para búsquedas frecuentes
CREATE INDEX idx_incidencias_id_usuario ON incidencias(id_usuario);
CREATE INDEX idx_incidencias_id_estado ON incidencias(id_estado);
CREATE INDEX idx_incidencias_id_categoria ON incidencias(id_categoria);
CREATE INDEX idx_incidencias_id_barrio ON incidencias(id_barrio);
CREATE INDEX idx_incidencias_fecha_reporte ON incidencias(fecha_reporte DESC);
CREATE INDEX idx_incidencias_latitud_longitud ON incidencias(latitud, longitud);

-- Índice para búsqueda por código de denuncia
CREATE INDEX idx_incidencias_codigo ON incidencias(codigo_denuncia);

-- Índices para acciones municipales
CREATE INDEX idx_acciones_id_incidencia ON acciones_municipales(id_incidencia);
CREATE INDEX idx_acciones_id_operador ON acciones_municipales(id_operador);
CREATE INDEX idx_acciones_fecha_accion ON acciones_municipales(fecha_accion DESC);

-- Índice para búsqueda de usuarios por email
CREATE INDEX idx_usuarios_email ON usuarios(email);

-- ============================================================
-- VISTAS ÚTILES
-- ============================================================

-- Vista: Resumen de incidencias con datos relacionados
CREATE OR REPLACE VIEW vw_incidencias_completas AS
SELECT 
    i.id_incidencia,
    i.codigo_denuncia,
    i.titulo,
    i.descripcion,
    i.cantidad_perros,
    i.latitud,
    i.longitud,
    i.direccion,
    i.referencia,
    i.imagen_url,
    i.prioridad,
    i.fecha_reporte,
    i.fecha_actualizacion,
    i.fecha_cierre,
    i.observaciones_municipales,
    -- Datos del usuario
    u.id_usuario,
    u.nombre || ' ' || u.apellido AS nombre_completo,
    u.email,
    u.telefono,
    -- Datos de categoría
    c.id_categoria,
    c.nombre AS categoria_nombre,
    c.color AS categoria_color,
    -- Datos de estado
    e.id_estado,
    e.nombre AS estado_nombre,
    e.color AS estado_color,
    -- Datos de barrio
    b.id_barrio,
    b.nombre AS barrio_nombre,
    b.zona
FROM incidencias i
LEFT JOIN usuarios u ON i.id_usuario = u.id_usuario
LEFT JOIN categorias c ON i.id_categoria = c.id_categoria
LEFT JOIN estados e ON i.id_estado = e.id_estado
LEFT JOIN barrios b ON i.id_barrio = b.id_barrio
WHERE i.activo = TRUE;

-- ============================================================
-- FUNCIÓN: Actualizar fecha de actualización automáticamente
-- ============================================================

CREATE OR REPLACE FUNCTION actualizar_fecha_actualizacion()
RETURNS TRIGGER AS $$
BEGIN
    NEW.fecha_actualizacion = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para incidencias
CREATE TRIGGER trg_actualizar_fecha_incidencia
BEFORE UPDATE ON incidencias
FOR EACH ROW
EXECUTE FUNCTION actualizar_fecha_actualizacion();

-- ============================================================
-- FUNCIÓN: Generar código de denuncia automático
-- ============================================================

CREATE OR REPLACE FUNCTION generar_codigo_denuncia()
RETURNS TRIGGER AS $$
DECLARE
    anio VARCHAR(4);
    mes VARCHAR(2);
    dia VARCHAR(2);
    secuencia VARCHAR(6);
BEGIN
    anio := TO_CHAR(CURRENT_DATE, 'YYYY');
    mes := TO_CHAR(CURRENT_DATE, 'MM');
    dia := TO_CHAR(CURRENT_DATE, 'DD');
    
    -- Obtener la secuencia del día actual
    SELECT LPAD(COUNT(*)::TEXT, 6, '0') INTO secuencia
    FROM incidencias
    WHERE DATE(fecha_reporte) = CURRENT_DATE;
    
    NEW.codigo_denuncia := 'INC-' || anio || mes || dia || '-' || secuencia;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para generar código automáticamente
CREATE TRIGGER trg_generar_codigo_denuncia
BEFORE INSERT ON incidencias
FOR EACH ROW
EXECUTE FUNCTION generar_codigo_denuncia();

-- ============================================================
-- FIN DEL SCRIPT
-- ============================================================