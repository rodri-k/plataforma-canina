-- ============================================================
-- DATOS INICIALES PARA EL PROTOTIPO
-- ============================================================

-- ============================================================
-- 1. CATEGORÍAS
-- ============================================================
INSERT INTO categorias (nombre, descripcion, icono, color) VALUES
('Perro abandonado', 'Perros en situación de abandono en la vía pública', 'fa-dog', '#FF6B35'),
('Perro enfermo o herido', 'Perros con signos de enfermedad o lesiones visibles', 'fa-heartbeat', '#E74C3C'),
('Perro agresivo', 'Perros que representan peligro para la comunidad', 'fa-exclamation-triangle', '#F39C12'),
('Perro en situación de riesgo', 'Perros en peligro inmediato (tráfico, maltrato, etc.)', 'fa-shield-alt', '#3498DB'),
('Colonia canina', 'Grupos de perros en zonas específicas', 'fa-users', '#9B59B6'),
('Otro', 'Otras situaciones relacionadas con perros en la calle', 'fa-ellipsis-h', '#95A5A6');

-- ============================================================
-- 2. ESTADOS
-- ============================================================
INSERT INTO estados (nombre, descripcion, color, orden) VALUES
('Pendiente', 'Incidencia registrada, esperando validación', '#F1C40F', 1),
('En revisión', 'Incidencia en proceso de evaluación por el municipio', '#3498DB', 2),
('En curso', 'Se está tomando acción sobre la incidencia', '#E67E22', 3),
('Cerrada', 'Incidencia resuelta', '#2ECC71', 4);

-- ============================================================
-- 3. BARRIOS DE TARIJA
-- ============================================================
INSERT INTO barrios (nombre, descripcion, zona, latitud, longitud, activo) VALUES
('Aranjuez', 'Zona residencial del sur de Tarija', 'Sur', -21.5500, -64.7300, true),
('San Luis', 'Barrio tradicional del norte', 'Norte', -21.5200, -64.7200, true),
('La Pampa', 'Zona comercial y residencial', 'Centro', -21.5400, -64.7400, true),
('Los Chapacos', 'Barrio al este de la ciudad', 'Este', -21.5450, -64.7150, true),
('La Floresta', 'Zona residencial con áreas verdes', 'Oeste', -21.5350, -64.7500, true),
('Las Panosas', 'Barrio residencial del sur', 'Sur', -21.5600, -64.7350, true),
('El Monte', 'Zona de crecimiento urbano', 'Norte', -21.5100, -64.7250, true),
('Méndez', 'Barrio central tradicional', 'Centro', -21.5380, -64.7420, true),
('Uriondo', 'Zona de expansión urbana', 'Este', -21.5480, -64.7100, true),
('Los Ceibos', 'Barrio residencial moderno', 'Oeste', -21.5300, -64.7550, true);

-- ============================================================
-- 4. USUARIO OPERADOR (para pruebas)
-- ============================================================
-- Contraseña: 123456 (hash generado con bcrypt)
INSERT INTO usuarios (
    nombre, apellido, email, telefono, password_hash,
    tipo_usuario, estado, cargo, dependencia
) VALUES (
    'Municipal', 'Tarija', 'operador@tarija.bo', '74642456',
    '$2a$10$GvU5GTn8Zq7QGz6QJ1V1F.WMmYzL.kCXPYnW4K.YWZcV8kYx.szpy',
    'operador', true, 'Coordinador de Bienestar Animal', 'Gobierno Municipal de Tarija'
);

-- ============================================================
-- 5. USUARIO CIUDADANO (para pruebas)
-- ============================================================
INSERT INTO usuarios (
    nombre, apellido, email, telefono, password_hash,
    tipo_usuario, estado
) VALUES (
    'Juan', 'Pérez', 'juan.perez@gmail.com', '74642457',
    '$2a$10$GvU5GTn8Zq7QGz6QJ1V1F.WMmYzL.kCXPYnW4K.YWZcV8kYx.szpy',
    'ciudadano', true
);

-- ============================================================
-- FIN DE DATOS INICIALES
-- ============================================================

-- Verificar inserción
SELECT ' Categorías:' as tabla, COUNT(*) as cantidad FROM categorias
UNION ALL
SELECT ' Estados:', COUNT(*) FROM estados
UNION ALL
SELECT ' Barrios:', COUNT(*) FROM barrios
UNION ALL
SELECT ' Usuarios:', COUNT(*) FROM usuarios;